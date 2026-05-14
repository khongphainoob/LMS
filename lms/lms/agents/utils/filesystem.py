import frappe
import os
import json
import base64

def _get_session_path(session_id):
    path = frappe.get_site_path("private", "ai_grading", session_id)
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)
    return path

def _write_to_filesystem(session_id, filename, content):
    base_path = _get_session_path(session_id)
    filepath = os.path.join(base_path, filename)
    
    if isinstance(content, (dict, list)):
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(content, f, ensure_ascii=False, indent=4)
    else:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
    return filepath

def _read_filesystem(session_id, filename):
    base_path = _get_session_path(session_id)
    filepath = os.path.join(base_path, filename)
    
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    return None

def _b64(file_path):
    """Đọc file và chuyển sang base64 (cho vision models)"""
    # Nếu file_path là URL (bắt đầu bằng /files/ hoặc /private/files/)
    if file_path.startswith("/files/"):
        full_path = frappe.get_site_path("public", file_path.lstrip("/"))
    elif file_path.startswith("/"):
        full_path = frappe.get_site_path(file_path.lstrip("/"))
    else:
        full_path = file_path
        
    if os.path.exists(full_path):
        with open(full_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    return ""