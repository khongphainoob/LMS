"""Socratic Tutor Graph – LangGraph StateGraph implementation.

Flow:
1. First message (with image): preprocess → context_builder → evaluator → END
   - Evaluator calls LLM to analyze student's work and returns detailed analysis
2. Follow-up messages: preprocess → context_builder → evaluator → socratic_hint → END
   - Evaluator checks context, socratic_hint generates Socratic questions
"""
import frappe
from langgraph.graph import StateGraph, END, START

from .nodes.preprocess import preprocess_node
from .nodes.context_builder import context_builder_node
from .nodes.evaluator import evaluator_node
from .nodes.socratic_hint import socratic_hint_node
from .nodes.answer_revealer import answer_revealer_node
from .state import SocraticState


def route_after_evaluation(state: dict) -> str:
    """Route based on whether evaluator already produced a full response.
    - If evaluator generated a response (first-time analysis) → END
    - If student needs hints → socratic_hint
    - If too many attempts → answer_revealer
    """
    response = state.get("response")
    message_type = state.get("message_type", "")
    
    # If evaluator already produced a full analysis response, go to END
    if response and message_type == "analysis":
        frappe.logger("socratic").info("[router] → END (analysis complete)")
        return "end"
    
    # Check mistake count for hint vs reveal
    mistake_count = state.get("mistake_count", 0)
    if mistake_count >= 3:
        frappe.logger("socratic").info(f"[router] → answer_revealer (mistakes={mistake_count})")
        return "answer_revealer"
    
    frappe.logger("socratic").info(f"[router] → socratic_hint (mistakes={mistake_count})")
    return "socratic_hint"


def build_socratic_graph():
    """Build and compile the Socratic Tutor graph."""
    graph = StateGraph(SocraticState)

    graph.add_node("preprocess", preprocess_node)
    graph.add_node("context_builder", context_builder_node)
    graph.add_node("evaluator", evaluator_node)
    graph.add_node("socratic_hint", socratic_hint_node)
    graph.add_node("answer_revealer", answer_revealer_node)

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

    graph.add_edge("socratic_hint", END)
    graph.add_edge("answer_revealer", END)

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
