# Copyright (c) 2026, TOMOSA and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class LMSRubricTemplate(Document):
    def validate(self):
        self.validate_max_score()
        self.validate_total_weight()

    def validate_max_score(self):
        """Ensure criteria max_scores sum to template max_score if weighted properly 
        Or warn if they don't match up. Actually, typically if it's weighted, 
        each criterion score contributes to the max_score based on the weight.
        Here we just validate that total criteria > 0"""
        if not self.criteria:
            frappe.throw("A rubric must have at least one criterion.")

    def validate_total_weight(self):
        """Ensure all criteria weights sum to 1.0 (100%) or if uniform, they are all 1"""
        pass # Optional: Add strict validation if needed

    def to_prompt_format(self):
        """Convert rubric to structured text for AI prompt"""
        prompt_lines = [f"Rubric: {self.title} (Max Score: {self.max_score})"]
        if self.description:
            prompt_lines.append(f"Description: {self.description}")
        
        prompt_lines.append("\nCriteria:")
        for idx, crit in enumerate(self.criteria, start=1):
            prompt_lines.append(f"\n{idx}. {crit.criterion_name} (Max: {crit.max_score}, Weight: {crit.weight})")
            if crit.description:
                prompt_lines.append(f"   Description: {crit.description}")
            
            prompt_lines.append("   Levels:")
            if crit.level_excellent:
                prompt_lines.append(f"     - Xuất sắc: {crit.level_excellent}")
            if crit.level_good:
                prompt_lines.append(f"     - Giỏi: {crit.level_good}")
            if crit.level_adequate:
                prompt_lines.append(f"     - Đạt: {crit.level_adequate}")
            if crit.level_poor:
                prompt_lines.append(f"     - Chưa đạt: {crit.level_poor}")
                
        return "\n".join(prompt_lines)
