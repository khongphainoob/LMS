# -*- coding: utf-8 -*-
"""
Grading Nodes Module

LangGraph node functions for AI-powered grading workflow.
These nodes process submissions, grade them using AI providers,
and aggregate results.
"""

from __future__ import annotations

from typing import Dict, List, Optional
import json

from ..state import AgentState, GradeResult, QuestionChunk


def load_submission_node(state: AgentState) -> Dict:
    """
    Load submission data from Frappe database.

    For MVP, assumes source_text is provided by caller/API layer.
    In production, this would load from AI Grading Submission DocType.
    """
    if not state.get("source_text"):
        return {
            "status": "failed",
            "error_message": "Missing source_text in AgentState",
            "current_node": "load_submission_node",
        }
    return {"current_node": "load_submission_node"}


def split_questions_node(state: AgentState) -> Dict:
    """
    Split submission text into question chunks.

    For MVP, uses simple heuristic splitting by newlines.
    In production, this would use OCR/layout-based splitting.
    """
    source_text = state.get("source_text", "")
    lines = [line.strip() for line in source_text.splitlines() if line.strip()]

    chunks: List[QuestionChunk] = []
    for index, line in enumerate(lines, start=1):
        chunks.append(
            {
                "question_id": f"q{index}",
                "header": f"Question {index}",
                "answer_text": line,
                "split_method": "heuristic",
            }
        )

    return {
        "question_chunks": chunks,
        "current_node": "split_questions_node",
    }


def grade_questions_node(state: AgentState) -> Dict:
    """
    Grade questions using AI provider.

    Enhanced version that calls actual AI provider instead of
    using MVP fallback logic.
    """
    chunks = state.get("question_chunks", [])
    if not chunks:
        return {
            "status": "failed",
            "error_message": "No question_chunks to grade",
            "current_node": "grade_questions_node",
        }

    # Try to use AI provider if available
    provider_name = state.get("provider", "openai")
    model = state.get("model", "gpt-4o-mini")
    rubric = state.get("rubric")
    prompt_template = state.get("prompt_template")

    try:
        # Import provider adapter
        from lms.lms.services.ai_grading import get_provider, PromptEngine

        provider = get_provider(provider_name=provider_name, model=model)
        prompt_engine = PromptEngine()

        results: List[GradeResult] = []

        # Grade each question/chunk
        for chunk in chunks:
            # Build prompt for this question
            prompts = prompt_engine.build_grading_prompt(
                submission_text=chunk["answer_text"],
                rubric_data=rubric,
                question_text=f"Question {chunk['question_id']}",
                additional_instructions=prompt_template
            )

            # Call AI provider
            ai_result = provider.grade(
                prompt=prompts["user"],
                system_prompt=prompts["system"],
                json_mode=True,
                temperature=0.3,
                max_tokens=2000
            )

            if ai_result.get("error"):
                # Log error but continue
                results.append(
                    {
                        "question_id": chunk["question_id"],
                        "score": 0.0,
                        "max_score": 1.0,
                        "feedback": f"AI Error: {ai_result['error']}",
                        "confidence": 0.0,
                        "model": model,
                    }
                )
                continue

            # Parse AI response
            try:
                graded_data = json.loads(ai_result["content"])

                score = graded_data.get("total_score", 0)
                max_score = graded_data.get("max_score", 1)
                feedback = graded_data.get("overall_feedback", "")
                confidence = graded_data.get("confidence", 0.5)

                # If rubric exists, get criterion scores
                if "criteria" in graded_data and graded_data["criteria"]:
                    criteria_scores = graded_data["criteria"]
                    if criteria_scores:
                        first_criterion = criteria_scores[0]
                        score = first_criterion.get("score", score)
                        max_score = first_criterion.get("max_score", max_score)
                        feedback = first_criterion.get("feedback", feedback)
                        confidence = first_criterion.get("confidence", confidence)

                results.append(
                    {
                        "question_id": chunk["question_id"],
                        "score": float(score),
                        "max_score": float(max_score),
                        "feedback": feedback,
                        "confidence": float(confidence),
                        "model": model,
                    }
                )

            except (json.JSONDecodeError, KeyError, TypeError) as e:
                # Fallback if parsing fails
                results.append(
                    {
                        "question_id": chunk["question_id"],
                        "score": 0.0,
                        "max_score": 1.0,
                        "feedback": f"Failed to parse AI response: {str(e)}",
                        "confidence": 0.0,
                        "model": model,
                    }
                )

        return {
            "grade_results": results,
            "current_node": "grade_questions_node",
        }

    except ImportError:
        # Fallback to MVP logic if services not available
        return _fallback_grading(state)

    except Exception as e:
        # Log error and use fallback
        frappe.logger("lms").error(f"AI grading error: {e}")
        return _fallback_grading(state)


def _fallback_grading(state: AgentState) -> Dict:
    """
    Fallback grading logic when AI provider is unavailable.

    Uses deterministic scoring for MVP/testing purposes.
    """
    chunks = state.get("question_chunks", [])
    if not chunks:
        return {
            "status": "failed",
            "error_message": "No question_chunks to grade",
            "current_node": "grade_questions_node",
        }

    model = state.get("model", "unknown")

    results: List[GradeResult] = []
    for chunk in chunks:
        # Simple heuristic: score based on answer length
        answer_text = chunk.get("answer_text", "")
        answer_length = len(answer_text)

        # Give score based on meaningful length
        if answer_length < 10:
            score = 0.0
        elif answer_length < 20:
            score = 0.3
        elif answer_length < 50:
            score = 0.6
        else:
            score = 1.0

        max_score = 1.0
        results.append(
            {
                "question_id": chunk["question_id"],
                "score": score,
                "max_score": max_score,
                "feedback": "Auto-graded by fallback logic (AI provider unavailable).",
                "confidence": 0.3,
                "model": model,
            }
        )

    return {
        "grade_results": results,
        "current_node": "grade_questions_node",
    }


def aggregate_node(state: AgentState) -> Dict:
    """
    Aggregate individual question scores into total.

    Calculates final score, percentage, and generates summary feedback.
    """
    results = state.get("grade_results", [])
    if not results:
        return {
            "status": "failed",
            "error_message": "No grade_results to aggregate",
            "current_node": "aggregate_node",
        }

    total_score = sum(item["score"] for item in results)
    total_max = sum(item["max_score"] for item in results) or 1.0
    percentage = (total_score / total_max * 100) if total_max > 0 else 0

    # Generate summary feedback
    feedback_parts = [
        f"Total score: {total_score:.1f}/{total_max:.1f}",
        f"Percentage: {percentage:.1f}%",
    ]

    # Count criteria by score range
    correct_count = sum(1 for r in results if r["score"] == r["max_score"])
    partial_count = sum(1 for r in results if 0 < r["score"] < r["max_score"])
    wrong_count = sum(1 for r in results if r["score"] == 0)

    feedback_parts.append(
        f"Results: {correct_count} correct, {partial_count} partial, {wrong_count} incorrect"
    )

    # Determine if review is needed based on confidence
    avg_confidence = sum(r.get("confidence", 0.5) for r in results) / len(results)
    requires_review = avg_confidence < 0.7

    final_feedback = "\n".join(feedback_parts)

    return {
        "total_score": total_score,
        "max_score": total_max,
        "percentage": percentage,
        "final_feedback": final_feedback,
        "requires_review": requires_review,
        "status": "waiting_review" if requires_review else "completed",
        "current_node": "aggregate_node",
    }


def apply_review_node(state: AgentState) -> Dict:
    """
    Apply human review decision to grading results.

    Handles approved, rejected, and partially edited grades.
    """
    decision = state.get("review_decision")
    if not decision:
        return {
            "status": "waiting_review",
            "current_node": "apply_review_node",
        }

    action = decision.get("action")

    if action == "rejected":
        return {
            "status": "failed",
            "error_message": "Rejected by reviewer",
            "note": decision.get("note", ""),
            "current_node": "apply_review_node",
        }

    if action == "partial_edit":
        edits = decision.get("edited_scores", {})
        results = state.get("grade_results", [])

        # Apply edited scores
        for item in results:
            if item["question_id"] in edits:
                item["score"] = float(edits[item["question_id"]])

        # Recalculate totals
        total_score = sum(item["score"] for item in results)
        total_max = sum(item["max_score"] for item in results) or 1.0
        percentage = (total_score / total_max * 100) if total_max > 0 else 0

        return {
            "grade_results": results,
            "total_score": total_score,
            "max_score": total_max,
            "percentage": percentage,
            "status": "completed",
            "note": decision.get("note", ""),
            "current_node": "apply_review_node",
        }

    # action == "approved"
    results = state.get("grade_results", [])
    total_score = sum(item["score"] for item in results)
    total_max = sum(item["max_score"] for item in results) or 1.0
    percentage = (total_score / total_max * 100) if total_max > 0 else 0

    return {
        "grade_results": results,
        "total_score": total_score,
        "max_score": total_max,
        "percentage": percentage,
        "status": "completed",
        "note": decision.get("note", ""),
        "current_node": "apply_review_node",
    }
