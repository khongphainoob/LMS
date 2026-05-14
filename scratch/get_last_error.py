import frappe

def get_last_error():
    frappe.connect()
    errors = frappe.get_all("Error Log", 
                           filters={"method": "Chatbot API Error"}, 
                           fields=["error"], 
                           order_by="creation desc", 
                           limit=1)
    if errors:
        print(errors[0].error)
    else:
        print("No errors found.")

if __name__ == "__main__":
    get_last_error()
