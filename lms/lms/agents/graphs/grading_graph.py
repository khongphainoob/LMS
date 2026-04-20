from __future__ import annotations

import importlib
from typing import Any

from ..nodes.grading_nodes import (
    aggregate_node,
    apply_review_node,
    grade_questions_node,
    load_submission_node,
    split_questions_node,
)


def build_grading_graph() -> Any:
    """Build LangGraph workflow lazily so project can boot without langgraph installed."""
    try:
        graph_module = importlib.import_module("langgraph.graph")
        END = getattr(graph_module, "END")
        START = getattr(graph_module, "START")
        StateGraph = getattr(graph_module, "StateGraph")
    except ImportError as error:
        raise ValueError(
            "langgraph is required to build grading graph. Install with: pip install langgraph"
        ) from error

    from ..state import AgentState

    workflow = StateGraph(AgentState)

    workflow.add_node("load_submission", load_submission_node)
    workflow.add_node("split_questions", split_questions_node)
    workflow.add_node("grade_questions", grade_questions_node)
    workflow.add_node("aggregate", aggregate_node)
    workflow.add_node("apply_review", apply_review_node)

    workflow.add_edge(START, "load_submission")
    workflow.add_edge("load_submission", "split_questions")
    workflow.add_edge("split_questions", "grade_questions")
    workflow.add_edge("grade_questions", "aggregate")
    workflow.add_edge("aggregate", "apply_review")
    workflow.add_edge("apply_review", END)

    return workflow.compile()
