import frappe
from frappe import _
from frappe.utils import now_datetime, add_to_date, cint, time_diff_in_seconds, today
import json
from lms.lms.gamification.utils import MAX_SCORE_PER_GAME, MAX_DAILY_ATTEMPTS

@frappe.whitelist()
def start_game_session(class_game):
	member = frappe.session.user
	
	recent = frappe.db.count("LMS Game Session", {
		"member": member,
		"class_game": class_game,
		"completed_at": [">", add_to_date(now_datetime(), seconds=-30)]
	})
	if recent > 0:
		frappe.throw(_("Please wait before starting another session."))
		
	# Daily cap
	cg = frappe.get_doc("LMS Class Game", class_game)
	game_type = frappe.db.get_value("LMS Game", cg.game, "game_type")

	daily_count = frappe.db.count("LMS Game Session", {
		"member": member,
		"class_game": class_game,
		"status": "Completed",
		"creation": [">=", today()]
	})
	if daily_count >= MAX_DAILY_ATTEMPTS.get(game_type, 10):
		frappe.throw(_("Daily attempt limit reached."))

	# Max attempts per class game (set by instructor)
	if cg.max_attempts:
		total_attempts = frappe.db.count("LMS Game Session", {
			"member": member,
			"class_game": class_game,
			"status": "Completed",
		})
		if total_attempts >= cint(cg.max_attempts):
			frappe.throw(
				_("You have used all {0} allowed attempt(s) for this game.").format(cg.max_attempts),
				title=_("No Attempts Remaining")
			)
		
	# Session verify Redis
	session = frappe.new_doc("LMS Game Session")
	session.update({
		"class_game": class_game,
		"member": member,
		"status": "Started",
		"started_at": now_datetime()
	})
	session.insert()

	# Anti-cheat token in Redis
	frappe.cache().set_value(f"game_session:{session.name}", {
		"member": member,
		"started_at": session.started_at,
		"game_type": game_type,
		"max_score": MAX_SCORE_PER_GAME.get(game_type, 1000),
	}, expires_in_sec=1800)

	# Return session details and the assigned game questions configuration
	configuration = frappe.db.get_value("LMS Game", cg.game, "configuration")
	return {
		"session_id": session.name,
		"configuration": configuration
	}

@frappe.whitelist()
def submit_game_session(session_id, raw_score, metadata=None):
	session = frappe.get_doc("LMS Game Session", session_id)
	
	if session.member != frappe.session.user:
		frappe.throw(_("Unauthorized."), frappe.PermissionError)
		
	if session.status == "Completed":
		frappe.throw(_("Session already submitted."))
		
	cached = frappe.cache().get_value(f"game_session:{session_id}")
	if not cached:
		# Production Hardening: Fallback to database session record if Redis evicted the cache key
		if frappe.db.exists("LMS Game Session", session_id):
			session_db = frappe.get_doc("LMS Game Session", session_id)
			if session_db.member == frappe.session.user and session_db.status == "Started":
				game_type = frappe.db.get_value("LMS Game",
					frappe.db.get_value("LMS Class Game", session_db.class_game, "game"), "game_type")
				cached = {
					"member": session_db.member,
					"started_at": session_db.started_at,
					"game_type": game_type,
					"max_score": MAX_SCORE_PER_GAME.get(game_type, 1000)
				}
				
		if not cached:
			frappe.throw(_("Session expired or invalid."))
		
	max_score = cached.get("max_score", 1000)
	raw_score = min(cint(raw_score), max_score)
	
	session.raw_score = raw_score
	session.normalized_score = round(raw_score / max_score * 100, 1) if max_score > 0 else 0
	session.status = "Completed"
	session.completed_at = now_datetime()
	session.duration_seconds = time_diff_in_seconds(session.completed_at, session.started_at)
	session.metadata = json.dumps(metadata) if metadata else None
	session.save(ignore_permissions=True)
	
	update_game_progress(session)
	
	frappe.cache().delete_value(f"game_session:{session_id}")

	# Get updated progress for response
	progress = frappe.db.get_value("LMS Game Progress",
		{"class_game": session.class_game, "member": session.member},
		["best_score", "attempt_count"],
		as_dict=True
	)

	return {
		"score": raw_score,
		"max_score": max_score,
		"normalized": session.normalized_score,
		"best_score": progress.best_score if progress else raw_score,
		"attempt_count": progress.attempt_count if progress else 1,
		"xp_earned": round(raw_score / max_score * 50) if max_score > 0 else 0,
	}

def update_game_progress(session):
	class_game = frappe.get_doc("LMS Class Game", session.class_game)
	game = frappe.get_doc("LMS Game", class_game.game)
	
	# Row-level locking to prevent race conditions during concurrent clicks
	progress_name = frappe.db.get_value("LMS Game Progress",
		{"class_game": session.class_game, "member": session.member},
		"name", for_update=True)
		
	if progress_name:
		progress = frappe.get_doc("LMS Game Progress", progress_name)
	else:
		progress = frappe.new_doc("LMS Game Progress")
		progress.class_game = session.class_game
		progress.member = session.member
		progress.best_score = 0
		progress.total_score = 0
		progress.attempt_count = 0
		
	progress.attempt_count += 1
	progress.last_session = session.name
	
	if game.scoring_model == "best":
		progress.best_score = max(progress.best_score or 0, session.raw_score)
	elif game.scoring_model == "sum":
		progress.total_score = (progress.total_score or 0) + session.raw_score
		progress.best_score = progress.total_score
	elif game.scoring_model == "avg":
		prev_count = progress.attempt_count - 1
		prev_total = (progress.average_score or 0) * prev_count
		new_total = prev_total + session.raw_score
		progress.average_score = round(new_total / progress.attempt_count, 1)
		progress.best_score = round(progress.average_score)
		
	progress.progress_percentage = round(progress.best_score / game.max_score * 100, 1) if game.max_score else 0
	progress.save(ignore_permissions=True)

	# Check and award badges immediately!
	try:
		from lms.lms.gamification.tasks import check_streak_badges, check_leaderboard_badges, check_completion_badges
		check_streak_badges(session.member)
		check_leaderboard_badges(session.member)
		check_completion_badges(session.member)
	except Exception as e:
		frappe.log_error(f"Error checking badges on session submit: {str(e)}", "Gamification Badge On Submit Error")
	
	# Clear profile cache
	frappe.cache().delete_value(f"game_profile:{session.member}")
	
	# Real-time update — broadcast to ALL connected users (instructor leaderboard needs this)
	member_name = frappe.db.get_value("User", session.member, "full_name") or session.member
	frappe.publish_realtime("game_score_updated", {
		"class_game": session.class_game,
		"member": session.member,
		"member_name": member_name,
		"best_score": progress.best_score,
	}, after_commit=True)  # No user= filter → broadcast globally


@frappe.whitelist()
def broadcast_game_start(class_game):
	"""Instructor broadcasts a signal to all students in the batch to start a game.
	Students' browsers will receive a socket event and show a 'Game is Live!' popup.
	"""
	member = frappe.session.user

	# Permission check: must be instructor or moderator
	user_roles = frappe.get_roles(member)
	is_instructor = (
		member == 'Administrator' or
		any(r in user_roles for r in ['System Manager', 'Moderator', 'Course Creator', 'Course Evaluator'])
	)
	if not is_instructor:
		frappe.throw(_("Only instructors can start a game session."), frappe.PermissionError)

	cg = frappe.get_doc("LMS Class Game", class_game)
	game = frappe.get_doc("LMS Game", cg.game)

	# Mark game as "live" in Redis (expires in 2 hours)
	cache_key = f"game_live:{class_game}"
	frappe.cache().set_value(cache_key, {
		"class_game": class_game,
		"game_type": game.game_type,
		"title": game.title,
		"started_by": member,
		"started_at": str(frappe.utils.now_datetime()),
	}, expires_in_sec=7200)

	# Get all students enrolled in this batch
	enrolled_members = frappe.get_all("LMS Batch Enrollment",
		filters={"batch": cg.batch},
		pluck="member",
		ignore_permissions=True,
	)

	# Broadcast to each student
	payload = {
		"class_game": class_game,
		"game_type": game.game_type,
		"title": game.title,
		"batch": cg.batch,
		"started_by": member,
	}

	# Broadcast to all enrolled members
	for student in enrolled_members:
		frappe.publish_realtime(
			event="game_live_started",
			message=payload,
			user=student,
			after_commit=True,
		)

	# Also broadcast to the room (for any logged-in users)
	frappe.publish_realtime(
		event="game_live_started",
		message=payload,
		room=f"batch:{cg.batch}",
		after_commit=True,
	)

	frappe.db.commit()
	return {"status": "broadcasted", "students_notified": len(enrolled_members)}


@frappe.whitelist()
def broadcast_game_stop(class_game):
	"""Instructor stops the live game session."""
	member = frappe.session.user

	user_roles = frappe.get_roles(member)
	is_instructor = (
		member == 'Administrator' or
		any(r in user_roles for r in ['System Manager', 'Moderator', 'Course Creator', 'Course Evaluator'])
	)
	if not is_instructor:
		frappe.throw(_("Only instructors can stop a game session."), frappe.PermissionError)

	cg = frappe.get_doc("LMS Class Game", class_game)
	cache_key = f"game_live:{class_game}"
	frappe.cache().delete_value(cache_key)

	enrolled_members = frappe.get_all("LMS Batch Enrollment",
		filters={"batch": cg.batch},
		pluck="member",
		ignore_permissions=True,
	)

	payload = {"class_game": class_game, "batch": cg.batch}
	for student in enrolled_members:
		frappe.publish_realtime(event="game_live_stopped", message=payload, user=student, after_commit=True)

	frappe.db.commit()
	return {"status": "stopped"}


@frappe.whitelist()
def get_game_lobby_info(class_game):
	"""Returns both the live status and the leaderboard for a class game,
	combining two HTTP calls into a single high-performance API endpoint.
	"""
	# 1. Live status
	cache_key = f"game_live:{class_game}"
	live_status = frappe.cache().get_value(cache_key)
	is_live = bool(live_status)
	
	# 2. Leaderboard
	progress_list = frappe.get_all(
		"LMS Game Progress",
		filters={"class_game": class_game},
		fields=["member", "best_score", "attempt_count"],
		order_by="best_score desc",
		limit=3
	)
	
	# Resolve full_name for each student
	for p in progress_list:
		p["member_name"] = frappe.db.get_value("User", p.member, "full_name") or p.member
		
	return {
		"is_live": is_live,
		"live_info": live_status,
		"leaderboard": progress_list
	}


@frappe.whitelist()
def get_my_game_rank(class_game):
	"""Get current user's rank and total players for a class game."""
	member = frappe.session.user
	progress = frappe.db.get_value("LMS Game Progress",
		{"class_game": class_game, "member": member},
		["best_score"],
		as_dict=True,
	)
	if not progress or not progress.best_score:
		total = frappe.db.count("LMS Game Progress", {"class_game": class_game})
		return {"rank": None, "total_players": total, "best_score": 0}

	my_score = progress.best_score
	rank_above = frappe.db.count("LMS Game Progress", {
		"class_game": class_game,
		"best_score": [">", my_score],
	})
	total = frappe.db.count("LMS Game Progress", {"class_game": class_game})
	return {
		"rank": rank_above + 1,
		"total_players": total,
		"best_score": my_score,
	}


@frappe.whitelist()
def get_available_games(batch=None):
	"""Get games available for the current user.
	- Students see only games from batches they are enrolled in.
	- Instructors/Moderators see all active class games.
	"""
	member = frappe.session.user

	# Instructors and moderators see everything (including admin roles)
	user_roles = frappe.get_roles(member)
	is_admin = (
		member in ('Administrator', 'admin') or
		any(r in user_roles for r in [
			'System Manager', 'Administrator',
			'Moderator',        # Frappe LMS moderator role
			'Course Creator',   # Instructor role in LMS
			'Course Evaluator', # Evaluator role in LMS
			'Instructor',       # Generic instructor role
			'LMS Moderator',    # Custom role if set
		])
	)

	if is_admin:
		# Show all class games (optionally filtered by batch param)
		filters = {}
		if batch:
			filters["batch"] = batch
		class_games = frappe.get_all("LMS Class Game",
			filters=filters,
			fields=["name", "game", "batch", "max_attempts", "available_from", "available_until"],
			ignore_permissions=True,
		)
	else:
		# Students: find their enrolled batches first
		enrolled_batches = frappe.get_all("LMS Batch Enrollment",
			filters={"member": member},
			pluck="batch",
			ignore_permissions=True,
		)

		if not enrolled_batches:
			return []

		filters = {"batch": ["in", enrolled_batches]}
		if batch:
			filters["batch"] = batch

		class_games = frappe.get_all("LMS Class Game",
			filters=filters,
			fields=["name", "game", "batch", "max_attempts", "available_from", "available_until"],
			ignore_permissions=True,
		)

	# Show each class game assignment as a separate entry (no deduplication)
	result = []
	for cg in class_games:
		try:
			game = frappe.get_doc("LMS Game", cg.game)
		except frappe.DoesNotExistError:
			continue

		if not game.is_active:
			continue

		# Get user progress for this class game
		progress = frappe.db.get_value("LMS Game Progress",
			{"class_game": cg.name, "member": member},
			["best_score", "attempt_count", "progress_percentage"],
			as_dict=True,
		)

		# Check if this game is currently live (started by instructor)
		is_live = bool(frappe.cache().get_value(f"game_live:{cg.name}"))

		# Calculate student's rank in this class game
		my_best = progress.best_score if progress else 0
		rank = None
		total_players = 0
		if progress and my_best > 0:
			# Count players who scored strictly higher
			rank_above = frappe.db.count("LMS Game Progress", {
				"class_game": cg.name,
				"best_score": [">", my_best],
			})
			# Count all players who have played
			total_players = frappe.db.count("LMS Game Progress", {
				"class_game": cg.name,
			})
			rank = rank_above + 1  # 1-indexed rank

		# Count completed attempts for this class game
		attempts_used = frappe.db.count("LMS Game Session", {
			"member": member,
			"class_game": cg.name,
			"status": "Completed",
		})
		can_play = not cg.max_attempts or attempts_used < cint(cg.max_attempts)

		result.append({
			"class_game": cg.name,
			"game_type": game.game_type,
			"title": game.title,
			"max_score": game.max_score,
			"scoring_model": game.scoring_model,
			"batch": cg.batch,
			"max_attempts": cg.max_attempts,
			"attempts_used": attempts_used,
			"can_play": can_play,
			"best_score": progress.best_score if progress else 0,
			"attempt_count": progress.attempt_count if progress else 0,
			"progress_pct": progress.progress_percentage if progress else 0,
			"is_live": is_live,
			"rank": rank,
			"total_players": total_players,
		})

	return result


@frappe.whitelist()
def get_game_questions(game_type, category=None, difficulty=None, limit=10):
	"""Fetch random questions from the Question Bank for a game type."""
	qtype_map = {
		"timed_quiz": "mcq",
		"word_scramble": "word_scramble",
		"drag_drop": "sort_order",
	}
	question_type = qtype_map.get(game_type, "mcq")

	filters = {"question_type": question_type}
	if category:
		filters["category"] = category
	if difficulty:
		filters["difficulty"] = difficulty

	questions = frappe.get_all("LMS Gamification Question Bank",
		filters=filters,
		fields=["name", "question_text", "question_type", "options",
				"correct_answer", "hint", "category", "difficulty", "sort_items"],
		order_by="RAND()",
		limit=cint(limit),
	)

	# Parse JSON fields
	for q in questions:
		if q.options and isinstance(q.options, str):
			q.options = json.loads(q.options)
		if q.sort_items and isinstance(q.sort_items, str):
			q.sort_items = json.loads(q.sort_items)

	return questions


@frappe.whitelist()
def save_game_settings(class_game, max_attempts=None, max_score=1000):
	"""Updates game settings and broadcasts a real-time event to notify students to reload."""
	cg = frappe.get_doc("LMS Class Game", class_game)
	
	# Update max_attempts
	cg.max_attempts = cint(max_attempts) if max_attempts else None
	cg.save(ignore_permissions=True)
	
	# Update max_score
	game = frappe.get_doc("LMS Game", cg.game)
	game.max_score = cint(max_score)
	game.save(ignore_permissions=True)
	
	# Broadcast real-time update to all connected students to reload their list
	frappe.publish_realtime("game_score_updated", {
		"class_game": class_game,
		"settings_updated": True
	}, after_commit=True)
	
	frappe.db.commit()
	return {"status": "success"}


@frappe.whitelist()
def get_leaderboard_batches():
	"""Get list of batches for the leaderboard dropdown.
	- Instructors / Moderators see all batches.
	- Students see only batches they are enrolled in.
	"""
	member = frappe.session.user
	user_roles = frappe.get_roles(member)
	
	is_moderator_or_instructor = any(r in user_roles for r in [
		'System Manager', 'Administrator', 'Moderator',
		'Course Creator', 'Course Evaluator', 'Instructor', 'LMS Moderator'
	])
	
	if is_moderator_or_instructor:
		# Instructors/Admins see all batches
		batches = frappe.get_all("LMS Batch",
			fields=["name", "title"],
			filters={"disabled": 0},
			ignore_permissions=True,
		)
	else:
		# Students see only enrolled batches
		enrolled = frappe.get_all("LMS Batch Enrollment",
			filters={"member": member},
			fields=["batch"],
			ignore_permissions=True,
		)
		batch_names = [e.batch for e in enrolled]
		if not batch_names:
			return []
		batches = frappe.get_all("LMS Batch",
			fields=["name", "title"],
			filters={"name": ["in", batch_names]},
			ignore_permissions=True,
		)
		
	return batches
