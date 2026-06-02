import logging
import re
from lms.lms.agents.provider import get_llm, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState
from lms.lms.agents.lesson_planner.prompts.system import WRITER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

def writer_node(state: LessonPlanState) -> dict:
    """
    Writer Node.
    Writes the full lesson plan markdown based on the outline.
    """
    llm, model_name, cost_info = get_llm("lesson_planner", temperature=0.4)
    
    topic = state.get("topic")
    subject = state.get("subject")
    grade_level = state.get("grade_level")
    duration = state.get("duration_minutes") or 45
    lesson_outline = state.get("lesson_outline") or {}
    review_feedback = state.get("review_feedback") or ""
    custom_requirements = state.get("custom_requirements") or ""
    
    human_prompt = f"""Hãy viết giáo án chi tiết bằng Markdown.
Chủ đề: {topic}
Môn: {subject}
Khối/lớp: {grade_level}
Thời lượng: {duration} phút

KHUNG GIÁO ÁN:
{lesson_outline}

PHẢN HỒI YÊU CẦU CHỈNH SỬA TỪ GIÁO VIÊN (NẾU CÓ):
{review_feedback}

YÊU CẦU ĐẶC BIỆT TỪ GIÁO VIÊN VỀ ĐỊNH DẠNG/CÁCH TRÌNH BÀY:
{custom_requirements if custom_requirements else "Không có"}
"""

    if state.get("template_style") == "cv5512":
        human_prompt += """
LƯU Ý ĐẶC BIỆT: Đây là giáo án theo chuẩn Công văn 5512 của Bộ GD&ĐT. Bạn phải trình bày với văn phong sư phạm chuyên nghiệp, trang trọng (formal).
TUYỆT ĐỐI KHÔNG gộp toàn bộ bài giảng vào 1 bảng duy nhất. Hãy chia bài giảng thành các Hoạt động (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng).
MỖI hoạt động BẮT BUỘC phải chia rõ 4 mục con:
- **a) Mục tiêu:** Trình bày ngắn gọn bằng gạch đầu dòng.
- **b) Nội dung:** Tóm tắt nhiệm vụ học tập của học sinh.
- **c) Sản phẩm:** Kết quả/sản phẩm cụ thể học sinh cần đạt được.
- **d) Tổ chức thực hiện:** BẮT BUỘC trình bày dưới dạng BẢNG 3 cột: **Bước**, **Hoạt động của Giáo viên**, và **Hoạt động của Học sinh**. Cột "Bước" phải chia làm 4 giai đoạn chuẩn mực: Chuyển giao nhiệm vụ, Thực hiện nhiệm vụ, Báo cáo thảo luận, Kết luận nhận định. Đừng nhồi nhét quá nhiều chữ "thừa thãi", hãy viết súc tích, đi thẳng vào vấn đề trọng tâm.
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
        
        lesson_markdown = re.sub(r"<seg\d*>", "", response.content)
        
        return {
            "lesson_content": lesson_markdown,
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