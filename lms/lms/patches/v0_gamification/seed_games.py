import frappe

def execute():
	games = [
		{
			"doctype": "LMS Game",
			"title": "Memory Match",
			"game_type": "memory_match",
			"description": "Flip cards and match pairs to test your memory",
			"is_active": 1,
			"max_score": 500,
			"max_daily_attempts": 20
		},
		{
			"doctype": "LMS Game",
			"title": "Timed Quiz",
			"game_type": "timed_quiz",
			"description": "Answer questions before time runs out",
			"is_active": 1,
			"max_score": 800,
			"max_daily_attempts": 15
		},
		{
			"doctype": "LMS Game",
			"title": "Spin the Wheel",
			"game_type": "spin_wheel",
			"description": "Spin and collect points with luck",
			"is_active": 1,
			"max_score": 500,
			"max_daily_attempts": 10
		},
		{
			"doctype": "LMS Game",
			"title": "Word Scramble",
			"game_type": "word_scramble",
			"description": "Unscramble letters to find the hidden word",
			"is_active": 1,
			"max_score": 300,
			"max_daily_attempts": 20
		},
		{
			"doctype": "LMS Game",
			"title": "Drag & Drop",
			"game_type": "drag_drop",
			"description": "Sort items in the correct order",
			"is_active": 1,
			"max_score": 500,
			"max_daily_attempts": 15
		}
	]

	for game in games:
		if not frappe.db.exists("LMS Game", {"game_type": game["game_type"]}):
			doc = frappe.get_doc(game)
			doc.insert(ignore_permissions=True)
	
	print("Seeded 5 games into LMS Game DocType.")
