from langgraph.graph import StateGraph, END, START
print("🚀 [SYSTEM] Chatbot Graph Module Loaded Successfully!")
from .state import ChatbotState
from .nodes.guard import guard_node
from .nodes.context import context_node
from .nodes.router import router_node
from .nodes.qa import qa_node
from .nodes.quiz import quiz_node
from .nodes.hint import hint_node

# === REUSABLE SHARED NODES ===
from lms.lms.agents.shared_nodes.content_validator import content_validator_node, ValidatorContext
from lms.lms.agents.shared_nodes.confidence_router import route_by_confidence, build_confidence_route_map


def should_continue(state: ChatbotState) -> str:
    """Decision edge after safety check."""
    if state.get("is_blocked"):
        return "blocked"
    return "continue"


def route_message(state: ChatbotState) -> str:
    """Specialist routing."""
    return state.get("message_type", "qa")


def build_chatbot_graph():
    graph = StateGraph(ChatbotState)

    # Add Nodes
    graph.add_node("guard", guard_node)
    graph.add_node("context", context_node)
    graph.add_node("router", router_node)
    graph.add_node("qa", qa_node)
    graph.add_node("quiz", quiz_node)
    graph.add_node("hint", hint_node)

    # Pre-delivery content validation gate
    validator_ctx = ValidatorContext(
        agent_name="chatbot",
        content_field="response",
        enabled_dimensions=["PA", "PS", "FC"],
    )
    graph.add_node("content_validator", lambda s: content_validator_node(s, validator_ctx))

    # Define Edges
    graph.add_edge(START, "context")
    graph.add_edge("context", "guard")

    graph.add_conditional_edges(
        "guard",
        should_continue,
        {
            "blocked": END,
            "continue": "router"
        }
    )

    graph.add_conditional_edges(
        "router",
        route_message,
        {
            "qa": "qa",
            "quiz": "quiz",
            "hint": "hint"
        }
    )

    # Specialists → content_validator → route
    graph.add_edge("qa", "content_validator")
    graph.add_edge("quiz", "content_validator")
    graph.add_edge("hint", "content_validator")

    route_map = build_confidence_route_map()
    graph.add_conditional_edges("content_validator", route_by_confidence, route_map)

    return graph.compile()


# Singleton
chatbot_graph = build_chatbot_graph()
