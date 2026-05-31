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
