import logging
from lms.lms.agents.provider import get_llm, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState

logger = logging.getLogger(__name__)

ILLUSTRATION_PLANNER_SYSTEM_PROMPT = """Bạn là Đạo diễn Hình ảnh (Illustration Director).
Nhiệm vụ của bạn là đọc giáo án, suy luận (reasoning) và đưa ra bản phác thảo chi tiết (Illustration Plan) về các hình ảnh, sơ đồ, hoặc đồ thị cần vẽ để minh họa tốt nhất cho bài giảng.
Phân tích:
1. Có những khái niệm nào khó hiểu cần trực quan hóa?
2. Có bài toán hình học/đồ thị nào cần vẽ hình chính xác?
3. Sơ đồ tư duy (mindmap) nên tổng hợp những ý nào?

KẾT QUẢ ĐẦU RA:
- Trả về một bản mô tả các hình cần vẽ, ghi rõ loại hình (đồ thị, hình học, sơ đồ, ảnh thực tế) và mô tả chi tiết các thành phần trong hình.
- Bản mô tả này sẽ được giao cho các họa sĩ AI (TikZ, Matplotlib, Mermaid, Image Gen) nên hãy viết sao cho họa sĩ dễ hiểu nhất.
- Trả về trực tiếp bản kế hoạch, KHÔNG bọc trong markdown, KHÔNG dùng ```."""

def illustration_planner_node(state: LessonPlanState) -> dict:
    """
    Illustration Planner Node.
    Reads the lesson content and reasons about what diagrams/images need to be generated.
    """
    llm, model_name, cost_info = get_llm("lesson_planner", temperature=0.4, max_tokens=8192)

    content = state.get("lesson_content") or ""
    topic = state.get("topic") or ""

    if not content:
        return {}

    human_prompt = f"""Hãy đọc giáo án sau và lên kế hoạch vẽ hình minh họa:

CHỦ ĐỀ: {topic}
GIÁO ÁN:
---
{content[:8000]}
---

Dựa trên nội dung này, hãy mô tả chi tiết các hình ảnh/sơ đồ/đồ thị CẦN THIẾT NHẤT để minh họa. Nếu không có hình nào cần thiết, hãy ghi "Không cần hình minh họa"."""

    try:
        response = llm.invoke([
            {"role": "system", "content": ILLUSTRATION_PLANNER_SYSTEM_PROMPT},
            {"role": "user", "content": human_prompt}
        ])
        
        plan_content = response.content.strip()
        
        usage_stats = extract_usage(response)
        cost_in = cost_info.get("cost_input", 0) or 0
        cost_out = cost_info.get("cost_output", 0) or 0
        cost = (usage_stats.get("input_tokens", 0) / 1000000) * cost_in + (usage_stats.get("output_tokens", 0) / 1000000) * cost_out
        
        return {
            "illustration_plan": plan_content,
            "tokens_used": state.get("tokens_used", 0) + usage_stats.get("total_tokens", 0),
            "input_tokens": state.get("input_tokens", 0) + usage_stats.get("input_tokens", 0),
            "output_tokens": state.get("output_tokens", 0) + usage_stats.get("output_tokens", 0),
            "total_cost_usd": state.get("total_cost_usd", 0.0) + cost
        }
        
    except Exception as e:
        logger.error(f"Illustration Planner Agent failed: {e}", exc_info=True)
        return {
            "error": f"Illustration Planner failed: {str(e)}",
            "illustration_plan": "Vẽ sơ đồ tư duy tổng quan bài học."
        }
