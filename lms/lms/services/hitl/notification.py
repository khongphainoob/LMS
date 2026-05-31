import frappe

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
    2. Tạo Notification Log
    3. Publish Realtime
    4. Gửi Email (nếu High priority)
    """
    # 1. Tìm GV phụ trách (Course Creator hoặc Instructor có quyền ghi vào khóa học)
    instructors = []
    if course:
        # Trong Frappe LMS, tìm các user có role Instructor hoặc Course Creator
        # Đây là cách query đơn giản
        users_with_role = frappe.get_all("Has Role", filters={"role": ["in", ["Instructor", "Course Creator"]], "parenttype": "User"}, fields=["parent"])
        instructors = [u.parent for u in users_with_role]
    else:
        # Fallback to system managers if no course
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
    
    # 3. Tạo Notification Log và Realtime cho từng GV
    subject = f"[{priority}] AI Alert: {student_name} needs attention"
    message = f"Lý do: {reason}"
    
    for instructor in instructors:
        # Create standard frappe notification (the bell icon)
        notification = frappe.new_doc("Notification Log")
        notification.for_user = instructor
        notification.from_user = student
        notification.subject = subject
        notification.document_type = "HITL Alert"
        notification.document_name = alert.name
        notification.insert(ignore_permissions=True)
        
        # Realtime popup
        frappe.publish_realtime(
            "hitl_alert",
            {"alert_name": alert.name, "message": subject, "priority": priority},
            user=instructor
        )
        
        # 4. Gửi email nếu High Priority
        if priority == "High":
            # Xây dựng link
            link = f"/app/hitl-alert/{alert.name}"
            email_msg = f"<p>Xin chào,</p><p>Hệ thống AI vừa gắn cờ một sự kiện cần bạn can thiệp khẩn cấp.</p><p><b>Học sinh:</b> {student_name}</p><p><b>Lý do:</b> {reason}</p><p><a href='{link}'>Click vào đây để xem chi tiết</a></p>"
            
            try:
                frappe.sendmail(
                    recipients=[instructor],
                    subject=subject,
                    message=email_msg
                )
            except Exception as e:
                frappe.log_error(f"Failed to send HITL email to {instructor}: {str(e)}", "HITL Email Error")
