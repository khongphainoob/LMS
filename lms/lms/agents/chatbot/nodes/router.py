import json
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import ChatbotState


ROUTER_SYSTEM = """Phân loại câu hỏi của học sinh vào 1 trong 3 nhóm:
1. "qa": Giải thích kiến thức, định nghĩa, ví dụ về bài học.
2. "quiz": Yêu cầu kiểm tra kiến thức, tạo câu hỏi trắc nghiệm/tự luận.
3. "hint": Học sinh đang kẹt ở một bài tập cụ thể và xin gợi ý (không phải đáp án).

Trả về JSON: {"type": "qa" | "quiz" | "hint"}
Chỉ trả về JSON thuần túy."""


def router_node(state: ChatbotState) -> dict:
    from lms.lms.agents.provider import get_llm
    
    llm = get_llm("chatbot", temperature=0)

    messages = [
        SystemMessage(content=ROUTER_SYSTEM),
        HumanMessage(content=state["user_message"])
    ]

    try:
        result = llm.invoke(messages)
        clean_content = result.content.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean_content)
        msg_type = data.get("type", "qa")
        if msg_type not in ("qa", "quiz", "hint"):
            msg_type = "qa"
    except Exception:
        msg_type = "qa"

    print(f"--- [NODE: ROUTER] Identified type: {msg_type} ---")
    return {"message_type": msg_type}
