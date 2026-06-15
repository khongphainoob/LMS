"""
Core foundation layer for TOMOSA multi-agent architecture.

Provides:
- BaseAgentState, AgentStatus, UsageMetrics: shared state inheritance
- CircuitBreaker, RetryPolicy, with_circuit_breaker, with_retry_policy: fault tolerance
- AgentConfig, get_agent_config: centralized configuration
- AgentRegistryEntry, get_all_agent_names: agent name registry
- get_llm, extract_usage, generate_image: unified provider facade (canonical path)
"""

# State foundation
from .base_state import BaseAgentState, AgentStatus, UsageMetrics, merge_usage_metrics, create_error_state

# Fault tolerance
from .fault_tolerance import (
    CircuitBreaker,
    CircuitBreakerConfig,
    CircuitState,
    CircuitBreakerRegistry,
    CircuitBreakerOpenError,
    RetryPolicy,
    MaxRetriesExceededError,
    with_circuit_breaker,
    with_retry_policy,
)

# Agent configuration
from .config import AgentConfig, get_agent_config, get_agent_thread_config

# Agent registry
from .registry import AgentRegistryEntry, AGENT_REGISTRY, get_all_agent_names, get_agent_entry, get_content_producers, get_hitl_agents

# Provider facade (canonical path — prefer this over agents/provider.py shim)
from .provider import get_llm, extract_usage, generate_image, AICostCallbackHandler

__all__ = [
    # State
    "BaseAgentState",
    "AgentStatus",
    "UsageMetrics",
    "merge_usage_metrics",
    "create_error_state",
    # Fault tolerance
    "CircuitBreaker",
    "CircuitBreakerConfig",
    "CircuitState",
    "CircuitBreakerRegistry",
    "CircuitBreakerOpenError",
    "RetryPolicy",
    "MaxRetriesExceededError",
    "with_circuit_breaker",
    "with_retry_policy",
    # Config
    "AgentConfig",
    "get_agent_config",
    "get_agent_thread_config",
    # Registry
    "AgentRegistryEntry",
    "AGENT_REGISTRY",
    "get_all_agent_names",
    "get_agent_entry",
    "get_content_producers",
    "get_hitl_agents",
    # Provider
    "get_llm",
    "extract_usage",
    "generate_image",
    "AICostCallbackHandler",
]
