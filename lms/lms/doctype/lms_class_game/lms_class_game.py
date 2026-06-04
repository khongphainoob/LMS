# Copyright (c) 2026, Frappe and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class LMSClassGame(Document):
	def validate(self):
		if self.is_new():
			count = frappe.db.count("LMS Class Game", {"owner": frappe.session.user})
			if count >= 20:
				frappe.throw(_("You can only assign a maximum of 20 games. Please delete some to assign new ones."))
