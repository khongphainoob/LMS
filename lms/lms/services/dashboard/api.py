import frappe
from frappe.utils import now_datetime, add_days

@frappe.whitelist(allow_guest=False)
def get_ai_usage_stats(days=7):
    frappe.only_for('System Manager')
    
    start_date = add_days(now_datetime(), -int(days))
    
    # Get total tokens and cost per agent
    agent_logs = frappe.db.sql("""
        SELECT 
            agent_name, 
            SUM(total_tokens) as total_tokens,
            SUM(total_cost) as total_cost,
            COUNT(name) as total_calls
        FROM `tabAgent Log`
        WHERE creation >= %s
        GROUP BY agent_name
    """, (start_date,), as_dict=True)
    
    # Get error rate
    error_logs = frappe.db.sql("""
        SELECT 
            agent_name,
            COUNT(name) as error_count
        FROM `tabAgent Log`
        WHERE creation >= %s AND status = 'Error'
        GROUP BY agent_name
    """, (start_date,), as_dict=True)
    
    # Get recent errors for the table
    recent_errors = frappe.db.sql("""
        SELECT name, agent_name, error_message, creation
        FROM `tabAgent Log`
        WHERE status = 'Error'
        ORDER BY creation DESC
        LIMIT 10
    """, as_dict=True)
    
    # Daily trend
    daily_trend = frappe.db.sql("""
        SELECT 
            DATE(creation) as date,
            SUM(total_tokens) as total_tokens,
            SUM(total_cost) as total_cost
        FROM `tabAgent Log`
        WHERE creation >= %s
        GROUP BY DATE(creation)
        ORDER BY date ASC
    """, (start_date,), as_dict=True)
    
    return {
        "agent_stats": agent_logs,
        "error_stats": error_logs,
        "daily_trend": daily_trend,
        "recent_errors": recent_errors
    }
