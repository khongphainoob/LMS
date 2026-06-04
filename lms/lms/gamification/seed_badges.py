import frappe

def execute():
	descriptions = {
		"Champion": "Awarded for achieving Rank 1 on any game leaderboard.",
		"Podium Finisher": "Awarded for finishing in the Top 3 of any game leaderboard.",
		"Top 10": "Awarded for reaching the Top 10 on any game leaderboard.",
		"7-Day Streak": "Awarded for maintaining a 7-day study streak.",
		"Unstoppable": "Awarded for maintaining a 30-day study streak.",
		"Scholar": "Awarded for completing 5 or more courses.",
		"First Step": "Awarded for completing your first course."
	}
	
	count = 0
	for title, desc in descriptions.items():
		if not frappe.db.exists("LMS Badge", title):
			try:
				badge_doc = frappe.get_doc({
					"doctype": "LMS Badge",
					"title": title,
					"description": desc,
					"image": "/assets/lms/images/badge.png",
					"reference_doctype": "LMS Enrollment",
					"event": "New",
					"user_field": "member",
					"enabled": 1,
					"grant_only_once": 1
				})
				badge_doc.insert(ignore_permissions=True)
				count += 1
			except Exception as e:
				print(f"Failed to insert {title}: {str(e)}")
	
	frappe.db.commit()
	print(f"Successfully seeded {count} new badges!")
