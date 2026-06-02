import frappe
from frappe.model.document import Document

class LMSAISettings(Document):
    def validate(self):
        if not getattr(self, "kyma_api_key", None) and getattr(self, "kymaapi_api_key", None):
            self.kyma_api_key = self.kymaapi_api_key

    def on_update(self):
        frappe.cache().delete_value("lms_ai_settings")

def get_ai_settings():
    cache_key = "lms_ai_settings"
    settings = frappe.cache().get_value(cache_key)
    
    if not settings:
        settings_doc = frappe.get_single("LMS AI Settings")
        settings = settings_doc.as_dict()
        
        # as_dict() does not include password fields
        settings["default_api_key"] = settings_doc.get_password("default_api_key", raise_exception=False)
        settings["kyma_api_key"] = settings_doc.get_password("kyma_api_key", raise_exception=False)
        
        # Override via frappe.conf or os.environ
        import os
        if frappe.conf.get("ai_default_provider") or os.environ.get("AI_DEFAULT_PROVIDER"):
            settings["default_provider"] = frappe.conf.get("ai_default_provider") or os.environ.get("AI_DEFAULT_PROVIDER")
            
        if frappe.conf.get("ai_default_model") or os.environ.get("AI_DEFAULT_MODEL"):
            settings["default_model"] = frappe.conf.get("ai_default_model") or os.environ.get("AI_DEFAULT_MODEL")
            
        if frappe.conf.get("ai_default_api_key") or os.environ.get("AI_DEFAULT_API_KEY") or os.environ.get("OPENAI_API_KEY"):
            settings["default_api_key"] = frappe.conf.get("ai_default_api_key") or os.environ.get("AI_DEFAULT_API_KEY") or os.environ.get("OPENAI_API_KEY")
            
        if frappe.conf.get("ai_default_base_url") or os.environ.get("AI_DEFAULT_BASE_URL"):
            settings["default_base_url"] = frappe.conf.get("ai_default_base_url") or os.environ.get("AI_DEFAULT_BASE_URL")
        
        # Serialize child tables properly for caching
        agent_configs = []
        for row in settings_doc.get("agent_configs", []):
            agent_configs.append(row.as_dict())
        settings["agent_configs"] = agent_configs
        
        frappe.cache().set_value(cache_key, settings)
        
    return settings

@frappe.whitelist()
def get_registered_agents():
    from lms.lms.agents.registry import get_all_agent_names
    return get_all_agent_names()
