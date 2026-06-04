# Copyright (c) 2021, FOSS United and contributors
# For license information, please see license.txt

import json
import re
from binascii import Error as BinasciiError

import frappe
from frappe import _, safe_decode
from frappe.core.doctype.file.utils import get_random_filename
from frappe.model.document import Document
from frappe.utils import cint, comma_and, cstr
from frappe.utils.file_manager import safe_b64decode
from fuzzywuzzy import fuzz

from lms.lms.doctype.course_lesson.course_lesson import save_progress
from lms.lms.utils import (
	generate_slug,
)


class LMSQuiz(Document):
	def validate(self):
		self.validate_duplicate_questions()
		self.validate_limit()
		self.calculate_total_marks()
		self.validate_open_ended_questions()

	def validate_duplicate_questions(self):
		questions = [row.question for row in self.questions]
		rows = [i + 1 for i, x in enumerate(questions) if x and questions.count(x) > 1]
		if len(rows):
			frappe.throw(_("Rows {0} have the duplicate questions.").format(frappe.bold(comma_and(rows))))

	def validate_limit(self):
		if not self.shuffle_questions and self.limit_questions_to:
			self.limit_questions_to = 0

		if self.limit_questions_to and cint(self.limit_questions_to) >= len(self.questions):
			frappe.throw(_("Limit cannot be greater than or equal to the number of questions in the quiz."))

		if self.limit_questions_to and cint(self.limit_questions_to) < len(self.questions):
			marks = [question.marks for question in self.questions]
			if len(set(marks)) > 1:
				frappe.throw(_("All questions should have the same marks if the limit is set."))

	def calculate_total_marks(self):
		if len(self.questions) == 0:
			self.total_marks = 0
			self.passing_percentage = 100
			return

		if self.limit_questions_to:
			self.total_marks = sum(
				question.marks for question in self.questions[: cint(self.limit_questions_to)]
			)
		else:
			self.total_marks = sum(cint(question.marks) for question in self.questions)

	def validate_open_ended_questions(self):
		types = [question.type for question in self.questions]
		types = set(types)

		if "Open Ended" in types:
			if len(types) > 1:
				pass
			else:
				self.show_answers = 0

	def autoname(self):
		if not self.name:
			self.name = generate_slug(self.title, "LMS Quiz")

	def get_last_submission_details(self):
		"""Returns the latest submission for this user."""
		user = frappe.session.user
		if not user or user == "Guest":
			return

		result = frappe.get_all(
			"LMS Quiz Submission",
			fields="*",
			filters={"owner": user, "quiz": self.name},
			order_by="creation desc",
			page_length=1,
		)

		if result:
			return result[0]




def set_total_marks(questions):
	marks = 0
	for question in questions:
		marks += question.get("marks")
	return marks


@frappe.whitelist()
def quiz_summary(quiz, results):
	results = results and json.loads(results)
	percentage = 0

	quiz_details = frappe.db.get_value(
		"LMS Quiz",
		quiz,
		[
			"name",
			"total_marks",
			"passing_percentage",
			"lesson",
			"course",
			"enable_negative_marking",
			"marks_to_cut",
		],
		as_dict=1,
	)

	data = process_results(results, quiz_details)
	results = data["results"]
	score = data["score"]
	is_open_ended = data["is_open_ended"]

	score_out_of = quiz_details.total_marks
	percentage = (score / score_out_of) * 100 if score_out_of else 0
	submission = create_submission(quiz, results, score_out_of, quiz_details.passing_percentage)

	save_progress_after_quiz(quiz_details, percentage)

	return {
		"score": score,
		"score_out_of": score_out_of,
		"submission": submission.name,
		"pass": percentage == quiz_details.passing_percentage,
		"percentage": percentage,
		"is_open_ended": is_open_ended,
	}


def process_results(results, quiz_details):
	score = 0
	is_open_ended = False

	for result in results:
		question_details = frappe.db.get_value(
			"LMS Quiz Question",
			{"parent": quiz_details.name, "question": result["question_name"]},
			["question", "marks", "question_detail", "type"],
			as_dict=1,
		)

		result["question_name"] = question_details.question
		result["question"] = question_details.question_detail
		result["marks_out_of"] = question_details.marks

		if question_details.type != "Open Ended":
			if len(result["is_correct"]) > 0:
				correct = result["is_correct"][0]
				for point in result["is_correct"]:
					correct = correct and point
				result["is_correct"] = correct
			else:
				result["is_correct"] = 0

			if correct:
				marks = question_details.marks
			else:
				marks = -quiz_details.marks_to_cut if quiz_details.enable_negative_marking else 0

			result["marks"] = marks
			score += marks

		else:
			is_open_ended = True
			result["is_correct"] = 0
			result["answer"] = re.sub(
				r'<img[^>]*src\s*=\s*["\'](?=data:)(.*?)["\']', _save_file, result["answer"]
			)

	return {
		"results": results,
		"score": score,
		"is_open_ended": is_open_ended,
	}


def _save_file(match):
	data = match.group(1).split("data:")[1]
	headers, content = data.split(",")
	mtype = headers.split(";", 1)[0]

	if isinstance(content, str):
		content = content.encode("utf-8")
	if b"," in content:
		content = content.split(b",")[1]

	try:
		content = safe_b64decode(content)
	except BinasciiError:
		frappe.flags.has_dataurl = True
		return f'<img src="#broken-image" alt="{get_corrupted_image_msg()}"'

	if "filename=" in headers:
		filename = headers.split("filename=")[-1]
		filename = safe_decode(filename).split(";", 1)[0]

	else:
		filename = get_random_filename(content_type=mtype)

	_file = frappe.get_doc(
		{
			"doctype": "File",
			"file_name": filename,
			"content": content,
			"decode": False,
			"is_private": False,
		}
	)
	_file.save(ignore_permissions=True)
	file_url = _file.unique_url
	frappe.flags.has_dataurl = True

	return f'<img src="{file_url}"'


def get_corrupted_image_msg():
	return _("Image: Corrupted Data Stream")


def create_submission(quiz, results, score_out_of, passing_percentage):
	submission = frappe.new_doc("LMS Quiz Submission")
	# Score and percentage are calculated by the controller function
	submission.update(
		{
			"doctype": "LMS Quiz Submission",
			"quiz": quiz,
			"result": results,
			"score": 0,
			"score_out_of": score_out_of,
			"member": frappe.session.user,
			"percentage": 0,
			"passing_percentage": passing_percentage,
		}
	)
	submission.save(ignore_permissions=True)
	return submission


def save_progress_after_quiz(quiz_details, percentage):
	if percentage >= quiz_details.passing_percentage and quiz_details.lesson and quiz_details.course:
		save_progress(quiz_details.lesson, quiz_details.course)
	elif not quiz_details.passing_percentage:
		save_progress(quiz_details.lesson, quiz_details.course)


@frappe.whitelist()
def check_answer(question, type, answers):
	answers = json.loads(answers)
	if type == "Choices":
		return check_choice_answers(question, answers)
	else:
		return check_input_answers(question, answers[0])


def check_choice_answers(question, answers):
	fields = ["multiple"]
	is_correct = []
	for num in range(1, 5):
		fields.append(f"option_{cstr(num)}")
		fields.append(f"is_correct_{cstr(num)}")

	question_details = frappe.db.get_value("LMS Question", question, fields, as_dict=1)

	for num in range(1, 5):
		if question_details[f"option_{num}"] in answers:
			is_correct.append(question_details[f"is_correct_{num}"])
		elif question_details[f"is_correct_{num}"]:
			is_correct.append(2)
		else:
			is_correct.append(0)

	return is_correct


def check_input_answers(question, answer):
	fields = []
	for num in range(1, 5):
		fields.append(f"possibility_{cstr(num)}")

	question_details = frappe.db.get_value("LMS Question", question, fields, as_dict=1)
	for num in range(1, 5):
		current_possibility = question_details[f"possibility_{num}"]
		if current_possibility and fuzz.token_sort_ratio(current_possibility, answer) > 85:
			return 1

	return 0


@frappe.whitelist()
def import_questions_from_file(quiz_name, file_url):
	"""Import questions from an Excel/CSV file into a quiz.

	Flow (mirrors the UI's Question.vue modal):
	  1. Parse file → row dicts
	  2. For each row: create an LMS Question doc (master)
	  3. Insert an LMS Quiz Question child row linking to it
	  4. Reload the quiz to recalculate totals
	"""
	frappe.has_permission("LMS Quiz", "write", throw=True)
	logger = frappe.logger("quiz_import")

	# --- 1. Locate the uploaded file ---
	try:
		file_doc = frappe.get_doc("File", {"file_url": file_url})
	except frappe.DoesNotExistError:
		frappe.throw(_("File not found"))

	# --- 2. Read the spreadsheet data ---
	if file_url.endswith('.xlsx'):
		from frappe.utils.xlsxutils import read_xlsx_file_from_attached_file
		data = read_xlsx_file_from_attached_file(file_id=file_doc.name)
	elif file_url.endswith('.csv'):
		from frappe.utils.csvutils import read_csv_content
		data = read_csv_content(file_doc.get_content())
	else:
		frappe.throw(_("Invalid file format. Please upload CSV or XLSX format."))

	if len(data) <= 1:
		frappe.throw(_("The uploaded file does not contain any question data."))

	# --- 3. Normalize headers ---
	raw_headers = data[0]
	headers = []
	for h in raw_headers:
		if h:
			# Strip BOM (\ufeff), zero-width spaces, and other invisible chars
			cleaned = str(h).strip().strip('\ufeff\u200b\u200c\u200d\ufffe')
			headers.append(cleaned.lower().strip().replace(" ", "_"))
		else:
			headers.append(None)

	logger.info(f"Import headers: {headers}")

	# --- 4. Process each row ---
	imported_count = 0
	errors = []

	for row_idx, row in enumerate(data[1:], start=2):
		if not row:
			continue

		# Build row dict, skipping None headers
		row_dict = {}
		for i, header in enumerate(headers):
			if header and i < len(row) and row[i] is not None:
				val = row[i]
				# Strip string values
				if isinstance(val, str):
					val = val.strip()
				if val != "" and val is not None:
					row_dict[header] = val

		# Skip empty rows
		question_text = row_dict.get("question", "")
		if not question_text:
			continue

		logger.info(f"Row {row_idx}: {row_dict}")

		try:
			# --- 4a. Create LMS Question (master doc) ---
			question_doc = frappe.new_doc("LMS Question")
			question_doc.question = str(question_text)

			# Determine type (with fuzzy matching for Vietnamese Excel)
			raw_type = str(row_dict.get("type", "Choices")).strip()
			type_map = {
				"choices": "Choices",
				"user input": "User Input",
				"user_input": "User Input",
				"userinput": "User Input",
				"open ended": "Open Ended",
				"open_ended": "Open Ended",
				"openended": "Open Ended",
			}
			question_doc.type = type_map.get(raw_type.lower(), raw_type)

			# Validate type is one of the allowed values
			if question_doc.type not in ("Choices", "User Input", "Open Ended"):
				question_doc.type = "Choices"

			# Map option/possibility fields
			for n in range(1, 5):
				# Options (for Choices type)
				opt_val = row_dict.get(f"option_{n}") or row_dict.get(f"option{n}")
				if opt_val:
					question_doc.set(f"option_{n}", str(opt_val))

				# Is correct flags
				ic_val = row_dict.get(f"is_correct_{n}") or row_dict.get(f"is_correct{n}")
				if ic_val is not None:
					question_doc.set(f"is_correct_{n}", cint(ic_val))

				# Explanations
				exp_val = row_dict.get(f"explanation_{n}") or row_dict.get(f"explanation{n}")
				if exp_val:
					question_doc.set(f"explanation_{n}", str(exp_val))

				# Possibilities (for User Input type)
				poss_val = row_dict.get(f"possibility_{n}") or row_dict.get(f"possibility{n}")
				if poss_val:
					question_doc.set(f"possibility_{n}", str(poss_val))

			# Scoring rubric (if present)
			scoring_rubric = row_dict.get("scoring_rubric") or row_dict.get("scoring_notes")
			# (stored only for reference, not a native field)

			question_doc.save(ignore_permissions=True)
			logger.info(f"Row {row_idx}: Created LMS Question '{question_doc.name}' type={question_doc.type}")

			# --- 4b. Insert LMS Quiz Question child row ---
			# This mirrors Question.vue's addQuestionRow() which uses frappe.client.insert
			marks = cint(row_dict.get("marks", 1)) or 1
			child_doc = frappe.get_doc({
				"doctype": "LMS Quiz Question",
				"parent": quiz_name,
				"parentfield": "questions",
				"parenttype": "LMS Quiz",
				"question": question_doc.name,
				"marks": marks,
			})
			child_doc.insert(ignore_permissions=True)
			logger.info(f"Row {row_idx}: Inserted Quiz Question child '{child_doc.name}'")

			imported_count += 1

		except Exception as e:
			logger.error(f"Row {row_idx}: Error — {str(e)}")
			errors.append(f"Row {row_idx}: {str(e)}")
			continue

	frappe.db.commit()

	# Clean up the temporary uploaded file
	try:
		frappe.delete_doc("File", file_doc.name, ignore_permissions=True)
	except Exception:
		pass

	if errors:
		logger.warning(f"Import completed with {len(errors)} errors: {errors}")

	return imported_count
