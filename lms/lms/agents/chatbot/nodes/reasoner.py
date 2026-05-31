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
    1. get_student_course_info: Tra cứu thông tin học sinh và tiến độ học tập trong khóa học.
    2. get_course_documents: Tìm kiếm trong kho tài liệu PDF/Doc của hệ thống (RAG) bằng từ khóa.
    3. read_course_document: Đọc nội dung chi tiết của một tài liệu bằng ID.
    4. search_web: Tìm kiếm thông tin mới nhất trên mạng internet.
    
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
        "tool_to_use": "get_student_course_info" | "get_course_documents" | "read_course_document" | "search_web" | "none",
        "tool_input": "tham số cho công cụ (nếu có, VD: từ khóa tìm kiếm)",
        "confidence": 0.0-1.0
    }}
    Lưu ý quan trọng: Chỉ dùng get_course_documents khi người dùng hỏi về kiến thức, lý thuyết, tài liệu.
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
