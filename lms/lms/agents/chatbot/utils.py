import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI


def get_llm(model_type="flash", temperature=0):
    """
    Returns (llm_instance, model_name) based on available configuration.
    Prioritizes Google Gemini, fallbacks to OpenRouter.
    """
    google_key = frappe.conf.get("google_api_key")
    openrouter_key = frappe.conf.get("openrouter_api_key")
    
    # Preferred model names
    gemini_model = "gemini-1.5-flash" if model_type == "flash" else "gemini-1.5-flash-8b"
    openrouter_model = "google/gemini-flash-1.5" # Default for OpenRouter
    
    # 1. Use Google Native if key exists
    if google_key:
        llm = ChatGoogleGenerativeAI(
            model=gemini_model,
            google_api_key=google_key,
            temperature=temperature
        )
        return llm, gemini_model
    
    # 2. Use OpenRouter if key exists
    if openrouter_key:
        llm = ChatOpenAI(
            model=openrouter_model,
            openai_api_key=openrouter_key,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=temperature,
            default_headers={
                "HTTP-Referer": "https://lms.frappe.io",
                "X-Title": "Frappe LMS Chatbot"
            }
        )
        return llm, openrouter_model
    
    # 3. Fail-safe
    frappe.throw("No AI API keys configured. Please add google_api_key or openrouter_api_key to site_config.json")
