import frappe
from frappe.desk.doctype.notification_log.notification_log import make_notification_logs

def notify_teacher(
    event_type: str,
    student: str,
    course: str,
    reference_doctype: str,
    reference_name: str,
    reason: str,
    priority: str = "Medium"
):
    """
    Gửi thông báo HITL cho Giáo viên.
    1. Tạo HITL Alert
    2. Tạo Notification Log (hiện trên /lms/notifications + bell icon)
    3. Publish Realtime hitl_alert popup
    4. Gửi Email (nếu High priority)
    """
    # 1. Tìm GV phụ trách
    if course:
        users_with_role = frappe.get_all("Has Role", filters={"role": ["in", ["Instructor", "Course Creator"]], "parenttype": "User"}, fields=["parent"])
        instructors = [u.parent for u in users_with_role]
    else:
        users_with_role = frappe.get_all("Has Role", filters={"role": "System Manager", "parenttype": "User"}, fields=["parent"])
        instructors = [u.parent for u in users_with_role]

    # Lấy tên học sinh
    student_name = frappe.db.get_value("User", student, "full_name") or student

    # 2. Tạo HITL Alert
    alert = frappe.get_doc({
        "doctype": "HITL Alert",
        "alert_type": event_type,
        "student": student,
        "course": course,
        "reference_doctype": reference_doctype,
        "reference_name": reference_name,
        "reason": reason,
        "priority": priority,
        "status": "Open"
    })
    alert.insert(ignore_permissions=True)

    subject = f"[{priority}] 🚩 AI Grading Flagged: {student_name}"
    email_content = (
        f"Học sinh <b>{student_name}</b> cần giáo viên xem xét.<br>"
        f"<b>Lý do:</b> {reason}"
    )

    from lms.lms.utils import get_lms_route
    grading_link = get_lms_route("ai-grading")

    # 3. Tạo Notification Log đúng chuẩn → hiện trên /lms/notifications + bell
    # Frappe's make_notification_logs expects emails, not user IDs (important for Administrator)
    instructor_emails = frappe.db.get_values("User", {"name": ("in", instructors)}, "email", pluck=True)
    
    notification = frappe._dict({
        "subject": subject,
        "email_content": email_content,
        "from_user": student,
        "type": "Alert",
        "document_type": "HITL Alert",
        "document_name": alert.name,
        "link": grading_link,
    })
    make_notification_logs(notification, instructor_emails)

    # Realtime popup riêng cho HITL dashboard (giữ lại tương thích ngược)
    for instructor in instructors:
        frappe.publish_realtime(
            "hitl_alert",
            {"alert_name": alert.name, "message": subject, "priority": priority},
            user=instructor
        )

        # 4. Gửi email nếu High Priority
        if priority == "High":
            email_msg = (
                f"<p>Xin chào,</p>"
                f"<p>Hệ thống AI vừa gắn cờ một bài cần bạn can thiệp.</p>"
                f"<p><b>Học sinh:</b> {student_name}</p>"
                f"<p><b>Lý do:</b> {reason}</p>"
                f"<p><a href='{grading_link}'>Xem chi tiết tại đây</a></p>"
            )
            try:
                frappe.sendmail(
                    recipients=[instructor],
                    subject=subject,
                    message=email_msg
                )
            except Exception as e:
                frappe.log_error(f"Failed to send HITL email to {instructor}: {str(e)}", "HITL Email Error")


def notify_user_direct(
    for_user: str,
    subject: str,
    email_content: str,
    document_type: str = "",
    document_name: str = "",
    link: str = "",
    from_user: str = "Administrator",
):
    """
    Helper dùng chung: bắn notification chuẩn LMS cho bất kỳ user nào.
    Dùng cho Rubric Builder Done/Failed, Grading batch completed, v.v.
    """
    # Frappe's make_notification_logs expects emails, not user IDs (important for Administrator)
    user_email = frappe.db.get_value("User", for_user, "email")
    if not user_email:
        return

    notification = frappe._dict({
        "subject": subject,
        "email_content": email_content,
        "from_user": from_user,
        "type": "Alert",
        "document_type": document_type,
        "document_name": document_name,
        "link": link,
    })
    make_notification_logs(notification, [user_email])
