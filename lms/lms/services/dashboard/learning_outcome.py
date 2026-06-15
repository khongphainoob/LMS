"""
Learning Outcome Measurement — Pre/Post Quiz Comparison Pipeline

Uses existing DOCTYPEs:
- LMS Quiz Result: is_correct, marks, marks_out_of
- LMS Quiz Submission: submission date, quiz reference
- LMS Learning Outcome: proficiency_levels (JSON)
- Chatbot Session / Socratic Session: evaluation_score, duration_seconds

Calculates:
- Pre quiz score → post quiz score → % improvement
- Links to session for per-student learning gain tracking
- Aggregates by course, batch, or learning outcome

Usage:
    from lms.lms.services.dashboard.learning_outcome import (
        get_learning_gain, record_quiz_baseline, get_learning_summary,
    )
"""

import frappe
from frappe.utils import now_datetime, add_days
from typing import Optional, Dict, Any, List


def get_learning_gain(
    user: str,
    course: Optional[str] = None,
    lesson: Optional[str] = None,
    days: int = 30,
) -> Dict[str, Any]:
    """
    Calculate learning gain for a student by comparing pre/post quiz results.

    Finds the earliest and latest quiz submissions in the period and
    calculates improvement as % change in marks.

    Args:
        user: Student user ID
        course: Optional course filter
        lesson: Optional lesson filter
        days: Lookback period

    Returns:
        {
            "user": str,
            "pre_score_percent": float (0-100),
            "post_score_percent": float (0-100),
            "gain_percent": float (improvement),
            "total_quizzes": int,
            "learning_outcomes_improved": list,
        }
    """
    start_date = add_days(now_datetime(), -int(days))

    filters = {
        "owner": user,
        "creation": (">=", start_date),
    }
    if course:
        # Quiz submissions may link to course via quiz → course chain
        pass

    # Get all quiz submissions in period, ordered by date
    submissions = frappe.db.get_all(
        "LMS Quiz Submission",
        filters=filters,
        fields=["name", "quiz", "creation", "score", "total_marks"],
        order_by="creation asc",
    )

    if len(submissions) < 2:
        return {
            "user": user,
            "pre_score_percent": None,
            "post_score_percent": None,
            "gain_percent": 0.0,
            "total_quizzes": len(submissions),
            "learning_outcomes_improved": [],
            "status": "insufficient_data",
        }

    # Pre = earliest, Post = latest
    pre = submissions[0]
    post = submissions[-1]

    pre_pct = (pre["score"] / max(pre["total_marks"], 1)) * 100
    post_pct = (post["score"] / max(post["total_marks"], 1)) * 100
    gain = post_pct - pre_pct

    # Determine which learning outcomes improved
    outcomes_improved = _get_improved_outcomes(user, course, pre["quiz"], post["quiz"])

    return {
        "user": user,
        "pre_quiz": pre["quiz"],
        "pre_score_percent": round(pre_pct, 1),
        "post_quiz": post["quiz"],
        "post_score_percent": round(post_pct, 1),
        "gain_percent": round(gain, 1),
        "total_quizzes": len(submissions),
        "learning_outcomes_improved": outcomes_improved,
        "status": "ok",
    }


def record_quiz_baseline(user: str, quiz_id: str) -> Dict[str, Any]:
    """
    Record a baseline quiz submission as 'pre' measurement.
    Call this before starting a learning session (chatbot/socratic/lesson).

    Returns the baseline score for later comparison.
    """
    submission = frappe.db.get_value(
        "LMS Quiz Submission",
        {"owner": user, "quiz": quiz_id},
        ["score", "total_marks", "creation"],
        order_by="creation desc",
        as_dict=True,
    )

    if not submission:
        return {"status": "no_submission", "message": "No quiz submission found"}

    baseline_pct = (submission["score"] / max(submission["total_marks"], 1)) * 100

    # Cache baseline for quick lookup
    frappe.cache().set_value(
        f"learning_baseline:{user}:{quiz_id}",
        baseline_pct,
        expires_in_sec=86400 * 30,  # 30 days
    )

    return {
        "status": "ok",
        "user": user,
        "quiz": quiz_id,
        "baseline_score_percent": round(baseline_pct, 1),
    }


def get_learning_summary(
    course: Optional[str] = None,
    batch: Optional[str] = None,
    days: int = 30,
) -> Dict[str, Any]:
    """
    Aggregate learning gain across a course or batch.

    Returns:
        {
            "total_students": int,
            "avg_gain_percent": float,
            "improved_count": int,
            "no_change_count": int,
            "declined_count": int,
            "distribution": {...},
        }
    """
    start_date = add_days(now_datetime(), -int(days))

    # Get users in course/batch
    user_filter = {}
    if course:
        user_filter["course"] = course
    if batch:
        user_filter["batch"] = batch

    users = frappe.db.get_all(
        "LMS Batch Enrollment" if batch else "LMS Enrollment",
        filters=user_filter,
        fields=["member"],
        pluck="member",
    )

    if not users:
        return {"status": "no_users", "total_students": 0}

    gains = []
    for user in users[:100]:  # Limit to 100 for performance
        result = get_learning_gain(user, course=course, days=days)
        if result["status"] == "ok":
            gains.append(result["gain_percent"])

    if not gains:
        return {"status": "insufficient_data", "total_students": len(users)}

    improved = sum(1 for g in gains if g > 0)
    no_change = sum(1 for g in gains if g == 0)
    declined = sum(1 for g in gains if g < 0)

    # Distribution
    dist = {
        "high_improvement": sum(1 for g in gains if g >= 10),
        "moderate_improvement": sum(1 for g in gains if 5 <= g < 10),
        "slight_improvement": sum(1 for g in gains if 0 < g < 5),
        "no_change": no_change,
        "slight_decline": sum(1 for g in gains if -5 < g < 0),
        "significant_decline": sum(1 for g in gains if g <= -5),
    }

    return {
        "total_students": len(users),
        "measured_students": len(gains),
        "avg_gain_percent": round(sum(gains) / len(gains), 1),
        "improved_count": improved,
        "no_change_count": no_change,
        "declined_count": declined,
        "distribution": dist,
    }


def _get_improved_outcomes(
    user: str, course: Optional[str], pre_quiz: str, post_quiz: str
) -> List[str]:
    """Determine which learning outcomes improved between pre and post quiz."""
    improved = []

    # Get learning outcomes for the course
    outcomes = frappe.db.get_all(
        "LMS Learning Outcome",
        filters={"course": course} if course else {},
        fields=["name", "title", "code"],
    )

    for outcome in outcomes:
        # Compare per-outcome scores if available
        pre_score = _get_outcome_score(user, pre_quiz, outcome["name"])
        post_score = _get_outcome_score(user, post_quiz, outcome["name"])
        if post_score > pre_score:
            improved.append({
                "outcome": outcome["title"],
                "code": outcome["code"],
                "pre_score": pre_score,
                "post_score": post_score,
                "improvement": post_score - pre_score,
            })

    return sorted(improved, key=lambda x: x["improvement"], reverse=True)[:5]


def _get_outcome_score(user: str, quiz: str, outcome_name: str) -> float:
    """Get score for a specific learning outcome from a quiz submission."""
    # This relies on quiz questions being tagged with learning outcomes
    results = frappe.db.get_all(
        "LMS Quiz Result",
        filters={
            "owner": user,
            "question_name": ("like", f"%{outcome_name}%"),
        },
        fields=["marks", "marks_out_of"],
        limit=10,
    )
    if not results:
        return 0.0

    total_marks = sum(r["marks"] for r in results)
    total_out_of = sum(r["marks_out_of"] for r in results)
    return (total_marks / max(total_out_of, 1)) * 100


def link_session_to_quiz(
    session_type: str, session_id: str, quiz_id: str, is_post: bool = True,
) -> None:
    """
    Link a learning session to a quiz for pre/post tracking.

    Call after quiz completion to associate it with the session.
    Pre-quiz: taken before the session starts
    Post-quiz: taken after the session ends
    """
    try:
        if is_post and session_type in ("chatbot", "socratic"):
            doctype = "Chatbot Session" if session_type == "chatbot" else "Socratic Session"
            # Update evaluation_score based on post-quiz improvement
            gain = get_learning_gain(
                frappe.db.get_value(doctype, session_id, "student"),
                days=1,
            )
            if gain["status"] == "ok" and gain["post_quiz"] == quiz_id:
                # Map gain_percent to 1-5 evaluation score
                score = 3.0  # Default: no change
                if gain["gain_percent"] >= 10:
                    score = 5.0
                elif gain["gain_percent"] >= 5:
                    score = 4.0
                elif gain["gain_percent"] > 0:
                    score = 3.5
                elif gain["gain_percent"] < 0:
                    score = 2.0

                frappe.db.set_value(doctype, session_id, "evaluation_score", score)
                frappe.db.commit()

    except Exception as e:
        frappe.log_error(f"link_session_to_quiz error: {e}", "Learning Outcome")


@frappe.whitelist(allow_guest=False)
def get_my_learning_progress(user: Optional[str] = None, days: int = 30):
    """API for students to see their own learning progress."""
    user = user or frappe.session.user
    if user == "Guest":
        frappe.throw("Vui lòng đăng nhập.")

    gain = get_learning_gain(user, days=int(days))

    # Also get session counts
    chatbot_count = frappe.db.count("Chatbot Session", {"student": user, "creation": (">=", add_days(now_datetime(), -int(days)))})
    socratic_count = frappe.db.count("Socratic Session", {"student": user, "creation": (">=", add_days(now_datetime(), -int(days)))})

    return {
        "learning_gain": gain,
        "sessions_used": chatbot_count + socratic_count,
        "period_days": int(days),
    }


@frappe.whitelist(allow_guest=False)
def get_course_learning_summary(course: str, batch: Optional[str] = None, days: int = 30):
    """API for teachers to see learning outcomes for their course."""
    frappe.only_for("Course Creator", "Moderator", "System Manager")

    return get_learning_summary(course=course, batch=batch, days=int(days))
