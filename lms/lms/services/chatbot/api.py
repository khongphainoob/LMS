import frappe
from frappe import _
import re
from ...agents.chatbot.graph import chatbot_graph
from .session import (
	get_or_create_session_key,
	get_chat_history,
	save_message_to_history,
	clear_session
)
from lms.lms.services.hitl.flagging import should_flag_chatbot
from lms.lms.services.hitl.notification import notify_teacher
from lms.lms.services.ai_rate_limit import check_and_record_usage

# Tầng 0: FAQ quick‑response layer
_FAQ = [
    (re.compile(r"^\s*(hi|hello|chào|xin chào)\s*$", re.I), "Chào bạn! Mình là trợ lý AI của LMS, sẵn sàng giúp bạn giải bài tập."),
    (re.compile(r"^\s*trung tâm ở đâu\?\s*$", re.I), "Trung tâm chúng tôi nằm tại 123 Đường ABC, Quận XYZ."),
    (re.compile(r"^\s*khóa học (.+) hết hạn\?\s*$", re.I), "Bạn có thể kiểm tra ngày hết hạn trong mục \"Hồ sơ học viên\" trên giao diện.")
]

def _try_faq(msg: str):
    for pattern, answer in _FAQ:
        if pattern.search(msg):
            return answer
    return None

def _logger():
	return frappe.logger("lms.chatbot")


def _ensure_chatbot_access(user: str) -> None:
	if user == "Guest":
		frappe.throw(_("Please login to use the chatbot"))

	allowed_roles = {"LMS Student", "Course Creator", "Moderator", "Batch Evaluator", "System Manager"}
	user_roles = set(frappe.get_roles(user))
	if user != "Administrator" and not (allowed_roles & user_roles):
		frappe.throw(_("You do not have permission to use the chatbot"))


def _apply_rate_limit(user: str) -> None:
	check_and_record_usage(user, "Chatbot", increment=1)


def _build_initial_state(message: str, student: str, lesson_name: str, session_key: str, **kwargs) -> dict:
	course_name = kwargs.get("course") or frappe.form_dict.get("course")
	batch_name = kwargs.get("batch") or frappe.form_dict.get("batch")
	category = kwargs.get("category") or frappe.form_dict.get("category")

	return {
		"user_message": message,
		"student_name": student,
		"lesson_name": lesson_name,
		"course_name": course_name,
		"batch_name": batch_name,
		"category": category,
		"session_key": session_key,
		"chat_history": get_chat_history(session_key),
	}


def _publish_chatbot_result(user: str, payload: dict) -> None:
	frappe.publish_realtime(event="chatbot_response", message=payload, user=user)


@frappe.whitelist()
def send_message(message: str = None, lesson_name: str = None, session_key: str = None, **kwargs):
	"""
	Main endpoint for sending messages to the chatbot.
	"""
	# Ensure message is captured from various possible request formats
	if not message:
		message = frappe.form_dict.get("message")
		
	if not message:
		frappe.throw(_("Message cannot be empty"))
	if len(message) > 1000:
		frappe.throw(_("Tin nhắn quá dài (tối đa 1000 ký tự). Vui lòng tóm tắt lại câu hỏi của bạn."))

	student = frappe.session.user
	_ensure_chatbot_access(student)
	_apply_rate_limit(student)

	# Khởi tạo session_key ngay để trả lời FAQ nếu cần
	if not session_key:
		session_key = get_or_create_session_key(student, lesson_name)

	# Kiểm tra FAQ
	faq_ans = _try_faq(message)
	if faq_ans:
		return {
			"response": faq_ans,
			"message_type": "faq",
			"session_key": session_key,
			"tokens_used": 0,
		}

	# 1. Initialize session
	if not session_key:
		session_key = get_or_create_session_key(student, lesson_name)

	# 2. Prepare state
	initial_state = _build_initial_state(
		message=message,
		student=student,
		lesson_name=lesson_name,
		session_key=session_key,
		**kwargs,
	)

	# 3. Run Graph
	try:
		from lms.lms.services.observability import get_unified_config_dict, flush_langfuse
		config = get_unified_config_dict(agent_name="chatbot_agent", session_id=session_key, tags=["Chatbot"])
		final_state = chatbot_graph.invoke(initial_state, config)
		flush_langfuse()
		
		response = final_state.get("response")
		msg_type = final_state.get("message_type", "qa")
		
		# 4. Persistent Log (MariaDB) - Do this first to get session_name
		session_name = _log_to_db(student, lesson_name, final_state)
		
		# 4.5 HITL Flagging evaluation
		session_doc = frappe.get_doc("Chatbot Session", session_name)
		is_flagged, reason, priority = should_flag_chatbot(final_state, session_doc)
		if is_flagged:
			session_doc.status = "Flagged"
			session_doc.flag_reason = reason
			session_doc.save(ignore_permissions=True)
			notify_teacher(
				event_type="Chatbot Flagged" if not final_state.get("is_blocked") else "Chatbot Blocked",
				student=student,
				course=session_doc.course,
				reference_doctype="Chatbot Session",
				reference_name=session_name,
				reason=reason,
				priority=priority
			)

		# 5. Save to history (Redis + DB)
		if not final_state.get("is_blocked"):
			hist = save_message_to_history(session_key, "user", message, session_name=session_name)
			save_message_to_history(session_key, "assistant", response, session_name=session_name, history=hist, extra_data=final_state)
			
		return {
			"response": response,
			"message_type": msg_type,
			"session_key": session_key,
			"tokens_used": final_state.get("tokens_used", 0)
		}

	except Exception as e:
		frappe.log_error(frappe.get_traceback(), "Chatbot API Error")
		frappe.throw(_("An error occurred while processing your request. Please try again later."))


@frappe.whitelist(methods=["POST"])
def send_message_async(message: str = None, lesson_name: str = None, session_key: str = None, request_id: str = None, **kwargs):
	"""Queue chatbot execution on background worker and publish result via realtime."""
	if not message:
		message = frappe.form_dict.get("message")
	if not message:
		frappe.throw(_("Message cannot be empty"))
	if len(message) > 1000:
		frappe.throw(_("Tin nhắn quá dài (tối đa 1000 ký tự). Vui lòng tóm tắt lại câu hỏi của bạn."))

	student = frappe.session.user
	_ensure_chatbot_access(student)
	_apply_rate_limit(student)

	# Khởi tạo session_key sớm cho FAQ
	if not session_key:
		session_key = get_or_create_session_key(student, lesson_name)

	# Kiểm tra FAQ
	faq_ans = _try_faq(message)
	if faq_ans:
		return {
			"response": faq_ans,
			"message_type": "faq",
			"session_key": session_key,
			"tokens_used": 0,
		}

	if not session_key:
		session_key = get_or_create_session_key(student, lesson_name)

	if not request_id:
		request_id = frappe.generate_hash(length=12)

	initial_state = _build_initial_state(
		message=message,
		student=student,
		lesson_name=lesson_name,
		session_key=session_key,
		**kwargs,
	)

	job = frappe.enqueue(
		"lms.lms.services.chatbot.api._run_chatbot_job",
		queue="long",
		timeout=300,
		user=student,
		lesson_name=lesson_name,
		request_id=request_id,
		initial_state=initial_state,
	)
	job_id = getattr(job, "id", job)

	return {
		"status": "queued",
		"job_id": job_id,
		"session_key": session_key,
		"request_id": request_id,
	}


def _run_chatbot_job(user: str, lesson_name: str, request_id: str, initial_state: dict) -> None:
	"""Background worker entrypoint for chatbot."""
	try:
		frappe.set_user(user)
		_ensure_chatbot_access(user)

		from lms.lms.services.observability import get_unified_config_dict, flush_langfuse
		config = get_unified_config_dict(agent_name="chatbot_agent", session_id=initial_state.get("session_key"), tags=["Chatbot", "Async"])

		final_state = chatbot_graph.invoke(initial_state, config)
		flush_langfuse()
			
		response = final_state.get("response")
		msg_type = final_state.get("message_type", "qa")

		# 4. Persistent Log (MariaDB) - Do this first to get session_name
		session_name = _log_to_db(user, lesson_name, final_state)
		
		# 4.5 HITL Flagging evaluation
		session_doc = frappe.get_doc("Chatbot Session", session_name)
		is_flagged, reason, priority = should_flag_chatbot(final_state, session_doc)
		if is_flagged:
			session_doc.status = "Flagged"
			session_doc.flag_reason = reason
			session_doc.save(ignore_permissions=True)
			notify_teacher(
				event_type="Chatbot Flagged" if not final_state.get("is_blocked") else "Chatbot Blocked",
				student=user,
				course=session_doc.course,
				reference_doctype="Chatbot Session",
				reference_name=session_name,
				reason=reason,
				priority=priority
			)

		# 5. Save to history (Redis + DB)
		if not final_state.get("is_blocked"):
			hist = save_message_to_history(initial_state["session_key"], "user", initial_state.get("user_message"), session_name=session_name)
			save_message_to_history(initial_state["session_key"], "assistant", response, session_name=session_name, history=hist, extra_data=final_state)

		_publish_chatbot_result(
			user,
			{
				"status": "done",
				"request_id": request_id,
				"session_key": initial_state.get("session_key"),
				"response": response,
				"message_type": msg_type,
				"tokens_used": final_state.get("tokens_used", 0),
			},
		)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Chatbot Async Job Error")
		try:
			_publish_chatbot_result(
				user,
				{
					"status": "error",
					"request_id": request_id,
					"session_key": initial_state.get("session_key") if isinstance(initial_state, dict) else None,
					"error": _("An error occurred while processing your request."),
				},
			)
		except Exception:
			pass


@frappe.whitelist()
def get_history(lesson_name: str = None, session_key: str = None):
	"""Retrieves chat history for the current session."""
	student = frappe.session.user
	_ensure_chatbot_access(student)
	if not session_key:
		session_key = get_or_create_session_key(student, lesson_name)
	return get_chat_history(session_key)


@frappe.whitelist()
def reset_session(lesson_name: str = None, session_key: str = None):
	"""Clears history for the current session."""
	student = frappe.session.user
	_ensure_chatbot_access(student)
	if not session_key:
		session_key = get_or_create_session_key(student, lesson_name)
	clear_session(session_key)
	return "OK"


def _log_to_db(student, lesson_name, state):
	"""Logs the interaction to MariaDB for auditing and analytics."""
	try:
		# Create or get session doc
		session_name = frappe.db.get_value("Chatbot Session", {"session_key": state["session_key"]}, "name")
		if not session_name:
			# Get course from lesson
			lesson_doctype = "Course Lesson" if frappe.db.exists("DocType", "Course Lesson") else "LMS Lesson"
			course = frappe.db.get_value(lesson_doctype, lesson_name, "course") if lesson_name else None
			
			# Use data from state if available (for cases where session is created explicitly)
			course = state.get("course_name") or course
			batch = state.get("batch_name")

			doc = frappe.get_doc({
				"doctype": "Chatbot Session",
				"student": student,
				"course": course,
				"batch": batch,
				"lesson": lesson_name,
				"session_key": state["session_key"],
				"last_active": frappe.utils.now_datetime(),
				"message_count": 0,
				"total_tokens": 0
			})
			doc.insert(ignore_permissions=True)
			session_name = doc.name
		else:
			frappe.db.set_value("Chatbot Session", session_name, {
				"last_active": frappe.utils.now_datetime(),
				"message_count": frappe.db.get_value("Chatbot Session", session_name, "message_count") + 2,
				"total_tokens": frappe.db.get_value("Chatbot Session", session_name, "total_tokens") + state.get("tokens_used", 0),
				"input_tokens": frappe.db.get_value("Chatbot Session", session_name, "input_tokens") + state.get("input_tokens", 0),
				"output_tokens": frappe.db.get_value("Chatbot Session", session_name, "output_tokens") + state.get("output_tokens", 0),
				"total_cost_usd": frappe.db.get_value("Chatbot Session", session_name, "total_cost_usd") + state.get("total_cost_usd", 0)
			})

		return session_name
	except Exception as e:
		frappe.log_error(f"Chatbot DB Logging Error: {str(e)}", "Chatbot Logging")
		return None

@frappe.whitelist()
def get_sessions():
	"""Returns all chat sessions for the current user with descriptive titles."""
	student = frappe.session.user
	_ensure_chatbot_access(student)
	sessions = frappe.get_all("Chatbot Session",
		filters={"student": student},
		fields=["name", "session_key", "last_active", "lesson", "course", "batch", "total_tokens", "message_count"],
		order_by="last_active desc"
	)
	
	for s in sessions:
		# Determine title
		if s.get("lesson"):
			s["title"] = s["lesson"]
		elif s.get("batch"):
			s["title"] = _("Lớp: {0}").format(s["batch"])
		elif s.get("course"):
			s["title"] = _("Khóa: {0}").format(s["course"])
		else:
			# Fallback to first message
			first_msg = frappe.db.get_value("Chatbot Message", 
				{"session": s.name, "role": "user"}, "content", order_by="creation asc")
			
			if first_msg:
				s["title"] = (first_msg[:40] + "...") if len(first_msg) > 40 else first_msg
			else:
				s["title"] = _("Thảo luận mới")
				
	return sessions


@frappe.whitelist()
def get_student_info():
	"""Returns basic student info + enrolled courses/batches."""
	student = frappe.session.user
	student_doc = frappe.get_doc("User", student)

	# Get enrolled courses
	enrollments = frappe.get_all(
		"LMS Enrollment",
		filters={"member": student, "member_type": "Student"},
		fields=["course"]
	)
	course_names = [e.course for e in enrollments]
	courses = frappe.get_all(
		"LMS Course",
		filters={"name": ["in", course_names]},
		fields=["name", "course_name as title"]
	) if course_names else []

	# Get batches from LMS Batch Enrollment
	batch_enrollments = frappe.get_all(
		"LMS Batch Enrollment",
		filters={"member": student},
		fields=["batch"]
	)
	batch_names = [be.batch for be in batch_enrollments]
	batches = frappe.get_all(
		"LMS Batch",
		filters={"name": ["in", batch_names]},
		fields=["name", "title"]
	) if batch_names else []

	return {
		"name": student_doc.full_name,
		"email": student_doc.email,
		"avatar": student_doc.user_image,
		"courses": courses,
		"batches": batches
	}


@frappe.whitelist()
def get_student_context():
	"""Returns basic context for the student UI, filtered by enrollment."""
	student = frappe.session.user
	_ensure_chatbot_access(student)
	
	# 1. Fetch Enrolled Courses
	enrolled_courses = frappe.get_all("LMS Enrollment", 
		filters={"member": student}, 
		pluck="course"
	)
	courses = frappe.get_all("LMS Course", 
		filters={"name": ["in", enrolled_courses]},
		fields=["name", "title"]
	) if enrolled_courses else []
	
	# 2. Fetch Enrolled Batches
	enrolled_batches = frappe.get_all("LMS Batch Enrollment",
		filters={"member": student},
		pluck="batch"
	)
	batches = frappe.get_all("LMS Batch",
		filters={"name": ["in", enrolled_batches]},
		fields=["name", "title"]
	) if enrolled_batches else []
	
	return {
		"courses": courses,
		"batches": batches
	}


@frappe.whitelist()
def create_session(course: str = None, batch: str = None, lesson: str = None):
	"""Explicitly creates a new chat session."""
	student = frappe.session.user
	_ensure_chatbot_access(student)
	session_key = get_or_create_session_key(student, f"{lesson or 'general'}_{frappe.utils.now()}")
	
	doc = frappe.get_doc({
		"doctype": "Chatbot Session",
		"student": student,
		"course": course,
		"lesson": lesson,
		"session_key": session_key,
		"last_active": frappe.utils.now_datetime()
	})
	doc.insert(ignore_permissions=True)
	return {"session_key": session_key}


@frappe.whitelist()
def delete_session(session_key: str):
	"""Deletes a chat session and its history."""
	student = frappe.session.user
	_ensure_chatbot_access(student)
	session_name = frappe.db.get_value("Chatbot Session", {"session_key": session_key, "student": student}, "name")
	if session_name:
		# Delete linked messages first to avoid LinkExistsError
		frappe.db.delete("Chatbot Message", {"session": session_name})
		frappe.delete_doc("Chatbot Session", session_name, ignore_permissions=True)
		clear_session(session_key)
	return "OK"


@frappe.whitelist()
def debug_user_name(search_name):
	"""Tiện ích kiểm tra nhanh tên học sinh từ Terminal"""
	user = frappe.session.user
	if user != "Administrator" and not frappe.has_role("System Manager", user=user):
		frappe.throw(_("You do not have permission to use this tool"))

	user_id = frappe.db.get_value("User", {"full_name": ["like", f"%{search_name}%"]}, "name")
	if user_id:
		user_doc = frappe.get_doc("User", user_id)
		return {"id": user_doc.name, "full_name": user_doc.full_name}
def debug_recent_session():
	session = frappe.get_all("Chatbot Session", order_by="creation desc", limit=1)[0]
	session_name = session.name
	session_key = frappe.db.get_value("Chatbot Session", session_name, "session_key")
	print(f"Session: {session_name}")
	messages = frappe.get_all("Chatbot Message", filters={"session": session_name}, fields=["role", "content"], order_by="creation asc")
	print("--- DB MESSAGES ---")
	for i, m in enumerate(messages):
		print(f"{i+1}. [{m.role}] {m.content[:50]}")
	
	from lms.lms.services.chatbot.session import get_chat_history
	hist = get_chat_history(session_key)
	print("--- REDIS/GET_CHAT_HISTORY ---")
	for i, m in enumerate(hist):
		print(f"{i+1}. [{m.get('role')}] {m.get('content')[:50]}")


