import frappe
from frappe.utils import now_datetime, add_days

AGENT_TO_SERVICE_MAP = {
    # Grading
    "grading_mcq": "Grading",
    "grading_rubric": "Grading",
    "grading_logic": "Grading",
    "grading_reviewer": "Grading",
    "grading_aggregator": "Grading",
    "grading_visual": "Grading",
    "visual_analysis": "Grading",
    
    # Lesson Planner
    "lesson_planner": "Lesson Planner",
    
    # Exam
    "exam_generator": "Exam Generator",
    "exam_generator_section": "Exam Generator",
    "exam_generator_section.llm": "Exam Generator",
    
    # Chatbot / Socratic
    "chatbot": "Chatbot & Socratic",
    "socratic_tutor": "Chatbot & Socratic",
    "socratic_hint": "Chatbot & Socratic",
    "socratic_evaluator": "Chatbot & Socratic",
    
    # Document RAG / Tools
    "tools_ocr": "Document RAG & Tools",
    "tools_ocr_cleaner": "Document RAG & Tools",
    "document_rag": "Document RAG & Tools"
}

@frappe.whitelist(allow_guest=False)
def get_ai_usage_stats(days=7):
    frappe.only_for('System Manager')
    
    start_date = add_days(now_datetime(), -int(days))
    
    # 1. Get stats for each agent from tabAI Grading Cost Track
    raw_agent_logs = frappe.db.sql("""
        SELECT 
            session as agent_name, 
            SUM(total_tokens) as total_tokens,
            SUM(total_cost) as total_cost,
            COUNT(name) as total_calls
        FROM `tabAI Grading Cost Track`
        WHERE cost_date >= %s
        GROUP BY session
    """, (start_date.date(),), as_dict=True)
    
    # If empty, fallback to get agent configs directly
    if not raw_agent_logs:
        agent_configs = frappe.get_all("AI Agent Config", fields=["agent_name", "cost"])
        raw_agent_logs = [
            {
                "agent_name": ac.agent_name,
                "total_tokens": 0,
                "total_cost": ac.cost or 0.0,
                "total_calls": 0
            } for ac in agent_configs
        ]
        
    # Group agent stats by Service Map
    aggregated_stats = {}
    for log in raw_agent_logs:
        agent_name = log.get("agent_name") or "other"
        service = AGENT_TO_SERVICE_MAP.get(agent_name, agent_name.replace("_", " ").title())
        
        if service not in aggregated_stats:
            aggregated_stats[service] = {
                "agent_name": service,
                "total_tokens": 0,
                "total_cost": 0.0,
                "total_calls": 0
            }
        
        aggregated_stats[service]["total_tokens"] += int(log.get("total_tokens") or 0)
        aggregated_stats[service]["total_cost"] += float(log.get("total_cost") or 0.0)
        aggregated_stats[service]["total_calls"] += int(log.get("total_calls") or 0)
        
    agent_logs = list(aggregated_stats.values())
    
    # 2. Get error rate per agent component from tabAgent Log
    raw_error_logs = frappe.db.sql("""
        SELECT 
            component as agent_name,
            COUNT(name) as error_count
        FROM `tabAgent Log`
        WHERE creation >= %s AND level = 'ERROR'
        GROUP BY component
    """, (start_date,), as_dict=True)
    
    # Group error stats by Service Map
    aggregated_errors = {}
    for err in raw_error_logs:
        agent_name = err.get("agent_name") or "other"
        service = AGENT_TO_SERVICE_MAP.get(agent_name, agent_name.replace("_", " ").title())
        
        if service not in aggregated_errors:
            aggregated_errors[service] = {
                "agent_name": service,
                "error_count": 0
            }
        aggregated_errors[service]["error_count"] += int(err.get("error_count") or 0)
        
    error_logs = list(aggregated_errors.values())
    
    # 3. Get recent errors for the table from tabAgent Log
    recent_errors = frappe.db.sql("""
        SELECT name, component as agent_name, message as error_message, creation
        FROM `tabAgent Log`
        WHERE level = 'ERROR'
        ORDER BY creation DESC
        LIMIT 10
    """, as_dict=True)
    
    # Map agent name to high-level Service Name in recent errors
    for err in recent_errors:
        agent_name = err.get("agent_name") or "other"
        err["agent_name"] = AGENT_TO_SERVICE_MAP.get(agent_name, agent_name.replace("_", " ").title())
    
    # 4. Daily trend from tabAI Grading Cost Track
    daily_trend = frappe.db.sql("""
        SELECT 
            cost_date as date,
            SUM(total_tokens) as total_tokens,
            SUM(total_cost) as total_cost
        FROM `tabAI Grading Cost Track`
        WHERE cost_date >= %s
        GROUP BY cost_date
        ORDER BY date ASC
    """, (start_date.date(),), as_dict=True)
    
    # 5. Get Evaluation Stats
    eval_stats_raw = frappe.db.sql("""
        SELECT service_type, AVG(rating) as avg_rating, COUNT(name) as total_reviews
        FROM `tabAI Evaluation`
        WHERE creation >= %s
        GROUP BY service_type
    """, (start_date,), as_dict=True)

    recent_feedbacks = frappe.db.sql("""
        SELECT service_type, user, rating, feedback, creation, reference_id
        FROM `tabAI Evaluation`
        WHERE feedback IS NOT NULL AND feedback != ''
        ORDER BY creation DESC
        LIMIT 10
    """, as_dict=True)

    return {
        "agent_stats": agent_logs,
        "error_stats": error_logs,
        "daily_trend": daily_trend,
        "recent_errors": recent_errors,
        "evaluation_stats": eval_stats_raw,
        "recent_feedbacks": recent_feedbacks
    }

@frappe.whitelist()
def submit_ai_evaluation(service_type, reference_id, rating, feedback=None):
    if not frappe.session.user or frappe.session.user == "Guest":
        frappe.throw("Vui lòng đăng nhập để gửi đánh giá.")
        
    # Check if already submitted
    existing = frappe.db.exists("AI Evaluation", {
        "service_type": service_type,
        "reference_id": reference_id,
        "user": frappe.session.user
    })
    
    if existing:
        return "Already submitted"
        
    doc = frappe.get_doc({
        "doctype": "AI Evaluation",
        "service_type": service_type,
        "reference_id": reference_id,
        "user": frappe.session.user,
        "rating": int(rating),
        "feedback": feedback
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return "Success"


