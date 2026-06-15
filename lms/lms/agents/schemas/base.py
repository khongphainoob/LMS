"""
Base shared schemas for TOMOSA multi-agent architecture.

These schemas are used across all agents for consistent cost tracking,
error reporting, and execution metadata.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal


class UsageMetrics(BaseModel):
    """Standardized token usage and cost metrics from any LLM call."""
    prompt_tokens: int = Field(default=0, ge=0, description="Input/prompt tokens consumed")
    completion_tokens: int = Field(default=0, ge=0, description="Output/completion tokens consumed")
    total_tokens: int = Field(default=0, ge=0, description="Total tokens consumed")
    cost_usd: float = Field(default=0.0, ge=0.0, description="Cost in USD")
    latency_ms: int = Field(default=0, ge=0, description="Call latency in milliseconds")
    model_name: str = Field(default="", description="Model used (e.g., gpt-4o-mini)")
    provider_name: str = Field(default="", description="Provider used (e.g., openai)")


class ErrorInfo(BaseModel):
    """Standardized error information for agent execution failures."""
    error_code: str = Field(default="UNKNOWN", description="Machine-readable error code")
    error_message: str = Field(default="", description="Human-readable error description")
    error_source: str = Field(default="", description="Node or component that raised the error")
    is_retryable: bool = Field(default=False, description="Whether this error can be retried")
    retry_count: int = Field(default=0, ge=0, description="Number of retry attempts made")


class AgentExecutionMeta(BaseModel):
    """Execution metadata tracked across agent runs."""
    agent_name: str = Field(description="Name of the agent (e.g., chatbot, lesson_planner)")
    thread_id: str = Field(default="", description="LangGraph thread/session identifier")
    status: Literal["Draft", "Processing", "Review", "Completed", "Failed", "Blocked"] = Field(
        default="Draft", description="Execution status"
    )
    usage: UsageMetrics = Field(default_factory=UsageMetrics, description="Token usage summary")
    error: Optional[ErrorInfo] = Field(default=None, description="Error details if failed")
    duration_seconds: float = Field(default=0.0, ge=0.0, description="Total execution duration")
