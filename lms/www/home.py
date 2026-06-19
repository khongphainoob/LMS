import frappe

no_cache = 1

def get_context(context):
    context.no_cache = 1
    context.show_sidebar = False
    context.app_logo = frappe.db.get_single_value("Website Settings", "app_logo")
