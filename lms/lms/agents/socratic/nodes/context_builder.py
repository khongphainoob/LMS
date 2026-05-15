"""Node 2: Context Builder – gather lesson context and rubric."""
import frappe


def context_builder_node(state: dict) -> dict:
    """Build context for evaluation.
    - Fetch lesson content if available
    - Use rubric_data from state if provided
    """
    frappe.logger("socratic").info("=== [context_builder] START ===")
    
    lesson_content = state.get("lesson_content", "")
    rubric_data = state.get("rubric_data", "")
    chat_history = state.get("chat_history", [])
    
    context_parts = []
    
    if lesson_content:
        context_parts.append(f"Nội dung bài học:\n{lesson_content[:2000]}")
    
    if rubric_data:
        context_parts.append(f"Tiêu chí chấm điểm (Rubric):\n{rubric_data}")
    
    if chat_history:
        recent = chat_history[-6:]  # last 3 exchanges
        history_text = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in recent])
        context_parts.append(f"Lịch sử hội thoại gần đây:\n{history_text}")
    
    context = "\n\n---\n\n".join(context_parts) if context_parts else "Không có ngữ cảnh bổ sung."
    
    frappe.logger("socratic").info(f"[context_builder] context length: {len(context)}")
    
    return {"context": context}
