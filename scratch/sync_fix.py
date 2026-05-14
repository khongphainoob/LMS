import frappe
from frappe.model.sync import sync_for

def main():
    print("Syncing for app lms...")
    sync_for('lms', force=True)
    frappe.db.commit()
    print("Done.")

if __name__ == "__main__":
    main()
