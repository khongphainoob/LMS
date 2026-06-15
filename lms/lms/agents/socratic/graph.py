"""Socratic Tutor Graph — LangGraph StateGraph implementation.

Flow:
1. First message (with image): preprocess → context_builder → evaluator → END
2. Follow-up messages: preprocess → context_builder → evaluator → socratic_hint → END
3. All responses validated via shared content_validator before delivery
"""
import frappe
from langgraph.graph import StateGraph, END, START

from .nodes.preprocess import preprocess_node
from .nodes.context_builder import context_builder_node
from .nodes.evaluator import evaluator_node
from .nodes.socratic_hint import socratic_hint_node
from .nodes.answer_revealer import answer_revealer_node
from .state import SocraticState

# === REUSABLE SHARED NODES ===
from lms.lms.agents.shared_nodes.content_validator import content_validator_node, ValidatorContext
from lms.lms.agents.shared_nodes.confidence_router import route_by_confidence, build_confidence_route_map


def route_after_evaluation(state: dict) -> str:
    """Route based on whether evaluator already produced a full response."""
    response = state.get("response")
    message_type = state.get("message_type", "")

    if response and message_type == "analysis":
        frappe.logger("socratic").info("[router] → END (analysis complete)")
        return "end"

    mistake_count = state.get("mistake_count", 0)
    if mistake_count >= 3:
        frappe.logger("socratic").info(f"[router] → answer_revealer (mistakes={mistake_count})")
        return "answer_revealer"

    frappe.logger("socratic").info(f"[router] → socratic_hint (mistakes={mistake_count})")
    return "socratic_hint"


def build_socratic_graph():
    """Build and compile the Socratic Tutor graph with content validation."""
    graph = StateGraph(SocraticState)

    graph.add_node("preprocess", preprocess_node)
    graph.add_node("context_builder", context_builder_node)
    graph.add_node("evaluator", evaluator_node)
    graph.add_node("socratic_hint", socratic_hint_node)
    graph.add_node("answer_revealer", answer_revealer_node)

    # Pre-delivery content validation gate
    validator_ctx = ValidatorContext(
        agent_name="socratic",
        content_field="response",
        enabled_dimensions=["PA", "PS"],
    )
    graph.add_node("content_validator", lambda s: content_validator_node(s, validator_ctx))

    graph.add_edge(START, "preprocess")
    graph.add_edge("preprocess", "context_builder")
    graph.add_edge("context_builder", "evaluator")

    graph.add_conditional_edges(
        "evaluator",
        route_after_evaluation,
        {
            "socratic_hint": "socratic_hint",
            "answer_revealer": "answer_revealer",
            "end": END,
        },
    )

    # Response paths → validator → route
    graph.add_edge("socratic_hint", "content_validator")
    graph.add_edge("answer_revealer", "content_validator")

    route_map = build_confidence_route_map()
    graph.add_conditional_edges("content_validator", route_by_confidence, route_map)

    return graph.compile()


# Build the graph at module load
try:
    socratic_graph = build_socratic_graph()
except Exception as e:
    frappe.logger("socratic").error(f"Failed to build socratic graph: {e}")

    class FallbackGraph:
        def invoke(self, state):
            return {
                **state,
                "response": "Xin chào! Hệ thống Socratic Tutor đang được khởi tạo. Vui lòng thử lại sau.",
                "message_type": "socratic_hint",
                "tokens_used": 0,
            }
    socratic_graph = FallbackGraph()
