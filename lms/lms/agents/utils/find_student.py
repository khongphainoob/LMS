import frappe
import json

def find_student_in_session(student_name: str, session_name: str = None):
    """
    Tìm kiếm bản ghi AI Grading Submission dựa trên tên học sinh và phiên chấm.
    """
    filters = []
    if student_name:
        filters.append(["student_name", "like", f"%{student_name}%"])
    
    if session_name:
        filters.append(["session", "=", session_name])
        
    submissions = frappe.get_all(
        "AI Grading Submission",
        filters=filters,
        fields=["name", "student", "student_name", "session", "status", "score", "ai_feedback"]
    )
    
    # Nếu không tìm thấy bằng student_name, thử tìm qua User liên kết
    if not submissions and student_name:
        users = frappe.get_all("User", filters=[["full_name", "like", f"%{student_name}%"]], fields=["name"])
        if users:
            user_names = [u.name for u in users]
            sub_filters = [["student", "in", user_names]]
            if session_name:
                sub_filters.append(["session", "=", session_name])
            submissions = frappe.get_all(
                "AI Grading Submission",
                filters=sub_filters,
                fields=["name", "student", "student_name", "session", "status", "score", "ai_feedback"]
            )

    return submissions

def get_student_details(submission_name):
    """
    Lấy chi tiết đầy đủ của một bài chấm.
    """
    if not frappe.db.exists("AI Grading Submission", submission_name):
        return None
        
    doc = frappe.get_doc("AI Grading Submission", submission_name)
    return doc.as_dict()

if __name__ == "__main__":
    # Hỗ trợ chạy trực tiếp qua bench execute
    # Ví dụ: bench execute lms.lms.services.ai_grading.find_student.find_student_in_session --args '["haha"]'
    pass