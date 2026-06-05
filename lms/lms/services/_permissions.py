import os
import frappe
from frappe import _

def ensure_doc_ownership(doctype: str, name: str, owner_field: str = "owner"):
    """
    Checks if the current user is the owner of the document.
    Allows Administrator and management roles to bypass.
    """
    if not name:
        frappe.throw(_("Document name is required"), frappe.ValidationError)

    owner = frappe.db.get_value(doctype, name, owner_field)
    if not owner:
        frappe.throw(_("{0} {1} not found").format(doctype, name), frappe.DoesNotExistError)

    user = frappe.session.user
    if user == "Administrator":
        return

    # Roles that have global view/edit access for AI services
    allowed_roles = {"System Manager", "Course Creator", "Moderator", "Batch Evaluator"}
    if allowed_roles & set(frappe.get_roles(user)):
        return

    if owner != user:
        frappe.throw(_("You do not have permission to perform this action"), frappe.PermissionError)

def ensure_teacher_or_owner(doctype: str, name: str):
    """
    Alias for ensure_doc_ownership for semantic clarity in lesson planning.
    """
    ensure_doc_ownership(doctype, name, owner_field="teacher")

def validate_file_path(file_url: str):
    """
    Validates and securely resolves a file URL to prevent Path Traversal.
    Only allows paths managed by Frappe (/files/ and /private/files/).
    Returns the absolute real path.
    """
    if not file_url:
        frappe.throw(_("File URL is required"), frappe.ValidationError)

    # Block obvious traversal sequences in URL
    if ".." in file_url or "~" in file_url:
        frappe.throw(_("Invalid file path"), frappe.ValidationError)

    # Only allow Frappe-managed file paths
    allowed_prefixes = ("/files/", "/private/files/")
    if not any(file_url.startswith(p) for p in allowed_prefixes):
        frappe.throw(_("Only Frappe file paths are allowed"), frappe.ValidationError)

    # Resolve to absolute path
    is_private = file_url.startswith("/private/files/")
    # Strip the prefix to get the relative path inside the public/private folder
    rel_path = file_url.lstrip("/").replace("private/files/", "").replace("files/", "")
    
    resolved = os.path.realpath(frappe.get_site_path("private" if is_private else "public", "files", rel_path))
    site_path = os.path.realpath(frappe.get_site_path())

    # Final check: the resolved real path MUST be inside the site_path
    if not resolved.startswith(site_path):
        frappe.throw(_("File path escapes site directory"), frappe.SecurityException)

    if not os.path.exists(resolved):
        frappe.throw(_("File does not exist on disk"), frappe.DoesNotExistError)

    return resolved

def ensure_session_ownership(session_key: str, user: str = None, session_type: str = "chatbot"):
    """
    Checks if a chatbot or socratic session belongs to the user.
    """
    if not user:
        user = frappe.session.user
        
    if user == "Administrator":
        return

    # Check Socratic
    if session_type == "socratic":
        # Socratic session doc has 'student' field
        student = frappe.db.get_value("Socratic Session", {"session_key": session_key}, "student")
        if student and student != user:
            frappe.throw(_("You do not have permission to access this session"), frappe.PermissionError)
            
    # Check Chatbot
    else:
        # Expected Chatbot session doc has 'student' field
        student = frappe.db.get_value("Chatbot Session", {"session_key": session_key}, "student")
        if student and student != user:
            frappe.throw(_("You do not have permission to access this session"), frappe.PermissionError)
