import frappe

def get_latest_error():
    frappe.connect()
    error = frappe.db.get_value("Error Log", {}, "error", order_by="creation desc")
    print(error)

if __name__ == "__main__":
    get_latest_error()
