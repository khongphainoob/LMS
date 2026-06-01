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
from .schemas import ExamSchema, ExamBlueprintSchema, ExamSectionSchema
from .prompts import ANALYSIS_PROMPT, BLUEPRINT_PROMPT, QUESTION_WRITER_PROMPT
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
    """Normalize unicode characters (NFC) to fix Vietnamese font rendering issues and OCR artifacts."""
    if not text:
        return text
    
    # 1. Convert rogue spacing accents to combining accents
    text = text.replace('´', '\u0301')
    text = text.replace('`', '\u0300')
    
    # 2. Normalize to NFC to combine valid pairs (like â + \u0300 -> ầ)
    import unicodedata
    import re
    text = unicodedata.normalize('NFC', text)
    
    # 3. Strip any leftover combining accents (e.g. from ắ + \u0301 where ắ already has a tone)
    text = re.sub(r'\u0301|\u0300', '', text)
    
    return text

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
    config = state["teacher_config"]
    prompt = ANALYSIS_PROMPT.format(
        subject=config.get("subject", ""),
        grade_level=config.get("grade_level", ""),
        instructions=config.get("teacher_instructions", ""),
        context=state["source_text"][:15000]
    )
    
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
        instructions=config.get("teacher_instructions", ""),
        exam_format=config.get("exam_format", "MOET 2025"),
        custom_format_template=config.get("custom_format_template", ""),
        section_configs=config.get("section_configs_json", "[]")
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
    """Phase 3: Final Generation (Iterative Section Writer)"""
    llm, _, _ = get_llm("exam_generator", temperature=0.4)
    config = state["teacher_config"]
    
    try:
        doc = frappe.get_doc("AI Exam", state.get("exam_name"))
        exam_format = doc.exam_format if hasattr(doc, "exam_format") else "MOET 2025"
    except:
        exam_format = "MOET 2025"
        
    final_sections = []
    
    for section_blueprint in state["blueprint"].get("sections_blueprint", []):
        # Support both field name variants from AI
        num_questions = (
            section_blueprint.get("num_questions")
            or section_blueprint.get("total_questions")
            or 0
        )
        question_type = (
            section_blueprint.get("section_type")
            or section_blueprint.get("question_type")
            or "Multiple Choice"
        )
        # Cast to int to avoid TypeError when value comes as string from AI
        try:
            num_questions = int(num_questions)
        except (TypeError, ValueError):
            num_questions = 0
        if num_questions <= 0:
            continue
            
        prompt = QUESTION_WRITER_PROMPT.format(
            section_blueprint=json.dumps(section_blueprint, ensure_ascii=False, indent=2),
            knowledge_map=state["knowledge_map"],
            exam_format=exam_format,
            num_questions=num_questions,
            question_type=question_type
        )
        
        try:
            section_dict = generate_with_fallback(llm, prompt, ExamSectionSchema)
            if section_dict:
                if not section_dict.get("section_name"):
                    section_dict["section_name"] = section_blueprint.get("section_name", "")
                final_sections.append(section_dict)
            else:
                state["errors"].append(f"Failed to extract section {section_blueprint.get('section_name', '')}")
        except Exception as e:
            state["errors"].append(f"Section generation failed: {str(e)}")
            
    # Always build final_exam with whatever sections we have
    state["final_exam"] = {
        "title": state["blueprint"].get("title", ""),
        "instructions": state["blueprint"].get("instructions", ""),
        "sections": final_sections
    }
        
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

def calculate_10_point_scale(final_exam: dict, exam_format: str = "MOET 2025", subject: str = "Toán") -> dict:
    """Calculate 10-point scale for multiple choice and subjective questions."""
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
        frappe.publish_realtime("ai_exam_update", {"name": exam_name}, room=doc.name)
        
        can_proceed = check_and_record_usage(frappe.session.user, "Exam Gen")
        if not can_proceed:
            doc.db_set("status", "Failed")
            doc.db_set("error_log", "AI Rate limit exceeded.")
            frappe.publish_realtime("ai_exam_update", {"name": exam_name}, room=doc.name)
            return

        doc.db_set("status", "Processing")
        
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
                "teacher_instructions": doc.teacher_instructions,
                "exam_format": doc.exam_format if hasattr(doc, "exam_format") else "MOET 2025",
                "custom_format_template": doc.custom_format_template if hasattr(doc, "custom_format_template") else "",
                "section_configs_json": doc.section_configs_json if hasattr(doc, "section_configs_json") else "[]"
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
        
        doc.db_set({
            "status": "Waiting for Review",
            "review_started_at": frappe.utils.now_datetime(),
            "review_notified": 0,
            "owner_user": doc.owner,
        })
        frappe.publish_realtime("ai_exam_update", {"name": exam_name}, room=doc.name)
        
    except Exception as e:
        logger.error(f"AI Exam Phase 1 Error: {e}", exc_info=True)
        frappe.db.set_value("AI Exam", exam_name, "status", "Failed")
        frappe.db.set_value("AI Exam", exam_name, "error_log", str(e))
        frappe.publish_realtime("ai_exam_update", {"name": exam_name}, room=exam_name)

def process_phase_2(exam_name: str, modified_blueprint: str = None):
    """Run Generation using the approved blueprint."""
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        doc.db_set("status", "Processing")
        frappe.publish_realtime("ai_exam_update", {"name": exam_name}, room=doc.name)
        
        state = load_state_from_file(exam_name)
        if not state:
            raise Exception("State file missing, please start from Phase 1")
            
        # Unify tracking and observability
        thread_id = f"exam_{exam_name}_p2"
        config = get_unified_config_dict(agent_name="exam_phase_2", session_id=thread_id)
        
        if modified_blueprint:
            state["blueprint"] = json.loads(modified_blueprint)
            
        from lms.lms.agents.exam.nodes.formatter import node_format
        
        workflow = StateGraph(ExamState)
        workflow.add_node("generate", node_generate)
        workflow.add_node("formatter", node_format)
        workflow.set_entry_point("generate")
        workflow.add_edge("generate", "formatter")
        workflow.add_edge("formatter", END)
        graph = workflow.compile()
        
        final_state = graph.invoke(state)
        
        if final_state.get("errors"):
            raise Exception(" | ".join(final_state["errors"]))
            
        exam_data = final_state.get("final_exam", {})
        exam_format = doc.exam_format if hasattr(doc, "exam_format") else "MOET 2025"
        exam_data = calculate_10_point_scale(exam_data, exam_format=exam_format, subject=doc.subject)
        
        doc.title = normalize_text(exam_data.get("title", doc.title))
        doc.instructions = normalize_text(exam_data.get("instructions", ""))
        
        q_num = 1
        for sec in exam_data.get("sections", []):
            sec_doc = doc.append("sections", {})
            sec_doc.section_title = normalize_text(sec.get("section_name", sec.get("section_title")))
            sec_doc.section_instructions = normalize_text(sec.get("instructions", sec.get("section_instructions")))
            sec_doc.num_questions = len(sec.get("questions", []))
            
            for q in sec.get("questions", []):
                q_doc = doc.append("questions", {})
                q_doc.question_number = q_num
                q_num += 1
                
                raw_type = normalize_text(q.get("question_type", sec.get("section_type"))).lower()
                if "đúng sai" in raw_type or "true/false" in raw_type:
                    q_doc.question_type = "True/False"
                elif "ngắn" in raw_type or "short" in raw_type:
                    q_doc.question_type = "Short Answer"
                elif "tự luận" in raw_type or "essay" in raw_type:
                    q_doc.question_type = "Essay"
                else:
                    q_doc.question_type = "Multiple Choice"
                    
                q_doc.question_text = normalize_text(q.get("question_text"))
                q_doc.difficulty_level = normalize_text(q.get("difficulty_level"))
                q_doc.points = q.get("points", 1.0)
                formatted_options = []
                # Guard against options=None for non-MCQ questions
                for opt in (q.get("options") or []):
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
        frappe.publish_realtime("ai_exam_update", {"name": exam_name}, room=doc.name)

        # Persistent notification → /lms/notifications + bell icon
        try:
            from lms.lms.services.hitl.notification import notify_user_direct
            from lms.lms.utils import get_lms_route
            notify_user_direct(
                for_user=doc.owner,
                subject=f"✅ Đề thi hoàn thành: {doc.title}",
                email_content=(
                    f"Đề thi <b>{doc.title}</b> đã được AI sinh câu hỏi xong.<br>"
                    f"Tổng số câu hỏi: <b>{len(doc.questions)}</b>. Sẵn sàng xuất bản!"
                ),
                document_type="AI Exam",
                document_name=exam_name,
                link=get_lms_route("exam-generator"),
            )
        except Exception:
            pass
    except Exception as e:
        logger.error(f"AI Exam Phase 2 Error: {e}", exc_info=True)
        frappe.db.set_value("AI Exam", exam_name, "status", "Failed")
        frappe.db.set_value("AI Exam", exam_name, "error_log", str(e))
        frappe.publish_realtime("ai_exam_update", {"name": exam_name}, room=exam_name)

        # Persistent failure notification
        try:
            from lms.lms.services.hitl.notification import notify_user_direct
            from lms.lms.utils import get_lms_route
            owner = frappe.db.get_value("AI Exam", exam_name, "owner")
            title = frappe.db.get_value("AI Exam", exam_name, "title") or exam_name
            if owner:
                notify_user_direct(
                    for_user=owner,
                    subject=f"❌ Đề thi sinh thất bại: {title}",
                    email_content=(
                        f"Đề thi <b>{title}</b> bị lỗi ở giai đoạn sinh câu hỏi.<br>"
                        f"<b>Lỗi:</b> {str(e)}"
                    ),
                    document_type="AI Exam",
                    document_name=exam_name,
                    link=get_lms_route("exam-generator"),
                )
        except Exception:
            pass
