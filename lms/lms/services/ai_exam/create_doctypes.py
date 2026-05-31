import frappe

def create_doctypes():
    frappe.init(site="lms.localhost")
    frappe.connect()

    # Create AI Exam Question (Child Table)
    if not frappe.db.exists("DocType", "AI Exam Question"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "name": "AI Exam Question",
            "module": "LMS",
            "custom": 1,
            "istable": 1,
            "fields": [
                {"fieldname": "question_number", "fieldtype": "Int", "label": "Question Number", "in_list_view": 1},
                {"fieldname": "question_type", "fieldtype": "Select", "label": "Type", "options": "Multiple Choice\nShort Answer\nEssay", "in_list_view": 1},
                {"fieldname": "question_text", "fieldtype": "Text Editor", "label": "Question Text", "in_list_view": 1},
                {"fieldname": "options", "fieldtype": "Code", "label": "Options (JSON)", "depends_on": "eval:doc.question_type=='Multiple Choice'"},
                {"fieldname": "correct_answer", "fieldtype": "Data", "label": "Correct Answer"},
                {"fieldname": "solution", "fieldtype": "Text Editor", "label": "Solution/Explanation"},
                {"fieldname": "score", "fieldtype": "Float", "label": "Score", "default": "1.0"},
                {"fieldname": "media_assets", "fieldtype": "Code", "label": "Media Assets (Base64)"}
            ]
        })
        doc.insert()
        print("Created AI Exam Question DocType")

    # Create AI Exam Section (Child Table)
    if not frappe.db.exists("DocType", "AI Exam Section"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "name": "AI Exam Section",
            "module": "LMS",
            "custom": 1,
            "istable": 1,
            "fields": [
                {"fieldname": "section_title", "fieldtype": "Data", "label": "Section Title", "in_list_view": 1},
                {"fieldname": "section_instructions", "fieldtype": "Text", "label": "Instructions"},
                {"fieldname": "num_questions", "fieldtype": "Int", "label": "Number of Questions", "in_list_view": 1}
            ]
        })
        doc.insert()
        print("Created AI Exam Section DocType")

    # Create AI Exam
    if not frappe.db.exists("DocType", "AI Exam"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "name": "AI Exam",
            "module": "LMS",
            "custom": 1,
            "autoname": "format:EXAM-{YYYY}-{#####}",
            "fields": [
                {"fieldname": "title", "fieldtype": "Data", "label": "Title", "reqd": 1, "in_list_view": 1},
                {"fieldname": "status", "fieldtype": "Select", "label": "Status", "options": "Draft\nProcessing\nCompleted\nFailed", "default": "Draft", "in_list_view": 1},
                {"fieldname": "subject", "fieldtype": "Data", "label": "Subject", "in_list_view": 1},
                {"fieldname": "grade_level", "fieldtype": "Data", "label": "Grade Level"},
                {"fieldname": "curriculum", "fieldtype": "Data", "label": "Curriculum"},
                {"fieldname": "exam_type", "fieldtype": "Data", "label": "Exam Type"},
                {"fieldname": "duration_minutes", "fieldtype": "Int", "label": "Duration (minutes)", "default": "60"},
                {"fieldname": "difficulty_distribution", "fieldtype": "Code", "label": "Difficulty Distribution"},
                {"fieldname": "language", "fieldtype": "Data", "label": "Language", "default": "vi"},
                {"fieldname": "teacher_instructions", "fieldtype": "Text", "label": "Teacher Instructions"},
                {"fieldname": "source_file", "fieldtype": "Data", "label": "Source File (URL)"},
                {"fieldname": "total_questions", "fieldtype": "Int", "label": "Total Questions", "read_only": 1},
                {"fieldname": "total_score", "fieldtype": "Float", "label": "Total Score", "read_only": 1},
                {"fieldname": "sections", "fieldtype": "Table", "label": "Sections", "options": "AI Exam Section"},
                {"fieldname": "questions", "fieldtype": "Table", "label": "Questions", "options": "AI Exam Question"},
                {"fieldname": "error_log", "fieldtype": "Code", "label": "Error Log", "read_only": 1}
            ]
        })
        doc.insert()
        print("Created AI Exam DocType")
    else:
        print("AI Exam already exists")

    frappe.db.commit()
    frappe.destroy()

if __name__ == "__main__":
    create_doctypes()
