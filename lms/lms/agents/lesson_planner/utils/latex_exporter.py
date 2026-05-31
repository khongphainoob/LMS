import logging
from lms.lms.agents.provider import get_llm

logger = logging.getLogger(__name__)

def create_latex_from_markdown(content: str, topic: str, is_draft: bool = False) -> str:
    """
    Converts markdown lesson plan into a complete LaTeX document using LLM.
    """
    llm, model_name, cost_info = get_llm("lesson_planner")
    
    system_prompt = """Bạn là một chuyên gia LaTeX. Nhiệm vụ của bạn là chuyển đổi giáo án Markdown thành một file LaTeX hoàn chỉnh.
YÊU CẦU BẮT BUỘC:
- Trả về DUY NHẤT mã nguồn LaTeX, không giải thích, không bọc trong ```latex.
- Sử dụng documentclass article.
- Hỗ trợ tiếng Việt (usepackage[utf8]{inputenc}, usepackage[T5]{fontenc}, usepackage[vietnamese]{babel}).
- Trình bày đẹp, có tiêu đề (title), tác giả (author).
- Xử lý các bảng biểu (table), danh sách (itemize/enumerate), và định dạng in đậm/in nghiêng một cách chính xác.
"""
    if is_draft:
        system_prompt += "- Thêm watermark hoặc text màu đỏ ở đầu tài liệu ghi rõ: BẢN NHÁP AI - CHƯA PHÊ DUYỆT.\n"

    human_prompt = f"CHỦ ĐỀ: {topic}\n\nNỘI DUNG MARKDOWN:\n{content}\n\nHãy chuyển đổi sang LaTeX ngay."
    
    try:
        response = llm.invoke([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": human_prompt}
        ])
        
        latex_code = response.content.strip()
        if latex_code.startswith("```latex"):
            latex_code = latex_code[8:]
        if latex_code.startswith("```"):
            latex_code = latex_code[3:]
        if latex_code.endswith("```"):
            latex_code = latex_code[:-3]
            
        return latex_code.strip()
    except Exception as e:
        logger.error(f"LaTeX Exporter failed: {e}")
        raise e
