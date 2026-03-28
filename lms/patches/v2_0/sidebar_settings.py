import frappe


def execute():
	fields = [
		"courses",
		"batches",
		"certified_participants",
		"jobs",
		"statistics",
		"notifications",
		'grade',
	]

	for field in fields:
		frappe.db.set_single_value("LMS Settings", field, 1)
