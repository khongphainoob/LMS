import json
import logging
from lms.lms.agents.provider import get_llm, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState
from lms.lms.agents.lesson_planner.prompts.system import ASSESSMENT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

def assessment_node(state: LessonPlanState) -> dict:
    """
    Assessment Designer Node.
    Generates educational quiz/exam assessment items based on the lesson content.
    """
    llm, model_name, cost_info = get_llm("lesson_planner", temperature=0.4, max_tokens=8192)

    content = state.get("lesson_content") or ""
    topic = state.get("topic")
    standards = state.get("curriculum_standards") or []
    teacher_id = state.get("teacher")
    plan_doc_name = state.get("plan_doc_name")
    
    try:
        if plan_doc_name:
            frappe.db.set_value("AI Lesson Plan", plan_doc_name, "status", "Assessing")
            frappe.db.commit()
    except Exception:
        pass

    human_prompt = f"""Hãy thiết kế bộ câu hỏi đánh giá/kiểm tra 3-5 câu dựa trên giáo án chi tiết sau:
GIÁO ÁN CHI TIẾT:
---
{content[:8000]}
---

CHỦ ĐỀ: {topic}
CHUẨN KT-KN ĐÃ MATCH: {", ".join(standards)}

Sinh bộ câu hỏi kiểm tra dạng JSON ngay lập tức."""

    try:
        response = llm.invoke([
            {"role": "system", "content": ASSESSMENT_SYSTEM_PROMPT},
            {"role": "user", "content": human_prompt}
        ])
        
        parsed_json = json.loads(response.content.strip().replace("```json", "").replace("```", ""))
        questions = parsed_json if isinstance(parsed_json, list) else parsed_json.get("questions", [])
        
        # Build enriched content
        markdown_enrichment = "\n\n## 📝 CÂU HỎI ĐÁNH GIÁ (TRẮC NGHIỆM)\n\n"
        for i, q in enumerate(questions, 1):
            markdown_enrichment += f"**Câu {i}: {q.get('question_text')}**\n"
            for opt in q.get('options', []):
                mark = "[x]" if opt.get('is_correct') else "[ ]"
                markdown_enrichment += f"- {mark} {opt.get('text')}\n"
            markdown_enrichment += f"*Giải thích: {q.get('explanation')}*\n\n"
        
        usage_stats = extract_usage(response)
        cost_in = cost_info.get("cost_input", 0) or 0
        cost_out = cost_info.get("cost_output", 0) or 0
        cost = (usage_stats.get("input_tokens", 0) / 1000000) * cost_in + (usage_stats.get("output_tokens", 0) / 1000000) * cost_out
        
        return {
            "assessment_items": questions,
            "lesson_content": content + markdown_enrichment,
            "status": "Assessing",
            "tokens_used": state.get("tokens_used", 0) + usage_stats.get("total_tokens", 0),
            "input_tokens": state.get("input_tokens", 0) + usage_stats.get("input_tokens", 0),
            "output_tokens": state.get("output_tokens", 0) + usage_stats.get("output_tokens", 0),
            "total_cost_usd": state.get("total_cost_usd", 0.0) + cost
        }
        
    except Exception as e:
        logger.error(f"Assessment Node failed: {e}", exc_info=True)
        # Fallback question set
        fallback_questions = [
            {
                "type": "mcq",
                "question_text": f"Câu hỏi 1: Đâu là nội dung cốt lõi của chủ đề {topic}?",
                "points": 2,
                "options": [
                    {"text": "Đáp án A - Khái niệm chuẩn", "is_correct": True},
                    {"text": "Đáp án B - Khái niệm sai lệch", "is_correct": False},
                    {"text": "Đáp án C - Không liên quan", "is_correct": False},
                    {"text": "Đáp án D - Ý kiến khác", "is_correct": False}
                ],
                "explanation": "Khái niệm chính xác được trình bày chi tiết trong giáo trình."
            }
        ]
        return {
            "assessment_items": fallback_questions,
            "status": "Assessing",
            "error": f"Assessment failed, fallback questions used: {str(e)}"
        }
