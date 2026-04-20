# Copyright (c) 2021, Frappe and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.desk.doctype.notification_log.notification_log import make_notification_logs
from frappe.model.document import Document
from frappe.utils import validate_url

from lms.lms.utils import get_lms_route


class LMSAssignmentSubmission(Document):
	def validate(self):
		self.validate_duplicates()
		self.validate_url()
		self.validate_status()

	def on_update(self):
		self.validate_private_attachments()
		self.log_grade_history()

	def log_grade_history(self):
		if self.is_new():
			return
		
		doc_before_save = self.get_doc_before_save()
		if not doc_before_save:
			return
			
		changed = False
		event_type = "Score Modified"
		
		if getattr(doc_before_save, "numeric_score", 0) != getattr(self, "numeric_score", 0):
			changed = True
		elif doc_before_save.comments != self.comments:
			changed = True
			event_type = "Feedback Added"
		elif doc_before_save.status != self.status:
			changed = True
			event_type = "Status Changed"
			
		if changed:
			try:
				course = frappe.db.get_value("LMS Assignment", self.assignment, "course") if self.assignment else None
				frappe.get_doc({
					"doctype": "LMS Grade History Log",
					"student": self.member,
					"course": course,
					"grader": getattr(self, "evaluator", frappe.session.user),
					"grading_source": "Teacher",
					"event_type": event_type,
					"submission_type": "LMS Assignment Submission",
					"submission_id": self.name,
					"score_before": getattr(doc_before_save, "numeric_score", 0) or 0.0,
					"score_after": getattr(self, "numeric_score", 0) or 0.0,
					"max_score": getattr(self, "score_out_of", 0) or 0.0,
					"feedback_text": getattr(self, "comments", "")
				}).insert(ignore_permissions=True)
			except Exception as e:
				frappe.log_error(title="Error logging Assignment grade history", message=str(e))

	def validate_duplicates(self):
		if frappe.db.exists(
			"LMS Assignment Submission",
			{"assignment": self.assignment, "member": self.member, "name": ["!=", self.name]},
		):
			lesson_title = frappe.db.get_value("Course Lesson", self.lesson, "title")
			frappe.throw(
				_("Assignment for Lesson {0} by {1} already exists.").format(lesson_title, self.member_name)
			)

	def validate_url(self):
		if self.type == "URL" and not validate_url(self.answer, True, ["http", "https"]):
			frappe.throw(_("Please enter a valid URL."))

	def validate_status(self):
		if not self.is_new():
			doc_before_save = self.get_doc_before_save()
			if doc_before_save.status != self.status or doc_before_save.comments != self.comments:
				self.trigger_update_notification()

	def validate_private_attachments(self):
		if self.type == "Text":
			from bs4 import BeautifulSoup

			soup = BeautifulSoup(self.answer, "html.parser")
			images = soup.find_all("img")
			self.attach_images_to_document(images)

	def attach_images_to_document(self, images):
		for img in images:
			src = img.get("src", "")
			if src.startswith("/private/files/"):
				file_name = frappe.db.get_value("File", {"file_url": src}, "name")
				if file_name:
					frappe.db.set_value(
						"File",
						file_name,
						{
							"attached_to_doctype": self.doctype,
							"attached_to_name": self.name,
							"attached_to_field": "answer",
						},
					)

	def trigger_update_notification(self):
		notification = frappe._dict(
			{
				"subject": _("The instructor has left a comment on your assignment {0}").format(
					frappe.bold(self.assignment_title)
				),
				"email_content": self.comments,
				"document_type": self.doctype,
				"document_name": self.name,
				"from_user": self.evaluator,
				"type": "Alert",
				"link": get_lms_route(f"assignment-submission/{self.assignment}/{self.name}"),
			}
		)
		make_notification_logs(notification, [self.member])
