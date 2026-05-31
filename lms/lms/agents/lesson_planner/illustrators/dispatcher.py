import frappe
from lms.lms.agents.lesson_planner.state import LessonPlanState

def route_illustrator(state: LessonPlanState) -> str:
    """
    Conditional edge router for LangGraph.
    Chooses the best visual illustrator agent based on the lesson's subject.
    """
    subject = (state.get("subject") or "").lower()
    reqs = (state.get("custom_requirements") or "").lower()
    output_format = state.get("output_format") or "lms_native"
    
    # 0. If user specifically requested TikZ or LaTeX native graphics, skip external visual agents
    if "tikz" in reqs or "pgfplots" in reqs:
        # We can route to a dummy or just bypass. Since we must return a valid node,
        # we'll use mermaid_agent but we need to tell it to skip. Wait, let's just 
        # add a 'skip_illustrator' edge or route directly to 'assessment'
        return "assessment"
    # 1. Math/Physics -> Matplotlib (Precise code-driven diagrams) OR TikZ
    MATPLOTLIB_SUBJECTS = ["toán", "vật lý", "math", "physics", "thống kê", "algebra", "geometry"]
    if any(s in subject for s in MATPLOTLIB_SUBJECTS):
        if output_format == "latex":
            return "tikz_agent"
        return "matplotlib_agent"
        
    # 2. Biology/Geography/History -> AI Image Generation
    IMAGE_GEN_SUBJECTS = ["sinh học", "địa lý", "lịch sử", "biology", "geography", "history", "địa lý"]
    if any(s in subject for s in IMAGE_GEN_SUBJECTS):
        return "image_gen_agent"
        
    # 3. Default: Mermaid (Flowcharts, mindmaps, structural flows)
    return "mermaid_agent"

def illus_dispatch(state: LessonPlanState) -> dict:
    """
    Dispatcher Node. Updates Frappe status to 'Illustrating'.
    """
    teacher_id = state.get("teacher")
    plan_doc_name = state.get("plan_doc_name")
    
    try:
        if plan_doc_name:
            frappe.db.set_value("AI Lesson Plan", plan_doc_name, "status", "Illustrating")
            frappe.db.commit()
    except Exception:
        pass
        
    return {
        "status": "Illustrating"
    }
