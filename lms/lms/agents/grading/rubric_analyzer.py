import bs4
from langchain_core.messages import HumanMessage
from ..provider import get_llm as get_model
from ..schemas import RubricAnalysis

def _encode_image(image_path: str) -> str:
    import frappe
    import os
    import base64
    
    if image_path.startswith("/"):
        path_parts = image_path.strip("/").split("/")
        if path_parts[0] == "files":
            full_path = frappe.get_site_path("public", *path_parts)
        else:
            full_path = frappe.get_site_path(*path_parts)
    else:
        full_path = image_path
        
    if not os.path.exists(full_path):
        return None
        
    with open(full_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def _extract_images(html_text: str) -> list:
    if not html_text:
        return []
    soup = bs4.BeautifulSoup(html_text, "html.parser")
    images_base64 = []
    for img in soup.find_all("img"):
        src = img.get("src")
        if src:
            b64 = _encode_image(src)
            if b64:
                images_base64.append(b64)
    return images_base64

class RubricAgent:
    def __init__(self):
        self.model = get_model("rubric_gen").with_structured_output(RubricAnalysis)

    def analyze_rubric(self, rubric_text, items, images_base64=None):
        prompt_text = f"""
        Bạn là một chuyên gia khảo thí. Nhiệm vụ của bạn là phân tích Rubric chấm điểm và ánh xạ nó vào danh sách các câu hỏi/tiêu chí.
        
        Rubric Content:
        {rubric_text}
        
        Danh sách các tiêu chí cần chấm:
        {items}
        
        Hãy trích xuất quy tắc chấm điểm chi tiết cho từng tiêu chí, bao gồm điểm tối đa và các điều kiện để đạt điểm.
        """
        
        content_blocks = [{"type": "text", "text": prompt_text}]
        
        if images_base64:
            for img in images_base64:
                content_blocks.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{img}"}
                })
        
        msg = HumanMessage(content=content_blocks)
        response = self.model.invoke([msg])
        return response.model_dump()

def get_rubric_analysis(rubric_doc_name):
    import frappe
    # Logic lấy rubric từ database và phân tích
    doc = frappe.get_doc("AI Grading Rubric", rubric_doc_name)
    
    # Extract images from HTML description
    images_base64 = _extract_images(doc.rubric_description or "")
    
    agent = RubricAgent()
    return agent.analyze_rubric(doc.rubric_description, doc.criteria, images_base64)