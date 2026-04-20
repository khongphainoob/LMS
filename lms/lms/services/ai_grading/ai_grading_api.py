# -*- coding: utf-8 -*-
"""
AI Grading API Endpoints

RESTful API endpoints for AI-powered grading functionality.
Provides endpoints for:
- Triggering grading jobs
- Checking grading status
- Getting grading results and analytics
- Managing grading sessions
"""

import frappe
from frappe import _
from lms.lms.services.ai_grading import AIGradingService, estimate_grading_cost
from lms.lms.utils import has_moderator_role, has_system_manager_role


# ============================================================================
# GRADING EXECUTION ENDPOINTS
# ============================================================================

@frappe.whitelist(methods=["POST"])
def start_ai_grading(submission: str, triggered_by: str = None):
    """
    Start AI grading for a submission.

    This endpoint is non-blocking and returns immediately.
    The actual grading happens in a background job.

    Args:
        submission: Name of AI Grading Submission
        triggered_by: User who triggered the grading

    Returns:
        Dict with success status and job_id
    """
    try:
        service = AIGradingService()

        # Enqueue grading job
        result = service.grade_submission(
            submission_name=submission,
            triggered_by=triggered_by or frappe.session.user
        )

        return {
            "success": result.get("success", False),
            "submission": submission,
            "status": "queued" if result.get("success") else "failed",
            "result": result,
            "message": _("Grading started") if result.get("success") else result.get("error", "Unknown error")
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "AI Grading Error")
        return {
            "success": False,
            "submission": submission,
            "error": str(e)
        }


@frappe.whitelist(methods=["POST"])
def start_batch_ai_grading(session: str, triggered_by: str = None):
    """
    Start AI grading for all pending submissions in a session.

    Returns immediately with count of queued jobs.

    Args:
        session: Name of AI Grading Session
        triggered_by: User who triggered the grading

    Returns:
        Dict with success status and queued count
    """
    try:
        service = AIGradingService()
        result = service.grade_batch(
            session_name=session,
            triggered_by=triggered_by or frappe.session.user
        )

        return {
            "success": result.get("success", False),
            "session": session,
            "queued_count": result.get("queued_count", 0),
            "message": _("{0} submissions queued for grading").format(result.get("queued_count", 0))
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Batch AI Grading Error")
        return {
            "success": False,
            "session": session,
            "error": str(e)
        }


@frappe.whitelist(methods=["GET"])
def get_ai_grading_status(submission: str):
    """
    Get the current grading status of a submission.

    Args:
        submission: Name of AI Grading Submission

    Returns:
        Dict with submission status and details
    """
    try:
        submission_doc = frappe.get_doc("AI Grading Submission", submission)

        return {
            "success": True,
            "submission": submission,
            "status": submission_doc.status,
            "score": submission_doc.score,
            "confidence": submission_doc.ai_confidence,
            "grading_time": submission_doc.grading_time_seconds,
            "retry_count": submission_doc.retry_count,
            "error": submission_doc.last_error,
            "ai_provider": submission_doc.ai_provider,
            "ai_model": submission_doc.ai_model
        }

    except frappe.DoesNotExistError:
        return {
            "success": False,
            "submission": submission,
            "error": _("Submission not found")
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Get Grading Status Error")
        return {
            "success": False,
            "submission": submission,
            "error": str(e)
        }


@frappe.whitelist(methods=["GET"])
def estimate_submission_cost(submission: str):
    """
    Estimate cost for grading a submission.

    Args:
        submission: Name of AI Grading Submission

    Returns:
        Dict with cost estimate
    """
    try:
        result = estimate_grading_cost(submission)

        return {
            "success": True,
            "submission": submission,
            "provider": result["provider"],
            "model": result["model"],
            "estimated_tokens": result["estimated_tokens"],
            "estimated_cost_usd": result["estimated_cost_usd"]
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Cost Estimation Error")
        return {
            "success": False,
            "submission": submission,
            "error": str(e)
        }


@frappe.whitelist(methods=["POST"])
def set_provider_settings(provider: str, model: str = None, api_key: str = None):
    """
    Update AI provider settings for a session.

    Requires Moderator or System Manager role.

    Args:
        provider: Provider name (openai, gemini, anthropic, ollama)
        model: Model name
        api_key: API key (optional, uses stored key if not provided)

    Returns:
        Dict with success status
    """
    try:
        # Check permissions
        if not (has_moderator_role() or has_system_manager_role()):
            return {
                "success": False,
                "error": _("Permission denied")
            }

        settings_doc = frappe.get_doc("LMS AI Settings", "LMS AI Settings")

        if provider == "openai" and api_key:
            settings_doc.openai_api_key = api_key
        elif provider == "gemini" and api_key:
            settings_doc.gemini_api_key = api_key
        elif provider == "anthropic" and api_key:
            settings_doc.anthropic_api_key = api_key
        elif provider == "kyma" and api_key:
            settings_doc.kymaapi_api_key = api_key

        settings_doc.save()

        return {
            "success": True,
            "message": _("Provider settings updated")
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Update Provider Settings Error")
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@frappe.whitelist(methods=["GET"])
def get_ai_grading_analytics(session: str):
    """
    Get analytics for an AI grading session.

    Includes:
    - Submission status breakdown
    - Score distribution
    - Average grading time
    - Total cost
    - AI confidence distribution

    Args:
        session: Name of AI Grading Session

    Returns:
        Dict with analytics data
    """
    try:
        # Get session submissions
        submissions = frappe.get_all(
            "AI Grading Submission",
            filters={"session": session},
            fields=[
                "status", "score", "ai_confidence",
                "grading_time_seconds", "estimated_cost",
                "is_flagged", "ai_provider", "ai_model"
            ]
        )

        # Calculate analytics
        total = len(submissions)
        completed = [s for s in submissions if s["status"] == "Done"]
        pending = [s for s in submissions if s["status"] in ["Pending", "Grading"]]
        flagged = [s for s in submissions if s.get("is_flagged")]

        # Score statistics
        scores = [s["score"] for s in completed if s["score"] is not None]
        avg_score = sum(scores) / len(scores) if scores else 0
        max_score = max(scores) if scores else 0
        min_score = min(scores) if scores else 0

        # Time and cost
        total_time = sum(s["grading_time_seconds"] or 0 for s in completed)
        total_cost = sum(s["estimated_cost"] or 0 for s in completed)

        # Confidence
        confidences = [s["ai_confidence"] or 0 for s in completed]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0

        # Provider breakdown
        provider_breakdown = {}
        for sub in submissions:
            provider = sub.get("ai_provider", "unknown")
            if provider not in provider_breakdown:
                provider_breakdown[provider] = 0
            provider_breakdown[provider] += 1

        return {
            "success": True,
            "session": session,
            "summary": {
                "total_submissions": total,
                "completed": len(completed),
                "pending": len(pending),
                "flagged": len(flagged),
                "completion_rate": (len(completed) / total * 100) if total > 0 else 0
            },
            "scores": {
                "average": avg_score,
                "maximum": max_score,
                "minimum": min_score
            },
            "performance": {
                "average_grading_time": total_time / len(completed) if completed else 0,
                "total_grading_time": total_time,
                "total_cost": total_cost,
                "average_cost_per_submission": total_cost / len(completed) if completed else 0
            },
            "ai_metrics": {
                "average_confidence": avg_confidence,
                "high_confidence_rate": len([c for c in confidences if c > 0.8]) / len(confidences) * 100 if confidences else 0
            },
            "provider_breakdown": provider_breakdown
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Get Grading Analytics Error")
        return {
            "success": False,
            "session": session,
            "error": str(e)
        }


@frappe.whitelist(methods=["GET"])
def get_ai_grading_logs(submission: str = None, session: str = None, limit: int = 50, start: int = 0):
    """
    Get audit logs for AI grading.

    Args:
        submission: Filter by submission
        session: Filter by session
        limit: Maximum results
        start: Starting offset

    Returns:
        List of log entries
    """
    try:
        # Check if AI Grading Log DocType exists
        if not frappe.db.exists("DocType", "AI Grading Log"):
            return {
                "success": True,
                "data": [],
                "message": _("AI Grading Log not available")
            }

        filters = {}
        if submission:
            filters["submission"] = submission
        elif session:
            filters["session"] = session

        logs = frappe.get_all(
            "AI Grading Log",
            filters=filters,
            fields=[
                "name", "action", "ai_provider", "ai_model",
                "new_score", "grading_time_seconds",
                "estimated_cost", "error_message", "created"
            ],
            order_by="created desc",
            limit=limit,
            start=start
        )

        return {
            "success": True,
            "data": logs,
            "count": len(logs)
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Get Grading Logs Error")
        return {
            "success": False,
            "error": str(e)
        }


@frappe.whitelist(methods=["GET"])
def get_cost_tracking(date_from: str = None, date_to: str = None, provider: str = None):
    """
    Get cost tracking data for AI grading.

    Requires System Manager role.

    Args:
        date_from: Start date
        date_to: End date
        provider: Filter by provider

    Returns:
        Dict with cost tracking data
    """
    try:
        # Check permissions
        if not has_system_manager_role():
            return {
                "success": False,
                "error": _("Permission denied")
            }

        # Check if Cost Track DocType exists
        if not frappe.db.exists("DocType", "AI Grading Cost Track"):
            return {
                "success": True,
                "data": [],
                "message": _("Cost tracking not available")
            }

        filters = {}
        if date_from:
            filters["cost_date"] = [">=", date_from]
        if date_to:
            if "cost_date" in filters:
                filters["cost_date"] = ["between", [date_from, date_to]]
            else:
                filters["cost_date"] = ["<=", date_to]
        if provider:
            filters["ai_provider"] = provider

        cost_tracks = frappe.get_all(
            "AI Grading Cost Track",
            filters=filters,
            order_by="cost_date desc"
        )

        # Calculate totals
        total_submissions = sum(ct["submission_count"] for ct in cost_tracks)
        total_tokens = sum(ct["total_tokens"] for ct in cost_tracks)
        total_cost = sum(ct["total_cost_usd"] for ct in cost_tracks)

        return {
            "success": True,
            "data": cost_tracks,
            "summary": {
                "total_submissions": total_submissions,
                "total_tokens": total_tokens,
                "total_cost_usd": total_cost
            }
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Get Cost Tracking Error")
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# AGENT LOG ENDPOINTS
# ============================================================================

@frappe.whitelist(methods=["GET"])
def get_agent_logs(
    thread_id: str = None,
    session_id: str = None,
    submission_id: str = None,
    level: str = None,
    component: str = None,
    limit: int = 100
):
    """
    Get agent logs with filters.

    Args:
        thread_id: Filter by thread ID
        session_id: Filter by session ID
        submission_id: Filter by submission ID
        level: Filter by log level
        component: Filter by component
        limit: Maximum results

    Returns:
        List of agent log entries
    """
    try:
        from lms.lms.doctype.agent_log.agent_log import AgentLog

        logs = AgentLog.get_logs(
            thread_id=thread_id,
            session_id=session_id,
            submission_id=submission_id,
            level=level,
            component=component,
            limit=limit
        )

        return {
            "success": True,
            "data": logs,
            "count": len(logs)
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Get Agent Logs Error")
        return {
            "success": False,
            "error": str(e)
        }


@frappe.whitelist(methods=["GET"])
def get_agent_thread_timeline(thread_id: str):
    """
    Get complete timeline for an agent thread.

    Args:
        thread_id: Thread identifier

    Returns:
        List of log entries in chronological order
    """
    try:
        from lms.lms.doctype.agent_log.agent_log import AgentLog

        timeline = AgentLog.get_thread_timeline(thread_id)

        return {
            "success": True,
            "thread_id": thread_id,
            "timeline": timeline
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Get Agent Timeline Error")
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# GRAPH EXECUTION ENDPOINTS
# ============================================================================

@frappe.whitelist(methods=["POST"])
def run_grading_graph(
    submission_name: str,
    provider: str = "openai",
    model: str = "gpt-4o-mini",
    **kwargs
):
    """
    Run the LangGraph grading workflow for a submission.

    This endpoint executes the full agent graph with:
    - Load submission
    - Split questions
    - Grade with AI
    - Aggregate results
    - Apply review if provided

    Args:
        submission_name: Name of AI Grading Submission
        provider: AI provider to use
        model: Model to use
        **kwargs: Additional graph parameters (rubric, prompt_template, etc.)

    Returns:
        Dict with graph execution result
    """
    try:
        from lms.agents.graphs.grading_graph import build_grading_graph
        from lms.agents.state import AgentState

        # Get submission data
        submission = frappe.get_doc("AI Grading Submission", submission_name)
        session = frappe.get_doc("AI Grading Session", submission.session)

        # Get submission text
        service = AIGradingService()
        source_text = service._extract_submission_text(submission)

        # Get rubric if available
        rubric = None
        if session.rubric:
            rubric = service._get_rubric_data(session.rubric)

        # Build initial state
        initial_state: AgentState = {
            "thread_id": f"grading_{submission_name}",
            "session_id": session.name,
            "submission_id": submission_name,
            "student_id": submission.student,
            "provider": provider,
            "model": model,
            "rubric": rubric,
            "source_text": source_text,
            "prompt_template": kwargs.get("prompt_template", session.ai_notes),
            "status": "running"
        }

        # Build and run graph
        graph = build_grading_graph()
        final_state = graph.invoke(initial_state)

        # Update submission with results
        if final_state.get("status") == "completed":
            submission.score = final_state.get("total_score")
            submission.ai_confidence = 0.7  # Default confidence
            submission.status = "Done"
            submission.save()

        return {
            "success": final_state.get("status") == "completed",
            "submission": submission_name,
            "final_state": final_state,
            "score": final_state.get("total_score"),
            "feedback": final_state.get("final_feedback")
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Run Grading Graph Error")
        return {
            "success": False,
            "submission": submission_name,
            "error": str(e)
        }
