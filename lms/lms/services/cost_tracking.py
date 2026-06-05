# -*- coding: utf-8 -*-
"""
Cost Tracking Service Module

Service for tracking and managing AI provider costs.
Provides methods for cost estimation, aggregation, and budget monitoring.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, date, timedelta
import frappe

from lms.lms.services.base_service import BaseService


class CostTrackingService(BaseService):
    """
    Service for tracking AI grading costs.

    Features:
    - Track costs per provider, model, session
    - Aggregate costs by date ranges
    - Budget monitoring and alerts
    - Cost projections
    """

    # Budget limits (can be configurable)
    DEFAULT_MAX_COST_PER_SESSION = 40.0  # USD
    DEFAULT_MAX_COST_PER_DAY = 50.0  # USD
    DEFAULT_MAX_COST_PER_MONTH = 1000.0  # USD

    def __init__(self):
        super().__init__("AI Grading Cost Track")

    def track_grading_cost(
        self,
        session: str,
        submission: str,
        provider: str,
        model: str,
        cost: float,
        tokens: int,
        grading_time: float = 0.0
    ):
        """
        Record a grading cost event.

        Args:
            session: Session name
            submission: Submission name
            provider: AI provider name
            model: Model name
            cost: Cost in USD
            tokens: Total tokens used
            grading_time: Time spent grading in seconds
        """
        today = date.today()
        frappe.get_doc({
            "doctype": "AI Grading Cost Track",
            "cost_date": today,
            "ai_provider": provider,
            "ai_model": model,
            "session": session,
            "total_tokens": tokens,
            "total_cost": cost
        }).insert(ignore_permissions=True, ignore_links=True)

    def get_session_costs(self, session: str) -> Dict[str, Any]:
        """
        Get cost breakdown for a session.

        Args:
            session: Session name

        Returns:
            Dict with cost details
        """
        cost_tracks = frappe.get_all(
            "AI Grading Cost Track",
            filters={"session": session},
            fields=["*"],
            order_by="cost_date ASC"
        )

        if not cost_tracks:
            return {
                "session": session,
                "total_cost": 0.0,
                "total_tokens": 0,
                "total_submissions": 0,
                "breakdown_by_provider": {}
            }

        total_cost = sum(ct.get("total_cost") or 0.0 for ct in cost_tracks)
        total_tokens = sum(ct.get("total_tokens") or 0 for ct in cost_tracks)
        total_submissions = len(cost_tracks)

        # Breakdown by provider
        provider_breakdown = {}
        for ct in cost_tracks:
            provider = ct.get("ai_provider")
            if not provider:
                continue
            if provider not in provider_breakdown:
                provider_breakdown[provider] = {
                    "cost": 0.0,
                    "tokens": 0,
                    "submissions": 0
                }
            provider_breakdown[provider]["cost"] += ct.get("total_cost") or 0.0
            provider_breakdown[provider]["tokens"] += ct.get("total_tokens") or 0
            provider_breakdown[provider]["submissions"] += 1

        return {
            "session": session,
            "total_cost": total_cost,
            "total_tokens": total_tokens,
            "total_submissions": total_submissions,
            "average_cost_per_submission": total_cost / total_submissions if total_submissions > 0 else 0,
            "breakdown_by_provider": provider_breakdown,
            "daily_records": cost_tracks
        }

    def get_costs_by_date_range(
        self,
        start_date: date,
        end_date: date,
        provider: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get cost records for a date range.

        Args:
            start_date: Start date
            end_date: End date
            provider: Optional provider filter

        Returns:
            List of cost records
        """
        filters = {
            "cost_date": ["between", [start_date, end_date]]
        }
        if provider:
            filters["ai_provider"] = provider

        return self.get_list(filters=filters, fields=["*"], order_by="cost_date ASC", limit=0)

    def get_cost_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        provider: Optional[str] = None,
        session: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get aggregated cost summary.

        Args:
            start_date: Optional start date
            end_date: Optional end date
            provider: Optional provider filter
            session: Optional session filter

        Returns:
            Dict with summary statistics
        """
        filters = {}
        if start_date:
            filters["cost_date"] = [">=", start_date]
        if end_date:
            if "cost_date" in filters:
                filters["cost_date"] = ["between", [start_date, end_date]]
            else:
                filters["cost_date"] = ["<=", end_date]
        if provider:
            filters["ai_provider"] = provider
        if session:
            filters["session"] = session

        cost_tracks = self.get_list(filters=filters, fields=["*"], limit=0)

        if not cost_tracks:
            return {
                "total_cost": 0.0,
                "total_tokens": 0,
                "total_submissions": 0,
                "providers": {},
                "models": {},
                "sessions": {}
            }

        total_cost = sum(ct.get("total_cost") or 0.0 for ct in cost_tracks)
        total_tokens = sum(ct.get("total_tokens") or 0 for ct in cost_tracks)
        total_submissions = len(cost_tracks)
        
        exchange_rate = self.get_exchange_rate()
        total_cost_vnd = total_cost * exchange_rate

        # Breakdown by provider
        providers = {}
        for ct in cost_tracks:
            provider = ct.get("ai_provider")
            if not provider:
                continue
            if provider not in providers:
                providers[provider] = {
                    "cost": 0.0,
                    "tokens": 0,
                    "submissions": 0
                }
            providers[provider]["cost"] += ct.get("total_cost") or 0.0
            providers[provider]["tokens"] += ct.get("total_tokens") or 0
            providers[provider]["submissions"] += 1

        # Breakdown by model
        models = {}
        for ct in cost_tracks:
            model = ct.get("ai_model")
            if not model:
                continue
            if model not in models:
                models[model] = {
                    "cost": 0.0,
                    "tokens": 0,
                    "submissions": 0
                }
            models[model]["cost"] += ct.get("total_cost") or 0.0
            models[model]["tokens"] += ct.get("total_tokens") or 0
            models[model]["submissions"] += 1

        # Breakdown by session (top 10)
        session_costs = {}
        for ct in cost_tracks:
            session = ct.get("session")
            if not session:
                continue
            if session not in session_costs:
                session_costs[session] = 0.0
            session_costs[session] += ct.get("total_cost") or 0.0

        # Get top 10 sessions by cost
        sorted_sessions = sorted(session_costs.items(), key=lambda x: x[1], reverse=True)[:10]
        top_sessions = {k: v for k, v in sorted_sessions}

        return {
            "total_cost": total_cost,
            "total_cost_vnd": total_cost_vnd,
            "exchange_rate": exchange_rate,
            "total_tokens": total_tokens,
            "total_submissions": total_submissions,
            "average_cost_per_submission": total_cost / total_submissions if total_submissions > 0 else 0,
            "average_tokens_per_submission": total_tokens / total_submissions if total_submissions > 0 else 0,
            "providers": providers,
            "models": models,
            "top_sessions": top_sessions
        }

    def check_budget(
        self,
        session: Optional[str] = None,
        user: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Check if grading is within budget limits.

        Args:
            session: Session to check
            user: User to check (for per-user limits)

        Returns:
            Dict with budget status and remaining amounts
        """
        # Get cost tracking for today
        today = date.today()
        today_costs = self.get_list(filters={"cost_date": today}, fields=["*"], limit=0)

        # Calculate today's totals
        today_cost = sum(ct.get("total_cost") or 0.0 for ct in today_costs)
        today_tokens = sum(ct.get("total_tokens") or 0 for ct in today_costs)

        # Get this session's cost
        session_cost = 0.0
        if session:
            session_costs = self.get_list(filters={"session": session}, fields=["*"], limit=0)
            session_cost = sum(ct.get("total_cost") or 0.0 for ct in session_costs)

        # Check against limits
        max_daily = self._get_max_cost_per_day()
        max_session = self._get_max_cost_per_session()

        status = {
            "session": session,
            "daily_cost": today_cost,
            "session_cost": session_cost,
            "daily_limit": max_daily,
            "session_limit": max_session,
            "daily_remaining": max(0, max_daily - today_cost),
            "session_remaining": max(0, max_session - session_cost),
            "within_budget": True,
            "warnings": []
        }

        # Check daily limit
        if today_cost >= max_daily * 0.9:  # 90% threshold
            status["warnings"].append({
                "type": "daily_near_limit",
                "message": "Daily budget 90% used",
                "percentage": today_cost / max_daily * 100
            })

        if today_cost >= max_daily:
            status["within_budget"] = False
            status["warnings"].append({
                "type": "daily_exceeded",
                "message": "Daily budget exceeded"
            })

        # Check session limit
        if session_cost >= max_session * 0.9:
            status["warnings"].append({
                "type": "session_near_limit",
                "message": "Session budget 90% used",
                "percentage": session_cost / max_session * 100
            })

        if session_cost >= max_session:
            status["within_budget"] = False
            status["warnings"].append({
                "type": "session_exceeded",
                "message": "Session budget exceeded"
            })

        return status

    def get_cost_projection(
        self,
        projected_submissions: int,
        provider: str = "openai",
        model: str = "gpt-4o-mini"
    ) -> Dict[str, Any]:
        """
        Project cost for a given number of submissions.

        Args:
            projected_submissions: Number of submissions to grade
            provider: AI provider to use
            model: Model to use

        Returns:
            Dict with cost projection
        """
        # Get recent average cost per submission for this provider/model
        recent_costs = self.get_list(
            filters={"ai_provider": provider, "ai_model": model},
            fields=["*"],
            limit=7,
            order_by="cost_date DESC"
        )

        if recent_costs:
            avg_cost = sum(ct.get("total_cost") or 0.0 for ct in recent_costs) / len(recent_costs)
            avg_tokens = sum(ct.get("total_tokens") or 0 for ct in recent_costs) / len(recent_costs)
        else:
            # Use defaults if no historical data
            from lms.lms.agents.provider_adapter import get_provider
            provider_instance = get_provider(provider_name=provider, model=model)
            avg_tokens = 1000  # Default estimate
            avg_cost = provider_instance.calculate_cost(avg_tokens, int(avg_tokens * 0.3))

        total_cost = avg_cost * projected_submissions
        total_tokens = avg_tokens * projected_submissions

        return {
            "projected_submissions": projected_submissions,
            "provider": provider,
            "model": model,
            "average_cost_per_submission": avg_cost,
            "average_tokens_per_submission": avg_tokens,
            "total_estimated_cost": total_cost,
            "total_estimated_tokens": total_tokens
        }

    def get_cost_trend(
        self,
        days: int = 30,
        provider: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get cost trend over time.

        Args:
            days: Number of days to analyze
            provider: Optional provider filter

        Returns:
            List of daily cost data
        """
        end_date = date.today()
        start_date = end_date - timedelta(days=days)

        filters = {
            "cost_date": ["between", [start_date, end_date]]
        }
        if provider:
            filters["ai_provider"] = provider

        cost_records = self.get_list(filters=filters, fields=["*"], order_by="cost_date ASC", limit=0)

        # Aggregate by date
        daily_data = {}
        for record in cost_records:
            cost_date = record["cost_date"].isoformat()
            if cost_date not in daily_data:
                daily_data[cost_date] = {
                    "date": cost_date,
                    "cost": 0.0,
                    "tokens": 0,
                    "submissions": 0
                }
            daily_data[cost_date]["cost"] += record.get("total_cost") or 0.0
            daily_data[cost_date]["tokens"] += record.get("total_tokens") or 0
            daily_data[cost_date]["submissions"] += 1

        return list(daily_data.values())

    def cleanup_old_records(self, days_to_keep: int = 90):
        """
        Clean up old cost records beyond retention period.

        Args:
            days_to_keep: Number of days to retain records

        Returns:
            Number of records deleted
        """
        cutoff_date = date.today() - timedelta(days=days_to_keep)

        try:
            # Bulk delete via SQL for performance
            frappe.db.sql("DELETE FROM `tabAI Grading Cost Track` WHERE cost_date < %s", cutoff_date)
            deleted = frappe.db.sql("SELECT ROW_COUNT()")[0][0]
        except Exception as e:
            frappe.log_error(f"Error purging old records: {e}", "AI Cost Tracking")
            deleted = 0

        return deleted

    def _get_max_cost_per_day(self) -> float:
        """Get max daily cost limit."""
        val = frappe.db.get_single_value(
            "LMS AI Settings",
            "max_cost_per_day"
        )
        return float(val) if val is not None else self.DEFAULT_MAX_COST_PER_DAY

    def _get_max_cost_per_session(self) -> float:
        """Get max session cost limit."""
        val = frappe.db.get_single_value(
            "LMS AI Settings",
            "max_cost_per_session"
        )
        return float(val) if val is not None else self.DEFAULT_MAX_COST_PER_SESSION
        
    def get_exchange_rate(self) -> float:
        """Get USD to VND exchange rate from settings."""
        rate = frappe.db.get_single_value("LMS AI Settings", "usd_to_vnd_exchange_rate")
        try:
            return float(rate) if rate else 25400.0
        except (ValueError, TypeError):
            return 25400.0

    def track_agent_call_cost(self, agent_name: str, cost: float, tokens: int = 0, provider: str = None, model: str = None):
        """
        Record a cost for a specific agent config call.
        Updates the cost field on the AI Agent Config child table row and LMS AI Settings document.
        Also logs a detailed cost event to the AI Grading Cost Track database table.
        """
        if not agent_name or cost <= 0:
            return
            
        try:
            # Sử dụng SQL atomic updates thay vì read-modify-write
            frappe.db.sql("""
                UPDATE `tabLMS AI Settings` 
                SET cost = IFNULL(cost, 0) + %s
            """, (cost,))
            
            frappe.db.sql("""
                UPDATE `tabAI Agent Config`
                SET cost = IFNULL(cost, 0) + %s
                WHERE parent = 'LMS AI Settings' AND agent_name = %s
            """, (cost, agent_name))
            
            # KHÔNG gọi frappe.db.commit() ở đây để tránh phá vỡ transaction cha
            
            # --- DETAILED DATABASE COST LOGGING ---
            try:
                self.track_grading_cost(
                    session=agent_name,
                    submission="API Call",
                    provider=provider or "Google",
                    model=model or "gemini-1.5-flash",
                    cost=cost,
                    tokens=tokens or 0
                )
            except Exception as e_track:
                frappe.log_error(f"Error logging to Cost Track: {e_track}")

            # --- DAILY BUDGET WARNING ---
            today_str = date.today().isoformat()
            daily_cost_key = f"ai_cost:daily:{today_str}"
            
            # Increment daily cost in Redis using atomic incrbyfloat
            new_daily_cost = frappe.cache().redis_server.incrbyfloat(daily_cost_key, cost)
            frappe.cache().redis_server.expire(daily_cost_key, 86400 * 2)
            
            max_daily = self._get_max_cost_per_day()
            
            # 90% Threshold Warning
            if new_daily_cost >= max_daily * 0.9 and not frappe.cache().get_value(f"ai_cost:warn_90:{today_str}"):
                frappe.cache().set_value(f"ai_cost:warn_90:{today_str}", "1", expires_in_sec=86400 * 2)
                self.send_budget_warning_notification("90%", new_daily_cost, max_daily)
                
            # 100% Limit Exceeded Warning
            if new_daily_cost >= max_daily and not frappe.cache().get_value(f"ai_cost:warn_100:{today_str}"):
                frappe.cache().set_value(f"ai_cost:warn_100:{today_str}", "1", expires_in_sec=86400 * 2)
                self.send_budget_warning_notification("100%", new_daily_cost, max_daily)
                
        except Exception as e:
            frappe.log_error(f"Error tracking agent call cost for {agent_name}: {e}")

    def send_budget_warning_notification(self, threshold: str, current_cost: float, max_cost: float):
        """Sends LMS bell notification to all System Managers when daily cost threshold is reached."""
        try:
            from lms.lms.services.hitl.notification import notify_user_direct
            from lms.lms.utils import get_lms_route
            
            # Find all System Managers
            users_with_role = frappe.get_all("Has Role", filters={"role": "System Manager", "parenttype": "User"}, fields=["parent"])
            admins = list(set([u.parent for u in users_with_role]))
            
            subject = f"⚠️ Cảnh báo chi phí AI: Chạm {threshold} giới hạn ngân sách ngày"
            email_content = (
                f"Hệ thống giám sát chi phí AI báo cáo:<br>"
                f"Tổng chi phí sử dụng AI hôm nay đã đạt <b>{current_cost:.4f} USD</b>, "
                f"chạm ngưỡng <b>{threshold}</b> hạn mức ngày (<b>{max_cost:.2f} USD</b>).<br>"
                f"Vui lòng kiểm tra và điều chỉnh cấu hình nếu cần."
            )
            
            for admin in admins:
                notify_user_direct(
                    for_user=admin,
                    subject=subject,
                    email_content=email_content,
                    document_type="LMS AI Settings",
                    document_name="LMS AI Settings",
                    link=get_lms_route("ai-settings") or ""
                )
        except Exception as e:
            frappe.log_error(f"Failed to send budget warning notification: {e}")


# Convenience functions for quick access
def get_total_cost_today() -> float:
    """Get total cost for today."""
    today = date.today()
    result = frappe.db.sql("SELECT SUM(total_cost) FROM `tabAI Grading Cost Track` WHERE cost_date = %s", today)
    return result[0][0] if result and result[0][0] else 0.0


def get_provider_cost_summary(provider: str, days: int = 30) -> Dict[str, Any]:
    """Get cost summary for a specific provider."""
    service = CostTrackingService()
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    return service.get_cost_summary(
        start_date=start_date,
        end_date=end_date,
        provider=provider
    )


def track_agent_cost(agent_name: str, cost: float, tokens: int = 0, provider: str = None, model: str = None):
    """Convenience function to track cost for a specific agent config call."""
    service = CostTrackingService()
    service.track_agent_call_cost(agent_name, cost, tokens, provider, model)


@frappe.whitelist()
def get_ai_cost_summary(start_date=None, end_date=None, provider=None):
    """Whitelisted API for admin dashboard to get cost summary."""
    frappe.only_for("System Manager")
    from datetime import datetime
    
    start = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else None
    end = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else None
    
    service = CostTrackingService()
    return service.get_cost_summary(start_date=start, end_date=end, provider=provider)


@frappe.whitelist()
def get_ai_cost_trend(days=30, provider=None):
    """Whitelisted API for admin dashboard to get cost trend data."""
    frappe.only_for("System Manager")
    try:
        days = int(days)
    except ValueError:
        days = 30
        
    service = CostTrackingService()
    return service.get_cost_trend(days=days, provider=provider)
