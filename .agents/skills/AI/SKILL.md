# AI System Skill — LangChain + LangGraph
> Thiết kế và build hệ thống AI tích hợp: chatbot, RAG pipeline,
> multi-agent workflow, memory management. Stack: Python + LangChain + LangGraph.

---

## ⚡ Codebase Context — LMS AI Architecture

Trong project này, AI system nằm tại `lms/lms/agents/` và `lms/lms/services/`.

### Cấu trúc thư mục Agent

```
agents/
├── provider.py              # 🔑 SINGLE SOURCE OF TRUTH — Unified AI Provider
├── schemas.py               # Pydantic schemas cho structured LLM output
│
├── grading/                  # Pipeline chấm bài (Tier 4 Multi-Expert)
│   ├── orchestrator.py       # Sequential pipeline controller
│   ├── visual_specialist.py  # OCR + layout analysis
│   ├── logic_specialist.py   # Math/logic verification
│   ├── mcq_grader.py         # MCQ answer matching
│   ├── essay_grader.py       # Essay evaluation
│   ├── stem_grader.py        # STEM problem grading
│   ├── aggregator.py         # Final score aggregation
│   ├── reviewer.py           # Quality review loop
│   ├── rubric_analyzer.py    # Rubric parsing
│   └── session_store.py      # GradingSession state object
│
├── chatbot/                  # LangGraph chatbot
│   ├── graph.py              # StateGraph definition
│   ├── state.py              # ChatbotState TypedDict
│   └── nodes/                # Graph nodes (guard, router, qa, quiz, hint, reasoner, tool_executor)
│
├── socratic/                 # Socratic Tutor
│   └── tutor.py              # Socratic scaffolding agent
│
├── tools/                    # LangChain @tool functions
│   ├── document_tools.py     # OCR, page classify, answer key extract
│   ├── course_tools.py       # Get course/lesson content
│   ├── grading_tools.py      # Grading utilities
│   ├── ocr_pipeline.py       # OCR orchestration
│   └── web_tools.py          # Web search
│
└── utils/                    # Shared utilities
    ├── filesystem.py
    └── json_utils.py
```

### Unified Provider — `agents/provider.py`

```python
# 🔑 MỌI code AI trong project PHẢI lấy LLM qua file này
from lms.lms.agents.provider import get_llm, get_agent_config

# LangChain ChatModel instance — cho agents, chatbot, socratic
llm = get_llm("chatbot")           # Chatbot AI Helper
llm = get_llm("socratic_tutor")    # Socratic Tutor
llm = get_llm("grading_visual")    # Visual Specialist (OCR)
llm = get_llm("grading_logic")     # Logic Specialist
llm = get_llm("grading_mcq")       # MCQ Grader
llm = get_llm("grading_aggregator")# Score Aggregator
llm = get_llm("grading_reviewer")  # Quality Reviewer
llm = get_llm("rubric_builder")    # Rubric Generator
llm = get_llm("lesson_planner")    # Lesson Plan Generator
llm = get_llm("classify")          # Page/content classifier
llm = get_llm("ocr")               # OCR text extraction

# Raw config dict — khi cần tự build API call
config = get_agent_config("lesson_planner")
# → {"provider": "openai", "model": "gpt-4o", "api_key": "sk-...", "temperature": 0.7, ...}
```

> **Logic fallback**: Mỗi agent đọc config từ bảng con `AI Agent Config` trong DocType `LMS AI Settings`.
> Nếu agent chưa có row config hoặc provider = `(inherit)` → dùng `default_provider` + `default_api_key` từ parent.

### DocType: `LMS AI Settings`

| Field | Mô tả |
|-------|--------|
| `default_provider` | Provider mặc định: `Google \| OpenAI \| Anthropic \| OpenRouter \| Ollama` |
| `default_model` | Model mặc định (vd: `gemini-2.5-flash`) |
| `default_api_key` | API key chính |
| `default_base_url` | Base URL tuỳ chọn (cho OpenRouter/Ollama) |
| `agent_configs` | Bảng con `AI Agent Config` — mỗi row = 1 chức năng AI |

### Grading Pipeline — `agents/grading/orchestrator.py`

```
Sequential pipeline (not LangGraph):
1. Context Init (load rubric, extract answer key)
2. Page Classification (skill_classify_pages)
3. Expert Analysis Loop (max 2 attempts):
   Visual → Logic/MCQ → Aggregator → Reviewer (if low confidence)
4. Return final_result dict
```

### Chatbot Graph — `agents/chatbot/graph.py`

```
guard → router → context → reasoner → tool_executor → qa → END
                         ↘ quiz → END
                         ↘ hint → END
```

### Quy tắc codebase-specific (BẮT BUỘC)

1. **LLM routing:** Luôn dùng `get_llm(agent_name)` — KHÔNG import `ChatOpenAI`/`ChatGoogleGenerativeAI` trực tiếp
2. **API keys:** Lấy từ `LMS AI Settings` DocType — KHÔNG hardcode, KHÔNG dùng env var cho API key
3. **Subagents:** Stateless functions nhận context dict, trả result dict
4. **Session state:** Grading dùng `GradingSession` object; Chatbot dùng LangGraph `StateGraph`
5. **Tools:** Đặt trong `agents/tools/` — dùng `@tool` decorator của LangChain
6. **Schemas:** Output có cấu trúc → define trong `agents/schemas.py` bằng Pydantic
7. **Stability & Scaling:**
   - **Tác vụ nặng (Grading, Rubric, Quiz):** Luôn bọc `langgraph.invoke()` trong `frappe.enqueue(queue="long")`.
   - **Phản hồi tức thì (Chatbot, Socratic):** Dùng Redis lưu tạm, SSE/Socket.io (`frappe.publish_realtime`) để stream, thiết lập Rate Limit (vd: 5 requests/phút).
   - **RAG & Vector:** Offload sang External DB (Pinecone/Milvus). Việc OCR/Embedding phải chạy nền riêng biệt qua `frappe.enqueue`. Sử dụng Hybrid search thay vì dồn hết doc cho LLM.

---

## ✅ CHECKLIST: Thêm tính năng AI mới

> **Khi phát triển bất kỳ tính năng AI nào mới (agent, tool, service), BẮT BUỘC tuân thủ các bước sau theo đúng thứ tự.**

### Bước 1: Đăng ký Agent Name trong `LMS AI Settings`

Thêm option mới vào trường `agent_name` (Select) của Child DocType `AI Agent Config`:

```
# Sửa file: lms/doctype/ai_agent_config/ai_agent_config.json
# Thêm tên agent mới vào trường agent_name → options
"options": "...\\n<tên_agent_mới>"
```

Sau đó chạy `bench --site lms.localhost migrate`.

> Giáo viên/Admin có thể vào `LMS AI Settings` → tab Agent Configs → thêm row mới để cấu hình provider/model/key riêng cho chức năng này.

### Bước 2: Tạo Agent code

| Loại | Đặt ở đâu | Pattern |
|------|-----------|---------|
| Grading specialist mới | `agents/grading/<tên>.py` | Stateless function, nhận context dict |
| Chatbot node mới | `agents/chatbot/nodes/<tên>.py` | Function nhận `state`, trả dict update |
| Agent độc lập mới | `agents/<domain>/` | Thư mục riêng, có `__init__.py` |
| LangChain tool mới | `agents/tools/<tên>_tools.py` | `@tool` decorator |

**Template cho agent mới:**

```python
# agents/<domain>/<tên_agent>.py
import logging
from lms.lms.agents.provider import get_llm

logger = logging.getLogger(__name__)

def run_<tên_agent>(context: dict) -> dict:
    """
    <Mô tả chức năng>.

    Args:
        context: Dict chứa dữ liệu đầu vào

    Returns:
        Dict kết quả
    """
    llm = get_llm("<tên_agent>")  # ← Phải khớp với agent_name đã đăng ký ở Bước 1
    
    prompt = f"""..."""
    
    try:
        response = llm.invoke(prompt)
        return {"success": True, "content": response.content}
    except Exception as e:
        logger.error(f"<Tên agent> failed: {e}", exc_info=True)
        return {"success": False, "error": str(e)}
```

### Bước 3: Tạo Service layer (nếu cần API endpoint)

```python
# services/<domain>/api.py
import frappe
from frappe import _

@frappe.whitelist()
def <tên_api>(param1: str, param2: str = None) -> dict:
    """
    <Mô tả endpoint>.
    
    API: lms.lms.services.<domain>.api.<tên_api>
    Permission: Logged-in user
    """
    # 1. Validate
    if not param1:
        frappe.throw(_("param1 is required"), frappe.ValidationError)
    
    # 2. Permission check
    frappe.has_permission("<DocType>", throw=True)
    
    # 3. Business logic
    from lms.lms.agents.<domain>.<tên_agent> import run_<tên_agent>
    result = run_<tên_agent>({"param1": param1, "param2": param2})
    
    return result
```

### Bước 4: Viết Test

```python
# tests/unit/test_<tên_agent>.py
import frappe
from unittest.mock import patch, MagicMock

class TestNewAgent(frappe.tests.utils.FrappeTestCase):
    @patch("lms.lms.agents.provider.get_llm")
    def test_basic_flow(self, mock_get_llm):
        mock_llm = MagicMock()
        mock_llm.invoke.return_value.content = '{"score": 8}'
        mock_get_llm.return_value = mock_llm
        
        from lms.lms.agents.<domain>.<tên_agent> import run_<tên_agent>
        result = run_<tên_agent>({"param1": "test"})
        
        self.assertTrue(result["success"])
        mock_get_llm.assert_called_once_with("<tên_agent>")
```

### Bước 5: Đăng ký route (nếu có API endpoint)

Thêm vào `hooks.py` hoặc frontend `router.js` tuỳ thuộc vào loại endpoint.

### Bước 6: Cập nhật Documentation

- [ ] Cập nhật `AGENTS.md` — thêm agent mới vào Codebase Map + Skill Routing table
- [ ] Cập nhật file SKILL.md này — thêm agent_name vào danh sách `get_llm()` examples
- [ ] Viết docstring cho public functions (Google-style)

---

### Tóm tắt nhanh — New AI Feature Checklist

```
□ 1. Đăng ký agent_name trong AI Agent Config DocType
□ 2. Tạo agent code — dùng get_llm("<agent_name>") — KHÔNG import LLM trực tiếp
□ 3. Tạo service/API endpoint (nếu cần) — check permission
□ 4. Viết test — mock get_llm, verify agent_name đúng
□ 5. Đăng ký route (nếu có frontend)
□ 6. Cập nhật AGENTS.md + SKILL.md
□ 7. bench migrate + bench build (nếu có frontend)
```

### ❌ KHÔNG ĐƯỢC LÀM khi thêm tính năng AI

- **KHÔNG** import `ChatOpenAI`, `ChatGoogleGenerativeAI`, `ChatAnthropic` trực tiếp trong agent code
- **KHÔNG** hardcode API key, model name, hoặc provider name trong agent code
- **KHÔNG** tạo file provider/router mới — mọi thứ phải đi qua `agents/provider.py`
- **KHÔNG** đặt test chung với source code — test phải nằm trong `tests/`
- **KHÔNG** bỏ qua permission check trong API endpoint
- **KHÔNG** dùng `os.environ` để lấy API key — phải lấy từ `LMS AI Settings`


---

## Nguyên tắc thiết kế cốt lõi

1. **State là backbone** — nhỏ, typed, explicit. Không dump transient value vào state.
2. **Memory có tầng** — short-term (thread-scoped) vs long-term (cross-thread). Không dùng 1 cơ chế cho cả 2.
3. **Graph flow đơn giản trước** — simple edge → conditional edge → subgraph. Không over-engineer.
4. **Checkpointer ≠ Store** — Checkpointer lưu execution state; Store lưu user knowledge/preferences.
5. **Fail gracefully** — mọi node phải có error boundary; batch job dùng savepoint.

---

## Phân tầng Memory (quan trọng nhất)

```
┌─────────────────────────────────────────────────┐
│  Layer 3 — Long-term Store (cross-thread)        │
│  User preferences, facts, profiles               │
│  Backend: PostgresStore / RedisStore             │
├─────────────────────────────────────────────────┤
│  Layer 2 — Short-term Checkpointer (per-thread)  │
│  Conversation history, graph execution state     │
│  Backend: PostgresSaver / RedisSaver             │
├─────────────────────────────────────────────────┤
│  Layer 1 — In-context Window                     │
│  Trimmed messages đang được LLM xử lý           │
│  Giới hạn bởi token limit của model             │
└─────────────────────────────────────────────────┘
```

| Layer | Scope | Mục đích | Dev | Production |
|---|---|---|---|---|
| In-context | 1 LLM call | Messages đang xử lý | `trim_messages()` | `trim_messages()` |
| Checkpointer | 1 thread | Conversation continuity | `InMemorySaver` | `PostgresSaver` |
| Store | Cross-thread | User profile, preferences | `InMemoryStore` | `PostgresStore` / `RedisStore` |

---

## State Design

### State nhỏ, typed, explicit
```python
from typing import Annotated, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


# ✅ Đúng — minimal, typed, reducer rõ ràng
class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]  # reducer tự append
    user_id: str
    session_id: str
    # Không để transient values ở đây


# ❌ Sai — quá nhiều transient data trong state
class BadState(TypedDict):
    messages: list
    user_id: str
    raw_api_response: dict       # transient — dùng function scope
    debug_info: str              # transient — không cần persist
    last_tool_call_result: dict  # transient
```

### State với context ngoài messages
```python
from typing import Optional

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_id: str
    thread_id: str
    # Summary để giảm token khi conversation dài
    conversation_summary: Optional[str]
    # Metadata workflow
    current_intent: Optional[str]    # "faq" | "order" | "complaint"
    escalated: bool
```

---

## Checkpointer — Short-term Memory

### Development (InMemorySaver)
```python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, END

def build_graph(checkpointer):
    graph = StateGraph(ChatState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", route_after_agent)
    graph.add_edge("tools", "agent")
    return graph.compile(checkpointer=checkpointer)

# Dev
checkpointer = InMemorySaver()
app = build_graph(checkpointer)
```

### Production (PostgresSaver)
```python
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool

DB_URI = "postgresql://user:pass@localhost:5432/ai_db"

# Dùng connection pool — bắt buộc trong production
pool = ConnectionPool(
    conninfo=DB_URI,
    max_size=20,
    kwargs={"autocommit": True, "prepare_threshold": 0},
)

checkpointer = PostgresSaver(pool)
checkpointer.setup()  # tạo tables nếu chưa có

app = build_graph(checkpointer)
```

### Thread config — chuẩn multi-tenant
```python
def make_config(tenant_id: str, user_id: str, session_id: str) -> dict:
    """
    Thread ID phải unique per conversation session.
    Namespace phân tách data giữa tenant.
    """
    return {
        "configurable": {
            "thread_id": f"{tenant_id}:{user_id}:{session_id}",
            "checkpoint_ns": f"tenant-{tenant_id}",
        }
    }

# Invoke với config
config = make_config("acme_corp", "user_123", "sess_abc")
result = app.invoke({"messages": [HumanMessage(content="Hello")]}, config=config)
```

---

## Store — Long-term Memory (cross-thread)

### User preferences / facts
```python
from langgraph.store.memory import InMemoryStore  # dev
# from langgraph.store.postgres import PostgresStore  # production

store = InMemoryStore()

# Namespace phân tách rõ ràng
def get_user_namespace(user_id: str) -> tuple:
    return ("users", user_id, "preferences")

def get_session_namespace(user_id: str, session_id: str) -> tuple:
    return ("users", user_id, "sessions", session_id)

# Lưu preferences
store.put(
    get_user_namespace("user_123"),
    "language_settings",
    {"language": "vi", "response_style": "concise"},
)

# Đọc trong node
def agent_node(state: AgentState, config: dict, *, store):
    user_id = state["user_id"]
    prefs = store.get(get_user_namespace(user_id), "language_settings")
    language = prefs.value.get("language", "en") if prefs else "en"
    # dùng language trong prompt
```

### Compile graph với store
```python
app = graph.compile(checkpointer=checkpointer, store=store)
```

---

## Message Management — Token Budget

### Trim messages để không vượt context window
```python
from langchain_core.messages import trim_messages, SystemMessage

def agent_node(state: AgentState) -> dict:
    # Trim trước khi gửi vào LLM — giữ lại SystemMessage và N messages gần nhất
    trimmed = trim_messages(
        state["messages"],
        strategy="last",
        token_counter=llm,          # đếm token theo model thực tế
        max_tokens=4096,            # giới hạn token cho conversation history
        start_on="human",           # bắt đầu từ human message
        include_system=True,        # luôn giữ system message
        allow_partial=False,
    )
    response = llm.invoke(trimmed)
    return {"messages": [response]}
```

### Summarization khi conversation quá dài
```python
SUMMARIZE_AFTER_MESSAGES = 20

def maybe_summarize_node(state: AgentState) -> dict:
    """Tóm tắt conversation khi quá dài — gọi trước agent node."""
    messages = state["messages"]

    if len(messages) < SUMMARIZE_AFTER_MESSAGES:
        return {}  # không làm gì

    # Tóm tắt toàn bộ conversation
    summary_prompt = f"""Tóm tắt ngắn gọn cuộc trò chuyện sau đây,
    giữ lại các thông tin quan trọng (tên, yêu cầu, context chính):

    {_format_messages(messages[:-4])}
    """
    summary = llm.invoke(summary_prompt).content

    # Giữ lại 4 messages gần nhất + summary
    recent = messages[-4:]
    summary_message = SystemMessage(content=f"[Tóm tắt cuộc trò chuyện trước]: {summary}")

    return {
        "messages": [summary_message] + recent,
        "conversation_summary": summary,
    }
```

---

## Graph Architecture Patterns

### Pattern 1: Simple Chatbot với RAG
```python
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

def build_rag_chatbot(llm, retriever, checkpointer, store):

    # Tools
    @tool
    def search_knowledge_base(query: str) -> str:
        """Tìm kiếm thông tin trong knowledge base."""
        docs = retriever.invoke(query)
        return "\n\n".join(d.page_content for d in docs)

    tools = [search_knowledge_base]
    llm_with_tools = llm.bind_tools(tools)

    # Nodes
    def agent_node(state: ChatState) -> dict:
        trimmed = trim_messages(state["messages"], max_tokens=4096,
                                strategy="last", token_counter=llm,
                                include_system=True)
        response = llm_with_tools.invoke(trimmed)
        return {"messages": [response]}

    def route(state: ChatState) -> str:
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return END

    # Graph
    g = StateGraph(ChatState)
    g.add_node("agent", agent_node)
    g.add_node("tools", ToolNode(tools))
    g.set_entry_point("agent")
    g.add_conditional_edges("agent", route)
    g.add_edge("tools", "agent")

    return g.compile(checkpointer=checkpointer, store=store)
```

### Pattern 2: Supervisor Multi-Agent
```python
from langgraph.graph import StateGraph, END
from typing import Literal

class SupervisorState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_id: str
    next_agent: Optional[str]      # supervisor quyết định agent nào tiếp theo
    task_result: Optional[str]

# Supervisor node — phân tích intent, điều hướng
def supervisor_node(state: SupervisorState) -> dict:
    system_prompt = """Bạn là supervisor điều phối các agent chuyên biệt.
    Dựa vào tin nhắn của user, hãy chọn agent phù hợp:
    - "faq_agent": câu hỏi thường gặp, thông tin sản phẩm
    - "order_agent": đặt hàng, tra cứu đơn hàng
    - "complaint_agent": khiếu nại, hỗ trợ kỹ thuật
    - "FINISH": đã có đủ thông tin để trả lời user

    Trả về JSON: {"next": "<agent_name>", "reasoning": "<lý do>"}
    """
    response = llm.invoke([SystemMessage(content=system_prompt)] + state["messages"])
    decision = json.loads(response.content)
    return {"next_agent": decision["next"]}

def route_supervisor(state: SupervisorState) -> Literal["faq_agent", "order_agent", "complaint_agent", END]:
    next_agent = state.get("next_agent")
    if next_agent == "FINISH" or not next_agent:
        return END
    return next_agent

# Build graph
g = StateGraph(SupervisorState)
g.add_node("supervisor", supervisor_node)
g.add_node("faq_agent", faq_agent_node)
g.add_node("order_agent", order_agent_node)
g.add_node("complaint_agent", complaint_agent_node)

g.set_entry_point("supervisor")
g.add_conditional_edges("supervisor", route_supervisor)

# Tất cả agent sau khi xử lý đều quay lại supervisor
for agent in ["faq_agent", "order_agent", "complaint_agent"]:
    g.add_edge(agent, "supervisor")

app = g.compile(checkpointer=checkpointer)
```

### Pattern 3: Subgraph cho module độc lập
```python
# Subgraph xử lý một domain cụ thể — có thể test độc lập
def build_order_subgraph(llm, order_tools):
    class OrderState(TypedDict):
        messages: Annotated[list[BaseMessage], add_messages]
        order_id: Optional[str]
        order_status: Optional[str]

    g = StateGraph(OrderState)
    g.add_node("order_agent", lambda s: {"messages": [llm.invoke(s["messages"])]})
    g.set_entry_point("order_agent")
    g.add_edge("order_agent", END)
    return g.compile()  # Subgraph không cần checkpointer riêng

order_subgraph = build_order_subgraph(llm, order_tools)

# Dùng subgraph như 1 node trong parent graph
parent_graph.add_node("order_agent", order_subgraph)
```

---

## RAG Pipeline

### Document ingestion
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma  # dev
# from langchain_postgres import PGVector  # production
from langchain_openai import OpenAIEmbeddings

def ingest_documents(docs: list, collection_name: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,         # overlap giữ context ở ranh giới chunk
        separators=["\n\n", "\n", ".", " "],
    )
    chunks = splitter.split_documents(docs)

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=collection_name,
        persist_directory="./chroma_db",
    )
    return vectorstore
```

### Retriever với reranking
```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

def build_retriever(vectorstore, llm):
    base_retriever = vectorstore.as_retriever(
        search_type="mmr",         # Maximal Marginal Relevance — giảm redundancy
        search_kwargs={"k": 6, "fetch_k": 20},
    )

    # Reranking — lọc/nén kết quả retrieval
    compressor = LLMChainExtractor.from_llm(llm)
    retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=base_retriever,
    )
    return retriever
```

### RAG node với citation
```python
def rag_node(state: ChatState) -> dict:
    query = state["messages"][-1].content

    # Retrieve
    docs = retriever.invoke(query)

    if not docs:
        return {"messages": [AIMessage(content="Tôi không tìm thấy thông tin liên quan.")]}

    # Build context với source tracking
    context_parts = []
    for i, doc in enumerate(docs):
        source = doc.metadata.get("source", f"Doc {i+1}")
        context_parts.append(f"[{i+1}] ({source}):\n{doc.page_content}")
    context = "\n\n".join(context_parts)

    # Prompt
    prompt = f"""Dựa vào thông tin sau để trả lời câu hỏi.
Trích dẫn số nguồn [1], [2]... khi dùng thông tin.
Nếu không có thông tin phù hợp, nói rõ "Tôi không có thông tin về vấn đề này".

Thông tin:
{context}

Câu hỏi: {query}
"""
    response = llm.invoke(state["messages"][:-1] + [HumanMessage(content=prompt)])
    return {"messages": [response]}
```

---

## Streaming

```python
# Streaming token-by-token ra client
async def stream_response(user_message: str, config: dict):
    async for event in app.astream_events(
        {"messages": [HumanMessage(content=user_message)]},
        config=config,
        version="v2",
    ):
        kind = event["event"]

        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                yield chunk.content  # token stream ra frontend

        elif kind == "on_tool_start":
            yield f"\n[Đang tìm kiếm: {event['name']}...]\n"

        elif kind == "on_tool_end":
            yield "\n"  # newline sau tool result

# FastAPI endpoint
@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    config = make_config(request.tenant_id, request.user_id, request.session_id)
    return StreamingResponse(
        stream_response(request.message, config),
        media_type="text/event-stream",
    )
```

### Chọn stream mode đúng
```python
# messages  → token-level, dùng cho chat UI
# updates   → state delta mỗi bước, dùng cho dashboard / debug
# values    → full state snapshot, dùng khi cần toàn bộ state
# custom    → payload tùy chỉnh từ node

# Bandwidth-friendly cho production UI
async for delta in app.astream(inputs, stream_mode="updates", config=config):
    handle_delta(delta)
```

---

## Human-in-the-Loop (HITL)

```python
from langgraph.types import interrupt

def sensitive_action_node(state: AgentState) -> dict:
    """Node yêu cầu human approval trước khi thực thi."""
    action = state["pending_action"]

    # Interrupt — dừng graph, chờ human input
    human_decision = interrupt({
        "action": action,
        "message": f"Xác nhận thực hiện: {action['description']}?",
        "options": ["approve", "reject", "modify"],
    })

    if human_decision == "reject":
        return {"messages": [AIMessage(content="Hành động đã bị hủy.")]}

    # Tiếp tục sau khi được approve
    result = execute_action(action)
    return {"messages": [AIMessage(content=f"Đã thực hiện: {result}")]}

# Compile với interrupt
app = graph.compile(checkpointer=checkpointer, interrupt_before=["sensitive_action"])

# Resume sau khi human approve
app.invoke(Command(resume="approve"), config=config)
```

---

## Error Handling trong Graph

```python
def robust_node(state: AgentState) -> dict:
    try:
        result = _call_external_api(state)
        return {"messages": [AIMessage(content=result)]}

    except RateLimitError:
        # Retry với backoff — không crash graph
        import time
        time.sleep(2)
        result = _call_external_api(state)
        return {"messages": [AIMessage(content=result)]}

    except ExternalAPIError as e:
        # Graceful degradation — thông báo user, không crash
        return {"messages": [AIMessage(
            content="Xin lỗi, dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau."
        )]}

    except Exception as e:
        # Log và escalate
        logger.error(f"Unexpected error in node: {e}", exc_info=True)
        return {"messages": [AIMessage(
            content="Đã xảy ra lỗi không mong đợi. Đội hỗ trợ đã được thông báo."
        )], "escalated": True}
```

---

## Observability — LangSmith

```python
import os

# Bật tracing — đặt trong app startup, không trong code logic
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "my-ai-system"
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGSMITH_API_KEY")

# Custom metadata cho trace
config = {
    "configurable": {"thread_id": thread_id},
    "metadata": {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "feature": "chatbot",
    },
    "tags": ["production", "v2"],
}
```

---

## Cấu trúc thư mục chuẩn

```
ai_system/
├── agents/
│   ├── __init__.py
│   ├── chatbot.py          # Main chatbot graph
│   ├── supervisor.py       # Supervisor agent
│   └── subgraphs/
│       ├── faq.py
│       ├── order.py
│       └── complaint.py
├── memory/
│   ├── checkpointer.py     # Khởi tạo checkpointer theo env
│   ├── store.py            # Khởi tạo store theo env
│   └── message_utils.py   # trim_messages, summarize helpers
├── rag/
│   ├── ingestor.py         # Document ingestion pipeline
│   ├── retriever.py        # Retriever + reranking
│   └── vectorstore.py      # Vectorstore factory
├── tools/
│   ├── search.py
│   ├── order_tools.py
│   └── __init__.py
├── api/
│   ├── chat.py             # FastAPI endpoints
│   └── schemas.py          # Pydantic request/response models
├── config.py               # Settings từ env vars
└── tests/
    ├── test_chatbot.py
    ├── test_rag.py
    └── test_memory.py
```

---

## Không làm
- Không dùng `InMemorySaver` / `InMemoryStore` trong production — mất data khi restart
- Không put raw conversation history vào Store (long-term) — đó là việc của Checkpointer
- Không để logic điều hướng workflow trong prompt — dùng conditional edge
- Không gọi LLM trong `validate()` hay startup — lazy initialization
- Không hardcode `thread_id` — mỗi conversation session phải unique
- Không dùng `ConversationBufferMemory` (LangChain legacy) — đã deprecated, dùng LangGraph checkpointer
- Không để toàn bộ conversation history vào context window — luôn trim trước khi invoke LLM