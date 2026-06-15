import frappe
from lms.lms.services.lesson_planner.api import create_lesson_plan

@frappe.whitelist()
def test_lesson():
    frappe.set_user("Administrator")
    
    topic = "An ninh thông tin căn bản"
    
    print(f"--- TESTING AI LESSON PLANNER ---")
    print(f"Generating new lesson plan for topic: {topic}")
    
    create_lesson_plan(topic=topic, subject="Computer Science", grade_level="Đại học", duration_minutes=45)
    
    print("Lesson plan generation task has been triggered.")
    
    # Check if a draft was created or task enqueued
    plans = frappe.get_all("LMS Lesson Plan", filters={"title": topic}, fields=["name", "status"], order_by="creation desc", limit=1)
    if plans:
        print(f"Lesson Plan Status: {plans[0].status}")
    else:
        print("Waiting for background task to create it...")
    
    return "Lesson Plan Triggered"
