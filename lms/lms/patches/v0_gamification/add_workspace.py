import frappe

def execute():
	workspace_name = "Gamification"
	if not frappe.db.exists("Workspace", workspace_name):
		doc = frappe.get_doc({
			"doctype": "Workspace",
			"name": workspace_name,
			"title": "Gamification",
			"icon": "gamepad",
			"module": "LMS",
			"category": "Modules",
			"is_standard": 1,
			"roles": [
				{"role": "System Manager"},
				{"role": "Moderator"},
				{"role": "Course Creator"}
			],
			"content": '''[
				{
					"id": "gamification_games",
					"type": "header",
					"data": {
						"text": "Games & Mechanics",
						"level": 4
					}
				},
				{
					"id": "games_links",
					"type": "shortcut",
					"data": {
						"shortcut_name": "LMS Game",
						"col": 4
					}
				},
				{
					"id": "class_games_links",
					"type": "shortcut",
					"data": {
						"shortcut_name": "LMS Class Game",
						"col": 4
					}
				},
				{
					"id": "question_bank",
					"type": "shortcut",
					"data": {
						"shortcut_name": "LMS Gamification Question Bank",
						"col": 4
					}
				},
				{
					"id": "gamification_progression",
					"type": "header",
					"data": {
						"text": "Progression & Rewards",
						"level": 4
					}
				},
				{
					"id": "badges_links",
					"type": "shortcut",
					"data": {
						"shortcut_name": "LMS Badge",
						"col": 4
					}
				},
				{
					"id": "badge_assignments",
					"type": "shortcut",
					"data": {
						"shortcut_name": "LMS Badge Assignment",
						"col": 4
					}
				},
				{
					"id": "leaderboard",
					"type": "shortcut",
					"data": {
						"shortcut_name": "LMS Game Leaderboard Entry",
						"col": 4
					}
				},
				{
					"id": "sessions",
					"type": "shortcut",
					"data": {
						"shortcut_name": "LMS Game Session",
						"col": 4
					}
				}
			]'''
		})
		doc.insert(ignore_permissions=True)
		print("Created Gamification Workspace")
	else:
		print("Gamification Workspace already exists")

	# We also need to create the Workspace Shortcuts for the above blocks
	shortcuts = [
		{"name": "LMS Game", "type": "DocType", "link_to": "LMS Game"},
		{"name": "LMS Class Game", "type": "DocType", "link_to": "LMS Class Game"},
		{"name": "LMS Gamification Question Bank", "type": "DocType", "link_to": "LMS Gamification Question Bank"},
		{"name": "LMS Badge", "type": "DocType", "link_to": "LMS Badge"},
		{"name": "LMS Badge Assignment", "type": "DocType", "link_to": "LMS Badge Assignment"},
		{"name": "LMS Game Leaderboard Entry", "type": "DocType", "link_to": "LMS Game Leaderboard Entry"},
		{"name": "LMS Game Session", "type": "DocType", "link_to": "LMS Game Session"}
	]

	for sc in shortcuts:
		if not frappe.db.exists("Workspace Shortcut", sc["name"]):
			try:
				frappe.get_doc({
					"doctype": "Workspace Shortcut",
					"label": sc["name"],
					"type": sc["type"],
					"link_to": sc["link_to"],
					"color": "Grey"
				}).insert(ignore_permissions=True)
			except Exception as e:
				pass
	
	frappe.db.commit()
