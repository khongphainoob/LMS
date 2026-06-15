"""
Reusable LangGraph shared nodes for TOMOSA multi-agent architecture.

These nodes are agent-agnostic — any orchestrator can import and use them.
Each node is parameterized via config dicts to adapt to different agent contexts.

Usage:
    from lms.lms.agents.shared_nodes import (
        safety_guard_node, hitl_review_node, content_validator_node,
        extract_json, with_circuit_breaker_wrapper, route_by_confidence,
    )
"""

from .safety_guard import safety_guard_node, SafetyGuardConfig
from .hitl_interrupt import hitl_review_node, HITLConfig
from .json_extractor import extract_json, extract_and_validate
from .content_validator import content_validator_node, ValidatorContext
from .circuit_breaker import with_circuit_breaker_wrapper, CircuitBreakerNodeConfig
from .confidence_router import route_by_confidence, ConfidenceRouterConfig

__all__ = [
    # Safety
    "safety_guard_node",
    "SafetyGuardConfig",
    # HITL
    "hitl_review_node",
    "HITLConfig",
    # JSON
    "extract_json",
    "extract_and_validate",
    # Validation
    "content_validator_node",
    "ValidatorContext",
    # Fault tolerance
    "with_circuit_breaker_wrapper",
    "CircuitBreakerNodeConfig",
    # Routing
    "route_by_confidence",
    "ConfidenceRouterConfig",
]
