# -*- coding: utf-8 -*-
"""
AI Observability Module

Integrates Langfuse for tracing AI requests, LLM calls, and agent workflows.
Pulls configuration primarily from Frappe Desk (LMS AI Settings), falling back to ENV variables.
"""
import frappe
import os
import logging
from typing import Optional, Any

logger = logging.getLogger(__name__)

def is_langfuse_enabled() -> bool:
    """Check if Langfuse tracing is enabled in settings."""
    try:
        return bool(frappe.db.get_single_value("LMS AI Settings", "enable_langfuse"))
    except Exception:
        return False

def get_langfuse_config():
    """Retrieve Langfuse credentials, prioritizing Frappe Desk over ENV variables."""
    try:
        settings = frappe.get_doc("LMS AI Settings", "LMS AI Settings")
        
        # Priority 1: Frappe Desk Settings
        public_key = settings.get("langfuse_public_key")
        secret_key = settings.get_password("langfuse_secret_key") if settings.get("langfuse_secret_key") else None
        host = settings.get("langfuse_host") or "https://cloud.langfuse.com"
        
        # Priority 2: Environment Variables
        if not public_key:
            public_key = os.environ.get("LANGFUSE_PUBLIC_KEY")
        if not secret_key:
            secret_key = os.environ.get("LANGFUSE_SECRET_KEY")
        if not os.environ.get("LANGFUSE_HOST") and settings.get("langfuse_host"):
             os.environ["LANGFUSE_HOST"] = host
             
        return public_key, secret_key, host
    except Exception as e:
        logger.error(f"Error reading Langfuse config: {e}")
        return None, None, "https://cloud.langfuse.com"

def get_unified_config_dict(agent_name: str = "lms_agent", session_id: str = None, user_id: str = None, tags: list = None) -> dict:
    """
    Returns a config dictionary for LangChain invoke(), containing the Unified Callbacks (Frappe + Langfuse) and metadata.
    """
    # 1. Khởi tạo Frappe Agent Callback (luôn chạy dù Langfuse tắt hay bật)
    try:
        from lms.lms.agents.utils.callbacks import FrappeAgentCallbackHandler
        frappe_cb = FrappeAgentCallbackHandler(agent_name=agent_name, thread_id=session_id, user=user_id)
        callbacks = [frappe_cb]
    except ImportError:
        callbacks = []

    if not is_langfuse_enabled():
        return {"callbacks": callbacks}
        
    public_key, secret_key, host = get_langfuse_config()
    
    if not public_key or not secret_key:
        frappe.logger().warning("Langfuse is enabled but Public/Secret keys are missing.")
        return {"callbacks": callbacks}
        
    try:
        os.environ["LANGFUSE_PUBLIC_KEY"] = public_key
        os.environ["LANGFUSE_SECRET_KEY"] = secret_key
        os.environ["LANGFUSE_HOST"] = host

        from langfuse import Langfuse
        # Force initialization of the client with explicit kwargs to avoid caching old env vars
        Langfuse(public_key=public_key, secret_key=secret_key, host=host)

        from langfuse.langchain import CallbackHandler
        
        langfuse_cb = CallbackHandler(public_key=public_key)
        callbacks.append(langfuse_cb)
        
        return {
            "callbacks": callbacks,
            "metadata": {
                "langfuse_session_id": session_id,
                "langfuse_user_id": user_id or frappe.session.user,
                "langfuse_tags": tags or ["Frappe LMS"]
            }
        }
    except ImportError:
        frappe.logger().error("langfuse package not installed.")
        return {"callbacks": callbacks}
    except Exception as e:
        frappe.logger().error(f"Failed to initialize Langfuse config: {e}")
        return {"callbacks": callbacks}

def flush_langfuse():
    """Flushes all pending Langfuse events to the cloud."""
    try:
        from langfuse import Langfuse
        Langfuse().flush()
    except Exception:
        pass

def init_langfuse_native_sdk():
    """
    Injects Langfuse credentials into the environment for native SDK usage (e.g., langfuse.openai).
    Must be called before importing langfuse.openai.
    """
    if not is_langfuse_enabled():
        return False
        
    public_key, secret_key, host = get_langfuse_config()
    if public_key and secret_key:
        os.environ["LANGFUSE_PUBLIC_KEY"] = public_key
        os.environ["LANGFUSE_SECRET_KEY"] = secret_key
        os.environ["LANGFUSE_HOST"] = host
        return True
    return False
