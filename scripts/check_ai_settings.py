import frappe

def check_settings():
    frappe.init(site="lms.localhost")
    frappe.connect()
    
    settings = frappe.get_doc("LMS AI Settings", "LMS AI Settings")
    print(f"Default Provider: {settings.default_provider}")
    print(f"Default Model: {settings.default_model}")
    
    for row in settings.agent_configs:
        print(f"Agent: {row.agent_name}, Enabled: {row.enabled}, Provider: {row.provider}, Model: {row.model}")

if __name__ == "__main__":
    check_settings()
