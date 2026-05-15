# Kế hoạch Triển khai Chatbot Học sinh — LangGraph + Frappe LMS
> Tài liệu hướng dẫn từng bước cho Claude Code — đọc toàn bộ trước khi bắt đầu code

---

## Mục lục
1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Bước 1 — Cài đặt dependencies](#bước-1--cài-đặt-dependencies)
4. [Bước 2 — DocTypes Frappe](#bước-2--doctypes-frappe)
5. [Bước 3 — LangGraph State & Graph](#bước-3--langgraph-state--graph)
6. [Bước 4 — Nodes (các bước xử lý)](#bước-4--nodes)
7. [Bước 5 — Context Builder từ LMS](#bước-5--context-builder-từ-lms)
8. [Bước 6 — API Endpoints Frappe](#bước-6--api-endpoints-frappe)
9. [Bước 7 — Session & Redis](#bước-7--session--redis)
10. [Bước 8 — Guard / Filter](#bước-8--guard--filter)
11. [Bước 9 — Frontend Vue Widget](#bước-9--frontend-vue-widget)
12. [Bước 10 — Hooks & Integration](#bước-10--hooks--integration)
13. [Bước 11 — Testing](#bước-11--testing)
14. [Bước 12 — Logging & Cost Tracking](#bước-12--logging--cost-tracking)
15. [Nguyên tắc & Lưu ý cho Claude](#nguyên-tắc--lưu-ý-cho-claude)

---

## 1. Tổng quan kiến trúc

```
Học sinh gõ câu hỏi
        │
        ▼
[Vue Widget] ──POST──► [Frappe API: chatbot.send_message]
                                │
                                ▼
                    [LangGraph Graph - Python]
                    ┌───────────────────────┐
                    │  START                │
                    │    │                  │
                    │    ▼                  │
                    │  guard_node           │  ← kiểm tra nội dung
                    │    │                  │
                    │    ▼                  │
                    │  context_node         │  ← lấy dữ liệu LMS
                    │    │                  │
                    │    ▼                  │
                    │  router_node          │  ← phân loại câu hỏi
                    │   / | \              │
                    │  /  |  \             │
                    │ ▼   ▼   ▼            │
                    │qa  quiz hint         │  ← specialist nodes
                    │  \  |  /             │
                    │   \ | /              │
                    │    ▼                 │
                    │  format_node         │  ← format markdown
                    │    │                 │
                    │   END                │
                    └───────────────────────┘
                                │
                                ▼
                    [Redis: lưu history]
                    [MariaDB: log message]
                                │
                                ▼
                    Trả về JSON → Vue Widget hiển thị
```

**Công nghệ:**
- Backend: Python 3.11+, Frappe v15, LangGraph 0.2+, LangChain 0.3+
- LLM: Google Gemini 1.5 Flash (primary) — context 1M token, rẻ nhất
- Cache/History: Redis (đã có trong Frappe)
- DB: MariaDB qua Frappe DocType
- Frontend: Vue 3 + Vite (đã có trong LMS)
- Không cần Vector DB ở giai đoạn này (context injection đủ dùng)

---

## 2. Cấu trúc thư mục

```
apps/lms/lms/
├── chatbot/                          ← module chính, TẠO MỚI
│   ├── __init__.py
│   ├── api.py                        ← Frappe whitelist endpoints
│   ├── graph.py                      ← LangGraph graph definition
│   ├── state.py                      ← TypedDict state
│   ├── nodes/
│   │   ├── __init__.py
│   │   ├── guard.py                  ← lọc nội dung không phù hợp
│   │   ├── context.py                ← lấy dữ liệu từ LMS
│   │   ├── router.py                 ← phân loại câu hỏi
│   │   ├── qa.py                     ← trả lời câu hỏi thông thường
│   │   ├── quiz.py                   ← tạo câu hỏi ôn tập
│   │   └── hint.py                   ← gợi ý từng bước (không làm hộ)
│   ├── prompts/
│   │   ├── system.py                 ← system prompt templates
│   │   ├── guard_prompt.py
│   │   └── router_prompt.py
│   ├── session.py                    ← Redis session manager
│   ├── cost_tracker.py               ← theo dõi token/cost
│   └── utils.py
│
├── chatbot_doctype/                  ← DocTypes (tạo qua Frappe)
│   ├── chatbot_session/
│   │   ├── chatbot_session.json
│   │   └── chatbot_session.py
│   ├── chatbot_message/
│   │   ├── chatbot_message.json
│   │   └── chatbot_message.py
│   └── chatbot_config/
│       ├── chatbot_config.json
│       └── chatbot_config.py
│
└── public/
    └── js/
        └── chatbot_widget/
            ├── ChatbotWidget.vue     ← floating chat button + panel
            ├── ChatMessage.vue       ← single message component
            └── index.js              ← mount entry point
```

---

## Bước 1 — Cài đặt dependencies

### 1.1 Thêm vào `apps/lms/requirements.txt`

```txt
langgraph>=0.2.0
langchain>=0.3.0
langchain-google-genai>=2.0.0
langchain-core>=0.3.0
google-generativeai>=0.8.0
redis>=5.0.0
tiktoken>=0.7.0
```

### 1.2 Cài đặt trong bench

```bash
# Chạy trong frappe-bench directory
cd ~/frappe-bench
source env/bin/activate
pip install langgraph langchain langchain-google-genai google-generativeai tiktoken
bench restart
```

### 1.3 Thêm biến môi trường vào `site_config.json`

```json
{
  "google_api_key": "AIza...",
  "chatbot_model": "gemini-1.5-flash",
  "chatbot_max_tokens_per_day": 50000,
  "chatbot_session_ttl_hours": 24
}
```

---

## Bước 2 — DocTypes Frappe

### 2.1 DocType: `Chatbot Session`

**Tạo file:** `lms/chatbot_doctype/chatbot_session/chatbot_session.json`

```json
{
  "name": "Chatbot Session",
  "module": "LMS",
  "is_submittable": 0,
  "fields": [
    {"fieldname": "student", "fieldtype": "Link", "options": "User", "reqd": 1, "label": "Student"},
    {"fieldname": "course", "fieldtype": "Link", "options": "LMS Course", "label": "Course"},
    {"fieldname": "lesson", "fieldtype": "Link", "options": "LMS Lesson", "label": "Lesson"},
    {"fieldname": "session_key", "fieldtype": "Data", "label": "Redis Session Key"},
    {"fieldname": "started_at", "fieldtype": "Datetime", "label": "Started At"},
    {"fieldname": "last_active", "fieldtype": "Datetime", "label": "Last Active"},
    {"fieldname": "total_tokens", "fieldtype": "Int", "default": 0, "label": "Total Tokens Used"},
    {"fieldname": "total_cost_usd", "fieldtype": "Float", "default": 0, "label": "Total Cost USD"},
    {"fieldname": "message_count", "fieldtype": "Int", "default": 0, "label": "Message Count"},
    {"fieldname": "status", "fieldtype": "Select", "options": "Active\nClosed\nBlocked", "default": "Active"}
  ],
  "permissions": [
    {"role": "Student", "read": 1, "write": 0},
    {"role": "Instructor", "read": 1, "write": 1},
    {"role": "System Manager", "read": 1, "write": 1, "delete": 1}
  ]
}
```

### 2.2 DocType: `Chatbot Message`

**Tạo file:** `lms/chatbot_doctype/chatbot_message/chatbot_message.json`

```json
{
  "name": "Chatbot Message",
  "module": "LMS",
  "fields": [
    {"fieldname": "session", "fieldtype": "Link", "options": "Chatbot Session", "reqd": 1},
    {"fieldname": "role", "fieldtype": "Select", "options": "user\nassistant\nsystem", "reqd": 1},
    {"fieldname": "content", "fieldtype": "Long Text", "reqd": 1},
    {"fieldname": "message_type", "fieldtype": "Select", "options": "qa\nquiz\nhint\nblocked"},
    {"fieldname": "tokens_used", "fieldtype": "Int", "default": 0},
    {"fieldname": "latency_ms", "fieldtype": "Int", "default": 0},
    {"fieldname": "model_used", "fieldtype": "Data"},
    {"fieldname": "timestamp", "fieldtype": "Datetime"}
  ]
}
```

### 2.3 DocType: `Chatbot Config`

**Tạo file:** `lms/chatbot_doctype/chatbot_config/chatbot_config.json`

```json
{
  "name": "Chatbot Config",
  "module": "LMS",
  "fields": [
    {"fieldname": "course", "fieldtype": "Link", "options": "LMS Course", "reqd": 1},
    {"fieldname": "enabled", "fieldtype": "Check", "default": 1},
    {"fieldname": "system_prompt_override", "fieldtype": "Long Text", "label": "Custom System Prompt (để trống = dùng mặc định)"},
    {"fieldname": "max_tokens_per_day", "fieldtype": "Int", "default": 50000},
    {"fieldname": "allow_quiz_generation", "fieldtype": "Check", "default": 1},
    {"fieldname": "allow_hints", "fieldtype": "Check", "default": 1},
    {"fieldname": "blocked_topics", "fieldtype": "Small Text", "label": "Blocked Topics (mỗi dòng 1 topic)"}
  ]
}
```

### 2.4 Migrate DocTypes

```bash
bench --site [your-site] migrate
```

---

## Bước 3 — LangGraph State & Graph

### 3.1 State Definition

**Tạo file:** `lms/chatbot/state.py`

```python
from typing import TypedDict, Annotated, Optional, Literal
from langgraph.graph.message import add_messages


class ChatbotState(TypedDict):
    # --- Input từ request ---
    user_message: str                    # câu hỏi gốc của học sinh
    student_name: str                    # frappe user name
    lesson_name: Optional[str]           # tên lesson đang học
    session_key: str                     # redis key

    # --- Context từ LMS (được điền bởi context_node) ---
    lesson_content: Optional[str]        # nội dung bài học
    lesson_title: Optional[str]
    course_title: Optional[str]
    student_progress: Optional[float]    # 0-100
    last_quiz_score: Optional[float]
    student_display_name: Optional[str]

    # --- Xử lý nội bộ ---
    is_blocked: bool                     # guard_node set True nếu vi phạm
    block_reason: Optional[str]
    message_type: Optional[Literal["qa", "quiz", "hint", "blocked"]]
    chat_history: list                   # list of {role, content}

    # --- Output ---
    response: Optional[str]             # câu trả lời cuối
    tokens_used: int
    latency_ms: int
    model_used: str
```

### 3.2 Graph Definition

**Tạo file:** `lms/chatbot/graph.py`

```python
from langgraph.graph import StateGraph, END, START
from .state import ChatbotState
from .nodes.guard import guard_node
from .nodes.context import context_node
from .nodes.router import router_node
from .nodes.qa import qa_node
from .nodes.quiz import quiz_node
from .nodes.hint import hint_node


def should_continue(state: ChatbotState) -> str:
    """Edge condition sau guard_node"""
    if state.get("is_blocked"):
        return "blocked"
    return "continue"


def route_message(state: ChatbotState) -> str:
    """Edge condition sau router_node — điều phối đến đúng specialist"""
    return state.get("message_type", "qa")


def build_chatbot_graph():
    graph = StateGraph(ChatbotState)

    # Thêm nodes
    graph.add_node("guard", guard_node)
    graph.add_node("context", context_node)
    graph.add_node("router", router_node)
    graph.add_node("qa", qa_node)
    graph.add_node("quiz", quiz_node)
    graph.add_node("hint", hint_node)

    # Thêm edges
    graph.add_edge(START, "guard")

    # Sau guard: nếu bị block thì END, không thì tiếp tục
    graph.add_conditional_edges(
        "guard",
        should_continue,
        {
            "blocked": END,
            "continue": "context"
        }
    )

    graph.add_edge("context", "router")

    # Sau router: điều phối đến specialist
    graph.add_conditional_edges(
        "router",
        route_message,
        {
            "qa": "qa",
            "quiz": "quiz",
            "hint": "hint"
        }
    )

    # Tất cả specialist nodes kết thúc
    graph.add_edge("qa", END)
    graph.add_edge("quiz", END)
    graph.add_edge("hint", END)

    return graph.compile()


# Singleton — compile một lần, dùng nhiều lần
chatbot_graph = build_chatbot_graph()
```

---

## Bước 4 — Nodes

### 4.1 Guard Node

**Tạo file:** `lms/chatbot/nodes/guard.py`

```python
import time
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import ChatbotState


GUARD_SYSTEM = """Bạn là bộ lọc nội dung cho chatbot giáo dục dành cho học sinh.
Phân tích tin nhắn và trả về JSON:
{"blocked": true/false, "reason": "lý do nếu bị block"}

Block nếu:
- Nội dung tục tĩu, bạo lực, 18+
- Yêu cầu làm toàn bộ bài tập hộ (ví dụ: "viết toàn bộ bài luận cho tôi")
- Câu hỏi không liên quan đến học tập (đặt hàng, hẹn hò, v.v.)
- Ngôn ngữ xúc phạm

KHÔNG block:
- Hỏi giải thích khái niệm
- Xin gợi ý/hướng dẫn
- Hỏi ví dụ minh họa
- Câu hỏi về bài học dù ngoài chủ đề một chút

Trả về JSON thuần túy, không có markdown."""


def guard_node(state: ChatbotState) -> dict:
    import json
    
    api_key = frappe.conf.get("google_api_key")
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash-8b",  # dùng model nhỏ nhất cho guard — rẻ hơn
        google_api_key=api_key,
        temperature=0
    )

    messages = [
        SystemMessage(content=GUARD_SYSTEM),
        HumanMessage(content=f"Tin nhắn học sinh: {state['user_message']}")
    ]

    try:
        result = llm.invoke(messages)
        data = json.loads(result.content.strip())
        
        if data.get("blocked"):
            return {
                "is_blocked": True,
                "block_reason": data.get("reason", "Nội dung không phù hợp"),
                "response": f"⚠️ Xin lỗi, tôi không thể hỗ trợ yêu cầu này. {data.get('reason', '')}",
                "message_type": "blocked",
                "tokens_used": 0,
                "latency_ms": 0,
                "model_used": "gemini-1.5-flash-8b"
            }
    except Exception:
        # Nếu parse lỗi → cho qua (fail open để không chặn học sinh oan)
        pass

    return {"is_blocked": False}
```

### 4.2 Context Node

**Tạo file:** `lms/chatbot/nodes/context.py`

```python
import frappe
from ..state import ChatbotState
from ..session import get_chat_history


def context_node(state: ChatbotState) -> dict:
    """Lấy toàn bộ context cần thiết từ LMS database"""
    updates = {}

    # Lấy chat history từ Redis
    updates["chat_history"] = get_chat_history(state["session_key"])

    lesson_name = state.get("lesson_name")
    student_name = state.get("student_name")

    if lesson_name:
        try:
            lesson = frappe.get_doc("LMS Lesson", lesson_name)
            updates["lesson_title"] = lesson.title
            updates["lesson_content"] = _extract_lesson_content(lesson)

            # Lấy course info
            if lesson.course:
                course = frappe.get_doc("LMS Course", lesson.course)
                updates["course_title"] = course.title
        except Exception:
            pass

    if student_name:
        try:
            user = frappe.get_doc("User", student_name)
            updates["student_display_name"] = user.full_name or student_name

            # Lấy progress nếu có lesson
            if lesson_name:
                progress = frappe.db.get_value(
                    "LMS Course Progress",
                    {"student": student_name, "lesson": lesson_name},
                    ["percentage", "last_quiz_score"],
                    as_dict=True
                )
                if progress:
                    updates["student_progress"] = progress.get("percentage", 0)
                    updates["last_quiz_score"] = progress.get("last_quiz_score")
        except Exception:
            pass

    return updates


def _extract_lesson_content(lesson) -> str:
    """Trích xuất text content từ lesson, giới hạn 80.000 tokens (~60.000 words)"""
    parts = []

    if hasattr(lesson, "content") and lesson.content:
        parts.append(lesson.content)

    # Lấy thêm từ child tables nếu có
    for child_field in ["lesson_content", "sections"]:
        if hasattr(lesson, child_field):
            items = getattr(lesson, child_field, [])
            for item in items:
                if hasattr(item, "content"):
                    parts.append(item.content or "")

    full_text = "\n\n".join(filter(None, parts))

    # Giới hạn ký tự ~200.000 chars ≈ 50.000 tokens
    if len(full_text) > 200_000:
        full_text = full_text[:200_000] + "\n\n[... nội dung bị cắt bớt ...]"

    return full_text
```

### 4.3 Router Node

**Tạo file:** `lms/chatbot/nodes/router.py`

```python
import json
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import ChatbotState


ROUTER_SYSTEM = """Phân loại câu hỏi học sinh vào 1 trong 3 loại:
- "qa": câu hỏi/giải thích thông thường về bài học
- "quiz": học sinh muốn tạo câu hỏi ôn tập, test bản thân
- "hint": học sinh đang làm bài tập và cần gợi ý, không muốn đáp án thẳng

Trả về JSON: {"type": "qa"|"quiz"|"hint"}
Không có text khác."""


def router_node(state: ChatbotState) -> dict:
    api_key = frappe.conf.get("google_api_key")
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash-8b",
        google_api_key=api_key,
        temperature=0
    )

    messages = [
        SystemMessage(content=ROUTER_SYSTEM),
        HumanMessage(content=state["user_message"])
    ]

    try:
        result = llm.invoke(messages)
        data = json.loads(result.content.strip())
        msg_type = data.get("type", "qa")
        if msg_type not in ("qa", "quiz", "hint"):
            msg_type = "qa"
    except Exception:
        msg_type = "qa"

    return {"message_type": msg_type}
```

### 4.4 QA Node

**Tạo file:** `lms/chatbot/nodes/qa.py`

```python
import time
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from ..state import ChatbotState
from ..prompts.system import build_system_prompt


def qa_node(state: ChatbotState) -> dict:
    start_ms = int(time.time() * 1000)
    api_key = frappe.conf.get("google_api_key")
    model_name = frappe.conf.get("chatbot_model", "gemini-1.5-flash")

    llm = ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=0.3,
        max_output_tokens=2048
    )

    system_prompt = build_system_prompt(state)
    messages = [SystemMessage(content=system_prompt)]

    # Thêm history (tối đa 10 lượt gần nhất)
    history = state.get("chat_history", [])[-10:]
    for msg in history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=state["user_message"]))

    result = llm.invoke(messages)

    latency = int(time.time() * 1000) - start_ms
    tokens = getattr(result, "usage_metadata", {})

    return {
        "response": result.content,
        "tokens_used": tokens.get("total_token_count", 0) if tokens else 0,
        "latency_ms": latency,
        "model_used": model_name
    }
```

### 4.5 Quiz Node

**Tạo file:** `lms/chatbot/nodes/quiz.py`

```python
import time
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import ChatbotState


def quiz_node(state: ChatbotState) -> dict:
    start_ms = int(time.time() * 1000)
    api_key = frappe.conf.get("google_api_key")

    llm = ChatGoogleGenerativeAI(
        model=frappe.conf.get("chatbot_model", "gemini-1.5-flash"),
        google_api_key=api_key,
        temperature=0.7  # cao hơn để quiz đa dạng
    )

    lesson_title = state.get("lesson_title", "bài học này")
    lesson_content = state.get("lesson_content", "")[:50_000]

    system = f"""Bạn là trợ lý giáo dục. Tạo 3-5 câu hỏi ôn tập dựa trên nội dung bài học.

Bài học: {lesson_title}
Nội dung tham khảo:
{lesson_content}

Yêu cầu:
- Câu hỏi từ dễ đến khó
- Format: đánh số rõ ràng
- Có đáp án gợi ý ở cuối (dưới dấu ||)
- Tiếng Việt
- Phù hợp trình độ học sinh đã học xong bài"""

    result = llm.invoke([
        SystemMessage(content=system),
        HumanMessage(content=state["user_message"])
    ])

    latency = int(time.time() * 1000) - start_ms

    return {
        "response": result.content,
        "tokens_used": 0,
        "latency_ms": latency,
        "model_used": "gemini-1.5-flash"
    }
```

### 4.6 Hint Node

**Tạo file:** `lms/chatbot/nodes/hint.py`

```python
import time
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from ..state import ChatbotState
from ..prompts.system import build_system_prompt


def hint_node(state: ChatbotState) -> dict:
    """Gợi ý từng bước — KHÔNG làm bài hộ học sinh"""
    start_ms = int(time.time() * 1000)
    api_key = frappe.conf.get("google_api_key")

    llm = ChatGoogleGenerativeAI(
        model=frappe.conf.get("chatbot_model", "gemini-1.5-flash"),
        google_api_key=api_key,
        temperature=0.2
    )

    system_prompt = build_system_prompt(state)
    hint_addendum = """
QUAN TRỌNG — Đây là chế độ GỢI Ý:
- KHÔNG đưa ra đáp án trực tiếp
- Hướng dẫn học sinh suy nghĩ từng bước
- Hỏi ngược lại để học sinh tự khám phá
- Nếu học sinh đã thử sai, khen nỗ lực rồi chỉ sai ở đâu
- Tối đa 3-4 câu gợi ý ngắn gọn"""

    full_system = system_prompt + "\n\n" + hint_addendum
    messages = [SystemMessage(content=full_system)]

    history = state.get("chat_history", [])[-6:]
    for msg in history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=state["user_message"]))

    result = llm.invoke(messages)
    latency = int(time.time() * 1000) - start_ms

    return {
        "response": result.content,
        "tokens_used": 0,
        "latency_ms": latency,
        "model_used": "gemini-1.5-flash"
    }
```

---

## Bước 5 — Context Builder từ LMS

**Tạo file:** `lms/chatbot/prompts/system.py`

```python
from ..state import ChatbotState


def build_system_prompt(state: ChatbotState) -> str:
    """Build system prompt động từ context LMS"""
    
    student_name = state.get("student_display_name") or "học sinh"
    lesson_title = state.get("lesson_title") or "bài học"
    course_title = state.get("course_title") or "khóa học"
    progress = state.get("student_progress")
    quiz_score = state.get("last_quiz_score")
    lesson_content = state.get("lesson_content") or ""

    progress_text = f"{progress:.0f}%" if progress is not None else "chưa rõ"
    quiz_text = f"{quiz_score:.0f}/100" if quiz_score is not None else "chưa làm"

    prompt = f"""Bạn là trợ lý học tập AI cho học sinh tên {student_name}.

=== THÔNG TIN HỌC SINH ===
- Đang học: {lesson_title} (thuộc {course_title})
- Tiến độ khóa học: {progress_text}
- Điểm quiz gần nhất: {quiz_text}

=== NỘI DUNG BÀI HỌC (tham khảo để trả lời) ===
{lesson_content[:80_000] if lesson_content else "(Không có nội dung bài học)"}

=== NGUYÊN TẮC ===
1. Trả lời bằng tiếng Việt, thân thiện, khuyến khích
2. Dựa trên nội dung bài học khi có thể
3. Nếu câu hỏi ngoài phạm vi bài học, lịch sự chuyển hướng
4. Dùng markdown: **in đậm**, `code`, danh sách khi cần
5. Ngắn gọn: không quá 400 từ mỗi câu trả lời
6. Kết thúc bằng câu hỏi gợi mở để học sinh suy nghĩ thêm (nếu phù hợp)"""

    return prompt
```

---

## Bước 6 — API Endpoints Frappe

**Tạo file:** `lms/chatbot/api.py`

```python
import time
import frappe
from frappe import _
from .graph import chatbot_graph
from .session import (
    get_or_create_session_key,
    get_chat_history,
    save_message_to_history,
    clear_session
)
from .cost_tracker import log_chat_message


@frappe.whitelist()
def send_message(message: str, lesson_name: str = None, session_key: str = None):
    """
    Endpoint chính — học sinh gửi tin nhắn, nhận câu trả lời từ AI.
    
    Args:
        message: câu hỏi của học sinh
        lesson_name: tên LMS Lesson đang học (optional)
        session_key: redis key của session (optional, tự tạo nếu chưa có)
    
    Returns:
        dict với keys: response, message_type, session_key, tokens_used
    """
    if not message or not message.strip():
        frappe.throw(_("Vui lòng nhập câu hỏi"))

    student = frappe.session.user
    if student == "Guest":
        frappe.throw(_("Vui lòng đăng nhập để sử dụng chatbot"))

    # Tạo/lấy session key
    if not session_key:
        session_key = get_or_create_session_key(student, lesson_name)

    # Kiểm tra giới hạn token trong ngày
    _check_daily_limit(student)

    # Chạy LangGraph
    initial_state = {
        "user_message": message.strip(),
        "student_name": student,
        "lesson_name": lesson_name,
        "session_key": session_key,
        "is_blocked": False,
        "tokens_used": 0,
        "latency_ms": 0,
        "model_used": ""
    }

    result = chatbot_graph.invoke(initial_state)

    # Lưu vào Redis history
    save_message_to_history(session_key, "user", message)
    save_message_to_history(session_key, "assistant", result["response"])

    # Log vào MariaDB
    log_chat_message(
        student=student,
        lesson_name=lesson_name,
        session_key=session_key,
        user_message=message,
        assistant_response=result["response"],
        message_type=result.get("message_type", "qa"),
        tokens=result.get("tokens_used", 0),
        latency_ms=result.get("latency_ms", 0),
        model=result.get("model_used", "")
    )

    return {
        "response": result["response"],
        "message_type": result.get("message_type", "qa"),
        "session_key": session_key,
        "tokens_used": result.get("tokens_used", 0)
    }


@frappe.whitelist()
def get_history(session_key: str):
    """Lấy lịch sử chat của session"""
    student = frappe.session.user
    if student == "Guest":
        frappe.throw(_("Vui lòng đăng nhập"))

    history = get_chat_history(session_key)
    return {"history": history}


@frappe.whitelist()
def clear_chat(session_key: str):
    """Xóa lịch sử chat"""
    student = frappe.session.user
    clear_session(session_key)
    return {"success": True}


@frappe.whitelist()
def get_session_key(lesson_name: str = None):
    """Tạo hoặc lấy session key cho lesson hiện tại"""
    student = frappe.session.user
    if student == "Guest":
        frappe.throw(_("Vui lòng đăng nhập"))

    key = get_or_create_session_key(student, lesson_name)
    return {"session_key": key}


def _check_daily_limit(student: str):
    """Kiểm tra học sinh có vượt giới hạn token/ngày không"""
    max_tokens = frappe.conf.get("chatbot_max_tokens_per_day", 50000)
    today = frappe.utils.today()

    used_today = frappe.db.sql("""
        SELECT COALESCE(SUM(tokens_used), 0)
        FROM `tabChatbot Message`
        WHERE DATE(timestamp) = %s
        AND session IN (
            SELECT name FROM `tabChatbot Session` WHERE student = %s
        )
    """, (today, student))[0][0]

    if used_today >= max_tokens:
        frappe.throw(_(
            "Bạn đã đạt giới hạn sử dụng chatbot hôm nay. "
            "Vui lòng thử lại vào ngày mai."
        ))
```

---

## Bước 7 — Session & Redis

**Tạo file:** `lms/chatbot/session.py`

```python
import json
import hashlib
import frappe
from frappe.utils import now_datetime


def get_or_create_session_key(student: str, lesson_name: str = None) -> str:
    """Tạo Redis key duy nhất cho mỗi student+lesson combo"""
    raw = f"chatbot:{student}:{lesson_name or 'general'}"
    return hashlib.md5(raw.encode()).hexdigest()


def get_chat_history(session_key: str) -> list:
    """Lấy lịch sử chat từ Redis"""
    try:
        redis_client = frappe.cache()
        data = redis_client.get(f"chatbot_history:{session_key}")
        if data:
            return json.loads(data)
    except Exception:
        pass
    return []


def save_message_to_history(session_key: str, role: str, content: str):
    """Lưu tin nhắn vào Redis, giữ tối đa 20 lượt (40 messages)"""
    try:
        redis_client = frappe.cache()
        key = f"chatbot_history:{session_key}"
        history = get_chat_history(session_key)
        
        history.append({"role": role, "content": content})
        
        # Giữ 40 messages gần nhất (20 lượt)
        if len(history) > 40:
            history = history[-40:]

        ttl_hours = frappe.conf.get("chatbot_session_ttl_hours", 24)
        redis_client.setex(
            key,
            int(ttl_hours * 3600),
            json.dumps(history, ensure_ascii=False)
        )
    except Exception as e:
        frappe.log_error(f"Chatbot Redis error: {e}", "Chatbot Session")


def clear_session(session_key: str):
    """Xóa history khỏi Redis"""
    try:
        frappe.cache().delete(f"chatbot_history:{session_key}")
    except Exception:
        pass
```

---

## Bước 8 — Guard / Filter

File `nodes/guard.py` đã tạo ở Bước 4.1.

**Thêm vào `lms/chatbot/utils.py`** các helper:

```python
import re


def sanitize_user_input(text: str) -> str:
    """Làm sạch input trước khi xử lý"""
    # Giới hạn độ dài
    text = text[:2000]
    # Xóa HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Normalize whitespace
    text = ' '.join(text.split())
    return text.strip()


def truncate_for_display(text: str, max_chars: int = 500) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "..."
```

---

## Bước 9 — Frontend Vue Widget

### 9.1 Entry Point

**Tạo file:** `lms/public/js/chatbot_widget/index.js`

```javascript
import { createApp } from 'vue'
import ChatbotWidget from './ChatbotWidget.vue'

window.ChatbotWidget = {
    mount(selector, options = {}) {
        const container = document.querySelector(selector)
        if (!container) return

        const app = createApp(ChatbotWidget, {
            lessonName: options.lesson || null,
            studentName: options.student || null,
        })
        app.mount(container)
    }
}
```

### 9.2 Widget Component

**Tạo file:** `lms/public/js/chatbot_widget/ChatbotWidget.vue`

```vue
<template>
  <div class="chatbot-wrapper">
    <!-- Floating Button -->
    <button
      v-if="!isOpen"
      class="chatbot-fab"
      @click="openChat"
      title="Hỏi trợ lý AI"
    >
      💬
    </button>

    <!-- Chat Panel -->
    <div v-if="isOpen" class="chatbot-panel">
      <!-- Header -->
      <div class="chatbot-header">
        <span class="chatbot-title">🤖 Trợ lý học tập</span>
        <div class="chatbot-header-actions">
          <button @click="clearHistory" title="Xóa lịch sử" class="icon-btn">🗑️</button>
          <button @click="isOpen = false" title="Đóng" class="icon-btn">✕</button>
        </div>
      </div>

      <!-- Messages -->
      <div class="chatbot-messages" ref="messagesEl">
        <div v-if="messages.length === 0" class="chatbot-empty">
          <p>Xin chào! Tôi có thể giúp gì cho bạn về bài học này?</p>
          <div class="quick-prompts">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt"
              @click="sendQuick(prompt)"
              class="quick-prompt-btn"
            >{{ prompt }}</button>
          </div>
        </div>

        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['chatbot-msg', msg.role]"
        >
          <div class="msg-bubble" v-html="renderMarkdown(msg.content)"></div>
          <div v-if="msg.type" class="msg-type-badge">{{ typeBadge(msg.type) }}</div>
        </div>

        <div v-if="isLoading" class="chatbot-msg assistant">
          <div class="msg-bubble loading">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="chatbot-input-area">
        <textarea
          v-model="inputText"
          @keydown.enter.exact.prevent="sendMessage"
          placeholder="Nhập câu hỏi... (Enter để gửi)"
          :disabled="isLoading"
          rows="2"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="isLoading || !inputText.trim()"
          class="send-btn"
        >➤</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const props = defineProps({
  lessonName: String,
  studentName: String,
})

const isOpen = ref(false)
const isLoading = ref(false)
const inputText = ref('')
const messages = ref([])
const sessionKey = ref(null)
const messagesEl = ref(null)

const quickPrompts = [
  'Giải thích bài này cho tôi',
  'Tạo câu hỏi ôn tập',
  'Gợi ý bài tập tiếp theo',
]

async function openChat() {
  isOpen.value = true
  if (!sessionKey.value) {
    await initSession()
  }
}

async function initSession() {
  try {
    const res = await frappe.call({
      method: 'lms.chatbot.api.get_session_key',
      args: { lesson_name: props.lessonName }
    })
    sessionKey.value = res.message.session_key
    await loadHistory()
  } catch (e) {
    console.error('Chatbot: cannot init session', e)
  }
}

async function loadHistory() {
  if (!sessionKey.value) return
  try {
    const res = await frappe.call({
      method: 'lms.chatbot.api.get_history',
      args: { session_key: sessionKey.value }
    })
    const history = res.message.history || []
    messages.value = history.map(h => ({
      role: h.role,
      content: h.content,
      type: null
    }))
    scrollToBottom()
  } catch (e) {}
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: text })
  isLoading.value = true
  scrollToBottom()

  try {
    const res = await frappe.call({
      method: 'lms.chatbot.api.send_message',
      args: {
        message: text,
        lesson_name: props.lessonName,
        session_key: sessionKey.value
      }
    })

    const data = res.message
    sessionKey.value = data.session_key
    messages.value.push({
      role: 'assistant',
      content: data.response,
      type: data.message_type
    })
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      content: '⚠️ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
      type: null
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function sendQuick(prompt) {
  inputText.value = prompt
  sendMessage()
}

async function clearHistory() {
  if (!sessionKey.value) return
  await frappe.call({
    method: 'lms.chatbot.api.clear_chat',
    args: { session_key: sessionKey.value }
  })
  messages.value = []
  sessionKey.value = null
  await initSession()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

function renderMarkdown(text) {
  // Simple markdown: bold, code, lists
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

function typeBadge(type) {
  const map = { qa: '💬 Q&A', quiz: '📝 Quiz', hint: '💡 Gợi ý', blocked: '🚫' }
  return map[type] || ''
}
</script>

<style scoped>
.chatbot-wrapper { position: fixed; bottom: 24px; right: 24px; z-index: 9999; }
.chatbot-fab {
  width: 56px; height: 56px; border-radius: 50%;
  background: #5b50e0; color: white; font-size: 24px;
  border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.chatbot-panel {
  width: 380px; height: 560px;
  background: white; border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex; flex-direction: column;
}
.chatbot-header {
  padding: 14px 16px; background: #5b50e0; color: white;
  border-radius: 16px 16px 0 0;
  display: flex; justify-content: space-between; align-items: center;
}
.chatbot-title { font-weight: 600; font-size: 15px; }
.icon-btn { background: none; border: none; color: white; cursor: pointer; font-size: 16px; padding: 2px 6px; }
.chatbot-messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.chatbot-empty p { color: #666; text-align: center; margin-bottom: 12px; }
.quick-prompts { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.quick-prompt-btn {
  font-size: 12px; padding: 6px 12px; border-radius: 20px;
  border: 1px solid #5b50e0; color: #5b50e0; background: none; cursor: pointer;
}
.chatbot-msg { display: flex; flex-direction: column; }
.chatbot-msg.user { align-items: flex-end; }
.chatbot-msg.assistant { align-items: flex-start; }
.msg-bubble {
  max-width: 85%; padding: 10px 14px; border-radius: 12px;
  font-size: 14px; line-height: 1.5;
}
.chatbot-msg.user .msg-bubble { background: #5b50e0; color: white; }
.chatbot-msg.assistant .msg-bubble { background: #f1f0fb; color: #333; }
.msg-type-badge { font-size: 11px; color: #999; margin-top: 2px; }
.loading { display: flex; gap: 4px; align-items: center; padding: 12px 18px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #999; animation: bounce 1.2s infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%,80%,100%{transform:scale(0.8)} 40%{transform:scale(1.2)} }
.chatbot-input-area { padding: 12px; border-top: 1px solid #eee; display: flex; gap: 8px; }
.chatbot-input-area textarea {
  flex: 1; resize: none; border: 1px solid #ddd; border-radius: 8px;
  padding: 8px 12px; font-size: 14px; font-family: inherit;
}
.send-btn {
  width: 40px; background: #5b50e0; color: white;
  border: none; border-radius: 8px; cursor: pointer; font-size: 18px;
}
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
```

---

## Bước 10 — Hooks & Integration

### 10.1 Đăng ký API trong `hooks.py`

Mở file `apps/lms/lms/hooks.py`, thêm:

```python
# Đảm bảo chatbot module được load
app_include_js = [
    "/assets/lms/js/chatbot_widget.bundle.js"
]

# Nếu cần scheduler job dọn session cũ
scheduler_events = {
    "daily": [
        "lms.chatbot.session.cleanup_old_sessions"
    ]
}
```

### 10.2 Inject widget vào Lesson page

Trong file lesson page controller hoặc `lms/www/lesson.py`:

```python
def get_context(context):
    # ... existing code ...
    context.show_chatbot = True
    context.lesson_name = frappe.form_dict.name
```

Trong template `lesson.html` (hoặc Vue component):

```html
<!-- Cuối file, trước </body> -->
<div id="chatbot-container"></div>
<script>
document.addEventListener('DOMContentLoaded', function() {
    if (window.ChatbotWidget) {
        window.ChatbotWidget.mount('#chatbot-container', {
            lesson: '{{ lesson_name }}',
            student: '{{ frappe.session.user }}'
        })
    }
})
</script>
```

### 10.3 Build Frontend

```bash
cd ~/frappe-bench
bench build --app lms
```

---

## Bước 11 — Testing

### 11.1 Test từng node riêng lẻ

**Tạo file:** `lms/chatbot/tests/test_nodes.py`

```python
import unittest
from unittest.mock import patch, MagicMock
from lms.chatbot.nodes.guard import guard_node
from lms.chatbot.nodes.router import router_node
from lms.chatbot.state import ChatbotState


class TestGuardNode(unittest.TestCase):

    def _make_state(self, message):
        return ChatbotState(
            user_message=message,
            student_name="test@example.com",
            lesson_name=None,
            session_key="test-key",
            is_blocked=False,
            tokens_used=0, latency_ms=0, model_used=""
        )

    @patch("lms.chatbot.nodes.guard.ChatGoogleGenerativeAI")
    def test_block_inappropriate(self, mock_llm_class):
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(
            content='{"blocked": true, "reason": "Nội dung 18+"}'
        )
        mock_llm_class.return_value = mock_llm

        state = self._make_state("nội dung không phù hợp")
        result = guard_node(state)
        self.assertTrue(result["is_blocked"])

    @patch("lms.chatbot.nodes.guard.ChatGoogleGenerativeAI")
    def test_allow_normal_question(self, mock_llm_class):
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(
            content='{"blocked": false}'
        )
        mock_llm_class.return_value = mock_llm

        state = self._make_state("Giải thích cho tôi về hàm số?")
        result = guard_node(state)
        self.assertFalse(result.get("is_blocked", False))


class TestRouterNode(unittest.TestCase):

    @patch("lms.chatbot.nodes.router.ChatGoogleGenerativeAI")
    def test_routes_to_quiz(self, mock_llm_class):
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(content='{"type": "quiz"}')
        mock_llm_class.return_value = mock_llm

        state = {"user_message": "Tạo câu hỏi ôn tập cho tôi"}
        result = router_node(state)
        self.assertEqual(result["message_type"], "quiz")
```

### 11.2 Test toàn bộ graph

```python
# Chạy trong Python shell của bench:
# bench --site [site] console

import frappe
from lms.chatbot.graph import chatbot_graph

result = chatbot_graph.invoke({
    "user_message": "Giải thích hàm số bậc hai là gì?",
    "student_name": "administrator",
    "lesson_name": None,
    "session_key": "test-123",
    "is_blocked": False,
    "tokens_used": 0,
    "latency_ms": 0,
    "model_used": ""
})

print("Response:", result["response"][:200])
print("Type:", result["message_type"])
print("Tokens:", result["tokens_used"])
```

### 11.3 Test API endpoint

```bash
# Dùng curl để test
curl -X POST \
  http://localhost:8000/api/method/lms.chatbot.api.send_message \
  -H "Content-Type: application/json" \
  -H "X-Frappe-CSRF-Token: [token]" \
  -d '{"message": "Bài này nói về gì?", "lesson_name": "your-lesson-name"}'
```

---

## Bước 12 — Logging & Cost Tracking

**Tạo file:** `lms/chatbot/cost_tracker.py`

```python
import frappe
from frappe.utils import now_datetime

# Giá Gemini 1.5 Flash (USD per 1M tokens, tính đến 2024)
COST_PER_1M_INPUT = 0.075
COST_PER_1M_OUTPUT = 0.30


def log_chat_message(
    student, lesson_name, session_key, user_message,
    assistant_response, message_type, tokens, latency_ms, model
):
    """Lưu message vào MariaDB để phân tích sau"""
    try:
        # Lấy hoặc tạo session record
        session_name = _get_or_create_session(student, lesson_name, session_key)

        # Ước tính cost
        cost = (tokens / 1_000_000) * COST_PER_1M_OUTPUT if tokens else 0

        # Lưu user message
        _insert_message(session_name, "user", user_message, message_type, 0, latency_ms, model)

        # Lưu assistant response
        _insert_message(session_name, "assistant", assistant_response, message_type, tokens, latency_ms, model)

        # Cập nhật session stats
        frappe.db.set_value("Chatbot Session", session_name, {
            "last_active": now_datetime(),
            "message_count": frappe.db.get_value("Chatbot Session", session_name, "message_count") + 2,
            "total_tokens": frappe.db.get_value("Chatbot Session", session_name, "total_tokens") + tokens,
            "total_cost_usd": frappe.db.get_value("Chatbot Session", session_name, "total_cost_usd") + cost
        })

        frappe.db.commit()

    except Exception as e:
        frappe.log_error(f"Cost tracker error: {e}", "Chatbot Log")


def _get_or_create_session(student, lesson_name, session_key):
    existing = frappe.db.get_value(
        "Chatbot Session",
        {"session_key": session_key},
        "name"
    )
    if existing:
        return existing

    doc = frappe.get_doc({
        "doctype": "Chatbot Session",
        "student": student,
        "lesson": lesson_name,
        "session_key": session_key,
        "started_at": now_datetime(),
        "last_active": now_datetime(),
        "status": "Active"
    })
    doc.insert(ignore_permissions=True)
    return doc.name


def _insert_message(session_name, role, content, msg_type, tokens, latency, model):
    frappe.get_doc({
        "doctype": "Chatbot Message",
        "session": session_name,
        "role": role,
        "content": content[:10000],  # giới hạn DB
        "message_type": msg_type,
        "tokens_used": tokens,
        "latency_ms": latency,
        "model_used": model,
        "timestamp": now_datetime()
    }).insert(ignore_permissions=True)
```

---

## Nguyên tắc & Lưu ý cho Claude

> **Đọc kỹ phần này trước khi bắt đầu code bất kỳ file nào**

### Môi trường
- Frappe framework v15, Python 3.11, MariaDB 10.6
- Tất cả database access phải qua `frappe.get_doc()`, `frappe.db.get_value()`, KHÔNG dùng SQLAlchemy trực tiếp
- Redis access qua `frappe.cache()`, KHÔNG tạo Redis connection mới
- API endpoints PHẢI có decorator `@frappe.whitelist()`
- Import từ frappe: `import frappe`, `from frappe import _`

### LangGraph
- State phải là `TypedDict`, tất cả keys có default value hoặc `Optional`
- Mỗi node nhận `state: dict`, trả về `dict` chỉ với keys cần cập nhật (partial update)
- Graph compile một lần (`chatbot_graph = build_chatbot_graph()`) ở module level, KHÔNG compile trong request
- Dùng `add_conditional_edges` cho branching, KHÔNG dùng if/else trong graph definition

### LLM
- Primary model: `gemini-1.5-flash` cho QA/Quiz/Hint
- Small model: `gemini-1.5-flash-8b` cho Guard/Router (rẻ hơn ~4x)
- API key lấy từ `frappe.conf.get("google_api_key")`
- Wrap mọi LLM call trong try/except, có fallback

### Security
- Luôn kiểm tra `frappe.session.user != "Guest"` trước khi xử lý
- Sanitize input với `utils.sanitize_user_input()` trước khi đưa vào LLM
- Không log nội dung nhạy cảm trong error messages

### Performance
- History Redis: tối đa 40 messages (20 lượt)
- Lesson content inject vào prompt: tối đa 80.000 chars
- Daily token limit check trước khi gọi LLM
- LangGraph graph là stateless, Redis giữ state giữa các request

### Thứ tự triển khai (quan trọng)
1. Chạy `pip install` → `bench migrate` TRƯỚC khi viết Python code
2. Tạo DocTypes TRƯỚC khi tạo Python files dùng chúng  
3. Test từng node độc lập TRƯỚC khi test toàn bộ graph
4. Test backend API TRƯỚC khi build frontend
5. `bench build --app lms` SAU KHI hoàn thành Vue components

---

*Tài liệu này đủ để Claude Code triển khai hoàn chỉnh từ A→Z. Mỗi bước có thể thực hiện độc lập và test trước khi sang bước tiếp theo.*
