import frappe
from langchain_core.callbacks import BaseCallbackHandler
from lms.lms.doctype.agent_log.agent_log import AgentLog
from lms.lms.agents.provider import extract_usage
import uuid
import logging

logger = logging.getLogger(__name__)

try:
    from langfuse.callback import CallbackHandler as LangfuseCallbackHandler
except ImportError:
    LangfuseCallbackHandler = None

class FrappeAgentCallbackHandler(BaseCallbackHandler):
    """
    Custom LangChain Callback Handler to track node executions and LLM token usage.
    Automatically integrates with Frappe AgentLog and AI Rate Limit mechanisms.
    """
    def __init__(self, agent_name: str, thread_id: str = None, user: str = None):
        self.agent_name = agent_name
        self.thread_id = thread_id or frappe.generate_hash(length=10)
        self.user = user or frappe.session.user
        
    def on_llm_start(self, serialized, prompts, **kwargs):
        try:
            model_name = kwargs.get("invocation_params", {}).get("model", "unknown_model")
            AgentLog.create_log(
                thread_id=self.thread_id,
                level="INFO",
                component=f"{self.agent_name}.llm",
                message=f"Khởi tạo gọi LLM ({model_name})..."
            )
        except Exception:
            pass
        
    def on_llm_end(self, response, **kwargs):
        try:
            # Extract usage
            usage = extract_usage(response)
            total_tokens = usage.get("total_tokens", 0)
            
            # Log to AgentLog
            AgentLog.create_log(
                thread_id=self.thread_id,
                level="INFO",
                component=f"{self.agent_name}.llm",
                message=f"Hoàn thành gọi LLM. Tokens đã sử dụng: {total_tokens}"
            )
            
            # Here you can also tie into an exact Token tracking Doctype if desired.
            if total_tokens > 0:
                pass
        except Exception:
            pass

    def on_llm_error(self, error: BaseException, **kwargs):
        try:
            AgentLog.create_log(
                thread_id=self.thread_id,
                level="ERROR",
                component=f"{self.agent_name}.llm",
                message=f"Lỗi khi gọi LLM: {str(error)}"
            )
        except Exception:
            pass

    def on_chain_start(self, serialized, inputs, **kwargs):
        try:
            node_name = serialized.get("name", "unknown")
            # Filter out generic langgraph overhead chains if needed
            if node_name not in ("LangGraph", "RunnableSequence", "RunnableParallel", "StrOutputParser"):
                AgentLog.create_log(
                    thread_id=self.thread_id,
                    level="INFO",
                    component=f"{self.agent_name}.{node_name}",
                    message=f"Bắt đầu thực thi: {node_name}"
                )
        except Exception:
            pass
            
    def on_chain_end(self, outputs, **kwargs):
        pass

    def on_chain_error(self, error: BaseException, **kwargs):
        try:
            # Node error
            AgentLog.create_log(
                thread_id=self.thread_id,
                level="ERROR",
                component=f"{self.agent_name}",
                message=f"Lỗi hệ thống/Node: {str(error)}"
            )
        except Exception:
            pass

def get_unified_callbacks(agent_name: str, thread_id: str = None, session_id: str = None, user_id: str = None):
    """
    Returns a list of all necessary callback handlers for observability and tracking.
    """
    callbacks = []
    
    # 1. Frappe custom tracking
    frappe_cb = FrappeAgentCallbackHandler(
        agent_name=agent_name, 
        thread_id=thread_id, 
        user=user_id
    )
    callbacks.append(frappe_cb)
    
    # 2. Langfuse Observability
    if LangfuseCallbackHandler is not None:
        try:
            langfuse_cb = LangfuseCallbackHandler(
                session_id=session_id or thread_id or "default_session",
                user_id=user_id or frappe.session.user,
                tags=[agent_name]
            )
            callbacks.append(langfuse_cb)
        except Exception as e:
            logger.warning(f"Could not initialize LangfuseCallbackHandler: {e}")
            
    return callbacks
