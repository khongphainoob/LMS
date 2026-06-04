import frappe
from lms.lms.services.socratic.api import send_socratic_message

@frappe.whitelist()
def test_socratic():
    frappe.set_user("Administrator")
    
    session_id = "k936af94sc"
    message = "Cô ơi em không hiểu tại sao RAG lại quan trọng trong Socratic Tutor ạ?"
    
    print(f"--- TESTING SOCRATIC TUTOR ---")
    print(f"Session: {session_id}")
    print(f"User Message: {message}\n")
    
    # Using the Socratic send_socratic_message
    response = send_socratic_message(message=message, session_key=session_id)
    
    print("\n--- SOCRATIC RESPONSE ---")
    print(response.get("response"))
    
    doc = frappe.get_doc("Socratic Session", session_id)
    print(f"\n--- COST TRACKING ---")
    print(f"Total Session Cost: ${doc.total_cost_usd}")
    
    return "Socratic OK"
