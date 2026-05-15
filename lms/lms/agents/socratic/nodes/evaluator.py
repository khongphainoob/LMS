"""Node 3: Evaluator – Use LLM to analyze student's work and provide detailed evaluation."""
import frappe
from langchain_core.messages import SystemMessage, HumanMessage


def _encode_image(image_path: str) -> str:
    import os
    import base64
    
    if image_path.startswith("data:image"):
        return image_path.split(",")[1]
        
    if image_path.startswith("/"):
        path_parts = image_path.strip("/").split("/")
        if path_parts[0] == "files":
            full_path = frappe.get_site_path("public", *path_parts)
        else:
            full_path = frappe.get_site_path(*path_parts)
    else:
        full_path = image_path
        
    if not os.path.exists(full_path):
        frappe.logger("socratic").error(f"Image not found at: {full_path}")
        return ""
        
    with open(full_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


def evaluator_node(state: dict) -> dict:
    """Call LLM to evaluate the student's submission.
    Returns a structured evaluation + the first analysis message.
    """
    frappe.logger("socratic").info("=== [evaluator] START ===")
    
    from ...provider import get_llm, get_agent_config
    llm = get_llm("socratic_evaluator", temperature=0.3)
    config = get_agent_config("socratic_evaluator")
    model_name = config["model"]
    
    processed = state.get("processed_content", "")
    context = state.get("context", "")
    image_data = state.get("image_data", "")
    chat_history = state.get("chat_history", [])
    
    # 1 phiên hỏi đáp chỉ được chấm 1 lần duy nhất (lúc bắt đầu)
    if chat_history and len(chat_history) > 0:
        frappe.logger("socratic").info("[evaluator] Skipping analysis because chat history exists (follow-up message)")
        return {
            "evaluation": {"correct": False, "error_type": "needs_elaboration", "hint_needed": True}
        }

    
    system_prompt = """Bạn là một gia sư AI chuyên nghiệp sử dụng phương pháp Socratic.

NHIỆM VỤ: Phân tích bài làm của học sinh (được gửi dưới dạng ảnh hoặc văn bản) và đưa ra đánh giá chi tiết. ĐỌC KỸ ẢNH NẾU CÓ.

QUY TẮC:
1. Phân tích cẩn thận nội dung bài làm (nhận dạng chữ viết tay hoặc nội dung trong ảnh)
2. Xác định điểm đúng và điểm cần cải thiện
3. KHÔNG đưa ra đáp án trực tiếp
4. Đánh giá theo các tiêu chí: Tính đúng đắn, Logic lập luận, Trình bày
5. Kết thúc bằng 1-2 câu hỏi gợi mở để học sinh tự suy nghĩ thêm
6. Trả lời bằng tiếng Việt, sử dụng Markdown cho format đẹp"""

    user_content_blocks = [{"type": "text", "text": f"Nội dung văn bản kèm theo (nếu có):\n{processed}"}]
    
    if context and context != "Không có ngữ cảnh bổ sung.":
        user_content_blocks[0]["text"] += f"\n\nNgữ cảnh bổ sung/Tiêu chí:\n{context}"
    
    if image_data:
        try:
            b64_img = _encode_image(image_data)
            if b64_img:
                user_content_blocks.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}
                })
                frappe.logger("socratic").info("[evaluator] Image attached successfully")
        except Exception as e:
            frappe.logger("socratic").error(f"[evaluator] Failed to attach image: {str(e)}")

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content_blocks)
    ]
    
    try:
        result = llm.invoke(messages)
        response_text = result.content
        tokens_used = getattr(result, 'usage_metadata', {})
        total_tokens = 0
        if isinstance(tokens_used, dict):
            total_tokens = tokens_used.get('total_tokens', 0)
        
        frappe.logger("socratic").info(f"[evaluator] LLM response length: {len(response_text)}, tokens: {total_tokens}")
        
        return {
            "evaluation": {
                "correct": False,
                "error_type": "needs_elaboration",
                "hint_needed": True,
                "analysis": response_text,
            },
            "response": response_text,
            "message_type": "analysis",
            "tokens_used": total_tokens,
            "model_used": model_name,
        }
    except Exception as e:
        frappe.logger("socratic").error(f"[evaluator] LLM call failed: {str(e)}")
        frappe.log_error(frappe.get_traceback(), "Socratic Evaluator LLM Error")
        
        fallback = (
            "### 📝 Phân tích sơ bộ\n\n"
            "Tôi đã nhận được bài làm của bạn. "
            "Hiện tại hệ thống đang gặp sự cố khi phân tích chi tiết.\n\n"
            "Trong khi chờ đợi, bạn có thể:\n"
            "- Kiểm tra lại các bước giải của mình\n"
            "- Xác nhận các công thức đã sử dụng\n\n"
            "Hãy thử gửi lại hoặc đặt câu hỏi cụ thể nhé!"
        )
        return {
            "evaluation": {"correct": False, "error_type": "system_error", "hint_needed": True},
            "response": fallback,
            "message_type": "analysis",
            "tokens_used": 0,
            "model_used": "fallback",
        }
