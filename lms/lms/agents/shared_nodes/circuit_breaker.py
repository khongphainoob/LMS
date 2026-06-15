"""
Reusable circuit breaker wrapper for LangGraph nodes.

Wraps any LLM-calling node function with circuit breaker + retry protection.
Uses the core/fault_tolerance.py primitives.

Based on:
- Production consensus: 50% error threshold, 30s cooldown, 3-5 retries
- Cordum (2026): 3 failures → 30s open, Redis-backed state
- 90% failure reduction with proper retry + breaker

Usage:
    from lms.lms.agents.shared_nodes import with_circuit_breaker_wrapper, CircuitBreakerNodeConfig

    config = CircuitBreakerNodeConfig(provider="openai", model="gpt-4o-mini")

    @with_circuit_breaker_wrapper(config)
    def my_llm_node(state: dict) -> dict:
        ...

    # Or use as inline wrapper:
    result = with_circuit_breaker_wrapper(config)(my_llm_node)(state)
"""

import logging
from typing import Callable, Optional, Dict, Any
from dataclasses import dataclass, field
from functools import wraps

logger = logging.getLogger(__name__)


@dataclass
class CircuitBreakerNodeConfig:
    """Configuration for the circuit breaker wrapper."""

    # Provider/model scope (per (provider, model) tuple)
    provider: str = "openai"
    model: str = "gpt-4o-mini"

    # Breaker settings
    failure_threshold: int = 3
    cooldown_seconds: float = 30.0
    timeout_seconds: float = 60.0
    success_threshold: int = 2

    # Retry settings
    max_retries: int = 3
    base_delay: float = 1.0
    max_delay: float = 60.0

    # Fallback behavior
    fallback_result: Optional[dict] = field(default_factory=lambda: {
        "status": "Failed",
        "error": "Circuit breaker open — service temporarily unavailable",
        "tokens_used": 0,
    })

    # Custom fallback function (overrides fallback_result)
    fallback_fn: Optional[Callable[[dict], dict]] = None

    # Whether to log state transitions
    verbose: bool = True


def with_circuit_breaker_wrapper(config: CircuitBreakerNodeConfig) -> Callable:
    """
    Decorator/wrapper that protects a LangGraph node with circuit breaker + retry.

    Can be used as:
        @with_circuit_breaker_wrapper(config)
        def my_node(state): ...

    Or inline:
        wrapped = with_circuit_breaker_wrapper(config)(original_node)
        result = wrapped(state)

    Args:
        config: CircuitBreakerNodeConfig

    Returns:
        Wrapped node function with identical signature
    """
    from lms.lms.agents.core.fault_tolerance import (
        CircuitBreaker,
        CircuitBreakerRegistry,
        RetryPolicy,
    )

    registry = CircuitBreakerRegistry()
    breaker = registry.get(config.provider, config.model)
    breaker.config.failure_threshold = config.failure_threshold
    breaker.config.cooldown_seconds = config.cooldown_seconds
    breaker.config.timeout_seconds = config.timeout_seconds
    breaker.config.success_threshold = config.success_threshold

    retry = RetryPolicy(
        max_attempts=config.max_retries,
        base_delay=config.base_delay,
        max_delay=config.max_delay,
    )

    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(state: dict, *args, **kwargs) -> dict:
            def attempt():
                return fn(state, *args, **kwargs)

            def fallback():
                if config.verbose:
                    logger.error(
                        f"[{breaker.key}] Circuit OPEN — "
                        f"using fallback for {fn.__name__}"
                    )
                if config.fallback_fn:
                    return config.fallback_fn(state)
                return dict(config.fallback_result)

            def execute_with_retry():
                return retry.execute(attempt)

            try:
                return breaker.call(execute_with_retry, fallback=fallback)
            except Exception as e:
                logger.error(f"[{breaker.key}] Unrecoverable error in {fn.__name__}: {e}")
                return fallback()

        return wrapper
    return decorator
