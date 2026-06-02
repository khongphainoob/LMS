import frappe
from lms.lms.gamification.leaderboard_api import calculate_composite_score
from lms.lms.gamification.utils import get_streak_info

def ensure_database_indexes():
	try:
		frappe.db.add_index("LMS Quiz Submission", ["member"])
		frappe.db.add_index("LMS Assignment Submission", ["member", "status"])
		frappe.db.add_index("LMS Enrollment", ["member"])
		frappe.db.add_index("LMS Video Watch Duration", ["member"])
		frappe.db.add_index("LMS Game Leaderboard Entry", ["batch", "period", "rank"])
	except Exception:
		pass

def recalculate_leaderboard():
	# Safe DB setup
	ensure_database_indexes()

	for period in ["all_time", "weekly", "monthly"]:
		_recalc_for_batch(None, period)
		
		batches = frappe.get_all("LMS Batch", {"published": 1}, pluck="name")
		for batch in batches:
			_recalc_for_batch(batch, period)

def _recalc_for_batch(batch, period):
	if batch:
		members = frappe.get_all("LMS Batch Enrollment", {"batch": batch}, pluck="member")
	else:
		members = frappe.get_all("LMS Enrollment", group_by="member", pluck="member")
		
	if not members:
		return

	# Performance: batch calculate scores in 1 execution rather than looping
	from lms.lms.gamification.leaderboard_api import calculate_composite_score_batch
	scores = calculate_composite_score_batch(members, batch=batch)

	entries = []
	for m in members:
		score_data = scores.get(m, {
			"composite_score": 0,
			"avg_quiz_score": 0,
			"avg_assignment_score": 0,
			"completion_pct": 0,
			"streak_days": 0,
			"hours_spent": 0
		})
		entries.append({
			"batch": batch or "", 
			"member": m,
			"composite_score": score_data["composite_score"], 
			"period": period
		})
		
	entries.sort(key=lambda x: x["composite_score"], reverse=True)
	
	top_5 = []
	for rank, entry in enumerate(entries, 1):
		entry["rank"] = rank
		if rank <= 5:
			top_5.append(entry)
		upsert_leaderboard_entry(entry)
		
	if batch:
		frappe.publish_realtime("leaderboard_updated", {
			"batch": batch, "top_5": top_5
		}, room=f"batch_{batch}", after_commit=True)

def upsert_leaderboard_entry(entry):
	filters = {
		"batch": entry["batch"],
		"member": entry["member"],
		"period": entry["period"]
	}
	name = frappe.db.get_value("LMS Game Leaderboard Entry", filters, "name")
	if name:
		doc = frappe.get_doc("LMS Game Leaderboard Entry", name)
		doc.composite_score = entry["composite_score"]
		doc.rank = entry["rank"]
		doc.save(ignore_permissions=True)
	else:
		try:
			doc = frappe.new_doc("LMS Game Leaderboard Entry")
			doc.update(entry)
			doc.insert(ignore_permissions=True)
		except Exception:
			pass

def check_gamification_badges():
	ensure_database_indexes()
	members = frappe.get_all("LMS Enrollment", group_by="member", pluck="member")
	for member in members:
		check_streak_badges(member)
		check_leaderboard_badges(member)
		check_completion_badges(member)

def check_streak_badges(member):
	streak_data = get_streak_info(member)
	current = streak_data["current_streak"]
	if current >= 7:
		auto_award_if_not_exists("7-Day Streak", member)
	if current >= 30:
		auto_award_if_not_exists("Unstoppable", member)

def check_leaderboard_badges(member):
	# 1. Check game-specific ranks (each individual game progress)
	game_progresses = frappe.get_all("LMS Game Progress", {"member": member}, ["class_game", "best_score"])
	for gp in game_progresses:
		if gp.best_score > 0:
			rank_above = frappe.db.count("LMS Game Progress", {
				"class_game": gp.class_game,
				"best_score": [">", gp.best_score]
			})
			rank = rank_above + 1
			if rank == 1:
				auto_award_if_not_exists("Champion", member)
			if rank <= 3:
				auto_award_if_not_exists("Podium Finisher", member)
			if rank <= 10:
				auto_award_if_not_exists("Top 10", member)

	# 2. Check composite leaderboard rank
	rank_data = frappe.db.get_all("LMS Game Leaderboard Entry", 
		{"member": member, "period": "all_time"}, 
		["rank"], 
		order_by="rank asc", 
		limit=1
	)
	if rank_data:
		best_rank = rank_data[0].rank
		if best_rank == 1:
			auto_award_if_not_exists("Champion", member)
		if best_rank <= 3:
			auto_award_if_not_exists("Podium Finisher", member)
		if best_rank <= 10:
			auto_award_if_not_exists("Top 10", member)

def check_completion_badges(member):
	completed_count = frappe.db.count("LMS Enrollment", {"member": member, "progress": [">=", 100]})
	if completed_count >= 1:
		auto_award_if_not_exists("First Step", member)
	if completed_count >= 5:
		auto_award_if_not_exists("Scholar", member)

def auto_award_if_not_exists(badge_title, member):
	if frappe.db.exists("LMS Badge Assignment", {"badge": badge_title, "member": member}):
		return
	try:
		# Auto-create the LMS Badge definition if it doesn't exist in the database!
		if not frappe.db.exists("LMS Badge", badge_title):
			descriptions = {
				"Champion": "Awarded for achieving Rank 1 on any game leaderboard.",
				"Podium Finisher": "Awarded for finishing in the Top 3 of any game leaderboard.",
				"Top 10": "Awarded for reaching the Top 10 on any game leaderboard.",
				"7-Day Streak": "Awarded for maintaining a 7-day study streak.",
				"Unstoppable": "Awarded for maintaining a 30-day study streak.",
				"Scholar": "Awarded for completing 5 or more courses.",
				"First Step": "Awarded for completing your first course."
			}
			badge_doc = frappe.get_doc({
				"doctype": "LMS Badge",
				"title": badge_title,
				"description": descriptions.get(badge_title, f"Badge for {badge_title} achievement."),
				"image": "/assets/lms/images/badge.png",
				"reference_doctype": "LMS Enrollment",
				"event": "New",
				"user_field": "member",
				"enabled": 1,
				"grant_only_once": 1
			})
			badge_doc.insert(ignore_permissions=True)
			frappe.db.commit()

		assignment = frappe.new_doc("LMS Badge Assignment")
		assignment.badge = badge_title
		assignment.member = member
		assignment.issued_on = frappe.utils.today()
		assignment.insert(ignore_permissions=True)
		
		frappe.publish_realtime("badge_awarded", {
			"member": member, "badge": badge_title
		}, user=member, after_commit=True)
	except Exception as e:
		frappe.log_error(f"Error auto-assigning badge {badge_title}: {str(e)}", "Gamification Badge Error")
