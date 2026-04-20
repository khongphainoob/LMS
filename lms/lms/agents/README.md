# LangGraph Agents Module (Refactor for LMS)

Tai lieu nay thay the blueprint cu bang mot mo hinh kha thi hon, co the dua vao codebase hien tai de trien khai tung buoc.

## 1. Danh gia kha thi theo hien trang

### Hien trang module agents
- Da co khung thu muc: `state.py`, `nodes/`, `graphs/`, `tools/`.
- Chua co node/graph luong grading thuc te.
- Chua co dependency `langgraph` trong requirements/pyproject.
- Cac AI provider dang o muc adapter rieng (OpenAI/Gemini/Anthropic/Kyma), chua noi truc tiep vao graph.

### Ket luan kha thi
- Kha thi cao neu chia nho thanh MVP sequential graph truoc.
- Chua kha thi neu lam ngay full multi-agent parallel + interrupt/resume + RAG + sandbox.
- Nen uu tien luong cham bai don gian, co review gate, sau do mo rong.

## 2. Muc tieu refactor

### Muc tieu v1 (co the chay)
- 1 graph grading co 5 node co ban:
  - load_submission
  - split_questions
  - grade_questions
  - aggregate
  - apply_review
- State ro rang cho pipeline grading (khong phu thuoc chat message history).
- Tools Frappe gom wrapper doc/ghi doc de de mock test.

### Pham vi hoan lai (v2+)
- OCR da trang + layout parser.
- Fan-out parallel grader cho tung cau.
- RAG hybrid retrieval.
- Checkpoint saver vao DocType rieng va resume workflow.
- Sandbox code execution.

## 3. Cau truc da cap nhat trong du an

- `state.py`
  - Doi sang `AgentState` theo domain grading.
  - Khong buoc phu thuoc `langchain_core.messages`.
- `nodes/grading_nodes.py`
  - Them skeleton node cho luong v1.
- `graphs/grading_graph.py`
  - Build graph theo kieu lazy import (`langgraph` chi can khi build graph).
- `tools/frappe_tools.py`
  - Wrapper Frappe I/O de tai su dung va de test.

## 4. Mo hinh grading de ap dung ngay

### Luong xu ly de xuat
1. API layer tao `AgentState` toi thieu (submission_id, source_text, provider, model).
2. Graph chay `load_submission -> split_questions -> grade_questions -> aggregate`.
3. Graph dat `status=waiting_review` de giao vien phe duyet.
4. Sau review, set `review_decision` va invoke lai graph de `apply_review`.
5. Neu approved/partial_edit thi cap nhat diem va feedback.

### Why model nay phu hop voi LMS hien tai
- Co the dung duoc ngay du lieu va provider da co.
- Khong phat sinh nhieu DocType moi ngay lap tuc.
- De viet unit test cho tung node.
- De nang cap dan sang multi-agent phuc tap.

## 5. Mapping voi thanh phan hien co

- AI provider adapters: tiep tuc dung qua service layer, khong nhung truc tiep vao node v1.
- Frappe data model: uu tien tai su dung `AI Grading Session` va `AI Grading Submission` truoc khi tao them DocType.
- Review flow: v1 cho phep "soft interrupt" bang status + invoke lai graph.

## 6. Ke hoach trien khai khuyen nghi

### Sprint A (1-2 ngay)
- Hoan thien luong v1 end-to-end voi du lieu text.
- Them API trigger graph va API submit review decision.
- Viet test cho 5 node co ban.

### Sprint B (3-5 ngay)
- Noi provider thuc vao `grade_questions_node`.
- Chuan hoa rubric input/output schema.
- Them logging va error handling theo submission.

### Sprint C
- Them OCR + split thong minh.
- Them checkpoint persistence.
- Can nhac parallel grading khi da co benchmark.

## 7. Nguyen tac thiet ke trong repo nay

- Build small, run early, iterate.
- Khong lock architecture vao mot stack retrieval/sandbox ngay tu dau.
- Moi node phai co input/output ro rang va co the test doc lap.
- Uu tien do on dinh va kha nang debug hon fancy graph.

## 8. Ghi chu dependency

Neu can build graph that su, can cai:
- `langgraph`

Neu can LLM cho node grading:
- dung cac provider service da co trong `lms/services/ai_provider`.

Tai lieu nay la ban "ap dung duoc ngay" cho codebase hien tai, thay vi blueprint full-scale mang tinh dinh huong dai han.
# 🧠 LangGraph Agents Module

Hệ thống Agentic AI của Frappe LMS được xây dựng dựa trên **LangGraph**, cho phép tạo ra các luồng xử lý AI có trạng thái (stateful) và có khả năng lặp (loops).

## Cấu trúc thư mục

- `state.py`: Định nghĩa `AgentState` - cấu trúc dữ liệu được truyền qua các node.
- `nodes/`: Chứa các hàm xử lý logic (Python functions). Mỗi node nhận một `AgentState` và trả về một phần của `AgentState` cần cập nhật.
- `graphs/`: Nơi định nghĩa sơ đồ (Graph), nối các node lại với nhau bằng các cạnh (Edges) và điều kiện (Conditional Edges).
- `tools/`: Chứa các công cụ (Tools) mà Agent có thể sử dụng (ví dụ: truy vấn database Frappe).

## Cách tạo một Agent mới

1. Định nghĩa State trong `state.py` (nếu cần mở rộng).
2. Tạo các Node trong `nodes/`.
3. Kết nối các Node trong một file mới tại `graphs/` (ví dụ: `new_agent_graph.py`).
4. Biên dịch và sử dụng: `graph = workflow.compile()`.

## Ví dụ về Tool trong Frappe
Tận dụng `frappe.get_doc` hoặc `frappe.db.get_list` để cung cấp dữ liệu cho Agent.

# Multi-Agent Grading System — Build Blueprint
> Frappe LMS × LangGraph | Tài liệu cho agent build

---

## 1. DANH SÁCH AGENTS CẦN XÂY

### A. `OCRAgent`
- **Vai trò**: Nhận file bài nộp (PDF/ảnh), trả về text có cấu trúc
- **Input**: `file_path: str`, `submission_id: str`
- **Output**: `OcrResult { raw_text, confidence, pages: [{page_no, text, bboxes}] }`
- **Trigger flag**: Nếu `confidence < 0.75` → set `state.needs_manual_ocr = True`, dừng pipeline

### B. `QuestionSplitterAgent`
- **Vai trò**: Tách raw text thành các chunk theo câu hỏi
- **Input**: `raw_text`, `rubric_question_count: int`
- **Output**: `List[QuestionChunk { id, header, body, rubric_id, split_method }]`
- **Logic**: Waterfall P1→P2→P3→P4 (xem Section 3)

### C. `GraderAgent` _(chạy parallel, 1 instance / câu)_
- **Vai trò**: Chấm 1 câu hỏi dựa trên rubric + RAG context
- **Input**: `QuestionChunk`, `rubric_criteria`, `rag_context`, `subject_type`
- **Output**: `GradeResult { question_id, score, max_score, confidence, cot_reasoning, evidence_citations }`
- **Variants theo môn**:
  - `STEMGrader`: step-by-step CoT, partial credit per bước
  - `EssayGrader`: multi-dimension rubric (nội dung / lập luận / ngôn ngữ / dẫn chứng)
  - `CodeGrader`: chạy sandbox, đếm test pass, style check
  - `CaseStudyGrader`: evidence-based scoring, citation bắt buộc

### D. `AggregatorAgent`
- **Vai trò**: Tổng hợp kết quả từ tất cả GraderAgent
- **Input**: `List[GradeResult]`
- **Output**: `AggregatedResult { total_score, per_question_breakdown, full_cot_chain, anomaly_flags }`
- **Logic**:
  - Weighted average theo `rubric.weight`
  - Detect conflict: cùng khái niệm nhưng câu khác cho điểm mâu thuẫn
  - Anomaly: so với `class_baseline`, flag nếu lệch > 2 std

### E. `HumanReviewAgent` _(interrupt node)_
- **Vai trò**: Dừng graph, đợi giáo viên phê duyệt
- **Input**: `AggregatedResult`
- **Output**: `ReviewDecision { action: approved|rejected|partial_edit|escalate, edited_scores?, note? }`
- **Mechanism**: LangGraph `interrupt()` → persist state → Frappe webhook resume

### F. `PublisherAgent`
- **Vai trò**: Ghi điểm cuối cùng vào Frappe, gửi thông báo
- **Input**: `ReviewDecision`, `submission_id`
- **Output**: cập nhật `LMS Submission.score`, gửi feedback, trigger notification

---

## 2. TOOLS CẦN BUILD

### OCR Tools
```python
@tool
def ocr_pdf(file_path: str) -> OcrResult:
    """PaddleOCR / Azure Form Recognizer → structured text"""

@tool
def detect_layout(file_path: str) -> LayoutResult:
    """pdfminer: trích font size, bbox, page structure"""
```

### Chunking Tools
```python
@tool
def split_by_regex(text: str, question_count: int) -> List[QuestionChunk]:
    """Regex waterfall P1-P3. Trả về chunks + split_method"""

@tool
def split_by_semantic(text: str, rubric_embeddings: List) -> List[QuestionChunk]:
    """Fallback: cosine similarity sliding window"""
```

### RAG Tools
```python
@tool
def retrieve_rubric_context(question_text: str, subject: str, top_k: int = 5) -> List[RagChunk]:
    """Hybrid BM25 + dense search trên Rubric Index"""

@tool
def retrieve_reference_answers(question_text: str, subject: str) -> List[RagChunk]:
    """Few-shot examples từ Reference Answer Index"""

@tool
def retrieve_course_material(claim_text: str, subject: str) -> List[RagChunk]:
    """Verify factual claims từ Course Material Index"""
```

### Grading Tools
```python
@tool
def run_code_sandbox(code: str, test_cases: List[TestCase], language: str) -> SandboxResult:
    """Docker subprocess: chạy code học sinh, trả về test pass/fail"""

@tool
def check_code_style(code: str, language: str) -> StyleResult:
    """pylint / eslint wrapper"""

@tool
def compute_levenshtein(a: str, b: str) -> int:
    """Fuzzy matching cho QuestionSplitter"""
```

### Frappe Integration Tools
```python
@tool
def frappe_get_submission(submission_id: str) -> dict:
    """frappe.get_doc('LMS Submission', submission_id)"""

@tool
def frappe_save_score(submission_id: str, score: float, feedback: str, status: str) -> bool:
    """doc.score = score; doc.save(); frappe.db.commit()"""

@tool
def frappe_get_rubric(rubric_id: str) -> dict:
    """frappe.get_doc('Grading Rubric', rubric_id)"""

@tool
def frappe_get_session(session_id: str) -> dict:
    """frappe.get_doc('Grading Session', session_id)"""

@tool
def frappe_send_notification(student_id: str, submission_id: str, message: str):
    """frappe.sendmail() + in-app notification"""

@tool
def frappe_save_agent_state(thread_id: str, state_json: str, status: str):
    """Ghi vào DocType 'AI Agent State'"""

@tool
def frappe_load_agent_state(thread_id: str) -> str:
    """Đọc state JSON từ 'AI Agent State'"""
```

---

## 3. BỘ NHỚ & LƯU TRỮ

### 3.1 Short-term Memory (LangGraph State — in-memory per run)
Toàn bộ `GradingState` object sống trong RAM trong suốt 1 run. Xem Section 4.

### 3.2 Checkpoint Storage (MariaDB qua Frappe DocType)

**DocType: `AI Agent State`**
```
Fields:
  thread_id        (str, unique, indexed)  — LangGraph thread identifier
  session_id       (str, linked)           — Grading Session
  submission_id    (str, linked)           — LMS Submission
  status           (Select: running | pending_review | approved | rejected | completed | error)
  checkpoint_data  (Long Text / JSON)      — serialized GradingState
  current_node     (str)                   — node đang dừng
  created_at       (Datetime)
  updated_at       (Datetime)
  reviewed_by      (Link: User)
  review_note      (Text)
```

**Custom `FrappeCheckpointSaver(BaseCheckpointSaver)`**:
```python
class FrappeCheckpointSaver(BaseCheckpointSaver):
    def put(self, config, checkpoint, metadata, new_versions):
        # frappe.get_doc('AI Agent State').save() với state serialized
        state_json = json.dumps(checkpoint, default=str)
        frappe_save_agent_state(config["thread_id"], state_json, "running")

    def get_tuple(self, config):
        # Load lại state khi resume
        state_json = frappe_load_agent_state(config["thread_id"])
        return CheckpointTuple(checkpoint=json.loads(state_json), ...)
```

### 3.3 Vector Store (RAG Long-term Memory)

| Index | Nội dung | Metadata |
|-------|----------|----------|
| `rubric_index` | Từng tiêu chí chấm | `subject`, `question_id`, `weight`, `level` |
| `reference_index` | Đáp án mẫu giáo viên | `subject`, `question_id`, `year` |
| `material_index` | Tài liệu bài giảng | `subject`, `chapter`, `course_id` |
| `history_index` | Bài làm mẫu đã được chấm | `subject`, `score_range`, `grade` |

**Tech**: ChromaDB (local) hoặc Qdrant (production). Embedding model: `multilingual-e5-large` (hỗ trợ tiếng Việt tốt).

### 3.4 Class Baseline (Analytics Storage)
```
DocType: Grading Analytics
  session_id, subject, mean_score, std_dev, score_distribution (JSON)
```
Dùng để `AggregatorAgent` detect anomaly.

---

## 4. LANGGRAPH STATE

```python
from typing import TypedDict, Optional, List, Literal, Annotated
import operator

class QuestionChunk(TypedDict):
    id: str                    # "cau_1", "cau_2a"
    header: str                # "Câu 1:"
    body: str                  # nội dung trả lời của học sinh
    rubric_id: str             # map với tiêu chí tương ứng
    split_method: str          # "regex" | "fuzzy" | "structural" | "semantic"

class GradeResult(TypedDict):
    question_id: str
    score: float
    max_score: float
    confidence: float          # 0.0 → 1.0
    cot_reasoning: str         # full chain-of-thought
    evidence_citations: List[str]  # đoạn RAG dùng làm bằng chứng
    subject_type: str          # "stem" | "essay" | "code" | "case_study"

class ReviewDecision(TypedDict):
    action: Literal["approved", "rejected", "partial_edit", "escalate"]
    edited_scores: Optional[dict]   # {question_id: new_score}
    note: Optional[str]
    reviewed_by: Optional[str]

class GradingState(TypedDict):
    # ── Session info ──
    thread_id: str
    session_id: str
    submission_id: str
    student_id: str
    subject: str               # "toan" | "van" | "code" | "case_study"
    rubric_id: str
    grading_config: dict       # temperature, model, strategy

    # ── OCR layer ──
    raw_file_path: str
    raw_text: Optional[str]
    ocr_confidence: Optional[float]
    needs_manual_ocr: bool

    # ── Splitter layer ──
    question_chunks: Optional[List[QuestionChunk]]
    split_method_used: Optional[str]

    # ── RAG layer ──
    rag_contexts: Optional[List[dict]]   # per question

    # ── Grading layer ──
    grade_results: Annotated[List[GradeResult], operator.add]  # fan-in accumulator

    # ── Aggregation layer ──
    total_score: Optional[float]
    aggregated_cot: Optional[str]
    anomaly_flags: Optional[List[str]]
    confidence_overall: Optional[float]

    # ── Review layer ──
    review_decision: Optional[ReviewDecision]
    interrupt_payload: Optional[dict]   # data gửi lên Frappe UI

    # ── Publisher layer ──
    final_score: Optional[float]
    final_feedback: Optional[str]
    published: bool

    # ── Error handling ──
    error_message: Optional[str]
    retry_count: int
```

---

## 5. WORKFLOW GRAPH TỔNG HỢP

```
START
  │
  ▼
[ocr_node]
  │  raw_text + confidence
  ├─ confidence < 0.75 ──→ [manual_ocr_node] ──→ WAIT (human upload lại)
  │
  ▼
[splitter_node]
  │  question_chunks[]
  │  Waterfall: regex → fuzzy → structural → semantic
  │
  ▼
[rag_node]
  │  Với mỗi chunk: retrieve rubric + reference + material context
  │
  ▼
[parallel_grade_node]  ← LangGraph Send API fan-out
  │  Mỗi QuestionChunk → GraderAgent riêng (async parallel)
  │  STEMGrader | EssayGrader | CodeGrader | CaseStudyGrader
  │  Output accumulate vào state.grade_results qua operator.add
  │
  ▼
[aggregator_node]
  │  Weighted sum → total_score
  │  Build full CoT chain
  │  Anomaly detection vs class baseline
  │  confidence_overall = mean(per_question.confidence)
  │
  ├─ confidence_overall > 0.90 AND no anomaly ──→ [auto_approve_node] ──→ [publisher_node]
  │                                                (skip human review)
  ▼
[human_review_node]   ← interrupt() tại đây
  │  Persist state → AI Agent State (status: pending_review)
  │  Push data lên Frappe Review UI
  │  === GRAPH DỪNG, CHỜ WEBHOOK ===
  │
  │  Frappe Controller nhận form submit từ giáo viên
  │  → graph.invoke(None, config={"thread_id": tid})  ← RESUME
  │
  ├─ action == "approved"      ──→ [publisher_node]
  ├─ action == "partial_edit"  ──→ [apply_edit_node] ──→ [publisher_node]
  ├─ action == "rejected"      ──→ [re_grade_node]   ──→ [rag_node]  (loop)
  └─ action == "escalate"      ──→ [escalate_node]   ──→ WAIT (senior reviewer)
  │
  ▼
[publisher_node]
  │  frappe.get_doc('LMS Submission', id)
  │  doc.score = final_score
  │  doc.ai_feedback = final_feedback  (personalized per môn)
  │  doc.grading_status = "Graded"
  │  doc.save(); frappe.db.commit()
  │  frappe.sendmail() + in-app notification
  │  Update Grading Analytics (class baseline)
  │
  ▼
END
```

---

## 6. DOCTYPES CẦN TẠO TRONG FRAPPE

| DocType | Mục đích |
|---------|----------|
| `AI Agent State` | Checkpoint LangGraph state (thread_id, status, JSON) |
| `Grading Session` | Config 1 phiên chấm (rubric, môn, danh sách submission) |
| `Grading Rubric` | Tiêu chí chấm có trọng số, per môn học |
| `Grading Analytics` | Baseline lớp (mean, std_dev, distribution) |
| `Grading Review Log` | Audit trail: giáo viên sửa gì, khi nào |

---

## 7. CONFIG PER MÔN HỌC

```python
SUBJECT_CONFIG = {
    "toan": {
        "grader_class": "STEMGrader",
        "llm_temperature": 0.1,
        "cot_strategy": "step_by_step",
        "partial_credit": True,
        "require_code_sandbox": False,
    },
    "van": {
        "grader_class": "EssayGrader",
        "llm_temperature": 0.3,
        "cot_strategy": "rubric_dimensions",
        "dimensions": ["noi_dung", "lap_luan", "dan_chung", "ngon_ngu"],
        "partial_credit": True,
    },
    "lap_trinh": {
        "grader_class": "CodeGrader",
        "llm_temperature": 0.1,
        "cot_strategy": "test_execution",
        "require_code_sandbox": True,
        "sandbox_timeout": 10,
    },
    "case_study": {
        "grader_class": "CaseStudyGrader",
        "llm_temperature": 0.2,
        "cot_strategy": "evidence_based",
        "require_citation": True,
        "auto_approve_threshold": 0.95,
    },
}
```

---

## 8. THỨ TỰ BUILD ĐỀ XUẤT

```
Sprint 1 — Foundation
  ✦ Frappe DocTypes (AI Agent State, Grading Session, Grading Rubric)
  ✦ FrappeCheckpointSaver
  ✦ Frappe integration tools (get/save submission, rubric, notification)

Sprint 2 — Input Pipeline
  ✦ OCRAgent + ocr_pdf tool + detect_layout tool
  ✦ QuestionSplitterAgent (regex + fuzzy, skip semantic trước)
  ✦ Unit test với bộ bài mẫu 20 file

Sprint 3 — RAG Setup
  ✦ Vector store init + indexing script
  ✦ retrieve_rubric_context + retrieve_reference_answers tools
  ✦ Rubric và material ingestion pipeline

Sprint 4 — Grading Core
  ✦ STEMGrader + EssayGrader (2 môn chính)
  ✦ AggregatorAgent + anomaly detection
  ✦ LangGraph graph assembly (sequential trước, parallel sau)

Sprint 5 — Human Loop & Publisher
  ✦ HumanReviewAgent + interrupt/resume
  ✦ Frappe Review UI (Doctype Form với approve/reject/edit)
  ✦ PublisherAgent + feedback generator

Sprint 6 — Parallel & Production
  ✦ LangGraph Send API fan-out
  ✦ CodeGrader + sandbox
  ✦ Auto-approve threshold logic
  ✦ Load test + error handling
```

---

## 9. LOGGING AND TRACING SYSTEM

### 9.1 Overview
Hệ thống logging tập trung để trace hoạt động của agents, LangGraph state transitions, và LangSmith traces. Logs được lưu trong Frappe DocType để dễ truy vấn và debug.

### 9.2 DocType: `Agent Log`
```
Fields:
  thread_id        (str, indexed)          — LangGraph thread identifier
  session_id       (str, linked)           — Grading Session
  submission_id    (str, linked)           — LMS Submission
  timestamp        (Datetime, indexed)     — Thời gian log
  level            (Select: INFO | ERROR | WARNING | DEBUG)
  component        (Select: agent | langgraph | langsmith)
  message          (Text)                  — Nội dung log
  metadata         (Long Text / JSON)      — Metadata bổ sung (state keys, results, etc.)
  error_details    (Long Text)             — Chi tiết lỗi (traceback)
```

### 9.3 AgentLogger Class (`logging.py`)
- **Chức năng**: Ghi log vào DocType 'Agent Log'
- **Methods**: `info()`, `error()`, `warning()`, `debug()`
- **Usage**: Khởi tạo với `thread_id`, log trong nodes và graphs

### 9.4 LangGraph Integration
- **Callback Handler**: `LangGraphLoggingCallback` tự động log node start/end, graph events
- **Attach to Graph**: `graph = workflow.compile(callbacks=[LangGraphLoggingCallback(logger)])`

### 9.5 LangSmith Tracing
- **Setup**: Gọi `setup_langsmith_tracing(api_key, project_name)` để enable tracing lên cloud
- **Traces**: Tự động capture runs, chains, và LLM calls cho visualization
- **Environment**: Set `LANGCHAIN_API_KEY`, `LANGCHAIN_TRACING_V2=true`, `LANGCHAIN_PROJECT`

### 9.6 Usage in Nodes
```python
from .logging import get_logger

def load_submission_node(state):
    logger = get_logger(state["thread_id"], state["session_id"], state["submission_id"])
    logger.info("agent", "Starting load_submission", {"submission_id": state["submission_id"]})
    try:
        # Logic
        logger.info("agent", "Submission loaded", {"status": "success"})
        return {"raw_text": "..."}
    except Exception as e:
        logger.error("agent", "Load failed", error_details=str(e))
        raise
```

### 9.7 Benefits
- **Traceability**: Theo dõi từng bước của agent runs
- **Debugging**: Logs chi tiết cho errors và state changes
- **Auditing**: Lưu trữ persistent trong Frappe DB
- **Monitoring**: Query logs để monitor performance và issues

---

*Generated for Frappe LMS Multi-Agent Grading System*
*Stack: LangGraph 0.2+ | Frappe v15 | MariaDB | ChromaDB/Qdrant | PaddleOCR*