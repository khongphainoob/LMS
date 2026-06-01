import logging
from lms.lms.agents.provider import get_llm, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState
from lms.lms.agents.lesson_planner.prompts.system import MERMAID_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

def mermaid_node(state: LessonPlanState) -> dict:
    """
    Mermaid Visual Agent.
    Generates text-based educational flowcharts, ER diagrams, or mindmaps.
    """
    llm, model_name, cost_info = get_llm("lesson_planner")

    content = state.get("lesson_content") or ""
    topic = state.get("topic") or ""
    illustration_plan = state.get("illustration_plan") or ""
    
    human_prompt = f"""Hãy tạo sơ đồ Mermaid.js cho bài học sau:
CHỦ ĐỀ: {topic}

KẾ HOẠCH HÌNH VẼ ĐỀ XUẤT (TỪ ĐẠO DIỄN HÌNH ẢNH):
---
{illustration_plan}
---

NỘI DUNG CHI TIẾT GIÁO ÁN THAM KHẢO:
---
{content[:5000]}
---

Trả về sơ đồ dưới dạng codeblock ```mermaid``` ngay lập tức."""

    try:
        response = llm.invoke([
            {"role": "system", "content": MERMAID_SYSTEM_PROMPT},
            {"role": "user", "content": human_prompt}
        ])
        
        mermaid_code = response.content.strip()
        
        # Validate that it contains mermaid syntax
        if "```mermaid" not in mermaid_code:
            # Wrap if LLM forgot to wrap
            mermaid_code = f"```mermaid\n{mermaid_code}\n```"
            
        enriched_content = content + f"\n\n## 📊 SƠ ĐỒ QUY TRÌNH & TƯ DUY (MERMAID)\n\n{mermaid_code}\n"
        
        usage_stats = extract_usage(response)
        cost_in = cost_info.get("cost_input", 0) or 0
        cost_out = cost_info.get("cost_output", 0) or 0
        cost = (usage_stats.get("input_tokens", 0) / 1000000) * cost_in + (usage_stats.get("output_tokens", 0) / 1000000) * cost_out
        
        return {
            "lesson_content": enriched_content,
            "diagrams": [mermaid_code],
            "diagram_method": "mermaid",
            "tokens_used": state.get("tokens_used", 0) + usage_stats.get("total_tokens", 0),
            "input_tokens": state.get("input_tokens", 0) + usage_stats.get("input_tokens", 0),
            "output_tokens": state.get("output_tokens", 0) + usage_stats.get("output_tokens", 0),
            "total_cost_usd": state.get("total_cost_usd", 0.0) + cost
        }
        
    except Exception as e:
        logger.error(f"Mermaid Agent failed: {e}", exc_info=True)
        # Fallback simple mindmap
        fallback_diagram = """```mermaid
mindmap
  root((Chủ đề))
    Khái niệm cơ bản
    Hoạt động thực hành
    Bài tập củng cố
```"""
        enriched_content = content + f"\n\n## 📊 SƠ ĐỒ TƯ DUY (FALLBACK)\n\n{fallback_diagram}\n"
        return {
            "lesson_content": enriched_content,
            "diagrams": [fallback_diagram],
            "diagram_method": "mermaid",
            "error": f"Mermaid failed, fallback used: {str(e)}"
        }
