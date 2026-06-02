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
    llm, model_name, cost_info = get_llm("lesson_planner", temperature=0.4)

    topic = state.get("topic")
    subject = state.get("subject")
    grade_level = state.get("grade_level")
    duration_minutes = state.get("duration_minutes") or 45
    reference_content = state.get("retrieved_curriculum") or ""
    custom_requirements = state.get("custom_requirements")
    template_style = state.get("template_style", "international")

    human_prompt = f"""Bạn là một chuyên gia thiết kế giáo án.
Nhiệm vụ của bạn là lập dàn ý chi tiết cho bài giảng dựa trên các thông tin sau.

THÔNG TIN CHUNG:
- Môn học: {subject}
- Lớp: {grade_level}
- Chủ đề: {topic}
- Thời lượng: {duration_minutes} phút
- Yêu cầu đặc biệt: {custom_requirements if custom_requirements else "Không có"}

{f"TÀI LIỆU THAM KHẢO:\n{reference_content[:10000]}\n" if reference_content else ""}"""

    if state.get("custom_format_text"):
        human_prompt += f"""\n\nBẠN PHẢI TUÂN THỦ TUYỆT ĐỐI CẤU TRÚC GIÁO ÁN ĐƯỢC YÊU CẦU DƯỚI ĐÂY:\n--- CẤU TRÚC MẪU ---\n{state.get("custom_format_text")}\n----------------\n"""
    elif template_style == "cv5512":
        human_prompt += """\n\nCấu trúc giáo án bắt buộc phải tuân thủ tuyệt đối chuẩn Công văn 5512/BGDĐT-GDTrH:
I. MỤC TIÊU BÀI DẠY
   1. Kiến thức
   2. Năng lực
   3. Phẩm chất
II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
III. TIẾN TRÌNH DẠY HỌC
   * LƯU Ý QUAN TRỌNG: MỖI hoạt động dưới đây bắt buộc phải có đủ 4 phần: a) Mục tiêu; b) Nội dung; c) Sản phẩm; d) Tổ chức thực hiện.
   1. Hoạt động 1: Khởi động / Xác định vấn đề
   2. Hoạt động 2: Hình thành kiến thức mới / Giải quyết vấn đề
   3. Hoạt động 3: Luyện tập
   4. Hoạt động 4: Vận dụng"""
    else:
        human_prompt += """\n\nCấu trúc giáo án bắt buộc theo chuẩn Quốc tế (5E hoặc Rosenshine):
1. Engage / Khởi động
2. Explore / Khám phá
3. Explain / Giải thích
4. Elaborate / Áp dụng thực hành
5. Evaluate / Đánh giá"""

    human_prompt += "\n\nHãy sinh ra dàn ý dưới dạng JSON, trong đó trả về một object có các key là các phần chính của giáo án, value là mảng các hoạt động chi tiết trong phần đó. CHỈ TRẢ VỀ JSON HỢP LỆ, KHÔNG BỌC TRONG ```json."

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
            "duration_minutes": duration_minutes,
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
