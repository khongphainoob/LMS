import json
import frappe
from frappe.utils import now_datetime


def get_or_create_session_key(student: str, lesson_name: str = None) -> str:
    """Returns a unique session key for Redis."""
    # Pattern: chatbot:{student_id}:{lesson_id or 'general'}
    lesson_id = lesson_name or "general"
    return f"chatbot:{student}:{lesson_id}"


def get_chat_history(session_key: str, limit: int = 20, offset: int = 0) -> list:
    """Retrieves history from Redis or DB."""
    try:
        # 1. Try Redis first (fast) ONLY if requesting the first page
        if offset == 0:
            history_json = frappe.cache().get_value(session_key)
            if history_json:
                return json.loads(history_json)
            
        # 2. Fallback to MariaDB (permanent)
        session_name = frappe.db.get_value("Chatbot Session", {"session_key": session_key}, "name")
        if session_name:
            messages = frappe.get_all("Chatbot Message",
                filters={"session": session_name},
                fields=["role", "content"],
                order_by="creation desc, name desc",
                limit=limit,
                limit_start=offset
            )
            if messages:
                messages.reverse()  # Reverse so oldest is first, newest is last
                
                # Cần cast kết quả từ _dict của Frappe sang dict thường để dump JSON không bị lỗi
                clean_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
                
                # Cache it back to Redis for future fast access (ONLY first page)
                if offset == 0:
                    frappe.cache().set_value(session_key, json.dumps(clean_messages), expires_in_sec=3600 * 2)
                return clean_messages
    except Exception:
        pass
    return []


def save_message_to_history(session_key: str, role: str, content: str, session_name: str = None, history: list = None, extra_data: dict = None) -> list:
    """Appends a message to the history and saves to Redis + DB."""
    if history is None:
        history = get_chat_history(session_key)
    
    history.append({"role": role, "content": content})

    # Keep only last 20 messages to prevent context overflow
    if len(history) > 20:
        history = history[-20:]

    # Update Redis
    frappe.cache().set_value(session_key, json.dumps(history), expires_in_sec=3600 * 2)

    # Update DB if session_name is available
    if session_name:
        try:
            doc_data = {
                "doctype": "Chatbot Message",
                "session": session_name,
                "role": role,
                "content": content,
            }
            if extra_data and role == "assistant":
                doc_data.update({
                    "tokens_used": extra_data.get("tokens_used", 0),
                    "input_tokens": extra_data.get("input_tokens", 0),
                    "output_tokens": extra_data.get("output_tokens", 0),
                    "total_cost_usd": extra_data.get("total_cost_usd", 0),
                    "latency_ms": extra_data.get("latency_ms", 0),
                    "model_used": extra_data.get("model_used"),
                    "message_type": extra_data.get("message_type")
                })
            
            doc = frappe.get_doc(doc_data)
            doc.insert(ignore_permissions=True)
        except Exception as e:
            frappe.log_error(f"Error saving message to DB: {str(e)}\n{frappe.get_traceback()}", "Chatbot Message DB Error")
            
    return history


def clear_session(session_key: str):
    """Clears the session history."""
    frappe.cache().delete_value(session_key)
