import frappe
from frappe import _
from lms.lms.gamification.utils import get_streak_info, calculate_level
from lms.lms.gamification.leaderboard_api import calculate_composite_score

@frappe.whitelist()
def get_game_center_stats():
	member = frappe.session.user
	score_data = calculate_composite_score(member)
	streak_data = get_streak_info(member)

	recent_badges = frappe.get_all(
		"LMS Badge Assignment",
		{"member": member},
		["badge", "badge_image", "badge_description", "issued_on"],
		order_by="issued_on desc",
		limit=5,
	)
	total_badges = frappe.db.count("LMS Badge Assignment", {"member": member})
	total_available = frappe.db.count("LMS Badge", {"enabled": 1})

	return {
		**score_data,
		**streak_data,
		"recent_badges": recent_badges,
		"total_badges": total_badges,
		"total_available": total_available,
	}

@frappe.whitelist()
def get_game_profile():
	member = frappe.session.user
	member_name = frappe.get_value("User", member, "full_name") or member
	score_data = calculate_composite_score(member)
	streak_data = get_streak_info(member)

	total_score = score_data.get("composite_score", 0)
	level_data = calculate_level(total_score)

	enrollments = frappe.db.get_all(
		"LMS Enrollment",
		{"member": member},
		["course", "progress"],
		order_by="progress desc",
		limit_page_length=5,
	)

	total_courses = frappe.db.count("LMS Enrollment", {"member": member})
	completed_courses = frappe.db.count("LMS Enrollment", {"member": member, "progress": [">=", 100]})

	quiz_count = frappe.db.count("LMS Quiz Submission", {"member": member})
	assignment_count = frappe.db.count("LMS Assignment Submission", {"member": member, "status": ["in", ["Pass", "Fail"]]})

	return {
		"member_name": member_name,
		"level": level_data["level"],
		"xp": level_data["xp"],
		"xp_to_next": level_data["xp_to_next"],
		"xp_percent": level_data["xp_percent"],
		"total_score": total_score,
		"current_streak": streak_data["current_streak"],
		"longest_streak": streak_data["longest_streak"],
		"hours_spent": score_data.get("hours_spent", 0),
		"avg_quiz_score": score_data.get("avg_quiz_score", 0),
		"avg_assignment_score": score_data.get("avg_assignment_score", 0),
		"completion_pct": score_data.get("completion_pct", 0),
		"total_courses": total_courses,
		"completed_courses": completed_courses,
		"quiz_count": quiz_count,
		"assignment_count": assignment_count,
		"top_courses": enrollments,
		"total_badges": frappe.db.count("LMS Badge Assignment", {"member": member}),
		"total_available": frappe.db.count("LMS Badge", {"enabled": 1}),
	}
