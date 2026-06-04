import os
import subprocess
import logging
import frappe
from lms.lms.agents.provider import get_llm, extract_usage
from lms.lms.agents.lesson_planner.state import LessonPlanState
from lms.lms.agents.lesson_planner.prompts.system import MATPLOTLIB_SYSTEM_PROMPT
from frappe.utils.file_manager import save_file

logger = logging.getLogger(__name__)

def matplotlib_node(state: LessonPlanState) -> dict:
    """
    Matplotlib Visual Agent.
    Generates exact code-driven scientific plots, functions, and mathematical charts.
    """
    llm, model_name, cost_info = get_llm("lesson_planner", max_tokens=8192)

    content = state.get("lesson_content") or ""
    topic = state.get("topic") or ""
    teacher_id = state.get("teacher")
    plan_doc_name = state.get("plan_doc_name")

    illustration_plan = state.get("illustration_plan") or ""

    human_prompt = f"""Hãy viết code Python vẽ biểu đồ hoặc đồ thị hàm số khoa học minh họa cho bài sau:
CHỦ ĐỀ: {topic}

KẾ HOẠCH HÌNH VẼ ĐỀ XUẤT (TỪ ĐẠO DIỄN HÌNH ẢNH):
---
{illustration_plan}
---

NỘI DUNG GIÁO ÁN THAM KHẢO:
---
{content[:3000]}
---

YÊU CẦU:
- Phải dùng plt.savefig('matplotlib_diagram.png', dpi=150, bbox_inches='tight') để lưu hình vẽ.
- Chỉ trả về đoạn code Python trong block ```python```."""

    try:
        response = llm.invoke([
            {"role": "system", "content": MATPLOTLIB_SYSTEM_PROMPT},
            {"role": "user", "content": human_prompt}
        ])
        
        raw_code = response.content.strip()
        if "```python" in raw_code:
            raw_code = raw_code.split("```python")[1].split("```")[0].strip()
        elif "```" in raw_code:
            raw_code = raw_code.split("```")[1].strip()
        
        # Execute in a safe subprocess
        img_path = "/tmp/matplotlib_diagram.png"
        if os.path.exists(img_path):
            os.remove(img_path)
            
        with open("/tmp/temp_plot.py", "w") as f:
            f.write("import matplotlib.pyplot as plt\\n")
            f.write(raw_code)
            
        process = subprocess.run(["python3", "/tmp/temp_plot.py"], capture_output=True)
        if process.returncode == 0 and os.path.exists(img_path):
            frappe_file = save_file(
                fname="matplotlib_diagram.png",
                content=open(img_path, "rb").read(),
                dt="LMS Settings",
                dn="LMS Settings",
                folder="Home/Attachments",
                decode=False,
                is_private=0
            )
            file_url = frappe_file.file_url
            
            # Clean up local PNG
            os.remove(img_path)
            
            enriched_content = content + f"\n\n## 📈 ĐỒ THỊ & HÌNH MINH HỌA (KHOA HỌC)\n\n![Đồ thị minh họa]({file_url})\n"
            
            return {
                "lesson_content": enriched_content,
                "diagrams": [file_url],
                "diagram_method": "matplotlib",
                "tokens_used": state.get("tokens_used", 0) + usage_stats.get("total_tokens", 0),
                "input_tokens": state.get("input_tokens", 0) + usage_stats.get("input_tokens", 0),
                "output_tokens": state.get("output_tokens", 0) + usage_stats.get("output_tokens", 0),
                "total_cost_usd": state.get("total_cost_usd", 0.0) + cost
            }
        else:
            stderr_out = process.stderr.decode("utf-8") if process.stderr else "Matplotlib PNG not generated"
            raise Exception(f"Matplotlib execution failed: {stderr_out}")
            
    except Exception as e:
        logger.error(f"Matplotlib Agent failed: {e}", exc_info=True)
        
        # Fallback to Mermaid flowchart
        fallback_diagram = """```mermaid
flowchart TD
    Start([Bắt đầu]) --> Plot[Tính toán tọa độ & Vẽ đồ thị Matplotlib]
    Plot --> Save[plt.savefig]
```"""
        enriched_content = content + f"\n\n## 📊 BIỂU ĐỒ TRỰC QUAN (FALLBACK)\n\n{fallback_diagram}\n"
        return {
            "lesson_content": enriched_content,
            "diagrams": [fallback_diagram],
            "diagram_method": "mermaid",
            "error": f"Matplotlib failed, fallback used: {str(e)}"
        }
