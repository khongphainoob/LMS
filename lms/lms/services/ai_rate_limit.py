import frappe
from frappe.utils import now_datetime
from frappe.utils.caching import redis_cache

class AILimitExceededError(frappe.ValidationError):
    pass

def init_default_tiers():
    """Tự động khởi tạo 3 mức Tier cơ bản nếu chưa có."""
    if frappe.cache().get_value("lms_ai_tiers_initialized") or frappe.db.count("LMS AI Tier") > 0:
        frappe.cache().set_value("lms_ai_tiers_initialized", True, expires_in_sec=3600)
        return
        
    tiers = [
        {"name": "Free", "is_default": 1, "limits": [
            {"service": "Chatbot", "period": "Daily", "max_requests": 20},
            {"service": "Quiz Gen", "period": "Daily", "max_requests": 5},
            {"service": "Lesson Plan", "period": "Daily", "max_requests": 5},
            {"service": "Rubric Gen", "period": "Daily", "max_requests": 5},
            {"service": "Socratic", "period": "Daily", "max_requests": 20}
        ]},
        {"name": "Plus", "is_default": 0, "limits": [
            {"service": "Chatbot", "period": "Daily", "max_requests": 100},
            {"service": "Quiz Gen", "period": "Daily", "max_requests": 30},
            {"service": "Lesson Plan", "period": "Daily", "max_requests": 30},
            {"service": "Rubric Gen", "period": "Daily", "max_requests": 30},
            {"service": "Socratic", "period": "Daily", "max_requests": 100}
        ]},
        {"name": "Pro", "is_default": 0, "limits": [
            {"service": "Chatbot", "period": "Daily", "max_requests": 500},
            {"service": "Quiz Gen", "period": "Daily", "max_requests": 150},
            {"service": "Lesson Plan", "period": "Daily", "max_requests": 150},
            {"service": "Rubric Gen", "period": "Daily", "max_requests": 150},
            {"service": "Socratic", "period": "Daily", "max_requests": 500}
        ]}
    ]
    
    for t in tiers:
        try:
            doc = frappe.get_doc({
                "doctype": "LMS AI Tier",
                "tier_name": t["name"],
                "is_default": t["is_default"]
            })
            for limit in t["limits"]:
                doc.append("limits", limit)
            doc.insert(ignore_permissions=True)
        except Exception as e:
            pass
            
    frappe.db.commit()

def get_user_tier(user):
    cache_key = f"lms_ai_tier:{user}"
    cached_tier = frappe.cache().get_value(cache_key)
    if cached_tier:
        return cached_tier

    init_default_tiers()
    
    tier_name = None
    # 1. Kiểm tra xem User có được gán trong bảng LMS AI Tier User không
    try:
        if frappe.db.exists("LMS AI Tier User", user):
            tier_name = frappe.db.get_value("LMS AI Tier User", user, "ai_tier")
    except Exception as e:
        frappe.log_error(f"Error getting AI Tier for user {user}: {e}", "AI Rate Limit")
    
    if not tier_name:
        # 2. Fallback to default tier (Free)
        tier_name = frappe.db.get_value("LMS AI Tier", {"is_default": 1}, "name") or "Free"
        
    frappe.cache().set_value(cache_key, tier_name, expires_in_sec=300)
    return tier_name

def check_and_record_usage(user, service_type, increment=1):
    """
    Checks if the user has exceeded their AI usage limits for the given service.
    If not, records the usage.
    service_type: 'Chatbot', 'Socratic', 'Document Upload', 'Quiz Gen', 'Rubric Gen', 'Lesson Plan', 'AI Grading'
    """
    # We check budget FIRST before allowing Administrator bypass
    # 1. Kiểm tra ngân sách ngày toàn hệ thống (Daily Budget Limit)
    try:
        from lms.lms.services.cost_tracking import CostTrackingService
        from datetime import date
        
        tracker = CostTrackingService()
        today_str = date.today().isoformat()
        daily_cost_key = f"ai_cost:daily:{today_str}"
        
        current_daily_cost = float(frappe.cache().get_value(daily_cost_key) or 0.0)
        max_daily = tracker._get_max_cost_per_day()
        
        if current_daily_cost >= max_daily:
            frappe.throw(
                f"Hệ thống AI đã vượt quá hạn mức ngân sách ngày cho phép ({max_daily} USD). Vui lòng thử lại vào ngày mai hoặc liên hệ Quản trị viên.",
                title="Hạn mức ngân sách hệ thống đã hết"
            )
    except Exception as e:
        frappe.log_error(f"Cost Tracking Error: {str(e)}\n{frappe.get_traceback()}", "Rate Limit Budget Check")
        pass # allow to continue if cost tracking fails
        if isinstance(e, frappe.ValidationError):
            raise e
        frappe.log_error(frappe.get_traceback(), "Rate Limit Check Failed")

    # Exclude Administrator from personal limits
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
        
        # Dùng get_value/set_value thay vì redis_server trực tiếp để tránh lỗi
        current_usage = frappe.cache().get_value(cache_key)
        current_usage = int(current_usage) if current_usage else 0
        
        if current_usage + increment > max_requests:
            frappe.throw(
                f"You have reached your {period} limit of {max_requests} requests for {service_type} on the '{tier_name}' plan. Please upgrade your subscription to continue.",
                exc=AILimitExceededError,
                title="AI Usage Limit Reached"
            )
            
        keys_to_increment.append({"key": cache_key, "ttl": ttl})
        
    # All checks passed, record usage
    for k in keys_to_increment:
        old_val = frappe.cache().get_value(k["key"])
        old_val = int(old_val) if old_val else 0
        new_val = old_val + increment
        frappe.cache().set_value(k["key"], new_val, expires_in_sec=k["ttl"])

        
    # Print to terminal/console as requested
    print(f"\n[AI USAGE LOG] User: '{user}' | Service: '{service_type}' | Consumed: {increment} | Tier: '{tier_name}'")
        
    return True
