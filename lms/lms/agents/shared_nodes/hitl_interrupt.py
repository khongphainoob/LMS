"""
Reusable Human-in-the-Loop (HITL) interrupt node.

Generalized from lesson_planner/nodes/human_review.py.
Any orchestrator can insert this node to pause execution
and wait for teacher review before proceeding.

Usage:
    from lms.lms.agents.shared_nodes import hitl_review_node, HITLConfig

    config = HITLConfig(
        doctype="AI Lesson Plan",
        max_revisions=3,
        review_event="lesson_plan_review",
    )
    result = hitl_review_node(state, config)
    # Returns {"review_status": "approved" | "revised", ...}
"""

import frappe
from typing import Optional, Dict, Any, Callable
from dataclasses import dataclass, field
from langgraph.types import interrupt


@dataclass
class HITLConfig:
    """Configuration for the HITL review node.

    Parameterize per-agent: different doctypes, max revisions,
    notification templates, and state field mappings.
    """
    # Agent identity
    agent_name: str = "default"

    # Frappe DocType for saving draft state
    doctype: str = ""
    doc_name_field: str = "plan_doc_name"       # State field for document name

    # Review limits
    max_revisions: int = 3                       # Auto-approve after this many
    review_count_field: str = "review_count"     # State field for count

    # State field mappings
    content_field: str = "lesson_content"        # Field containing the content to review
    status_field: str = "status"                 # Status field
    review_status_field: str = "review_status"   # Review result field
    feedback_field: str = "review_feedback"      # Teacher feedback field

    # Processing status to set on auto-approve
    auto_approve_status: str = "Illustrating"

    # Notification config
    notification_subject_template: str = "⏳ Cần duyệt: {topic}"
    notification_body_template: str = (
        "AI đã soạn thảo xong bản nháp cho <b>{topic}</b>. "
        "Vui lòng xem xét và phê duyệt. (Lần {count}/{max})"
    )
    notification_link: str = ""                   # LMS route for review page
    notification_user_field: str = "teacher"      # State field for target user

    # Realtime event
    review_event: str = "content_review"          # Frappe realtime event name

    # Topic for notifications
    topic_field: str = "topic"                    # State field for topic name

    # Custom DB save callback (optional)
    save_draft_callback: Optional[Callable] = None  # Called before interrupt

    # Custom approve callback (optional)
    on_approve_callback: Optional[Callable] = None  # Called on teacher approval


def hitl_review_node(state: dict, config: HITLConfig = None) -> dict:
    """
    Reusable HITL review node for any LangGraph agent.

    Pauses graph execution via interrupt(), persists state to DB,
    notifies the teacher, and waits for resume with action.

    Resume actions:
        {"action": "approve", "feedback": "..."}
        {"action": "edit", "edited_content": "...", "feedback": "..."}

    Args:
        state: Agent state dict
        config: HITLConfig (uses defaults if None)

    Returns:
        Dict with review_status, review_feedback, review_count, status
    """
    config = config or HITLConfig()

    teacher_id = state.get(config.notification_user_field, "")
    doc_name = state.get(config.doc_name_field, "")
    review_count = state.get(config.review_count_field, 0) + 1
    content = state.get(config.content_field, "")
    topic = state.get(config.topic_field, doc_name)

    # Auto-approve if max revisions reached
    if review_count > config.max_revisions:
        if doc_name and config.doctype:
            try:
                frappe.db.set_value(config.doctype, doc_name, config.status_field, config.auto_approve_status)
                frappe.db.commit()
                frappe.publish_realtime(config.review_event, {
                    "doc_name": doc_name,
                    "status": config.auto_approve_status,
                    "message": f"Đã đạt giới hạn {config.max_revisions} lần chỉnh sửa, hệ thống tự động chốt.",
                })
            except Exception:
                pass

        return {
            config.review_status_field: "approved",
            config.status_field: "approved",
            config.review_count_field: review_count,
        }

    # Save draft and notify teacher
    try:
        if doc_name and config.doctype:
            # Custom save callback if provided
            if config.save_draft_callback:
                config.save_draft_callback(state, config, doc_name)
            else:
                # Default: save content as review_draft
                frappe.db.set_value(config.doctype, doc_name, {
                    "review_draft": content,
                    config.status_field: "Review",
                })
                frappe.db.commit()

            # Send notification
            try:
                from lms.lms.services.hitl.notification import notify_user_direct
                notify_user_direct(
                    for_user=teacher_id,
                    subject=config.notification_subject_template.format(topic=topic),
                    email_content=config.notification_body_template.format(
                        topic=topic, count=review_count, max=config.max_revisions
                    ),
                    document_type=config.doctype,
                    document_name=doc_name,
                    link=config.notification_link,
                )
            except ImportError:
                pass

            # Publish realtime
            frappe.publish_realtime(config.review_event, {
                "doc_name": doc_name,
                "status": "Review",
                "message": f"Nội dung nháp đã sẵn sàng để bạn duyệt. (Lần {review_count}/{config.max_revisions})",
            }, user=teacher_id)

    except Exception as e:
        frappe.log_error(f"Error in HITL Node ({config.agent_name}): {e}", f"HITL {config.agent_name}")

    # Pause — wait for teacher resume
    review_result = interrupt({
        "content": content,
        "doc_name": doc_name,
        "agent_name": config.agent_name,
        "message": f"Vui lòng xem lại bản soạn thảo. (Lần {review_count}/{config.max_revisions})",
    })

    # Process resume
    action = review_result.get("action", "approve")
    feedback = review_result.get("feedback", "")
    edited_content = review_result.get("edited_content")

    if action == "approve":
        if config.on_approve_callback:
            config.on_approve_callback(state, config)
        return {
            config.review_status_field: "approved",
            config.feedback_field: feedback,
            config.status_field: "approved",
            config.review_count_field: review_count,
        }
    elif action == "edit" and edited_content:
        return {
            config.content_field: edited_content,
            config.review_status_field: "revised",
            config.feedback_field: feedback,
            config.status_field: "revised",
            config.review_count_field: review_count,
        }

    # Default: approve
    return {
        config.review_status_field: "approved",
        config.status_field: "approved",
        config.review_count_field: review_count,
    }
