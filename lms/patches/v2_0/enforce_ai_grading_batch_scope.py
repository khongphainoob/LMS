import frappe


def execute():
	backfill_submission_batch()
	delete_duplicate_submissions()
	add_submission_indexes()


def backfill_submission_batch():
	if not frappe.db.has_column("AI Grading Submission", "batch"):
		return

	rows = frappe.db.sql(
		"""
		SELECT sub.name, sess.batch
		FROM `tabAI Grading Submission` sub
		INNER JOIN `tabAI Grading Session` sess ON sess.name = sub.session
		WHERE IFNULL(sub.batch, '') = ''
			AND IFNULL(sess.batch, '') != ''
		""",
		as_dict=1,
	)

	for row in rows:
		frappe.db.set_value("AI Grading Submission", row.name, "batch", row.batch, update_modified=False)


def delete_duplicate_submissions():
	duplicate_keys = frappe.db.sql(
		"""
		SELECT session, student
		FROM `tabAI Grading Submission`
		WHERE IFNULL(session, '') != ''
			AND IFNULL(student, '') != ''
		GROUP BY session, student
		HAVING COUNT(*) > 1
		""",
		as_dict=1,
	)

	for key in duplicate_keys:
		names = frappe.get_all(
			"AI Grading Submission",
			filters={"session": key.session, "student": key.student},
			fields=["name"],
			order_by="creation asc, name asc",
			pluck="name",
		)
		for duplicate_name in names[1:]:
			frappe.delete_doc("AI Grading Submission", duplicate_name, ignore_permissions=True, force=True)


def add_submission_indexes():
	table_name = "tabAI Grading Submission"

	if not _index_exists(table_name, "uniq_session_student"):
		frappe.db.sql(
			"""
			ALTER TABLE `tabAI Grading Submission`
			ADD UNIQUE KEY `uniq_session_student` (`session`, `student`)
			"""
		)

	if not _index_exists(table_name, "idx_batch_status"):
		frappe.db.sql(
			"""
			ALTER TABLE `tabAI Grading Submission`
			ADD INDEX `idx_batch_status` (`batch`, `status`)
			"""
		)


def _index_exists(table_name, index_name):
	result = frappe.db.sql(
		"""
		SELECT 1
		FROM information_schema.statistics
		WHERE table_schema = %s
			AND table_name = %s
			AND index_name = %s
		LIMIT 1
		""",
		(frappe.conf.db_name, table_name, index_name),
	)
	return bool(result)
