import frappe

def execute():
	frappe.reload_doc("lms", "doctype", "lms_settings")
	settings = frappe.get_doc("LMS Settings")
	settings.ai_grading = 1
	settings.grading_book = 1
	settings.save()
