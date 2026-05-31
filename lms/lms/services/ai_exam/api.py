import frappe
import json
from frappe import _

@frappe.whitelist()
def create_exam_request(
    title: str,
    subject: str,
    grade_level: str,
    curriculum: str,
    exam_type: str,
    duration_minutes: int,
    difficulty_distribution: str,
    language: str,
    teacher_instructions: str = "",
    file_url: str = None
):
    try:
        from lms.lms.services.ai_rate_limit import check_and_record_usage
        check_and_record_usage(frappe.session.user, 'Exam Gen', increment=1)
        
        # Create draft exam doc
        doc = frappe.get_doc({
            "doctype": "AI Exam",
            "title": title,
            "status": "Draft",
            "subject": subject,
            "grade_level": grade_level,
            "curriculum": curriculum,
            "exam_type": exam_type,
            "duration_minutes": duration_minutes,
            "difficulty_distribution": difficulty_distribution,
            "language": language,
            "teacher_instructions": teacher_instructions,
            "source_file": file_url
        })
        doc.insert()
        
        # Enqueue Phase 1
        frappe.enqueue(
            "lms.lms.agents.exam.orchestrator.process_phase_1",
            exam_name=doc.name,
            queue="long",
            timeout=1500
        )
        
        return {"success": True, "exam_name": doc.name}
    except Exception as e:
        frappe.log_error(f"Failed to create AI Exam Request: {str(e)}", "AI Exam Creation")
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_exam_details(exam_name: str):
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        return {"success": True, "exam": doc.as_dict()}
    except Exception as e:
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_exam_list(start: int = 0, limit: int = 20):
    try:
        exams = frappe.get_all(
            "AI Exam",
            fields=["name", "title", "status", "subject", "grade_level", "creation", "total_questions"],
            order_by="creation desc",
            start=start,
            limit=limit
        )
        return {"success": True, "exams": exams}
    except Exception as e:
        return {"success": False, "error": str(e)}
        
@frappe.whitelist()
def delete_exam(exam_name: str):
    try:
        frappe.delete_doc("AI Exam", exam_name)
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def export_pdf(exam_name: str):
    try:
        from lms.lms.services.ai_exam.pdf_generator import generate_pdf
        file_url = generate_pdf(exam_name)
        return {"success": True, "file_url": file_url}
    except Exception as e:
        frappe.log_error(f"PDF Export Error: {str(e)}", "AI Exam Export")
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def export_docx(exam_name: str):
    try:
        from lms.lms.services.ai_exam.docx_generator import generate_docx
        file_url = generate_docx(exam_name)
        return {"success": True, "file_url": file_url}
    except Exception as e:
        frappe.log_error(f"DOCX Export Error: {str(e)}", "AI Exam Export")
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def retry_exam_generation(exam_name: str):
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        if doc.status not in ["Failed", "Draft"]:
            return {"success": False, "error": "Only Failed or Draft exams can be retried."}
            
        # Retry starts from Phase 1
        frappe.enqueue(
            "lms.lms.agents.exam.orchestrator.process_phase_1",
            exam_name=doc.name,
            queue="long",
            timeout=1500
        )
        
        return {"success": True, "exam_name": doc.name}
    except Exception as e:
        frappe.log_error(f"Failed to retry AI Exam Request: {str(e)}", "AI Exam Creation")
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_exam_blueprint(exam_name: str):
    try:
        from lms.lms.agents.exam.orchestrator import load_state_from_file
        state = load_state_from_file(exam_name)
        if not state or not state.get("blueprint"):
            return {"success": False, "error": "Blueprint not found"}
        return {"success": True, "blueprint": state["blueprint"]}
    except Exception as e:
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def regenerate_blueprint(exam_name: str, feedback: str):
    try:
        frappe.enqueue(
            "lms.lms.agents.exam.orchestrator.process_phase_1_5_regenerate",
            exam_name=exam_name,
            feedback=feedback,
            queue="long",
            timeout=1500
        )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def approve_blueprint(exam_name: str):
    try:
        frappe.enqueue(
            "lms.lms.agents.exam.orchestrator.process_phase_2",
            exam_name=exam_name,
            queue="long",
            timeout=3000
        )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def export_docx(exam_name: str):
    try:
        from lms.lms.services.ai_exam.docx_generator import generate_docx
        file_url = generate_docx(exam_name)
        return {"success": True, "file_url": file_url}
    except Exception as e:
        return {"success": False, "error": str(e)}
