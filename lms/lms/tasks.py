import frappe


def check_gamification_badges():
	members = frappe.get_all("LMS Enrollment", group_by="member", pluck="member")
	for member in members:
		check_streak_badges(member)
		check_leaderboard_badges(member)
		check_completion_badges(member)


def check_streak_badges(member):
	from lms.lms.api import calculate_current_streak, calculate_streaks, fetch_activity_dates

	dates = fetch_activity_dates(member)
	streak, _ = calculate_streaks(dates)
	current = calculate_current_streak(dates, streak)
	if current >= 7:
		auto_award_if_not_exists("7-Day Streak", member)
	if current >= 30:
		auto_award_if_not_exists("Unstoppable", member)


def check_leaderboard_badges(member):
	leaderboard = frappe.cache().get_value("game_leaderboard:global") or []
	if any(entry.get("member") == member and int(entry.get("rank") or 0) <= 5 for entry in leaderboard):
		auto_award_if_not_exists("Top Student", member)


def check_completion_badges(member):
	completed_courses = frappe.db.count("LMS Enrollment", {"member": member, "progress": [">=", 100]})
	if completed_courses >= 5:
		auto_award_if_not_exists("Scholar", member)


def auto_award_if_not_exists(badge_title, member):
	badge = frappe.db.get_value("LMS Badge", {"title": badge_title}, "name")
	if not badge:
		return
	if frappe.db.exists("LMS Badge Assignment", {"badge": badge, "member": member}):
		return
	assignment = frappe.new_doc("LMS Badge Assignment")
	assignment.badge = badge
	assignment.member = member
	assignment.issued_on = frappe.utils.today()
	assignment.insert(ignore_permissions=True)
	frappe.publish_realtime("badge_awarded", {"member": member, "badge": badge_title}, after_commit=True)


def create_default_games():
	games = [
		{"title": "Memory Match", "game_type": "memory_match", "scoring_model": "best", "max_score": 500},
		{"title": "Timed Quiz", "game_type": "timed_quiz", "scoring_model": "best", "max_score": 800},
		{"title": "Spin the Wheel", "game_type": "spin_wheel", "scoring_model": "sum", "max_score": 500},
		{"title": "Word Scramble", "game_type": "word_scramble", "scoring_model": "best", "max_score": 300},
		{"title": "Drag & Drop Sort", "game_type": "drag_drop", "scoring_model": "best", "max_score": 500},
		{"title": "Duck Race", "game_type": "duck_race", "scoring_model": "sum", "max_score": 500},
		{"title": "Fruit Ninja", "game_type": "fruit_ninja", "scoring_model": "sum", "max_score": 500},
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
