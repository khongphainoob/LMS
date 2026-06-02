import frappe
import json
import re
from frappe import _
from frappe.utils import cint, get_url, now_datetime
from frappe.utils.file_manager import save_file, safe_b64decode
from frappe.core.doctype.file.utils import get_random_filename
from binascii import Error as BinasciiError
from lms.lms.services.ai_rate_limit import check_and_record_usage

@frappe.whitelist()
def get_rubric_templates():
	"""Returns a list of available rubric templates."""
	return frappe.get_all("LMS Rubric Template", fields=["name", "title", "description", "is_active"])

@frappe.whitelist()
def get_rubric_stats():
	"""Returns statistics for rubrics."""
	return {
		"total_templates": frappe.db.count("LMS Rubric Template"),
		"total_criteria": frappe.db.count("LMS Rubric Criterion")
	}

@frappe.whitelist()
def get_rubric_detail(name):
	"""Returns full detail of a rubric template including criteria."""
	if not name:
		frappe.throw(_("Rubric name is required"))
	
	rubric = frappe.get_doc("LMS Rubric Template", name)
	return {
		"name": rubric.name,
		"title": rubric.title,
		"description": rubric.description,
		"criteria": rubric.criteria
	}

@frappe.whitelist()
def export_rubric(name):
	"""Exports a rubric template to a Word document with MathJax support."""
	from lms.lms.services.rubric_builder.rubric_builder_service import RubricBuilderService
	return RubricBuilderService().export_rubric(name)

@frappe.whitelist()
def get_ai_grading_sessions(grading_type=None, start=0, limit=20, search=None):
	"""Get all AI Grading Sessions for current user with pagination and search."""
	filters = {}
	if grading_type:
		filters["grading_type"] = grading_type
	
	if search:
		filters["session_name"] = ["like", f"%{search}%"]

	return frappe.get_all(
		"AI Grading Session",
		filters=filters,
		fields=["name", "session_name", "route_slug", "grading_type", "subject", "level", "status", "modified"],
		order_by="modified desc",
		limit_start=start,
		limit_page_length=limit,
	)

@frappe.whitelist()
def get_ai_grading_stats():
	"""Get statistics for AI Grading dashboard."""
	from frappe.utils import getdate, now
	stats = frappe._dict()
	stats.gradedToday = frappe.db.count(
		"AI Grading Submission",
		{"status": "Done", "modified": [">", f"{getdate(now())} 00:00:00"]},
	)
	stats.needReview = frappe.db.count("AI Grading Submission", {"status": "Flagged"})
	stats.openSessions = frappe.db.count("AI Grading Session", {"status": "Open"})
	return stats

@frappe.whitelist()
def create_ai_grading_session(data):
	"""Create a new AI Grading Session and initialize submissions."""
	if isinstance(data, str):
		data = json.loads(data)
	doc = frappe.new_doc("AI Grading Session")
	doc.route_slug = _slugify_ai_grading_session_name(data.get("session_name", ""))
	doc.update(data)
	doc.insert()

	if doc.batch:
		enrollments = frappe.get_all(
			"LMS Enrollment",
			filters={"enrollment_from_batch": doc.batch},
			fields=["member", "member_name"],
		)
		for en in enrollments:
			sub = frappe.new_doc("AI Grading Submission")
			sub.session = doc.name
			sub.student = en.member
			sub.status = "Pending"
			sub.insert()

	return {
		"name": doc.name,
		"session_name": doc.session_name,
		"route_slug": doc.route_slug
	}

@frappe.whitelist()
def update_ai_grading_session(session, data):
	"""Update an existing AI Grading Session."""
	if isinstance(data, str):
		data = json.loads(data)
	
	doc = frappe.get_doc("AI Grading Session", session)
	doc.update(data)
	if "session_name" in data:
		doc.route_slug = _slugify_ai_grading_session_name(data.get("session_name"))
	doc.save()
	return doc.name

@frappe.whitelist()
def delete_ai_grading_session(session):
	"""Delete an AI Grading Session and all associated submissions."""
	frappe.db.delete("AI Grading Submission", {"session": session})
	frappe.delete_doc("AI Grading Session", session)
	return True

@frappe.whitelist()
def get_ai_grading_session_detail(session):
	"""Get details for a single AI Grading Session."""
	return get_ai_grading_session_by_name(session)

@frappe.whitelist()
def get_ai_grading_submissions(session):
	"""Get all submissions for a given session."""
	submissions = frappe.get_all(
		"AI Grading Submission",
		filters={"session": session},
		fields=[
			"name",
			"student",
			"student_name",
			"student_sbd",
			"status",
			"score",
			"ai_rating",
			"paper_image",
			"ai_feedback",
			"teacher_feedback",
		],
		order_by="creation asc",
	)

	for submission in submissions:
		inputs = _get_ai_grading_inputs(submission.name, submission.paper_image)
		submission.paper_images = inputs["images"]
		submission.text_content = inputs["text_content"]

	return submissions

@frappe.whitelist()
def sync_ai_grading_submissions(session):
	"""Sync student submissions from the referenced LMS Assignment/Quiz."""
	session_doc = frappe.get_doc("AI Grading Session", session)
	if not session_doc.reference_doc:
		return {"status": "info", "message": "No reference document linked."}

	valid_members = None
	if session_doc.batch:
		enrollments = frappe.get_all(
			"LMS Enrollment",
			filters={"enrollment_from_batch": session_doc.batch},
			fields=["member"]
		)
		valid_members = {en.member for en in enrollments}

	synced_count = 0
	if session_doc.reference_doc_type == "LMS Assignment":
		submissions = frappe.get_all(
			"LMS Assignment Submission",
			filters={"assignment": session_doc.reference_doc},
			fields=["name", "member", "member_name"]
		)
		for sub in submissions:
			if valid_members is not None and sub.member not in valid_members:
				continue
			if not frappe.db.exists("AI Grading Submission", {"session": session, "student": sub.member}):
				new_sub = frappe.get_doc({
					"doctype": "AI Grading Submission",
					"session": session,
					"student": sub.member,
					"student_name": sub.member_name,
					"status": "Pending",
					"lms_assignment_submission": sub.name
				})
				new_sub.insert(ignore_permissions=True)
				synced_count += 1

	elif session_doc.reference_doc_type == "LMS Quiz":
		submissions = frappe.get_all(
			"LMS Quiz Submission",
			filters={"quiz": session_doc.reference_doc},
			fields=["name", "member", "member_name"]
		)
		for sub in submissions:
			if valid_members is not None and sub.member not in valid_members:
				continue
			if not frappe.db.exists("AI Grading Submission", {"session": session, "student": sub.member}):
				new_sub = frappe.get_doc({
					"doctype": "AI Grading Submission",
					"session": session,
					"student": sub.member,
					"student_name": sub.member_name,
					"status": "Pending",
					"lms_quiz_submission": sub.name
				})
				new_sub.insert(ignore_permissions=True)
				synced_count += 1

	frappe.db.commit()
	return {"status": "success", "synced_count": synced_count}

def _is_ai_grading_image_file(file_url):
	if not file_url:
		return False
	file_url = file_url.lower()
	return file_url.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"))

def _get_ai_grading_inputs(submission_name, primary_image=None):
	images = []
	file_urls = []
	text_content = ""

	if primary_image:
		images.append(primary_image)

	# 1. Fetch attachments from AI Grading Submission directly
	attached_files = frappe.get_all(
		"File",
		filters={
			"attached_to_doctype": "AI Grading Submission",
			"attached_to_name": submission_name,
			"is_private": 0,
		},
		fields=["file_url"],
		order_by="creation asc",
	)

	for file_doc in attached_files:
		file_url = getattr(file_doc, "file_url", None)
		if file_url:
			if _is_ai_grading_image_file(file_url) and file_url not in images:
				images.append(file_url)
			elif not _is_ai_grading_image_file(file_url) and file_url not in file_urls:
				file_urls.append(file_url)

	# 2. Fetch inputs from linked LMS Assignment Submission if available
	sub_doc = frappe.get_doc("AI Grading Submission", submission_name)
	if sub_doc.lms_assignment_submission:
		try:
			lms_sub = frappe.get_doc("LMS Assignment Submission", sub_doc.lms_assignment_submission)
			if getattr(lms_sub, "answer", None):
				text_content += "ASSIGNMENT TEXT SUBMISSION:\n"
				text_content += frappe.utils.strip_html(lms_sub.answer) + "\n\n"
			
			if getattr(lms_sub, "assignment_attachment", None):
				url = lms_sub.assignment_attachment
				if _is_ai_grading_image_file(url) and url not in images:
					images.append(url)
				elif not _is_ai_grading_image_file(url) and url not in file_urls:
					file_urls.append(url)
		except Exception:
			pass

	# 3. Fetch inputs from linked LMS Quiz Submission
	if sub_doc.lms_quiz_submission:
		try:
			quiz_sub = frappe.get_doc("LMS Quiz Submission", sub_doc.lms_quiz_submission)
			# Extract answers from the result child table
			if getattr(quiz_sub, "result", None):
				text_content += "QUIZ TEXT SUBMISSIONS:\n"
				for idx, res in enumerate(quiz_sub.result):
					q_text = frappe.utils.strip_html(res.question or "")
					a_text = frappe.utils.strip_html(res.answer or "")
					text_content += f"Question {idx+1}: {q_text}\n"
					text_content += f"Answer: {a_text}\n\n"
		except Exception as e:
			frappe.log_error(f"Error fetching quiz submission: {str(e)}", "AI Grading")

	# Extract text from files
	if file_urls:
		extracted = _extract_text_from_files(file_urls)
		if extracted:
			text_content += extracted + "\n"

	return {"images": images, "text_content": text_content.strip()}

def _extract_text_from_files(file_urls):
	text = ""
	for url in file_urls:
		try:
			file_doc = frappe.get_doc("File", {"file_url": url})
			file_path = file_doc.get_full_path()
			
			if url.lower().endswith(('.pdf', '.docx', '.doc', '.txt', '.md')):
				from lms.lms.agents.utils.file_parser import get_content_from_file
				text += get_content_from_file(file_path) + "\n"
		except Exception as e:
			frappe.log_error(f"Error extracting text from {url}: {str(e)}", "AI Grading Text Extraction")
	return text

@frappe.whitelist()
def search_ai_grading_students(query=None, limit=20):
	limit = cint(limit) if limit else 20
	filters = {
		"enabled": 1,
		"name": ["not in", ["Administrator", "Guest"]],
	}
	or_filters = None
	if query:
		query = query.strip()
		if query:
			or_filters = [
				{"name": ["like", f"%{query}%"]},
				{"username": ["like", f"%{query}%"]},
				{"full_name": ["like", f"%{query}%"]},
			]

	users = frappe.get_all(
		"User",
		filters=filters,
		or_filters=or_filters,
		fields=["name", "username", "full_name", "user_image"],
		order_by="full_name asc",
		limit_page_length=limit,
	)

	return users

@frappe.whitelist()
def add_ai_grading_submission(
	session,
	student,
	student_name=None,
	student_sbd=None,
	paper_image=None,
	paper_image_data=None,
	paper_image_name=None,
	paper_images_data=None,
	paper_images_names=None,
):
	if not session or not frappe.db.exists("AI Grading Session", session):
		frappe.throw(_("AI Grading Session not found."))

	student = (student or "").strip()
	user_name = student
	if not frappe.db.exists("User", user_name):
		user_name = frappe.db.get_value("User", {"username": student}, "name")

	if not user_name:
		frappe.throw(_("Student not found."))

	existing = frappe.db.exists("AI Grading Submission", {"session": session, "student": user_name})
	if existing:
		return frappe.get_doc("AI Grading Submission", existing).as_dict()

	doc = frappe.new_doc("AI Grading Submission")
	doc.session = session
	doc.student = user_name
	doc.student_name = student_name or frappe.db.get_value("User", user_name, "full_name")
	doc.student_sbd = student_sbd
	doc.status = "Pending"
	doc.insert()

	image_payloads = []
	if paper_images_data:
		image_payloads = json.loads(paper_images_data) if isinstance(paper_images_data, str) else paper_images_data
	elif paper_image_data:
		image_payloads = [paper_image_data]

	image_names = []
	if paper_images_names:
		image_names = json.loads(paper_images_names) if isinstance(paper_images_names, str) else paper_images_names
	elif paper_image_name:
		image_names = [paper_image_name]

	saved_urls = []
	for idx, payload in enumerate(image_payloads):
		name = image_names[idx] if idx < len(image_names) else None
		url = _save_ai_grading_submission_image_data(payload, name, doc.doctype, doc.name)
		if url: saved_urls.append(url)

	if saved_urls:
		doc.paper_image = saved_urls[0]
		doc.save(ignore_permissions=True)

	return doc.as_dict()

def _save_ai_grading_submission_image_data(data_url, file_name, attached_to_doctype, attached_to_name):
	if not data_url or not isinstance(data_url, str): return None
	if data_url.startswith("/files/"): return data_url
	
	try:
		if "," in data_url:
			headers, content = data_url.split(",", 1)
			mime_type = headers.split(";", 1)[0].replace("data:", "")
		else:
			content = data_url
			mime_type = "image/jpeg"
		
		content_bytes = safe_b64decode(content.encode("utf-8"))
		filename = file_name or get_random_filename(content_type=mime_type)
		file_doc = frappe.get_doc({
			"doctype": "File",
			"file_name": filename,
			"content": content_bytes,
			"attached_to_doctype": attached_to_doctype,
			"attached_to_name": attached_to_name,
			"is_private": False
		})
		file_doc.save(ignore_permissions=True)
		return file_doc.file_url
	except Exception:
		return None

@frappe.whitelist()
def get_ai_grading_session_by_name(session_name):
	session_detail = frappe.db.get_value(
		"AI Grading Session",
		session_name,
		["name", "session_name", "route_slug", "grading_type", "subject", "level", "status", "ai_notes", "reference_doc_type", "reference_doc"],
		as_dict=1,
	)
	if not session_detail:
		frappe.throw(_("AI Grading Session not found."))
	session_detail.submissions = get_ai_grading_submissions(session_detail.name)
	return session_detail

@frappe.whitelist()
def save_ai_grading_result(submission_id, data):
	if isinstance(data, str): data = json.loads(data)
	doc = frappe.get_doc("AI Grading Submission", submission_id)
	doc.update(data)
	doc.save()
	return doc.name

@frappe.whitelist()
def get_ai_grading_session_by_slug(session_slug, grading_type=None):
	normalized_slug = _slugify_ai_grading_session_name(session_slug)
	detail_fields = ["name", "session_name", "route_slug", "grading_type", "subject", "level", "status", "ai_notes", "reference_doc_type", "reference_doc"]
	
	filters = {"route_slug": normalized_slug}
	if grading_type: filters["grading_type"] = grading_type
	
	session = frappe.db.get_value("AI Grading Session", filters, detail_fields, as_dict=1)
	if not session:
		# Fallback to name
		session = frappe.db.get_value("AI Grading Session", session_slug, detail_fields, as_dict=1)
		
	if not session:
		frappe.throw(_("Session not found."))
	return session

def _slugify_ai_grading_session_name(value):
	import unicodedata
	text = (value or "").strip().lower()
	text = text.replace("đ", "d").replace("Đ", "d")
	text = unicodedata.normalize("NFKD", text)
	text = "".join(c for c in text if not unicodedata.combining(c))
	text = re.sub(r"[^a-z0-9]+", "-", text)
	return text.strip("-")

@frappe.whitelist()
def get_ai_grading_analytics():
	frappe.only_for("Moderator")
	from frappe.utils import getdate, now
	today = getdate(now())
	return {
		"total_sessions": frappe.db.count("AI Grading Session"),
		"total_submissions": frappe.db.count("AI Grading Submission"),
		"graded_today": frappe.db.count("AI Grading Submission", {"status": "Done", "modified": [">=", f"{today} 00:00:00"]}),
	}

@frappe.whitelist()
def get_ai_grading_dissatisfaction_feed(limit=20):
	frappe.only_for("Moderator")
	return frappe.get_all("AI Grading Submission", filters={"ai_rating": "Dissatisfied"}, fields=["name", "session", "student_name", "score", "modified"], order_by="modified desc", limit_page_length=limit)

@frappe.whitelist()
def get_ai_grading_session_statistics(session):
	submissions = frappe.get_all("AI Grading Submission", filters={"session": session}, fields=["name", "score", "status"])
	graded = [s for s in submissions if s.status == "Done"]
	return {
		"total": len(submissions),
		"graded": len(graded),
		"avg_score": sum([s.score or 0 for s in graded]) / len(graded) if graded else 0
	}

@frappe.whitelist()
def send_ai_grading_result_email(submission):
	sub = frappe.get_doc("AI Grading Submission", submission)
	frappe.sendmail(recipients=[sub.student], subject=_("AI Grading Result"), content=f"Your score: {sub.score}")
	return True

@frappe.whitelist()
def get_ai_grading_session_attachments(session):
	return frappe.get_all("File", filters={"attached_to_doctype": "AI Grading Session", "attached_to_name": session}, fields=["file_url", "file_name"])

@frappe.whitelist()
def upload_ai_grading_session_attachment(session, file_url, file_name=None):
	# Implementation simplified for refactoring
	return True

class AIGradingService:
	"""Placeholder for AIGradingService to prevent import errors."""
	def __init__(self, session_name=None):
		self.session_name = session_name
		if session_name:
			self.session = frappe.get_doc("AI Grading Session", session_name)

	def grade_submission(self, submission_name):
		"""Main grading logic should go here."""
		pass


def _ai_grading_stop_key(submission: str) -> str:
	return f"ai_grading:stop:{submission}"


def _ai_grading_job_id_key(submission: str) -> str:
	return f"ai_grading:job_id:{submission}"


def _ensure_ai_grading_access_for_submission(submission: str, ptype: str = "write") -> None:
	if not submission:
		frappe.throw(_("Submission is required."))
	frappe.has_permission("AI Grading Submission", doc=submission, ptype=ptype, throw=True)


def _ensure_ai_grading_access_for_session(session: str, ptype: str = "write") -> None:
	if not session:
		frappe.throw(_("Session is required."))
	frappe.has_permission("AI Grading Session", doc=session, ptype=ptype, throw=True)


def _set_submission_status(submission: str, status: str, extra: dict | None = None) -> None:
	values = {"status": status}
	if extra:
		values.update(extra)
	frappe.db.set_value("AI Grading Submission", submission, values, update_modified=True)


def _extract_total_score(result: dict) -> float | None:
	if not isinstance(result, dict):
		return None
	for key in ("total_score", "score"):
		value = result.get(key)
		if value is None:
			continue
		try:
			return float(value)
		except Exception:
			return None
	return None


def _should_flag_result(result: dict) -> bool:
	if not isinstance(result, dict):
		return False
	conf = result.get("confidence", 1.0)
	consistency = result.get("consistency_score", 1.0)
	try:
		# Auto-accept only if both are high
		if float(conf) >= 0.8 and float(consistency) >= 0.9:
			return False
		return True
	except Exception:
		return True


@frappe.whitelist(methods=["POST"])
def start_ai_grading_sync(submission: str):
	"""Start AI grading for a submission.

	Despite the historical name, this endpoint is async: it enqueues a background job and returns immediately.
	Frontend can poll `get_ai_grading_status`.
	"""
	_ensure_ai_grading_access_for_submission(submission, ptype="write")
	
	doc = frappe.get_doc("AI Grading Submission", submission)
	if (doc.retry_count or 0) >= 2:
		frappe.throw(_("Bài thi này đã đạt giới hạn chấm AI tối đa (2 lần) để tiết kiệm chi phí."))
		
	check_and_record_usage(frappe.session.user, "AI Grading", increment=1)

	# Best-effort: mark as grading immediately
	_set_submission_status(
		submission,
		"Grading",
		{
			"grading_started_at": now_datetime(),
			"last_error": None,
			"retry_count": (doc.retry_count or 0) + 1
		},
	)

	# Clear stop-request (if any)
	frappe.cache().delete_value(_ai_grading_stop_key(submission))
	frappe.db.commit()

	job = frappe.enqueue(
		"lms.lms.services.ai_grading.api._run_ai_grading_job",
		queue="long",
		timeout=60 * 60,
		submission=submission,
		requested_by=frappe.session.user,
	)
	job_id = getattr(job, "id", job)
	frappe.cache().set_value(_ai_grading_job_id_key(submission), str(job_id), expires_in_sec=3600)

	return {"success": True, "status": "queued", "job_id": job_id}


@frappe.whitelist(methods=["POST"])
def start_batch_ai_grading(session: str):
	"""Start batch AI grading for all submissions in a session (async enqueue)."""
	_ensure_ai_grading_access_for_session(session, ptype="write")

	# Fetch pending/flagged/failed submissions synchronously
	submissions = frappe.get_all(
		"AI Grading Submission",
		filters={"session": session, "status": ["in", ["Pending", "Flagged", "Failed"]]},
		fields=["name", "retry_count"],
	)

	submission_ids = []
	for sub in submissions:
		if (sub.retry_count or 0) >= 2:
			continue
		
		# Synchronously set status to "Grading" so the UI immediately reflects it
		_set_submission_status(
			sub.name, 
			"Grading", 
			{
				"grading_started_at": now_datetime(), 
				"last_error": None, 
				"retry_count": (sub.retry_count or 0) + 1
			}
		)
		frappe.cache().delete_value(_ai_grading_stop_key(sub.name))
		submission_ids.append(sub.name)

	frappe.db.commit()

	if not submission_ids:
		return {"success": True, "status": "completed", "message": "Không có bài thi nào cần chấm."}

	# Enqueue batch job runner with the list of submission IDs
	job = frappe.enqueue(
		"lms.lms.services.ai_grading.api._run_ai_grading_batch_job",
		queue="long",
		timeout=60 * 60,
		session=session,
		submission_ids=submission_ids,
		requested_by=frappe.session.user,
	)
	job_id = getattr(job, "id", job)
	return {"success": True, "status": "queued", "job_id": job_id, "submission_ids": submission_ids}


@frappe.whitelist()
def get_ai_grading_status(submission: str):
	"""Return current grading status for a submission (for polling)."""
	_ensure_ai_grading_access_for_submission(submission, ptype="read")
	row = frappe.db.get_value(
		"AI Grading Submission",
		submission,
		["status", "last_error", "grading_started_at", "grading_completed_at"],
		as_dict=True,
	)
	if not row:
		frappe.throw(_("Submission not found."))
	return {
		"status": row.status,
		"last_error": row.last_error,
		"grading_started_at": row.grading_started_at,
		"grading_completed_at": row.grading_completed_at,
	}


@frappe.whitelist(methods=["POST"])
def stop_ai_grading(submission: str):
	"""Soft-stop a running grading job.

	We cannot reliably cancel an RQ job without job id + queue access, so this sets a stop request flag in Redis.
	Worker checks the flag and exits without writing results.
	"""
	_ensure_ai_grading_access_for_submission(submission, ptype="write")
	frappe.cache().set_value(_ai_grading_stop_key(submission), "1", expires_in_sec=3600)
	
	doc = frappe.get_doc("AI Grading Submission", submission)
	new_count = max((doc.retry_count or 0) - 1, 0)
	
	_set_submission_status(submission, "Pending", {"retry_count": new_count})
	return {"success": True, "status": "stop_requested"}


def _run_ai_grading_batch_job(session: str, submission_ids: list | None = None, requested_by: str | None = None) -> None:
	"""Background job: enqueue grading jobs for all pending/flagged submissions in a session."""
	if requested_by:
		frappe.set_user(requested_by)
	if not session:
		return

	# Fallback if submission_ids not passed
	if not submission_ids:
		submissions = frappe.get_all(
			"AI Grading Submission",
			filters={"session": session, "status": ["in", ["Pending", "Flagged", "Failed"]]},
			fields=["name"],
			order_by="creation asc",
		)
		submission_ids = [sub.name for sub in submissions]

	dispatched_count = 0
	for submission_id in submission_ids:
		try:
			from lms.lms.services.ai_rate_limit import check_and_record_usage
			try:
				check_and_record_usage(requested_by, "AI Grading", increment=1)
			except Exception as e:
				frappe.log_error(frappe.get_traceback(), f"AI Grading Rate Limit Exceeded for {requested_by}")
				
				# Reset all remaining submissions in this batch so they don't get stuck in "Grading" status
				curr_idx = submission_ids.index(submission_id)
				for rest_id in submission_ids[curr_idx:]:
					_set_submission_status(
						rest_id, 
						"Failed", 
						{
							"last_error": "Giới hạn ngân sách hoặc số lượt gọi AI hôm nay đã hết. Vui lòng thử lại sau.",
							"retry_count": max((frappe.db.get_value("AI Grading Submission", rest_id, "retry_count") or 1) - 1, 0)
						}
					)
				break

			frappe.cache().delete_value(_ai_grading_stop_key(submission_id))
			frappe.enqueue(
				"lms.lms.services.ai_grading.api._run_ai_grading_job",
				queue="long",
				timeout=60 * 60,
				submission=submission_id,
				requested_by=requested_by,
			)
			dispatched_count += 1
		except Exception:
			frappe.log_error(frappe.get_traceback(), f"AI Grading enqueue failed: {submission_id}")
			_set_submission_status(submission_id, "Failed", {"last_error": "Không thể đưa bài thi vào hàng đợi."})

	# Notify teacher: batch dispatched
	if requested_by and dispatched_count > 0:
		try:
			from lms.lms.services.hitl.notification import notify_user_direct
			from lms.lms.utils import get_lms_route
			session_name = frappe.db.get_value("AI Grading Session", session, "session_name") or session
			notify_user_direct(
				for_user=requested_by,
				subject=f"⚡ Chấm điểm AI đang xử lý: {session_name}",
				email_content=(
					f"Phiên chấm điểm <b>{session_name}</b> đã bắt đầu xử lý.<br>"
					f"<b>{dispatched_count}</b> bài đã được đưa vào hàng đợi AI.<br>"
					f"Kết quả sẽ xuất hiện dần trên giao diện — bài nào bị gắn cờ sẽ được thông báo riêng."
				),
				document_type="AI Grading Session",
				document_name=session,
				link=get_lms_route("ai-grading"),
			)
		except Exception:
			pass


try:
	from langfuse import observe
except ImportError:
	try:
		from langfuse import observe
	except ImportError:
		def observe(*args, **kwargs):
			def decorator(func):
				return func
			return decorator

def _run_ai_grading_job(submission: str, requested_by: str | None = None) -> None:
	"""Background job: run grading pipeline and persist results to `AI Grading Submission`."""
	from lms.lms.services.observability import init_langfuse_native_sdk
	init_langfuse_native_sdk()
	
	from lms.lms.agents.grading.orchestrator import run_grading_session

	try:
		if requested_by:
			frappe.set_user(requested_by)
		# Stop requested before starting
		if frappe.cache().get_value(_ai_grading_stop_key(submission)):
			return

		doc = frappe.get_doc("AI Grading Submission", submission)
		inputs = _get_ai_grading_inputs(doc.name, doc.paper_image)
		paper_images = inputs["images"]
		text_content = inputs["text_content"]

		if not paper_images and not text_content:
			_set_submission_status(
				submission,
				"Failed",
				{
					"grading_completed_at": now_datetime(),
					"last_error": _("No paper images or text found for this submission."),
				},
			)
			frappe.db.commit()
			return
		
		result = run_grading_session(session_id=submission, image_paths=paper_images, text_content=text_content)
		if frappe.cache().get_value(_ai_grading_stop_key(submission)):
			return

		if isinstance(result, dict) and result.get("error"):
			_set_submission_status(
				submission,
				"Failed",
				{
					"grading_completed_at": now_datetime(),
					"last_error": str(result.get("error")),
				},
			)
			frappe.db.commit()
			return

		score = _extract_total_score(result)
		
		# Token & Cost Estimation
		est_input_tokens = (len(paper_images) * 300 + len(text_content) // 4) * 2
		est_output_tokens = 1500
		
		from lms.lms.agents.provider import get_llm
		_, _, cost_info = get_llm("visual_analysis")
		cost_in = cost_info.get("cost_input", 0) or 0.0003
		cost_out = cost_info.get("cost_output", 0) or 0.0025
		est_cost = (est_input_tokens / 1000000) * cost_in + (est_output_tokens / 1000000) * cost_out

		# Evaluate HITL flagging
		from lms.lms.services.hitl.flagging import should_flag_grading
		from lms.lms.services.hitl.notification import notify_teacher
		
		session_doc = frappe.get_doc("AI Grading Session", doc.session)
		max_score = 10.0
		if session_doc.rubric:
			rubric_doc = frappe.get_doc("AI Grading Rubric", session_doc.rubric)
			max_score = rubric_doc.total_max_score or 10.0
		
		is_flagged, reason, priority = should_flag_grading(result, max_score)
		final_status = "Flagged" if is_flagged else "Done"

		extra = {
			"grading_completed_at": now_datetime(),
			"ai_feedback": json.dumps(result, ensure_ascii=False),
			"last_error": None,
			"tokens_used": est_input_tokens + est_output_tokens,
			"input_tokens": est_input_tokens,
			"output_tokens": est_output_tokens,
			"estimated_cost_usd": est_cost
		}
		if score is not None:
			extra["score"] = score
		if is_flagged:
			extra["flag_reason"] = reason

		try:
			from lms.lms.services.cost_tracking import track_agent_cost
			track_agent_cost("grading_rubric", est_cost)
		except Exception:
			pass

		_set_submission_status(submission, final_status, extra)
		frappe.db.commit()
		
		if is_flagged:
			notify_teacher(
				event_type="Grading Flagged",
				student=doc.student,
				course=session_doc.course,
				reference_doctype="AI Grading Submission",
				reference_name=doc.name,
				reason=reason,
				priority=priority
			)
	except Exception:
		frappe.log_error(frappe.get_traceback(), f"AI Grading job failed: {submission}")
		try:
			_set_submission_status(
				submission,
				"Failed",
				{
					"grading_completed_at": now_datetime(),
					"last_error": _("An error occurred during grading."),
				},
			)
			frappe.db.commit()
		except Exception:
			pass
	finally:
		try:
			from langfuse import Langfuse
			Langfuse().flush()
		except Exception:
			pass

@frappe.whitelist()
def estimate_grading_cost(session_name):
	"""Estimates the cost of grading for a session."""
	return {"estimated_cost": 0, "currency": "USD"}
