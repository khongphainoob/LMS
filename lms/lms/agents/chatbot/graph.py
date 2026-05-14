from langgraph.graph import StateGraph, END, START
print("🚀 [SYSTEM] Chatbot Graph Module Loaded Successfully!")
from .state import ChatbotState
from .nodes.guard import guard_node
from .nodes.context import context_node
from .nodes.router import router_node
from .nodes.qa import qa_node
from .nodes.quiz import quiz_node
from .nodes.hint import hint_node


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

    # Specialists all flow to END
    graph.add_edge("qa", END)
    graph.add_edge("quiz", END)
    graph.add_edge("hint", END)

    return graph.compile()


# Singleton
chatbot_graph = build_chatbot_graph()
