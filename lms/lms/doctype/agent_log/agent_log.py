# -*- coding: utf-8 -*-
import frappe
from frappe.model.document import Document


class AgentLog(Document):
    """Agent Log Document Controller for tracking agent activities."""

    def autoname(self):
        """Auto-generate name from hash of key fields."""
        if self.name == "New Agent Log" or not self.name:
            import hashlib
            hash_string = f"{self.thread_id}_{self.session_id or ''}_{self.submission_id or ''}_{self.timestamp}"
            self.name = hashlib.md5(hash_string.encode()).hexdigest()[:16]

    def before_save(self):
        """Process metadata before saving."""
        if self.metadata:
            # Ensure metadata is valid JSON
            import json
            if isinstance(self.metadata, dict):
                self.metadata = json.dumps(self.metadata)

    def before_insert(self):
        """Set default component if not provided."""
        if not self.component:
            self.component = "agent"

    @staticmethod
    def create_log(
        thread_id: str,
        level: str,
        component: str,
        message: str,
        session_id: str = None,
        submission_id: str = None,
        metadata: dict = None,
        error_details: str = None
    ):
        """
        Convenience method to create an Agent Log entry.

        Args:
            thread_id: Unique thread identifier
            level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            component: Component name (agent, langgraph, langsmith, etc.)
            message: Log message
            session_id: Optional session ID
            submission_id: Optional submission ID
            metadata: Additional JSON metadata
            error_details: Optional error traceback/details
        """
        log = frappe.get_doc({
            "doctype": "Agent Log",
            "thread_id": thread_id,
            "level": level,
            "component": component,
            "message": message,
            "timestamp": frappe.utils.now(),
            "session_id": session_id,
            "submission_id": submission_id,
            "metadata": json.dumps(metadata) if metadata else "{}",
            "error_details": error_details or ""
        })
        log.insert(ignore_permissions=True)
        frappe.db.commit()
        return log.name

    @staticmethod
    def get_logs(
        thread_id: str = None,
        session_id: str = None,
        submission_id: str = None,
        level: str = None,
        component: str = None,
        limit: int = 100,
        offset: int = 0
    ):
        """
        Query logs with filters.

        Args:
            thread_id: Filter by thread ID
            session_id: Filter by session ID
            submission_id: Filter by submission ID
            level: Filter by log level
            component: Filter by component
            limit: Maximum results
            offset: Starting offset

        Returns:
            List of AgentLog documents
        """
        filters = {}
        if thread_id:
            filters["thread_id"] = thread_id
        if session_id:
            filters["session_id"] = session_id
        if submission_id:
            filters["submission_id"] = submission_id
        if level:
            filters["level"] = level
        if component:
            filters["component"] = component

        return frappe.get_all(
            "Agent Log",
            filters=filters,
            fields=["*"],
            order_by="timestamp DESC",
            limit=limit,
            start=offset
        )

    @staticmethod
    def get_thread_timeline(thread_id: str) -> list:
        """
        Get all logs for a thread as a timeline.

        Args:
            thread_id: Thread identifier

        Returns:
            List of log entries in chronological order
        """
        logs = frappe.get_all(
            "Agent Log",
            filters={"thread_id": thread_id},
            fields=["*"],
            order_by="timestamp ASC"
        )

        # Build timeline with state changes
        timeline = []
        for log in logs:
            timeline.append({
                "timestamp": log["timestamp"],
                "level": log["level"],
                "component": log["component"],
                "message": log["message"],
                "metadata": log.get("metadata"),
                "error": log.get("error_details")
            })

        return timeline
