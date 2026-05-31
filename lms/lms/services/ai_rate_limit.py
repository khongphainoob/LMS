import frappe
from frappe.utils import now_datetime
from frappe.utils.caching import redis_cache

class AILimitExceededError(frappe.ValidationError):
    pass

def get_user_tier(user):
    tier_name = frappe.db.get_value("User", user, "ai_subscription_tier")
    if tier_name:
        return tier_name
    
    # Fallback to default tier
    default_tier = frappe.db.get_value("LMS AI Tier", {"is_default": 1}, "name")
    return default_tier

def check_and_record_usage(user, service_type, increment=1):
    """
    Checks if the user has exceeded their AI usage limits for the given service.
    If not, records the usage.
    service_type: 'Chatbot', 'Socratic', 'Document Upload', 'Quiz Gen', 'Rubric Gen', 'Lesson Plan', 'AI Grading'
    """
    # Exclude Administrator from limits
    if user == "Administrator":
        return True

    tier_name = get_user_tier(user)
    if not tier_name:
        # If no tier system is configured, allow usage
        return True

    tier_doc = frappe.get_doc("LMS AI Tier", tier_name)
    
    # Filter limits for this service
    applicable_limits = [limit for limit in tier_doc.limits if limit.service == service_type and limit.max_requests > 0]
    
    if not applicable_limits:
        return True # No limits configured for this service in this tier

    now = now_datetime()
    keys_to_increment = []
    
    # Check all periods before incrementing
    for limit in applicable_limits:
        period = limit.period
        max_requests = limit.max_requests
        
        if period == "Daily":
            time_suffix = now.strftime("%Y-%m-%d")
            ttl = 86400
        elif period == "Weekly":
            time_suffix = now.strftime("%Y-W%W")
            ttl = 86400 * 7
        elif period == "Monthly":
            time_suffix = now.strftime("%Y-%m")
            ttl = 86400 * 31
        else:
            continue
            
        cache_key = f"ai_usage:{service_type}:{period}:{user}:{time_suffix}"
        
        # frappe.cache().get_value returns None if not exists
        current_usage = frappe.cache().get_value(cache_key) or 0
        current_usage = int(current_usage)
        
        if current_usage + increment > max_requests:
            frappe.throw(
                f"You have reached your {period} limit of {max_requests} requests for {service_type} on the '{tier_name}' plan. Please upgrade your subscription to continue.",
                exc=AILimitExceededError,
                title="AI Usage Limit Reached"
            )
            
        keys_to_increment.append({"key": cache_key, "ttl": ttl, "current": current_usage})
        
    # All checks passed, record usage
    for k in keys_to_increment:
        new_val = k["current"] + increment
        frappe.cache().set_value(k["key"], new_val, expires_in_sec=k["ttl"])
        
    # Print to terminal/console as requested
    print(f"\n[AI USAGE LOG] User: '{user}' | Service: '{service_type}' | Consumed: {increment} | Tier: '{tier_name}'")
        
    return True
