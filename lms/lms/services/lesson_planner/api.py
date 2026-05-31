import os
import json
import logging
import frappe
from frappe.utils.file_manager import save_file
from lms.lms.agents.lesson_planner.graph import build_lesson_planner_graph

logger = logging.getLogger(__name__)

def extract_text_from_file(file_url):
    """
    Robust utility to extract plain text from TXT, DOCX, and PDF uploads in Frappe.
    """
    if not file_url:
        return ""
    try:
        # Resolve path
        if file_url.startswith("/files/"):
            file_path = frappe.get_site_path("public", file_url.strip("/"))
        elif file_url.startswith("/private/files/"):
            file_path = frappe.get_site_path("private", file_url.replace("/private/", ""))
        else:
            file_name = file_url.split("/")[-1]
            file_path = frappe.get_site_path("public", "files", file_name)
            
        if not os.path.exists(file_path):
            # Fallback to local private folder search
            private_path = frappe.get_site_path("private", "files", file_url.split("/")[-1])
            if os.path.exists(private_path):
                file_path = private_path
            else:
                return ""
            
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        elif ext == ".docx":
            from docx import Document
            doc = Document(file_path)
            return "\n".join([p.text for p in doc.paragraphs])
        elif ext == ".pdf":
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
    except Exception as e:
        logger.error(f"Error extracting text from file {file_url}: {e}", exc_info=True)
    return ""

def run_lesson_planner_orchestrator(plan_name, resume_payload=None):
    """
    Background worker orchestrator. Builds the LangGraph state and runs/resumes the flow.
    """
    try:
        plan_doc = frappe.get_doc("AI Lesson Plan", plan_name)
        
        # Load thread config
        thread_id = plan_doc.thread_id or f"thread_{frappe.generate_hash(length=8)}"
        if not plan_doc.thread_id:
            frappe.db.set_value("AI Lesson Plan", plan_name, "thread_id", thread_id)
            frappe.db.commit()
            
        # Compile graph
        graph = build_lesson_planner_graph()
        
        from lms.lms.services.observability import get_unified_config_dict, flush_langfuse
        config = get_unified_config_dict(agent_name="lesson_planner", session_id=plan_name, tags=["LessonPlanner", "Async"])
        config["configurable"] = {"thread_id": thread_id}
        
        # 1. Check if we are resuming an active HITL review checkpoint
        if resume_payload:
            from langgraph.types import Command
            
            # Update status in DocType before resume
            status_update = "Illustrating" if resume_payload.get("action") == "approve" else "Writing"
            frappe.db.set_value("AI Lesson Plan", plan_name, {
                "status": status_update,
                "review_feedback": resume_payload.get("feedback")
            })
            frappe.db.commit()
            
            # Send the resume command to the paused graph
            final_state = graph.invoke(Command(resume=resume_payload), config)
            flush_langfuse()
                
            if final_state:
                frappe.db.set_value("AI Lesson Plan", plan_name, {
                    "tokens_used": final_state.get("tokens_used", 0),
                    "input_tokens": final_state.get("input_tokens", 0),
                    "output_tokens": final_state.get("output_tokens", 0),
                    "total_cost_usd": final_state.get("total_cost_usd", 0.0)
                })
                frappe.db.commit()
            return
            
        # 2. Otherwise, start a fresh run or retry
        # Extract source text if uploaded
        reference_text = ""
        if plan_doc.reference_file:
            reference_text = extract_text_from_file(plan_doc.reference_file)
            
        current_state = graph.get_state(config)
        is_retry = bool(current_state and current_state.next)
        
        if not is_retry:
            # Update DocType status for fresh runs
            frappe.db.set_value("AI Lesson Plan", plan_name, "status", "Retrieving")
            frappe.db.commit()
            
            # Initial State
            initial_state = {
                "thread_id": thread_id,
                "plan_doc_name": plan_name,
                "teacher": plan_doc.teacher or frappe.session.user,
                "subject": plan_doc.subject,
                "grade_level": plan_doc.grade_level,
                "topic": plan_doc.topic,
                "duration_minutes": plan_doc.duration_minutes or 45,
                "reference_content": reference_text,
                "custom_requirements": plan_doc.custom_requirements,
                "output_format": plan_doc.output_format or "lms_native",
                "template_style": plan_doc.template_style or "cv5512",
                "target_course": plan_doc.target_course,
                "status": "Draft",
                "diagrams": [],
                "tokens_used": plan_doc.get("tokens_used", 0),
                "input_tokens": plan_doc.get("input_tokens", 0),
                "output_tokens": plan_doc.get("output_tokens", 0),
                "total_cost_usd": plan_doc.get("total_cost_usd", 0.0)
            }
            final_state = graph.invoke(initial_state, config)
        else:
            # Update DocType status based on next node
            next_node = current_state.next[0] if current_state.next else "Processing"
            if next_node == "human_review":
                frappe.db.set_value("AI Lesson Plan", plan_name, "status", "Review")
            else:
                frappe.db.set_value("AI Lesson Plan", plan_name, "status", "Retrieving")
            frappe.db.commit()
            
            # Retry by resuming from last checkpoint
            final_state = graph.invoke(None, config)
            
        flush_langfuse()
        
        if final_state:
            frappe.db.set_value("AI Lesson Plan", plan_name, {
                "tokens_used": final_state.get("tokens_used", 0),
                "input_tokens": final_state.get("input_tokens", 0),
                "output_tokens": final_state.get("output_tokens", 0),
                "total_cost_usd": final_state.get("total_cost_usd", 0.0)
            })
            frappe.db.commit()
        
    except Exception as e:
        logger.error(f"Orchestrator failed for plan {plan_name}: {e}", exc_info=True)
        frappe.db.set_value("AI Lesson Plan", plan_name, {
            "status": "Failed",
            "review_feedback": f"Lỗi hệ thống: {str(e)}"
        })
        frappe.db.commit()

@frappe.whitelist()
def create_lesson_plan(topic, subject, grade_level=None, duration_minutes=45, reference_file=None, custom_requirements=None, output_format="lms_native", template_style="cv5512", target_course=None):
    """
    Whitelisted API endpoint to initiate a new lesson planning request.
    """
    teacher = frappe.session.user
    from lms.lms.services.ai_rate_limit import check_and_record_usage
    check_and_record_usage(teacher, "Lesson Plan", increment=1)
    
    plan_doc = frappe.get_doc({
        "doctype": "AI Lesson Plan",
        "topic": topic,
        "subject": subject,
        "grade_level": grade_level,
        "duration_minutes": int(duration_minutes),
        "teacher": teacher,
        "reference_file": reference_file,
        "custom_requirements": custom_requirements,
        "output_format": output_format,
        "template_style": template_style,
        "target_course": target_course,
        "status": "Draft"
    })
    plan_doc.insert(ignore_permissions=True)
    frappe.db.commit()
    
    # Enqueue background execution to keep request cycle fast
    frappe.enqueue(
        run_lesson_planner_orchestrator,
        plan_name=plan_doc.name,
        queue="long",
        timeout=600
    )
    
    return {"name": plan_doc.name, "status": "Draft"}

@frappe.whitelist()
def resume_lesson_plan(plan_name, action, edited_content=None, feedback=None):
    """
    Whitelisted API endpoint to resume a paused graph run after teacher review (HITL).
    """
    plan_doc = frappe.get_doc("AI Lesson Plan", plan_name)
    
    if plan_doc.status not in ["Review", "Draft"]:
        return {"status": "error", "message": "Bài giảng không ở trạng thái chờ duyệt hoặc đã được duyệt rồi."}
    
    payload = {
        "action": action, # "approve" or "edit"
        "edited_content": edited_content or plan_doc.review_draft,
        "feedback": feedback
    }
    
    # Update reviewer timestamps and status synchronously
    status_update = "Illustrating" if action == "approve" else "Writing"
    frappe.db.set_value("AI Lesson Plan", plan_name, {
        "reviewed_at": frappe.utils.now_datetime(),
        "reviewed_by": frappe.session.user,
        "status": status_update
    })
    frappe.db.commit()
    
    # Enqueue resumption in the background
    frappe.enqueue(
        run_lesson_planner_orchestrator,
        plan_name=plan_name,
        resume_payload=payload,
        queue="long",
        timeout=600
    )
    
    return {"status": "success", "message": "Tiến trình đang được tiếp tục xử lý..."}

@frappe.whitelist()
def retry_lesson_plan(plan_name):
    """
    Retries a failed lesson plan by re-running the orchestrator with the same thread_id.
    LangGraph will automatically resume from the last successful checkpoint.
    """
    plan_doc = frappe.get_doc("AI Lesson Plan", plan_name)
    if plan_doc.status != "Failed":
        frappe.throw("Chỉ có thể thử lại các tiến trình đã thất bại.")
        
    frappe.enqueue(
        "lms.lms.services.lesson_planner.api.run_lesson_planner_orchestrator",
        queue="long",
        timeout=3600,
        plan_name=plan_name
    )
    return True

@frappe.whitelist()
def get_lesson_plan_status(plan_name):
    """
    Whitelisted API endpoint to fetch the current live status of a lesson plan.
    """
    try:
        plan = frappe.get_doc("AI Lesson Plan", plan_name)
        return {
            "name": plan.name,
            "status": plan.status,
            "review_draft": plan.review_draft,
            "generated_content": plan.generated_content,
            "generated_file": plan.generated_file,
            "linked_lesson": plan.linked_lesson,
            "standards": plan.curriculum_standards_matched
        }
    except Exception:
        return {"error": "Plan not found"}

@frappe.whitelist()
def get_planner_stats():
    """
    Whitelisted API endpoint to return analytical dashboard counters.
    """
    total = frappe.db.count("AI Lesson Plan")
    completed = frappe.db.count("AI Lesson Plan", {"status": "Completed"})
    review = frappe.db.count("AI Lesson Plan", {"status": "Review"})
    
    # Simple metric: 1 lesson plan saves ~2.5 hours of manual work
    hours_saved = int(completed * 2.5)
    
    return {
        "total": total,
        "completed": completed,
        "review_pending": review,
        "hours_saved": f"{hours_saved}h"
    }

@frappe.whitelist()
def upload_reference_file():
    """
    Handles secure custom uploads for the Lesson Planner reference files.
    """
    try:
        from lms.lms.services.ai_rate_limit import check_and_record_usage
        check_and_record_usage(frappe.session.user, "Document Upload", increment=1)

        if "file" not in frappe.request.files:
            if not frappe.request.files:
                frappe.throw("Không tìm thấy file tải lên.")
            file = list(frappe.request.files.values())[0]
        else:
            file = frappe.request.files["file"]
            
        allowed_extensions = {'.pdf', '.docx', '.txt'}
        file_name = file.filename or "reference_document"
        ext = os.path.splitext(file_name)[1].lower()
        
        if ext not in allowed_extensions:
            frappe.throw(f"Định dạng file {ext} không được hỗ trợ. Chỉ nhận PDF, DOCX, TXT.")
            
        MAX_SIZE = 20 * 1024 * 1024 # 20MB
        content = file.read()
        if len(content) > MAX_SIZE:
            frappe.throw("Dung lượng file vượt quá giới hạn 20MB.")
            
        file_doc = frappe.get_doc({
            "doctype": "File",
            "file_name": file_name,
            "content": content,
            "is_private": 0,
            "folder": "Home/Attachments"
        })
        file_doc.insert(ignore_permissions=True)
        frappe.db.commit()
        
        return {
            "file_url": file_doc.file_url,
            "file_name": file_doc.file_name
        }
    except Exception as e:
        if not isinstance(e, frappe.ValidationError):
            frappe.log_error(frappe.get_traceback(), "Lesson Planner Upload Error")
        raise e
