# Copyright (c) 2026, Frappe and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class AIExam(Document):
	def before_save(self):
		if self.get("questions"):
			self.total_questions = len(self.questions)
			self.total_score = sum(q.score or 0 for q in self.questions)
		else:
			self.total_questions = 0
			self.total_score = 0
