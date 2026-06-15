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


# ===== NEW: Reliability Monitoring APIs (Task 24) =====

@frappe.whitelist(allow_guest=False)
def get_ai_reliability_stats(days=7):
    """Circuit breaker state, error rate, fallback count, validator pass/fail."""
    frappe.only_for('System Manager')

    # Circuit breaker states
    try:
        from lms.lms.agents.core.fault_tolerance import CircuitBreakerRegistry
        registry = CircuitBreakerRegistry()
        cb_states = registry.get_state_summary()
    except Exception:
        cb_states = {}

    # Error rate from Agent Log
    start_date = add_days(now_datetime(), -int(days))
    error_trend = frappe.db.sql("""
        SELECT DATE(creation) as date, COUNT(name) as error_count
        FROM `tabAgent Log`
        WHERE creation >= %s AND level = 'ERROR'
        GROUP BY DATE(creation) ORDER BY date ASC
    """, (start_date,), as_dict=True)

    total_errors = sum(e["error_count"] for e in error_trend)
    total_logs = frappe.db.count("Agent Log", {"creation": (">=", start_date)})
    error_rate = (total_errors / max(total_logs, 1)) * 100

    # Fallback count from AI Grading Session
    fallback_sessions = frappe.db.count(
        "AI Grading Session",
        {"fallback_count": (">", 0), "creation": (">=", start_date)}
    )

    # Validator stats from recent sessions
    validator_passes = 0
    validator_total = 0
    for doctype in ["Chatbot Session", "Socratic Session", "AI Lesson Plan", "AI Quiz"]:
        try:
            total = frappe.db.count(doctype, {"creation": (">=", start_date)})
            scored = frappe.db.count(doctype, {
                "creation": (">=", start_date),
                "evaluation_score": (">=", 3.0),
            })
            validator_total += total
            validator_passes += scored
        except Exception:
            pass
    validator_pass_rate = (validator_passes / max(validator_total, 1)) * 100

    return {
        "circuit_breaker_states": cb_states,
        "error_rate_percent": round(error_rate, 2),
        "total_errors": total_errors,
        "error_trend": error_trend,
        "fallback_count": fallback_sessions,
        "validator_pass_rate_percent": round(validator_pass_rate, 1),
        "validator_total": validator_total,
    }


@frappe.whitelist(allow_guest=False)
def get_ai_latency_stats(days=1):
    """P50/P95/P99 latency per agent, last 24h."""
    frappe.only_for('System Manager')

    start_date = add_days(now_datetime(), -int(days))
    agent_latency = {}

    # Read from session DOCTYPEs
    latency_queries = {
        "chatbot": ("Chatbot Session", "duration_seconds"),
        "socratic": ("Socratic Session", "duration_seconds"),
        "lesson_planner": ("AI Lesson Plan", "generation_latency_ms"),
        "exam_generator": ("AI Exam", "generation_latency_ms"),
        "quiz_generator": ("AI Quiz", "generation_latency_ms"),
        "grading": ("AI Grading Session", "grading_latency_ms"),
    }

    for agent, (doctype, field) in latency_queries.items():
        try:
            values = frappe.db.get_all(
                doctype,
                filters={"creation": (">=", start_date), field: (">", 0)},
                fields=[field],
                limit=100,
                order_by=f"creation desc",
            )
            vals = sorted([v[field] for v in values if v.get(field)])
            if vals:
                n = len(vals)
                # For duration_seconds fields, convert to ms
                if field == "duration_seconds":
                    vals = [v * 1000 for v in vals]
                agent_latency[agent] = {
                    "p50": round(vals[n // 2], 1),
                    "p95": round(vals[int(n * 0.95)], 1),
                    "p99": round(vals[int(n * 0.99)], 1),
                    "avg": round(sum(vals) / n, 1),
                    "sample_count": n,
                }
        except Exception as e:
            agent_latency[agent] = {"error": str(e)}

    return {"agent_latency": agent_latency}


@frappe.whitelist(allow_guest=False)
def get_ai_quality_stats(days=7):
    """Content validator pass rate + evaluation score distribution."""
    frappe.only_for('System Manager')

    start_date = add_days(now_datetime(), -int(days))
    quality = {}

    for doctype, field in [
        ("Chatbot Session", "evaluation_score"),
        ("Socratic Session", "evaluation_score"),
        ("AI Lesson Plan", "evaluation_score"),
        ("AI Exam", "evaluation_score"),
        ("AI Quiz", "evaluation_score"),
    ]:
        try:
            scores = frappe.db.get_all(
                doctype,
                filters={"creation": (">=", start_date), field: (">", 0)},
                fields=[field],
                limit=200,
            )
            vals = [s[field] for s in scores if s.get(field)]
            if vals:
                quality[doctype] = {
                    "avg_score": round(sum(vals) / len(vals), 2),
                    "total_rated": len(vals),
                    "distribution": {
                        "1-2": sum(1 for v in vals if v < 3),
                        "3": sum(1 for v in vals if 3 <= v < 4),
                        "4": sum(1 for v in vals if 4 <= v < 5),
                        "5": sum(1 for v in vals if v == 5),
                    },
                }
        except Exception:
            pass

    return {"quality_stats": quality}


@frappe.whitelist(allow_guest=False)
def get_ai_health_check():
    """Provider health + circuit breaker state + Redis status."""
    frappe.only_for('System Manager')

    # Provider health
    from lms.lms.agents.core.provider_adapter import get_provider
    provider_health = {}
    for provider_name in ["openai", "gemini", "anthropic"]:
        try:
            adapter = get_provider(provider_name)
            status = adapter.health_check()
            provider_health[provider_name] = status["status"]
        except Exception as e:
            provider_health[provider_name] = f"error: {str(e)[:50]}"

    # CB state
    try:
        from lms.lms.agents.core.fault_tolerance import CircuitBreakerRegistry
        cb_states = CircuitBreakerRegistry().get_state_summary()
    except Exception:
        cb_states = {}

    # Redis
    redis_ok = False
    try:
        frappe.cache().set_value("health_check_test", "ok", expires_in_sec=10)
        redis_ok = frappe.cache().get_value("health_check_test") == "ok"
    except Exception:
        pass

    # Daily cost
    from lms.lms.services.cost_tracking import get_total_cost_today
    today_cost = get_total_cost_today()

    return {
        "provider_health": provider_health,
        "circuit_breaker_states": cb_states,
        "redis_ok": redis_ok,
        "cost_today_usd": today_cost,
        "status": "healthy" if all(
            v == "healthy" for v in provider_health.values()
        ) and redis_ok else "degraded",
    }


@frappe.whitelist(allow_guest=False)
def get_ai_feedback_summary(days=30):
    """User rating distribution + recent feedback from AI User Feedback."""
    frappe.only_for('System Manager')

    start_date = add_days(now_datetime(), -int(days))

    # From new AI User Feedback DOCTYPE
    try:
        ratings = frappe.db.sql("""
            SELECT rating, COUNT(name) as count
            FROM `tabAI User Feedback`
            WHERE creation >= %s
            GROUP BY rating ORDER BY rating DESC
        """, (start_date,), as_dict=True)

        recent = frappe.db.sql("""
            SELECT session_type, user, rating, feedback_text, creation
            FROM `tabAI User Feedback`
            WHERE feedback_text IS NOT NULL AND feedback_text != ''
            ORDER BY creation DESC LIMIT 20
        """, as_dict=True)
    except Exception:
        ratings = []
        recent = []

    # Also try old AI Evaluation DOCTYPE for backward compat
    try:
        eval_ratings = frappe.db.sql("""
            SELECT service_type, rating, COUNT(name) as count
            FROM `tabAI Evaluation`
            WHERE creation >= %s
            GROUP BY service_type, rating
            ORDER BY service_type, rating DESC
        """, (start_date,), as_dict=True)
    except Exception:
        eval_ratings = []

    return {
        "feedback_ratings": ratings,
        "recent_feedback": recent,
        "evaluation_ratings": eval_ratings,
    }


@frappe.whitelist()
def submit_feedback(session_type, session_id, rating, feedback_text=None, category=None):
    """Submit user feedback for any AI session type."""
    if not frappe.session.user or frappe.session.user == "Guest":
        frappe.throw("Vui lòng đăng nhập để gửi đánh giá.")

    try:
        doc = frappe.get_doc({
            "doctype": "AI User Feedback",
            "session_type": session_type,
            "session_id": session_id,
            "user": frappe.session.user,
            "rating": rating,
            "rating_category": category or "helpfulness",
            "feedback_text": feedback_text,
        })
        doc.insert(ignore_permissions=True)
        frappe.db.commit()
        return {"status": "success", "message": "Cảm ơn bạn đã gửi đánh giá!"}
    except Exception as e:
        frappe.log_error(f"Feedback submission error: {e}", "AI User Feedback")
        return {"status": "error", "message": str(e)}