# Copyright (c) 2026, Frappe and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class LMSGame(Document):
	def validate(self):
		if self.is_new():
			count = frappe.db.count("LMS Game", {"owner": frappe.session.user})
			if count >= 20:
				frappe.throw(_("You can only create a maximum of 20 game templates. Please delete some to create new ones."))
