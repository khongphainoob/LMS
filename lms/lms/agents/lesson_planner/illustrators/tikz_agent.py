import logging
from lms.lms.agents.provider import get_llm, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState

logger = logging.getLogger(__name__)

TIKZ_SYSTEM_PROMPT = """Bạn là một giáo sư Toán/Lý và chuyên gia về LaTeX/TikZ.
Nhiệm vụ của bạn là đọc giáo án và tạo mã nguồn vẽ hình (đồ thị, hình học, mạch điện, v.v.) bằng gói lệnh TikZ hoặc pgfplots.
- Trả về CHỈ mã nguồn TikZ, được bọc trong ```latex.
- Đảm bảo mã nguồn có thể biên dịch được khi chèn vào môi trường document của LaTeX.
- Vẽ sắc nét, chuyên nghiệp, hiển thị độ dài/kích thước/tọa độ rõ ràng (nếu có yêu cầu)."""

def tikz_node(state: LessonPlanState) -> dict:
    """
    TikZ Visual Agent.
    Generates LaTeX-native TikZ code for Math and Physics.
    """
    llm, model_name, cost_info = get_llm("lesson_planner")

    content = state.get("lesson_content") or ""
    topic = state.get("topic") or ""

    illustration_plan = state.get("illustration_plan") or ""

    human_prompt = f"""Hãy viết mã lệnh TikZ/pgfplots để vẽ hình minh họa cho bài học sau:
CHỦ ĐỀ: {topic}

KẾ HOẠCH HÌNH VẼ ĐỀ XUẤT (TỪ ĐẠO DIỄN HÌNH ẢNH):
---
{illustration_plan}
---

NỘI DUNG CHI TIẾT GIÁO ÁN THAM KHẢO:
---
{content[:5000]}
---

YÊU CẦU:
- Phân tích yêu cầu bài toán trong giáo án để vẽ hình chính xác.
- Chỉ trả về đoạn code TikZ/pgfplots trong block ```latex ngay lập tức."""

    try:
        response = llm.invoke([
            {"role": "system", "content": TIKZ_SYSTEM_PROMPT},
            {"role": "user", "content": human_prompt}
        ])
        
        tikz_code = response.content.strip()
        
        if "```latex" not in tikz_code and "```tex" not in tikz_code:
            tikz_code = f"```latex\n{tikz_code}\n```"
            
        enriched_content = content + f"\n\n## 📐 HÌNH VẼ MINH HỌA (TIKZ)\n\n{tikz_code}\n"
        
        usage_stats = extract_usage(response)
        cost_in = cost_info.get("cost_input", 0) or 0
        cost_out = cost_info.get("cost_output", 0) or 0
        cost = (usage_stats.get("input_tokens", 0) / 1000000) * cost_in + (usage_stats.get("output_tokens", 0) / 1000000) * cost_out
        
        return {
            "lesson_content": enriched_content,
            "diagrams": [tikz_code],
            "diagram_method": "tikz",
            "tokens_used": state.get("tokens_used", 0) + usage_stats.get("total_tokens", 0),
            "input_tokens": state.get("input_tokens", 0) + usage_stats.get("input_tokens", 0),
            "output_tokens": state.get("output_tokens", 0) + usage_stats.get("output_tokens", 0),
            "total_cost_usd": state.get("total_cost_usd", 0.0) + cost
        }
        
    except Exception as e:
        logger.error(f"TikZ Agent failed: {e}", exc_info=True)
        fallback_diagram = """```latex
\\begin{tikzpicture}
\\draw (0,0) circle (2cm);
\\node at (0,0) {TikZ Error};
\\end{tikzpicture}
```"""
        enriched_content = content + f"\n\n## 📐 HÌNH VẼ MINH HỌA (FALLBACK)\n\n{fallback_diagram}\n"
        return {
            "lesson_content": enriched_content,
            "diagrams": [fallback_diagram],
            "diagram_method": "tikz",
            "error": f"TikZ failed, fallback used: {str(e)}"
        }
