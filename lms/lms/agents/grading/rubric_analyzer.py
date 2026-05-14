from ..provider import get_llm as get_model

class RubricAgent:
    def __init__(self):
        self.model = get_model("rubric_gen")

    def analyze_rubric(self, rubric_text, items):
        prompt = f"""
        Bạn là một chuyên gia khảo thí. Nhiệm vụ của bạn là phân tích Rubric chấm điểm và ánh xạ nó vào danh sách các câu hỏi/tiêu chí.
        
        Rubric Content:
        {rubric_text}
        
        Danh sách các tiêu chí cần chấm:
        {items}
        
        Hãy trích xuất quy tắc chấm điểm chi tiết cho từng tiêu chí, bao gồm điểm tối đa và các điều kiện để đạt điểm.
        Trả về kết quả dưới dạng JSON.
        """
        response = self.model.invoke(prompt)
        return response.content

def get_rubric_analysis(rubric_doc_name):
    import frappe
    # Logic lấy rubric từ database và phân tích
    doc = frappe.get_doc("AI Grading Rubric", rubric_doc_name)
    agent = RubricAgent()
    return agent.analyze_rubric(doc.rubric_description, doc.criteria)