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
    model = "google/gemini-1.5-flash" 
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
        return ChatGoogleGenerativeAI(
            model=clean_model,
            google_api_key=api_key,
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=config["model"],
            openai_api_key=api_key,
            openai_api_base=config.get("base_url"),
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        clean_model = config["model"].replace("anthropic/", "")
        return ChatAnthropic(
            model=clean_model,
            anthropic_api_key=api_key,
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
    elif provider == "openrouter":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=config["model"],
            openai_api_key=api_key,
            openai_api_base=config.get("base_url") or "https://openrouter.ai/api/v1",
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
    elif provider == "ollama":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=config["model"],
            openai_api_key="ollama",
            openai_api_base=config.get("base_url") or "http://localhost:11434/v1",
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
    else:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=config["model"],
            openai_api_key=api_key,
            openai_api_base=config.get("base_url") or "https://openrouter.ai/api/v1",
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )
