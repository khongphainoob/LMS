# -*- coding: utf-8 -*-
import frappe
from frappe import _
from frappe.model.document import Document

class LMSDocument(Document):
	def validate(self):
		if self.scope == "Course" and not self.course:
			frappe.throw(_("Vui lòng chọn khóa học cho tài liệu này."))
		self._update_file_metadata()

	def _update_file_metadata(self):
		if self.file:
			file_name = self.file.split("/")[-1]
			file_doc = frappe.db.get_value("File", {"file_url": self.file}, ["file_type", "file_size"], as_dict=True)
			if file_doc:
				self.file_type = file_doc.file_type or ""
				self.file_size = file_doc.file_size or 0