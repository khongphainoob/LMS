import os
import frappe
import logging

logger = logging.getLogger(__name__)

# Load .env file from common locations manually
def _load_env_file():
    paths = [
        frappe.get_app_path("lms", "..", ".env"),
        frappe.get_app_path("lms", "..", "..", "..", ".env") # Bench root
    ]
    loaded = []
    for env_path in paths:
        try:
            if os.path.exists(env_path):
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip()
                            if key and key not in os.environ:
                                os.environ[key] = val
                loaded.append(env_path)
        except Exception:
            pass
    if loaded:
        logger.info(f"Loaded environment variables from: {', '.join(loaded)}")

_load_env_file()

def get_agent_config(agent_name: str, **kwargs) -> dict:
    """
    Reads config from LMS AI Settings.
    Resolution Order: kwargs > Env Vars (Specific) > DB (Agent Row) > DB (Global) > Env Vars (Provider) > Failsafe
    """
    try:
        settings = frappe.get_doc("LMS AI Settings", "LMS AI Settings")
    except Exception:
        settings = None

    # Default Failsafes
    provider = "openrouter" 
    model = "google/gemini-2.5-flash" 
    api_key = None
    base_url = None
    temperature = 0.0
    max_tokens = 4096

    # 1. Global DB Defaults
    if settings:
        provider = settings.default_provider or provider
        model = settings.default_model or model
        try:
            api_key = settings.get_password("default_api_key")
        except Exception:
            pass
        base_url = settings.default_base_url
        
    # 2. Agent Specific Row (Desk)
    agent_row = None
    if settings and hasattr(settings, "agent_configs"):
        for row in settings.agent_configs:
            if row.agent_name == agent_name and row.enabled:
                agent_row = row
                if row.provider and row.provider != "(inherit)":
                    provider = row.provider
                if row.model:
                    model = row.model
                try:
                    row_key = row.get_password("api_key")
                    if row_key:
                        api_key = row_key
                except Exception:
                    pass
                if row.base_url:
                    base_url = row.base_url
                if row.temperature is not None:
                    temperature = row.temperature
                if row.max_tokens:
                    max_tokens = row.max_tokens
                break

    # 3. Environment Variable Overrides (High Priority - Per Agent)
    prefix = agent_name.upper()
    env_provider = os.environ.get(f"{prefix}_PROVIDER")
    if env_provider: provider = env_provider
    
    env_model = os.environ.get(f"{prefix}_MODEL")
    if env_model: model = env_model
    
    env_key = os.environ.get(f"{prefix}_API_KEY")
    if env_key: api_key = env_key

    env_base = os.environ.get(f"{prefix}_BASE_URL")
    if env_base: base_url = env_base

    # 4. Provider-Specific Key Fallbacks (Global Env)
    provider_lower = provider.lower()
    if not api_key:
        if provider_lower in ("google", "gemini"):
            api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        elif provider_lower == "anthropic":
            api_key = os.environ.get("ANTHROPIC_API_KEY")
        elif provider_lower == "openrouter":
            api_key = os.environ.get("OPENROUTER_API_KEY") or os.environ.get("OPENROUTE_API_KEY")
        elif provider_lower == "openai":
            api_key = os.environ.get("OPENAI_API_KEY")
        elif provider_lower == "kyma":
            api_key = os.environ.get("KYMA_API_KEY")
            if not base_url:
                base_url = os.environ.get("KYMA_BASE_URL")

    # 5. Specialized Agent Key Fallbacks (e.g. OCR)
    if not api_key:
        if agent_name == "ocr" and os.environ.get("OCR_API_KEY"):
            # Only use OCR_API_KEY if we don't have a provider key yet
            api_key = os.environ.get("OCR_API_KEY")

    result = {
        "provider": provider_lower,
        "model": model,
        "api_key": api_key,
        "base_url": base_url,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    
    for k, v in kwargs.items():
        if v is not None: result[k] = v
    
    log_key = f"{result['api_key'][:6]}...{result['api_key'][-4:]}" if result.get('api_key') else "MISSING"
    logger.info(f"AI ROUTING [{agent_name}] -> Model: {result['model']}, Provider: {result['provider']}, Key: {log_key}")
            
    return result

def get_mathpix_credentials():
    """Returns mathpix_app_id and mathpix_app_key."""
    app_id = os.environ.get("MATHPIX_APP_ID")
    app_key = os.environ.get("MATHPIX_APP_KEY")
    try:
        settings = frappe.get_doc("LMS AI Settings", "LMS AI Settings")
        if not app_id and hasattr(settings, "mathpix_app_id"):
            app_id = settings.mathpix_app_id
        if not app_key and hasattr(settings, "mathpix_app_key"):
            try:
                app_key = settings.get_password("mathpix_app_key")
            except Exception:
                app_key = getattr(settings, "mathpix_app_key", None)
    except Exception:
        pass
    
    return app_id, app_key

def get_llm(agent_name: str, **kwargs):
    config = get_agent_config(agent_name, **kwargs)
    provider = config["provider"]
    api_key = config.get("api_key")
    
    if not api_key and provider != "ollama":
        msg = f"AI Configuration Error for agent '{agent_name}':\n"
        msg += f"- Provider resolved to: {provider}\n"
        msg += f"- Model resolved to: {config['model']}\n"
        msg += f"- API Key: NOT FOUND in Desk Settings or .env file.\n"
        msg += f"Please ensure you have set an API Key for {provider}."
        frappe.throw(frappe._(msg))

    if provider in ("google", "gemini"):
        from langchain_google_genai import ChatGoogleGenerativeAI
        clean_model = config["model"].replace("google/", "")
        model = ChatGoogleGenerativeAI(
            model=clean_model,
            google_api_key=api_key,
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
        return model, config["model"], config
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        model = ChatOpenAI(
            model=config["model"],
            openai_api_key=api_key,
            openai_api_base=config.get("base_url"),
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
        return wrap_with_circuit_breaker(model, agent_name, provider), config["model"], config
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        clean_model = config["model"].replace("anthropic/", "")
        model = ChatAnthropic(
            model=clean_model,
            anthropic_api_key=api_key,
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
        return model, config["model"], config
    elif provider == "openrouter":
        from langchain_openai import ChatOpenAI
        model = ChatOpenAI(
            model=config["model"],
            openai_api_key=api_key,
            openai_api_base=config.get("base_url") or "https://openrouter.ai/api/v1",
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
        return wrap_with_circuit_breaker(model, agent_name, provider), config["model"], config
    elif provider == "ollama":
        from langchain_openai import ChatOpenAI
        model = ChatOpenAI(
            model=config["model"],
            openai_api_key="ollama",
            openai_api_base=config.get("base_url") or "http://localhost:11434/v1",
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
        return wrap_with_circuit_breaker(model, agent_name, provider), config["model"], config
    else:
        from langchain_openai import ChatOpenAI
        model = ChatOpenAI(
            model=config["model"],
            openai_api_key=api_key,
            openai_api_base=config.get("base_url") or "https://openrouter.ai/api/v1",
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
        return wrap_with_circuit_breaker(model, agent_name, provider), config["model"], config

import time
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage
from typing import List, Any

class CircuitBreakerChatModel(BaseChatModel):
    wrapped_model: BaseChatModel
    agent_name: str
    provider_name: str

    def _generate(self, messages: List[BaseMessage], stop: List[str] | None = None, run_manager: Any | None = None, **kwargs: Any):
        import frappe
        cache = frappe.cache()
        error_key = f"ai_circuit_breaker_errors_{self.provider_name}"
        cooldown_key = f"ai_circuit_breaker_cooldown_{self.provider_name}"
        
        # Check if in cooldown
        if cache.get_value(cooldown_key):
            logger.warning(f"Circuit Breaker OPEN for {self.provider_name}. Using fallback.")
            # In a real scenario, we'd instantiate the fallback model here.
            # For now, we will raise an error to let the orchestrator's retry logic handle it
            # OR we can try to get the default model
            fallback_model = get_llm("fallback_default")
            if hasattr(fallback_model, 'wrapped_model'):
                return fallback_model.wrapped_model._generate(messages, stop, run_manager, **kwargs)
            return fallback_model._generate(messages, stop, run_manager, **kwargs)
            
        try:
            result = self.wrapped_model._generate(messages, stop, run_manager, **kwargs)
            # Reset errors on success
            cache.delete_value(error_key)
            return result
        except Exception as e:
            # Increment error count
            errors = frappe.cache().get_value(error_key) or 0
            errors += 1
            frappe.cache().set_value(error_key, errors)
            
            logger.error(f"Provider {self.provider_name} failed. Error count: {errors}/3. Exception: {str(e)}")
            
            if errors >= 3:
                logger.critical(f"Circuit Breaker TRIPPED for {self.provider_name}. Cooldown for 120s.")
                frappe.cache().set_value(cooldown_key, True, expires_in_sec=120)
                frappe.publish_realtime('ai_service_alert', {"message": f"Provider {self.provider_name} is down. Switched to fallback.", "level": "error"})
                
            raise e

    @property
    def _llm_type(self) -> str:
        return "circuit_breaker_wrapper"
        

    async def _agenerate(self, messages, stop=None, run_manager=None, **kwargs):
        # We should ideally implement async circuit breaking, but for now we delegate directly
        # or use the synchronous thread-pool fallback provided by BaseChatModel.
        # Since wrapped_model might have optimized async, let's delegate to it.
        # However, to keep it safe and track errors, we wrap it.
        import frappe
        cache = frappe.cache()
        error_key = f"ai_circuit_breaker_errors_{self.provider_name}"
        cooldown_key = f"ai_circuit_breaker_cooldown_{self.provider_name}"
        if cache.get_value(cooldown_key):
            fallback_model = get_llm("fallback_default")
            if hasattr(fallback_model, 'wrapped_model'):
                return await fallback_model.wrapped_model._agenerate(messages, stop, run_manager, **kwargs)
            return await fallback_model._agenerate(messages, stop, run_manager, **kwargs)
        try:
            result = await self.wrapped_model._agenerate(messages, stop, run_manager, **kwargs)
            cache.delete_value(error_key)
            return result
        except Exception as e:
            errors = frappe.cache().get_value(error_key) or 0
            errors += 1
            frappe.cache().set_value(error_key, errors)
            if errors >= 3:
                frappe.cache().set_value(cooldown_key, True, expires_in_sec=120)
                frappe.publish_realtime('ai_service_alert', {"message": f"Provider {self.provider_name} is down. Switched to fallback.", "level": "error"})
            raise e

    def _stream(self, messages, stop=None, run_manager=None, **kwargs):
        return self.wrapped_model._stream(messages, stop, run_manager, **kwargs)

    async def _astream(self, messages, stop=None, run_manager=None, **kwargs):
        return self.wrapped_model._astream(messages, stop, run_manager, **kwargs)

    def with_structured_output(self, schema, **kwargs):
        return self.wrapped_model.with_structured_output(schema, **kwargs)
        
    def bind_tools(self, tools, **kwargs):
        return self.wrapped_model.bind_tools(tools, **kwargs)

def wrap_with_circuit_breaker(model, agent_name, provider_name):
    return CircuitBreakerChatModel(wrapped_model=model, agent_name=agent_name, provider_name=provider_name)

def extract_usage(response):
    """Extract token usage from LangChain ChatModel response."""
    usage = {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}
    try:
        if hasattr(response, "response_metadata") and "token_usage" in response.response_metadata:
            tu = response.response_metadata["token_usage"]
            usage["input_tokens"] = tu.get("prompt_tokens", 0)
            usage["output_tokens"] = tu.get("completion_tokens", 0)
            usage["total_tokens"] = tu.get("total_tokens", 0)
        elif hasattr(response, "usage_metadata") and response.usage_metadata:
            um = response.usage_metadata
            usage["input_tokens"] = um.get("input_tokens", 0)
            usage["output_tokens"] = um.get("output_tokens", 0)
            usage["total_tokens"] = um.get("total_tokens", 0)
    except Exception:
        pass
    return usage
