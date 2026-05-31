import json
import logging
import frappe
from lms.lms.agents.provider import get_llm, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState
from lms.lms.agents.lesson_planner.prompts.system import PLANNER_SYSTEM_PROMPT
from lms.lms.agents.utils.json_utils import extract_and_validate

logger = logging.getLogger(__name__)

def planner_node(state: LessonPlanState) -> dict:
    """
    Planner Node.
    Creates a high-level lesson outline in structured JSON format.
    """
    # Get standard LLM (Gemini or similar)
    llm, model_name, cost_info = get_llm("lesson_planner")

    topic = state.get("topic")
    subject = state.get("subject")
    grade_level = state.get("grade_level")
    duration = state.get("duration_minutes") or 45
    retrieved = state.get("retrieved_curriculum") or ""
    custom_requirements = state.get("custom_requirements") or "None"

    human_prompt = f"""Hãy lập khung giáo án theo thông tin sau:
- Môn học: {subject}
- Khối/lớp: {grade_level}
- Thời lượng: {duration} phút
- Chủ đề: {topic}
- Yêu cầu riêng biệt: {custom_requirements}

### CHUẨN KIẾN THỨC KỸ NĂNG VÀ NGỮ CẢNH RAG:
---
{retrieved[:10000]}
---

Tạo khung giáo án JSON ngay lập tức."""

    try:
        response = llm.invoke([
            {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
            {"role": "user", "content": human_prompt}
        ])
        
        parsed_json = extract_and_validate(response.content)
        
        usage_stats = extract_usage(response)
        cost = usage_stats.get("total_tokens", 0) * cost_info.get("cost_per_1k_tokens", 0) / 1000

        return {
            "lesson_outline": parsed_json,
            "status": "Planning",
            "tokens_used": state.get("tokens_used", 0) + usage_stats.get("total_tokens", 0),
            "input_tokens": state.get("input_tokens", 0) + usage_stats.get("input_tokens", 0),
            "output_tokens": state.get("output_tokens", 0) + usage_stats.get("output_tokens", 0),
            "total_cost_usd": state.get("total_cost_usd", 0.0) + cost
        }

    except Exception as e:
        logger.error(f"Planner Node failed: {e}", exc_info=True)
        # Safe fallback so the graph doesn't break entirely
        fallback_outline = {
            "title": f"{topic} ({subject} Lớp {grade_level})",
            "objectives": {
                "knowledge": [f"Hiểu rõ khái niệm căn bản về {topic}"],
                "skills": [f"Vận dụng kiến thức {topic} để làm bài tập"],
                "attitude": ["Tích cực thảo luận và phát biểu xây dựng bài"]
            },
            "duration_minutes": duration,
            "standards": state.get("curriculum_standards") or ["GD.GEN.MA-00"],
            "materials": ["SGK", "Phấn/Bảng hoặc máy chiếu"],
            "sections": [
                {"name": "Khởi động (Warm-up)", "duration": 5, "method": "Đặt câu hỏi thảo luận nhanh"},
                {"name": "Hình thành kiến thức mới", "duration": 25, "method": "GV diễn giảng kết hợp sơ đồ trực quan"},
                {"name": "Luyện tập & Thực hành", "duration": 10, "method": "HS làm bài tập nhóm"},
                {"name": "Tổng kết & BTVN", "duration": 5, "method": "GV củng cố kiến thức và giao bài tập"}
            ]
        }
        return {
            "lesson_outline": fallback_outline,
            "status": "Planning",
            "error": f"Planner failed, fallback outline used: {str(e)}"
        }
