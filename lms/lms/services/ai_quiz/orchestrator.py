import frappe
import json
from lms.lms.agents.provider import get_llm, extract_usage
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
        llm, model_name, cost_info = get_llm("quiz_generator")
        
        # In langchain with_structured_output we might lose raw usage. We will try to extract it from response if possible
        # However, to track tokens, we can use a token counter callback if needed. But for simple tracking,
        # we can just invoke it and if `extract_usage` fails, it returns 0.
        structured_llm = llm.with_structured_output(QuizSchema)
        # Note: with_structured_output might not return metadata. 
        # We will use the raw LLM for tracking if possible, or just accept 0 for now.
        response = structured_llm.invoke([
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
        
        # Try to extract usage if response happens to have it (rare for with_structured_output)
        usage_stats = extract_usage(response)
        cost_in = cost_info.get("cost_input", 0) or 0
        cost_out = cost_info.get("cost_output", 0) or 0
        cost = (usage_stats.get("input_tokens", 0) / 1000000) * cost_in + (usage_stats.get("output_tokens", 0) / 1000000) * cost_out
        
        quiz_doc.tokens_used = usage_stats.get("total_tokens", 0)
        quiz_doc.input_tokens = usage_stats.get("input_tokens", 0)
        quiz_doc.output_tokens = usage_stats.get("output_tokens", 0)
        quiz_doc.total_cost_usd = cost
        
        quiz_doc.save(ignore_permissions=True)
        frappe.db.commit()

        # Notify creator: Quiz generated successfully
        try:
            from lms.lms.services.hitl.notification import notify_user_direct
            from lms.lms.utils import get_lms_route
            notify_user_direct(
                for_user=quiz_doc.owner,
                subject=f"✅ Quiz tạo xong: {quiz_doc.title}",
                email_content=(
                    f"Quiz <b>{quiz_doc.title}</b> đã được AI sinh thành công.<br>"
                    f"Tổng số câu hỏi: <b>{quiz_doc.total_questions}</b>."
                ),
                document_type="AI Quiz",
                document_name=quiz_id,
                link=get_lms_route("ai-quiz"),
            )
        except Exception:
            pass

    except Exception as e:
        frappe.log_error(f"Quiz Generation Failed: {str(e)}", "AI Quiz Orchestrator")
        if frappe.db.exists("AI Quiz", quiz_id):
            frappe.db.set_value("AI Quiz", quiz_id, "status", "Failed")
            frappe.db.commit()

        # Notify creator: Quiz generation failed
        try:
            from lms.lms.services.hitl.notification import notify_user_direct
            from lms.lms.utils import get_lms_route
            owner = frappe.db.get_value("AI Quiz", quiz_id, "owner")
            if owner:
                notify_user_direct(
                    for_user=owner,
                    subject=f"❌ Quiz sinh thất bại",
                    email_content=(
                        f"Quiz <b>{quiz_id}</b> bị lỗi khi sinh AI.<br>"
                        f"<b>Lỗi:</b> {str(e)}"
                    ),
                    document_type="AI Quiz",
                    document_name=quiz_id,
                    link=get_lms_route("ai-quiz"),
                )
        except Exception:
            pass
