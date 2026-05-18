import frappe
from frappe import _
from frappe.utils import flt, cint
from lms.lms.gamification.utils import get_streak_info

def calculate_composite_score(member, batch=None):
	W_QUIZ = 0.30
	W_ASSIGNMENT = 0.25
	W_COMPLETION = 0.25
	W_STREAK = 0.10
	W_HOURS = 0.10
	STREAK_CAP = 30
	HOURS_CAP = 100

	filters = {"member": member}
	if batch:
		courses = frappe.get_all("Batch Course", {"parent": batch}, pluck="course")
		if courses:
			filters["course"] = ["in", courses]

	quiz_data = frappe.db.get_all("LMS Quiz Submission", filters=filters, fields=["percentage"])
	avg_quiz_pct = sum(q.percentage for q in quiz_data) / len(quiz_data) if quiz_data else 0

	assign_filters = {**filters, "status": ["in", ["Pass", "Fail"]]}
	assignment_data = frappe.db.get_all(
		"LMS Assignment Submission",
		filters=assign_filters,
		fields=["numeric_score", "score_out_of"],
	)
	avg_assignment_pct = 0
	if assignment_data:
		scored = [
			(flt(a.numeric_score) / flt(a.score_out_of) * 100)
			for a in assignment_data
			if flt(a.score_out_of) > 0
		]
		avg_assignment_pct = sum(scored) / len(scored) if scored else 0

	enrollment_data = frappe.db.get_all("LMS Enrollment", filters=filters, fields=["progress"])
	completion_pct = sum(flt(e.progress) for e in enrollment_data) / len(enrollment_data) if enrollment_data else 0

	streak_data = get_streak_info(member)
	current_streak = streak_data["current_streak"]

	total_seconds = frappe.db.get_value(
		"LMS Video Watch Duration", filters, "sum(watch_time)"
	) or 0
	total_hours = flt(total_seconds) / 3600

	streak_score = min(current_streak / STREAK_CAP, 1) * 100
	hours_score = min(total_hours / HOURS_CAP, 1) * 100

	composite_score = round(
		(W_QUIZ * avg_quiz_pct)
		+ (W_ASSIGNMENT * avg_assignment_pct)
		+ (W_COMPLETION * completion_pct)
		+ (W_STREAK * streak_score)
		+ (W_HOURS * hours_score),
		1,
	)

	return {
		"composite_score": composite_score,
		"avg_quiz_score": round(avg_quiz_pct, 1),
		"avg_assignment_score": round(avg_assignment_pct, 1),
		"completion_pct": round(completion_pct, 1),
		"streak_days": current_streak,
		"hours_spent": round(total_hours, 1),
	}

@frappe.whitelist()
def get_leaderboard(batch=None, period="all_time", limit=25):
	limit = cint(limit)

	if batch:
		user_roles = frappe.get_roles()
		is_privileged = any(r in user_roles for r in [
			'System Manager', 'Administrator', 'Moderator',
			'Course Creator', 'Course Evaluator', 'Instructor', 'LMS Moderator'
		])
		if not is_privileged:
			if not frappe.db.exists("LMS Batch Enrollment", {"member": frappe.session.user, "batch": batch}):
				frappe.throw(_("You are not enrolled in this batch."))
		members = frappe.get_all("LMS Batch Enrollment", {"batch": batch}, pluck="member")
	else:
		members = frappe.get_all("LMS Enrollment", group_by="member", pluck="member")

	if not members:
		return []

	cache_key = f"leaderboard:{batch or 'global'}:{period}"
	cached = frappe.cache().get_value(cache_key)
	if cached:
		return cached

	filters = {"period": period}
	if batch:
		filters["batch"] = batch
	else:
		filters["batch"] = ["in", ["", None]]

	entries = frappe.get_all("LMS Game Leaderboard Entry",
		filters=filters,
		fields=["member", "composite_score", "rank"],
		order_by="rank asc",
		limit=limit
	)

	# Fallback if scheduler hasn't run yet
	if not entries and members:
		leaderboard = []
		for member in members:
			stats = calculate_composite_score(member, batch=batch)
			stats["member"] = member
			leaderboard.append(stats)

		leaderboard.sort(key=lambda x: x["composite_score"], reverse=True)

		for i, entry in enumerate(leaderboard):
			if i > 0 and entry["composite_score"] == leaderboard[i - 1]["composite_score"]:
				entry["rank"] = leaderboard[i - 1]["rank"]
			else:
				entry["rank"] = i + 1

		entries = leaderboard[:limit]

	# Enrich with user details
	for entry in entries:
		user_data = frappe.db.get_value(
			"User", entry["member"], ["full_name", "user_image", "username"], as_dict=True
		)
		entry["member_name"] = user_data.full_name if user_data else ""
		entry["member_image"] = user_data.user_image if user_data else ""
		entry["username"] = user_data.username if user_data else ""

	frappe.cache().set_value(cache_key, entries, expires_in_sec=900)
	return entries
