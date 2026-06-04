import frappe
from frappe import _

@frappe.whitelist()
def get_user_badges(member=None):
	if member and member != frappe.session.user:
		user_roles = frappe.get_roles(frappe.session.user)
		if not ("System Manager" in user_roles or "Course Creator" in user_roles or "Instructor" in user_roles or "Moderator" in user_roles):
			frappe.throw(_("Not permitted to view other users' badges"), frappe.PermissionError)

	if not member:
		member = frappe.session.user

	badges = frappe.get_all(
		"LMS Badge",
		{"enabled": 1},
		["name", "title", "image", "description"],
	)

	earned = frappe.get_all(
		"LMS Badge Assignment",
		{"member": member},
		["badge", "issued_on"],
	)

	earned_map = {e.badge: e.issued_on for e in earned}

	return [
		{
			"name": b.name,
			"title": b.title,
			"image": b.image,
			"description": b.description,
			"earned": b.name in earned_map,
			"issued_on": str(earned_map[b.name]) if b.name in earned_map else None,
		}
		for b in badges
	]
