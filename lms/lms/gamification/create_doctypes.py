import frappe

def create_all():
	frappe.flags.in_import = True # To allow creating custom=0 doctypes if needed
	create_lms_game()
	create_lms_class_game()
	create_lms_game_session()
	create_lms_game_progress()
	create_lms_gamification_question_bank()
	create_lms_assessment_assignment()
	create_lms_game_leaderboard_entry()
	frappe.db.commit()

def make_field(fieldname, fieldtype, label, options=None, reqd=0, in_list_view=0, search_index=0, unique=0):
	return {
		"fieldname": fieldname,
		"fieldtype": fieldtype,
		"label": label,
		"options": options,
		"reqd": reqd,
		"in_list_view": in_list_view,
		"search_index": search_index,
		"unique": unique
	}

def make_perm(role, read=1, write=1, create=1, delete=1, submit=0, cancel=0, ammend=0):
	return {
		"role": role,
		"read": read,
		"write": write,
		"create": create,
		"delete": delete
	}

def create_doctype(name, fields, permissions, autoname="autoincrement"):
	if not frappe.db.exists("DocType", name):
		doc = frappe.get_doc({
			"doctype": "DocType",
			"name": name,
			"module": "LMS",
			"custom": 1,
			"autoname": autoname,
			"fields": fields,
			"permissions": permissions,
			"track_changes": 1
		})
		doc.insert(ignore_permissions=True)
		print(f"Created DocType: {name}")
	else:
		print(f"DocType {name} already exists. Updating fields...")
		doc = frappe.get_doc("DocType", name)
		
		existing_fields = [f.fieldname for f in doc.fields]
		for f in fields:
			if f["fieldname"] not in existing_fields:
				doc.append("fields", f)
		doc.custom = 1
		doc.save(ignore_permissions=True)

def create_lms_game():
	fields = [
		make_field("title", "Data", "Title", reqd=1, in_list_view=1),
		make_field("game_type", "Select", "Game Type", options="memory_match\ntimed_quiz\nspin_wheel\nword_scramble\ndrag_drop", reqd=1, in_list_view=1),
		make_field("delivery_mode", "Select", "Delivery Mode", options="embedded\npopup\nfullscreen", reqd=1),
		make_field("scoring_model", "Select", "Scoring Model", options="best\nsum\navg", reqd=1),
		make_field("max_score", "Int", "Max Score", reqd=1, in_list_view=1),
		make_field("configuration", "JSON", "Configuration"),
		make_field("is_active", "Check", "Is Active", reqd=0, in_list_view=1),
		make_field("version", "Int", "Version")
	]
	perms = [
		make_perm("System Manager"),
		make_perm("Moderator"),
		make_perm("Course Creator", write=0, create=0, delete=0),
		make_perm("LMS Student", write=0, create=0, delete=0)
	]
	create_doctype("LMS Game", fields, perms, autoname="field:title")

def create_lms_class_game():
	fields = [
		make_field("game", "Link", "Game", options="LMS Game", reqd=1, in_list_view=1),
		make_field("batch", "Link", "Batch", options="LMS Batch", reqd=1, in_list_view=1),
		make_field("weight_in_final_grade", "Percent", "Weight in Final Grade"),
		make_field("max_attempts", "Int", "Max Attempts"),
		make_field("available_from", "Datetime", "Available From"),
		make_field("available_until", "Datetime", "Available Until"),
		make_field("settings", "JSON", "Settings")
	]
	perms = [
		make_perm("System Manager"),
		make_perm("Moderator"),
		make_perm("Course Creator"),
		make_perm("LMS Student", write=0, create=0, delete=0)
	]
	create_doctype("LMS Class Game", fields, perms)

def create_lms_game_session():
	fields = [
		make_field("class_game", "Link", "Class Game", options="LMS Class Game", reqd=1, in_list_view=1, search_index=1),
		make_field("member", "Link", "Member", options="User", reqd=1, in_list_view=1, search_index=1),
		make_field("attempt_no", "Int", "Attempt No"),
		make_field("status", "Select", "Status", options="Started\nCompleted\nAbandoned", reqd=1, in_list_view=1),
		make_field("started_at", "Datetime", "Started At"),
		make_field("completed_at", "Datetime", "Completed At", search_index=1),
		make_field("duration_seconds", "Int", "Duration (Seconds)"),
		make_field("raw_score", "Int", "Raw Score", in_list_view=1),
		make_field("normalized_score", "Float", "Normalized Score"),
		make_field("metadata", "JSON", "Metadata")
	]
	perms = [
		make_perm("System Manager"),
		make_perm("Moderator"),
		make_perm("Course Creator", write=0, delete=0),
		make_perm("LMS Student", write=0, create=0, delete=0)
	]
	create_doctype("LMS Game Session", fields, perms)

def create_lms_game_progress():
	fields = [
		make_field("class_game", "Link", "Class Game", options="LMS Class Game", reqd=1, in_list_view=1),
		make_field("member", "Link", "Member", options="User", reqd=1, in_list_view=1),
		make_field("best_score", "Int", "Best Score", in_list_view=1),
		make_field("average_score", "Float", "Average Score"),
		make_field("total_score", "Int", "Total Score"),
		make_field("attempt_count", "Int", "Attempt Count"),
		make_field("progress_percentage", "Float", "Progress Percentage", in_list_view=1),
		make_field("last_session", "Link", "Last Session", options="LMS Game Session")
	]
	perms = [
		make_perm("System Manager"),
		make_perm("Moderator"),
		make_perm("Course Creator", write=0, create=0, delete=0),
		make_perm("LMS Student", write=0, create=0, delete=0)
	]
	create_doctype("LMS Game Progress", fields, perms)
	
def create_lms_gamification_question_bank():
	fields = [
		make_field("question_text", "Small Text", "Question Text", reqd=1, in_list_view=1),
		make_field("question_type", "Select", "Question Type", options="mcq\nword_scramble\nsort_order", reqd=1, in_list_view=1, search_index=1),
		make_field("options", "JSON", "Options"),
		make_field("correct_answer", "Data", "Correct Answer"),
		make_field("hint", "Data", "Hint"),
		make_field("category", "Select", "Category", options="Tech\nScience\nMath\nArt\nGeneral\nHistory\nNature", search_index=1, in_list_view=1),
		make_field("difficulty", "Select", "Difficulty", options="Easy\nMedium\nHard", search_index=1),
		make_field("sort_items", "JSON", "Sort Items")
	]
	perms = [
		make_perm("System Manager"),
		make_perm("Moderator"),
		make_perm("Course Creator")
	]
	create_doctype("LMS Gamification Question Bank", fields, perms)

def create_lms_assessment_assignment():
	fields = [
		make_field("quiz", "Link", "Quiz", options="LMS Quiz", reqd=1, in_list_view=1),
		make_field("batch", "Link", "Batch", options="LMS Batch", reqd=1, in_list_view=1),
		make_field("available_from", "Datetime", "Available From"),
		make_field("available_until", "Datetime", "Available Until"),
		make_field("weight", "Percent", "Weight"),
		make_field("assigned_by", "Link", "Assigned By", options="User")
	]
	perms = [
		make_perm("System Manager"),
		make_perm("Moderator"),
		make_perm("Course Creator"),
		make_perm("LMS Student", write=0, create=0, delete=0)
	]
	create_doctype("LMS Assessment Assignment", fields, perms)

def create_lms_game_leaderboard_entry():
	fields = [
		make_field("batch", "Link", "Batch", options="LMS Batch", search_index=1, in_list_view=1),
		make_field("member", "Link", "Member", options="User", reqd=1, in_list_view=1),
		make_field("composite_score", "Float", "Composite Score", in_list_view=1),
		make_field("rank", "Int", "Rank", search_index=1, in_list_view=1),
		make_field("period", "Select", "Period", options="all_time\nweekly\nmonthly", reqd=1, search_index=1),
		make_field("updated_at", "Datetime", "Updated At")
	]
	perms = [
		make_perm("System Manager"),
		make_perm("Moderator"),
		make_perm("Course Creator", write=0, create=0, delete=0),
		make_perm("LMS Student", write=0, create=0, delete=0)
	]
	create_doctype("LMS Game Leaderboard Entry", fields, perms)
