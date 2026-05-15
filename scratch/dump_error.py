import frappe
import os

def dump_error():
    frappe.connect()
    error = frappe.db.get_value("Error Log", {"method": "Chatbot API Error"}, "error", order_by="creation desc")
    with open("chatbot_error_dump.txt", "w") as f:
        if error:
            f.write(error)
        else:
            f.write("No error found in Error Log for 'Chatbot API Error'")

if __name__ == "__main__":
    dump_error()
