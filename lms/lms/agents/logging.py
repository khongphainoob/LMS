"""
Agent Logging Module for Frappe LMS

Provides centralized logging for agents, LangGraph, and LangSmith traces.
Logs are stored in Frappe DocType 'Agent Log' for traceability and debugging.
"""

import json
import frappe
from datetime import datetime
from typing import Dict, Any, Optional


class AgentLogger:
    """
    Logger class for agent activities, LangGraph state changes, and LangSmith traces.

    Usage:
        logger = AgentLogger(thread_id="abc123", session_id="sess001")
        logger.log("INFO", "agent", "Node started", {"node": "load_submission"})
    """

    def __init__(self, thread_id: str, session_id: Optional[str] = None, submission_id: Optional[str] = None):
        self.thread_id = thread_id
        self.session_id = session_id
        self.submission_id = submission_id

    def log(
        self,
        level: str,  # INFO, ERROR, WARNING, DEBUG
        component: str,  # agent, langgraph, langsmith
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
        error_details: Optional[str] = None
    ):
        """
        Log an event to Frappe DocType 'Agent Log'.

        Args:
            level: Log level (INFO, ERROR, etc.)
            component: Component name (agent, langgraph, langsmith)
            message: Log message
            metadata: Additional JSON metadata
            error_details: Error traceback or details
        """
        try:
            log_doc = frappe.get_doc({
                "doctype": "Agent Log",
                "thread_id": self.thread_id,
                "session_id": self.session_id,
                "submission_id": self.submission_id,
                "timestamp": datetime.now(),
                "level": level.upper(),
                "component": component.lower(),
                "message": message,
                "metadata": json.dumps(metadata or {}),
                "error_details": error_details or ""
            })
            log_doc.insert(ignore_permissions=True)
            frappe.db.commit()
        except Exception as e:
            # Fallback to print if Frappe logging fails
            print(f"[AGENT LOG ERROR] Failed to log: {e}")
            print(f"[AGENT LOG] {level} {component}: {message}")

    def info(self, component: str, message: str, metadata: Optional[Dict] = None):
        self.log("INFO", component, message, metadata)

    def error(self, component: str, message: str, metadata: Optional[Dict] = None, error_details: Optional[str] = None):
        self.log("ERROR", component, message, metadata, error_details)

    def warning(self, component: str, message: str, metadata: Optional[Dict] = None):
        self.log("WARNING", component, message, metadata)

    def debug(self, component: str, message: str, metadata: Optional[Dict] = None):
        self.log("DEBUG", component, message, metadata)


# Global logger instance (can be initialized per thread)
def get_logger(thread_id: str, session_id: Optional[str] = None, submission_id: Optional[str] = None) -> AgentLogger:
    return AgentLogger(thread_id, session_id, submission_id)


# LangGraph Callback Handler for automatic logging
class LangGraphLoggingCallback:
    """
    Callback handler to log LangGraph events automatically.
    Attach to graph compilation.
    """

    def __init__(self, logger: AgentLogger):
        self.logger = logger

    def on_node_start(self, node_name: str, state: Dict):
        self.logger.info("langgraph", f"Node '{node_name}' started", {"state_keys": list(state.keys())})

    def on_node_end(self, node_name: str, state: Dict, result: Any):
        self.logger.info("langgraph", f"Node '{node_name}' completed", {"result_type": type(result).__name__})

    def on_graph_start(self, graph_name: str):
        self.logger.info("langgraph", f"Graph '{graph_name}' started")

    def on_graph_end(self, graph_name: str, final_state: Dict):
        self.logger.info("langgraph", f"Graph '{graph_name}' completed", {"final_score": final_state.get("total_score")})

    def on_error(self, node_name: str, error: Exception):
        self.logger.error("langgraph", f"Error in node '{node_name}'", error_details=str(error))


# LangSmith Tracing Setup (if enabled)
def setup_langsmith_tracing(api_key: Optional[str] = None, project_name: str = "lms-agents"):
    """
    Enable LangSmith tracing for LangGraph runs.

    Set environment variables or pass api_key.
    Traces will be sent to LangSmith cloud for visualization.
    """
    if api_key:
        import os
        os.environ["LANGCHAIN_API_KEY"] = api_key
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_PROJECT"] = project_name
    else:
        # Assume env vars are set
        pass

    # Import here to avoid dependency if not used
    from langsmith import Client
    client = Client()
    return client


# Example usage in nodes
def example_node_usage():
    logger = get_logger("thread123", "session456", "sub789")

    # Log node start
    logger.info("agent", "Starting load_submission node", {"submission_id": "sub789"})

    try:
        # Node logic here
        result = {"status": "loaded"}
        logger.info("agent", "Submission loaded successfully", {"result": result})
        return result
    except Exception as e:
        logger.error("agent", "Failed to load submission", error_details=str(e))
        raise