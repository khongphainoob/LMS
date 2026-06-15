"""
Unit tests for shared_nodes — safety, HITL, JSON, router, content validator.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))


class TestSafetyGuard(unittest.TestCase):
    """Test safety guard node."""

    def test_config_defaults(self):
        from lms.lms.agents.shared_nodes.safety_guard import SafetyGuardConfig
        cfg = SafetyGuardConfig()
        self.assertEqual(cfg.agent_name, "default")
        self.assertEqual(cfg.temperature, 0.0)

    @unittest.skip("Requires API key — run manually with bench test")
    def test_simple_message_not_blocked(self):
        """A polite greeting should not be blocked. (SKIP: needs API key)"""
        from lms.lms.agents.shared_nodes.safety_guard import safety_guard_node, SafetyGuardConfig
        cfg = SafetyGuardConfig(agent_name="test")
        result = safety_guard_node(
            {"user_message": "Em chào cô ạ", "student_display_name": "Học sinh"},
            cfg,
        )
        self.assertFalse(result["is_blocked"])


class TestJsonExtractor(unittest.TestCase):
    """Test JSON extraction from LLM output."""

    def test_pure_json_object(self):
        from lms.lms.agents.shared_nodes.json_extractor import extract_json
        result = extract_json('{"key": "value"}', "object")
        self.assertEqual(result, {"key": "value"})

    def test_json_in_code_block(self):
        from lms.lms.agents.shared_nodes.json_extractor import extract_json
        result = extract_json('```json\n{"a": 1}\n```', "object")
        self.assertEqual(result, {"a": 1})

    def test_json_array(self):
        from lms.lms.agents.shared_nodes.json_extractor import extract_json
        result = extract_json('[1, 2, 3]', "array")
        self.assertEqual(result, [1, 2, 3])

    def test_trailing_comma_cleaned(self):
        from lms.lms.agents.shared_nodes.json_extractor import extract_json
        result = extract_json('{"key": "value",}', "object")
        self.assertEqual(result, {"key": "value"})

    def test_extract_and_validate(self):
        from lms.lms.agents.shared_nodes.json_extractor import extract_and_validate
        from lms.lms.agents.schemas.evaluation import ConfidenceScore
        result = extract_and_validate(
            '{"score": 0.95, "reasoning": "test", "hallucination_risk": "low"}',
            ConfidenceScore,
        )
        self.assertIsNotNone(result)


class TestConfidenceRouter(unittest.TestCase):
    """Test confidence-based routing logic."""

    def test_high_confidence_deliver(self):
        from lms.lms.agents.shared_nodes.confidence_router import route_by_confidence
        result = route_by_confidence({"confidence": 0.95})
        self.assertEqual(result, "deliver")

    def test_medium_confidence_warn(self):
        from lms.lms.agents.shared_nodes.confidence_router import route_by_confidence
        result = route_by_confidence({"confidence": 0.75})
        self.assertEqual(result, "deliver_with_warning")

    def test_low_confidence_hitl(self):
        from lms.lms.agents.shared_nodes.confidence_router import route_by_confidence
        result = route_by_confidence({"confidence": 0.4})
        self.assertEqual(result, "hitl_review")

    def test_evaluation_based_routing(self):
        from lms.lms.agents.shared_nodes.confidence_router import route_by_confidence
        result = route_by_confidence({
            "evaluation_result": {
                "overall_score": 4.5,
                "delivery_decision": "auto_deliver",
            }
        })
        self.assertEqual(result, "deliver")

    def test_route_map_defaults(self):
        from lms.lms.agents.shared_nodes.confidence_router import build_confidence_route_map
        from langgraph.graph import END
        route_map = build_confidence_route_map()
        self.assertEqual(route_map["deliver"], END)
        self.assertEqual(route_map["hitl_review"], END)


class TestContentValidator(unittest.TestCase):
    """Test content validator node."""

    def test_skip_validation(self):
        from lms.lms.agents.shared_nodes.content_validator import content_validator_node, ValidatorContext
        ctx = ValidatorContext(skip_validation=True)
        result = content_validator_node({"response": "test"}, ctx)
        self.assertEqual(result["delivery_decision"], "auto_deliver")
        self.assertFalse(result["needs_review"])

    def test_empty_content(self):
        from lms.lms.agents.shared_nodes.content_validator import content_validator_node
        result = content_validator_node({"response": ""})
        self.assertEqual(result["delivery_decision"], "regenerate")

    def test_format_check_pass(self):
        from lms.lms.agents.shared_nodes.content_validator import _check_format
        score = _check_format("# Introduction\n\nThis is a lesson about Newton's laws of motion. The first law states that an object at rest stays at rest.")
        self.assertGreaterEqual(score, 3)

    def test_format_check_fail_empty(self):
        from lms.lms.agents.shared_nodes.content_validator import _check_format
        score = _check_format("")
        self.assertEqual(score, 1)


class TestCircuitBreakerWrapper(unittest.TestCase):
    """Test circuit breaker node wrapper."""

    def test_happy_path(self):
        from lms.lms.agents.shared_nodes.circuit_breaker import with_circuit_breaker_wrapper, CircuitBreakerNodeConfig
        cfg = CircuitBreakerNodeConfig(provider="test", model="test")

        def my_node(state):
            return {"result": "ok", **state}

        wrapped = with_circuit_breaker_wrapper(cfg)(my_node)
        result = wrapped({"input": "test"})
        self.assertEqual(result["result"], "ok")

    def test_fallback_on_error(self):
        from lms.lms.agents.shared_nodes.circuit_breaker import with_circuit_breaker_wrapper, CircuitBreakerNodeConfig
        cfg = CircuitBreakerNodeConfig(provider="test", model="test", max_retries=1, base_delay=0.01)

        def failing_node(state):
            raise RuntimeError("LLM unavailable")

        wrapped = with_circuit_breaker_wrapper(cfg)(failing_node)
        result = wrapped({"input": "test"})
        self.assertEqual(result["status"], "Failed")


class TestHITLConfig(unittest.TestCase):
    """Test HITL configuration."""

    def test_defaults(self):
        from lms.lms.agents.shared_nodes.hitl_interrupt import HITLConfig
        cfg = HITLConfig()
        self.assertEqual(cfg.max_revisions, 3)
        self.assertEqual(cfg.review_count_field, "review_count")


class TestPrompts(unittest.TestCase):
    """Test centralized prompt registry."""

    def test_get_prompt_exists(self):
        from lms.lms.agents.prompts import get_prompt
        prompt = get_prompt("guard_system")
        self.assertIsNotNone(prompt)
        self.assertIn("BLOCK", prompt)

    def test_get_prompt_not_found(self):
        from lms.lms.agents.prompts import get_prompt
        self.assertIsNone(get_prompt("nonexistent"))

    def test_list_by_tag(self):
        from lms.lms.agents.prompts import list_prompts_by_tag
        evals = list_prompts_by_tag("evaluation")
        self.assertEqual(len(evals), 2)  # content_eval + pedagogy_eval

    def test_registry_count(self):
        from lms.lms.agents.prompts import PROMPT_REGISTRY
        self.assertEqual(len(PROMPT_REGISTRY), 7)


if __name__ == "__main__":
    unittest.main()
