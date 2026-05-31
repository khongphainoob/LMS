import logging
import json
import frappe
import os
import unicodedata
from typing import Dict, Any, TypedDict
from langgraph.graph import StateGraph, END
from lms.lms.services.observability import get_unified_config_dict

from lms.lms.agents.provider import get_llm
from lms.lms.agents.utils.json_utils import extract_and_validate
from .schemas import ExamSchema, ExamBlueprintSchema
from .prompts import ANALYSIS_PROMPT, BLUEPRINT_PROMPT, GENERATION_PROMPT
try:
    from lms.lms.agents.quiz.extractor import extract_text_from_quiz_source
except ImportError:
    try:
        from lms.lms.services.ai_quiz.api import extract_text_from_quiz_source
    except ImportError:
        extract_text_from_quiz_source = None

from lms.lms.services.ai_rate_limit import check_and_record_usage

logger = logging.getLogger(__name__)

class ExamState(TypedDict):
    exam_name: str
    source_text: str
    teacher_config: dict
    knowledge_map: str
    blueprint: dict
    final_exam: dict
    errors: list

def normalize_text(text: str) -> str:
    """Normalize unicode characters (NFC) to fix Vietnamese font rendering issues."""
    if not text:
        return text
    return unicodedata.normalize('NFC', text)

def generate_with_fallback(llm, prompt_text, schema_class):
    """Attempt with_structured_output first, fallback to prompt parsing on failure."""
    try:
        structured_llm = llm.with_structured_output(schema_class)
        result = structured_llm.invoke(prompt_text)
        if result:
            return result.model_dump()
    except Exception as e:
        logger.warning(f"Structured output failed: {e}. Falling back to manual extraction.")
        
    try:
        response = llm.invoke(prompt_text)
        result = extract_and_validate(response.content, schema_class)
        if result:
            return result.model_dump()
    except Exception as e:
        logger.error(f"Fallback manual extraction failed: {e}")
    return None

def node_analyze(state: ExamState):
    """Phase 1: Content Analysis"""
    llm, _, _ = get_llm("exam_generator", temperature=0.2)
    prompt = ANALYSIS_PROMPT.format(context=state["source_text"][:15000])
    
    try:
        response = llm.invoke(prompt)
        state["knowledge_map"] = response.content
    except Exception as e:
        state["errors"].append(f"Analysis failed: {str(e)}")
    
    return state

def node_blueprint(state: ExamState):
    """Phase 2: Blueprint Generation"""
    llm, _, _ = get_llm("exam_generator", temperature=0.3)
    config = state["teacher_config"]
    prompt = BLUEPRINT_PROMPT.format(
        knowledge_map=state["knowledge_map"],
        subject=config.get("subject", ""),
        grade_level=config.get("grade_level", ""),
        curriculum=config.get("curriculum", ""),
        exam_type=config.get("exam_type", ""),
        duration_minutes=config.get("duration_minutes", 45),
        difficulty_distribution=config.get("difficulty_distribution", ""),
        instructions=config.get("teacher_instructions", "")
    )
    try:
        blueprint_dict = generate_with_fallback(llm, prompt, ExamBlueprintSchema)
        if blueprint_dict:
            state["blueprint"] = blueprint_dict
        else:
            state["errors"].append("Failed to extract valid Blueprint structure")
    except Exception as e:
        state["errors"].append(f"Blueprint generation failed: {str(e)}")
        
    return state

def node_generate(state: ExamState):
    """Phase 3: Final Generation"""
    llm, _, _ = get_llm("exam_generator", temperature=0.4)
    config = state["teacher_config"]
    
    prompt = GENERATION_PROMPT.format(
        blueprint=json.dumps(state["blueprint"], ensure_ascii=False, indent=2),
        knowledge_map=state["knowledge_map"],
        instructions=config.get("teacher_instructions", "")
    )
    
    try:
        exam_dict = generate_with_fallback(llm, prompt, ExamSchema)
        if exam_dict:
            state["final_exam"] = exam_dict
        else:
            state["errors"].append("Failed to extract valid Exam structure")
    except Exception as e:
        state["errors"].append(f"Exam generation failed: {str(e)}")
        
    return state

def build_graph():
    workflow = StateGraph(ExamState)
    workflow.add_node("analyze", node_analyze)
    workflow.add_node("blueprint", node_blueprint)
    workflow.add_node("generate", node_generate)
    
    workflow.set_entry_point("analyze")
    workflow.add_edge("analyze", "blueprint")
    workflow.add_edge("blueprint", "generate")
    workflow.add_edge("generate", END)
    
    return workflow.compile()

def calculate_10_point_scale(final_exam: dict) -> dict:
    """Calculate 10-point scale for multiple choice and subjective questions."""
    total_mcq = 0
    total_subjective = 0
    
    for section in final_exam.get("sections", []):
        if section.get("section_type") == "Multiple Choice":
            total_mcq += len(section.get("questions", []))
        elif section.get("section_type") == "Subjective":
            total_subjective += len(section.get("questions", []))
            
    # Vietnamese exams usually have 10 points total.
    mcq_total_points = 5.0 if total_subjective > 0 else 10.0
    subjective_total_points = 5.0 if total_mcq > 0 else 10.0
    
    if total_mcq > 0:
        mcq_point_per_q = mcq_total_points / total_mcq
        for section in final_exam.get("sections", []):
            if section.get("section_type") == "Multiple Choice":
                for q in section.get("questions", []):
                    q["points"] = round(mcq_point_per_q, 2)
                    
    if total_subjective > 0:
        # Subjective distribution based on cognitive difficulty levels
        diff_weights = {"Nhận biết": 1.0, "Thông hiểu": 1.5, "Vận dụng": 2.0, "Vận dụng cao": 2.5, "easy": 1.0, "medium": 1.5, "hard": 2.0}
        total_weight = 0
        for section in final_exam.get("sections", []):
            if section.get("section_type") == "Subjective":
                for q in section.get("questions", []):
                    w = diff_weights.get(q.get("difficulty_level", "Medium"), 1.0)
                    total_weight += w
        
        if total_weight > 0:
            for section in final_exam.get("sections", []):
                if section.get("section_type") == "Subjective":
                    for q in section.get("questions", []):
                        w = diff_weights.get(q.get("difficulty_level", "Medium"), 1.0)
                        q["points"] = round(subjective_total_points * (w / total_weight), 2)
                    
    return final_exam

def get_state_file_path(exam_name: str) -> str:
    site_path = frappe.get_site_path()
    state_dir = os.path.join(site_path, 'private', 'files', 'ai_exam_states')
    os.makedirs(state_dir, exist_ok=True)
    return os.path.join(state_dir, f"{exam_name}_state.json")

def save_state_to_file(exam_name: str, state: dict):
    file_path = get_state_file_path(exam_name)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

def load_state_from_file(exam_name: str) -> dict:
    file_path = get_state_file_path(exam_name)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def process_phase_1(exam_name: str):
    """Run Analysis and Blueprint generation, then await human review."""
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        frappe.publish_realtime("ai_exam_progress", {"status": "Starting Analysis..."}, room=doc.name)
        
        can_proceed = check_and_record_usage(frappe.session.user, "Exam Gen")
        if not can_proceed:
            doc.db_set("status", "Failed")
            doc.db_set("error_log", "AI Rate limit exceeded.")
            return

        doc.db_set("status", "Phase 1 - Analyzing")
        
        source_text = ""
        if hasattr(doc, "source_file") and doc.source_file:
            if extract_text_from_quiz_source:
                # We don't have source_type, so we assume Document
                source_text = extract_text_from_quiz_source("Document", doc.source_file, "")
            else:
                source_text = f"Attached file: {doc.source_file}"
        else:
            source_text = doc.teacher_instructions
            
        initial_state = {
            "exam_name": exam_name,
            "source_text": source_text,
            "teacher_config": {
                "subject": doc.subject,
                "grade_level": doc.grade_level,
                "curriculum": doc.curriculum,
                "exam_type": doc.exam_type,
                "duration_minutes": doc.duration_minutes,
                "difficulty_distribution": doc.difficulty_distribution,
                "teacher_instructions": doc.teacher_instructions
            },
            "knowledge_map": "",
            "blueprint": {},
            "final_exam": {},
            "errors": []
        }

        # Build partial graph for phase 1
        workflow = StateGraph(ExamState)
        workflow.add_node("analyze", node_analyze)
        workflow.add_node("blueprint", node_blueprint)
        workflow.set_entry_point("analyze")
        workflow.add_edge("analyze", "blueprint")
        workflow.add_edge("blueprint", END)
        graph = workflow.compile()
        
        frappe.publish_realtime("ai_exam_progress", {"status": "Analyzing knowledge..."}, room=doc.name)
        
        # Unify tracking and observability
        thread_id = f"exam_{exam_name}"
        config = get_unified_config_dict(agent_name="exam_phase_1", session_id=thread_id)
        
        final_state = graph.invoke(initial_state, config=config)
        
        if final_state.get("errors"):
            raise Exception(" | ".join(final_state["errors"]))
            
        save_state_to_file(exam_name, final_state)
        
        doc.db_set("status", "Pending Review")
        doc.db_set("status", "Awaiting Blueprint Review")
        frappe.publish_realtime("ai_exam_progress", {"status": "Blueprint ready for review"}, room=doc.name)
        
    except Exception as e:
        logger.error(f"AI Exam Phase 1 Error: {e}", exc_info=True)
        frappe.db.set_value("AI Exam", exam_name, "status", "Failed")
        frappe.db.set_value("AI Exam", exam_name, "error_log", str(e))
        frappe.publish_realtime("ai_exam_progress", {"status": "Failed"}, room=exam_name)

def process_phase_2(exam_name: str, modified_blueprint: str = None):
    """Run Generation using the approved blueprint."""
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        doc.db_set("status", "Phase 2 - Generating")
        frappe.publish_realtime("ai_exam_progress", {"status": "Generating Exam Questions..."}, room=doc.name)
        
        state = load_state_from_file(exam_name)
        if not state:
            raise Exception("State file missing, please start from Phase 1")
            
        # Unify tracking and observability
        thread_id = f"exam_{exam_name}_p2"
        config = get_unified_config_dict(agent_name="exam_phase_2", session_id=thread_id)
        
        if modified_blueprint:
            state["blueprint"] = json.loads(modified_blueprint)
            
        workflow = StateGraph(ExamState)
        workflow.add_node("generate", node_generate)
        workflow.set_entry_point("generate")
        workflow.add_edge("generate", END)
        graph = workflow.compile()
        
        final_state = graph.invoke(state)
        
        if final_state.get("errors"):
            raise Exception(" | ".join(final_state["errors"]))
            
        exam_data = final_state.get("final_exam", {})
        exam_data = calculate_10_point_scale(exam_data)
        
        doc.title = normalize_text(exam_data.get("title", doc.title))
        doc.instructions = normalize_text(exam_data.get("instructions", ""))
        
        for sec in exam_data.get("sections", []):
            sec_doc = doc.append("sections", {})
            sec_doc.section_name = normalize_text(sec.get("section_name"))
            sec_doc.section_type = normalize_text(sec.get("section_type"))
            sec_doc.instructions = normalize_text(sec.get("instructions"))
            
            for q in sec.get("questions", []):
                q_doc = doc.append("questions", {})
                q_doc.section_idx = sec_doc.idx
                q_doc.question_type = normalize_text(q.get("question_type", sec_doc.section_type))
                q_doc.question_text = normalize_text(q.get("question_text"))
                q_doc.difficulty_level = normalize_text(q.get("difficulty_level"))
                q_doc.points = q.get("points", 1.0)
                formatted_options = []
                for opt in q.get("options", []):
                    if isinstance(opt, dict):
                        formatted_options.append({
                            "label": normalize_text(opt.get("label", "")),
                            "text": normalize_text(opt.get("text", "")),
                            "is_correct": opt.get("is_correct", False)
                        })
                    else:
                        formatted_options.append(normalize_text(str(opt)))
                q_doc.options = json.dumps(formatted_options, ensure_ascii=False) if formatted_options else None
                if q.get("correct_answer"):
                    q_doc.correct_answer = json.dumps(q.get("correct_answer", [])) if isinstance(q.get("correct_answer"), list) else normalize_text(q.get("correct_answer"))
                q_doc.explanation = normalize_text(q.get("explanation"))
                q_doc.bloom_level = normalize_text(q.get("bloom_level"))
                
        doc.status = "Completed"
        doc.hitl_status = "Approved"
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        frappe.publish_realtime("ai_exam_progress", {"status": "Completed"}, room=doc.name)
        
    except Exception as e:
        logger.error(f"AI Exam Phase 2 Error: {e}", exc_info=True)
        frappe.db.set_value("AI Exam", exam_name, "status", "Failed")
        frappe.db.set_value("AI Exam", exam_name, "error_log", str(e))
        frappe.publish_realtime("ai_exam_progress", {"status": "Failed"}, room=exam_name)
