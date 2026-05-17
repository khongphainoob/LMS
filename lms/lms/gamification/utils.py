import math
import frappe
from frappe.utils import getdate, add_to_date, now_datetime
from datetime import timedelta
import pytz

MAX_SCORE_PER_GAME = {
	"memory_match": 500,
	"timed_quiz": 800,
	"spin_wheel": 500,
	"word_scramble": 300,
	"drag_drop": 500,
}

MAX_DAILY_ATTEMPTS = {
	"memory_match": 20,
	"timed_quiz": 15,
	"spin_wheel": 10,
	"word_scramble": 20,
	"drag_drop": 15,
}

def calculate_level(total_xp):
	"""Sqrt curve: level cao hơn đòi hỏi XP nhiều hơn theo cấp số nhân."""
	level = 1 + int(math.sqrt(total_xp / 50))
	xp_for_current = 50 * (level - 1) ** 2
	xp_for_next = 50 * level ** 2
	xp_in_level = total_xp - xp_for_current
	xp_needed = xp_for_next - xp_for_current
	return {
		"level": level,
		"xp": round(xp_in_level, 1),
		"xp_to_next": xp_needed,
		"xp_percent": round(xp_in_level / xp_needed * 100, 1) if xp_needed > 0 else 100,
	}

def convert_utc_to_user_tz(utc_dt, user_tz):
	if not utc_dt:
		return None
	try:
		if isinstance(utc_dt, str):
			utc_dt = frappe.utils.get_datetime(utc_dt)
		tz = pytz.timezone(user_tz or "UTC")
		return pytz.utc.localize(utc_dt).astimezone(tz)
	except Exception:
		return utc_dt

def fetch_activity_dates(user):
	user_tz = frappe.db.get_value("User", user, "time_zone") or "UTC"
	doctypes = [
		"LMS Course Progress",
		"LMS Quiz Submission",
		"LMS Assignment Submission",
		"LMS Programming Exercise Submission",
	]

	all_dates = []
	for dt in doctypes:
		records = frappe.get_all(dt, {"member": user}, ["creation"])
		for r in records:
			local_dt = convert_utc_to_user_tz(r.creation, user_tz)
			all_dates.append(local_dt.date() if hasattr(local_dt, "date") else local_dt)

	return sorted(set(all_dates))

def calculate_streaks(all_dates):
	streak = 0
	longest_streak = 0
	prev_day = None

	for d in all_dates:
		if d.weekday() in (5, 6):
			continue

		if prev_day:
			expected = prev_day + timedelta(days=1)
			while expected.weekday() in (5, 6):
				expected += timedelta(days=1)

			streak = streak + 1 if d == expected else 1
		else:
			streak = 1

		longest_streak = max(longest_streak, streak)
		prev_day = d

	return streak, longest_streak

def calculate_current_streak(all_dates, streak):
	if not all_dates:
		return 0

	last_date = all_dates[-1]
	today = getdate()

	ref_day = today
	while ref_day.weekday() in (5, 6):
		ref_day -= timedelta(days=1)

	if last_date == ref_day or last_date == ref_day - timedelta(days=1):
		return streak
	return 0

def get_streak_info(member=None):
	if not member:
		member = frappe.session.user
	all_dates = fetch_activity_dates(member)
	streak, longest_streak = calculate_streaks(all_dates)
	current_streak = calculate_current_streak(all_dates, streak)

	return {
		"current_streak": current_streak,
		"longest_streak": longest_streak,
	}
