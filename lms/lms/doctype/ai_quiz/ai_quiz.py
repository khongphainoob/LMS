import frappe
from frappe.model.document import Document
from frappe import _

class AIQuiz(Document):
	@frappe.whitelist()
	def create_lms_quiz(self, title=None, passing_percentage=80):
		"""
		Converts the AI Quiz (Draft) into an official LMS Quiz.
		This implements the Quiz Approval Workflow (HITL).
		"""
		if not self.questions:
			frappe.throw(_("Cannot create LMS Quiz without any questions."))
			
		lms_quiz = frappe.new_doc("LMS Quiz")
		lms_quiz.title = title or self.title or "Generated Quiz"
		lms_quiz.passing_percentage = passing_percentage
		
		# Transfer questions
		for q in self.questions:
			lms_quiz.append("questions", {
				"question": q.question,
				"type": q.type,
				"points": q.points,
				"option_1": q.option_1,
				"option_2": q.option_2,
				"option_3": q.option_3,
				"option_4": q.option_4,
				"is_correct_1": q.is_correct_1,
				"is_correct_2": q.is_correct_2,
				"is_correct_3": q.is_correct_3,
				"is_correct_4": q.is_correct_4,
				"explanation_1": q.explanation_1,
				"explanation_2": q.explanation_2,
				"explanation_3": q.explanation_3,
				"explanation_4": q.explanation_4,
				"possibility_1": q.possibility_1,
				"possibility_2": q.possibility_2,
				"possibility_3": q.possibility_3,
				"possibility_4": q.possibility_4,
				# LMS Quiz doesn't natively have scoring_rubric and sample_answer, but we map them if they exist
			})
			
		lms_quiz.insert()
		
		# Mark this AI Quiz as Approved
		self.db_set("status", "Completed")
		self.add_comment("Comment", f"✅ Đã phê duyệt và chuyển đổi thành LMS Quiz: {lms_quiz.name}")
		
		return lms_quiz.name

	def on_update(self):
		"""
		Teacher Edit -> AI Learning (HITL)
		Capture edits made by teachers and save them for AI calibration.
		"""
		if self.has_value_changed("questions") and self.status == "Completed":
			# Future implementation: save the diff to a 'Few-Shot Example' DocType for training
			frappe.logger("AI Quiz").info(f"Teacher edited approved quiz {self.name}. Capturing feedback loop.")
