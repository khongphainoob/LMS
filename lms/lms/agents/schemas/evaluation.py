"""
Evaluation schemas for TOMOSA content quality validation pipeline.

NEW schemas to support LLM-as-a-Judge pre-delivery evaluation gates
across all content-producing agents. Maps to the 7-dimension framework
defined in core/evaluation_framework.md.

Dimensions: PA (Pedagogical Accuracy), PS (Pedagogical Safety),
CR (Content Reliability), LE (Learning Effectiveness),
FC (Format Compliance), AE (Accessibility & Equity), CE (Cost Efficiency)
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict


# ===== Individual Dimension Scores =====

class DimensionScore(BaseModel):
    """Score for a single evaluation dimension (1-5 scale)."""
    dimension: str = Field(
        description="Dimension code: PA, PS, CR, LE, FC, AE, or CE"
    )
    score: int = Field(ge=1, le=5, description="Score 1 (worst) to 5 (best)")
    reasoning: str = Field(description="Explanation for the score")
    issues_found: List[str] = Field(default_factory=list, description="Specific issues detected")
    suggestions: List[str] = Field(default_factory=list, description="Improvement suggestions")


class EvaluationResult(BaseModel):
    """
    Complete evaluation of one AI-generated content output.

    Returned by the content_validator shared node. Used by
    confidence_router to decide: deliver / warn / HITL / regenerate.
    """
    overall_score: float = Field(ge=1.0, le=5.0, description="Weighted average across dimensions")
    dimension_scores: List[DimensionScore] = Field(description="Per-dimension scores")
    delivery_decision: Literal["auto_deliver", "deliver_with_warning", "route_to_hitl", "regenerate"] = Field(
        description="Routing decision based on threshold rules"
    )
    needs_human_review: bool = Field(description="True if any dimension below acceptable threshold")
    flagged_content: List[str] = Field(default_factory=list, description="Specific content flagged for review")
    summary: str = Field(description="Human-readable evaluation summary")
    evaluation_model: str = Field(default="", description="Model used for evaluation")
    evaluation_cost_usd: float = Field(default=0.0, description="Cost of running this evaluation")


class ConfidenceScore(BaseModel):
    """
    Confidence scoring for LLM outputs. Used at every agent handoff boundary.

    Based on AWS Zero Trust multi-agent architecture: agents should return
    structured abstention rather than guesses when uncertain.
    """
    score: float = Field(ge=0.0, le=1.0, description="Confidence 0.0 (no confidence) to 1.0 (certain)")
    reasoning: str = Field(description="Why this confidence level was assigned")
    uncertain_areas: List[str] = Field(default_factory=list, description="Specific parts with low confidence")
    hallucination_risk: Literal["low", "medium", "high"] = Field(
        default="low", description="Risk of hallucination in output"
    )
    requires_human_verification: bool = Field(
        default=False, description="True if confidence below threshold"
    )


class ContentFlag(BaseModel):
    """
    Flag raised by content_validator when content fails evaluation.

    Used by the HITL notification system to alert teachers
    with specific reasons and suggested actions.
    """
    flag_type: Literal["accuracy", "safety", "bias", "format", "completeness", "citation", "age_appropriateness"] = Field(
        description="Category of the flag"
    )
    severity: Literal["info", "warning", "critical"] = Field(
        default="warning", description="Severity level"
    )
    location: str = Field(description="Where in the content the issue was found (section/paragraph)")
    description: str = Field(description="What the issue is")
    suggested_fix: str = Field(description="Suggestion for teacher or auto-fix")
    auto_fixable: bool = Field(default=False, description="Whether AI can fix this automatically")


class ValidatorConfig(BaseModel):
    """
    Configuration for the content_validator shared node.

    Each orchestrator can customize which dimensions to check,
    thresholds, and routing behavior for its content type.
    """
    enabled_dimensions: List[str] = Field(
        default=["PA", "PS", "CR", "FC"],
        description="Which dimensions to evaluate"
    )
    auto_deliver_threshold: float = Field(default=4.0, ge=1.0, le=5.0)
    warning_threshold: float = Field(default=3.0, ge=1.0, le=5.0)
    # Below warning_threshold → route to HITL
    max_flag_severity_for_delivery: Literal["info", "warning"] = Field(
        default="info", description="Max severity that still allows delivery"
    )
    evaluation_model_name: str = Field(
        default="gpt-4o-mini",
        description="Model used for evaluation (cheaper model acceptable for judging)"
    )
    evaluation_temperature: float = Field(
        default=0.0, ge=0.0, le=1.0,
        description="Temperature for evaluator (0=deterministic recommended)"
    )
    max_evaluation_retries: int = Field(default=2, ge=0, le=5)
    require_citations: bool = Field(
        default=True, description="Whether to verify source citations exist"
    )
