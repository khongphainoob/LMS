import json
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import ChatbotState


GUARD_SYSTEM = """Bạn là chuyên gia kiểm duyệt nội dung cho chatbot giáo dục.
Phân tích tin nhắn của học sinh và trả về JSON:
{"blocked": true/false, "reason": "lý do ngắn gọn"}

BLOCK nếu:
- Ngôn ngữ thô tục, bạo lực, hoặc không phù hợp lứa tuổi.
- Yêu cầu làm bài tập hộ hoàn toàn (ví dụ: "viết hộ tớ bài văn 500 chữ về...").
- Câu hỏi hoàn toàn không liên quan đến giáo dục (mua sắm, yêu đương, chính trị).

KHÔNG BLOCK nếu:
- Học sinh hỏi để hiểu bản chất vấn đề.
- Học sinh hỏi xin gợi ý cách làm.
- Học sinh chào hỏi hoặc hỏi về khả năng của chatbot.

Chỉ trả về JSON thuần túy."""


def guard_node(state: ChatbotState) -> dict:
    from lms.lms.agents.provider import get_llm
    
    # Dữ liệu đã được nạp sẵn từ context_node
    student_display_name = state.get("student_display_name") or "học sinh"
    
    llm = get_llm("chatbot", temperature=0)

    messages = [
        SystemMessage(content=GUARD_SYSTEM),
        HumanMessage(content=f"Học sinh: {student_display_name}\nTin nhắn: {state['user_message']}")
    ]

    updates = {}

    try:
        result = llm.invoke(messages)
        clean_content = result.content.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean_content)
        
        if data.get("blocked"):
            updates.update({
                "is_blocked": True,
                "block_reason": data.get("reason", "Nội dung không phù hợp"),
                "response": f"⚠️ Chào {student_display_name}, mình không thể hỗ trợ yêu cầu này vì: {data.get('reason', 'Nội dung không phù hợp cho môi trường học tập')}.",
                "message_type": "blocked"
            })
            return updates
    except Exception:
        pass

    updates["is_blocked"] = False
    return updates
