import logging
from lms.lms.agents.provider import get_llm, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState

logger = logging.getLogger(__name__)

LATEX_REVIEWER_SYSTEM_PROMPT = """Bạn là một chuyên gia về định dạng Toán học trên nền tảng Web (KaTeX/MathJax) và LaTeX.
Nhiệm vụ của bạn là rà soát toàn bộ nội dung giáo án Markdown, phát hiện và sửa toàn bộ các lỗi liên quan đến cú pháp Toán học.
CÁC LỖI THƯỜNG GẶP CẦN SỬA:
- Thiếu dấu $ (ví dụ: viết x^2 thay vì $x^2$).
- Lỗi khoảng trắng làm hỏng KaTeX (ví dụ: $ x^2 $ nên sửa thành $x^2$).
- Lỗi môi trường (không dùng \begin{align} trong markdown trừ khi bọc trong $$, nên thay bằng $$ ... $$).
- Các ký tự đặc biệt chưa escape.
- Đảm bảo các công thức Toán học inline dùng $ $ và block dùng $$ $$.

YÊU CẦU:
- Không thay đổi bất kỳ nội dung văn tự nào, chỉ sửa định dạng và cú pháp.
- Trả về TOÀN BỘ nội dung Markdown đã được sửa chữa, tuyệt đối không cắt bớt nội dung.
- Không bọc kết quả trong ```markdown."""

def latex_reviewer_node(state: LessonPlanState) -> dict:
    """
    LaTeX Reviewer Node.
    Reviews and fixes math/LaTeX formatting errors in the markdown content.
    """
    llm, model_name, cost_info = get_llm("lesson_planner")

    content = state.get("lesson_content") or ""

    if not content:
        return {}

    human_prompt = f"""Hãy rà soát và sửa lỗi định dạng Toán học/LaTeX trong nội dung Markdown sau:

NỘI DUNG MARKDOWN GỐC:
---
{content}
---

Hãy trả về DUY NHẤT nội dung Markdown đã sửa đổi, không thêm bất kỳ bình luận nào."""

    try:
        response = llm.invoke([
            {"role": "system", "content": LATEX_REVIEWER_SYSTEM_PROMPT},
            {"role": "user", "content": human_prompt}
        ])
        
        fixed_content = response.content.strip()
        if fixed_content.startswith("```markdown"):
            fixed_content = fixed_content[11:]
        if fixed_content.startswith("```"):
            fixed_content = fixed_content[3:]
        if fixed_content.endswith("```"):
            fixed_content = fixed_content[:-3]
            
        fixed_content = fixed_content.strip()
        
        usage_stats = extract_usage(response)
        cost_in = cost_info.get("cost_input", 0) or 0
        cost_out = cost_info.get("cost_output", 0) or 0
        cost = (usage_stats.get("input_tokens", 0) / 1000000) * cost_in + (usage_stats.get("output_tokens", 0) / 1000000) * cost_out
        
        return {
            "lesson_content": fixed_content,
            "tokens_used": state.get("tokens_used", 0) + usage_stats.get("total_tokens", 0),
            "input_tokens": state.get("input_tokens", 0) + usage_stats.get("input_tokens", 0),
            "output_tokens": state.get("output_tokens", 0) + usage_stats.get("output_tokens", 0),
            "total_cost_usd": state.get("total_cost_usd", 0.0) + cost
        }
        
    except Exception as e:
        logger.error(f"LaTeX Reviewer Agent failed: {e}", exc_info=True)
        # If it fails, just return the original content
        return {
            "error": f"LaTeX Reviewer failed: {str(e)}"
        }
