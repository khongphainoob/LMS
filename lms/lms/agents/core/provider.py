# -*- coding: utf-8 -*-
"""
AI Provider Facade

Provides the `get_llm` function used throughout the LMS application, 
acting as a facade for the underlying `provider_adapter.py` and LangChain integration.
"""

import frappe
from lms.lms.agents.core.provider_adapter import get_provider
from langchain_core.callbacks import BaseCallbackHandler

class AICostCallbackHandler(BaseCallbackHandler):
    """
    Thread-safe LangChain callback for AI cost tracking.

    Uses Redis queue to decouple cost recording from LLM threads.
    A periodic background job in services/cost_tracking.py drains the queue.
    This avoids frappe.init()/frappe.connect()/frappe.destroy() in background
    threads which caused race conditions and leaked DB connections.
    """

    def __init__(self, agent_name, cost_info, provider_name, model_name, site_name=None):
        self.agent_name = agent_name
        self.cost_info = cost_info
        self.provider_name = provider_name
        self.model_name = model_name
        self.site_name = site_name or (frappe.local.site if getattr(frappe.local, "site", None) else None)

    def on_llm_end(self, response, **kwargs):
        try:
            prompt_tokens = 0
            completion_tokens = 0

            if response.llm_output and "token_usage" in response.llm_output:
                tu = response.llm_output["token_usage"]
                prompt_tokens = tu.get("prompt_tokens", 0)
                completion_tokens = tu.get("completion_tokens", 0)

            if prompt_tokens == 0 and response.generations:
                for gen_list in response.generations:
                    for gen in gen_list:
                        if hasattr(gen, "message") and gen.message:
                            meta = gen.message.response_metadata or {}
                            if "token_usage" in meta:
                                tu = meta["token_usage"]
                                prompt_tokens += tu.get("prompt_tokens", 0)
                                completion_tokens += tu.get("completion_tokens", 0)
                            elif hasattr(gen.message, "usage_metadata") and gen.message.usage_metadata:
                                prompt_tokens += gen.message.usage_metadata.get("input_tokens", 0)
                                completion_tokens += gen.message.usage_metadata.get("output_tokens", 0)

            cost_in = self.cost_info.get("cost_input", 0) or 0.0
            cost_out = self.cost_info.get("cost_output", 0) or 0.0

            cost = (prompt_tokens * cost_in) + (completion_tokens * cost_out)
            if cost > 0:
                # Thread-safe: enqueue cost event to Redis queue
                # Drained by lms.lms.services.cost_tracking.drain_cost_queue()
                self._enqueue_cost_event(
                    agent=self.agent_name,
                    cost=cost,
                    tokens=prompt_tokens + completion_tokens,
                    provider=self.provider_name,
                    model=self.model_name,
                )
        except Exception as e:
            print(f"Cost Callback Error: {e}")
            pass

    @staticmethod
    def _enqueue_cost_event(agent: str, cost: float, tokens: int, provider: str, model: str):
        """Push cost event to Redis queue for async processing."""
        try:
            import json
            cache = frappe.cache()
            event = json.dumps({
                "agent": agent,
                "cost": cost,
                "tokens": tokens,
                "provider": provider,
                "model": model,
                "timestamp": frappe.utils.now(),
            })
            # LPUSH to queue, background job RPOPs and processes
            cache.redis.lpush("ai_cost_queue", event)
            # Update daily cost counter (atomic INCRBY)
            from datetime import date
            cache.redis.incrbyfloat(
                f"ai_cost:daily:{date.today().isoformat()}", cost
            )
        except Exception:
            pass  # Never crash production on cost tracking failure

def get_llm(task_name: str, temperature: float = 0.3, max_tokens: int = 2048, **kwargs):
    """
    Get the appropriate LLM instance for a specific task.
    Returns: (llm_instance, model_name, cost_info_dict)
    
    This function wraps provider_adapter to provide a BaseChatModel (LangChain) 
    compatible interface or direct adapter instance depending on usage.
    However, since many agents use LangChain/LangGraph, we need to return 
    a LangChain ChatModel.
    """
    
    override_config = kwargs.pop("override_config", None) or {}
    
    # Lấy cấu hình model từ LMS AI Settings (đã cache trong Redis)
    try:
        from lms.lms.doctype.lms_ai_settings.lms_ai_settings import get_ai_settings
        settings = get_ai_settings()
        
        provider_name = settings.get("default_provider") or "openai"
        model_name = settings.get("default_model") or "gpt-4o-mini"
        api_key = settings.get("default_api_key")
        base_url = settings.get("default_base_url")
            
        # Check overrides for specific task_name
        for row in settings.get("agent_configs", []):
            if row.get("agent_name") == task_name and row.get("enabled"):
                if row.get("provider") and row.get("provider") != "(inherit)":
                    provider_name = row.get("provider")
                if row.get("model"):
                    model_name = row.get("model")
                if row.get("temperature") is not None and row.get("temperature") != "":
                    temperature = float(row.get("temperature"))
                if row.get("max_tokens"):
                    max_tokens = int(row.get("max_tokens"))
                break
                
        # Cuối cùng, override bằng override_config truyền vào
        if override_config.get("provider_name"):
            provider_name = override_config.get("provider_name")
        if override_config.get("model_name"):
            model_name = override_config.get("model_name")
        if override_config.get("api_key"):
            api_key = override_config.get("api_key")
        if override_config.get("base_url"):
            base_url = override_config.get("base_url")
        if override_config.get("temperature") is not None:
            temperature = override_config.get("temperature")
        if override_config.get("max_tokens"):
            max_tokens = override_config.get("max_tokens")
            
        provider_name = provider_name.lower()
        if base_url == "":
            base_url = None
            
    except Exception as e:
        frappe.log_error(f"Error reading AI Settings for {task_name}: {e}")
        provider_name = "openai"
        model_name = "gpt-4o-mini"
        api_key = None
        base_url = None
        
    # Lấy thông tin giá token và khởi tạo adapter
    cost_info = {"cost_input": 0, "cost_output": 0}
    raw_adapter = None
    try:
        from lms.lms.agents.core.provider_adapter import get_provider as get_raw_provider
        raw_adapter = get_raw_provider(provider_name, model=model_name, api_key=api_key, base_url=base_url)
        cost_info["cost_input"] = raw_adapter.TOKEN_COSTS.get(model_name, {}).get("input", 0)
        cost_info["cost_output"] = raw_adapter.TOKEN_COSTS.get(model_name, {}).get("output", 0)
    except Exception:
        pass

    # Attach AICostCallbackHandler
    cb = AICostCallbackHandler(task_name, cost_info, provider_name, model_name)
    if "callbacks" in kwargs:
        if isinstance(kwargs["callbacks"], list):
            kwargs["callbacks"].append(cb)
        else:
            kwargs["callbacks"] = [kwargs["callbacks"], cb]
    else:
        kwargs["callbacks"] = [cb]

    # Trả về Langchain Chat Model thông qua raw_adapter
    try:
        llm = raw_adapter.get_langchain_model(temperature=temperature, max_tokens=max_tokens, **kwargs)
    except Exception as e:
        frappe.log_error(f"Failed to init LangChain model for {provider_name}: {e}")
        # Fallback to OpenAI
        from langchain_openai import ChatOpenAI
        llm = ChatOpenAI(api_key=api_key, base_url=base_url, model=model_name, temperature=temperature, max_tokens=max_tokens, **kwargs)
        
    return llm, model_name, cost_info

def extract_usage(response):
    """
    Extract token usage from LangChain response
    """
    usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    try:
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            usage["prompt_tokens"] = response.usage_metadata.get("input_tokens", 0)
            usage["completion_tokens"] = response.usage_metadata.get("output_tokens", 0)
            usage["total_tokens"] = response.usage_metadata.get("total_tokens", 0)
        elif hasattr(response, "response_metadata") and "token_usage" in response.response_metadata:
            tu = response.response_metadata["token_usage"]
            usage["prompt_tokens"] = tu.get("prompt_tokens", 0)
            usage["completion_tokens"] = tu.get("completion_tokens", 0)
            usage["total_tokens"] = tu.get("total_tokens", 0)
    except Exception:
        pass
    return usage

def get_agent_config(agent_name):
    """Return default configuration dictionary for an agent."""
    return {"configurable": {"thread_id": frappe.generate_hash(length=8)}}

def generate_image(prompt: str, **kwargs) -> str:
    """
    Generate an image using the configured image generation provider.
    Returns the URL of the generated image.
    """
    try:
        settings_doc = frappe.get_doc("LMS AI Settings")
        provider_name = settings_doc.get("image_gen_provider", "OpenAI").lower()
        model_name = settings_doc.get("image_gen_model", "dall-e-3")
        api_key = settings_doc.get_password("image_gen_api_key", raise_exception=False)
        base_url = settings_doc.get("image_gen_base_url")
        
        # Fallback to default API key if image API key is not set
        if not api_key:
            api_key = settings_doc.get_password("default_api_key", raise_exception=False)
            
        from lms.lms.agents.core.provider_adapter import get_provider as get_raw_provider
        
        # Instantiate the provider adapter
        provider = get_raw_provider(provider_name, api_key=api_key, base_url=base_url)
        
        # Call generate_image
        return provider.generate_image(prompt, model=model_name, base_url=base_url, **kwargs)
    except Exception as e:
        frappe.log_error(message=f"Image Generation Failed: {str(e)}", title="generate_image Error")
        return ""
