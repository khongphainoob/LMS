import frappe


def create_default_games():
	games = [
		{"title": "Memory Match", "game_type": "memory_match", "scoring_model": "best", "max_score": 500},
		{"title": "Timed Quiz", "game_type": "timed_quiz", "scoring_model": "best", "max_score": 800},
		{"title": "Spin the Wheel", "game_type": "spin_wheel", "scoring_model": "sum", "max_score": 500},
		{"title": "Word Scramble", "game_type": "word_scramble", "scoring_model": "best", "max_score": 300},
		{"title": "Drag & Drop Sort", "game_type": "drag_drop", "scoring_model": "best", "max_score": 500},
	]
	for game in games:
		if not frappe.db.exists("LMS Game", game["title"]):
			doc = frappe.new_doc("LMS Game")
			doc.update(game)
			doc.insert(ignore_permissions=True)


def seed_question_bank():
	questions = [
		{
			"question_text": "What does HTML stand for?",
			"question_type": "mcq",
			"category": "Tech",
			"difficulty": "Easy",
			"options": [{"label": "Hyper Text Markup Language", "is_correct": True}],
		},
		{
			"question_text": "ALGORITHM",
			"question_type": "word_scramble",
			"category": "Tech",
			"difficulty": "Medium",
			"correct_answer": "ALGORITHM",
			"hint": "A step-by-step procedure",
		},
	]
	for question in questions:
		if not frappe.db.exists("LMS Gamification Question Bank", {"question_text": question["question_text"]}):
			doc = frappe.new_doc("LMS Gamification Question Bank")
			doc.update(question)
			doc.insert(ignore_permissions=True)


def backfill_leaderboard():
	frappe.cache().delete_value("leaderboard")


def recalculate_leaderboard():
	from lms.lms.api import _build_leaderboard, _leaderboard_cache_key

	frappe.cache().set_value(_leaderboard_cache_key(), _build_leaderboard(), expires_in_sec=900)
	for batch in frappe.get_all("LMS Batch", pluck="name"):
		frappe.cache().set_value(_leaderboard_cache_key(batch), _build_leaderboard(batch=batch), expires_in_sec=900)
