import json
from ..utils import get_chatbot_model

def reasoner_node(state):
    """
    Thinking node that analyzes the user query and decides which tools to use.
    """
    print("--- REASONING / THINKING ---")
    message = state["user_message"]
    context = state.get("context", "")
    
    model = get_chatbot_model(temperature=0.2)
    
    prompt = f"""
    Bạn là một Trợ lý AI thông minh có khả năng suy luận đa bước.
    Nhiệm vụ của bạn là phân tích câu hỏi của người dùng và quyết định chiến lược trả lời tốt nhất.
    
    Các công cụ bạn có sẵn (giả định):
    1. get_course_details: Lấy thông tin tổng quan, mô tả và đề cương (syllabus) của khóa học.
    2. get_course_material: Lấy nội dung chi tiết bài học từ khóa học.
    3. search_documents: Tìm kiếm trong kho tài liệu PDF/Doc của hệ thống (RAG).
    4. search_web: Tìm kiếm thông tin mới nhất trên mạng.
    
    Thông tin hiện tại:
    - Khóa học: {state.get('course', 'Không xác định')}
    - Bài học: {state.get('lesson_name', 'Không xác định')}
    
    Câu hỏi người dùng: {message}
    
    Hãy thực hiện các bước sau:
    1. Suy nghĩ (Thought): Phân tích câu hỏi cần những thông tin gì.
    2. Quyết định (Decision): Bạn sẽ sử dụng công cụ nào? Hay có thể trả lời ngay?
    
    Trả về kết quả dưới dạng JSON:
    {{
        "thought": "chuỗi suy nghĩ của bạn",
        "tool_to_use": "get_course_details" | "get_course_material" | "search_documents" | "search_web" | "none",
        "tool_input": "tham số cho công cụ (nếu có). Lưu ý: Nếu dùng get_course_material mà không có bài học cụ thể, hãy để là none.",
        "confidence": 0.0-1.0
    }}
    Lưu ý quan trọng: Chỉ dùng get_course_material khi bạn biết chắc chắn tên bài học hoặc đang ở trong ngữ cảnh bài học cụ thể.
    """
    
    response = model.invoke(prompt)
    try:
        # Simple cleanup if model returns markdown
        clean_content = response.content.replace('```json', '').replace('```', '').strip()
        reasoning = json.loads(clean_content)
    except:
        reasoning = {
            "thought": "Không thể phân tích logic phức tạp, chuyển sang QA mặc định.",
            "tool_to_use": "none",
            "confidence": 0.5
        }
        
    return {"reasoning": reasoning}
