# -*- coding: utf-8 -*-
"""
Cost Tracking Service Module

Service for tracking and managing AI provider costs.
Provides methods for cost estimation, aggregation, and budget monitoring.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, date, timedelta
import frappe

from ..base_service import BaseService


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
    DEFAULT_MAX_COST_PER_SESSION = 50.0  # USD
    DEFAULT_MAX_COST_PER_DAY = 200.0  # USD
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

        # Check if cost track exists for today + provider + model
        existing = frappe.db.exists(
            "AI Grading Cost Track",
            {
                "cost_date": today,
                "ai_provider": provider,
                "ai_model": model,
                "session": session
            }
        )

        if existing:
            # Update existing record
            doc = frappe.get_doc("AI Grading Cost Track", existing)
            doc.submission_count += 1
            doc.total_tokens += tokens
            doc.total_cost_usd += cost

            # Update weighted average grading time
            if grading_time > 0:
                new_avg_time = (
                    (doc.average_tokens_per_submission * (doc.submission_count - 1) + grading_time)
                    / doc.submission_count
                )
                doc.average_tokens_per_submission = new_avg_time  # Reusing field for time

            # Recalculate averages
            if doc.submission_count > 0:
                doc.average_cost_per_submission = doc.total_cost_usd / doc.submission_count
                doc.average_tokens_per_submission = doc.total_tokens / doc.submission_count

            doc.save()
        else:
            # Create new record
            frappe.get_doc({
                "doctype": "AI Grading Cost Track",
                "cost_date": today,
                "ai_provider": provider,
                "ai_model": model,
                "session": session,
                "submission_count": 1,
                "total_tokens": tokens,
                "total_cost_usd": cost,
                "average_cost_per_submission": cost,
                "average_tokens_per_submission": tokens
            }).insert()

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

        total_cost = sum(ct["total_cost_usd"] for ct in cost_tracks)
        total_tokens = sum(ct["total_tokens"] for ct in cost_tracks)
        total_submissions = sum(ct["submission_count"] for ct in cost_tracks)

        # Breakdown by provider
        provider_breakdown = {}
        for ct in cost_tracks:
            provider = ct["ai_provider"]
            if provider not in provider_breakdown:
                provider_breakdown[provider] = {
                    "cost": 0.0,
                    "tokens": 0,
                    "submissions": 0
                }
            provider_breakdown[provider]["cost"] += ct["total_cost_usd"]
            provider_breakdown[provider]["tokens"] += ct["total_tokens"]
            provider_breakdown[provider]["submissions"] += ct["submission_count"]

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

        return self.get_list(filters=filters, order_by="cost_date ASC")

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

        cost_tracks = self.get_list(filters=filters)

        if not cost_tracks:
            return {
                "total_cost": 0.0,
                "total_tokens": 0,
                "total_submissions": 0,
                "providers": {},
                "models": {},
                "sessions": {}
            }

        total_cost = sum(ct["total_cost_usd"] for ct in cost_tracks)
        total_tokens = sum(ct["total_tokens"] for ct in cost_tracks)
        total_submissions = sum(ct["submission_count"] for ct in cost_tracks)

        # Breakdown by provider
        providers = {}
        for ct in cost_tracks:
            provider = ct["ai_provider"]
            if provider not in providers:
                providers[provider] = {
                    "cost": 0.0,
                    "tokens": 0,
                    "submissions": 0
                }
            providers[provider]["cost"] += ct["total_cost_usd"]
            providers[provider]["tokens"] += ct["total_tokens"]
            providers[provider]["submissions"] += ct["submission_count"]

        # Breakdown by model
        models = {}
        for ct in cost_tracks:
            model = ct["ai_model"]
            if model not in models:
                models[model] = {
                    "cost": 0.0,
                    "tokens": 0,
                    "submissions": 0
                }
            models[model]["cost"] += ct["total_cost_usd"]
            models[model]["tokens"] += ct["total_tokens"]
            models[model]["submissions"] += ct["submission_count"]

        # Breakdown by session (top 10)
        session_costs = {}
        for ct in cost_tracks:
            session = ct["session"]
            if session not in session_costs:
                session_costs[session] = 0.0
            session_costs[session] += ct["total_cost_usd"]

        # Get top 10 sessions by cost
        sorted_sessions = sorted(session_costs.items(), key=lambda x: x[1], reverse=True)[:10]
        top_sessions = {k: v for k, v in sorted_sessions}

        return {
            "total_cost": total_cost,
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
        today_costs = self.get_list(filters={"cost_date": today})

        # Calculate today's totals
        today_cost = sum(ct["total_cost_usd"] for ct in today_costs)
        today_tokens = sum(ct["total_tokens"] for ct in today_costs)

        # Get this session's cost
        session_cost = 0.0
        if session:
            session_costs = self.get_list(filters={"session": session})
            session_cost = sum(ct["total_cost_usd"] for ct in session_costs)

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
            limit=7,
            order_by="cost_date DESC"
        )

        if recent_costs:
            avg_cost = sum(ct["average_cost_per_submission"] for ct in recent_costs) / len(recent_costs)
            avg_tokens = sum(ct["average_tokens_per_submission"] for ct in recent_costs) / len(recent_costs)
        else:
            # Use defaults if no historical data
            from .provider_adapter import get_provider
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

        cost_records = self.get_list(filters=filters, order_by="cost_date ASC")

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
            daily_data[cost_date]["cost"] += record["total_cost_usd"]
            daily_data[cost_date]["tokens"] += record["total_tokens"]
            daily_data[cost_date]["submissions"] += record["submission_count"]

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

        old_records = frappe.get_all(
            "AI Grading Cost Track",
            filters={"cost_date": ["<", cutoff_date]},
            pluck="name"
        )

        deleted = 0
        for record_name in old_records:
            try:
                frappe.delete_doc("AI Grading Cost Track", record_name)
                deleted += 1
            except Exception:
                pass

        return deleted

    def _get_max_cost_per_day(self) -> float:
        """Get max daily cost limit."""
        return frappe.db.get_single_value(
            "LMS AI Settings",
            "max_cost_per_day",
            default=self.DEFAULT_MAX_COST_PER_DAY
        )

    def _get_max_cost_per_session(self) -> float:
        """Get max session cost limit."""
        return frappe.db.get_single_value(
            "LMS AI Settings",
            "max_cost_per_session",
            default=self.DEFAULT_MAX_COST_PER_SESSION
        )


# Convenience functions for quick access
def get_total_cost_today() -> float:
    """Get total cost for today."""
    service = CostTrackingService()
    today = date.today()
    costs = service.get_list(filters={"cost_date": today})
    return sum(ct["total_cost_usd"] for ct in costs)


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
