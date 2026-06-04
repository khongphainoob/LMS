import frappe
from lms.lms.services.ai_quiz.api import retry_quiz

@frappe.whitelist()
def test_quiz():
    frappe.set_user("Administrator")
    
    quiz_id = "5p4be9jt9g"
    
    print(f"--- TESTING AI QUIZ GENERATOR ---")
    print(f"Retrying quiz generation for Quiz ID: {quiz_id}")
    
    # Needs status to be "Failed" to retry_quiz. Let's force it to Failed first so we can test.
    frappe.db.set_value("AI Quiz", quiz_id, "status", "Failed")
    frappe.db.commit()
    
    retry_quiz(quiz_id)
    
    print("Quiz generation task has been re-triggered.")
    
    doc = frappe.get_doc("AI Quiz", quiz_id)
    print(f"Quiz Topic: {doc.title}")
    print(f"Current Status: {doc.status}")
    
    return "Quiz Triggered"
