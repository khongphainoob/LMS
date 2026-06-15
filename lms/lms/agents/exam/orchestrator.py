import json
import operator
from typing import Annotated, List, TypedDict, Any
import frappe
from langgraph.graph import StateGraph, END, START
from langgraph.types import Send, Command, interrupt
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field
import os
import logging

from lms.lms.agents.provider import get_llm
from lms.lms.agents.utils.json_utils import extract_and_validate
from lms.lms.agents.exam.prompts import (
    ANALYSIS_PROMPT, BLUEPRINT_PROMPT, 
    MCQ_WRITER_PROMPT, TRUE_FALSE_WRITER_PROMPT, SHORT_ANSWER_WRITER_PROMPT, 
    EVALUATOR_PROMPT
)
from lms.lms.services.observability import get_unified_config_dict
from langgraph.checkpoint.sqlite import SqliteSaver

logger = logging.getLogger("lms.exam.orchestrator")

def ensure_frappe_connection(config: RunnableConfig):
    import frappe
    site = config.get("configurable", {}).get("site")
    if site:
        frappe.init(site=site)
        try:
            if not getattr(frappe.local, "db", None):
                frappe.connect()
            else:
                frappe.db.sql("SELECT 1")
        except Exception:
            frappe.connect()

# --- SCHEMAS ---
class ExamSectionSchema(BaseModel):
    section_name: str
    section_type: str
    instructions: str
    questions: List[dict]

class ExamBlueprintSchema(BaseModel):
    title: str
    instructions: str
    sections_blueprint: List[dict]
    
class EvaluatorFeedbackSchema(BaseModel):
    is_passed: bool
    feedback: str

# --- STATES ---
class ExamState(TypedDict):
    exam_name: str
    teacher_config: dict
    source_text: str
    knowledge_map: str
    blueprint: dict
    sections_drafts: Annotated[list, operator.add]
    final_exam: dict
    errors: Annotated[list, operator.add]
    regenerate_count: int

class SectionState(TypedDict):
    section_index: int
    section_blueprint: dict
    knowledge_map: str
    exam_format: str
    draft_questions: dict
    feedback: str
    retry_count: int

# --- UTILS ---
def normalize_text(text: str) -> str:
    if not text: return text
    text = text.replace('´', '\u0301').replace('`', '\u0300')
    import unicodedata, re
    text = unicodedata.normalize('NFC', text)
    text = re.sub(r'\u0301|\u0300', '', text)
    return text

def generate_with_fallback(llm, prompt_text, schema_class, config=None):
    try:
        structured_llm = llm.with_structured_output(schema_class)
        result = structured_llm.invoke(prompt_text, config=config)
        if result: return result.model_dump()
    except Exception as e:
        logger.warning(f"Structured output failed: {e}. Falling back.")
    try:
        response = llm.invoke(prompt_text, config=config)
        result = extract_and_validate(response.content, schema_class)
        if result: return result.model_dump()
    except Exception as e:
        logger.error(f"Fallback extraction failed: {e}")
    return None

# --- NODES ---
def node_analyze(state: ExamState, config: RunnableConfig):
    ensure_frappe_connection(config)
    """Phase 1: Content Analysis"""
    exam_name = state["exam_name"]
    owner = frappe.db.get_value("AI Exam", exam_name, "owner") or "Administrator"
    frappe.publish_realtime("ai_exam_progress", {"status": "Analyzing knowledge..."}, user=owner)
    llm, _, _ = get_llm("exam_generator", temperature=0.2)
    state_config = state["teacher_config"]
    prompt = ANALYSIS_PROMPT.format(
        subject=state_config.get("subject", ""),
        grade_level=state_config.get("grade_level", ""),
        instructions=state_config.get("teacher_instructions", ""),
        context=(state.get("source_text") or "")[:15000],
    )
    obs_config = get_unified_config_dict("exam_generator_analyze", exam_name)
    run_config = {**config, **obs_config} if config else obs_config
    try:
        response = llm.invoke(prompt, config=run_config)
        return {"knowledge_map": response.content}
    except Exception as e:
        return {"errors": [f"Analysis failed: {str(e)}"]}

def node_blueprint(state: ExamState, config: RunnableConfig):
    ensure_frappe_connection(config)
    """Phase 2: Blueprint Generation"""
    exam_name = state["exam_name"]
    owner = frappe.db.get_value("AI Exam", exam_name, "owner") or "Administrator"
    frappe.publish_realtime("ai_exam_progress", {"status": "Generating blueprint..."}, user=owner)
    llm, _, _ = get_llm("exam_generator", temperature=0.3)
    state_config = state["teacher_config"]
    prompt = BLUEPRINT_PROMPT.format(
        knowledge_map=state["knowledge_map"],
        subject=state_config.get("subject", ""),
        grade_level=state_config.get("grade_level", ""),
        curriculum=state_config.get("curriculum", ""),
        exam_type=state_config.get("exam_type", ""),
        duration_minutes=state_config.get("duration_minutes", 45),
        difficulty_distribution=state_config.get("difficulty_distribution", ""),
        instructions=state_config.get("teacher_instructions", ""),
        exam_format=state_config.get("exam_format", "MOET 2025"),
        custom_format_template=state_config.get("custom_format_template", ""),
        section_configs=state_config.get("section_configs_json", "[]")
    )
    obs_config = get_unified_config_dict("exam_generator_blueprint", exam_name)
    run_config = {**config, **obs_config} if config else obs_config
    
    blueprint_dict = generate_with_fallback(llm, prompt, ExamBlueprintSchema, config=run_config)
    if blueprint_dict:
        total_q = sum([int(s.get("num_questions", 0)) for s in blueprint_dict.get("sections_blueprint", [])])
        blueprint_dict["total_questions"] = total_q
        blueprint_dict["total_points"] = 10.0
        
        doc = frappe.get_doc("AI Exam", exam_name)
        doc.db_set({
            "status": "Waiting for Review",
            "review_started_at": frappe.utils.now_datetime(),
            "review_notified": 0
        })
        frappe.publish_realtime("ai_exam_update", {"name": exam_name}, user=doc.owner)
        try:
            frappe.new_doc("Notification Log").update({
                "subject": f"Đề thi {doc.title or exam_name} đã tạo xong Blueprint. Vui lòng duyệt!",
                "type": "Alert",
                "for_user": doc.owner,
                "document_type": "AI Exam",
                "document_name": doc.name
            }).insert(ignore_permissions=True)
        except Exception as e:
            frappe.logger().error(f"[AI Exam] Failed to send HITL notification: {str(e)}")
        return {"blueprint": blueprint_dict, "errors": []}
    return {"errors": ["Blueprint generation failed"]}

def node_review_blueprint(state: ExamState, config: RunnableConfig):
    ensure_frappe_connection(config)
    """Human-in-the-loop: Pause execution to wait for human review."""
    exam_name = state["exam_name"]
    owner = frappe.db.get_value("AI Exam", exam_name, "owner") or "Administrator"
    frappe.publish_realtime("ai_exam_progress", {"status": "Waiting for review..."}, user=owner)
    
    feedback = interrupt("Please review the blueprint.")
    
    if feedback and isinstance(feedback, str) and feedback != "approve":
        frappe.publish_realtime("ai_exam_progress", {"status": "Regenerating blueprint..."}, user=owner)
        new_config = dict(state["teacher_config"])
        new_config["teacher_instructions"] = new_config.get("teacher_instructions", "") + f"\n\n[USER FEEDBACK FOR REGENERATION]: {feedback}"
        
        # Increment regeneration counter in state
        current_count = state.get("regenerate_count", 0) + 1
        
        return Command(goto="blueprint", update={
            "teacher_config": new_config,
            "regenerate_count": current_count
        })
        
    frappe.publish_realtime("ai_exam_progress", {"status": "Generating questions..."}, user=owner)
    doc = frappe.get_doc("AI Exam", exam_name)
    doc.db_set("status", "Processing")
    return Command(goto="prepare_sections")

def node_prepare_sections(state: ExamState, config: RunnableConfig):
    return {}

def route_sections(state: ExamState):
    """Map step: Create parallel sub-tasks for each section"""
    sections = state["blueprint"].get("sections_blueprint", [])
    sends = []
    for idx, sec in enumerate(sections):
        sends.append(Send("process_section", {
            "section_index": idx,
            "section_blueprint": sec,
            "knowledge_map": state["knowledge_map"],
            "exam_format": state["teacher_config"].get("exam_format", "MOET 2025"),
            "draft_questions": {},
            "feedback": "",
            "retry_count": 0
        }))
    return sends

def node_process_section(state: SectionState, config: RunnableConfig):
    ensure_frappe_connection(config)
    llm_gen, _, _ = get_llm("exam_generator", temperature=0.4, max_tokens=8192)
    llm_eval, _, _ = get_llm("exam_generator", temperature=0.1, max_tokens=4096)
    
    sec = state["section_blueprint"]
    title = sec.get("section_name", "")
    
    prompt_template = MCQ_WRITER_PROMPT
    if "đúng sai" in title.lower() or "đúng/sai" in title.lower():
        prompt_template = TRUE_FALSE_WRITER_PROMPT
    elif "trả lời ngắn" in title.lower() or "tự luận" in title.lower():
        prompt_template = SHORT_ANSWER_WRITER_PROMPT
        
    feedback = ""
    best_draft = {"section_name": title, "questions": []}
    
    from lms.lms.services.observability import get_unified_config_dict
    
    for attempt in range(3):
        prompt = prompt_template.format(
            section_blueprint=json.dumps(sec, ensure_ascii=False, indent=2),
            knowledge_map=state["knowledge_map"],
            num_questions=sec.get("num_questions", 0)
        )
        if feedback:
            prompt += f"\n\nPHẢN HỒI TỪ ĐỢT SINH TRƯỚC (HÃY SỬA LỖI NÀY):\n{feedback}"
            
        obs_config = get_unified_config_dict("exam_generator_section")
        run_config = {**config, **obs_config} if config else obs_config
        
        draft = generate_with_fallback(llm_gen, prompt, ExamSectionSchema, config=run_config)
        if not draft:
            feedback = "Failed to generate JSON. Try again."
            continue
            
        if not draft.get("section_name"):
            draft["section_name"] = title
            
        best_draft = draft
        
        eval_prompt = EVALUATOR_PROMPT.format(
            section_blueprint=json.dumps(sec, ensure_ascii=False, indent=2),
            draft_questions=json.dumps(draft, ensure_ascii=False, indent=2),
            num_questions=sec.get("num_questions", 0)
        )
        eval_obs_config = get_unified_config_dict("exam_generator_evaluator")
        eval_run_config = {**config, **eval_obs_config} if config else eval_obs_config
        
        eval_result = generate_with_fallback(llm_eval, eval_prompt, EvaluatorFeedbackSchema, config=eval_run_config)
        
        if eval_result and eval_result.get("is_passed"):
            draft["_index"] = state["section_index"]
            return {"sections_drafts": [draft]}
            
        feedback = eval_result.get("feedback", "Requirements not met.") if eval_result else "Evaluation failed."
        
    best_draft["_index"] = state["section_index"]
    return {"sections_drafts": [best_draft]}

def node_format_final(state: ExamState, config: RunnableConfig):
    ensure_frappe_connection(config)
    exam_name = state["exam_name"]
    owner = frappe.db.get_value("AI Exam", exam_name, "owner") or "Administrator"
    frappe.publish_realtime("ai_exam_progress", {"status": "Formatting final exam..."}, user=owner)
    
    sections = state.get("sections_drafts", [])
    sections.sort(key=lambda x: x.get("_index", 999))
    
    for s in sections:
        if "_index" in s:
            del s["_index"]
            
    final_exam = {
        "title": state["blueprint"].get("title", ""),
        "instructions": state["blueprint"].get("instructions", ""),
        "sections": sections
    }
    
    from lms.lms.agents.exam.orchestrator import calculate_10_point_scale # fallback for math logic
    final_exam = calculate_10_point_scale(final_exam, state["teacher_config"].get("exam_format", "MOET 2025"), state["teacher_config"].get("subject", "Toán"))
    
    for sec in final_exam.get("sections", []):
        sec["section_name"] = normalize_text(sec.get("section_name", ""))
        sec["instructions"] = normalize_text(sec.get("instructions", ""))
        for q in sec.get("questions", []):
            q["question_text"] = normalize_text(q.get("question_text", ""))
            q["correct_answer"] = normalize_text(q.get("correct_answer", ""))
            q["explanation"] = normalize_text(q.get("explanation", ""))
            for opt in q.get("options", []):
                opt["text"] = normalize_text(opt.get("text", ""))
                
    doc = frappe.get_doc("AI Exam", exam_name)
    doc.set("sections", [])
    doc.set("questions", [])
    
    q_index = 1
    for sec_data in final_exam["sections"]:
        sec_doc = doc.append("sections", {
            "section_title": sec_data.get("section_name"),
            "section_instructions": sec_data.get("instructions"),
            "section_type": sec_data.get("section_type", "Multiple Choice"),
            "num_questions": len(sec_data.get("questions", []))
        })
        for q_data in sec_data.get("questions", []):
            q_doc = doc.append("questions", {
                "question_number": q_data.get("question_number", q_index),
                "section_ref": sec_doc.name,
                "question_type": q_data.get("question_type", "Multiple Choice"),
                "question_text": q_data.get("question_text", ""),
                "correct_answer": q_data.get("correct_answer", ""),
                "explanation": q_data.get("explanation", ""),
                "points": q_data.get("points", 1.0),
                "bloom_level": q_data.get("bloom_level", ""),
                "needs_visual": q_data.get("needs_visual", 0),
                "visual_prompt": q_data.get("visual_prompt", "")
            })
            q_index += 1
            # options is a Code (JSON) field in AI Exam Question
            options_list = []
            for opt in q_data.get("options", []):
                if opt.get("text"):
                    options_list.append({
                        "option_label": opt.get("label", ""),
                        "option_text": opt.get("text", ""),
                        "is_correct": 1 if opt.get("is_correct") else 0
                    })
            if options_list:
                q_doc.options = json.dumps(options_list, ensure_ascii=False)
            
            # criteria is not a field in AI Exam Question, we store it in solution if it exists
            if q_data.get("criteria"):
                rubric_md = "\n\n**Tiêu chí chấm (Rubric):**\n"
                for crit in q_data.get("criteria"):
                    c_name = crit.get("criterion_name", "")
                    c_score = crit.get("max_score", 0)
                    rubric_md += f"- **{c_name}** (Tối đa: {c_score} điểm)\n"
                    
                    perf_json = crit.get("performance_levels_json")
                    if perf_json:
                        try:
                            levels = json.loads(perf_json).get("levels", [])
                            for lvl in levels:
                                desc = lvl.get("description", "")
                                score = lvl.get("score", 0)
                                rubric_md += f"  - {desc}: {score} điểm\n"
                        except Exception:
                            pass
                q_doc.solution = (q_doc.solution or "") + rubric_md
    doc.status = "Completed"
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    frappe.publish_realtime("ai_exam_update", {"name": exam_name}, user=doc.owner)
    
    return {"final_exam": final_exam}

def build_graph():
    builder = StateGraph(ExamState)
    builder.add_node("analyze", node_analyze)
    builder.add_node("blueprint", node_blueprint)
    builder.add_node("review_blueprint", node_review_blueprint)
    builder.add_node("prepare_sections", node_prepare_sections)
    
    builder.add_node("process_section", node_process_section)
    builder.add_node("format_final", node_format_final)
    
    builder.add_edge(START, "analyze")
    builder.add_edge("analyze", "blueprint")
    builder.add_edge("blueprint", "review_blueprint")
    
    builder.add_conditional_edges("prepare_sections", route_sections, ["process_section"])
    builder.add_edge("process_section", "format_final")
    builder.add_edge("format_final", END)
    
    return builder

# Compile globally with SqliteSaver
frappe_site_path = frappe.get_site_path("private", "files")
os.makedirs(frappe_site_path, exist_ok=True)
import sqlite3
db_path = os.path.join(frappe_site_path, "exam_checkpoints.sqlite")
conn = sqlite3.connect(db_path, check_same_thread=False)
memory = SqliteSaver(conn)
graph = build_graph().compile(checkpointer=memory)

# --- PUBLIC APIS FOR FRAPPE TASKS ---
def calculate_10_point_scale(final_exam: dict, exam_format: str = "MOET 2025", subject: str = "Toán") -> dict:
    sections = final_exam.get("sections", [])
    
    if exam_format == "MOET 2025":
        # MOET 2025 standard scoring
        for i, sec in enumerate(sections):
            for q in sec.get("questions", []):
                if i == 0:  # Section 1
                    q["points"] = 0.25
                    q["criteria"] = [{
                        "criterion_name": "Lựa chọn phương án đúng",
                        "criterion_type": "Correctness",
                        "max_score": 0.25,
                        "performance_levels_json": json.dumps({"levels": [{"description": "Chọn đúng đáp án", "score": 0.25}, {"description": "Chọn sai hoặc không chọn", "score": 0.0}]}, ensure_ascii=False)
                    }]
                elif i == 1:  # Section 2
                    q["points"] = 1.0
                    q["criteria"] = [{
                        "criterion_name": "Đúng/Sai (4 ý)",
                        "criterion_type": "Correctness",
                        "max_score": 1.0,
                        "performance_levels_json": json.dumps({"levels": [
                            {"description": "Chỉ chọn đúng 1 ý trong 1 câu", "score": 0.1},
                            {"description": "Chỉ chọn đúng 2 ý trong 1 câu", "score": 0.25},
                            {"description": "Chỉ chọn đúng 3 ý trong 1 câu", "score": 0.5},
                            {"description": "Chọn đúng cả 4 ý trong 1 câu", "score": 1.0},
                            {"description": "Không chọn đúng ý nào", "score": 0.0}
                        ]}, ensure_ascii=False)
                    }]
                elif i == 2:  # Section 3
                    pts = 0.5 if subject == "Toán" else 0.25
                    q["points"] = pts
                    q["criteria"] = [{
                        "criterion_name": "Trả lời ngắn",
                        "criterion_type": "Correctness",
                        "max_score": pts,
                        "performance_levels_json": json.dumps({"levels": [
                            {"description": "Điền chính xác kết quả", "score": pts},
                            {"description": "Điền sai kết quả", "score": 0.0}
                        ]}, ensure_ascii=False)
                    }]
                else:
                    q["points"] = 0.25
                    
    else:
        # Mixed (Trắc nghiệm + Tự luận) -> 7.0 for MCQ, 3.0 for Subjective
        total_mcq = sum(len(s.get("questions", [])) for s in sections if s.get("section_type", "Multiple Choice") != "Subjective")
        total_subjective = sum(len(s.get("questions", [])) for s in sections if s.get("section_type") == "Subjective")
        
        mcq_total_points = 7.0 if total_subjective > 0 else 10.0
        subjective_total_points = 3.0 if total_mcq > 0 else 10.0
        
        if total_mcq > 0:
            mcq_point_per_q = mcq_total_points / total_mcq
            for sec in sections:
                if sec.get("section_type") != "Subjective":
                    for q in sec.get("questions", []):
                        q["points"] = round(mcq_point_per_q, 2)
                        
        if total_subjective > 0:
            diff_weights = {"Nhận biết": 1.0, "Thông hiểu": 1.5, "Vận dụng": 2.0, "Vận dụng cao": 2.5, "easy": 1.0, "medium": 1.5, "hard": 2.0}
            total_weight = sum(
                diff_weights.get(q.get("difficulty_level", "Medium"), 1.0)
                for sec in sections if sec.get("section_type") == "Subjective"
                for q in sec.get("questions", [])
            )
            if total_weight > 0:
                for sec in sections:
                    if sec.get("section_type") == "Subjective":
                        for q in sec.get("questions", []):
                            w = diff_weights.get(q.get("difficulty_level", "Medium"), 1.0)
                            pts = round(subjective_total_points * (w / total_weight), 2)
                            q["points"] = pts
                            q["criteria"] = [{
                                "criterion_name": f"Trả lời tự luận ({q.get('difficulty_level', 'Medium')})",
                                "criterion_type": "Completeness",
                                "max_score": pts,
                                "performance_levels_json": json.dumps({"levels": [
                                    {"description": "Trả lời đầy đủ, chính xác, lập luận chặt chẽ", "score": pts},
                                    {"description": "Trả lời đúng nhưng thiếu ý hoặc lập luận chưa chặt", "score": round(pts / 2, 2)},
                                    {"description": "Trả lời có ý đúng nhưng phần lớn sai hoặc lạc đề", "score": round(pts / 4, 2)},
                                    {"description": "Trả lời sai hoàn toàn hoặc không trả lời", "score": 0.0}
                                ]}, ensure_ascii=False)
                            }]
                        
    return final_exam

def run_exam_graph(exam_name: str, resume_action: str = None, modified_blueprint: str = None):
    import frappe
    from lms.lms.services.observability import get_unified_config_dict, flush_langfuse
    from langgraph.types import Command
    import json
    import traceback
    
    config = get_unified_config_dict(agent_name="exam_generator", session_id=f"exam_{exam_name}")
    config["configurable"] = {"thread_id": exam_name, "site": getattr(frappe.local, "site", None)}
    doc = frappe.get_doc("AI Exam", exam_name)
    
    try:
        if resume_action:
            # We are resuming from an interrupt (either feedback string or "approve")
            if modified_blueprint:
                state = graph.get_state(config)
                if state and state.values:
                    graph.update_state(config, {"blueprint": json.loads(modified_blueprint)})
                    
            graph.invoke(Command(resume=resume_action), config=config)
        else:
            # We are starting fresh or retrying
            
            # --- Check if we can resume from existing approved blueprint after failure ---
            state = graph.get_state(config)
            if doc.status == "Failed" and state and state.values and state.values.get("blueprint"):
                frappe.logger().info(f"[AI Exam] Resuming {exam_name} from existing approved blueprint after failure.")
                doc.db_set("status", "Processing")
                frappe.publish_realtime("ai_exam_update", {"name": exam_name}, user=doc.owner)
                # Resume from prepare_sections
                graph.invoke(Command(goto="prepare_sections"), config=config)
                flush_langfuse()
                return

            from lms.lms.services.ai_rate_limit import check_and_record_usage
            can_proceed = check_and_record_usage(frappe.session.user, "Exam Gen")
            if not can_proceed:
                doc.db_set("status", "Failed")
                doc.db_set("error_log", "AI Rate limit exceeded.")
                frappe.publish_realtime("ai_exam_update", {"name": exam_name}, user=doc.owner)
                return

            doc.db_set("status", "Processing")
            frappe.publish_realtime("ai_exam_update", {"name": exam_name}, user=doc.owner)

            try:
                from lms.lms.agents.quiz.extractor import extract_text_from_quiz_source
            except ImportError:
                try:
                    from lms.lms.services.ai_quiz.api import extract_text_from_quiz_source
                except ImportError:
                    extract_text_from_quiz_source = None
                    
            source_text = ""
            if hasattr(doc, "source_file") and doc.source_file:
                if extract_text_from_quiz_source:
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
                    "teacher_instructions": doc.teacher_instructions,
                    "exam_format": doc.exam_format if hasattr(doc, "exam_format") else "MOET 2025",
                    "custom_format_template": doc.custom_format_template if hasattr(doc, "custom_format_template") else "",
                    "section_configs_json": doc.section_configs_json if hasattr(doc, "section_configs_json") else "[]"
                },
                "knowledge_map": "",
                "blueprint": {},
                "sections_drafts": [],
                "final_exam": {},
                "errors": [],
                "regenerate_count": 0
            }
            
            graph.invoke(initial_state, config=config)
            
        flush_langfuse()
        
    except Exception as e:
        full_traceback = traceback.format_exc()
        frappe.log_error(f"AI Exam Graph Error: {full_traceback}", "AI Exam")
        frappe.db.set_value("AI Exam", exam_name, "status", "Failed")
        frappe.db.set_value("AI Exam", exam_name, "error_log", full_traceback)
        frappe.publish_realtime("ai_exam_update", {"name": exam_name}, user=doc.owner)

def load_state_from_file(exam_name: str) -> dict:
    config = {"configurable": {"thread_id": exam_name}}
    state = graph.get_state(config)
    if state and state.values:
        return state.values
    return {}
