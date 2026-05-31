import time
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from ..state import ChatbotState
from ..prompts.system import build_system_prompt


def hint_node(state: ChatbotState) -> dict:
    """Provides step-by-step guidance without direct answers."""
    from lms.lms.agents.provider import get_llm, get_agent_config
    start_ms = int(time.time() * 1000)
    
    llm, model_name, _ = get_llm("chatbot", temperature=0.2)

    base_prompt = build_system_prompt(state)
    hint_instruction = """
--- CHẾ ĐỘ GỢI Ý ---
Học sinh đang yêu cầu hướng dẫn làm bài hoặc xin đáp án.
NHIỆM VỤ CỦA BẠN:
1. TUYỆT ĐỐI KHÔNG đưa ra đáp án trực tiếp.
2. Hãy gợi mở vấn đề bằng cách nhắc lại các kiến thức liên quan trong bài học.
3. Chia nhỏ vấn đề thành các bước cực nhỏ để học sinh tự làm.
4. Hỏi ngược lại học sinh để kiểm tra mức độ hiểu của các em.
5. Nếu học sinh nói sai, hãy khen sự nỗ lực rồi chỉ ra điểm cần xem lại một cách tinh tế.
"""
    
    full_system = base_prompt + "\n" + hint_instruction
    messages = [SystemMessage(content=full_system)]

    history = state.get("chat_history", [])[-6:]
    for msg in history:
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=state["user_message"]))

    result = llm.invoke(messages)
    latency = int(time.time() * 1000) - start_ms

    return {
        "response": result.content,
        "tokens_used": 0, # Simplified for now
        "latency_ms": latency,
        "model_used": model_name
    }
