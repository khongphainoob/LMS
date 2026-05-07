import frappe


def execute():
	for doctype in [
		"LMS Game",
		"LMS Class Game",
		"LMS Game Session",
		"LMS Game Progress",
		"LMS Gamification Question Bank",
		"LMS Assessment Assignment",
	]:
		frappe.reload_doc("lms", "doctype", doctype.lower().replace(" ", "_"))
