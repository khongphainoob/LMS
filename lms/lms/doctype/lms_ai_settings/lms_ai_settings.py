import frappe
from frappe.model.document import Document

class LMSAISettings(Document):
    def validate(self):
        if not getattr(self, "kyma_api_key", None) and getattr(self, "kymaapi_api_key", None):
            self.kyma_api_key = self.kymaapi_api_key


def get_ai_settings():
    settings = frappe.get_single("LMS AI Settings")
    return settings.as_dict()
