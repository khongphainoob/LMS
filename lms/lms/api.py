"""API methods for the LMS."""

import json
import os
import re
import shutil
import xml.etree.ElementTree as ET
import zipfile
from binascii import Error as BinasciiError
from datetime import timedelta
from xml.dom.minidom import parseString

import frappe
from frappe import _
from frappe.core.doctype.file.utils import get_random_filename
from frappe.integrations.frappe_providers.frappecloud_billing import (
	current_site_info,
	is_fc_site,
)
from frappe.translate import get_all_translations
from frappe.utils import (
	add_days,
	cint,
	date_diff,
	flt,
	format_date,
	get_datetime,
	getdate,
	now,
)
from frappe.utils.file_manager import safe_b64decode
from frappe.utils.response import Response
from pypika import functions as fn

from lms.lms.doctype.course_lesson.course_lesson import save_progress
from lms.lms.utils import (
	can_modify_batch,
	can_modify_course,
	get_average_rating,
	get_batch_details,
	get_course_details,
	get_instructors,
	get_lesson_count,
	get_lms_route,
	has_course_instructor_role,
	has_evaluator_role,
	has_moderator_role,
)


@frappe.whitelist()
def get_quiz_details(quiz, doctype=None):
	"""Get quiz details for the quiz test page (Quiz.vue).

	Returns the full quiz document including child questions table.
	The 'doctype' parameter is accepted but not used (sent by frontend for legacy reasons).
	"""
	if not frappe.db.exists("LMS Quiz", quiz):
		frappe.throw(_("Quiz {0} not found").format(quiz))

	quiz_doc = frappe.get_doc("LMS Quiz", quiz)

	return {
		"name": quiz_doc.name,
		"title": quiz_doc.title,
		"duration": quiz_doc.duration or 0,
		"passing_percentage": quiz_doc.passing_percentage or 0,
		"max_attempts": quiz_doc.max_attempts or 0,
		"show_answers": quiz_doc.show_answers,
		"show_submission_history": quiz_doc.show_submission_history,
		"shuffle_questions": quiz_doc.shuffle_questions,
		"limit_questions_to": quiz_doc.limit_questions_to or 0,
		"enable_negative_marking": quiz_doc.enable_negative_marking,
		"marks_to_cut": quiz_doc.marks_to_cut or 0,
		"questions": [
			{
				"name": q.name,
				"question": q.question,
				"marks": q.marks or 1,
			}
			for q in (quiz_doc.questions or [])
		],
		"total_marks": quiz_doc.total_marks or 0,
	}


@frappe.whitelist()
def get_user_info():
	if frappe.session.user == "Guest":
		return None

	user = frappe.db.get_value(
		"User",
		frappe.session.user,
		["name", "email", "enabled", "user_image", "full_name", "user_type", "username"],
		as_dict=1,
	)
	user["roles"] = frappe.get_roles(user.name)
	user.is_instructor = "Course Creator" in user.roles
	user.is_moderator = "Moderator" in user.roles or "System Manager" in user.roles
	user.is_evaluator = "Batch Evaluator" in user.roles
	user.is_student = not user.is_instructor and not user.is_moderator and not user.is_evaluator
	user.is_fc_site = is_fc_site()
	user.is_system_manager = "System Manager" in user.roles
	user.sitename = frappe.local.site
	user.developer_mode = frappe.conf.developer_mode
	if user.is_fc_site and user.is_system_manager:
		user.site_info = current_site_info()
	return user


@frappe.whitelist(allow_guest=True)
def get_translations():
	if frappe.session.user != "Guest":
		language = frappe.db.get_value("User", frappe.session.user, "language")
	else:
		language = frappe.db.get_single_value("System Settings", "language")
	return get_all_translations(language)


@frappe.whitelist()
def validate_billing_access(billing_type, name):
	doctype = "LMS Batch" if billing_type == "batch" else "LMS Course"
	access, message = verify_billing_access(doctype, name, billing_type)

	address = frappe.db.get_value(
		"Address",
		{"email_id": frappe.session.user},
		[
			"name",
			"address_title as billing_name",
			"address_line1",
			"address_line2",
			"city",
			"state",
			"country",
			"pincode",
			"phone",
		],
		as_dict=1,
	)

	return {"access": access, "message": message, "address": address}


def verify_billing_access(doctype, name, billing_type):
	access = True
	message = ""

	if frappe.session.user == "Guest":
		access = False
		message = _("Please login to continue with payment.")

	if access and billing_type not in ["course", "batch", "certificate"]:
		access = False
		message = _("Module is incorrect.")

	if access and not frappe.db.exists(doctype, name):
		access = False
		message = _("Module Name is incorrect or does not exist.")

	if access and billing_type == "course":
		membership = frappe.db.exists("LMS Enrollment", {"member": frappe.session.user, "course": name})
		if membership:
			access = False
			message = _("You are already enrolled for this course.")

	elif access and billing_type == "batch":
		membership = frappe.db.exists("LMS Batch Enrollment", {"member": frappe.session.user, "batch": name})
		if membership:
			access = False
			message = _("You are already enrolled for this batch.")

		seat_count = frappe.get_cached_value("LMS Batch", name, "seat_count")
		number_of_students = frappe.db.count("LMS Batch Enrollment", {"batch": name})
		if seat_count <= number_of_students:
			access = False
			message = _("Batch is sold out.")

		start_date = frappe.get_cached_value("LMS Batch", name, "start_date")
		if start_date and date_diff(start_date, now()) < 0:
			access = False
			message = _("Batch has already started.")

	elif access and billing_type == "certificate":
		purchased_certificate = frappe.db.exists(
			"LMS Enrollment",
			{
				"course": name,
				"member": frappe.session.user,
				"purchased_certificate": 1,
			},
		)
		if purchased_certificate:
			access = False
			message = _("You have already purchased the certificate for this course.")

	return access, message


@frappe.whitelist(allow_guest=True)
def get_job_details(job):
	return frappe.db.get_value(
		"Job Opportunity",
		job,
		[
			"job_title",
			"location",
			"country",
			"type",
			"work_mode",
			"company_name",
			"company_logo",
			"company_website",
			"name",
			"creation",
			"description",
			"owner",
		],
		as_dict=1,
	)


@frappe.whitelist(allow_guest=True)
def get_job_opportunities(filters=None, orFilters=None):
	if not filters:
		filters = {}

	jobs = frappe.get_all(
		"Job Opportunity",
		filters=filters,
		or_filters=orFilters,
		fields=[
			"job_title",
			"location",
			"country",
			"type",
			"work_mode",
			"company_name",
			"company_logo",
			"name",
			"creation",
			"description",
		],
		order_by="creation desc",
	)

	for job in jobs:
		job.description = frappe.utils.strip_html_tags(job.description)
		job.applicants = frappe.db.count("LMS Job Application", {"job": job.name})
	return jobs


@frappe.whitelist(allow_guest=True)
def get_chart_details():
	details = frappe._dict()
	roles = frappe.get_roles(frappe.session.user)
	is_admin_or_mod = "Administrator" in roles or "Moderator" in roles or "System Manager" in roles
	
	if is_admin_or_mod or frappe.session.user == "Guest":
		details.enrollments = frappe.db.count("LMS Enrollment")
		details.courses = frappe.db.count(
			"LMS Course",
			{
				"published": 1,
				"upcoming": 0,
			},
		)
		details.users = frappe.db.count("User", {"enabled": 1, "name": ["not in", ("Administrator", "Guest")]})
		details.completions = frappe.db.count("LMS Enrollment", {"progress": ["like", "%100%"]})
		details.certifications = frappe.db.count("LMS Certificate", {"published": 1})
	else:
		my_courses = frappe.get_all("LMS Course", filters={"owner": frappe.session.user}, pluck="name")
		instructed_courses = frappe.get_all("Course Instructor", filters={"instructor": frappe.session.user, "parenttype": "LMS Course"}, pluck="parent")
		all_my_courses = list(set(my_courses + instructed_courses))
		
		if all_my_courses:
			details.enrollments = frappe.db.count("LMS Enrollment", {"course": ["in", all_my_courses]})
			
			# Count published courses
			pub_courses = frappe.get_all("LMS Course", filters={"name": ["in", all_my_courses], "published": 1, "upcoming": 0})
			details.courses = len(pub_courses)
			
			members = frappe.get_all("LMS Enrollment", filters={"course": ["in", all_my_courses]}, pluck="member", distinct=True)
			details.users = len(members)
			
			details.completions = frappe.db.count("LMS Enrollment", {"course": ["in", all_my_courses], "progress": ["like", "%100%"]})
			
			if members:
				details.certifications = frappe.db.count("LMS Certificate", {"member": ["in", members], "published": 1})
			else:
				details.certifications = 0
		else:
			details.enrollments = 0
			details.courses = 0
			details.users = 0
			details.completions = 0
			details.certifications = 0
			
	return details


def get_file_info(file_url):
	"""Get file info for the given file URL."""
	file_info = frappe.db.get_value(
		"File", {"file_url": file_url}, ["file_name", "file_size", "file_url"], as_dict=1
	)
	return file_info


@frappe.whitelist(allow_guest=True)
def get_branding():
	"""Get branding details."""
	fields = ["app_name"]
	image_fields = ["banner_image", "footer_logo", "favicon", "app_logo"]
	fields = fields + image_fields
	settings = frappe._dict()

	for field in fields:
		value = frappe.get_cached_value("Website Settings", None, field)
		if field in image_fields and value:
			file_info = get_file_info(value)
			settings.update({field: json.loads(json.dumps(file_info))})
		else:
			settings.update({field: value})

	return settings


@frappe.whitelist()
def get_unsplash_photos(keyword=None):
	from lms.unsplash import get_by_keyword, get_list

	if keyword:
		return get_by_keyword(keyword)

	return frappe.cache().get_value("unsplash_photos", generator=get_list)


@frappe.whitelist()
def get_evaluator_details(evaluator):
	frappe.only_for("Batch Evaluator")

	if not frappe.db.exists("Google Calendar", {"user": evaluator}):
		calendar = frappe.new_doc("Google Calendar")
		calendar.update({"user": evaluator, "calendar_name": evaluator})
		calendar.insert()
	else:
		calendar = frappe.db.get_value(
			"Google Calendar", {"user": evaluator}, ["name", "authorization_code"], as_dict=1
		)

	if frappe.db.exists("Course Evaluator", {"evaluator": evaluator}):
		doc = frappe.get_doc("Course Evaluator", evaluator)
	else:
		doc = frappe.new_doc("Course Evaluator")
		doc.evaluator = evaluator
		doc.insert()

	return {
		"slots": doc.as_dict(),
		"calendar": calendar.name,
		"is_authorised": calendar.authorization_code,
	}


@frappe.whitelist()
def get_certified_participants(filters=None, start=0, page_length=100):
	query = get_certification_query(filters)
	query = query.orderby("issue_date", order=frappe.qb.desc).offset(start).limit(page_length)
	participants = query.run(as_dict=True)

	for participant in participants:
		details = get_certified_participant_details(participant.member)
		participant.update(details)

	return participants


def get_certified_participant_details(member):
	count = frappe.db.count("LMS Certificate", {"member": member})
	details = frappe.db.get_value(
		"User",
		member,
		["full_name", "user_image", "username", "country", "headline", "open_to"],
		as_dict=1,
	)
	details["certificate_count"] = count
	return details


def get_certification_query(filters):
	Certificate = frappe.qb.DocType("LMS Certificate")
	User = frappe.qb.DocType("User")

	query = (
		frappe.qb.from_(Certificate)
		.select(Certificate.member, Certificate.issue_date)
		.distinct()
		.join(User)
		.on(Certificate.member == User.name)
		.where(Certificate.published == 1)
		.where(User.enabled == 1)
	)

	if filters:
		for field, value in filters.items():
			if field == "category":
				query = query.where(
					Certificate.course_title.like(f"%{value}%") | Certificate.batch_title.like(f"%{value}%")
				)
			if field == "member_name":
				query = query.where(Certificate.member_name.like(value[1]))
			if field == "open_to_work":
				query = query.where(User.open_to == "Work")
			if field == "hiring":
				query = query.where(User.open_to == "Hiring")
	return query


@frappe.whitelist()
def get_count_of_certified_members(filters=None):
	query = get_certification_query(filters)
	result = query.run(as_dict=True)
	return len(result) or 0


@frappe.whitelist()
def get_certification_categories():
	categories = []
	seen = set()
	docs = frappe.get_all(
		"LMS Certificate",
		filters={
			"published": 1,
		},
		fields=["course_title", "batch_title"],
	)

	for doc in docs:
		category = doc.course_title if doc.course_title else doc.batch_title
		if not category or category in seen:
			continue

		seen.add(category)
		categories.append({"label": category, "value": category})
	return categories


@frappe.whitelist()
def get_document_categories(course=None):
	"""Returns categories that have documents in the given course or community scope."""
	filters = {}
	if course:
		filters["course"] = course
		filters["scope"] = "Course"
	else:
		filters["scope"] = "Community"
	
	# Find categories that have documents with these filters
	category_names = frappe.get_all(
		"LMS Document",
		filters=filters,
		pluck="category",
		distinct=True
	)
	
	if not category_names:
		return []

	return frappe.get_all(
		"LMS Document Category",
		filters={"name": ["in", category_names]},
		fields=["name as label", "name as value"]
	)


@frappe.whitelist()
def get_rubric_templates():
	return frappe.get_all("LMS Rubric Template", fields=["name", "title", "description"])


@frappe.whitelist()
def get_rubric_stats():
	return {
		"total": len(frappe.get_list("LMS Rubric Template", limit_page_length=0)),
		"active": len(frappe.get_list("LMS Rubric Template", filters={"is_active": 1}, limit_page_length=0))
	}


@frappe.whitelist()
def get_rubric_detail(name):
	if not frappe.db.exists("LMS Rubric Template", name):
		frappe.throw(_("Rubric {0} not found").format(name))
	
	doc = frappe.get_doc("LMS Rubric Template", name)
	return doc.as_dict()


@frappe.whitelist()
def export_rubric(name):
	from docx import Document
	from docx.shared import Inches, Pt, RGBColor
	from docx.enum.text import WD_ALIGN_PARAGRAPH
	from docx.oxml.ns import qn
	from docx.oxml import OxmlElement

	rubric_doc = frappe.get_doc("LMS Rubric Template", name)
	
	doc = Document()
	
	# Header
	title = doc.add_heading(rubric_doc.title, 0)
	title.alignment = WD_ALIGN_PARAGRAPH.CENTER
	
	# Metadata
	p = doc.add_paragraph()
	p.add_run(_("Description: ")).bold = True
	p.add_run(rubric_doc.description or "")
	
	p = doc.add_paragraph()
	p.add_run(_("Max Score: ")).bold = True
	p.add_run(str(rubric_doc.max_score))
	
	# Criteria Table
	table = doc.add_table(rows=1, cols=6)
	table.style = 'Table Grid'
	
	hdr_cells = table.rows[0].cells
	headers = [_("Criterion"), _("Max"), _("Excellent"), _("Good"), _("Adequate"), _("Poor")]
	for i, h in enumerate(headers):
		hdr_cells[i].text = h
		# Set bold for header
		for paragraph in hdr_cells[i].paragraphs:
			for run in paragraph.runs:
				run.bold = True

	for crit in rubric_doc.criteria:
		row_cells = table.add_row().cells
		row_cells[0].text = crit.criterion_name
		row_cells[1].text = str(crit.max_score)
		row_cells[2].text = crit.level_excellent or ""
		row_cells[3].text = crit.level_good or ""
		row_cells[4].text = crit.level_adequate or ""
		row_cells[5].text = crit.level_poor or ""

	# Save file
	file_name = f"Rubric_{name.replace(' ', '_')}.docx"
	file_path = frappe.get_site_path("public", "files", file_name)
	doc.save(file_path)
	
	# Return URL
	return f"/files/{file_name}"


@frappe.whitelist()
def get_all_users():
	frappe.only_for(["Moderator", "Course Creator", "Batch Evaluator"])
	users = frappe.get_all(
		"User",
		{
			"enabled": 1,
		},
		["name", "full_name", "user_image"],
	)

	return {user.name: user for user in users}


@frappe.whitelist(allow_guest=True)
def get_sidebar_settings():
	lms_settings = frappe.get_single("LMS Settings")
	if not lms_settings.allow_guest_access:
		return []

	items = [
		"courses",
		"batches",
		"certifications",
		"jobs",
		"statistics",
		"notifications",
		"programming_exercises",
		"ai_integration",
		"ai_grading",
		"game_center",
	]
	sidebar_items = frappe._dict({item: lms_settings.get(item) for item in items})

	if len(lms_settings.sidebar_items):
		web_pages = frappe.get_all(
			"LMS Sidebar Item",
			{"parenttype": "LMS Settings", "parentfield": "sidebar_items"},
			["web_page", "route", "title as label", "icon", "name"],
		)
		for page in web_pages:
			page.to = page.route

		sidebar_items.web_pages = web_pages

	return sidebar_items


@frappe.whitelist()
def update_sidebar_item(webpage, icon):
	frappe.only_for("Moderator")
	filters = {
		"web_page": webpage,
		"parenttype": "LMS Settings",
		"parentfield": "sidebar_items",
		"parent": "LMS Settings",
	}

	if frappe.db.exists("LMS Sidebar Item", filters):
		frappe.db.set_value("LMS Sidebar Item", filters, "icon", icon)
	else:
		doc = frappe.new_doc("LMS Sidebar Item")
		doc.update(filters)
		doc.icon = icon
		doc.insert()


@frappe.whitelist()
def delete_sidebar_item(webpage):
	frappe.only_for("Moderator")
	return frappe.db.delete(
		"LMS Sidebar Item",
		{
			"web_page": webpage,
			"parenttype": "LMS Settings",
			"parentfield": "sidebar_items",
			"parent": "LMS Settings",
		},
	)


@frappe.whitelist()
def delete_lesson(lesson, chapter):
	course = frappe.db.get_value("Course Chapter", chapter, "course")
	if not can_modify_course(course):
		frappe.throw(_("You do not have permission to delete this lesson."), frappe.PermissionError)

	lessons = frappe.get_all(
		"Lesson Reference",
		{"parent": chapter},
		pluck="lesson",
		order_by="idx",
	)
	lessons.remove(lesson)
	frappe.db.delete("Lesson Reference", {"parent": chapter, "lesson": lesson})
	update_index(lessons, chapter)

	frappe.db.delete("LMS Course Progress", {"lesson": lesson})
	frappe.db.delete("Course Lesson", lesson)


@frappe.whitelist()
def update_lesson_index(lesson, sourceChapter, targetChapter, idx):
	course = frappe.db.get_value("Course Chapter", sourceChapter, "course")
	if not can_modify_course(course):
		frappe.throw(_("You do not have permission to modify this lesson."), frappe.PermissionError)

	hasMoved = sourceChapter == targetChapter
	update_source_chapter(lesson, sourceChapter, idx, hasMoved)
	if not hasMoved:
		update_target_chapter(lesson, targetChapter, idx)


def update_source_chapter(lesson, chapter, idx, hasMoved=False):
	lessons = frappe.get_all(
		"Lesson Reference",
		{
			"parent": chapter,
		},
		pluck="lesson",
		order_by="idx",
	)

	lessons.remove(lesson)
	if not hasMoved:
		frappe.db.delete("Lesson Reference", {"parent": chapter, "lesson": lesson})
	else:
		lessons.insert(idx, lesson)

	update_index(lessons, chapter)


def update_target_chapter(lesson, chapter, idx):
	lessons = frappe.get_all(
		"Lesson Reference",
		{
			"parent": chapter,
		},
		pluck="lesson",
		order_by="idx",
	)

	lessons.insert(idx, lesson)
	new_lesson_reference = frappe.new_doc("Lesson Reference")
	new_lesson_reference.update(
		{
			"lesson": lesson,
			"parent": chapter,
			"parenttype": "Course Chapter",
			"parentfield": "lessons",
		}
	)
	new_lesson_reference.insert()
	update_index(lessons, chapter)


def update_index(lessons, chapter):
	for row in lessons:
		frappe.db.set_value(
			"Lesson Reference", {"lesson": row, "parent": chapter}, "idx", lessons.index(row) + 1
		)


@frappe.whitelist()
def update_chapter_index(chapter, course, idx):
	"""Update the index of a chapter within a course"""

	if not can_modify_course(course):
		frappe.throw(_("You do not have permission to modify this chapter."), frappe.PermissionError)

	chapters = frappe.get_all(
		"Chapter Reference",
		{"parent": course},
		pluck="chapter",
		order_by="idx",
	)

	if chapter in chapters:
		chapters.remove(chapter)

	chapters.insert(idx, chapter)

	for i, chapter_name in enumerate(chapters):
		frappe.db.set_value("Chapter Reference", {"chapter": chapter_name, "parent": course}, "idx", i + 1)


@frappe.whitelist()
def get_members(start=0, search=""):
	frappe.only_for(["Moderator"])
	filters = {"enabled": 1, "name": ["not in", ["Administrator", "Guest"]]}
	or_filters = {}

	if search:
		or_filters["full_name"] = ["like", f"%{search}%"]
		or_filters["email"] = ["like", f"%{search}%"]

	members = frappe.get_all(
		"User",
		filters=filters,
		fields=["name", "full_name", "user_image", "username", "last_active"],
		or_filters=or_filters,
		page_length=20,
		start=start,
	)

	for member in members:
		roles = frappe.get_all(
			"Has Role",
			{
				"parent": member.name,
				"parenttype": "User",
			},
			pluck="role",
		)
		if "Moderator" in roles:
			member.role = "Moderator"
		elif "Course Creator" in roles:
			member.role = "Course Creator"
		elif "Batch Evaluator" in roles:
			member.role = "Batch Evaluator"
		elif "LMS Student" in roles:
			member.role = "LMS Student"

	return members


def check_app_permission():
	"""Check if the user has permission to access the app."""
	if frappe.session.user == "Administrator":
		return True

	roles = frappe.get_roles()
	lms_roles = ["Moderator", "Course Creator", "Batch Evaluator", "LMS Student"]
	if any(role in roles for role in lms_roles):
		return True

	return False


@frappe.whitelist()
def save_evaluation_details(
	member,
	course,
	batch_name,
	evaluator,
	date,
	start_time,
	end_time,
	status,
	rating,
	summary,
):
	"""
	Save evaluation details for a member against a course.
	"""
	frappe.only_for(["Batch Evaluator", "Moderator"])
	evaluation = frappe.db.exists("LMS Certificate Evaluation", {"member": member, "course": course})

	details = {
		"date": date,
		"start_time": start_time,
		"end_time": end_time,
		"status": status,
		"rating": rating / 5,
		"summary": summary,
		"batch_name": batch_name,
	}

	if evaluation:
		frappe.db.set_value("LMS Certificate Evaluation", evaluation, details)
		return evaluation
	else:
		doc = frappe.new_doc("LMS Certificate Evaluation")
		details.update(
			{
				"member": member,
				"course": course,
				"evaluator": evaluator,
			}
		)
		doc.update(details)
		doc.insert()
		return doc.name


@frappe.whitelist()
def save_certificate_details(
	member,
	course,
	batch_name,
	evaluator,
	issue_date,
	expiry_date,
	template,
	published=True,
):
	"""
	Save certificate details for a member against a course.
	"""
	frappe.only_for(["Batch Evaluator", "Moderator"])
	certificate = frappe.db.exists("LMS Certificate", {"member": member, "course": course})

	details = {
		"published": published,
		"issue_date": issue_date,
		"expiry_date": expiry_date,
		"template": template,
		"batch_name": batch_name,
	}

	if certificate:
		frappe.db.set_value("LMS Certificate", certificate, details)
		return certificate
	else:
		doc = frappe.new_doc("LMS Certificate")
		details.update(
			{
				"member": member,
				"course": course,
				"evaluator": evaluator,
			}
		)
		doc.update(details)
		doc.insert()
		return doc.name


@frappe.whitelist()
def delete_documents(doctype, documents):
	frappe.only_for("Moderator")
	for doc in documents:
		frappe.delete_doc(doctype, doc)


@frappe.whitelist()
def get_payment_gateway_details(payment_gateway):
	frappe.only_for("Moderator")
	gateway = frappe.get_doc("Payment Gateway", payment_gateway)

	if gateway.gateway_controller is None:
		try:
			data = frappe.get_doc(f"{payment_gateway} Settings").as_dict()
			meta = frappe.get_meta(f"{payment_gateway} Settings").fields
			doctype = f"{payment_gateway} Settings"
			docname = f"{payment_gateway} Settings"
		except Exception:
			frappe.throw(_("{0} Settings not found").format(payment_gateway))
	else:
		try:
			data = frappe.get_doc(gateway.gateway_settings, gateway.gateway_controller).as_dict()
			meta = frappe.get_meta(gateway.gateway_settings).fields
			doctype = gateway.gateway_settings
			docname = gateway.gateway_controller
		except Exception:
			frappe.throw(_("{0} Settings not found").format(payment_gateway))

	gateway_fields = get_transformed_fields(meta, data)

	return {
		"fields": gateway_fields,
		"data": data,
		"doctype": doctype,
		"docname": docname,
	}


def get_transformed_fields(meta, data=None):
	transformed_fields = []
	for row in meta:
		if row.fieldtype not in ["Column Break", "Section Break"]:
			if row.fieldtype in ["Attach", "Attach Image"]:
				fieldtype = "Upload"
				if data and data.get(row.fieldname):
					data[row.fieldname] = get_file_info(data.get(row.fieldname))
			elif row.fieldtype == "Check":
				fieldtype = "checkbox"
			else:
				fieldtype = row.fieldtype

			transformed_fields.append(
				{
					"label": row.label,
					"name": row.fieldname,
					"type": fieldtype,
				}
			)

	return transformed_fields


@frappe.whitelist()
def get_new_gateway_fields(doctype):
	frappe.only_for("Moderator")
	try:
		meta = frappe.get_meta(doctype).fields
	except Exception:
		frappe.throw(_("{0} not found").format(doctype))

	transformed_fields = get_transformed_fields(meta)

	return transformed_fields


def update_course_statistics():
	courses = frappe.get_all("LMS Course", fields=["name"])

	for course in courses:
		lessons = get_lesson_count(course.name)

		enrollments = frappe.db.count("LMS Enrollment", {"course": course.name, "member_type": "Student"})

		avg_rating = get_average_rating(course.name) or 0
		avg_rating = flt(avg_rating, frappe.get_system_settings("float_precision") or 3)

		frappe.db.set_value(
			"LMS Course",
			course.name,
			{"lessons": lessons, "enrollments": enrollments, "rating": avg_rating},
		)


@frappe.whitelist()
def get_announcements(batch):
	roles = frappe.get_roles()
	is_batch_student = frappe.db.exists(
		"LMS Batch Enrollment", {"batch": batch, "member": frappe.session.user}
	)
	is_moderator = "Moderator" in roles
	is_evaluator = "Batch Evaluator" in roles
	is_instructor = "Course Creator" in roles or "Instructor" in roles

	if not (is_batch_student or is_moderator or is_evaluator or is_instructor):
		frappe.throw(
			_("You do not have permission to access announcements for this batch."), frappe.PermissionError
		)

	communications = frappe.get_all(
		"Communication",
		filters={
			"reference_doctype": "LMS Batch",
			"reference_name": batch,
		},
		fields=[
			"subject",
			"content",
			"recipients",
			"cc",
			"communication_date",
			"sender",
			"sender_full_name",
		],
		order_by="communication_date desc",
	)

	for communication in communications:
		communication.image = frappe.get_cached_value("User", communication.sender, "user_image")

	return communications


@frappe.whitelist()
def delete_course(course):
	if not can_modify_course(course):
		frappe.throw(_("You do not have permission to delete this course."), frappe.PermissionError)

	frappe.db.delete("LMS Enrollment", {"course": course})
	frappe.db.delete("LMS Course Progress", {"course": course})
	frappe.db.set_value("LMS Quiz", {"course": course}, "course", None)
	frappe.db.set_value("LMS Quiz Submission", {"course": course}, "course", None)

	chapters = frappe.get_all("Course Chapter", {"course": course}, pluck="name")
	frappe.db.delete("Chapter Reference", {"parent": course})

	for chapter in chapters:
		lessons = frappe.get_all("Course Lesson", {"chapter": chapter}, pluck="name")

		frappe.db.delete("Lesson Reference", {"parent": chapter})

		for lesson in lessons:
			topics = frappe.get_all(
				"Discussion Topic",
				{"reference_doctype": "Course Lesson", "reference_docname": lesson},
				pluck="name",
			)

			for topic in topics:
				frappe.db.delete("Discussion Reply", {"topic": topic})
				frappe.db.delete("Discussion Topic", topic)

			frappe.delete_doc("Course Lesson", lesson)

	for chapter in chapters:
		frappe.delete_doc("Course Chapter", chapter)

	frappe.delete_doc("LMS Course", course)


@frappe.whitelist()
def delete_batch(batch):
	if not can_modify_batch(batch):
		frappe.throw(_("You do not have permission to delete this batch."), frappe.PermissionError)

	frappe.db.delete("LMS Batch Enrollment", {"batch": batch})
	frappe.db.delete("Batch Course", {"parent": batch, "parenttype": "LMS Batch"})
	frappe.db.delete("LMS Assessment", {"parent": batch, "parenttype": "LMS Batch"})
	frappe.db.delete("LMS Batch Timetable", {"parent": batch, "parenttype": "LMS Batch"})
	frappe.db.delete("LMS Batch Feedback", {"batch": batch})
	delete_batch_discussions(batch)
	frappe.db.delete("LMS Batch", batch)


def delete_batch_discussions(batch):
	topics = frappe.get_all(
		"Discussion Topic",
		{"reference_doctype": "LMS Batch", "reference_docname": batch},
		pluck="name",
	)

	for topic in topics:
		frappe.db.delete("Discussion Reply", {"topic": topic})
		frappe.db.delete("Discussion Topic", topic)


def give_discussions_permission():
	doctypes = ["Discussion Topic", "Discussion Reply"]
	roles = ["LMS Student", "Course Creator", "Moderator", "Batch Evaluator"]
	for doctype in doctypes:
		for role in roles:
			if not frappe.db.exists("Custom DocPerm", {"parent": doctype, "role": role}):
				frappe.get_doc(
					{
						"doctype": "Custom DocPerm",
						"parent": doctype,
						"role": role,
						"read": 1,
						"write": 1,
						"create": 1,
						"delete": 1,
						"if_owner": 0 if role == "Moderator" else 1,
					}
				).save()


@frappe.whitelist()
def upsert_chapter(title, course, is_scorm_package, scorm_package, name=None):
	if not can_modify_course(course):
		frappe.throw(_("You do not have permission to modify this chapter."), frappe.PermissionError)

	values = frappe._dict({"title": title, "course": course, "is_scorm_package": is_scorm_package})

	if is_scorm_package:
		scorm_package = frappe._dict(scorm_package)
		extract_path = extract_package(course, title, scorm_package)

		values.update(
			{
				"scorm_package": scorm_package.name,
				"scorm_package_path": extract_path.split("public")[1],
				"manifest_file": get_manifest_file(extract_path).split("public")[1],
				"launch_file": get_launch_file(extract_path).split("public")[1],
			}
		)

	if name:
		chapter = frappe.get_doc("Course Chapter", name)
	else:
		chapter = frappe.new_doc("Course Chapter")

	chapter.update(values)
	chapter.save()

	if is_scorm_package and not len(chapter.lessons):
		add_lesson(title, chapter.name, course, 1)

	return chapter


def extract_package(course, title, scorm_package):
	package = frappe.get_doc("File", scorm_package.name)
	zip_path = package.get_full_path()
	# check_for_malicious_code(zip_path)
	extract_path = frappe.get_site_path("public", "scorm", course, title)
	zipfile.ZipFile(zip_path).extractall(extract_path)
	return extract_path


def check_for_malicious_code(zip_path):
	suspicious_patterns = [
		# Unsafe inline JavaScript
		r'on(click|load|mouseover|error|submit|focus|blur|change|keyup|keydown|keypress|resize)=".*?"',  # Inline event handlers (e.g., onerror, onclick)
		r'<script.*?src=["\']http',  # External script tags
		r"eval\(",  # Usage of eval()
		r"Function\(",  # Usage of Function constructor
		r"(btoa|atob)\(",  # Base64 encoding/decoding
		# Dangerous XML patterns
		r"<!ENTITY",  # XXE-related
		r"<\?xml-stylesheet .*?>",  # External stylesheets in XML
	]

	with zipfile.ZipFile(zip_path, "r") as zf:
		for file_name in zf.namelist():
			if file_name.endswith((".html", ".js", ".xml")):
				with zf.open(file_name) as file:
					content = file.read().decode("utf-8", errors="ignore")
					for pattern in suspicious_patterns:
						if re.search(pattern, content):
							frappe.throw(_("Suspicious pattern found in {0}: {1}").format(file_name, pattern))


def get_manifest_file(extract_path):
	manifest_file = None
	for root, _dirs, files in os.walk(extract_path):
		for file in files:
			if file == "imsmanifest.xml":
				manifest_file = os.path.join(root, file)
				break
		if manifest_file:
			break
	return manifest_file


def get_launch_file(extract_path):
	launch_file = None
	manifest_file = get_manifest_file(extract_path)

	if manifest_file:
		with open(manifest_file) as file:
			data = file.read()
			dom = parseString(data)
			resource = dom.getElementsByTagName("resource")
			for res in resource:
				if (
					res.getAttribute("adlcp:scormtype") == "sco"
					or res.getAttribute("adlcp:scormType") == "sco"
				):
					launch_file = res.getAttribute("href")
					break

		if launch_file:
			launch_file = os.path.join(os.path.dirname(manifest_file), launch_file)

	return launch_file


def add_lesson(title, chapter, course, idx):
	lesson = frappe.new_doc("Course Lesson")
	lesson.update(
		{
			"title": title,
			"chapter": chapter,
			"course": course,
		}
	)
	lesson.insert()

	lesson_reference = frappe.new_doc("Lesson Reference")
	lesson_reference.update(
		{
			"lesson": lesson.name,
			"idx": idx,
			"parent": chapter,
			"parenttype": "Course Chapter",
			"parentfield": "lessons",
		}
	)
	lesson_reference.insert()


@frappe.whitelist()
def delete_chapter(chapter):
	course = frappe.db.get_value("Course Chapter", chapter, "course")
	if not can_modify_course(course):
		frappe.throw(_("You do not have permission to delete this chapter."), frappe.PermissionError)

	chapterInfo = frappe.db.get_value(
		"Course Chapter", chapter, ["is_scorm_package", "scorm_package_path"], as_dict=True
	)

	if chapterInfo.is_scorm_package:
		delete_scorm_package(chapterInfo.scorm_package_path)

	course = frappe.db.get_value("Chapter Reference", {"chapter": chapter}, "parent")

	frappe.db.delete("Chapter Reference", {"chapter": chapter})
	frappe.db.delete("Lesson Reference", {"parent": chapter})
	frappe.db.delete("Course Lesson", {"chapter": chapter})
	frappe.db.delete("Course Chapter", chapter)

	# reset chapter reference index after deletion
	if course:
		chapters = frappe.get_all(
			"Chapter Reference", filters={"parent": course}, fields=["name"], order_by="idx asc"
		)

		i = 1
		for chapter in chapters:
			frappe.db.set_value("Chapter Reference", chapter.name, "idx", i)
			i += 1


def delete_scorm_package(scorm_package_path):
	scorm_package_path = frappe.get_site_path("public", scorm_package_path[1:])
	if os.path.exists(scorm_package_path):
		shutil.rmtree(scorm_package_path)


@frappe.whitelist()
def mark_lesson_progress(course, chapter_number, lesson_number):
	chapter_name = frappe.get_value("Chapter Reference", {"parent": course, "idx": chapter_number}, "chapter")
	lesson_name = frappe.get_value(
		"Lesson Reference", {"parent": chapter_name, "idx": lesson_number}, "lesson"
	)
	save_progress(lesson_name, course)


@frappe.whitelist()
def get_heatmap_data(member, base_days=200):
	if not (has_course_instructor_role() or has_moderator_role() or has_evaluator_role()):
		frappe.throw(_("You do not have permission to access heatmap data."), frappe.PermissionError)

	base_date, start_date, number_of_days, days = calculate_date_ranges(base_days)
	date_count = initialize_date_count(days)

	lesson_completions, quiz_submissions, assignment_submissions = fetch_activity_data(member, start_date)
	count_dates(lesson_completions, date_count)
	count_dates(quiz_submissions, date_count)
	count_dates(assignment_submissions, date_count)

	heatmap_data, labels, total_activities, weeks = prepare_heatmap_data(
		start_date, number_of_days, date_count
	)

	return {
		"heatmap_data": heatmap_data,
		"labels": labels,
		"total_activities": total_activities,
		"weeks": weeks,
	}


def calculate_date_ranges(base_days):
	today = format_date(now(), "YYYY-MM-dd")
	day_today = get_datetime(today).strftime("%w")
	padding_end = 6 - cint(day_today)

	base_date = add_days(today, -base_days)
	day_of_base_date = cint(get_datetime(base_date).strftime("%w"))
	start_date = add_days(base_date, -day_of_base_date)
	number_of_days = base_days + day_of_base_date + padding_end
	days = [add_days(start_date, i) for i in range(number_of_days + 1)]

	return base_date, start_date, number_of_days, days


def initialize_date_count(days):
	return {format_date(day, "YYYY-MM-dd"): 0 for day in days}


def fetch_activity_data(member, start_date):
	lesson_completions = frappe.get_all(
		"LMS Course Progress",
		fields=["creation"],
		filters={"member": member, "creation": [">=", start_date], "status": "Complete"},
	)

	quiz_submissions = frappe.get_all(
		"LMS Quiz Submission",
		fields=["creation"],
		filters={"member": member, "creation": [">=", start_date]},
	)

	assignment_submissions = frappe.get_all(
		"LMS Assignment Submission",
		fields=["creation"],
		filters={"member": member, "creation": [">=", start_date]},
	)

	return lesson_completions, quiz_submissions, assignment_submissions


def count_dates(data, date_count):
	for entry in data:
		date = format_date(entry.creation, "YYYY-MM-dd")
		if date in date_count:
			date_count[date] += 1


def prepare_heatmap_data(start_date, number_of_days, date_count):
	days_of_week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	heatmap_data = {day: [] for day in days_of_week}
	week_count = -(number_of_days // -7)
	labels = [None] * week_count
	last_seen_month = None
	sorted_dates = sorted(date_count.keys())

	for date in sorted_dates:
		activity_count = date_count[date]
		day_of_week = get_datetime(date).strftime("%a")
		current_month = get_datetime(date).strftime("%b")
		column_index = get_week_difference(start_date, date)

		if 0 <= column_index < week_count:
			heatmap_data[day_of_week].append(
				{
					"date": date,
					"count": activity_count,
					"label": f"{activity_count} activities on {format_date(date, 'dd MMM')}",
				}
			)

			if last_seen_month != current_month:
				labels[column_index] = current_month
				last_seen_month = current_month

	for index, label in enumerate(labels):
		if not label:
			labels[index] = ""

	formatted_heatmap_data = [{"name": day, "data": heatmap_data[day]} for day in days_of_week]

	total_activities = sum(date_count.values())
	return formatted_heatmap_data, labels, total_activities, week_count


def get_week_difference(start_date, current_date):
	diff_in_days = date_diff(current_date, start_date)
	return diff_in_days // 7


@frappe.whitelist()
def get_notifications(filters):
	filters = frappe._dict(filters or {})
	filters.for_user = frappe.session.user
	notifications = frappe.get_all(
		"Notification Log",
		filters,
		[
			"subject",
			"from_user",
			"link",
			"read",
			"name",
			"creation",
			"document_type",
			"document_name",
			"type",
			"email_content",
		],
		order_by="creation desc",
	)

	for notification in notifications:
		notification = update_document_details(notification)
		notification = update_user_details(notification)

	return notifications


def update_user_details(notification):
	if (
		notification.get("document_details")
		and isinstance(notification.document_details, dict)
		and len(notification.document_details.get("instructors", []))
		and not is_mention(notification)
	):
		from_user_details = notification.document_details["instructors"][0]
	else:
		from_user_details = frappe.db.get_value(
			"User", notification.from_user, ["full_name", "user_image"], as_dict=1
		)
	if not from_user_details:
		from_user_details = {
			"full_name": notification.from_user or "System",
			"user_image": None
		}
	notification["from_user_details"] = from_user_details
	return notification


def is_mention(notification):
	if notification.type == "Mention":
		return True
	if "mentioned you" in notification.subject.lower():
		return True
	return False


def update_document_details(notification):
	if notification.document_type == "LMS Course":
		details = frappe.db.get_value(
			"LMS Course", notification.document_name, ["title", "video_link", "short_introduction"], as_dict=1
		)
		if details:
			instructors = get_instructors("LMS Course", notification.document_name)
			details["instructors"] = instructors or []
			notification["document_details"] = details
		else:
			notification["document_details"] = None

	elif notification.document_type == "LMS Batch":
		details = frappe.db.get_value(
			"LMS Batch",
			notification.document_name,
			[
				"title",
				"description as short_introduction",
				"video_link",
				"start_date",
				"end_date",
				"start_time",
				"timezone",
			],
			as_dict=1,
		)
		if details:
			instructors = get_instructors("LMS Batch", notification.document_name)
			details["instructors"] = instructors or []
			notification["document_details"] = details
		else:
			notification["document_details"] = None
	return notification


@frappe.whitelist(allow_guest=True)
def get_lms_settings():
	allowed_fields = [
		"allow_guest_access",
		"prevent_skipping_videos",
		"contact_us_email",
		"contact_us_url",
		"livecode_url",
		"disable_pwa",
		"ai_integration",
		"ai_grading",
		"grading_book",
		"enable_lesson_planning",
		"enable_quiz_creator",
		"enable_documents",
		"enable_score_insights",
		"enable_smart_chatbot",
		"enable_socratic_tutor",
	]

	settings = frappe._dict()
	for field in allowed_fields:
		settings[field] = frappe.get_cached_value("LMS Settings", None, field)

	return settings


@frappe.whitelist()
def cancel_evaluation(evaluation):
	evaluation = frappe._dict(evaluation)
	if evaluation.member != frappe.session.user:
		frappe.throw(_("You do not have permission to cancel this evaluation."), frappe.PermissionError)

	frappe.db.set_value("LMS Certificate Request", evaluation.name, "status", "Cancelled")
	events = frappe.get_all(
		"Event Participants",
		{
			"email": evaluation.member,
		},
		["parent", "name"],
	)

	for event in events:
		info = frappe.db.get_value("Event", event.parent, ["starts_on", "subject"], as_dict=1)
		date = str(info.starts_on).split(" ")[0]

		if date == str(evaluation.date.format("YYYY-MM-DD")) and evaluation.member_name in info.subject:
			communication = frappe.db.get_value(
				"Communication",
				{"reference_doctype": "Event", "reference_name": event.parent},
				"name",
			)
			if communication:
				frappe.delete_doc("Communication", communication, ignore_permissions=True)

			frappe.delete_doc("Event Participants", event.name, ignore_permissions=True)
			frappe.delete_doc("Event", event.parent, ignore_permissions=True)


@frappe.whitelist()
def get_certification_details(course):
	membership = None
	filters = {"course": course, "member": frappe.session.user}

	if frappe.db.exists("LMS Enrollment", filters):
		membership = frappe.db.get_value(
			"LMS Enrollment",
			filters,
			["name", "purchased_certificate"],
			as_dict=1,
		)

	paid_certificate = frappe.db.get_value("LMS Course", course, "paid_certificate")
	certificate = frappe.db.get_value(
		"LMS Certificate",
		{"member": frappe.session.user, "course": course},
		["name", "template"],
		as_dict=1,
	)

	return {
		"membership": membership,
		"paid_certificate": paid_certificate,
		"certificate": certificate,
	}


@frappe.whitelist()
def save_role(user, role, value):
	frappe.only_for("Moderator")
	if cint(value):
		doc = frappe.get_doc(
			{
				"doctype": "Has Role",
				"parent": user,
				"role": role,
				"parenttype": "User",
				"parentfield": "roles",
			}
		)
		doc.save(ignore_permissions=True)
	else:
		frappe.db.delete("Has Role", {"parent": user, "role": role})
	frappe.clear_cache(user=user)
	return True


@frappe.whitelist()
def add_an_evaluator(email):
	frappe.only_for("Moderator")
	if not frappe.db.exists("User", email):
		user = frappe.new_doc("User")
		user.update(
			{
				"email": email,
				"first_name": email.split("@")[0].capitalize(),
				"enabled": 1,
			}
		)
		user.insert()
		user.add_roles("Batch Evaluator")

	evaluator = frappe.new_doc("Course Evaluator")
	evaluator.evaluator = email
	evaluator.insert()

	return evaluator


@frappe.whitelist()
def capture_user_persona(responses):
	frappe.only_for("System Manager")
	data = frappe.parse_json(responses)
	data = json.dumps(data)
	response = frappe.integrations.utils.make_post_request(
		"https://school.frappe.io/api/method/capture-persona",
		data={"response": data},
	)
	if response.get("message").get("name"):
		frappe.db.set_single_value("LMS Settings", "persona_captured", True)
	return response


@frappe.whitelist()
def get_meta_info(type, route):
	if frappe.db.exists("Website Meta Tag", {"parent": f"{type}/{route}"}):
		meta_tags = frappe.get_all(
			"Website Meta Tag",
			{
				"parent": f"{type}/{route}",
			},
			["name", "key", "value"],
		)

		return meta_tags

	return []


@frappe.whitelist()
def update_meta_info(meta_type, route, meta_tags):
	frappe.only_for(["Course Creator", "Batch Evaluator", "Moderator"])
	validate_meta_data_permissions(meta_type)
	validate_meta_tags(meta_tags)

	parent_name = f"{meta_type}/{route}"
	for tag in meta_tags:
		existing_tag = frappe.db.exists(
			"Website Meta Tag",
			{
				"parent": parent_name,
				"parenttype": "Website Route Meta",
				"parentfield": "meta_tags",
				"key": tag["key"],
			},
		)
		if existing_tag:
			if not tag.get("value"):
				frappe.db.delete("Website Meta Tag", existing_tag)
				continue
			frappe.db.set_value("Website Meta Tag", existing_tag, "value", tag["value"])
		elif tag.get("value"):
			tag_properties = {
				"parent": parent_name,
				"parenttype": "Website Route Meta",
				"parentfield": "meta_tags",
				"key": tag["key"],
				"value": tag["value"],
			}

			parent_exists = frappe.db.exists("Website Route Meta", parent_name)
			if not parent_exists:
				create_meta(parent_name, tag_properties)
			else:
				create_meta_tag(tag_properties)


def validate_meta_tags(meta_tags):
	if not isinstance(meta_tags, list):
		frappe.throw(_("Meta tags should be a list."))


def create_meta(parent_name, tag_properties):
	route_meta = frappe.new_doc("Website Route Meta")
	route_meta.update(
		{
			"__newname": parent_name,
		}
	)
	route_meta.append("meta_tags", tag_properties)
	route_meta.insert()


def create_meta_tag(tag_properties):
	new_tag = frappe.new_doc("Website Meta Tag")
	new_tag.update(tag_properties)
	new_tag.insert()


def validate_meta_data_permissions(meta_type):
	roles = frappe.get_roles()

	if meta_type == "courses":
		if not ("Course Creator" in roles or "Moderator" in roles):
			frappe.throw(_("You do not have permission to update meta tags."))

	elif meta_type == "batches":
		if not ("Batch Evaluator" in roles or "Moderator" in roles):
			frappe.throw(_("You do not have permission to update meta tags."))


@frappe.whitelist()
def create_programming_exercise_submission(exercise, submission, code, test_cases):
	if submission == "new":
		return make_new_exercise_submission(exercise, code, test_cases)
	else:
		update_exercise_submission(submission, code, test_cases)


def make_new_exercise_submission(exercise, code, test_cases):
	submission = frappe.new_doc("LMS Programming Exercise Submission")
	submission.exercise = exercise
	submission.member = frappe.session.user
	submission.code = code

	for test_case in test_cases:
		submission.append(
			"test_cases",
			{
				"input": test_case.get("input"),
				"output": test_case.get("output"),
				"expected_output": test_case.get("expected_output"),
				"status": test_case.get("status", test_case.get("status", "Failed")),
			},
		)

	submission.status = get_exercise_status(test_cases)
	submission.insert()
	return submission.name


def update_exercise_submission(submission, code, test_cases):
	member = frappe.db.get_value("LMS Programming Exercise Submission", submission, "member")
	if member != frappe.session.user:
		frappe.throw(_("You do not have permission to update this submission."), frappe.PermissionError)

	update_test_cases(test_cases, submission)
	status = get_exercise_status(test_cases)
	frappe.db.set_value("LMS Programming Exercise Submission", submission, {"status": status, "code": code})


def get_exercise_status(test_cases):
	if not test_cases:
		return "Failed"

	if all(row.get("status", "Failed") == "Passed" for row in test_cases):
		return "Passed"
	else:
		return "Failed"


def update_test_cases(test_cases, submission):
	frappe.db.delete("LMS Test Case Submission", {"parent": submission})
	for row in test_cases:
		test_case = frappe.new_doc("LMS Test Case Submission")
		test_case.update(
			{
				"parent": submission,
				"parenttype": "LMS Programming Exercise Submission",
				"parentfield": "test_cases",
				"input": row.get("input"),
				"output": row.get("output"),
				"expected_output": row.get("expected_output"),
				"status": row.get("status", "Failed"),
			}
		)
		test_case.insert()


@frappe.whitelist()
def track_video_watch_duration(lesson, videos):
	"""
	Track the watch duration of videos in a lesson.
	"""
	if not isinstance(videos, list):
		videos = json.loads(videos)

	for video in videos:
		filters = {
			"lesson": lesson,
			"source": video.get("source"),
			"member": frappe.session.user,
		}
		existing_record = frappe.db.get_value(
			"LMS Video Watch Duration", filters, ["name", "watch_time"], as_dict=True
		)
		if existing_record and flt(existing_record.watch_time) < flt(video.get("watch_time")):
			frappe.db.set_value(
				"LMS Video Watch Duration",
				filters,
				"watch_time",
				video.get("watch_time"),
			)
		elif not existing_record:
			track_new_watch_time(lesson, video)


def track_new_watch_time(lesson, video):
	doc = frappe.new_doc("LMS Video Watch Duration")
	doc.lesson = lesson
	doc.source = video.get("source")
	doc.watch_time = video.get("watch_time")
	doc.member = frappe.session.user
	doc.save()


@frappe.whitelist()
def get_course_progress_distribution(course):
	if not can_modify_course(course):
		frappe.throw(
			_("You do not have permission to access this course's progress data."), frappe.PermissionError
		)

	all_progress = frappe.get_all(
		"LMS Enrollment",
		{
			"course": course,
		},
		pluck="progress",
	)

	average_progress = get_average_course_progress(all_progress)
	progress_distribution = get_progress_distribution(all_progress)

	return {
		"average_progress": average_progress,
		"progress_distribution": progress_distribution,
	}


def get_average_course_progress(progress_list):
	if not progress_list:
		return 0
	average_progress = sum(progress_list) / len(progress_list)
	return flt(average_progress, frappe.get_system_settings("float_precision") or 3)


def get_progress_distribution(progressList):
	distribution = [
		{
			"name": "Just Started (0-30%)",
			"value": len([p for p in progressList if 0 <= p < 30]),
		},
		{
			"name": "In Progress (30-60%)",
			"value": len([p for p in progressList if 30 <= p < 60]),
		},
		{
			"name": "Advanced (60-99%)",
			"value": len([p for p in progressList if 60 <= p < 100]),
		},
		{
			"name": "Completed (100%)",
			"value": len([p for p in progressList if p == 100]),
		},
	]

	return distribution


@frappe.whitelist(allow_guest=True)
def get_pwa_manifest():
	title = frappe.db.get_single_value("Website Settings", "app_name") or "Frappe Learning"
	banner_image = frappe.db.get_single_value("Website Settings", "banner_image")

	manifest = {
		"name": title,
		"short_name": title,
		"description": "Easy to use, 100% open source Learning Management System",
		"start_url": get_lms_route(),
		"icons": [
			{
				"src": banner_image or "/assets/lms/frontend/manifest/manifest-icon-192.maskable.png",
				"sizes": "192x192",
				"type": "image/png",
				"purpose": "maskable any",
			}
		],
	}

	return Response(json.dumps(manifest), status=200, content_type="application/manifest+json")


@frappe.whitelist()
def get_profile_details(username):
	details = frappe.db.get_value(
		"User",
		{"username": username},
		[
			"first_name",
			"last_name",
			"full_name",
			"name",
			"username",
			"user_image",
			"bio",
			"headline",
			"language",
			"cover_image",
			"open_to",
			"linkedin",
			"github",
			"twitter",
		],
		as_dict=True,
	)

	details.roles = frappe.get_roles(details.name)
	return details
from lms.lms.gamification.utils import get_streak_info as _get_streak_info, fetch_activity_dates, calculate_streaks, calculate_current_streak

@frappe.whitelist()
def get_streak_info(member=None):
	return _get_streak_info(member)

# Keep old names for backwards compatibility if they were imported elsewhere


@frappe.whitelist()
def get_my_live_classes():
	my_live_classes = []

	batches = frappe.get_all(
		"LMS Batch Enrollment",
		{
			"member": frappe.session.user,
		},
		order_by="creation desc",
		pluck="batch",
	)

	live_class_details = frappe.get_all(
		"LMS Live Class",
		filters={
			"date": [">=", getdate()],
			"batch_name": ["in", batches],
		},
		fields=[
			"name",
			"title",
			"description",
			"time",
			"date",
			"duration",
			"attendees",
			"start_url",
			"join_url",
			"owner",
		],
		limit=2,
		order_by="date",
	)

	if len(live_class_details):
		for live_class in live_class_details:
			live_class.course_title = frappe.db.get_value("LMS Course", live_class.course, "title")

			my_live_classes.append(live_class)

	return my_live_classes


@frappe.whitelist()
def get_created_courses():
	created_courses = []

	CourseInstructor = frappe.qb.DocType("Course Instructor")
	Course = frappe.qb.DocType("LMS Course")

	query = (
		frappe.qb.from_(CourseInstructor)
		.join(Course)
		.on(CourseInstructor.parent == Course.name)
		.select(Course.name)
		.where(CourseInstructor.instructor == frappe.session.user)
		.orderby(Course.published_on, order=frappe.qb.desc)
		.limit(3)
	)

	results = query.run(as_dict=True)
	courses = [row["name"] for row in results]

	if courses:
		courses = list(dict.fromkeys(courses))


	for course in courses:
		course_details = get_course_details(course)
		created_courses.append(course_details)

	return created_courses


@frappe.whitelist()
def get_created_batches():
	created_batches = []

	CourseInstructor = frappe.qb.DocType("Course Instructor")
	Batch = frappe.qb.DocType("LMS Batch")

	query = (
		frappe.qb.from_(CourseInstructor)
		.join(Batch)
		.on(CourseInstructor.parent == Batch.name)
		.select(Batch.name)
		.where(CourseInstructor.instructor == frappe.session.user)
		.where(Batch.start_date >= getdate())
		.orderby(Batch.start_date, order=frappe.qb.asc)
		.limit(4)
	)

	results = query.run(as_dict=True)
	batches = [row["name"] for row in results]

	for batch in batches:
		batch_details = get_batch_details(batch)
		created_batches.append(batch_details)

	return created_batches


@frappe.whitelist()
def get_admin_live_classes():
	CourseInstructor = frappe.qb.DocType("Course Instructor")
	LMSLiveClass = frappe.qb.DocType("LMS Live Class")

	query = (
		frappe.qb.from_(CourseInstructor)
		.join(LMSLiveClass)
		.on(CourseInstructor.parent == LMSLiveClass.batch_name)
		.select(
			LMSLiveClass.name,
			LMSLiveClass.title,
			LMSLiveClass.description,
			LMSLiveClass.time,
			LMSLiveClass.date,
			LMSLiveClass.duration,
			LMSLiveClass.attendees,
			LMSLiveClass.start_url,
			LMSLiveClass.join_url,
			LMSLiveClass.owner,
		)
		.where(CourseInstructor.instructor == frappe.session.user)
		.where(LMSLiveClass.date >= getdate())
		.orderby(LMSLiveClass.date, order=frappe.qb.asc)
		.limit(4)
	)
	results = query.run(as_dict=True)
	return results


@frappe.whitelist()
def get_admin_evals():
	evals = frappe.get_all(
		"LMS Certificate Request",
		{
			"evaluator": frappe.session.user,
			"date": [">=", getdate()],
		},
		[
			"name",
			"date",
			"start_time",
			"course",
			"evaluator",
			"google_meet_link",
			"member",
			"member_name",
		],
		limit=4,
		order_by="date asc",
	)

	for evaluation in evals:
		evaluation.course_title = frappe.db.get_value("LMS Course", evaluation.course, "title")

	return evals


@frappe.whitelist()
def get_my_courses():
	my_courses = []
	courses = get_my_latest_courses()

	if courses:
		courses = list(dict.fromkeys(courses))

	if not len(courses):
		courses = get_featured_home_courses()

	if not len(courses):
		courses = get_popular_courses()

	for course in courses:
		my_courses.append(get_course_details(course))

	return my_courses


@frappe.whitelist()
def get_home_stats():
	"""Get student home dashboard stats."""
	user = frappe.session.user

	# Count lessons from enrolled courses
	enrolled_courses = frappe.get_all(
		"LMS Enrollment",
		filters={"member": user},
		pluck="course",
	)

	total_lessons = 0
	if enrolled_courses:
		total_lessons = frappe.db.sql(
			"""SELECT COALESCE(SUM(lesson_count), 0) FROM `tabLMS Course`
			   WHERE name IN %s""",
			[enrolled_courses],
		)[0][0]

	# Count completed lessons
	completed_lessons = 0
	if frappe.db.exists("DocType", "LMS Course Progress"):
		completed_lessons = frappe.db.count(
			"LMS Course Progress",
			{"member": user},
		)

	# Count quizzes from enrolled courses
	pending_quizzes = 0
	if enrolled_courses:
		pending_quizzes = frappe.db.count(
			"LMS Quiz",
			{"course": ["in", enrolled_courses]},
		)

	# Count assignments from enrolled courses
	total_assignments = 0
	if enrolled_courses and frappe.db.exists("DocType", "LMS Assignment"):
		total_assignments = frappe.db.count(
			"LMS Assignment",
			{"course": ["in", enrolled_courses]},
		)

	return {
		"total_lessons": cint(total_lessons),
		"completed_lessons": cint(completed_lessons),
		"lesson_progress": round(
			(cint(completed_lessons) / cint(total_lessons) * 100) if total_lessons else 0, 0
		),
		"total_quizzes": cint(pending_quizzes),
		"total_assignments": cint(total_assignments),
	}


@frappe.whitelist()
def get_performance_stats(member=None):
	"""Get student performance statistics."""
	if not member:
		member = frappe.session.user

	# Average Quiz Score
	quiz_data = frappe.db.get_all("LMS Quiz Submission", filters={"member": member}, fields=["percentage"])
	avg_quiz_score = 0
	if quiz_data:
		avg_quiz_score = round(sum(q.percentage for q in quiz_data) / len(quiz_data), 1)

	# Average Assignment Score (only graded: Pass/Fail with a score)
	assignment_data = frappe.db.get_all(
		"LMS Assignment Submission",
		filters={"member": member, "status": ["in", ["Pass", "Fail"]]},
		fields=["numeric_score", "score_out_of"],
	)
	avg_assignment_score = 0
	if assignment_data:
		scored = [
			(flt(a.numeric_score) / flt(a.score_out_of) * 100)
			for a in assignment_data
			if flt(a.score_out_of) > 0
		]
		avg_assignment_score = round(sum(scored) / len(scored), 1) if scored else 0

	# Overall Completion (average of LMS Enrollment progress)
	enrollment_data = frappe.db.get_all("LMS Enrollment", filters={"member": member}, fields=["progress"])
	overall_completion = 0
	if enrollment_data:
		overall_completion = round(sum(flt(e.progress) for e in enrollment_data) / len(enrollment_data), 1)

	return {
		"avg_quiz_score": avg_quiz_score,
		"avg_assignment_score": avg_assignment_score,
		"overall_completion": overall_completion,
	}


@frappe.whitelist()
def get_hours_spent(member=None):
	"""Get total hours spent watching videos."""
	if not member:
		member = frappe.session.user

	total_seconds_result = frappe.db.sql(
		"SELECT SUM(CAST(watch_time AS DECIMAL(16,2))) FROM `tabLMS Video Watch Duration` WHERE member = %s",
		[member]
	)
	total_seconds = total_seconds_result[0][0] if total_seconds_result and total_seconds_result[0][0] else 0

	total_seconds = flt(total_seconds)
	total_hours = round(total_seconds / 3600, 1)

	hours = int(total_seconds // 3600)
	minutes = int((total_seconds % 3600) // 60)
	display_time = f"{hours}h {minutes}m"

	# Per-course breakdown (top 5)
	course_breakdown = frappe.db.sql(
		"""SELECT course, COALESCE(SUM(CAST(watch_time AS DECIMAL(16,2))), 0) as total_seconds
		   FROM `tabLMS Video Watch Duration`
		   WHERE member = %s AND course IS NOT NULL
		   GROUP BY course ORDER BY total_seconds DESC LIMIT 5""",
		[member],
		as_dict=True,
	)

	for row in course_breakdown:
		row.course_title = frappe.db.get_value("LMS Course", row.course, "title") or ""
		row.total_hours = round(flt(row.total_seconds) / 3600, 1)

	return {
		"total_seconds": total_seconds,
		"total_hours": total_hours,
		"display_time": display_time,
		"course_breakdown": course_breakdown,
	}


@frappe.whitelist()
def get_admin_performance_stats():
	"""Get aggregate performance stats for admin's batches."""
	roles = frappe.get_roles()
	is_admin = "System Manager" in roles or frappe.session.user == "Administrator" or "Moderator" in roles

	batches = []
	if is_admin:
		batches = frappe.get_list("LMS Batch", pluck="name", limit_page_length=0)
	else:
		my_batches = frappe.get_all("LMS Batch", filters={"owner": frappe.session.user}, pluck="name")
		instructed_batches = frappe.get_all("Course Instructor", filters={"instructor": frappe.session.user, "parenttype": "LMS Batch"}, pluck="parent")
		batches = list(set(my_batches + instructed_batches))

	if not batches:
		return {
			"total_students": 0,
			"avg_completion": 0,
			"avg_quiz_score": 0,
			"avg_assignment_score": 0,
			"total_hours": 0,
		}

	members = frappe.get_all("LMS Batch Enrollment", {"batch": ["in", batches]}, pluck="member")
	members = list(set(members))

	if not members:
		return {
			"total_students": 0,
			"avg_completion": 0,
			"avg_quiz_score": 0,
			"avg_assignment_score": 0,
			"total_hours": 0,
		}

	avg_completion = frappe.db.sql(
		"SELECT AVG(progress) FROM `tabLMS Enrollment` WHERE member IN %s", [members]
	)[0][0] or 0

	avg_quiz = frappe.db.sql(
		"SELECT AVG(percentage) FROM `tabLMS Quiz Submission` WHERE member IN %s", [members]
	)[0][0] or 0

	avg_assignment = frappe.db.sql(
		"""SELECT AVG(numeric_score / NULLIF(score_out_of, 0) * 100)
		   FROM `tabLMS Assignment Submission`
		   WHERE member IN %s AND status IN ('Pass', 'Fail') AND score_out_of > 0""",
		[members],
	)[0][0] or 0

	total_hours = frappe.db.sql(
		"""SELECT COALESCE(SUM(CAST(watch_time AS DECIMAL(16,2))), 0) / 3600
		   FROM `tabLMS Video Watch Duration` WHERE member IN %s""",
		[members],
	)[0][0] or 0

	return {
		"total_students": len(members),
		"avg_completion": round(flt(avg_completion), 1),
		"avg_quiz_score": round(flt(avg_quiz), 1),
		"avg_assignment_score": round(flt(avg_assignment), 1),
		"total_hours": round(flt(total_hours), 1),
	}


def calculate_composite_score(member):
	from lms.lms.gamification.leaderboard_api import calculate_composite_score as _calculate
	return _calculate(member)


@frappe.whitelist()
def get_leaderboard(batch=None, limit=10):
	from lms.lms.gamification.leaderboard_api import get_leaderboard as _get
	return _get(batch=batch, limit=limit)


def get_my_latest_courses():
	return frappe.get_all(
		"LMS Enrollment",
		{
			"member": frappe.session.user,
		},
		order_by="modified desc",
		limit=3,
		pluck="course",
	)


def get_featured_home_courses():
	return frappe.get_all(
		"LMS Course",
		{"published": 1, "featured": 1},
		order_by="published_on desc",
		limit=3,
		pluck="name",
	)


def get_popular_courses():
	return frappe.get_all(
		"LMS Course",
		{
			"published": 1,
		},
		order_by="enrollments desc",
		limit=3,
		pluck="name",
	)


@frappe.whitelist()
def get_my_batches():
	my_batches = []
	batches = get_my_latest_batches()

	if not len(batches):
		batches = get_upcoming_batches()

	for batch in batches:
		batch_details = get_batch_details(batch)
		if batch_details:
			my_batches.append(batch_details)

	return my_batches


def get_my_latest_batches():
	return frappe.get_all(
		"LMS Batch Enrollment",
		{
			"member": frappe.session.user,
		},
		order_by="creation desc",
		limit=4,
		pluck="batch",
	)


def get_upcoming_batches():
	return frappe.get_all(
		"LMS Batch",
		{
			"published": 1,
			"start_date": [">=", getdate()],
		},
		order_by="start_date asc",
		limit=4,
		pluck="name",
	)


@frappe.whitelist()
def delete_programming_exercise(exercise):
	frappe.only_for(["Moderator", "Course Creator"])
	frappe.db.delete("LMS Programming Exercise Submission", {"exercise": exercise})
	frappe.db.delete("LMS Programming Exercise", exercise)


@frappe.whitelist()
def get_lesson_completion_stats(course: str):
	roles = frappe.get_roles()
	if "Course Creator" not in roles and "Moderator" not in roles:
		frappe.throw(_("You do not have permission to access lesson completion stats."))

	CourseProgress = frappe.qb.DocType("LMS Course Progress")
	LessonReference = frappe.qb.DocType("Lesson Reference")
	ChapterReference = frappe.qb.DocType("Chapter Reference")
	Lesson = frappe.qb.DocType("Course Lesson")

	rows = (
		frappe.qb.from_(LessonReference)
		.join(ChapterReference)
		.on(LessonReference.parent == ChapterReference.chapter)
		.join(Lesson)
		.on(LessonReference.lesson == Lesson.name)
		.left_join(CourseProgress)
		.on(
			(CourseProgress.lesson == LessonReference.lesson)
			& (CourseProgress.course == course)
			& (CourseProgress.status == "Complete")
		)
		.select(
			LessonReference.idx,
			ChapterReference.idx.as_("chapter_idx"),
			CourseProgress.lesson,
			Lesson.title,
			Lesson.name.as_("lesson_name"),
			fn.Count(CourseProgress.name).as_("completion_count"),
		)
		.where(ChapterReference.parent == course)
		.groupby(LessonReference.lesson)
		.orderby(ChapterReference.idx, LessonReference.idx)
		.run(as_dict=True)
	)

	return rows


@frappe.whitelist()
def get_course_assessment_progress(course: str, member: str):
	if not can_modify_course(course):
		frappe.throw(
			_("You do not have permission to access this course's assessment data."), frappe.PermissionError
		)

	quizzes = get_course_quiz_progress(course, member)
	assignments = get_course_assignment_progress(course, member)
	programming_exercises = get_course_programming_exercise_progress(course, member)

	return {
		"quizzes": quizzes,
		"assignments": assignments,
		"exercises": programming_exercises,
	}


def get_course_quiz_progress(course: str, member: str):
	quizzes = get_assessment_from_lesson(course, "quiz")
	attempts = []

	for quiz in quizzes:
		submissions = frappe.get_all(
			"LMS Quiz Submission",
			{
				"quiz": quiz,
				"member": member,
			},
			["name", "score", "percentage", "quiz", "quiz_title"],
			order_by="creation desc",
			limit=1,
		)
		if len(submissions):
			attempts.append(submissions[0])
		else:
			attempts.append(
				{
					"quiz": quiz,
					"quiz_title": frappe.db.get_value("LMS Quiz", quiz, "title"),
					"score": 0,
					"percentage": 0,
				}
			)

	return attempts


def get_course_assignment_progress(course: str, member: str):
	assignments = get_assessment_from_lesson(course, "assignment")
	submissions = []

	for assignment in assignments:
		assignment_subs = frappe.get_all(
			"LMS Assignment Submission",
			{
				"assignment": assignment,
				"member": member,
			},
			["name", "status", "assignment", "assignment_title"],
			order_by="creation desc",
			limit=1,
		)
		if len(assignment_subs):
			submissions.append(assignment_subs[0])
		else:
			submissions.append(
				{
					"assignment": assignment,
					"assignment_title": frappe.db.get_value("LMS Assignment", assignment, "title"),
					"status": "Not Submitted",
				}
			)

	return submissions


def get_course_programming_exercise_progress(course: str, member: str):
	exercises = get_assessment_from_lesson(course, "program")
	submissions = []

	for exercise in exercises:
		exercise_subs = frappe.get_all(
			"LMS Programming Exercise Submission",
			{
				"exercise": exercise,
				"member": member,
			},
			["name", "status", "exercise", "exercise_title"],
			order_by="creation desc",
			limit=1,
		)
		if len(exercise_subs):
			submissions.append(exercise_subs[0])
		else:
			submissions.append(
				{
					"exercise": exercise,
					"exercise_title": frappe.db.get_value("LMS Programming Exercise", exercise, "title"),
					"status": "Not Attempted",
				}
			)

	return submissions


def get_assessment_from_lesson(course: str, assessmentType: str):
	assessments = []
	lessons = frappe.get_all("Course Lesson", {"course": course}, ["name", "title", "content"])

	for lesson in lessons:
		if lesson.content:
			content = json.loads(lesson.content)
			for block in content.get("blocks", []):
				if block.get("type") == assessmentType:
					data_field = "exercise" if assessmentType == "program" else assessmentType
					quiz_name = block.get("data", {}).get(data_field)
					assessments.append(quiz_name)

	return assessments

# AI Grading and Rubric functions moved to lms.lms.services.ai_grading.api
	return True


@frappe.whitelist()
def get_gradebook_data(course=None, batch=None):
	"""Fetch student grades aggregated by categories defined in Gradebook Settings."""
	if not course or not batch:
		return []

	# 1. Get Gradebook Settings
	settings = frappe.get_all("LMS Gradebook Settings", 
		filters={"course": course, "batch": batch}, 
		fields=["name", "grading_method", "passing_grade"]
	)
	
	if not settings:
		# Default settings or return empty if not configured
		return []
	
	settings_name = settings[0].name
	categories = frappe.get_all("LMS Gradebook Category", 
		filters={"parent": settings_name}, 
		fields=["category_name", "weight", "assessment_type", "drop_lowest"]
	)

	# 2. Get Students in Batch
	enrollments = frappe.get_all("LMS Batch Enrollment", 
		filters={"batch": batch}, 
		fields=["member", "member_name"]
	)

	gradebook = []

	for enr in enrollments:
		student_id = enr.member
		student_name = enr.member_name

		student_data = {
			"id": student_id,
			"name": student_name,
			"total": 0
		}

		# Initialize category scores
		for cat in categories:
			student_data[cat.category_name.lower()] = 0

		# 3. Fetch Evaluations (Teacher Grading)
		evaluations = frappe.get_all("LMS Teacher Evaluation",
			filters={"student": student_id, "course": course, "batch": batch},
			fields=["overall_rating", "outcome_assessments"]
		)

		# 4. Fetch AI Submissions
		ai_submissions = frappe.get_all("AI Grading Submission",
			filters={"student": student_id, "status": "Done"},
			fields=["score", "session"]
		)

		# Logic to map scores to categories would go here.
		# For now, let's implement a basic version that aggregates some scores.
		total_weighted_score = 0
		
		# Simple mapping logic (Example: matching category name to evaluation period)
		for cat in categories:
			cat_name = cat.category_name.lower()
			weight = cat.weight / 100.0
			
			# Filter evaluations or submissions that belong to this category
			# This is a bit simplified for now.
			category_score = 0
			count = 0
			
			if "quiz" in cat_name:
				# Sum up quiz scores
				pass # TODO: fetch from LMS Quiz Submission
			elif "midterm" in cat_name or "final" in cat_name:
				# Match from Teacher Evaluation
				for ev in evaluations:
					# Map rating to score (Xuất sắc=10, Giỏi=8.5, Khá=7.0, Đạt=5.0, Chưa đạt=3.0)
					rating_map = {"Xuất sắc": 10, "Giỏi": 8.5, "Khá": 7, "Đạt": 5, "Chưa đạt": 3}
					category_score = rating_map.get(ev.overall_rating, 0)
			
			student_data[cat_name] = category_score
			total_weighted_score += category_score * weight

		student_data["total"] = round(total_weighted_score, 2)
		gradebook.append(student_data)

	return gradebook


@frappe.whitelist()
def get_class_competency_matrix(course, batch):
	"""Fetch summary of learning outcomes for a batch."""
	outcomes = frappe.get_all("LMS Learning Outcome", fields=["name", "label"])
	results = frappe.get_all("LMS Student Outcome Result",
		filters={"course": course},
		fields=["learning_outcome", "proficiency_level", "score_percentage"]
	)
	
	matrix = []
	for outcome in outcomes:
		outcome_results = [r for r in results if r.learning_outcome == outcome.name]
		if not outcome_results:
			continue
			
		avg_pct = sum(r.score_percentage for r in outcome_results) / len(outcome_results)
		
		matrix.append({
			"id": outcome.name,
			"label": outcome.label or outcome.name,
			"percentage": round(avg_pct, 1)
		})
		
	return matrix


@frappe.whitelist()
def get_student_grades(student=None):
	"""Fetch all grades for a specific student across their courses."""
	if not student:
		student = frappe.session.user

	# Fetch Teacher Evaluations
	evaluations = frappe.get_all("LMS Teacher Evaluation",
		filters={"student": student},
		fields=["name", "course", "overall_rating", "modified"]
	)

	grades = []
	for ev in evaluations:
		course_title = frappe.db.get_value("LMS Course", ev.course, "title")
		
		# Map rating to score
		rating_map = {"Xuất sắc": 10, "Giỏi": 8.5, "Khá": 7, "Đạt": 5, "Chưa đạt": 3}
		score = rating_map.get(ev.overall_rating, 0)
		
		grades.append({
			"id": ev.name,
			"name": ev.overall_rating,
			"course": course_title or ev.course,
			"date": ev.modified.strftime("%d/%m/%Y") if ev.modified else "",
			"score": score
		})

	return grades




@frappe.whitelist()
def get_game_center_stats():
	from lms.lms.gamification.profile_api import get_game_center_stats as _get
	return _get()


@frappe.whitelist()
def get_user_badges(member=None):
	from lms.lms.gamification.badge_api import get_user_badges as _get
	return _get(member=member)

@frappe.whitelist()
def get_user_game_profile():
	from lms.lms.gamification.profile_api import get_user_game_profile as _get
	return _get()
@frappe.whitelist()
def get_ai_grading_session_attachments(session):
	"""Get all files attached to an AI Grading Session."""
	files = frappe.get_all(
		"File",
		filters={
			"attached_to_doctype": "AI Grading Session",
			"attached_to_name": session
		},
		fields=["name", "file_name", "file_url", "file_size"]
	)
	return files


@frappe.whitelist()
def upload_ai_grading_session_attachment(session, file_url, file_name=None):
	"""Link a file to an AI Grading Session."""
	if not frappe.db.exists("AI Grading Session", session):
		frappe.throw(_("Session {0} not found").format(session))
	
	# Check if file exists
	if not frappe.db.exists("File", {"file_url": file_url}):
		pass

	# Link the file
	file_doc = frappe.get_doc("File", {"file_url": file_url})
	file_doc.attached_to_doctype = "AI Grading Session"
	file_doc.attached_to_name = session
	if file_name:
		file_doc.file_name = file_name
	file_doc.save()
	
	return file_doc.as_dict()


@frappe.whitelist()
def get_lesson_plans(start=0, limit=20, search=None):
	"""Get a list of LMS Lesson Plans."""
	filters = {}
	if search:
		filters["title"] = ["like", f"%{search}%"]
	
	plans = frappe.get_list(
		"LMS Lesson Plan",
		filters=filters,
		fields=["name", "title", "course", "status", "scheduled_date", "creation", "owner"],
		order_by="creation desc",
		start=start,
		page_length=limit
	)
	return plans


@frappe.whitelist()
def get_lesson_plan_stats():
	"""Get basic statistics for Lesson Plans."""
	from frappe.utils import add_days, now
	
	# Fetch all allowed lesson plans (get_list handles Role Permissions)
	plans = frappe.get_list("LMS Lesson Plan", fields=["name", "creation", "plan_type"], limit_page_length=0)
	
	total = len(plans)
	
	thirty_days_ago = add_days(now(), -30)
	# Safely compare datetime string
	this_month = sum(1 for p in plans if str(p.creation) > str(thirty_days_ago))
	
	by_type_dict = {}
	for p in plans:
		ptype = p.plan_type or "Unknown"
		by_type_dict[ptype] = by_type_dict.get(ptype, 0) + 1
		
	by_type_list = [{"label": k, "count": v} for k, v in by_type_dict.items()]
	
	return {
		"total": total,
		"this_month": this_month,
		"by_type": by_type_list
	}

@frappe.whitelist()
def get_documents(course=None, category=None, start=0, limit=20, search=None):
	"""Get a list of LMS Documents filtered by course, category and scope."""
	filters = {}
	
	if course:
		filters["course"] = course
		filters["scope"] = "Course"
	else:
		filters["scope"] = "Community"
		
	if category:
		filters["category"] = category
		
	if search:
		filters["title"] = ["like", f"%{search}%"]
	
	documents = frappe.get_all(
		"LMS Document",
		filters=filters,
		fields=["name", "title", "category", "file", "creation", "owner", "file_type", "file_size"],
		order_by="creation desc",
		start=start,
		page_length=limit
	)
	return documents


@frappe.whitelist()
def create_document(title, scope="Course", batch=None, course=None, category=None, description=None, file=None):
	"""Create a new LMS Document and attach the uploaded file."""
	if not file:
		frappe.throw(_("File is required"))

	import mimetypes
	import base64
	from frappe.utils.file_manager import save_file

	# file is a data URI: "data:application/pdf;base64,JVBERi0xLjQKJ..."
	if "," in file:
		header, encoded = file.split(",", 1)
		mime_type = header.split(";")[0].split(":")[1]
		ext = mimetypes.guess_extension(mime_type) or ""
	else:
		encoded = file
		ext = ""

	file_content = base64.b64decode(encoded)
	
	safe_title = frappe.scrub(title)
	if not safe_title:
		safe_title = frappe.generate_hash(length=10)
	file_name = f"{safe_title}{ext}"

	# 1. Create LMS Document record
	doc = frappe.get_doc({
		"doctype": "LMS Document",
		"title": title,
		"scope": scope,
		"course": course,
		"category": category,
		"description": description,
		"status": "Active"
	})
	doc.insert(ignore_permissions=True, ignore_mandatory=True)

	# 2. Save the file and attach to LMS Document
	frappe_file = save_file(
		fname=file_name,
		content=file_content,
		dt="LMS Document",
		dn=doc.name,
		decode=False,
		is_private=0
	)
	
	# 3. Update the document with file URL
	doc.db_set("file", frappe_file.file_url)
	
	return doc.name

