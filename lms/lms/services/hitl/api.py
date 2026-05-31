import frappe
from frappe.utils import now

@frappe.whitelist()
def acknowledge_alert(alert_name):
    """GV xác nhận đã xem."""
    doc = frappe.get_doc("HITL Alert", alert_name)
    doc.status = "Acknowledged"
    doc.save(ignore_permissions=True)
    return doc.status

@frappe.whitelist()
def resolve_alert(alert_name, resolution_note=""):
    """GV đánh dấu đã xử lý xong."""
    doc = frappe.get_doc("HITL Alert", alert_name)
    doc.status = "Resolved"
    doc.resolved_at = now()
    if resolution_note:
        doc.resolution_note = resolution_note
    doc.save(ignore_permissions=True)
    return doc.status

@frappe.whitelist()
def dismiss_alert(alert_name, reason=""):
    """GV bỏ qua alert."""
    doc = frappe.get_doc("HITL Alert", alert_name)
    doc.status = "Dismissed"
    doc.resolved_at = now()
    if reason:
        doc.resolution_note = reason
    doc.save(ignore_permissions=True)
    return doc.status

@frappe.whitelist()
def override_grading_score(submission_name, new_score, feedback=""):
    """GV ghi đè điểm AI và thêm nhận xét."""
    sub = frappe.get_doc("AI Grading Submission", submission_name)
    sub.teacher_override_score = new_score
    sub.teacher_feedback = feedback
    # Triggers on_update hook to resolve alerts and set status = Done
    sub.save(ignore_permissions=True)
    return sub.status

@frappe.whitelist()
def send_teacher_message(session_name, message):
    """GV gửi tin nhắn trực tiếp vào session Chatbot/Socratic của HS."""
    session = frappe.get_doc("Chatbot Session", session_name)
    
    # Tạo Chatbot Message với role teacher
    msg_doc = frappe.get_doc({
        "doctype": "Chatbot Message",
        "session": session.name,
        "role": "teacher",
        "content": message
    })
    msg_doc.insert(ignore_permissions=True)
    
    # Gửi qua realtime để màn hình HS cập nhật ngay
    frappe.publish_realtime(
        "chatbot_message_update",
        {
            "status": "teacher_message",
            "message": message,
            "session_key": session.session_key
        },
        user=session.student
    )
    
    # Đồng thời đẩy vào Redis chat history để AI context builder nhận được
    from lms.lms.services.chatbot.session import save_message_to_history
    save_message_to_history(session.session_key, "teacher", message)
    
    return {"status": "success", "message": "Teacher message sent"}
