import logging
import frappe
from lms.lms.agents.provider import get_llm, get_agent_config, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState
from lms.lms.agents.lesson_planner.prompts.system import IMAGE_GEN_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

def image_gen_node(state: LessonPlanState) -> dict:
    """
    AI Image Generation Visual Agent.
    Generates rich educational illustrations for history, biology, or geography.
    """
    llm, model_name, cost_info = get_llm("lesson_planner")

    content = state.get("lesson_content") or ""
    topic = state.get("topic") or ""
    teacher_id = state.get("teacher")
    plan_doc_name = state.get("plan_doc_name")

    human_prompt = f"""Hãy viết 1 đoạn prompt tiếng Anh chất lượng cao, chi tiết để vẽ hình giáo dục minh họa cho bài sau:
CHỦ ĐỀ: {topic}

NỘI DUNG GIÁO ÁN:
---
{content[:2000]}
---

Chỉ trả về dòng prompt tiếng Anh thuần túy, không có text markdown bao bọc."""

    try:
        # 1. Generate descriptive English prompt for drawing
        response = llm.invoke([
            {"role": "system", "content": IMAGE_GEN_SYSTEM_PROMPT},
            {"role": "user", "content": human_prompt}
        ])
        
        prompt_en = response.content.strip()
        
        # 2. Try calling Gemini's Imagen model if keys exist
        # 2. Try calling Gemini's Imagen model if keys exist
        # Currently just returning a descriptive illustration block:
        illustration_block = f"""
> 🎨 **[AI Image Prompt được lập để sinh ảnh minh họa]**
> *Ý tưởng thiết kế:* {prompt_en}
> *Phong cách:* Hình vẽ giáo dục sách giáo khoa, rõ nét, nền trắng phẳng.
"""
        enriched_content = content + f"\n\n## 🎨 HÌNH ẢNH MINH HỌA ĐỀ XUẤT\n\n{illustration_block}\n"
        
        usage_stats = extract_usage(response)
        cost_in = cost_info.get("cost_input", 0) or 0
        cost_out = cost_info.get("cost_output", 0) or 0
        cost = (usage_stats.get("input_tokens", 0) / 1000000) * cost_in + (usage_stats.get("output_tokens", 0) / 1000000) * cost_out
        
        return {
            "lesson_content": enriched_content,
            "diagrams": [prompt_en],
            "diagram_method": "image_gen",
            "tokens_used": state.get("tokens_used", 0) + usage_stats.get("total_tokens", 0),
            "input_tokens": state.get("input_tokens", 0) + usage_stats.get("input_tokens", 0),
            "output_tokens": state.get("output_tokens", 0) + usage_stats.get("output_tokens", 0),
            "total_cost_usd": state.get("total_cost_usd", 0.0) + cost
        }
        
    except Exception as e:
        logger.error(f"Image Gen Agent failed: {e}", exc_info=True)
        fallback_diagram = """```mermaid
flowchart TD
    Concept[Mô tả hình ảnh] --> Prompt[Prompt tiếng Anh]
    Prompt --> Gen[Sinh ảnh AI]
```"""
        enriched_content = content + f"\n\n## 📊 SƠ ĐỒ Ý TƯỞNG MINH HỌA (FALLBACK)\n\n{fallback_diagram}\n"
        return {
            "lesson_content": enriched_content,
            "diagrams": [fallback_diagram],
            "diagram_method": "mermaid",
            "error": f"Image Gen failed, fallback used: {str(e)}"
        }
