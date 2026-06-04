import frappe
from lms.lms.services.chatbot.api import send_message

@frappe.whitelist()
def test_chat():
    frappe.set_user("Administrator")
    
    session_id = "8brno1p3vp"
    message = "Hãy tóm tắt lại nội dung bạn vừa nói."
    
    print(f"--- TESTING CHATBOT ---")
    print(f"Session: {session_id}")
    print(f"User Message: {message}\n")
    
    response = send_message(session_id=session_id, message=message)
    
    print("\n--- CHATBOT RESPONSE ---")
    print(response.get("content"))
    
    # Check cost
    doc = frappe.get_doc("Chatbot Session", session_id)
    print(f"\n--- COST TRACKING ---")
    print(f"Total Session Cost: ${doc.total_cost_usd}")
    
    return "Chatbot OK"
