"""
Grading Pipeline — LangGraph StateGraph with HITL + Circuit Breaker.

Converts the old sequential grading/orchestrator.py into a proper
LangGraph workflow with:
- Typed state (GradingState)
- Structured nodes for each phase
- Conditional branching: MCQ-only vs STEM/Essay paths
- Conditional edges for review loop
- HITL interrupt for teacher approval
- Circuit breaker on LLM-intensive nodes
- Content validator before final delivery

Flow:
    load_context → classify_pages → route_by_type
    ├── mcq_only:     mcq_grader ──────────────────┐
    │   (skip visual + logic, direct answer match)  │
    │                                               ├→ aggregator → reviewer_gate
    └── stem/essay:   visual_analysis → logic ─────┘
        (full OCR + solution verification)           │
                                                     │
    reviewer_gate → [loop: reviewer → aggregator]    │
    → hitl_approval → content_validator → END        │

Usage:
    from lms.lms.agents.grading.pipeline import build_grading_graph
    graph = build_grading_graph()
    result = graph.invoke(initial_state, config)
"""

import json
import time
import logging
import os
from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END, START
from langgraph.types import interrupt

from lms.lms.agents.grading.visual_specialist import run_visual_analysis
from lms.lms.agents.grading.logic_specialist import run_logic_analysis
from lms.lms.agents.grading.aggregator import aggregate_final_grade
from lms.lms.agents.grading.mcq_grader import run_mcq_grading
from lms.lms.agents.grading.reviewer import run_review_analysis
from lms.lms.agents.tools.document_tools import (
    skill_load_context, skill_classify_pages,
    skill_extract_answer_key, verify_answer_key,
)
from lms.lms.agents.utils.filesystem import _read_filesystem, _write_to_filesystem

# === REUSABLE SHARED NODES ===
from lms.lms.agents.shared_nodes.content_validator import content_validator_node, ValidatorContext
from lms.lms.agents.shared_nodes.confidence_router import route_by_confidence, build_confidence_route_map

logger = logging.getLogger(__name__)

# ===== STATE =====

class GradingState(TypedDict, total=False):
    """Typed state for the LangGraph grading pipeline."""
    session_id: str
    image_paths: List[str]
    text_content: Optional[str]

    exam_context: str
    rubric_context: str
    answer_key: Dict[str, Any]
    pages_meta: List[Dict[str, Any]]
    grading_type: str
    page_types: List[str]

    visual_reports: List[Dict[str, Any]]
    logic_report: Optional[Dict[str, Any]]
    final_result: Optional[Dict[str, Any]]
    corrections: List[Dict[str, str]]
    confidence: float
    reanalysis_count: int
    attempt: int

    review_status: str
    review_feedback: Optional[str]
    teacher_id: Optional[str]

    error: Optional[str]
    summary: str
    tokens_used: int
    total_cost_usd: float
    grading_latency_ms: int


# ===== NODES =====

def node_load_context(state: GradingState) -> dict:
    """Phase 1: Load rubric, extract answer key, verify."""
    session_id = state["session_id"]
    logger.info(f"[grading] [Phase 1: load_context] Start loading context for session {session_id}")
    start = time.time()

    skill_load_context.invoke({"session_id": session_id})
    exam_context = _read_filesystem(session_id, "exam_context.txt") or ""
    logger.info(f"[grading] [Phase 1: load_context] Rubric/Exam context loaded: {len(exam_context)} characters")

    skill_extract_answer_key.invoke({"session_id": session_id})
    answer_key_str = _read_filesystem(session_id, "answer_key.json")
    answer_key = json.loads(answer_key_str) if answer_key_str else {}
    logger.info(f"[grading] [Phase 1: load_context] Answer key extracted: {len(answer_key)} items")

    verified = verify_answer_key(session_id, answer_key, exam_context)
    if verified:
        answer_key = verified.get("corrected_key", answer_key)
        _write_to_filesystem(session_id, "answer_key_verified.json", answer_key)
        logger.info("[grading] [Phase 1: load_context] Answer key verified and corrected")

    logger.info(f"[grading] [Phase 1: load_context] Completed in {int((time.time()-start)*1000)}ms")
    return {
        "exam_context": exam_context,
        "rubric_context": exam_context,
        "answer_key": answer_key,
    }


def node_classify_pages(state: GradingState) -> dict:
    """Phase 2: Classify pages by type."""
    session_id = state["session_id"]
    image_paths = state.get("image_paths", [])
    logger.info(f"[grading] [Phase 2: classify_pages] Start page classification for session {session_id} with {len(image_paths)} images")
    start = time.time()

    skill_classify_pages.invoke({"session_id": session_id, "image_paths": image_paths})
    pages_meta_str = _read_filesystem(session_id, "pages_meta.json")
    pages_meta = json.loads(pages_meta_str) if pages_meta_str else []

    page_types = []
    for p in pages_meta:
        ptype = p.get("type", "stem_visual")
        if ptype == "mcq":
            page_types.append("mcq")
        elif ptype in ["has_formula", "has_diagram", "stem_visual"]:
            page_types.append("stem_visual")
        else:
            page_types.append("essay_layout")

    if page_types and all(pt == "mcq" for pt in page_types):
        grading_type = "mcq_only"
    elif page_types and all(pt == "stem_visual" for pt in page_types):
        grading_type = "stem_visual"
    elif page_types and all(pt == "essay_layout" for pt in page_types):
        grading_type = "essay_only"
    elif not page_types:
        grading_type = "essay_only"
    else:
        grading_type = "mixed"

    logger.info(f"[grading] [Phase 2: classify_pages] Classification result: grading_type={grading_type}, page_types={page_types}")
    logger.info(f"[grading] [Phase 2: classify_pages] Completed in {int((time.time()-start)*1000)}ms")
    return {
        "pages_meta": pages_meta,
        "page_types": page_types,
        "grading_type": grading_type,
    }


def node_mcq_grading(state: GradingState) -> dict:
    """
    Phase 3-MCQ: Direct MCQ answer key matching.

    This is a SEPARATE branch from the main visual→logic pipeline.
    MCQ-only submissions don't need OCR or solution verification —
    just match student answers against the answer key.
    """
    session_id = state["session_id"]
    visual_reports = state.get("visual_reports", [])
    answer_key = state["answer_key"]
    rubric = state["rubric_context"]
    logger.info(f"[grading] [Phase 3-MCQ: mcq_grading] Start MCQ grading for session {session_id}")
    start = time.time()

    # Combine OCR text from all pages (if any images were provided)
    combined_ocr = "\n".join(r.get("raw_ocr_text", "") for r in visual_reports)
    if not combined_ocr and state.get("text_content"):
        combined_ocr = state["text_content"]

    logger.info(f"[grading] [Phase 3-MCQ: mcq_grading] Combined OCR text length: {len(combined_ocr)} characters")
    report = run_mcq_grading(combined_ocr, answer_key, rubric, session_id)
    
    logger.info(f"[grading] [Phase 3-MCQ: mcq_grading] MCQ grading report generated. Keys in report: {list(report.keys()) if isinstance(report, dict) else 'none'}")
    logger.info(f"[grading] [Phase 3-MCQ: mcq_grading] Completed in {int((time.time()-start)*1000)}ms")
    return {"logic_report": report}


def node_visual_analysis(state: GradingState) -> dict:
    """Phase 3: Visual specialist for OCR/image analysis."""
    session_id = state["session_id"]
    image_paths = state.get("image_paths", [])
    text_content = state.get("text_content", "")
    logger.info(f"[grading] [Phase 3: visual_analysis] Start visual analysis for session {session_id} (images: {len(image_paths)})")
    start = time.time()

    if not image_paths:
        logger.info(f"[grading] [Phase 3: visual_analysis] No image paths provided, using text content if available")
        reports = []
        if text_content:
            reports = [{
                "page_no": 1, "raw_ocr_text": text_content,
                "has_solution_text": True, "extracted_text": text_content,
            }]
        logger.info(f"[grading] [Phase 3: visual_analysis] Completed in {int((time.time()-start)*1000)}ms")
        return {"visual_reports": reports}

    context = {
        "session_id": session_id,
        "exam_type": state["grading_type"],
        "rubric_context": state["rubric_context"],
        "visual_reports": state.get("visual_reports", []),
        "answer_key": state["answer_key"],
    }
    if text_content:
        context["text_content"] = text_content

    reports = run_visual_analysis(context, image_paths, state["page_types"])
    logger.info(f"[grading] [Phase 3: visual_analysis] Generated {len(reports)} visual reports")
    logger.info(f"[grading] [Phase 3: visual_analysis] Completed in {int((time.time()-start)*1000)}ms")
    return {"visual_reports": reports}


def node_logic_analysis(state: GradingState) -> dict:
    """
    Phase 4: Logic/STEM solution verification.

    Only runs for non-MCQ paths (stem_visual, essay_only, mixed).
    MCQ-only submissions take the separate mcq_grader branch.
    """
    session_id = state["session_id"]
    visual_reports = state.get("visual_reports", [])
    grading_type = state["grading_type"]
    answer_key = state["answer_key"]
    rubric = state["rubric_context"]
    logger.info(f"[grading] [Phase 4: logic_analysis] Start logic analysis for session {session_id}")
    start = time.time()

    if any(r.get("has_solution_text") for r in visual_reports) or grading_type in ["stem_visual", "mixed", "essay_only"]:
        context = {
            "session_id": session_id, "exam_type": grading_type,
            "rubric_context": rubric, "visual_reports": visual_reports,
            "answer_key": answer_key,
        }
        text_content = state.get("text_content", "")
        if text_content:
            context["text_content"] = text_content
        
        logger.info(f"[grading] [Phase 4: logic_analysis] Invoking logic specialist model")
        report = run_logic_analysis(context)
        logger.info(f"[grading] [Phase 4: logic_analysis] Logic report generated")
        logger.info(f"[grading] [Phase 4: logic_analysis] Completed in {int((time.time()-start)*1000)}ms")
        return {"logic_report": report}

    logger.info(f"[grading] [Phase 4: logic_analysis] Skipped (no solution text and not analysis type)")
    logger.info(f"[grading] [Phase 4: logic_analysis] Completed in {int((time.time()-start)*1000)}ms")
    return {}


def node_aggregate(state: GradingState) -> dict:
    """Phase 5: Aggregate all specialist results into final grade."""
    session_id = state["session_id"]
    logger.info(f"[grading] [Phase 5: aggregator] Start aggregation for session {session_id}")
    start = time.time()
    context = {
        "session_id": session_id,
        "exam_type": state["grading_type"],
        "rubric_context": state["rubric_context"],
        "visual_reports": state.get("visual_reports", []),
        "logic_report": state.get("logic_report"),
        "answer_key": state["answer_key"],
    }
    attempt = state.get("attempt", 0) + 1

    result = aggregate_final_grade(context)
    confidence = result.get("confidence", 0.9)

    logger.info(f"[grading] [Phase 5: aggregator] Attempt {attempt} results: score={result.get('total_score')}, confidence={confidence:.2f}")
    logger.info(f"[grading] [Phase 5: aggregator] Completed in {int((time.time()-start)*1000)}ms")
    return {
        "final_result": result,
        "confidence": confidence,
        "attempt": attempt,
    }


def node_reviewer(state: GradingState) -> dict:
    """Phase 6: Reviewer — re-analyze if confidence is low."""
    session_id = state["session_id"]
    confidence = state.get("confidence", 0.0)
    logger.info(f"[grading] [Phase 6: reviewer] Start review analysis for session {session_id} (confidence: {confidence:.2f})")
    start = time.time()
    context = {
        "session_id": session_id,
        "exam_type": state["grading_type"],
        "rubric_context": state["rubric_context"],
        "visual_reports": state.get("visual_reports", []),
        "logic_report": state.get("logic_report"),
        "answer_key": state["answer_key"],
        "corrections": state.get("corrections", []),
        "reanalysis_count": state.get("reanalysis_count", 0),
        "confidence": confidence,
    }

    reviewed = run_review_analysis(context, state.get("final_result", {}))
    logger.info(f"[grading] [Phase 6: reviewer] Review results: needs_reanalysis={reviewed.get('needs_reanalysis')}, corrections_count={len(reviewed.get('corrections', []))}")
    logger.info(f"[grading] [Phase 6: reviewer] Completed in {int((time.time()-start)*1000)}ms")

    return {
        "final_result": reviewed,
        "confidence": reviewed.get("confidence", 0.9),
        "corrections": reviewed.get("corrections", []),
        "reanalysis_count": state.get("reanalysis_count", 0) + 1,
    }


def node_hitl_approval(state: GradingState) -> dict:
    """Phase 7: HITL — teacher reviews and approves final grade."""
    session_id = state["session_id"]
    final_result = state.get("final_result", {})
    confidence = state.get("confidence", 0.0)
    logger.info(f"[grading] [Phase 7: hitl_approval] Start HITL check for session {session_id} (confidence: {confidence:.2f})")

    # Auto-approve if confidence is high
    threshold = float(os.environ.get("GRADING_HITL_THRESHOLD", "0.85"))
    if confidence >= threshold:
        logger.info(f"[grading] [Phase 7: hitl_approval] Auto-approved (confidence={confidence:.2f} >= {threshold})")
        return {"review_status": "approved"}

    # Pause for teacher review
    logger.info(f"[grading] [Phase 7: hitl_approval] Confidence {confidence:.2f} < {threshold}. Pausing for teacher decision...")
    review_payload = {
        "session_id": session_id,
        "total_score": final_result.get("total_score", 0),
        "summary": final_result.get("summary", ""),
        "confidence": confidence,
        "message": f"Điểm dự kiến: {final_result.get('total_score', 0)}. Độ tin cậy: {confidence:.0%}. Duyệt hay sửa?",
    }

    teacher_decision = interrupt(review_payload)

    action = teacher_decision.get("action", "approve") if isinstance(teacher_decision, dict) else "approve"
    feedback = teacher_decision.get("feedback", "") if isinstance(teacher_decision, dict) else ""
    logger.info(f"[grading] [Phase 7: hitl_approval] Teacher decision received: action={action}")

    if action == "edit":
        edited_score = teacher_decision.get("edited_score") if isinstance(teacher_decision, dict) else None
        if edited_score is not None:
            final_result["total_score"] = edited_score
            final_result["summary"] = f"{final_result.get('summary', '')}\n\n[GV chỉnh sửa]: {feedback}"
            logger.info(f"[grading] [Phase 7: hitl_approval] Teacher edited score to {edited_score}")
        return {
            "final_result": final_result,
            "review_status": "revised",
            "review_feedback": feedback,
        }

    return {
        "review_status": "approved",
        "review_feedback": feedback,
    }


def node_content_validator(state: GradingState) -> dict:
    """Phase 8: Validate final grade before returning to student."""
    session_id = state["session_id"]
    final_result = state.get("final_result", {})
    logger.info(f"[grading] [Phase 8: content_validator] Start content validation for session {session_id}")
    start = time.time()
    content = json.dumps(final_result, ensure_ascii=False, indent=2)

    validator_ctx = ValidatorContext(
        agent_name="grading",
        content_field="response",
        enabled_dimensions=["PA", "FC"],
    )
    temp_state = {"response": content}
    result = content_validator_node(temp_state, validator_ctx)

    logger.info(f"[grading] [Phase 8: content_validator] Validation result: {result.get('validator_summary')}")
    logger.info(f"[grading] [Phase 8: content_validator] Completed in {int((time.time()-start)*1000)}ms")
    return {"summary": result.get("validator_summary", "Grade validated")}


# ===== ROUTING =====

def route_after_classify(state: GradingState) -> str:
    """
    Branch based on grading type after page classification.

    MCQ-only → direct MCQ grader (skip visual + logic)
    Everything else → full visual → logic pipeline
    """
    grading_type = state.get("grading_type", "mixed")
    if grading_type == "mcq_only":
        logger.info("[grading] route → mcq_grader (MCQ-only branch)")
        return "mcq_grader"
    logger.info(f"[grading] route → visual_analysis ({grading_type} branch)")
    return "visual_analysis"


def route_after_aggregation(state: GradingState) -> str:
    """Route based on confidence: deliver or review."""
    confidence = state.get("confidence", 0.0)
    threshold = float(os.environ.get("GRADING_REVIEW_THRESHOLD", "0.8"))
    attempt = state.get("attempt", 0)
    max_attempts = 2

    if confidence >= threshold:
        return "hitl_approval"
    if attempt < max_attempts:
        return "reviewer"
    return "hitl_approval"


def route_after_reviewer(state: GradingState) -> str:
    """After reviewer: re-aggregate or proceed to HITL."""
    final_result = state.get("final_result", {})
    needs_reanalysis = final_result.get("needs_reanalysis", False)
    attempt = state.get("attempt", 0)
    max_attempts = 2

    if needs_reanalysis and attempt < max_attempts:
        return "aggregator"
    return "hitl_approval"


# ===== BUILD GRAPH =====

def build_grading_graph():
    """Build the LangGraph grading pipeline with HITL + review loop."""
    graph = StateGraph(GradingState)

    graph.add_node("load_context", node_load_context)
    graph.add_node("classify_pages", node_classify_pages)
    graph.add_node("mcq_grader", node_mcq_grading)          # MCQ-only branch
    graph.add_node("visual_analysis", node_visual_analysis)  # STEM/Essay branch
    graph.add_node("logic_analysis", node_logic_analysis)    # STEM/Essay branch
    graph.add_node("aggregator", node_aggregate)
    graph.add_node("reviewer", node_reviewer)
    graph.add_node("hitl_approval", node_hitl_approval)
    graph.add_node("content_validator", node_content_validator)

    # Flow: START → load → classify → BRANCH
    graph.add_edge(START, "load_context")
    graph.add_edge("load_context", "classify_pages")

    # Conditional branch after classify: MCQ-only vs STEM/Essay
    graph.add_conditional_edges("classify_pages", route_after_classify, {
        "mcq_grader": "mcq_grader",
        "visual_analysis": "visual_analysis",
    })

    # MCQ branch: mcq_grader → aggregator (skip visual + logic)
    graph.add_edge("mcq_grader", "aggregator")

    # STEM/Essay branch: visual → logic → aggregator
    graph.add_edge("visual_analysis", "logic_analysis")
    graph.add_edge("logic_analysis", "aggregator")

    # Confidence routing: deliver or review loop
    graph.add_conditional_edges("aggregator", route_after_aggregation, {
        "hitl_approval": "hitl_approval",
        "reviewer": "reviewer",
    })

    # Reviewer → re-aggregate or proceed
    graph.add_conditional_edges("reviewer", route_after_reviewer, {
        "aggregator": "aggregator",
        "hitl_approval": "hitl_approval",
    })

    # HITL → validator → END
    graph.add_edge("hitl_approval", "content_validator")
    graph.add_edge("content_validator", END)

    # Compile with SqliteSaver for HITL checkpoint persistence
    # Falls back to in-memory if not running inside Frappe site
    try:
        import frappe
        from langgraph.checkpoint.sqlite import SqliteSaver
        import sqlite3

        db_path = frappe.utils.get_site_path("private", "grading_checkpoints.sqlite")
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        conn = sqlite3.connect(db_path, check_same_thread=False)
        checkpointer = SqliteSaver(conn)
        return graph.compile(checkpointer=checkpointer)
    except Exception:
        logger.warning("[grading] No Frappe site — compiling without checkpointer (HITL disabled)")
        return graph.compile()


# ===== PUBLIC API =====

def run_grading_pipeline(
    session_id: str,
    image_paths: List[str],
    text_content: Optional[str] = None,
    teacher_id: Optional[str] = None,
) -> dict:
    """
    Run the grading pipeline via LangGraph.

    Args:
        session_id: Grading session ID
        image_paths: List of image file paths
        text_content: Optional text submission
        teacher_id: Teacher user ID for HITL notification

    Returns:
        Final grading result dict
    """
    import frappe
    from lms.lms.agents.core.config import get_agent_thread_config

    config = get_agent_thread_config("grading")
    config["configurable"]["thread_id"] = session_id
    config["configurable"]["site"] = getattr(frappe.local, "site", None)

    initial_state: GradingState = {
        "session_id": session_id,
        "image_paths": image_paths or [],
        "text_content": text_content or "",
        "teacher_id": teacher_id,
        "attempt": 0,
        "reanalysis_count": 0,
        "confidence": 0.0,
        "tokens_used": 0,
        "total_cost_usd": 0.0,
    }

    graph = build_grading_graph()

    start_time = time.time()
    result = graph.invoke(initial_state, config)
    latency_ms = int((time.time() - start_time) * 1000)

    try:
        frappe.db.set_value("AI Grading Session", session_id, "grading_latency_ms", latency_ms)
        frappe.db.commit()
    except Exception:
        pass

    logger.info(f"[grading] LangGraph pipeline completed: {latency_ms}ms")
    return result.get("final_result", {})
