import logging
from lms.lms.agents.provider import get_llm, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState
from lms.lms.agents.lesson_planner.prompts.system import WRITER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

def writer_node(state: LessonPlanState) -> dict:
    """
    Writer Node.
    Writes the full lesson plan markdown based on the outline.
    """
    llm, model_name, cost_info = get_llm("lesson_planner")
    
    topic = state.get("topic")
    subject = state.get("subject")
    grade_level = state.get("grade_level")
    duration = state.get("duration_minutes") or 45
    lesson_outline = state.get("lesson_outline") or {}
    review_feedback = state.get("review_feedback") or ""
    
    human_prompt = f"""Hãy viết giáo án chi tiết bằng Markdown.
Chủ đề: {topic}
Môn: {subject}
Khối/lớp: {grade_level}
Thời lượng: {duration} phút

KHUNG GIÁO ÁN:
{lesson_outline}

PHẢN HỒI YÊU CẦU CHỈNH SỬA TỪ GIÁO VIÊN (NẾU CÓ):
{review_feedback}
"""

    try:
        response = llm.invoke([
            {"role": "system", "content": WRITER_SYSTEM_PROMPT},
            {"role": "user", "content": human_prompt}
        ])
        
        usage_stats = extract_usage(response)
        cost_in = cost_info.get("cost_input", 0) or 0
        cost_out = cost_info.get("cost_output", 0) or 0
        cost = (usage_stats.get("input_tokens", 0) / 1000000) * cost_in + (usage_stats.get("output_tokens", 0) / 1000000) * cost_out
        
        return {
            "lesson_content": response.content,
            "status": "Writing",
            "tokens_used": state.get("tokens_used", 0) + usage_stats.get("total_tokens", 0),
            "input_tokens": state.get("input_tokens", 0) + usage_stats.get("input_tokens", 0),
            "output_tokens": state.get("output_tokens", 0) + usage_stats.get("output_tokens", 0),
            "total_cost_usd": state.get("total_cost_usd", 0.0) + cost
        }
        
    except Exception as e:
        logger.error(f"Writer Node failed: {e}", exc_info=True)
        # Safe fallback text
        return {
            "lesson_content": f"# Lỗi sinh giáo án\nKhông thể tạo giáo án: {e}",
            "status": "Writing",
            "error": str(e)
        }