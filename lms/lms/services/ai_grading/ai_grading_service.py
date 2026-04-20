# -*- coding: utf-8 -*-
"""
AI Grading Service Module

Main service for orchestrating AI-powered grading of student submissions.
Handles submission processing, AI calls, logging, and cost tracking.
"""

import json
import hashlib
from typing import Dict, Any, Optional, List
import frappe
from datetime import datetime

from .provider_adapter import get_provider
from .prompt_engine import PromptEngine
from ..base_service import BaseService


class AIGradingService(BaseService):
    """
    Main service for AI-powered grading.

    Orchestrates the grading workflow:
    1. Load submission and session data
    2. Build grading prompt with rubric
    3. Call AI provider
    4. Parse and validate response
    5. Update submission with results
    6. Log to audit trail
    7. Track costs
    """

    def __init__(self):
        super().__init__("AI Grading Submission")
        self.prompt_engine = PromptEngine()

    def grade_submission(
        self,
        submission_name: str,
        retry_count: int = 0,
        triggered_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Grade a single submission using AI.

        Args:
            submission_name: Name of the AI Grading Submission
            retry_count: Current retry attempt number
            triggered_by: User who triggered the grading (if manual)

        Returns:
            Dict with grading result
        """
        # Get submission document
        submission = frappe.get_doc("AI Grading Submission", submission_name)
        session = frappe.get_doc("AI Grading Session", submission.session)

        # Update submission status
        submission.status = "Grading"
        submission.grading_started_at = datetime.now()
        submission.ai_provider = session.ai_provider or "openai"
        submission.ai_model = session.ai_model or "gpt-4o-mini"
        submission.retry_count = retry_count
        submission.save()

        # Log start
        self._log_action(
            submission=submission_name,
            session=session.name,
            action="Grading Started",
            ai_provider=submission.ai_provider,
            ai_model=submission.ai_model,
            triggered_by=triggered_by
        )

        try:
            # Get submission text
            submission_text = self._extract_submission_text(submission)

            # Get rubric if configured
            rubric_data = None
            if session.rubric:
                rubric_data = self._get_rubric_data(session.rubric)

            # Get question text if available
            question_text = self._get_question_text(submission)

            # Build prompt
            prompts = self.prompt_engine.build_grading_prompt(
                submission_text=submission_text,
                rubric_data=rubric_data,
                question_text=question_text,
                additional_instructions=session.ai_notes,
                language=self._get_language(session)
            )

            # Get AI provider
            provider = get_provider(
                provider_name=submission.ai_provider,
                model=submission.ai_model
            )

            # Estimate cost before calling
            estimated_cost = provider.estimate_cost(prompts["user"])

            # Call AI
            result = provider.grade(
                prompt=prompts["user"],
                system_prompt=prompts["system"],
                json_mode=True,
                temperature=0.3,
                max_tokens=2000
            )

            if result.get("error"):
                raise Exception(result["error"])

            # Parse AI response
            grading_result = self.prompt_engine.parse_ai_response(result["content"])

            # Update submission with results
            submission.score = grading_result.get("total_score")
            submission.ai_feedback = json.dumps(grading_result, ensure_ascii=False)
            submission.ai_confidence = grading_result.get("metadata", {}).get("confidence", 0)

            # Store criterion scores separately
            if "criteria" in grading_result:
                submission.criterion_scores = json.dumps(
                    grading_result["criteria"],
                    ensure_ascii=False
                )

            submission.grading_completed_at = datetime.now()
            submission.grading_time_seconds = result["latency_seconds"]

            # Store token usage
            if result.get("usage"):
                submission.input_tokens = result["usage"]["prompt_tokens"]
                submission.output_tokens = result["usage"]["completion_tokens"]
                submission.total_tokens = result["usage"]["total_tokens"]

            submission.estimated_cost = estimated_cost
            submission.status = "Done"

            # Enable annotations if configured and present
            if session.enable_annotations and grading_result.get("annotations"):
                self._add_annotations(submission, grading_result.get("annotations", []))

            submission.save()

            # Log completion
            self._log_action(
                submission=submission_name,
                session=session.name,
                action="Grading Completed",
                ai_provider=submission.ai_provider,
                ai_model=submission.ai_model,
                input_tokens=result.get("usage", {}).get("prompt_tokens", 0),
                output_tokens=result.get("usage", {}).get("completion_tokens", 0),
                total_tokens=result.get("usage", {}).get("total_tokens", 0),
                estimated_cost=estimated_cost,
                new_score=submission.score,
                grading_time_seconds=result["latency_seconds"],
                triggered_by=triggered_by
            )

            # Track cost
            self._track_cost(
                session=session.name,
                submission=submission_name,
                provider=submission.ai_provider,
                model=submission.ai_model,
                cost=estimated_cost,
                tokens=result.get("usage", {}).get("total_tokens", 0)
            )

            return {
                "success": True,
                "submission": submission_name,
                "score": submission.score,
                "confidence": submission.ai_confidence,
                "feedback": grading_result.get("overall_feedback"),
                "cost": estimated_cost,
                "tokens": result.get("usage", {}).get("total_tokens", 0),
                "time": result["latency_seconds"]
            }

        except Exception as e:
            # Handle error
            max_retries = session.max_retries if hasattr(session, 'max_retries') else 3
            submission.status = "Flagged" if retry_count >= max_retries else "Pending"
            submission.last_error = str(e)
            submission.save()

            # Log error
            self._log_action(
                submission=submission_name,
                session=session.name,
                action="Grading Failed",
                error_message=str(e),
                triggered_by=triggered_by
            )

            # Retry if under max attempts
            if retry_count < max_retries:
                # Schedule retry
                frappe.enqueue(
                    "lms.lms.services.ai_grading.ai_grading_service.AIGradingService.grade_submission",
                    submission_name=submission_name,
                    retry_count=retry_count + 1,
                    queue="long",
                    timeout=300
                )

            return {
                "success": False,
                "submission": submission_name,
                "error": str(e),
                "retry_count": retry_count
            }

    def grade_batch(
        self,
        session_name: str,
        triggered_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Grade all pending submissions in a session.

        Args:
            session_name: Name of the AI Grading Session
            triggered_by: User who triggered the grading

        Returns:
            Dict with batch grading results
        """
        # Get pending submissions
        submissions = frappe.get_all(
            "AI Grading Submission",
            filters={
                "session": session_name,
                "status": "Pending"
            },
            pluck="name"
        )

        # Enqueue grading jobs
        job_ids = []
        for submission_name in submissions:
            job_id = frappe.enqueue(
                "lms.lms.services.ai_grading.ai_grading_service.AIGradingService.grade_submission",
                submission_name=submission_name,
                triggered_by=triggered_by,
                queue="long",
                timeout=300
            )
            job_ids.append(job_id)

        return {
            "success": True,
            "session": session_name,
            "queued_count": len(submissions),
            "job_ids": job_ids
        }

    def _extract_submission_text(self, submission) -> str:
        """
        Extract text from submission for grading.

        Handles multiple input sources:
        - paper_image (OCR would be needed - not implemented yet)
        - lms_quiz_submission
        - lms_assignment_submission
        - Direct text input

        Args:
            submission: AI Grading Submission document

        Returns:
            Extracted text for grading
        """
        text_parts = []

        # If there's an image, note that OCR is needed
        if submission.paper_image:
            text_parts.append("[Paper Image Attached - OCR Required]")

        # Get quiz submission text if available
        if submission.lms_quiz_submission:
            quiz_sub = frappe.get_doc("LMS Quiz Submission", submission.lms_quiz_submission)
            if quiz_sub.get("answers"):
                text_parts.append(f"Quiz Answers: {quiz_sub.answers}")

        # Get assignment submission text if available
        if submission.lms_assignment_submission:
            assign_sub = frappe.get_doc("LMS Assignment Submission", submission.lms_assignment_submission)
            if assign_sub.get("text"):
                text_parts.append(f"Assignment Text: {assign_sub.text}")

        return "\n\n".join(text_parts) if text_parts else "No submission text found"

    def _get_rubric_data(self, rubric_name: str) -> Optional[Dict[str, Any]]:
        """
        Get rubric data with criteria.

        Args:
            rubric_name: Name of the rubric

        Returns:
            Rubric data dictionary
        """
        if not frappe.db.exists("AI Grading Rubric", rubric_name):
            return None

        rubric_doc = frappe.get_doc("AI Grading Rubric", rubric_name)

        criteria_data = []
        for criterion in rubric_doc.get("criteria", []):
            criteria_data.append({
                "criterion_id": criterion.name,
                "criterion_name": criterion.criterion_name,
                "max_score": criterion.max_score,
                "weight": criterion.weight,
                "description": criterion.description,
                "scoring_guide": criterion.scoring_guide,
            })

        return {
            "rubric_name": rubric_doc.rubric_name,
            "total_max_score": rubric_doc.total_max_score,
            "grading_type": rubric_doc.grading_type,
            "description": rubric_doc.description,
            "language": rubric_doc.language,
            "criteria": criteria_data
        }

    def _get_question_text(self, submission) -> Optional[str]:
        """
        Get original question text if available.

        Args:
            submission: AI Grading Submission document

        Returns:
            Question text or None
        """
        # This would need to be implemented based on your specific data model
        # For now, return None
        return None

    def _get_language(self, session) -> str:
        """
        Determine grading language from session or rubric.

        Args:
            session: AI Grading Session document

        Returns:
            Language code (english, vietnamese, mixed)
        """
        # Check if rubric has language
        if session.rubric and frappe.db.exists("AI Grading Rubric", session.rubric):
            rubric = frappe.get_doc("AI Grading Rubric", session.rubric)
            if rubric.language:
                return rubric.language.lower()

        # Default to mixed for Vietnamese context
        return "mixed"

    def _log_action(self, **kwargs):
        """
        Log AI grading action to AI Grading Log.

        Also logs to Agent Log if available.
        """
        log_data = {
            "doctype": "AI Grading Log",
            "action": kwargs.get("action"),
            "submission": kwargs.get("submission"),
            "session": kwargs.get("session"),
            "ai_provider": kwargs.get("ai_provider"),
            "ai_model": kwargs.get("ai_model"),
            "new_score": kwargs.get("new_score"),
            "grading_time_seconds": kwargs.get("grading_time_seconds"),
            "estimated_cost": kwargs.get("estimated_cost"),
            "error_message": kwargs.get("error_message"),
            "triggered_by": kwargs.get("triggered_by"),
        }

        # Add tokens
        if kwargs.get("input_tokens"):
            log_data["input_tokens"] = kwargs["input_tokens"]
        if kwargs.get("output_tokens"):
            log_data["output_tokens"] = kwargs["output_tokens"]
        if kwargs.get("total_tokens"):
            log_data["total_tokens"] = kwargs["total_tokens"]

        # Add hashes for auditing
        if kwargs.get("request_payload"):
            log_data["prompt_hash"] = hashlib.sha256(
                json.dumps(kwargs["request_payload"]).encode()
            ).hexdigest()
        if kwargs.get("response_payload"):
            log_data["response_hash"] = hashlib.sha256(
                json.dumps(kwargs["response_payload"]).encode()
            ).hexdigest()

        # Try to create AI Grading Log
        if frappe.db.exists("DocType", "AI Grading Log"):
            try:
                log = frappe.get_doc(log_data)
                log.insert(ignore_permissions=True)
            except Exception:
                pass

        # Also log to Agent Log if available
        if frappe.db.exists("DocType", "Agent Log"):
            try:
                agent_log = frappe.get_doc({
                    "doctype": "Agent Log",
                    "thread_id": f"grading_{kwargs.get('submission', '')}",
                    "session_id": kwargs.get("session"),
                    "submission_id": kwargs.get("submission"),
                    "timestamp": datetime.now(),
                    "level": "INFO" if not kwargs.get("error_message") else "ERROR",
                    "component": "ai_grading",
                    "message": kwargs.get("action"),
                    "metadata": json.dumps(kwargs, default=str),
                    "error_details": kwargs.get("error_message", "")
                })
                agent_log.insert(ignore_permissions=True)
            except Exception:
                pass

    def _track_cost(
        self,
        session: str,
        submission: str,
        provider: str,
        model: str,
        cost: float,
        tokens: int
    ):
        """
        Track grading cost for budgeting and analytics.

        Args:
            session: Session name
            submission: Submission name
            provider: AI provider name
            model: Model name
            cost: Cost in USD
            tokens: Total tokens used
        """
        if not frappe.db.exists("DocType", "AI Grading Cost Track"):
            return

        today = datetime.now().date()

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
            doc = frappe.get_doc("AI Grading Cost Track", existing)
            doc.submission_count += 1
            doc.total_tokens += tokens
            doc.total_cost_usd += cost

            # Recalculate averages
            if doc.submission_count > 0:
                doc.average_cost_per_submission = doc.total_cost_usd / doc.submission_count
                doc.average_tokens_per_submission = doc.total_tokens / doc.submission_count

            doc.save()
        else:
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

    def _add_annotations(self, submission, annotations: List[Dict]):
        """
        Add AI-generated annotations to submission.

        Args:
            submission: AI Grading Submission document
            annotations: List of annotation data
        """
        if not annotations:
            return

        # Check if AI Grading Annotation DocType exists
        if not frappe.db.exists("DocType", "AI Grading Annotation"):
            return

        for ann_data in annotations:
            try:
                annotation = frappe.get_doc({
                    "doctype": "AI Grading Annotation",
                    "parent": submission.name,
                    "parenttype": "AI Grading Submission",
                    "parentfield": "annotations",
                    "annotation_type": ann_data.get("type", "Suggestion"),
                    "comment": ann_data.get("comment"),
                    "source": "AI Generated"
                })

                if "text_excerpt" in ann_data:
                    annotation.text_excerpt = ann_data["text_excerpt"]
                if "suggested_fix" in ann_data:
                    annotation.suggested_fix = ann_data["suggested_fix"]
                if "criterion" in ann_data:
                    annotation.criterion = ann_data["criterion"]

                annotation.insert(ignore_permissions=True)
            except Exception:
                # Continue even if one annotation fails
                pass


# Convenience function for quick grading
def grade_submission_sync(
    submission_name: str,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Synchronous wrapper for grading a submission.

    Convenience function for non-queued grading.

    Args:
        submission_name: Name of submission to grade
        provider: Override AI provider
        model: Override AI model
        **kwargs: Additional parameters

    Returns:
        Grading result
    """
    service = AIGradingService()

    # Override provider/model if specified
    if provider or model:
        submission = frappe.get_doc("AI Grading Submission", submission_name)
        if provider:
            submission.ai_provider = provider
        if model:
            submission.ai_model = model
        submission.save()

    return service.grade_submission(submission_name, **kwargs)


def estimate_grading_cost(
    submission_name: str,
    provider: str = "openai",
    model: str = "gpt-4o-mini"
) -> Dict[str, Any]:
    """
    Estimate cost for grading a submission.

    Args:
        submission_name: Submission name
        provider: AI provider
        model: Model name

    Returns:
        Cost estimate with token counts
    """
    submission = frappe.get_doc("AI Grading Submission", submission_name)
    session = frappe.get_doc("AI Grading Session", submission.session)

    prompt_engine = PromptEngine()
    provider_instance = get_provider(provider_name=provider, model=model)

    submission_text = AIGradingService()._extract_submission_text(submission)
    rubric_data = None
    if session.rubric:
        rubric_data = AIGradingService()._get_rubric_data(session.rubric)

    prompts = prompt_engine.build_grading_prompt(
        submission_text=submission_text,
        rubric_data=rubric_data,
        language=AIGradingService()._get_language(session)
    )

    estimated_cost = provider_instance.estimate_cost(prompts["user"])
    token_estimate = provider_instance.count_tokens(prompts["user"])

    return {
        "submission": submission_name,
        "provider": provider,
        "model": model,
        "estimated_tokens": token_estimate,
        "estimated_cost_usd": estimated_cost
    }
