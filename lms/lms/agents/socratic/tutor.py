import frappe
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END, START
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from lms.lms.agents.provider import get_llm

class SocraticState(TypedDict):
    user_message: str
    student_name: str
    lesson_name: Optional[str]
    session_key: str
    
    lesson_content: Optional[str]
    chat_history: list
    scaffolding_level: int # 0 to 4
    image_data: Optional[str]
    rubric_data: Optional[str]
    
    response: Optional[str]
    tokens_used: int
    model_used: str

def socratic_node(state: SocraticState) -> SocraticState:
    llm, _, _ = get_llm("socratic_tutor")
    model_name = "socratic_tutor"
    
    level = state.get("scaffolding_level", 0)
    history = state.get("chat_history", [])
    
    system_prompts = {
        0: "You are a Socratic AI Tutor. The student is asking a question. DO NOT GIVE THE DIRECT ANSWER. Ask a clarifying question to discover what the student already knows about the topic. Encourage them to think.",
        1: "You are a Socratic AI Tutor. Provide a very small hint, a related concept, or an analogy, then ask a guiding question to help them deduce the answer. STILL DO NOT GIVE THE ANSWER.",
        2: "You are a Socratic AI Tutor. Break down the student's problem into smaller, manageable steps. Help the student solve the first step or point out the exact area they should focus on.",
        3: "You are a Socratic AI Tutor. Provide a strong hint or briefly explain the core concept needed to solve the problem, but leave the final conclusion/calculation to the student.",
        4: "You are a Socratic AI Tutor. The student is struggling. Explain the answer clearly and step-by-step. End your explanation with a follow-up question to verify they truly understand."
    }
    
    import base64
    rubric_text = ""
    if state.get("rubric_data"):
        try:
            # Handle data:text/plain;base64,...
            b64_part = state["rubric_data"].split(",")[-1]
            decoded_bytes = base64.b64decode(b64_part)
            rubric_text = decoded_bytes.decode('utf-8', errors='ignore')
        except Exception:
            rubric_text = "[Could not decode rubric. Please ensure it's a plain text file]"

    sys_prompt = system_prompts.get(level, system_prompts[0])
    sys_prompt += "\n\nRespond in the language of the student's prompt (mostly Vietnamese)."
    sys_prompt += f"\n\nContext/Lesson Content:\n{state.get('lesson_content', 'General Knowledge')}"
    
    if rubric_text:
        sys_prompt += f"\n\nGrading Rubric:\n{rubric_text}"
    
    messages = [SystemMessage(content=sys_prompt)]
    
    for msg in history[-6:]: # context window
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg.get("content")))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg.get("content")))
            
    # Prepare user message with potential image
    user_content = []
    if state.get("user_message"):
        user_content.append({"type": "text", "text": state["user_message"]})
        
    if state.get("image_data"):
        try:
            b64_img = state["image_data"].split(",")[-1]
            user_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}
            })
        except Exception:
            pass
            
    if not user_content:
        user_content.append({"type": "text", "text": "Please see attached image or rubric."})
        
    messages.append(HumanMessage(content=user_content))
    
    res = llm.invoke(messages)
    
    # Try to extract token usage, fallback to 0
    tokens = 0
    if hasattr(res, 'usage_metadata') and res.usage_metadata:
        tokens = res.usage_metadata.get("total_tokens", 0)
    
    return {
        "response": res.content,
        "tokens_used": tokens,
        "model_used": model_name
    }

def build_socratic_graph():
    graph = StateGraph(SocraticState)
    graph.add_node("tutor", socratic_node)
    graph.add_edge(START, "tutor")
    graph.add_edge("tutor", END)
    return graph.compile()

socratic_graph = build_socratic_graph()
