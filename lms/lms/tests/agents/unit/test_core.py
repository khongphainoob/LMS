"""
Unit tests for core/ foundation layer.

Tests BaseAgentState, CircuitBreaker, RetryPolicy, and AgentConfig
without requiring a running Frappe site or database.
"""

import unittest
import sys
import os

# Path setup for Frappe-less testing
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))


class TestBaseAgentState(unittest.TestCase):
    """Test that BaseAgentState works with TypedDict inheritance."""

    def test_inheritance_basic(self):
        """BaseAgentState fields are accessible."""
        from typing import TypedDict, Optional
        from lms.lms.agents.core.base_state import BaseAgentState

        class TestState(BaseAgentState):
            custom_field: str

        state: TestState = {
            "custom_field": "hello",
            "tokens_used": 42,
            "status": "Processing",
            "error": None,
            "agent_name": "test",
        }
        self.assertEqual(state["custom_field"], "hello")
        self.assertEqual(state["tokens_used"], 42)
        self.assertEqual(state["status"], "Processing")

    def test_merge_usage_metrics(self):
        """merge_usage_metrics accumulates token counts correctly."""
        from lms.lms.agents.core.base_state import merge_usage_metrics

        base = {"tokens_used": 100, "total_cost_usd": 0.01}
        updated = merge_usage_metrics(base, {"tokens_used": 50, "total_cost_usd": 0.005})
        self.assertEqual(updated["tokens_used"], 150)
        self.assertAlmostEqual(updated["total_cost_usd"], 0.015)

    def test_create_error_state(self):
        """create_error_state returns a valid error dict."""
        from lms.lms.agents.core.base_state import create_error_state

        err = create_error_state("Something broke", "test_agent")
        self.assertEqual(err["status"], "Failed")
        self.assertEqual(err["error"], "Something broke")
        self.assertEqual(err["agent_name"], "test_agent")
        self.assertEqual(err["tokens_used"], 0)


class TestCircuitBreaker(unittest.TestCase):
    """Test CircuitBreaker state transitions."""

    def test_initial_state_closed(self):
        """New circuit breaker starts CLOSED."""
        from lms.lms.agents.core.fault_tolerance import CircuitBreaker
        cb = CircuitBreaker("openai", "gpt-4o-mini")
        self.assertEqual(cb.state.value, "closed")
        self.assertEqual(cb.key, "cb:openai:gpt-4o-mini")

    def test_call_happy_path(self):
        """Successful calls pass through."""
        from lms.lms.agents.core.fault_tolerance import CircuitBreaker
        cb = CircuitBreaker("test", "test-model")
        result = cb.call(lambda: "success")
        self.assertEqual(result, "success")
        self.assertEqual(cb.state.value, "closed")

    def test_fallback_on_failure(self):
        """Fallback is used when call fails."""
        from lms.lms.agents.core.fault_tolerance import CircuitBreaker
        cb = CircuitBreaker("test", "test-model")
        result = cb.call(
            lambda: (_ for _ in ()).throw(Exception("fail")),  # raise Exception
            fallback=lambda: "fallback_value",
        )
        self.assertEqual(result, "fallback_value")


class TestRetryPolicy(unittest.TestCase):
    """Test RetryPolicy behavior."""

    def test_success_no_retry(self):
        """Successful first attempt returns immediately."""
        from lms.lms.agents.core.fault_tolerance import RetryPolicy
        rp = RetryPolicy(max_attempts=3)
        result = rp.execute(lambda: "ok")
        self.assertEqual(result, "ok")

    def test_retry_then_succeed(self):
        """Retries and succeeds on 3rd attempt."""
        from lms.lms.agents.core.fault_tolerance import RetryPolicy
        rp = RetryPolicy(max_attempts=5, base_delay=0.01)

        tries = [0]

        def flaky():
            tries[0] += 1
            if tries[0] < 3:
                raise ConnectionError("transient error")
            return "eventually ok"

        result = rp.execute(flaky)
        self.assertEqual(result, "eventually ok")
        self.assertEqual(tries[0], 3)

    def test_non_retryable_raises_immediately(self):
        """TypeError does not trigger retries."""
        from lms.lms.agents.core.fault_tolerance import RetryPolicy
        rp = RetryPolicy(max_attempts=3, base_delay=0.01)
        with self.assertRaises(TypeError):
            rp.execute(lambda: 1 + "string")


class TestAgentRegistry(unittest.TestCase):
    """Test agent name registry."""

    def test_get_all_agent_names(self):
        """Registry returns 7 agents."""
        from lms.lms.agents.core.registry import get_all_agent_names
        names = get_all_agent_names()
        self.assertIn("chatbot", names)
        self.assertIn("lesson_planner", names)
        self.assertIn("grading", names)
        self.assertEqual(len(names), 7)

    def test_get_content_producers(self):
        """Content producers exclude evaluation-only agents."""
        from lms.lms.agents.core.registry import get_content_producers
        producers = get_content_producers()
        self.assertIn("chatbot", producers)
        self.assertIn("lesson_planner", producers)
        self.assertEqual(len(producers), 6)

    def test_get_hitl_agents(self):
        """HITL agents are lesson_planner and exam_generator."""
        from lms.lms.agents.core.registry import get_hitl_agents
        hitl = get_hitl_agents()
        self.assertIn("lesson_planner", hitl)
        self.assertIn("exam_generator", hitl)
        self.assertEqual(len(hitl), 2)


class TestSchemas(unittest.TestCase):
    """Test centralized schemas instantiate correctly."""

    def test_usage_metrics(self):
        from lms.lms.agents.schemas.base import UsageMetrics
        m = UsageMetrics(prompt_tokens=100, completion_tokens=50, total_tokens=150, cost_usd=0.002)
        self.assertEqual(m.total_tokens, 150)

    def test_evaluation_result(self):
        from lms.lms.agents.schemas.evaluation import EvaluationResult
        r = EvaluationResult(
            overall_score=4.5,
            dimension_scores=[],
            delivery_decision="auto_deliver",
            needs_human_review=False,
            flagged_content=[],
            summary="Pass",
        )
        self.assertEqual(r.delivery_decision, "auto_deliver")

    def test_quiz_schema(self):
        from lms.lms.agents.schemas.quiz import QuizSchema, QuizQuestionSchema
        q = QuizQuestionSchema(question="What is 2+2?", type="Choices", points=1)
        self.assertEqual(q.type, "Choices")


if __name__ == "__main__":
    unittest.main()
