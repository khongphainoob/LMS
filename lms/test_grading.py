import frappe
from lms.lms.services.ai_grading.api import start_batch_ai_grading

@frappe.whitelist()
def test_grading():
    frappe.set_user("Administrator")
    
    session_id = "7dfksovvnf"
    
    print(f"--- TESTING AI GRADING SYSTEM ---")
    print(f"Triggering evaluation for Grading Session ID: {session_id}")
    
    try:
        start_batch_ai_grading(session_id)
        print("Grading session task has been triggered.")
    except Exception as e:
        print(f"Trigger failed or already running: {e}")
    
    doc = frappe.get_doc("AI Grading Session", session_id)
    print(f"Current Status: {doc.status}")
    print(f"Total Cost So Far: ${doc.get('total_cost_usd', 0)}")
    
    return "Grading Triggered"
