"""
Agent name registry for TOMOSA multi-agent platform.

Centralized registry of all available agent names, their orchestrator
modules, and metadata. Used by observability, rate limiting, and
the orchestrate() factory function.

This file was referenced by external callers but did not exist —
creating it now as part of Phase 1 foundation.

Usage:
    from lms.lms.agents.core.registry import get_all_agent_names, AGENT_REGISTRY

    names = get_all_agent_names()
    config = AGENT_REGISTRY["chatbot"]
"""

from typing import Dict, List, Optional
from dataclasses import dataclass, field


@dataclass
class AgentRegistryEntry:
    """Metadata for a single agent in the registry."""
    name: str                           # Short name (e.g., "chatbot")
    display_name: str                   # Human-readable (e.g., "AI Chatbot")
    orchestrator_module: str            # Python module path
    state_class: str                    # State TypedDict class name
    has_hitl: bool = False              # Supports human-in-the-loop
    has_evaluation: bool = False        # Has pre-delivery validation gate
    is_content_producer: bool = True    # Produces content that needs evaluation
    rate_limit_service: str = ""        # Corresponding ai_rate_limit service name
    description: str = ""


# Central registry of all TOMOSA agents
AGENT_REGISTRY: Dict[str, AgentRegistryEntry] = {
    "chatbot": AgentRegistryEntry(
        name="chatbot",
        display_name="AI Chatbot",
        orchestrator_module="lms.lms.agents.chatbot.graph",
        state_class="ChatbotState",
        has_hitl=False,
        has_evaluation=False,
        is_content_producer=True,
        rate_limit_service="Chatbot",
        description="Student-facing educational chatbot with guard-routed query handling.",
    ),
    "socratic": AgentRegistryEntry(
        name="socratic",
        display_name="Socratic Tutor",
        orchestrator_module="lms.lms.agents.socratic.graph",
        state_class="SocraticState",
        has_hitl=False,
        has_evaluation=True,  # Evaluator node analyzes student work
        is_content_producer=True,
        rate_limit_service="Socratic",
        description="Socratic method tutor — evaluates student work and guides via hints.",
    ),
    "lesson_planner": AgentRegistryEntry(
        name="lesson_planner",
        display_name="AI Lesson Planner",
        orchestrator_module="lms.lms.agents.lesson_planner.graph",
        state_class="LessonPlanState",
        has_hitl=True,
        has_evaluation=False,  # No pre-delivery content validator
        is_content_producer=True,
        rate_limit_service="Lesson Plan",
        description="Full lesson plan generation with RAG retrieval, HITL review, and illustrations.",
    ),
    "exam_generator": AgentRegistryEntry(
        name="exam_generator",
        display_name="AI Exam Generator",
        orchestrator_module="lms.lms.agents.exam.orchestrator",
        state_class="ExamState",
        has_hitl=True,
        has_evaluation=True,  # Section-level evaluator during generation
        is_content_producer=True,
        rate_limit_service="Rubric Gen",
        description="MOET-aligned exam generation with blueprint review and parallel section processing.",
    ),
    "quiz_generator": AgentRegistryEntry(
        name="quiz_generator",
        display_name="AI Quiz Generator",
        orchestrator_module="lms.lms.agents.quiz.orchestrator",
        state_class="QuizState",
        has_hitl=False,
        has_evaluation=False,
        is_content_producer=True,
        rate_limit_service="Quiz Gen",
        description="Parallel fan-out quiz generation (Choices, Input, Open-Ended specialists).",
    ),
    "grading": AgentRegistryEntry(
        name="grading",
        display_name="AI Grading",
        orchestrator_module="lms.lms.agents.grading.orchestrator",
        state_class="GradingContext",
        has_hitl=False,
        has_evaluation=True,  # Reviewer loop with confidence threshold
        is_content_producer=False,  # Evaluation, not content generation
        rate_limit_service="AI Grading",
        description="Multi-expert grading pipeline (Visual, Logic, MCQ, Essay, Aggregator, Reviewer).",
    ),
    "rubric_gen": AgentRegistryEntry(
        name="rubric_gen",
        display_name="Rubric Generator",
        orchestrator_module="lms.lms.agents.grading.graph",
        state_class="RubricBuilderState",
        has_hitl=False,
        has_evaluation=True,  # Validate-and-fix retry loop
        is_content_producer=True,
        rate_limit_service="Rubric Gen",
        description="Rubric builder with validate-and-fix retry loop for structured grading criteria.",
    ),
}


def get_all_agent_names() -> List[str]:
    """Return list of all registered agent names."""
    return list(AGENT_REGISTRY.keys())


def get_agent_entry(name: str) -> Optional[AgentRegistryEntry]:
    """Look up a single agent by name."""
    return AGENT_REGISTRY.get(name)


def get_content_producers() -> List[str]:
    """Return names of agents that produce content needing evaluation."""
    return [
        name for name, entry in AGENT_REGISTRY.items()
        if entry.is_content_producer
    ]


def get_hitl_agents() -> List[str]:
    """Return names of agents supporting human-in-the-loop."""
    return [
        name for name, entry in AGENT_REGISTRY.items()
        if entry.has_hitl
    ]
