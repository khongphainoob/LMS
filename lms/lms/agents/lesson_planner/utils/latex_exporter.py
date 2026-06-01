import logging
from lms.lms.agents.provider import get_llm

logger = logging.getLogger(__name__)

def create_latex_from_markdown(content: str, topic: str, is_draft: bool = False) -> str:
    """
    Converts markdown lesson plan into a complete LaTeX document using LLM.
    """
    llm, model_name, cost_info = get_llm("lesson_planner", max_tokens=8192)
    LATEX_PREAMBLE = r"""\documentclass[12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T5]{fontenc}
\usepackage[vietnamese]{babel}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage[margin=2cm]{geometry}
\usepackage{tikz}
\usepackage{pgfplots}
\usepackage{graphicx}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{xcolor}

\title{Giáo án: %s}
\author{}
\date{}

\begin{document}
\maketitle

%s
"""
    
    draft_warning = r"\begin{center}\textcolor{red}{\textbf{\Large BẢN NHÁP AI - CHƯA PHÊ DUYỆT}}\end{center}" + "\n\n" if is_draft else ""
    
    system_prompt = r"""Bạn là một chuyên gia LaTeX. Nhiệm vụ của bạn là chuyển đổi nội dung giáo án Markdown thành mã LaTeX.
HỆ THỐNG ĐÃ TỰ ĐỘNG THÊM PREAMBLE (\documentclass, \usepackage, \begin{document}...).
BẠN CHỈ CẦN VIẾT PHẦN NỘI DUNG (BODY) BÊN TRONG \begin{document}... \end{document}.
TUYỆT ĐỐI KHÔNG VIẾT LẠI \documentclass, \usepackage, hay \begin{document}.

YÊU CẦU BẮT BUỘC:
1. Trả về DUY NHẤT mã nguồn LaTeX của phần nội dung, không giải thích, không bọc trong ```latex.
2. TOÀN BỘ công thức, biến số, đơn vị vật lý phải được đặt trong môi trường toán học (Inline dùng $...$, Block dùng \[...\] hoặc \begin{equation}).
3. KHÔNG DÙNG ký tự Unicode trực tiếp cho toán học (ví dụ: không dùng α, ², mà PHẢI dùng \alpha, ^2). Phân số phải dùng \frac{a}{b}.
4. KHÔNG BAO GIỜ dùng lệnh \\ hoặc \newline vô tội vạ. Hãy để LaTeX tự động wrap chữ. Chỉ dùng 1 dòng trống (blank line) để ngắt đoạn.
5. Tránh để các dòng trống dư thừa giữa các thẻ \item.
6. KHÔNG dùng Emoji.
7. Đáp án đúng dùng \item[$\checkmark$], đáp án sai dùng \item[ ].
8. TUYỆT ĐỐI KHÔNG dùng \begin{verbatim} cho mã TikZ. Đối với hình vẽ, chỉ dùng \begin{tikzpicture}...\end{tikzpicture} trực tiếp.
"""

    human_prompt = f"CHỦ ĐỀ: {topic}\n\nNỘI DUNG MARKDOWN:\n{content}\n\nHãy chuyển đổi sang mã LaTeX phần nội dung ngay."
    
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
            
        latex_code = latex_code.strip()
        
        # Self-correction step
        review_prompt = f"""Dưới đây là mã nguồn LaTeX (phần body) vừa được sinh ra. Hãy kiểm tra thật kỹ TẤT CẢ các lỗi sau (nếu có):
1. Lỗi cú pháp gây compile error: quên escape ký tự đặc biệt (%, &, _, $, #, {{, }}), hoặc lỗi môi trường Toán học.
2. Lỗi trình bày: Các lệnh xuống dòng dư thừa (`\\\\` hoặc `\\newline`) nằm chơ vơ giữa văn bản.

NẾU KHÔNG CÓ LỖI NÀO: Hãy trả về đúng 1 chữ: OK
NẾU CÓ LỖI: Hãy sửa lỗi và trả về TOÀN BỘ MÃ NGUỒN LATEX ĐÃ SỬA. 
Lưu ý quan trọng khi có lỗi: CHỈ TRẢ VỀ MÃ NGUỒN, KHÔNG BỌC TRONG ```latex, KHÔNG GIẢI THÍCH, KHÔNG BỊA THÊM NỘI DUNG.

MÃ NGUỒN LATEX GỐC:
{latex_code}"""
        
        review_response = llm.invoke([
            {"role": "user", "content": review_prompt}
        ])
        
        final_code = review_response.content.strip()
        if final_code.upper() == "OK" or final_code.upper() == '"OK"':
            final_code = latex_code
        else:
            if final_code.startswith("```latex"):
                final_code = final_code[8:]
            if final_code.startswith("```"):
                final_code = final_code[3:]
            if final_code.endswith("```"):
                final_code = final_code[:-3]
            
        final_code = final_code.strip()
        
        # Defensive stripping
        final_code = final_code.replace(r"\begin{document}", "")
        final_code = final_code.replace(r"\end{document}", "")
        
        import re
        # Strip LLM token leakage (e.g. <seg81>, <seg1>)
        final_code = re.sub(r"<seg\d*>", "", final_code)
        
        # Combine template and body
        full_latex = LATEX_PREAMBLE % (topic, draft_warning + final_code + "\n\\end{document}\n")
        
        return full_latex

    except Exception as e:
        logger.error(f"LaTeX Exporter failed: {e}")
        raise e
