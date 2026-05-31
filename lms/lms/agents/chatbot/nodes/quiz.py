import time
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import ChatbotState


def quiz_node(state: ChatbotState) -> dict:
    from lms.lms.agents.provider import get_llm, get_agent_config
    start_ms = int(time.time() * 1000)
    
    llm, model_name, _ = get_llm("chatbot", temperature=0.7)

    lesson_title = state.get("lesson_title", "bài học này")
    lesson_content = state.get("lesson_content", "")[:30000]

    system = f"""Bạn là trợ lý giáo dục. Nhiệm vụ của bạn là tạo một bài kiểm tra nhỏ (3-5 câu) để giúp học sinh tự kiểm tra kiến thức về bài: {lesson_title}.

Dựa trên nội dung sau:
{lesson_content}

YÊU CẦU:
1. Câu hỏi đa dạng (trắc nghiệm, điền khuyết, hoặc câu hỏi ngắn).
2. Độ khó tăng dần.
3. Sử dụng tiếng Việt thân thiện.
4. KHÔNG hiển thị đáp án ngay lập tức. Hãy viết đáp án ở cuối cùng, sau dấu phân cách || để học sinh không vô tình nhìn thấy ngay.
"""

    result = llm.invoke([
        SystemMessage(content=system),
        HumanMessage(content="Tạo quiz cho mình với!")
    ])

    latency = int(time.time() * 1000) - start_ms

    return {
        "response": result.content,
        "tokens_used": 0,
        "latency_ms": latency,
        "model_used": model_name
    }
