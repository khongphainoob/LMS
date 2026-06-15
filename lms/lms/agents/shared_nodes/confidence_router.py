"""
Confidence-based routing node for LangGraph conditional edges.

Routes based on confidence score or evaluation result:
- High confidence → deliver directly to student
- Medium confidence → deliver with warning flag
- Low confidence → route to human review (HITL)
- Critical failures → regenerate

Based on:
- AWS Zero Trust: agents should abstain rather than guess
- GradeOpt (MSU): misconfidence-based sampling
- ClasSync: confidence scoring on all responses

Usage:
    from lms.lms.agents.shared_nodes import route_by_confidence, ConfidenceRouterConfig

    config = ConfidenceRouterConfig()
    route = route_by_confidence(state, config)
    # Returns: "deliver" | "deliver_with_warning" | "hitl_review" | "regenerate"
"""

from typing import Optional, Callable
from dataclasses import dataclass, field


@dataclass
class ConfidenceRouterConfig:
    """Configuration for the confidence-based router."""

    # State fields
    evaluation_result_field: str = "evaluation_result"
    needs_review_field: str = "needs_review"
    confidence_field: str = "confidence"

    # Thresholds
    high_confidence_threshold: float = 0.85   # Above this → deliver
    medium_confidence_threshold: float = 0.65 # Above this → deliver with warning
    # Below medium → route to HITL

    # Evaluation score thresholds (from ValidatorContext)
    auto_deliver_score: float = 4.0
    warning_score: float = 3.0

    # Custom routing function (overrides threshold logic)
    custom_router: Optional[Callable[[dict], str]] = None

    # Default route if no confidence info available
    default_route: str = "deliver_with_warning"


ROUTE_MAP = {
    "deliver": "end",              # → END
    "deliver_with_warning": "end",  # → END with flag
    "hitl_review": "hitl",          # → HITL node
    "regenerate": "regenerate",     # → generator node
}


def route_by_confidence(state: dict, config: ConfidenceRouterConfig = None) -> str:
    """
    Route content based on confidence/evaluation scores.

    Maps to LangGraph conditional edge keys.
    Use in graph.add_conditional_edges(source, route_by_confidence, route_map).

    Args:
        state: Agent state dict
        config: ConfidenceRouterConfig

    Returns:
        Route key: "deliver" | "deliver_with_warning" | "hitl_review" | "regenerate"
    """
    config = config or ConfidenceRouterConfig()

    # Custom routing function takes priority
    if config.custom_router:
        return config.custom_router(state)

    # Try evaluation-based routing first
    eval_result = state.get(config.evaluation_result_field)
    if eval_result and isinstance(eval_result, dict):
        decision = eval_result.get("delivery_decision")
        if decision:
            return _map_decision_to_route(decision)

        score = eval_result.get("overall_score", 0)
        if score >= config.auto_deliver_score:
            return "deliver"
        elif score >= config.warning_score:
            return "deliver_with_warning"
        else:
            return "hitl_review"

    # Try confidence-based routing
    confidence = state.get(config.confidence_field, 1.0)
    if isinstance(confidence, dict):
        confidence = confidence.get("score", 1.0)

    if confidence >= config.high_confidence_threshold:
        return "deliver"
    elif confidence >= config.medium_confidence_threshold:
        return "deliver_with_warning"
    else:
        return "hitl_review"

    # Fallback
    return config.default_route


def _map_decision_to_route(decision: str) -> str:
    """Map evaluation result delivery_decision to route key."""
    mapping = {
        "auto_deliver": "deliver",
        "deliver_with_warning": "deliver_with_warning",
        "route_to_hitl": "hitl_review",
        "regenerate": "regenerate",
    }
    return mapping.get(decision, "deliver_with_warning")


def build_confidence_route_map(graph_node_names: dict = None) -> dict:
    """
    Build a route map for graph.add_conditional_edges().

    Maps route keys to actual LangGraph node names.

    Args:
        graph_node_names: Optional dict overriding default node names.
            Defaults: all routes → END (safest default).
            Override hitl_review and regenerate for graphs with those nodes.

    Returns:
        Dict mapping route_key → graph node name
    """
    from langgraph.graph import END

    defaults = {
        "deliver": END,
        "deliver_with_warning": END,
        "hitl_review": END,
        "regenerate": END,
    }
    if graph_node_names:
        defaults.update(graph_node_names)
    return defaults
