"""
Base agent state definitions for TOMOSA multi-agent architecture.

All agent State TypedDicts inherit from BaseAgentState to ensure
consistent cost tracking, error handling, and status reporting across
the entire multi-agent platform.

Usage:
    from lms.lms.agents.core.base_state import BaseAgentState, AgentStatus, UsageMetrics

    class MyAgentState(BaseAgentState):
        my_custom_field: str
"""

from typing import TypedDict, Optional, Literal, Annotated
from enum import Enum


class AgentStatus(str, Enum):
    """Standardized agent execution statuses."""
    DRAFT = "Draft"
    PROCESSING = "Processing"
    REVIEW = "Review"
    COMPLETED = "Completed"
    FAILED = "Failed"
    BLOCKED = "Blocked"           # Safety/content guard blocked
    ILLUSTRATING = "Illustrating"  # Generating visual assets
    WAITING_REVIEW = "Waiting for Review"  # HITL pause


class UsageMetrics(TypedDict, total=False):
    """Token usage and cost metrics — populated by cost callback handler."""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost_usd: float
    latency_ms: int
    model_name: str
    provider_name: str


class BaseAgentState(TypedDict, total=False):
    """
    Foundation state that ALL agent states should extend.

    Fields common across ChatbotState, SocraticState, LessonPlanState,
    ExamState, QuizState, RubricBuilderState, GradingContext.

    Usage:
        class MyAgentState(BaseAgentState):
            '''Extends base with domain-specific fields.'''
            custom_input: str
            result: Optional[dict]
    """
    # ===== COST & USAGE (consistent across all agents) =====
    tokens_used: int                # Total tokens consumed this run
    input_tokens: int               # Prompt/input tokens
    output_tokens: int              # Completion/output tokens
    total_cost_usd: float           # Cumulative cost in USD
    latency_ms: int                 # End-to-end latency

    # ===== MODEL IDENTITY =====
    model_used: str                 # Name of the primary model used (e.g., "gpt-4o-mini")
    provider_name: str              # Provider name (e.g., "openai", "gemini")

    # ===== EXECUTION STATUS =====
    status: str                     # AgentStatus value (Processing, Completed, Failed, etc.)
    error: Optional[str]            # Error message if status == Failed

    # ===== TRACING =====
    thread_id: Optional[str]        # LangGraph thread/session ID
    agent_name: str                 # Name of this agent (for logging/cost attribution)


def merge_usage_metrics(base: dict, updates: dict) -> dict:
    """
    Accumulate token usage from a node result into the base state.
    Safe to call from any node that invokes an LLM.

    Args:
        base: Current state dict (or empty dict for first call)
        updates: Dict with token/cost fields from LLM response

    Returns:
        Updated dict with accumulated usage
    """
    result = dict(base)
    for key in ("tokens_used", "input_tokens", "output_tokens"):
        if updates.get(key, 0):
            result[key] = result.get(key, 0) + updates[key]
    if updates.get("total_cost_usd"):
        result["total_cost_usd"] = result.get("total_cost_usd", 0.0) + updates["total_cost_usd"]
    if updates.get("latency_ms"):
        # Track max latency (worst-case node)
        result["latency_ms"] = max(result.get("latency_ms", 0), updates["latency_ms"])
    if updates.get("model_used"):
        result["model_used"] = updates["model_used"]
    return result


def create_error_state(error_message: str, agent_name: str = "") -> dict:
    """
    Create a minimal error state for graceful degradation.
    Used by circuit breakers and fallback handlers.

    Args:
        error_message: Human-readable error description
        agent_name: Agent identifier for logging

    Returns:
        Dict with BaseAgentState error fields
    """
    return {
        "status": AgentStatus.FAILED.value,
        "error": error_message,
        "agent_name": agent_name,
        "tokens_used": 0,
        "total_cost_usd": 0.0,
    }
