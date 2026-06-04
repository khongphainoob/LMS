import frappe
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt
from lms.lms.agents.lesson_planner.state import LessonPlanState

from lms.lms.agents.lesson_planner.nodes.retriever import retriever_node
from lms.lms.agents.lesson_planner.nodes.planner import planner_node
from lms.lms.agents.lesson_planner.nodes.writer import writer_node
from lms.lms.agents.lesson_planner.nodes.human_review import human_review_node

from lms.lms.agents.lesson_planner.illustrators.dispatcher import illus_dispatch, route_illustrator
from lms.lms.agents.lesson_planner.illustrators.mermaid_agent import mermaid_node
from lms.lms.agents.lesson_planner.illustrators.matplotlib_agent import matplotlib_node
from lms.lms.agents.lesson_planner.illustrators.image_gen_agent import image_gen_node
from lms.lms.agents.lesson_planner.illustrators.tikz_agent import tikz_node

from lms.lms.agents.lesson_planner.nodes.illustration_planner import illustration_planner_node
from lms.lms.agents.lesson_planner.nodes.assessment import assessment_node
from lms.lms.agents.lesson_planner.nodes.formatter import formatter_node
from lms.lms.doctype.agent_log.agent_log import AgentLog

def log_wrapper(node_name, func):
    # Trả về func luôn vì LMSUnifiedCallbackHandler đã lo việc tracking on_chain_start/end
    return func

def route_after_review(state):
    review_status = state.get("review_status") or "approved"
    if review_status == "revised":
        return "writer"
    return "illustration_planner"


def build_lesson_planner_graph():
    graph = StateGraph(LessonPlanState)
    
    # 1. Register Nodes
    graph.add_node("retriever", log_wrapper("retriever", retriever_node))
    graph.add_node("planner", log_wrapper("planner", planner_node))
    graph.add_node("writer", log_wrapper("writer", writer_node))
    graph.add_node("human_review", log_wrapper("human_review", human_review_node))
    
    graph.add_node("illustration_planner", log_wrapper("illustration_planner", illustration_planner_node))
    graph.add_node("illus_dispatcher", log_wrapper("illus_dispatcher", illus_dispatch))
    graph.add_node("mermaid_agent", log_wrapper("mermaid_agent", mermaid_node))
    graph.add_node("matplotlib_agent", log_wrapper("matplotlib_agent", matplotlib_node))
    graph.add_node("image_gen_agent", log_wrapper("image_gen_agent", image_gen_node))
    graph.add_node("tikz_agent", log_wrapper("tikz_agent", tikz_node))
    
    graph.add_node("assessment", log_wrapper("assessment", assessment_node))
    graph.add_node("formatter", log_wrapper("formatter", formatter_node))
    
    # 2. Register Edges
    graph.add_edge(START, "retriever")
    graph.add_edge("retriever", "planner")
    graph.add_edge("planner", "writer")
    graph.add_edge("writer", "human_review")
    
    # HITL conditional edge
    graph.add_conditional_edges("human_review", route_after_review, {
        "illustration_planner": "illustration_planner",
        "writer": "writer"
    })
    
    graph.add_edge("illustration_planner", "illus_dispatcher")
    
    # Illustrator dispatch conditional edge
    graph.add_conditional_edges("illus_dispatcher", route_illustrator, {
        "mermaid_agent": "mermaid_agent",
        "matplotlib_agent": "matplotlib_agent",
        "image_gen_agent": "image_gen_agent",
        "tikz_agent": "tikz_agent",
        "assessment": "assessment"
    })
    
    # Merge visual sub-agents to Assessment
    graph.add_edge("mermaid_agent", "assessment")
    graph.add_edge("matplotlib_agent", "assessment")
    graph.add_edge("image_gen_agent", "assessment")
    graph.add_edge("tikz_agent", "assessment")
    
    # Final path
    graph.add_edge("assessment", "formatter")
    graph.add_edge("formatter", END)
    
    # 3. Add Sqlite Checkpointer for HITL interrupt state recovery
    from langgraph.checkpoint.sqlite import SqliteSaver
    import sqlite3
    import os
    
    db_path = "__PLACEHOLDER__"
    # Ensure directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    conn = sqlite3.connect(db_path, check_same_thread=False)
    checkpointer = SqliteSaver(conn)
    
    return graph.compile(checkpointer=checkpointer)
