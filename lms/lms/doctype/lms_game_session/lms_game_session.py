# Copyright (c) 2026, TOMOSA and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class LMSGameSession(Document):
	def validate(self):
		if self.score is None:
			self.score = 0
		if self.max_score is None:
			self.max_score = 0
		if self.max_score:
			self.percentage = round((self.score / self.max_score) * 100, 1)
		else:
			self.percentage = 0
		if not self.result:
			self.result = "Completed"
