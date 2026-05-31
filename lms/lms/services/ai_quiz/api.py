import frappe
from lms.lms.agents.quiz.orchestrator import generate_quiz_orchestrator

@frappe.whitelist()
def create_quiz_request(title, bloom_level, language, prompt=None, file_url=None, config=None):
    """
    Creates a new AI Quiz record and enqueues the generation process.
    """
    from lms.lms.services.ai_rate_limit import check_and_record_usage
    check_and_record_usage(frappe.session.user, "Quiz Gen", increment=1)
    
    quiz_doc = frappe.get_doc({
        "doctype": "AI Quiz",
        "title": title,
        "bloom_level": bloom_level,
        "language": language,
        "additional_prompt": prompt,
        "source_file": file_url,
        "config": frappe.as_json(config) if config else None,
        "status": "Pending"
    })
    quiz_doc.insert(ignore_permissions=True)
    frappe.db.commit()

    # Enqueue the AI generation to keep the UI responsive
    frappe.enqueue(
        generate_quiz_orchestrator,
        quiz_id=quiz_doc.name,
        config=config,
        queue="long",
        timeout=600
    )

    return {"name": quiz_doc.name}

@frappe.whitelist()
def get_quiz_stats():
    """
    Returns aggregated stats for the Quiz Dashboard.
    """
    return {
        "total": frappe.db.count("AI Quiz"),
        "completed": frappe.db.count("AI Quiz", {"status": "Completed"}),
        "processing": frappe.db.count("AI Quiz", {"status": "Processing"}),
        "accuracy": "98%"
    }

@frappe.whitelist()
def upload_source_file():
    """
    Hardened custom upload handler with extension and size validation.
    """
    try:
        from lms.lms.services.ai_rate_limit import check_and_record_usage
        check_and_record_usage(frappe.session.user, "Document Upload", increment=1)

        # 1. Get File from Request
        if "file" not in frappe.request.files:
            if not frappe.request.files:
                frappe.throw("No file found in the request.")
            file = list(frappe.request.files.values())[0]
        else:
            file = frappe.request.files["file"]
        
        # 2. Security: Validate Extension
        allowed_extensions = {'.pdf', '.docx', '.txt'}
        file_name = file.filename or "source_document"
        import os
        ext = os.path.splitext(file_name)[1].lower()
        
        if ext not in allowed_extensions:
            frappe.throw(f"Unsupported file type ({ext}). Allowed: PDF, DOCX, TXT.")

        # 3. Security: Validate Size (Max 20MB)
        MAX_SIZE = 20 * 1024 * 1024 # 20MB
        content = file.read()
        if len(content) > MAX_SIZE:
            frappe.throw("File is too large. Maximum size allowed is 20MB.")
        
        if not content:
            frappe.throw("File content is empty.")

        # 4. Save to Frappe
        file_doc = frappe.get_doc({
            "doctype": "File",
            "file_name": file_name,
            "content": content,
            "is_private": 0,
            "folder": "Home/Attachments"
        })
        file_doc.insert(ignore_permissions=True)
        frappe.db.commit()
        
        return {
            "file_url": file_doc.file_url,
            "file_name": file_doc.file_name
        }
    except Exception as e:
        if not isinstance(e, frappe.ValidationError):
            frappe.log_error(frappe.get_traceback(), "Custom Upload Security Error")
        raise e
@frappe.whitelist()
def save_quiz_changes(quiz_id, questions):
    """
    Updates the questions in an AI Quiz record.
    """
    if isinstance(questions, str):
        import json
        questions = json.loads(questions)
        
    quiz_doc = frappe.get_doc("AI Quiz", quiz_id)
    quiz_doc.set("questions", [])
    
    for q in questions:
        quiz_doc.append("questions", {
            "question": q.get("question"),
            "type": q.get("question_type") or q.get("type"), # Handle both naming conventions
            "points": q.get("points") or 1,
            "option_1": q.get("option_1"),
            "option_2": q.get("option_2"),
            "option_3": q.get("option_3"),
            "option_4": q.get("option_4"),
            "is_correct_1": q.get("is_correct_1"),
            "is_correct_2": q.get("is_correct_2"),
            "is_correct_3": q.get("is_correct_3"),
            "is_correct_4": q.get("is_correct_4"),
            "explanation": q.get("explanation"),
            "possibility_1": q.get("possibility_1"),
            "possibility_2": q.get("possibility_2"),
            "sample_answer": q.get("sample_answer"),
            "scoring_rubric": q.get("scoring_rubric")
        })
    
    quiz_doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"status": "success"}

@frappe.whitelist()
def sync_to_lms(quiz_id):
    """
    Syncs an AI Quiz to a real LMS Quiz with LMS Questions.
    """
    ai_quiz = frappe.get_doc("AI Quiz", quiz_id)
    
    if not ai_quiz.questions:
        frappe.throw("Không có câu hỏi nào để đồng bộ.")
        
    # 1. Create LMS Quiz
    lms_quiz = frappe.get_doc({
        "doctype": "LMS Quiz",
        "title": ai_quiz.title,
        "passing_percentage": 50,
        "duration": 30
    })
    lms_quiz.insert(ignore_permissions=True)
    
    from frappe.utils import cint
    
    # 2. Add Questions
    for q in ai_quiz.questions:
        question_doc = frappe.new_doc("LMS Question")
        question_doc.question = str(q.question)
        
        type_map = {
            "choices": "Choices",
            "user input": "User Input",
            "open ended": "Open Ended"
        }
        question_doc.type = type_map.get((q.type or "Choices").lower(), "Choices")
        
        for n in range(1, 5):
            question_doc.set(f"option_{n}", q.get(f"option_{n}"))
            question_doc.set(f"is_correct_{n}", cint(q.get(f"is_correct_{n}")))
            if n == 1:
                question_doc.set(f"explanation_{n}", q.get("explanation"))
            question_doc.set(f"possibility_{n}", q.get(f"possibility_{n}"))
            
        question_doc.save(ignore_permissions=True)
        
        child_doc = frappe.get_doc({
            "doctype": "LMS Quiz Question",
            "parent": lms_quiz.name,
            "parentfield": "questions",
            "parenttype": "LMS Quiz",
            "question": question_doc.name,
            "marks": q.points or 1
        })
        child_doc.insert(ignore_permissions=True)
        
    frappe.db.commit()
    return {"status": "success", "lms_quiz_id": lms_quiz.name}
