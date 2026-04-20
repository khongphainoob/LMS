# Copyright (c) 2026, TOMOSA and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class LMSGradebookSettings(Document):
    def validate(self):
        self.validate_category_weights()
    
    def validate_category_weights(self):
        """Ensure category weights sum up logically based on grading_method"""
        if self.grading_method == "Weighted" and self.categories:
            total_weight = sum(flt(cat.weight) for cat in self.categories)
            # In Frappe we can warn or throw. Usually weight sums to 100
            if total_weight > 100:
                frappe.throw("Total weight of categories cannot exceed 100%")
            if total_weight < 100:
                frappe.msgprint("Warning: Total weight of categories is less than 100%")
        
    def calculate_final_grade(self, student):
        """Mock method for calculation - will be expanded in Phase 4 / Phase 2 logic module"""
        pass
        
    def get_grade_summary(self, student):
        """Return a dict summarizing grade per category"""
        pass
        
def flt(value):
    return float(value) if value else 0.0
