"""Node 4: Socratic Hint – Use LLM to generate Socratic guiding questions."""
import frappe
from langchain_core.messages import SystemMessage, HumanMessage


def socratic_hint_node(state: dict) -> dict:
    """Generate contextual Socratic questions using LLM."""
    frappe.logger("socratic").info("=== [socratic_hint] START ===")
    
    from ...provider import get_llm
    llm, model_name, _ = get_llm("socratic_hint", temperature=0.4)
    
    processed = state.get("processed_content", "")
    context = state.get("context", "")
    evaluation = state.get("evaluation", {})
    chat_history = state.get("chat_history", [])
    
    # Build conversation history for LLM
    history_text = ""
    if chat_history:
        recent = chat_history[-8:]
        history_text = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')[:200]}" for m in recent])

    system_prompt = """Bạn là một gia sư AI sử dụng phương pháp Socratic (phương pháp hỏi đáp).

QUY TẮC QUAN TRỌNG:
1. KHÔNG BAO GIỜ đưa ra đáp án trực tiếp
2. Dùng câu hỏi gợi mở để học sinh tự suy nghĩ
3. Khen ngợi khi học sinh có tiến bộ
4. Nếu học sinh sai, gợi ý hướng đúng bằng câu hỏi
5. Giọng điệu thân thiện, khích lệ
6. Trả lời ngắn gọn (2-4 câu), tập trung vào 1 câu hỏi gợi mở chính
7. Sử dụng emoji phù hợp để tạo không khí thân thiện
8. Trả lời bằng tiếng Việt"""

    user_content = f"""Tin nhắn mới nhất của học sinh:
{processed}"""
    
    if evaluation.get("analysis"):
        user_content += f"\n\nPhân tích trước đó của AI:\n{evaluation['analysis'][:500]}"
    
    if history_text:
        user_content += f"\n\nLịch sử hội thoại:\n{history_text}"
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content)
    ]
    
    try:
        result = llm.invoke(messages)
        response_text = result.content
        tokens_used = getattr(result, 'usage_metadata', {})
        total_tokens = 0
        if isinstance(tokens_used, dict):
            total_tokens = tokens_used.get('total_tokens', 0)
        
        frappe.logger("socratic").info(f"[socratic_hint] response length: {len(response_text)}")
        
        return {
            "response": response_text,
            "message_type": "socratic_hint",
            "mistake_count": state.get("mistake_count", 0) + 1,
            "tokens_used": state.get("tokens_used", 0) + total_tokens,
            "model_used": model_name,
            "current_status": "hint_given",
        }
    except Exception as e:
        frappe.logger("socratic").error(f"[socratic_hint] LLM call failed: {str(e)}")
        
        return {
            "response": "🤔 Câu hỏi hay đấy! Bạn có thể giải thích thêm về cách bạn đã tiếp cận vấn đề này không? Hãy thử nhìn lại từng bước giải nhé!",
            "message_type": "socratic_hint",
            "mistake_count": state.get("mistake_count", 0) + 1,
            "current_status": "hint_given",
        }
