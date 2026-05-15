import json
import frappe
from typing import List, Dict

def get_or_create_session_key(student: str, lesson_name: str = None) -> str:
    """Generate a clean random string for the session key."""
    return frappe.generate_hash(length=12)

def get_chat_history(session_key: str, limit: int = 20) -> list:
    """Retrieve history from Redis. Fallback to MariaDB if missing."""
    cache_key = f"socratic_history:{session_key}"
    try:
        history_json = frappe.cache().get_value(cache_key)
        if history_json:
            return json.loads(history_json)
            
        session_name = frappe.db.get_value("Socratic Session", {"session_key": session_key}, "name")
        if session_name:
            messages = frappe.get_all("Socratic Message",
                filters={"session": session_name},
                fields=["role", "content", "message_type"],
                order_by="creation desc, name desc",
                limit=limit
            )
            if messages:
                messages.reverse()
                clean_messages = [{"role": msg.role, "content": msg.content, "message_type": msg.message_type} for msg in messages]
                frappe.cache().set_value(cache_key, json.dumps(clean_messages), expires_in_sec=7200)
                return clean_messages
    except Exception:
        pass
    return []

def save_message_to_history(session_key: str, role: str, content: str, message_type: str = "qa", **kwargs) -> None:
    """Save message to Redis and Database."""
    cache_key = f"socratic_history:{session_key}"
    history = get_chat_history(session_key)
    history.append({"role": role, "content": content, "message_type": message_type})
    frappe.cache().set_value(cache_key, json.dumps(history[-20:]), expires_in_sec=7200)
    
    try:
        session_name = frappe.db.get_value("Socratic Session", {"session_key": session_key}, "name")
        if session_name:
            frappe.get_doc({
                "doctype": "Socratic Message",
                "session": session_name,
                "role": role,
                "content": content,
                "message_type": message_type,
                **kwargs
            }).insert(ignore_permissions=True)
            
            # Update message count and last active
            frappe.db.sql("UPDATE `tabSocratic Session` SET message_count = message_count + 1, last_active = %s WHERE name = %s", (frappe.utils.now_datetime(), session_name))
    except Exception as e:
        frappe.log_error(str(e), "Socratic Save State Error")

def clear_session(session_key: str) -> None:
    """Clear session from Redis and Database."""
    cache_key = f"socratic_history:{session_key}"
    frappe.cache().delete_value(cache_key)
    
    session_name = frappe.db.get_value("Socratic Session", {"session_key": session_key}, "name")
    if session_name:
        frappe.db.delete("Socratic Message", {"session": session_name})
        frappe.delete_doc("Socratic Session", session_name, ignore_permissions=True)
