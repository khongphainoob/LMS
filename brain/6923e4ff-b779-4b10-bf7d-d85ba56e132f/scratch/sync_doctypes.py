import sys
import os

# Add bench apps to path
bench_path = '/home/huyhoang/frappe-bench'
sys.path.append(os.path.join(bench_path, 'apps/frappe'))
sys.path.append(os.path.join(bench_path, 'apps/lms'))

import frappe

def sync_doctypes():
    frappe.init(site="lms.localhost", sites_path=os.path.join(bench_path, 'sites'))
    frappe.connect()
    
    try:
        print("Syncing Chatbot Session...")
        frappe.reload_doc('lms', 'doctype', 'chatbot_session', force=True)
        print("Syncing Chatbot Message...")
        frappe.reload_doc('lms', 'doctype', 'chatbot_message', force=True)
        frappe.db.commit()
        print("Done!")
    finally:
        frappe.destroy()

if __name__ == "__main__":
    sync_doctypes()
