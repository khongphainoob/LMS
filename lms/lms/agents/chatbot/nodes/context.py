import frappe
from ..state import ChatbotState


def context_node(state: ChatbotState) -> dict:
	"""Fetches necessary context from Frappe LMS DB with Redis Caching."""
	student_name = state.get("student_name")
	course_name = state.get("course_name")
	batch_name = state.get("batch_name")
	lesson_name = state.get("lesson_name")
	session_key = state.get("session_key")

	# --- REDIS CACHE LAYER ---
	# Tạo cache key duy nhất dựa trên ngữ cảnh hiện tại
	cache_key = f"chatbot:context:{student_name}:{course_name or 'none'}:{batch_name or 'none'}:{lesson_name or 'none'}"
	cache = frappe.cache()
	cached_context = cache.get_value(cache_key)

	if cached_context:
		print(f"--- [NODE: CONTEXT] Cache Hit for {student_name} ---")
		return cached_context

	print(f"--- [NODE: CONTEXT] Cache Miss! Fetching data from DB for {student_name} ---")
	updates = {}
	
	# 0. Fetch Session Info if provided
	if session_key:
		try:
			session_data = frappe.db.get_value("Chatbot Session", 
				{"session_key": session_key}, 
				["course", "batch", "lesson"], as_dict=1)
			if session_data:
				if not lesson_name: lesson_name = session_data.lesson
				if not course_name: course_name = session_data.course
				if not batch_name: batch_name = session_data.batch
		except Exception:
			pass

	# 1. Fetch Lesson & Course Content
	lesson_doctype = "Course Lesson" if frappe.db.exists("DocType", "Course Lesson") else "LMS Lesson"
	
	if lesson_name:
		try:
			if frappe.db.exists(lesson_doctype, lesson_name):
				lesson = frappe.get_doc(lesson_doctype, lesson_name)
				updates["lesson_title"] = lesson.title
				
				content_parts = []
				for field in ["content", "lesson_content", "sections"]:
					if hasattr(lesson, field):
						val = getattr(lesson, field)
						if isinstance(val, str):
							content_parts.append(val)
						elif isinstance(val, list):
							for row in val:
								if hasattr(row, "content") and row.content:
									content_parts.append(row.content)
				
				updates["lesson_content"] = "\n\n".join(filter(None, content_parts))

				if hasattr(lesson, "course") and lesson.course:
					course_doctype = "Course" if frappe.db.exists("DocType", "Course") else "LMS Course"
					course = frappe.get_doc(course_doctype, lesson.course)
					updates["course_title"] = course.title
			else:
				print(f"--- [DEBUG] Lesson {lesson_name} not found, skipping detailed lesson context ---")
		except Exception as e:
			print(f"--- [ERROR] Chatbot Context (Lesson): {e} ---")

	# 1b. Fetch Course/Batch Title if lesson is missing
	if not updates.get("course_title") and course_name:
		try:
			course_doctype = "Course" if frappe.db.exists("DocType", "Course") else "LMS Course"
			updates["course_title"] = frappe.db.get_value(course_doctype, course_name, "title")
		except Exception:
			pass
			
	if batch_name:
		try:
			updates["batch_title"] = frappe.db.get_value("LMS Batch", batch_name, "title")
		except Exception:
			pass

	# 2. Fetch Student Info & Progress
	if student_name:
		try:
			from ..skills.student_skills import get_student_course_info
			course_title = updates.get("course_title") or None
			student_profile = get_student_course_info.func(student_name, course_title)
			updates["student_profile"] = student_profile
			
			if "Student Name:" in student_profile:
				resolved_name = student_profile.split("\n")[0].replace("Student Name: ", "")
				updates["student_display_name"] = resolved_name
			
			if lesson_name:
				progress_doctype = "LMS Course Progress"
				progress = frappe.db.get_value(
					progress_doctype, 
					{"member": student_name, "lesson": lesson_name}, 
					"status"
				)
				if progress:
					updates["student_progress"] = progress
		except Exception as e:
			print(f"--- [ERROR] Chatbot Context (Student): {e} ---")

	# --- SAVE TO CACHE ---
	# Cache kết quả trong 600 giây (10 phút)
	cache.set_value(cache_key, updates, expires_in_sec=600)
	return updates
