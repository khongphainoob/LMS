import frappe


def execute():
	frappe.db.sql(
		"CREATE UNIQUE INDEX IF NOT EXISTS idx_lms_game_progress_unique ON `tabLMS Game Progress` (class_game, member)"
	)
	frappe.db.sql(
		"CREATE UNIQUE INDEX IF NOT EXISTS idx_lms_assessment_assignment_unique ON `tabLMS Assessment Assignment` (quiz, batch)"
	)
	frappe.db.sql(
		"CREATE INDEX IF NOT EXISTS idx_lms_game_session_class_member ON `tabLMS Game Session` (class_game, member)"
	)
	frappe.db.sql(
		"CREATE INDEX IF NOT EXISTS idx_lms_game_session_member_completed ON `tabLMS Game Session` (member, completed_at)"
	)
	frappe.db.sql(
		"CREATE INDEX IF NOT EXISTS idx_lms_question_bank_search ON `tabLMS Gamification Question Bank` (question_type, category, difficulty)"
	)
