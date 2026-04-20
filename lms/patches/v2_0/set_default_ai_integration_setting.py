import frappe


def execute():
	frappe.reload_doc("lms", "doctype", "lms_settings")
	settings = frappe.get_doc("LMS Settings")
	settings.ai_integration = 1
	settings.save()
