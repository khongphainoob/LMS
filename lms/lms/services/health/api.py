import frappe
from frappe import _
import redis

@frappe.whitelist(allow_guest=False)
def check_ai_health():
    """
    Check the health of AI services including Redis queue, LLM API connectivity, and workers.
    """
    frappe.only_for("System Manager")
    
    health = {
        "status": "healthy",
        "redis": "unknown",
        "workers": "unknown",
        "llm_api": "unknown",
        "circuit_breakers": []
    }
    
    # 1. Check Redis
    try:
        r = frappe.cache()
        r.ping()
        health["redis"] = "connected"
    except Exception as e:
        health["status"] = "unhealthy"
        health["redis"] = f"disconnected ({str(e)})"
        
    # 2. Check Workers
    try:
        from rq import Worker
        from frappe.utils.background_jobs import get_redis_conn
        conn = get_redis_conn()
        workers = Worker.all(connection=conn)
        active_workers = len(workers)
        if active_workers == 0:
            health["status"] = "degraded"
            health["workers"] = "0 active workers"
        else:
            health["workers"] = f"{active_workers} active workers"
    except Exception as e:
        health["workers"] = f"error checking workers ({str(e)})"
        
    # 3. Check Circuit Breakers
    try:
        r = frappe.cache()
        # Frappe cache doesn't easily support wildcard keys in its wrapper, but we can try
        # actually we just list known providers
        providers = ["google/gemini-2.5-flash", "anthropic/claude-3-haiku", "openai/gpt-4o-mini", "default"]
        for p in providers:
            if r.get_value(f"ai_circuit_breaker_cooldown_{p}"):
                health["circuit_breakers"].append(p)
                health["status"] = "degraded"
        
        if len(health["circuit_breakers"]) == 0:
            health["llm_api"] = "all circuits closed (healthy)"
        else:
            health["llm_api"] = f"circuits open: {', '.join(health['circuit_breakers'])}"
    except Exception:
        pass
        
    if health["status"] != "healthy":
        frappe.publish_realtime('ai_health_alert', health)
        
    return health
