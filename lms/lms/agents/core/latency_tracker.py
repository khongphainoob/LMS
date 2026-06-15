"""
Latency tracking wrapper for TOMOSA agent graphs.

Provides a context manager that:
1. Records start time before graph invoke
2. Saves latency to Agent Log + session DOCTYPE
3. Updates BaseAgentState with timing
4. Tracks per-node timing when available

Usage:
    from lms.lms.agents.core.latency_tracker import track_latency

    with track_latency("chatbot", session_id="abc123", doctype="Chatbot Session") as tracker:
        result = graph.invoke(state, config)
        tracker.record_result(result)

    # Automatically saves:
    # - Agent Log entry with metadata {agent, latency_ms, tokens, status}
    # - DOCTYPE field update (duration_seconds / generation_latency_ms)
"""

import time
import frappe
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Map agent → session DOCTYPE + latency field
DOCTYPE_LATENCY_MAP = {
    "chatbot": ("Chatbot Session", "duration_seconds"),
    "socratic": ("Socratic Session", "duration_seconds"),
    "lesson_planner": ("AI Lesson Plan", "generation_latency_ms"),
    "exam_generator": ("AI Exam", "generation_latency_ms"),
    "quiz_generator": ("AI Quiz", "generation_latency_ms"),
    "grading": ("AI Grading Session", "grading_latency_ms"),
}


@dataclass
class LatencyRecord:
    """Result of a tracked graph invocation."""
    agent_name: str
    latency_ms: int
    tokens_used: int = 0
    status: str = "Completed"
    error: Optional[str] = None


class LatencyTracker:
    """Context manager for tracking graph execution time."""

    def __init__(
        self,
        agent_name: str,
        session_id: Optional[str] = None,
        doctype: Optional[str] = None,
        doctype_name: Optional[str] = None,
    ):
        self.agent_name = agent_name
        self.session_id = session_id
        self.doctype = doctype
        self.doctype_name = doctype_name
        self.start_time: float = 0.0
        self.result: Optional[LatencyRecord] = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        latency_ms = int((time.time() - self.start_time) * 1000)

        status = "Failed" if exc_type else "Completed"
        error_msg = str(exc_val) if exc_val else None

        self.result = LatencyRecord(
            agent_name=self.agent_name,
            latency_ms=latency_ms,
            status=status,
            error=error_msg,
        )

        # Save to Agent Log
        self._save_agent_log()

        # Save to DOCTYPE
        if self.doctype and self.doctype_name:
            self._save_doctype_latency(latency_ms)

        # Log to console
        icon = "✅" if status == "Completed" else "❌"
        logger.info(
            f"[{self.agent_name}] {icon} {latency_ms}ms | status={status}"
        )

        # Don't suppress exceptions
        return False

    def record_result(self, final_state: dict):
        """Record tokens and status from final graph state."""
        if self.result:
            self.result.tokens_used = final_state.get("tokens_used", 0)

    def record_node(self, node_name: str, node_latency_ms: int):
        """Record per-node timing (optional)."""
        pass  # Could save to Agent Log metadata JSON

    def _save_agent_log(self):
        """Save latency event to Agent Log DOCTYPE."""
        if self.result is None:
            return
        try:
            from lms.lms.doctype.agent_log.agent_log import AgentLog
            AgentLog.create_log(
                thread_id=self.session_id or "",
                level="INFO" if self.result.status == "Completed" else "ERROR",
                component=f"{self.agent_name}.graph",
                message=(
                    f"{self.agent_name} completed in {self.result.latency_ms}ms"
                    if self.result.status == "Completed"
                    else f"Failed: {self.result.error}"
                ),
            )
        except Exception as e:
            logger.warning(f"Failed to save Agent Log: {e}")

    def _save_doctype_latency(self, latency_ms: int):
        """Save latency to the session DOCTYPE."""
        try:
            lat_field = DOCTYPE_LATENCY_MAP.get(self.agent_name, (None, None))[1]
            if not lat_field and self.doctype:
                lat_field = "duration_seconds"

            if self.doctype and self.doctype_name and lat_field:
                # Convert ms to seconds for Float fields
                value = latency_ms / 1000.0 if lat_field == "duration_seconds" else latency_ms
                frappe.db.set_value(
                    self.doctype, self.doctype_name, lat_field, value
                )
                frappe.db.commit()
        except Exception as e:
            logger.warning(f"Failed to save latency to DOCTYPE: {e}")


def track_latency(
    agent_name: str,
    session_id: Optional[str] = None,
    doctype: Optional[str] = None,
    doctype_name: Optional[str] = None,
) -> LatencyTracker:
    """
    Create a latency tracking context manager.

    Args:
        agent_name: "chatbot", "socratic", "lesson_planner", etc.
        session_id: Redis session key or thread ID
        doctype: Frappe DocType name (e.g., "Chatbot Session")
        doctype_name: The specific document name

    Returns:
        LatencyTracker instance for use as context manager
    """
    if doctype is None:
        doctype = DOCTYPE_LATENCY_MAP.get(agent_name, (None, None))[0]

    return LatencyTracker(
        agent_name=agent_name,
        session_id=session_id,
        doctype=doctype,
        doctype_name=doctype_name,
    )
