import frappe
from frappe.model.document import Document
from frappe.utils import now

class AIGradingSubmission(Document):
	def on_update(self):
		# If teacher overrides the score, resolve the HITL alert and mark as Done
		if self.teacher_override_score is not None and self.status == "Flagged":
			self.status = "Done"
			# Find any open HITL Alert and resolve it
			alerts = frappe.get_all("HITL Alert", filters={
				"reference_doctype": "AI Grading Submission",
				"reference_name": self.name,
				"status": "Open"
			})
			for alert in alerts:
				doc = frappe.get_doc("HITL Alert", alert.name)
				doc.status = "Resolved"
				doc.resolved_at = now()
				doc.resolution_note = "Resolved via teacher override"
				doc.save(ignore_permissions=True)
			# Need to save without triggering on_update again
			self.db_set("status", "Done")

		if self.status == "Done":
			self.sync_score_to_lms()

	def sync_score_to_lms(self):
		if getattr(self, "lms_quiz_submission", None):
			try:
				quiz_sub = frappe.get_doc("LMS Quiz Submission", self.lms_quiz_submission)
				if quiz_sub.score != self.score:
					quiz_sub.score = self.score
					if quiz_sub.score_out_of:
						quiz_sub.percentage = int((self.score / quiz_sub.score_out_of) * 100)
					quiz_sub.save(ignore_permissions=True)
			except Exception:
				frappe.log_error(title="AI Grading: Sync to Quiz Submission failed", message=frappe.get_traceback())

		if getattr(self, "lms_assignment_submission", None):
			try:
				assign_sub = frappe.get_doc("LMS Assignment Submission", self.lms_assignment_submission)
				if assign_sub.numeric_score != self.score or assign_sub.status != "Evaluated":
					assign_sub.numeric_score = self.score
					assign_sub.status = "Evaluated"
					
					feedback_text = ""
					if self.ai_feedback:
						try:
							import json
							fb = json.loads(self.ai_feedback)
							feedback_text = fb.get("overall_feedback") or fb.get("summary") or ""
						except Exception:
							pass
					if getattr(self, "teacher_feedback", None):
						feedback_text = self.teacher_feedback
					
					if feedback_text:
						assign_sub.comments = feedback_text
						
					assign_sub.save(ignore_permissions=True)
			except Exception:
				frappe.log_error(title="AI Grading: Sync to Assignment Submission failed", message=frappe.get_traceback())

	def on_trash(self):
		# Clean up any linked HITL Alerts before deleting this document
		alerts = frappe.get_all("HITL Alert", filters={
			"reference_doctype": "AI Grading Submission",
			"reference_name": self.name
		})
		for alert in alerts:
			frappe.delete_doc("HITL Alert", alert.name, ignore_permissions=True, force=True)
