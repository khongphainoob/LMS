from __future__ import annotations

import importlib
from typing import Any, Dict


def frappe_get_doc(doctype: str, name: str) -> Dict[str, Any]:
    """Thin wrapper so graph nodes can be tested/mocked outside Frappe runtime."""
    try:
        frappe = importlib.import_module("frappe")
    except ImportError as error:
        raise ValueError("frappe package is required in runtime environment") from error

    doc = frappe.get_doc(doctype, name)
    return doc.as_dict()


def frappe_update_submission_result(submission_doctype: str, submission_name: str, score: float, feedback: str) -> bool:
    try:
        frappe = importlib.import_module("frappe")
    except ImportError as error:
        raise ValueError("frappe package is required in runtime environment") from error

    doc = frappe.get_doc(submission_doctype, submission_name)
    doc.score = score
    doc.ai_feedback = feedback
    doc.save()
    frappe.db.commit()
    return True
