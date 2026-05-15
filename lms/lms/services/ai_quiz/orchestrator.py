import frappe
import json
from lms.lms.agents.provider import get_llm
from lms.lms.agents.schemas import QuizSchema

def get_text_from_file(file_path):
    """
    Extracts text from various file types.
    """
    try:
        if file_path.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        # Add support for other formats if libraries are present (PyPDF2, docx)
        # For now, let's try a basic read for text-based files
        return ""
    except Exception:
        return ""

def generate_quiz_orchestrator(quiz_id, config=None):
    """
    Background task to parse source and generate quiz content using AI.
    """
    try:
        quiz_doc = frappe.get_doc("AI Quiz", quiz_id)
        quiz_doc.status = "Processing"
        quiz_doc.save(ignore_permissions=True)
        frappe.db.commit()

        # 1. Extract content from file if exists
        source_content = ""
        if quiz_doc.source_file:
            file_doc = frappe.get_doc("File", {"file_url": quiz_doc.source_file})
            source_content = get_text_from_file(file_doc.get_full_path())
        
        # 2. Build Requirements from Config
        reqs = []
        if config:
            q_types = config.get("questions", {})
            for qtype, settings in q_types.items():
                if settings.get("count", 0) > 0:
                    reqs.append(f"- {settings['count']} {qtype} questions ({settings.get('points', 1)} points each)")
        
        req_text = "\n".join(reqs) if reqs else "Generate a balanced set of questions."

        # Combine with prompt
        system_prompt = f"""You are an expert educator. Generate a high-quality quiz based on the provided content and requirements.
Bloom Level: {quiz_doc.bloom_level}
Language: {quiz_doc.language}

Target Composition:
{req_text}

Output format must be a clean JSON matching the requested schema."""

        user_prompt = f"Requirements/Context: {quiz_doc.additional_prompt or 'General quiz'}\n\n[CONTENT]\n{source_content}"

        # 3. Call AI Agent
        llm = get_llm("quiz_generator")
        response = llm.with_structured_output(QuizSchema).invoke([
            ("system", system_prompt),
            ("user", user_prompt)
        ])

        # 4. Populate questions and options
        for q in response.questions:
            q_row = quiz_doc.append("questions", {
                "question": q.question,
                "question_type": q.question_type,
                "points": q.points,
                "answer": q.answer
            })
            if q.options:
                for opt in q.options:
                    q_row.append("options", {
                        "option": opt.text,
                        "is_correct": opt.is_correct
                    })
        
        quiz_doc.status = "Completed"
        quiz_doc.total_questions = len(response.questions)
        quiz_doc.save(ignore_permissions=True)
        frappe.db.commit()

    except Exception as e:
        frappe.log_error(f"Quiz Generation Failed: {str(e)}", "AI Quiz Orchestrator")
        if frappe.db.exists("AI Quiz", quiz_id):
            frappe.db.set_value("AI Quiz", quiz_id, "status", "Failed")
            frappe.db.commit()
