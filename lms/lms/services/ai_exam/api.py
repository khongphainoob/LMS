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
    exam_format: str = "MOET 2025",
    custom_format_template: str = "",
    section_configs_json: str = "[]",
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
            "exam_format": exam_format,
            "custom_format_template": custom_format_template,
            "section_configs_json": section_configs_json,
            "teacher_instructions": teacher_instructions,
            "source_file": file_url
        })
        doc.insert()
        
        # Enqueue Phase 1 (run the LangGraph workflow)
        frappe.enqueue(
            "lms.lms.agents.exam.orchestrator.run_exam_graph",
            exam_name=doc.name,
            queue="long",
            timeout=1500
        )
        
        return {"success": True, "exam_name": doc.name}
    except Exception as e:
        frappe.log_error(f"Failed to create AI Exam Request: {str(e)}", "AI Exam Creation")
        return {"success": False, "error": "An internal error occurred."}

@frappe.whitelist()
def get_exam_details(exam_name: str):
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        if doc.owner != frappe.session.user and "System Manager" not in frappe.get_roles(frappe.session.user):
            frappe.throw(_("Không có quyền truy cập đề thi này."), frappe.PermissionError)
        return {"success": True, "exam": doc.as_dict(no_default_fields=True)}
    except Exception as e:
        frappe.log_error(f"Failed to get AI Exam Details: {str(e)}", "AI Exam Read")
        return {"success": False, "error": _("Đã xảy ra lỗi khi lấy thông tin đề thi.")}

@frappe.whitelist()
def get_exam_list(start: int = 0, limit: int = 20):
    try:
        exams = frappe.get_list("AI Exam",
            filters={"owner": frappe.session.user},
            fields=["name", "title", "status", "subject", "grade_level", "creation", "total_questions"],
            order_by="creation desc",
            start=start,
            limit=limit
        )
        return {"success": True, "exams": exams}
    except Exception as e:
        return {"success": False, "error": "An internal error occurred."}
        
@frappe.whitelist()
def delete_exam(exam_name: str):
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        if doc.owner != frappe.session.user and "System Manager" not in frappe.get_roles(frappe.session.user):
            frappe.throw(_("Không có quyền xóa đề thi này."), frappe.PermissionError)
        frappe.delete_doc("AI Exam", exam_name)
        return {"success": True}
    except Exception as e:
        frappe.log_error(f"Failed to delete AI Exam: {str(e)}", "AI Exam Delete")
        return {"success": False, "error": _("Đã xảy ra lỗi khi xóa đề thi.")}

@frappe.whitelist()
def export_pdf(exam_name: str):
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        if doc.owner != frappe.session.user and "System Manager" not in frappe.get_roles(frappe.session.user):
            frappe.throw(_("Không có quyền xuất đề thi này."), frappe.PermissionError)
        from lms.lms.services.ai_exam.pdf_generator import generate_pdf
        file_url = generate_pdf(exam_name)
        return {"success": True, "file_url": file_url}
    except Exception as e:
        frappe.log_error(f"PDF Export Error: {str(e)}", "AI Exam Export")
        return {"success": False, "error": _("Đã xảy ra lỗi khi xuất file PDF.")}

@frappe.whitelist()
def export_docx(exam_name: str):
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        if doc.owner != frappe.session.user and "System Manager" not in frappe.get_roles(frappe.session.user):
            frappe.throw(_("Không có quyền xuất đề thi này."), frappe.PermissionError)
        from lms.lms.services.ai_exam.docx_generator import generate_docx
        file_url = generate_docx(exam_name)
        return {"success": True, "file_url": file_url}
    except Exception as e:
        frappe.log_error(f"DOCX Export Error: {str(e)}", "AI Exam Export")
        return {"success": False, "error": _("Đã xảy ra lỗi khi xuất file DOCX.")}


def send_exam_review_reminder_and_auto_approve():
    """
    Scheduled job (every 3 minutes):
    - Gửi Notification nhắc giáo viên duyệt Blueprint (tối đa 3 lần, mỗi lần cách 3 phút).
    - Sau 3 lần nhắc mà vẫn chưa duyệt (tức 9 phút), tự động approve Blueprint.
    """
    now = frappe.utils.now_datetime()
    # 3 phút/lần nhắc x 3 lần = 9 phút -> auto approve
    notify_interval_minutes = 3
    max_notifications = 3
    auto_approve_minutes = notify_interval_minutes * max_notifications  # = 9

    auto_approve_threshold = frappe.utils.add_to_date(now, minutes=-auto_approve_minutes)

    stuck_exams = frappe.get_list("AI Exam",
        filters={"status": "Waiting for Review", "review_started_at": ["is", "set"]},
        fields=["name", "title", "owner_user", "review_started_at", "review_notified"],
    )

    for exam in stuck_exams:
        started_at = exam.review_started_at
        notified = int(exam.review_notified or 0)
        if not started_at:
            continue

        # --- Auto-approve sau 9 phút ---
        if started_at <= auto_approve_threshold:
            frappe.logger().info(f"[AI Exam] Auto-approving {exam.name} after {auto_approve_minutes}-minute timeout.")
            frappe.enqueue(
                "lms.lms.agents.exam.orchestrator.run_exam_graph",
                exam_name=exam.name,
                resume_action="approve",
                queue="long",
                timeout=3000,
            )
            # Gửi thông báo cuối "đã tự approve"
            if exam.owner_user:
                from frappe.desk.doctype.notification_log.notification_log import make_notification_logs
                from lms.lms.utils import get_lms_route
                notification = frappe._dict({
                    "subject": f"✅ Đề thi đã được duyệt tự động: {exam.title}",
                    "email_content": (
                        f"Khung đề thi <b>{exam.title}</b> đã quá thời hạn chờ duyệt ({auto_approve_minutes} phút). "
                        f"Hệ thống đã <b>tự động duyệt</b> và bắt đầu sinh câu hỏi."
                    ),
                    "for_user": exam.owner_user,
                    "from_user": "Administrator",
                    "type": "Alert",
                    "document_type": "AI Exam",
                    "document_name": exam.name,
                    "link": get_lms_route("exam-generator"),
                })
                make_notification_logs(notification, [exam.owner_user])
                frappe.db.commit()
            continue

        # --- Gửi nhắc định kỳ (tối đa 3 lần) ---
        if notified >= max_notifications:
            continue

        next_notify_time = frappe.utils.add_to_date(started_at, minutes=notify_interval_minutes * notified)
        if now >= next_notify_time and exam.owner_user:
            remaining_minutes = auto_approve_minutes - (notify_interval_minutes * (notified + 1))
            frappe.logger().info(f"[AI Exam] Sending reminder #{notified + 1} for {exam.name} to {exam.owner_user}.")
            from frappe.desk.doctype.notification_log.notification_log import make_notification_logs
            from lms.lms.utils import get_lms_route
            notification = frappe._dict({
                "subject": f"📋 Khung đề thi cần duyệt: {exam.title}",
                "email_content": (
                    f"Khung đề thi <b>{exam.title}</b> đang chờ bạn phê duyệt "
                    f"(Lần nhắc thứ {notified + 1}/{max_notifications}).<br><br>"
                    f"Nếu không có phản hồi trong <b>{remaining_minutes} phút</b> nữa, "
                    f"hệ thống sẽ <b>tự động duyệt</b> bản nháp và sinh câu hỏi."
                ),
                "for_user": exam.owner_user,
                "from_user": "Administrator",
                "type": "Alert",
                "document_type": "AI Exam",
                "document_name": exam.name,
                "link": get_lms_route("exam-generator"),
            })
            make_notification_logs(notification, [exam.owner_user])
            frappe.db.set_value("AI Exam", exam.name, "review_notified", notified + 1)
            frappe.db.commit()

@frappe.whitelist()
def retry_exam_generation(exam_name: str):
    try:
        from lms.lms.services.ai_rate_limit import check_and_record_usage
        check_and_record_usage(frappe.session.user, 'Exam Gen', increment=1)
        
        doc = frappe.get_doc("AI Exam", exam_name)
        if doc.owner != frappe.session.user and "System Manager" not in frappe.get_roles(frappe.session.user):
            frappe.throw(_("Không có quyền truy cập đề thi này."), frappe.PermissionError)
            
        if doc.status not in ["Failed", "Draft"]:
            return {"success": False, "error": "Only Failed or Draft exams can be retried."}
            
        # Retry starts from Phase 1
        frappe.enqueue(
            "lms.lms.agents.exam.orchestrator.run_exam_graph",
            exam_name=doc.name,
            queue="long",
            timeout=1500
        )
        
        return {"success": True, "exam_name": doc.name}
    except Exception as e:
        frappe.log_error(f"Failed to retry AI Exam Request: {str(e)}", "AI Exam Creation")
        return {"success": False, "error": "An internal error occurred."}

@frappe.whitelist()
def get_exam_blueprint(exam_name: str):
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        if doc.owner != frappe.session.user and "System Manager" not in frappe.get_roles(frappe.session.user):
            frappe.throw(_("Không có quyền truy cập đề thi này."), frappe.PermissionError)
            
        from lms.lms.agents.exam.orchestrator import load_state_from_file
        state = load_state_from_file(exam_name)
        if not state or not state.get("blueprint"):
            return {"success": False, "error": "Blueprint not found"}
        return {"success": True, "blueprint": state["blueprint"]}
    except Exception as e:
        return {"success": False, "error": "An internal error occurred."}

@frappe.whitelist()
def regenerate_blueprint(exam_name: str, feedback: str):
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        if doc.owner != frappe.session.user and "System Manager" not in frappe.get_roles(frappe.session.user):
            frappe.throw(_("Không có quyền truy cập đề thi này."), frappe.PermissionError)
            
        from lms.lms.agents.exam.orchestrator import load_state_from_file
        state_values = load_state_from_file(exam_name)
        regenerate_count = state_values.get("regenerate_count", 0) if state_values else 0
        if regenerate_count >= 3:
            frappe.throw(frappe._("Bạn đã đạt giới hạn điều chỉnh đề thi tối đa 3 lần. Vui lòng duyệt bản thiết kế hiện tại."))

        frappe.enqueue(
            "lms.lms.agents.exam.orchestrator.run_exam_graph",
            exam_name=exam_name,
            resume_action=feedback,
            queue="long",
            timeout=1500
        )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": "An internal error occurred."}

@frappe.whitelist()
def approve_blueprint(exam_name: str, modified_blueprint: str = None):
    try:
        doc = frappe.get_doc("AI Exam", exam_name)
        if doc.owner != frappe.session.user and "System Manager" not in frappe.get_roles(frappe.session.user):
            frappe.throw(_("Không có quyền truy cập đề thi này."), frappe.PermissionError)
            
        frappe.enqueue(
            "lms.lms.agents.exam.orchestrator.run_exam_graph",
            exam_name=exam_name,
            resume_action="approve",
            modified_blueprint=modified_blueprint,
            queue="long",
            timeout=3000
        )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": "An internal error occurred."}

