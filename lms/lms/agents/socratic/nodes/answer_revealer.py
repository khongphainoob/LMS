"""Node 5: Answer Revealer – reveal the answer after too many failed attempts."""
import frappe


def answer_revealer_node(state: dict) -> dict:
    """When student has failed 3+ times, reveal a detailed answer/explanation."""
    frappe.logger("socratic").info("=== [answer_revealer] START ===")
    
    processed = state.get("processed_content", "")
    context = state.get("context", "")
    
    response = (
        "📝 **Lời giải chi tiết:**\n\n"
        "Bạn đã cố gắng rất nhiều, và đó là điều đáng khen! "
        "Dưới đây là hướng giải quyết chi tiết:\n\n"
    )
    
    if context and context != "Không có ngữ cảnh bổ sung.":
        response += f"Dựa trên nội dung bài học, đây là các bước giải:\n\n"
        response += "1. Xác định dữ kiện đã cho trong đề bài\n"
        response += "2. Chọn phương pháp phù hợp\n"
        response += "3. Áp dụng công thức và tính toán\n"
        response += "4. Kiểm tra lại kết quả\n\n"
    
    response += (
        "💪 Hãy thử làm lại bài tập tương tự để củng cố kiến thức nhé! "
        "Nếu cần hỗ trợ thêm, đừng ngại hỏi tôi."
    )
    
    frappe.logger("socratic").info(f"[answer_revealer] response length: {len(response)}")
    
    return {
        "response": response,
        "message_type": "answer",
        "current_status": "completed",
    }
