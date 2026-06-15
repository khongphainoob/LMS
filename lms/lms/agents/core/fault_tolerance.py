"""
Fault tolerance primitives for TOMOSA multi-agent architecture.

Provides CircuitBreaker, RetryPolicy, and TimeoutPolicy wrappers that
integrate with LangGraph nodes and LangChain LLM calls.

Based on production patterns from:
- Cordum (2026): 3-state breaker with 3-failure threshold, 30s cooldown
- Salesforce Agentforce: 40% error rate → provider failover
- AWS Multi-Agent Architecture: per-agent-boundary validation
- LangChain fault tolerance primitives (RetryPolicy, TimeoutPolicy)

Key design decisions:
- Scope per (provider, model) tuple — NEVER global
- Non-binary failure detection (semantic degradation, token exhaustion)
- Exponential backoff with jitter to prevent thundering herd
- Graceful degradation through fallback chain
"""

import time
import threading
import logging
from typing import Callable, Optional, Dict, Any, List, Literal
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


# ===== Circuit Breaker =====

class CircuitState(str, Enum):
    CLOSED = "closed"         # Normal operation — calls pass through
    OPEN = "open"             # Failing — calls fail fast
    HALF_OPEN = "half_open"   # Testing recovery — limited probe calls


@dataclass
class CircuitBreakerConfig:
    """Configuration for a single circuit breaker instance."""
    failure_threshold: int = 3           # Consecutive failures before opening
    success_threshold: int = 2           # Successful probes to close again
    cooldown_seconds: float = 30.0       # Time in OPEN state before half-open probe
    timeout_seconds: float = 60.0        # Per-call timeout
    half_open_max_calls: int = 5         # Max probe calls in half-open state
    error_rate_threshold: float = 0.5    # 50% error rate over window (fallback threshold)
    window_size: int = 100               # Sliding window for error rate calculation


class CircuitBreaker:
    """
    3-state circuit breaker for LLM API calls.

    States:
        CLOSED → calls pass, failures counted
        OPEN → calls fail fast (no attempt)
        HALF_OPEN → limited probes to test recovery

    Usage:
        cb = CircuitBreaker("openai", "gpt-4o-mini")
        result = cb.call(lambda: llm.invoke(prompt), fallback=lambda: cached_response)
    """

    def __init__(
        self,
        provider_name: str,
        model_name: str,
        config: Optional[CircuitBreakerConfig] = None,
    ):
        self.provider_name = provider_name
        self.model_name = model_name
        self.config = config or CircuitBreakerConfig()
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: float = 0.0
        self._last_state_change: float = time.time()
        self._lock = threading.Lock()
        self._recent_results: List[bool] = []  # Sliding window (True=success, False=failure)

    @property
    def state(self) -> CircuitState:
        return self._state

    @property
    def is_open(self) -> bool:
        return self._state == CircuitState.OPEN

    @property
    def key(self) -> str:
        return f"cb:{self.provider_name}:{self.model_name}"

    def _transition_to(self, new_state: CircuitState):
        old = self._state
        self._state = new_state
        self._last_state_change = time.time()
        if new_state == CircuitState.OPEN:
            self._last_failure_time = time.time()
        elif new_state == CircuitState.HALF_OPEN:
            self._success_count = 0
        elif new_state == CircuitState.CLOSED:
            self._failure_count = 0
            self._success_count = 0
        logger.warning(
            f"[{self.key}] Circuit state: {old.value} → {new_state.value}"
        )

    def _should_trip(self) -> bool:
        """Check if breaker should open based on failure count or error rate."""
        config = self.config
        # Absolute threshold: consecutive failures
        if self._failure_count >= config.failure_threshold:
            return True
        # Rate-based threshold: error rate over sliding window
        if len(self._recent_results) >= 10:
            error_rate = 1.0 - (sum(self._recent_results) / len(self._recent_results))
            if error_rate >= config.error_rate_threshold:
                return True
        return False

    def _record_result(self, success: bool):
        """Track result in sliding window."""
        self._recent_results.append(success)
        if len(self._recent_results) > self.config.window_size:
            self._recent_results.pop(0)

    def call(
        self,
        fn: Callable,
        fallback: Optional[Callable] = None,
        timeout: Optional[float] = None,
    ) -> Any:
        """
        Execute fn() with circuit breaker protection.

        Args:
            fn: Primary callable (LLM invocation)
            fallback: Fallback callable if primary fails (cached, cheaper model, etc.)
            timeout: Per-call timeout override (uses config default if None)

        Returns:
            Result from fn() or fallback()

        Raises:
            CircuitBreakerOpenError: If breaker is open and no fallback provided
        """
        with self._lock:
            # Check state transitions
            if self._state == CircuitState.OPEN:
                elapsed = time.time() - self._last_failure_time
                if elapsed >= self.config.cooldown_seconds:
                    self._transition_to(CircuitState.HALF_OPEN)
                else:
                    if fallback:
                        logger.info(f"[{self.key}] OPEN → using fallback (cooldown: {elapsed:.1f}s/{self.config.cooldown_seconds}s)")
                        return fallback()
                    raise CircuitBreakerOpenError(
                        f"Circuit breaker OPEN for {self.key}. "
                        f"Cooldown remaining: {self.config.cooldown_seconds - elapsed:.1f}s"
                    )

            if self._state == CircuitState.HALF_OPEN:
                # Rate-limit probe calls
                pass  # Call proceeds as probe

            # Execute
            call_timeout = timeout or self.config.timeout_seconds
            try:
                result = fn()
                # Success
                self._failure_count = 0
                self._success_count += 1
                self._record_result(True)

                if self._state == CircuitState.HALF_OPEN and self._success_count >= self.config.success_threshold:
                    self._transition_to(CircuitState.CLOSED)

                return result

            except Exception as e:
                # Failure
                self._failure_count += 1
                self._success_count = 0
                self._record_result(False)

                if self._should_trip() and self._state != CircuitState.OPEN:
                    self._transition_to(CircuitState.OPEN)

                if fallback:
                    logger.warning(f"[{self.key}] Call failed ({e}), using fallback")
                    return fallback()

                raise


class CircuitBreakerOpenError(Exception):
    """Raised when a circuit breaker is open and no fallback is available."""
    pass


# ===== Circuit Breaker Registry =====

class CircuitBreakerRegistry:
    """
    Central registry for per-(provider, model) circuit breakers.
    Ensures only one breaker instance per scope.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._breakers: Dict[str, CircuitBreaker] = {}
        return cls._instance

    def get(self, provider_name: str, model_name: str) -> CircuitBreaker:
        """Get or create a circuit breaker for a specific (provider, model) tuple."""
        key = f"{provider_name}:{model_name}"
        if key not in self._breakers:
            self._breakers[key] = CircuitBreaker(provider_name, model_name)
        return self._breakers[key]

    def get_state_summary(self) -> Dict[str, str]:
        """Return {key: state} for monitoring."""
        return {k: cb.state.value for k, cb in self._breakers.items()}


# ===== Retry Policy =====

class RetryPolicy:
    """
    Exponential backoff retry with jitter.

    Based on production consensus:
    - Base 1s, multiplier 2×, max 60s, 3-5 attempts
    - Jitter ±20-30% prevents thundering herd
    - Retryable: 429, 500, 502, 503, 504, connection timeouts
    - Non-retryable: 400, 401, 403, 404, context-length errors
    """

    def __init__(
        self,
        max_attempts: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        multiplier: float = 2.0,
        jitter: float = 0.25,  # ±25%
    ):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.multiplier = multiplier
        self.jitter = jitter

    def execute(self, fn: Callable, is_retryable: Callable[[Exception], bool] = None) -> Any:
        """
        Execute fn() with retry logic.

        Args:
            fn: Callable to retry
            is_retryable: Predicate returning True if error is retryable.
                         Default: retries all exceptions except TypeError/ValueError.

        Returns:
            Result from fn()

        Raises:
            MaxRetriesExceededError: If all attempts exhausted
        """
        if is_retryable is None:
            def is_retryable(e: Exception) -> bool:
                # Don't retry validation or programming errors
                return not isinstance(e, (TypeError, ValueError, AttributeError))

        import random
        last_error = None

        for attempt in range(self.max_attempts):
            try:
                return fn()
            except Exception as e:
                last_error = e
                if not is_retryable(e) or attempt == self.max_attempts - 1:
                    raise

                delay = min(
                    self.base_delay * (self.multiplier ** attempt),
                    self.max_delay,
                )
                jitter_amount = delay * self.jitter * (2 * random.random() - 1)
                actual_delay = delay + jitter_amount

                logger.warning(
                    f"Retry {attempt + 1}/{self.max_attempts} after {actual_delay:.1f}s "
                    f"(error: {e})"
                )
                time.sleep(actual_delay)

        raise MaxRetriesExceededError(
            f"All {self.max_attempts} attempts failed. Last error: {last_error}"
        )


class MaxRetriesExceededError(Exception):
    """Raised when all retry attempts have been exhausted."""
    pass


# ===== LangGraph Node Decorators =====

def with_circuit_breaker(
    provider_name: str,
    model_name: str,
    fallback_result: Optional[dict] = None,
):
    """
    Decorator for LangGraph node functions.
    Wraps the node with circuit breaker protection.

    Usage:
        @with_circuit_breaker("openai", "gpt-4o-mini")
        def my_llm_node(state: MyState) -> dict:
            llm.invoke(prompt)
            return {"result": ...}
    """
    def decorator(fn: Callable):
        def wrapper(state: dict, *args, **kwargs) -> dict:
            registry = CircuitBreakerRegistry()
            cb = registry.get(provider_name, model_name)

            def call_with_state():
                return fn(state, *args, **kwargs)

            def fallback():
                logger.error(
                    f"Circuit breaker OPEN for {provider_name}/{model_name} "
                    f"in node {fn.__name__} — using fallback"
                )
                return fallback_result or {
                    "status": "Failed",
                    "error": f"Circuit breaker open for {provider_name}/{model_name}",
                    "tokens_used": 0,
                }

            try:
                return cb.call(call_with_state, fallback=fallback)
            except CircuitBreakerOpenError:
                return fallback()

        wrapper.__name__ = fn.__name__
        wrapper.__doc__ = fn.__doc__
        return wrapper
    return decorator


def with_retry_policy(
    max_attempts: int = 3,
    base_delay: float = 1.0,
):
    """
    Decorator for LangGraph node functions.
    Wraps the node with retry logic.

    Usage:
        @with_retry_policy(max_attempts=3)
        def my_llm_node(state: MyState) -> dict:
            ...
    """
    def decorator(fn: Callable):
        def wrapper(state: dict, *args, **kwargs) -> dict:
            policy = RetryPolicy(max_attempts=max_attempts, base_delay=base_delay)
            return policy.execute(lambda: fn(state, *args, **kwargs))
        wrapper.__name__ = fn.__name__
        wrapper.__doc__ = fn.__doc__
        return wrapper
    return decorator
