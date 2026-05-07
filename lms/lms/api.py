"""API methods for the LMS."""

import json
import math
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
	now_datetime,
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
	user.is_moderator = "Moderator" in user.roles
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

	if not (is_batch_student or is_moderator or is_evaluator):
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
		notification.document_details
		and len(notification.document_details.get("instructors", []))
		and not is_mention(notification)
	):
		from_user_details = notification.document_details["instructors"][0]
	else:
		from_user_details = frappe.db.get_value(
			"User", notification.from_user, ["full_name", "user_image"], as_dict=1
		)
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
		instructors = get_instructors("LMS Course", notification.document_name)
		details["instructors"] = instructors
		notification["document_details"] = details

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
		instructors = get_instructors("LMS Batch", notification.document_name)
		details["instructors"] = instructors
		notification["document_details"] = details
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


@frappe.whitelist()
def get_streak_info():
	all_dates = fetch_activity_dates(frappe.session.user)
	streak, longest_streak = calculate_streaks(all_dates)
	current_streak = calculate_current_streak(all_dates, streak)

	return {
		"current_streak": current_streak,
		"longest_streak": longest_streak,
	}


def fetch_activity_dates(user):
	doctypes = [
		"LMS Course Progress",
		"LMS Quiz Submission",
		"LMS Assignment Submission",
		"LMS Programming Exercise Submission",
	]

	all_dates = []
	for dt in doctypes:
		all_dates.extend(frappe.get_all(dt, {"member": user}, pluck="creation"))

	return sorted({d.date() if hasattr(d, "date") else d for d in all_dates})


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

	game_sessions = frappe.db.count(
		"LMS Game Session",
		{"member": user},
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
		"game_sessions": cint(game_sessions),
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

	game_data = frappe.db.get_all("LMS Game Session", filters={"member": member}, fields=["percentage"])
	avg_game_score = 0
	if game_data:
		avg_game_score = round(sum(flt(g.percentage) for g in game_data) / len(game_data), 1)

	return {
		"avg_quiz_score": avg_quiz_score,
		"avg_assignment_score": avg_assignment_score,
		"overall_completion": overall_completion,
		"avg_game_score": avg_game_score,
	}


@frappe.whitelist()
def get_hours_spent(member=None):
	"""Get total hours spent watching videos."""
	if not member:
		member = frappe.session.user

	total_seconds = frappe.db.get_value(
		"LMS Video Watch Duration", {"member": member}, "SUM(CAST(watch_time AS DECIMAL(16,2)))"
	) or 0

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
	is_moderator = "Moderator" in roles

	# Get batches where current user is instructor
	batches = []
	if is_moderator:
		batches = frappe.get_all("LMS Batch", pluck="name")
	else:
		batches = frappe.get_all("Course Instructor", {"instructor": frappe.session.user}, pluck="parent")

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


def calculate_composite_score(member, batch=None):
	"""Calculate composite score for a member.

	Formula:
		Score = (0.30 * avg_quiz_pct)
		      + (0.25 * avg_assignment_pct)
		      + (0.25 * completion_pct)
		      + (0.10 * min(streak / 30, 1) * 100)
		      + (0.10 * min(hours / 100, 1) * 100)
	"""
	W_QUIZ = 0.30
	W_ASSIGNMENT = 0.25
	W_COMPLETION = 0.25
	W_STREAK = 0.10
	W_HOURS = 0.10
	W_GAMES = 0.10
	STREAK_CAP = 30
	HOURS_CAP = 100
	GAMES_CAP = 100
	filters = {"member": member}
	class_games = []
	if batch:
		courses = frappe.get_all("Batch Course", {"parent": batch}, pluck="course")
		if courses:
			filters["course"] = ["in", courses]
		class_games = frappe.get_all("LMS Class Game", {"batch": batch}, pluck="name")

	# Quiz score
	quiz_data = frappe.db.get_all("LMS Quiz Submission", filters=filters, fields=["percentage"])
	avg_quiz_pct = 0
	if quiz_data:
		avg_quiz_pct = sum(q.percentage for q in quiz_data) / len(quiz_data)

	# Assignment score
	assignment_data = frappe.db.get_all(
		"LMS Assignment Submission",
		filters={**filters, "status": ["in", ["Pass", "Fail"]]},
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

	# Completion percentage
	enrollment_filters = {"member": member}
	if batch:
		enrollment_filters["batch"] = batch
	enrollment_data = frappe.db.get_all("LMS Enrollment", filters=enrollment_filters, fields=["progress"])
	completion_pct = 0
	if enrollment_data:
		completion_pct = sum(flt(e.progress) for e in enrollment_data) / len(enrollment_data)

	# Streak
	all_dates = fetch_activity_dates(member)
	streak, _ = calculate_streaks(all_dates)
	current_streak = calculate_current_streak(all_dates, streak)

	# Hours spent
	total_seconds = frappe.db.get_value(
		"LMS Video Watch Duration", {"member": member}, "SUM(CAST(watch_time AS DECIMAL(16,2)))"
	) or 0
	total_hours = flt(total_seconds) / 3600

	# Game score
	game_filters = dict(filters)
	if batch:
		game_filters["class_game"] = ["in", class_games] if class_games else ["in", [""]]
	game_data = frappe.db.get_all(
		"LMS Game Session",
		filters=game_filters,
		fields=["normalized_score"],
	)
	avg_game_pct = 0
	if game_data:
		avg_game_pct = sum(flt(g.normalized_score) for g in game_data) / len(game_data)

	streak_score = min(current_streak / STREAK_CAP, 1) * 100
	hours_score = min(total_hours / HOURS_CAP, 1) * 100
	game_score = min(avg_game_pct / GAMES_CAP, 1) * 100

	composite_score = round(
		(W_QUIZ * avg_quiz_pct)
		+ (W_ASSIGNMENT * avg_assignment_pct)
		+ (W_COMPLETION * completion_pct)
		+ (W_STREAK * streak_score)
		+ (W_HOURS * hours_score)
		+ (W_GAMES * game_score),
		1,
	)

	return {
		"composite_score": composite_score,
		"avg_quiz_score": round(avg_quiz_pct, 1),
		"avg_assignment_score": round(avg_assignment_pct, 1),
		"completion_pct": round(completion_pct, 1),
		"streak_days": current_streak,
		"hours_spent": round(total_hours, 1),
		"avg_game_score": round(avg_game_pct, 1),
	}


def _leaderboard_cache_key(batch=None):
	return f"game_leaderboard:{batch or 'global'}"


def _can_access_batch(batch):
	roles = frappe.get_roles()
	if "Moderator" in roles:
		return True
	if "Course Creator" in roles:
		return frappe.db.exists("Course Instructor", {"parent": batch, "instructor": frappe.session.user})
	if "Batch Evaluator" in roles:
		return frappe.db.exists("Course Evaluator", {"parent": batch, "evaluator": frappe.session.user})
	return frappe.db.exists("LMS Batch Enrollment", {"batch": batch, "member": frappe.session.user})


def _assert_batch_access(batch):
	if batch and not _can_access_batch(batch):
		frappe.throw(_("You are not allowed to access this batch."))


def _build_leaderboard(batch=None):
	if batch:
		_assert_batch_access(batch)
		members = frappe.get_all("LMS Batch Enrollment", {"batch": batch}, pluck="member")
	else:
		members = frappe.get_all("LMS Enrollment", group_by="member", pluck="member")

	if not members:
		return []

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

	for entry in leaderboard:
		user_data = frappe.db.get_value(
			"User", entry["member"], ["full_name", "user_image", "username"], as_dict=True
		)
		entry["member_name"] = user_data.full_name if user_data else ""
		entry["member_image"] = user_data.user_image if user_data else ""
		entry["username"] = user_data.username if user_data else ""

	return leaderboard


@frappe.whitelist()
def get_leaderboard(batch=None, limit=10):
	"""Get leaderboard with composite scores."""
	limit = max(1, min(cint(limit) or 10, 100))
	_assert_batch_access(batch)
	cache_key = _leaderboard_cache_key(batch)
	cached = frappe.cache().get_value(cache_key)
	if cached:
		return cached[:limit]
	leaderboard = _build_leaderboard(batch=batch)
	frappe.cache().set_value(cache_key, leaderboard, expires_in_sec=900)
	return leaderboard[:limit]


@frappe.whitelist()
def get_gamification_questions(question_type=None, category=None, difficulty=None, limit=10):
	filters = {"disabled": 0}
	if question_type:
		filters["question_type"] = question_type
	if category:
		filters["category"] = category
	if difficulty:
		filters["difficulty"] = difficulty
	questions = frappe.get_all(
		"LMS Gamification Question Bank",
		filters=filters,
		fields=["name", "question_text", "question_type", "options", "correct_answer", "hint", "category", "difficulty", "sort_items"],
		limit=cint(limit) or 10,
		order_by="modified desc",
	)
	return questions


@frappe.whitelist()
def record_game_session(game, score, max_score=100, result="Completed", metadata=None):
	if not frappe.session.user or frappe.session.user == "Guest":
		frappe.throw(_("Please log in to save game progress."))

	game_session = frappe.get_doc(
		{
			"doctype": "LMS Game Session",
			"game": game,
			"member": frappe.session.user,
			"score": cint(score),
			"max_score": cint(max_score) or 100,
			"result": result,
			"metadata": metadata or {},
		}
	)
	game_session.insert(ignore_permissions=True)
	frappe.db.commit()
	return {"name": game_session.name, "percentage": game_session.percentage}


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
	import json
	if isinstance(data, str):
		data = json.loads(data)
	doc = frappe.new_doc("AI Grading Session")
	doc.route_slug = _slugify_ai_grading_session_name(data.get("session_name", ""))
	doc.update(data)
	doc.insert()

	# If batch is provided, initialize submissions for all enrolled students
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
	import json
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
	# Delete all submissions
	frappe.db.delete("AI Grading Submission", {"session": session})
	# Delete session
	frappe.delete_doc("AI Grading Session", session)
	return True


@frappe.whitelist()
def get_ai_grading_session_detail(session):
	"""Get details for a single AI Grading Session (aliased to get_ai_grading_session_by_name)."""
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
			"status",
			"score",
			"ai_rating",
			"paper_image",
			"teacher_feedback",
		],
		order_by="creation asc",
	)

	for submission in submissions:
		submission.paper_images = _get_ai_grading_submission_paper_images(
			submission.name,
			submission.paper_image,
		)

	return submissions


def _is_ai_grading_image_file(file_url):
	if not file_url:
		return False

	file_url = file_url.lower()
	return file_url.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"))


def _get_ai_grading_submission_paper_images(submission_name, primary_image=None):
	images = []
	if primary_image:
		images.append(primary_image)

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
		if file_url and _is_ai_grading_image_file(file_url) and file_url not in images:
			images.append(file_url)

	return images


@frappe.whitelist()
def search_ai_grading_students(query=None, limit=20):
	"""Search users that can be selected as students in AI grading workspace."""
	limit = cint(limit) if limit else 20
	if limit <= 0:
		limit = 20
	limit = min(limit, 50)

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

	return [
		{
			"name": user.name,
			"username": user.username,
			"full_name": user.full_name,
			"user_image": user.user_image,
		}
		for user in users
	]


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
	"""Add one student submission to an existing AI grading session."""
	import json

	if not session or not frappe.db.exists("AI Grading Session", session):
		frappe.throw(_("AI Grading Session not found or session ID is missing. Got: {0}").format(session))

	student = (student or "").strip()
	if not student:
		frappe.throw(_("Student is required."))

	student_sbd = (student_sbd or "").strip()
	image_payloads = []
	image_names = []

	if isinstance(paper_images_data, str):
		try:
			parsed_images = json.loads(paper_images_data)
			if isinstance(parsed_images, list):
				image_payloads = parsed_images
		except Exception:
			image_payloads = [paper_images_data]
	elif isinstance(paper_images_data, list):
		image_payloads = paper_images_data

	if isinstance(paper_images_names, str):
		try:
			parsed_names = json.loads(paper_images_names)
			if isinstance(parsed_names, list):
				image_names = parsed_names
		except Exception:
			image_names = [paper_images_names]
	elif isinstance(paper_images_names, list):
		image_names = paper_images_names

	if not image_payloads and paper_image_data:
		image_payloads = [paper_image_data]
		image_names = [paper_image_name]

	user_name = student
	if not frappe.db.exists("User", user_name):
		user_name = frappe.db.get_value("User", {"username": student}, "name")

	if not user_name or not frappe.db.exists("User", user_name):
		frappe.throw(_("Student '{0}' not found. Please select a valid user email or username.").format(student))

	existing_submission = frappe.db.get_value(
		"AI Grading Submission",
		{"session": session, "student": user_name},
		["name", "student", "student_name", "status"],
		as_dict=1,
	)
	if existing_submission:
		return {
			"name": existing_submission.name,
			"student": existing_submission.student,
			"student_name": existing_submission.student_name,
			"status": existing_submission.status,
			"already_exists": 1,
		}

	try:
		doc = frappe.new_doc("AI Grading Submission")
		doc.session = session
		doc.student = user_name
		# Explicitly set student_name to avoid NULL fetch issues
		doc.student_name = student_name or frappe.db.get_value("User", user_name, "full_name")
		
		if student_sbd and frappe.db.has_column("AI Grading Submission", "student_sbd"):
			doc.student_sbd = student_sbd
		doc.status = "Pending"
		doc.insert()
		saved_image_urls = []
		for idx, image_payload in enumerate(image_payloads):
			image_name = image_names[idx] if idx < len(image_names) else None
			try:
				image_url = _save_ai_grading_submission_image_data(
					image_payload,
					image_name,
					attached_to_doctype=doc.doctype,
					attached_to_name=doc.name,
				)
			except Exception:
				frappe.log_error(frappe.get_traceback(), "AI Grading Image Upload Error")
				image_url = None
			if image_url:
				saved_image_urls.append(image_url)
		if not saved_image_urls and paper_image:
			saved_image_urls = [paper_image]
		if saved_image_urls and doc.paper_image != saved_image_urls[0]:
			doc.paper_image = saved_image_urls[0]
			doc.save(ignore_permissions=True)
	except frappe.exceptions.ValidationError as ve:
		frappe.log_error(frappe.get_traceback(), "add_ai_grading_submission ValidationError")
		frappe.throw(str(ve))
	except Exception as e:
		frappe.log_error(frappe.get_traceback(), "add_ai_grading_submission Error")
		frappe.throw(_("Failed to add student: {0}").format(str(e)))

	return {
		"name": doc.name,
		"student": doc.student,
		"student_name": doc.student_name,
		"student_sbd": getattr(doc, "student_sbd", None) if frappe.db.has_column("AI Grading Submission", "student_sbd") else None,
		"status": doc.status,
	}


def _save_ai_grading_submission_image_data(
	data_url,
	file_name=None,
	attached_to_doctype=None,
	attached_to_name=None,
):
	"""Persist image payload and return file URL. Returns None when payload is invalid."""
	if not data_url:
		return None

	if isinstance(data_url, dict):
		data_url = data_url.get("file_url") or data_url.get("data")

	if not isinstance(data_url, str):
		return None

	# If caller already provided a file URL, reuse it.
	if data_url.startswith("/files/") or data_url.startswith("/private/files/"):
		return data_url

	mime_type = "image/jpeg"
	content = data_url

	if data_url.startswith("data:"):
		try:
			headers, content = data_url.split(",", 1)
			mime_type = headers.split(";", 1)[0].replace("data:", "") or "image/jpeg"
		except ValueError:
			return None

	try:
		content_bytes = safe_b64decode(content.encode("utf-8"))
	except BinasciiError:
		return None

	if not content_bytes:
		return None

	filename = (file_name or "").strip() or get_random_filename(content_type=mime_type)
	file_doc = frappe.get_doc(
		{
			"doctype": "File",
			"file_name": filename,
			"content": content_bytes,
			"decode": False,
			"is_private": False,
			"attached_to_doctype": attached_to_doctype,
			"attached_to_name": attached_to_name,
		}
	)
	file_doc.save(ignore_permissions=True)
	return file_doc.file_url

@frappe.whitelist()
def get_ai_grading_session_by_name(session_name):
	"""Get AI Grading Session details along with its submissions."""
	session_detail = frappe.db.get_value(
		"AI Grading Session",
		session_name,
		["name", "session_name", "route_slug", "grading_type", "subject", "level", "status", "ai_notes", "reference_doc_type", "reference_doc"],
		as_dict=1,
	)
	if not session_detail:
		frappe.throw(_("AI Grading Session not found."))
	submissions = get_ai_grading_submissions(session_detail.name)
	session_detail.submissions = submissions
	return session_detail


@frappe.whitelist()
def save_ai_grading_result(submission_id, data):
	"""Save grading result for a submission."""
	import json
	if isinstance(data, str):
		data = json.loads(data)

	doc = frappe.get_doc("AI Grading Submission", submission_id)
	doc.update(data)
	doc.save()
	return doc.name


@frappe.whitelist()
def get_ai_grading_session_by_slug(session_slug, grading_type=None):
	"""Find an AI Grading Session by its route slug or document name."""
	raw_session_slug = (session_slug or "").strip()
	normalized_slug = _slugify_ai_grading_session_name(raw_session_slug)
	if not raw_session_slug and not normalized_slug:
		frappe.throw(_("Session slug is required."))

	detail_fields = [
		"name", "session_name", "route_slug", "grading_type", "subject", "level",
		"status", "ai_notes", "reference_doc_type", "reference_doc",
	]

	# 1. Try exact match by document name
	if raw_session_slug and frappe.db.exists("AI Grading Session", raw_session_slug):
		doc = frappe.db.get_value("AI Grading Session", raw_session_slug, detail_fields, as_dict=1)
		if doc:
			if not doc.get("route_slug"):
				doc.route_slug = _slugify_ai_grading_session_name(doc.get("session_name") or doc.get("name"))
			return doc

	# 2. Try match by route_slug column
	filters = {}
	if grading_type:
		filters["grading_type"] = grading_type

	if normalized_slug:
		slug_filters = dict(filters)
		slug_filters["route_slug"] = normalized_slug
		matched = frappe.get_all(
			"AI Grading Session",
			filters=slug_filters,
			fields=detail_fields,
			order_by="modified desc",
			limit_page_length=1,
		)
		if matched:
			return matched[0]

	# 3. Fallback: slugify all session names and compare
	sessions = frappe.get_all(
		"AI Grading Session", filters=filters, fields=detail_fields, order_by="modified desc"
	)
	for session in sessions:
		slug = _slugify_ai_grading_session_name(session.get("session_name") or session.get("name"))
		if slug == normalized_slug:
			if not session.get("route_slug"):
				session.route_slug = slug
			return session

	# 4. Retry without grading_type filter
	if grading_type:
		return get_ai_grading_session_by_slug(raw_session_slug, grading_type=None)

	frappe.throw(_("AI Grading Session not found."))


def _slugify_ai_grading_session_name(value):
	"""Convert a session name to a URL-friendly slug using proper Unicode normalization."""
	import unicodedata

	text = (value or "").strip().lower()
	if not text:
		return ""

	# Vietnamese đ/Đ → d
	text = text.replace("đ", "d").replace("Đ", "d")

	# Normalize Unicode → ASCII (e.g. á → a, ê → e, etc.)
	text = unicodedata.normalize("NFKD", text)
	text = "".join(c for c in text if not unicodedata.combining(c))

	# Replace non-alphanumeric with hyphens
	text = re.sub(r"[^a-z0-9]+", "-", text)
	return text.strip("-")


@frappe.whitelist()
def get_ai_grading_analytics():
	"""Get AI Grading analytics/statistics. Admin (Moderator) only."""
	frappe.only_for("Moderator")

	from frappe.utils import getdate, now

	today = getdate(now())

	total_sessions = frappe.db.count("AI Grading Session")
	open_sessions = frappe.db.count("AI Grading Session", {"status": "Open"})
	total_submissions = frappe.db.count("AI Grading Submission")
	graded_today = frappe.db.count(
		"AI Grading Submission",
		{"status": "Done", "modified": [">=", f"{today} 00:00:00"]},
	)
	need_review = frappe.db.count("AI Grading Submission", {"status": "Flagged"})

	# Satisfaction stats
	total_rated = frappe.db.count(
		"AI Grading Submission", {"ai_rating": ["in", ["Satisfied", "Dissatisfied"]]}
	)
	satisfied_count = frappe.db.count("AI Grading Submission", {"ai_rating": "Satisfied"})
	dissatisfied_count = frappe.db.count("AI Grading Submission", {"ai_rating": "Dissatisfied"})
	satisfaction_rate = round((satisfied_count / total_rated * 100), 1) if total_rated > 0 else 0

	return {
		"total_sessions": total_sessions,
		"open_sessions": open_sessions,
		"total_submissions": total_submissions,
		"graded_today": graded_today,
		"need_review": need_review,
		"total_rated": total_rated,
		"satisfied_count": satisfied_count,
		"dissatisfied_count": dissatisfied_count,
		"satisfaction_rate": satisfaction_rate,
	}


@frappe.whitelist()
def get_ai_grading_dissatisfaction_feed(limit=20):
	"""Get submissions where teacher rated AI as Dissatisfied. Admin only."""
	frappe.only_for("Moderator")

	limit = min(cint(limit) or 20, 100)

	submissions = frappe.get_all(
		"AI Grading Submission",
		filters={"ai_rating": "Dissatisfied"},
		fields=[
			"name",
			"session",
			"student",
			"student_name",
			"student_sbd",
			"score",
			"dissatisfaction_reason",
			"modified",
		],
		order_by="modified desc",
		limit_page_length=limit,
	)

	for sub in submissions:
		sub.session_name = frappe.db.get_value(
			"AI Grading Session", sub.session, "session_name"
		) or sub.session
		sub.date = str(sub.modified)

	return submissions


@frappe.whitelist()
def get_ai_grading_session_statistics(session):
	"""Get detailed statistics for a specific AI Grading Session."""
	import json
	submissions = frappe.get_all(
		"AI Grading Submission",
		filters={"session": session},
		fields=["name", "student", "student_name", "student_sbd", "status", "score", "ai_feedback"]
	)

	total = len(submissions)
	graded = len([s for s in submissions if s.status == "Done"])
	ungraded = total - graded

	high_scores = len([s for s in submissions if s.score and s.score >= 8.0])
	low_scores = len([s for s in submissions if s.score and (s.score < 5.0 and s.status == "Done")])
	
	# Calculate score distribution (buckets: 0-2, 2-4, 4-6, 6-8, 8-10)
	buckets = ["0-2", "2-4", "4-6", "6-8", "8-10"]
	distribution = {b: 0 for b in buckets}
	for s in submissions:
		if s.score is not None:
			if s.score < 2: distribution["0-2"] += 1
			elif s.score < 4: distribution["2-4"] += 1
			elif s.score < 6: distribution["4-6"] += 1
			elif s.score < 8: distribution["6-8"] += 1
			else: distribution["8-10"] += 1
	
	score_distribution = [{"bucket": b, "count": distribution[b]} for b in buckets]

	# Calculate average score for graded papers
	graded_scores = [s.score for s in submissions if s.score is not None]
	avg_score = round(sum(graded_scores) / len(graded_scores), 2) if graded_scores else 0

	# Analyze question-level failures from AI feedback
	question_stats = {}
	for s in submissions:
		if s.ai_feedback:
			try:
				feedback = json.loads(s.ai_feedback)
				if isinstance(feedback, list):
					for criterion in feedback:
						q_name = criterion.get("name")
						badge = criterion.get("badge")
						if q_name:
							if q_name not in question_stats:
								question_stats[q_name] = {"total": 0, "fail": 0}
							question_stats[q_name]["total"] += 1
							if badge in ["partial", "wrong"]:
								question_stats[q_name]["fail"] += 1
			except Exception:
				continue

	# Format most failed questions
	top_failed_questions = []
	for q_name, stats in question_stats.items():
		fail_rate = round((stats["fail"] / stats["total"]) * 100, 1) if stats["total"] > 0 else 0
		top_failed_questions.append({
			"name": q_name,
			"fail_count": stats["fail"],
			"fail_rate": fail_rate,
			"total": stats["total"]
		})
	
	top_failed_questions.sort(key=lambda x: x["fail_rate"], reverse=True)

	# Get at-risk students (score < 5)
	at_risk_students = [
		{
			"name": s.student_name or s.student,
			"student_id": s.student,
			"sbd": s.student_sbd,
			"score": s.score,
			"submission_id": s.name
		}
		for s in submissions if s.score is not None and s.score < 5.0
	]

	return {
		"total": total,
		"graded": graded,
		"ungraded": ungraded,
		"high_scores": high_scores,
		"low_scores": low_scores,
		"score_distribution": score_distribution,
		"avg_score": avg_score,
		"top_failed_questions": top_failed_questions[:5],
		"at_risk_students": at_risk_students
	}


@frappe.whitelist()
def send_ai_grading_result_email(submission):
	"""Send an email to the student with their AI grading results."""
	sub = frappe.get_doc("AI Grading Submission", submission)
	if not sub:
		frappe.throw(_("Submission not found."))

	if not sub.score and sub.status != "Done":
		frappe.throw(_("Submission has not been graded yet."))

	student_email = sub.student
	if not student_email or "@" not in student_email:
		student_email = frappe.db.get_value("User", sub.student, "email")

	if not student_email:
		frappe.throw(_("No email address found for student {0}").format(sub.student))

	session_name = frappe.db.get_value("AI Grading Session", sub.session, "session_name") or sub.session

	subject = _("AI Grading Result: {0}").format(session_name)
	
	content = f"""
		<h3>{_("Hello {0},").format(sub.student_name or sub.student)}</h3>
		<p>{_("Your submission for <b>{0}</b> has been graded by AI.")}</p>
		<p style="font-size: 18px;">{_("Final Score:")} <b>{sub.score} / 10</b></p>
		<hr/>
		<p>{_("AI Feedback Summary:")}</p>
		<blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #2d6a4f;">
			{sub.teacher_feedback or _("Please review details in the LMS portal.")}
		</blockquote>
		<p>{_("Best regards,")}<br/>{_("LMS Learning Support")}</p>
	"""

	frappe.sendmail(
		recipients=[student_email],
		subject=subject,
		content=content,
		now=True
	)

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
	member = frappe.session.user
	member_name = frappe.get_value("User", member, "full_name") or member
	score_data = calculate_composite_score(member)
	streak_data = get_streak_info()

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
def get_user_badges(member=None):
	if not member:
		member = frappe.session.user
	elif member != frappe.session.user and "Moderator" not in frappe.get_roles():
		frappe.throw(_("You can only view your own badges."))

	badges = frappe.get_all(
		"LMS Badge",
		{"enabled": 1},
		["name", "title", "image", "description"],
	)

	earned = frappe.get_all(
		"LMS Badge Assignment",
		{"member": member},
		["badge", "issued_on"],
	)

	earned_map = {e.badge: e.issued_on for e in earned}

	return [
		{
			"name": b.name,
			"title": b.title,
			"image": b.image,
			"description": b.description,
			"earned": b.name in earned_map,
			"issued_on": str(earned_map[b.name]) if b.name in earned_map else None,
		}
		for b in badges
	]

@frappe.whitelist()
def get_user_game_profile():
	member = frappe.session.user
	cache_key = f"game_profile:{member}"
	cached = frappe.cache().get_value(cache_key)
	if cached:
		return cached
	member_name = frappe.get_value("User", member, "full_name") or member
	score_data = calculate_composite_score(member)
	streak_data = get_streak_info()

	total_score = score_data.get("composite_score", 0)
	level = 1 + int(math.sqrt(total_score / 50)) if total_score > 0 else 1
	xp_for_current = 50 * (level - 1) ** 2
	xp_for_next = 50 * level**2
	xp_in_level = round(total_score - xp_for_current, 1)
	xp_to_next = xp_for_next - xp_for_current

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

	result = {
		"member_name": member_name,
		"level": level,
		"xp": xp_in_level,
		"xp_to_next": xp_to_next,
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
	frappe.cache().set_value(cache_key, result, expires_in_sec=300)
	return result


@frappe.whitelist()
def list_class_games(batch=None, member=None):
	member = member or frappe.session.user
	if batch:
		_assert_batch_access(batch)
		games = frappe.get_all(
			"LMS Class Game",
			{"batch": batch},
			fields=["name", "game", "batch", "settings", "max_attempts", "available_from", "available_until"],
		)
		for game in games:
			game_details = frappe.get_value(
				"LMS Game",
				game.game,
				["name", "title", "game_type", "delivery_mode", "scoring_model", "max_score"],
				as_dict=1,
			)
			game.game_details = game_details
			game.class_game = game.name
			game.playable = 1
		return games

	games = frappe.get_all(
		"LMS Game",
		{"is_active": 1},
		fields=["name", "title", "game_type", "delivery_mode", "scoring_model", "max_score"],
		order_by="creation asc",
	)
	for game in games:
		game.game_details = game
		game.class_game = None
		game.playable = 1
	return games


@frappe.whitelist()
def get_game_progress(class_game, member=None):
	member = frappe.session.user
	class_game_doc = frappe.get_doc("LMS Class Game", class_game)
	_assert_batch_access(class_game_doc.batch)
	return frappe.get_value(
		"LMS Game Progress",
		{"class_game": class_game, "member": member},
		[
			"class_game",
			"member",
			"best_score",
			"average_score",
			"total_score",
			"attempt_count",
			"progress_percentage",
			"last_session",
		],
		as_dict=1,
	)


@frappe.whitelist()
def start_game_session(class_game):
	class_game_doc = frappe.get_doc("LMS Class Game", class_game)
	_assert_batch_access(class_game_doc.batch)
	game_doc = frappe.get_doc("LMS Game", class_game_doc.game)
	if not game_doc.is_active:
		frappe.throw(_("This game is not active."))
	if class_game_doc.available_from and class_game_doc.available_from > now_datetime():
		frappe.throw(_("This game is not available yet."))
	if class_game_doc.available_until and class_game_doc.available_until < now_datetime():
		frappe.throw(_("This game is no longer available."))
	recent = frappe.db.count(
		"LMS Game Session",
		{
			"member": frappe.session.user,
			"class_game": class_game_doc.name,
			"started_at": [">", now_datetime() - timedelta(seconds=30)],
		},
	)
	if recent > 0:
		frappe.throw(_("Please wait before starting another session."))
	if class_game_doc.max_attempts:
		attempts = frappe.db.count(
			"LMS Game Session",
			{"class_game": class_game_doc.name, "member": frappe.session.user, "status": ["in", ["Started", "Completed"]]},
		)
		if attempts >= class_game_doc.max_attempts:
			frappe.throw(_("You have reached the maximum number of attempts."))
	else:
		attempts = frappe.db.count(
			"LMS Game Session", {"class_game": class_game_doc.name, "member": frappe.session.user}
		)
	session = frappe.new_doc("LMS Game Session")
	session.class_game = class_game_doc.name
	session.member = frappe.session.user
	session.attempt_no = attempts + 1
	session.status = "Started"
	session.started_at = now_datetime()
	session.insert(ignore_permissions=True)
	return {"session_id": session.name}


@frappe.whitelist()
def submit_game_session(session_id, raw_score, metadata=None):
	session = frappe.get_doc("LMS Game Session", session_id)
	if session.member != frappe.session.user:
		frappe.throw(_("Unauthorized."), frappe.PermissionError)
	if session.status == "Completed":
		frappe.throw(_("Session already submitted."))

	class_game = frappe.get_doc("LMS Class Game", session.class_game)
	game = frappe.get_doc("LMS Game", class_game.game)
	max_score = cint(game.max_score) or 1000
	raw_score = max(0, min(cint(raw_score), max_score))
	completed_at = now_datetime()
	session.raw_score = raw_score
	session.normalized_score = round(raw_score / max_score * 100, 1)
	session.status = "Completed"
	session.completed_at = completed_at
	session.duration_seconds = int((completed_at - session.started_at).total_seconds())
	session.metadata = json.dumps(metadata) if metadata else None
	session.save(ignore_permissions=True)
	update_game_progress(session)
	return {"score": raw_score, "normalized": session.normalized_score}


def update_game_progress(session):
	class_game = frappe.get_doc("LMS Class Game", session.class_game)
	game = frappe.get_doc("LMS Game", class_game.game)
	progress_name = frappe.db.get_value(
		"LMS Game Progress", {"class_game": session.class_game, "member": session.member}
	)
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
		total = (progress.average_score or 0) * (progress.attempt_count - 1) + session.raw_score
		progress.average_score = round(total / progress.attempt_count, 1)
		progress.best_score = round(progress.average_score)

	progress.progress_percentage = round(progress.best_score / (cint(game.max_score) or 1) * 100, 1)
	progress.save(ignore_permissions=True)
	frappe.db.commit()
	frappe.cache().delete_value(_leaderboard_cache_key())
	frappe.cache().delete_value(_leaderboard_cache_key(class_game.batch))
	frappe.cache().delete_value(f"game_profile:{session.member}")
	leaderboard = _build_leaderboard(batch=class_game.batch)
	frappe.publish_realtime(
		"game_score_updated",
		{"class_game": session.class_game, "member": session.member, "best_score": progress.best_score},
		user=session.member,
		after_commit=True,
	)
	frappe.publish_realtime(
		"leaderboard_updated",
		{"batch": class_game.batch, "top_5": leaderboard[:5]},
		after_commit=True,
	)


@frappe.whitelist()
def create_game(data):
	frappe.only_for("Moderator")
	game = frappe.get_doc(json.loads(data))
	game.insert(ignore_permissions=True)
	return game.name


@frappe.whitelist()
def assign_game_to_batch(game, batch, settings=None):
	frappe.only_for(["Moderator", "Course Creator"])
	if "Moderator" not in frappe.get_roles() and not can_modify_batch(batch):
		frappe.throw(_("You can only assign games to your own batches."))
	doc = frappe.new_doc("LMS Class Game")
	doc.game = game
	doc.batch = batch
	doc.settings = json.loads(settings) if settings else None
	doc.insert(ignore_permissions=True)
	return doc.name


@frappe.whitelist()
def create_batch_quiz(batch, title, questions, duration, passing_pct):
	frappe.only_for(["Moderator", "Course Creator"])
	if "Moderator" not in frappe.get_roles() and not can_modify_batch(batch):
		frappe.throw(_("You can only create quizzes for your own batches."))
	questions = json.loads(questions) if isinstance(questions, str) else (questions or [])
	quiz = frappe.new_doc("LMS Quiz")
	quiz.title = title
	quiz.duration = duration
	quiz.passing_percentage = passing_pct
	quiz.questions = []
	for question in questions:
		quiz.append(
			"questions",
			{
				"question": question.get("question"),
				"marks": question.get("marks", 1),
			},
		)
	quiz.insert(ignore_permissions=True)
	assignment = frappe.new_doc("LMS Assessment Assignment")
	assignment.quiz = quiz.name
	assignment.batch = batch
	assignment.assigned_by = frappe.session.user
	assignment.insert(ignore_permissions=True)
	return {"quiz": quiz.name, "assignment": assignment.name}


@frappe.whitelist()
def get_batch_statistics(batch):
	frappe.only_for(["Moderator", "Course Creator", "Batch Evaluator"])
	if "Moderator" not in frappe.get_roles():
		if "Course Creator" in frappe.get_roles():
			if not frappe.db.exists("Course Instructor", {"parent": batch, "instructor": frappe.session.user}):
				frappe.throw(_("You can only view batches you teach."))
		elif "Batch Evaluator" in frappe.get_roles():
			if not frappe.db.exists("Course Evaluator", {"parent": batch, "evaluator": frappe.session.user}):
				frappe.throw(_("You can only view batches assigned to you."))
	members = frappe.get_all("LMS Batch Enrollment", {"batch": batch}, pluck="member")
	return {"total_students": len(members)}


@frappe.whitelist()
def award_badge(badge, member, batch=None):
	frappe.only_for("Moderator")
	if frappe.db.exists("LMS Badge Assignment", {"badge": badge, "member": member}):
		return {"name": frappe.db.get_value("LMS Badge Assignment", {"badge": badge, "member": member}, "name")}
	assignment = frappe.new_doc("LMS Badge Assignment")
	assignment.badge = badge
	assignment.member = member
	assignment.issued_on = now_datetime().date()
	assignment.insert(ignore_permissions=True)
	return assignment.name


@frappe.whitelist()
def create_badge(title, description, image, category=None):
	frappe.only_for("Moderator")
	badge = frappe.new_doc("LMS Badge")
	badge.title = title
	badge.description = description
	badge.image = image
	badge.insert(ignore_permissions=True)
	return badge.name
