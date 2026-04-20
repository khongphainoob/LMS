import frappe
from frappe.model.document import Document


class AIGradingSubmission(Document):
	def on_update(self):
		self.log_grade_history()

	def log_grade_history(self):
		if self.is_new():
			return
		
		doc_before_save = self.get_doc_before_save()
		if not doc_before_save:
			return
			
		changed = False
		event_type = "Score Modified"
		
		score_before = float(getattr(doc_before_save, "score", 0) or 0)
		score_after = float(getattr(self, "score", 0) or 0)
		
		if score_before != score_after:
			changed = True
		elif doc_before_save.ai_feedback != self.ai_feedback:
			changed = True
			event_type = "Feedback Added"
		elif doc_before_save.status != self.status:
			changed = True
			event_type = "Status Changed"
			
		if changed:
			try:
				session_data = frappe.get_doc("AI Grading Session", self.session) if self.session else None
				course = getattr(session_data, "course", None) if session_data else None
				
				# Get max score from rubric template if available
				max_score = 10.0
				if session_data and getattr(session_data, "rubric_template", None):
					max_score = frappe.db.get_value("LMS Rubric Template", session_data.rubric_template, "max_score") or 10.0
					
				source = "AI+Teacher Review" if getattr(self, "teacher_feedback", None) else "AI"
				
				frappe.get_doc({
					"doctype": "LMS Grade History Log",
					"student": getattr(self, "student", None),
					"course": course,
					"grader": frappe.session.user,
					"grading_source": source,
					"event_type": event_type,
					"submission_type": "AI Grading Submission",
					"submission_id": self.name,
					"score_before": getattr(doc_before_save, "score", 0) or 0.0,
					"score_after": getattr(self, "score", 0) or 0.0,
					"max_score": float(max_score),
					"feedback_text": getattr(self, "teacher_feedback", ""),
					"criteria_snapshot": getattr(self, "criteria_scores", ""),
					"ai_raw_response": getattr(self, "ai_feedback", ""),
					"ai_confidence": getattr(self, "ai_confidence", 0) or 0.0
				}).insert(ignore_permissions=True)
			except Exception as e:
				frappe.log_error(title="Error logging AI grade history", message=str(e))
