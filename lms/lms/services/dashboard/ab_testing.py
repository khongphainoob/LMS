"""
Bare-bones A/B Testing Framework for TOMOSA

Uses feature flags in LMS AI Settings to toggle features:
- enable_content_validator: Pre-delivery AI quality check
- enable_graphrag: Hybrid GraphRAG retrieval
- enable_hitl_review: Teacher review gate
- enable_circuit_breaker: Auto-failover on LLM provider failure

Supports:
- Percentage-based rollouts (e.g., 50% of users get new feature)
- Feature flag checking at service API level
- A/B test result tracking via AI Monitor Event
- Session tagging for later analysis

Usage:
    from lms.lms.services.dashboard.ab_testing import (
        is_feature_enabled, tag_session_ab, get_ab_test_results,
    )
"""

import frappe
from typing import Optional, Dict, Any
from datetime import datetime
import hashlib


def _get_setting(fieldname: str, default: bool = True) -> bool:
    """Read a feature flag from LMS AI Settings."""
    try:
        val = frappe.db.get_single_value("LMS AI Settings", fieldname)
        if val is None:
            return default
        return bool(val)
    except Exception:
        return default


def is_feature_enabled(feature: str, user: Optional[str] = None) -> bool:
    """
    Check if a feature is enabled, with optional user-based rollout.

    Features: "content_validator", "graphrag", "hitl_review", "circuit_breaker"

    If user is provided, supports % based rollout:
    - Hashes user ID → deterministic group assignment
    - Reads rollout_percentage from cached Redis value
    - Returns True if user's hash % 100 < rollout_percentage
    """
    feature_map = {
        "content_validator": "enable_content_validator",
        "graphrag": "enable_graphrag",
        "hitl_review": "enable_hitl_review",
        "circuit_breaker": "enable_circuit_breaker",
    }
    field = feature_map.get(feature)
    if field is None:
        return True  # Unknown features default to enabled

    global_enabled = _get_setting(field, default=True)
    if not global_enabled:
        return False

    # User-based rollout: check if this user is in the test group
    if user:
        rollout_pct = _get_rollout_percentage(feature)
        if rollout_pct >= 100:
            return True
        if rollout_pct <= 0:
            return False

        # Deterministic hashing: same user always gets same group
        hash_val = int(hashlib.md5(f"{feature}:{user}".encode()).hexdigest(), 16)
        bucket = hash_val % 100
        return bucket < rollout_pct

    return True


def _get_rollout_percentage(feature: str) -> int:
    """Get rollout percentage from Redis cache. Default 100%."""
    try:
        pct = frappe.cache().get_value(f"ab_test_rollout:{feature}")
        if pct is not None:
            return int(pct)
    except Exception:
        pass
    return 100


def set_rollout_percentage(feature: str, percentage: int) -> None:
    """
    Set A/B test rollout percentage.
    0 = disabled, 50 = half users, 100 = all users.
    """
    frappe.cache().set_value(
        f"ab_test_rollout:{feature}",
        max(0, min(100, percentage)),
        expires_in_sec=86400,  # 24h
    )


def tag_session_ab(
    session_type: str,
    session_id: str,
    features_enabled: Dict[str, bool],
) -> None:
    """
    Tag a session with which features were active for A/B analysis.

    Saves to AI Monitor Event so dashboard can compare results
    between test groups (features ON vs OFF).
    """
    try:
        frappe.get_doc({
            "doctype": "AI Monitor Event",
            "event_type": "ab_test_tag",
            "agent_name": session_type,
            "session_id": session_id,
            "severity": "info",
            "timestamp": datetime.now(),
            "details": frappe.as_json({
                "features": features_enabled,
                "user": frappe.session.user if hasattr(frappe, 'session') else "",
            }),
        }).insert(ignore_permissions=True)
        frappe.db.commit()
    except Exception:
        pass  # Don't block production on A/B tagging failures


def get_ab_test_results(feature: str, days: int = 7) -> Dict[str, Any]:
    """
    Compare sessions with feature ON vs OFF.

    Returns aggregated stats for dashboard comparison.
    """
    from frappe.utils import now_datetime, add_days

    start_date = add_days(now_datetime(), -int(days))

    # Get all tagged sessions in period
    events = frappe.db.get_all(
        "AI Monitor Event",
        filters={
            "event_type": "ab_test_tag",
            "creation": (">=", start_date),
        },
        fields=["session_id", "details", "creation"],
        limit=500,
    )

    group_on = []
    group_off = []
    for e in events:
        try:
            details = frappe.parse_json(e.get("details", "{}"))
            if details.get("features", {}).get(feature):
                group_on.append(e["session_id"])
            else:
                group_off.append(e["session_id"])
        except Exception:
            pass

    # Compare evaluation scores between groups
    def get_avg_score(session_ids, doctype):
        if not session_ids:
            return None
        scores = frappe.db.get_all(
            doctype,
            filters={"name": ("in", session_ids)},
            fields=["evaluation_score"],
        )
        vals = [s["evaluation_score"] for s in scores if s.get("evaluation_score")]
        return round(sum(vals) / len(vals), 2) if vals else None

    return {
        "feature": feature,
        "period_days": int(days),
        "group_on_count": len(group_on),
        "group_off_count": len(group_off),
        "group_on_avg_score": get_avg_score(group_on, "Chatbot Session"),
        "group_off_avg_score": get_avg_score(group_off, "Chatbot Session"),
    }


@frappe.whitelist(allow_guest=False)
def get_ab_test_dashboard(days: int = 7):
    """Dashboard API: A/B test results for all features."""
    frappe.only_for("System Manager")

    features = ["content_validator", "graphrag", "hitl_review", "circuit_breaker"]
    return {
        feature: get_ab_test_results(feature, days=int(days))
        for feature in features
    }
