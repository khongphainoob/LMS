# Deep Agents Architecture — AI Grading System (v2)

> Thiết kế hệ thống chấm điểm đa tác nhân sử dụng LangChain Deep Agents + LangGraph.
> Mục tiêu: đơn giản, hiệu quả, chi phí thấp nhất có thể.
> **v2:** Bỏ hoàn toàn Code Subagent. MCQ sử dụng AI (flash-lite).

---

## 1. Tại sao Deep Agents thay vì LangGraph thuần?

| Tiêu chí | LangGraph thuần | Deep Agents |
|---|---|---|
| Planning | Tự code conditional edges | Built-in `write_todos` |
| Context overflow | Tự xử lý khi state lớn | Virtual filesystem tự offload |
| Subagent isolation | Tự quản lý state riêng | `call_subagent` built-in |
| Boilerplate | Nhiều (nodes, edges, routing) | Tối thiểu |
| Debug | Khó trace | LangSmith native |
| Phù hợp khi | Workflow cố định, deterministic | Task phức tạp, non-deterministic |

**Kết luận:** Hệ thống chấm điểm có nhiều nhánh không xác định (loại môn, loại ảnh, loại đề bài) → Deep Agents phù hợp hơn LangGraph thuần.

> ⚠️ **Rủi ro thực tế:** `deepagents` là thư viện còn non trẻ, tài liệu ít, community nhỏ. Nếu Phase 1 phát hiện vấn đề → fallback sang LangGraph prebuilt react agent mà không mất nhiều công.

---

## 2. Triết lý thiết kế

```
Đơn giản nhất có thể:
- 1 Orchestrator Agent  (não trung tâm)
- 2 Subagent chuyên biệt (essay / stem)
- 1 MCQ Grader nhẹ     (flash-lite, không cần subagent riêng)
- Skills = prompt templates + tools tái sử dụng
- KHÔNG dùng AI cho việc Python làm được (validate, clamp điểm)
```

**Pattern chọn:** `Skills` cho các task lặp lại (OCR, parse file, classify),
`Subagents` cho các task cần isolation và reasoning sâu (chấm từng môn).

**Lý do MCQ dùng AI (flash-lite):**
- Chữ viết tay thực tế: khoanh không rõ, gạch xóa, khoanh sửa
- Flash-lite đủ nhận dạng ký tự A/B/C/D và xử lý edge cases
- Python lookup table không xử lý được nhận dạng mờ hoặc đáp án sửa

---

## 3. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│                     GRADING ORCHESTRATOR                        │
│              model: gemini-2.5-flash (balanced)                 │
│                                                                 │
│  Built-in tools (Deep Agents):                                  │
│    write_todos  →  lập kế hoạch chấm                           │
│    write_file   →  lưu context package ra filesystem            │
│    read_file    →  đọc lại khi cần                              │
│    call_subagent → gọi subagent chuyên biệt                     │
│                                                                 │
│  Custom tools:                                                  │
│    skill_load_context   →  đọc đề/rubric (.docx, .pdf)         │
│    skill_classify_pages →  phân loại ảnh bài làm               │
│    skill_build_package  →  lắp ráp context package              │
│    skill_grade_mcq      →  chấm trắc nghiệm (flash-lite)       │
│    tool_validate_score  →  Python clamp, không dùng AI         │
└──────────────────┬──────────────────────────────────────────────┘
                   │ call_subagent (context isolation)
              ┌────┴────┐
              ▼         ▼
        ┌──────────┐ ┌────────┐
        │  ESSAY   │ │  STEM  │
        │ Subagent │ │Subagent│
        │          │ │        │
        │ flash    │ │ flash  │
        │ temp=0.4 │ │(vision)│
        │          │ │temp=0.1│
        └──────────┘ └────────┘

MCQ: Orchestrator gọi skill_grade_mcq trực tiếp (flash-lite, 1 call)
     KHÔNG tạo subagent riêng — task đủ đơn giản
```

---

## 4. Orchestrator Agent

### 4.1 Khởi tạo

```python
from deepagents import create_deep_agent
from langchain.chat_models import init_chat_model

orchestrator = create_deep_agent(
    model=init_chat_model("google_genai:gemini-2.5-flash"),
    system_prompt=ORCHESTRATOR_PROMPT,
    tools=[
        skill_load_context,       # đọc file đề/rubric
        skill_classify_pages,     # phân loại ảnh thumbnail
        skill_build_package,      # lắp ráp context package
        skill_grade_mcq,          # chấm MCQ bằng flash-lite
        tool_validate_score,      # Python clamp cuối cùng
    ],
    subagents=[
        essay_subagent_config,
        stem_subagent_config,
    ],
)
```

### 4.2 System prompt

```
ORCHESTRATOR_PROMPT = """
Bạn là hệ thống điều phối chấm điểm tự động.

QUY TRÌNH (luôn theo đúng thứ tự):
1. write_todos: lập kế hoạch 4 bước cho phiên chấm
2. skill_load_context: đọc file đề bài / rubric đính kèm
3. skill_classify_pages: phân loại từng trang ảnh bài làm
4. skill_build_package: lắp ráp context package, lưu vào /context.json
5. Quyết định routing:
   - MCQ thuần → skill_grade_mcq (flash-lite, không tạo subagent)
   - Ngữ văn / Lịch sử / GDCD → call_subagent("essay-grader")
   - Toán / Lý / Hóa / Sinh → call_subagent("stem-grader")
   - Hỗn hợp → gọi lần lượt các agent/skill cần thiết
6. tool_validate_score: clamp điểm cuối cùng về [0, 10]
7. write_file: lưu kết quả JSON vào /result.json

NGUYÊN TẮC TIẾT KIỆM CHI PHÍ:
- MCQ: dùng flash-lite, KHÔNG tạo subagent
- Ảnh text-only: dùng flash-lite OCR, KHÔNG vision model đắt
- STEM: mới cần vision model cho công thức/hình vẽ
- Mỗi subagent chỉ nhận đúng phần context nó cần (không full dump)
"""
```

---

## 5. Hai Subagents chuyên biệt

### 5.1 Essay Subagent

**Khi nào dùng:** Ngữ văn, Lịch sử, Địa lý, GDCD, Tiếng Việt, Tiếng Anh (writing)

```python
essay_subagent_config = {
    "name": "essay-grader",
    "description": "Chấm bài luận, văn xuôi, bài viết xã hội nhân văn",
    "prompt": ESSAY_PROMPT,
    "model": "google_genai:gemini-2.5-flash",
    "tools": [read_file],
}

ESSAY_PROMPT = """
Bạn là chuyên gia chấm bài luận bậc phổ thông.

INPUT: Nhận /context.json từ orchestrator (đã có exam_context + bài làm OCR)

NHIỆM VỤ:
1. read_file("/context.json") để lấy đề bài, rubric, bài làm
2. Đánh giá theo 4 tiêu chí: Nội dung, Cấu trúc, Ngôn từ, Sáng tạo
3. Với mỗi câu/phần: viết reasoning trước, rồi mới chốt điểm
4. Điểm tổng KHÔNG vượt quá 10.0

OUTPUT JSON (write vào /grading_result.json):
{
  "total_score": float,
  "overall_feedback": "nhận xét tổng",
  "questions": [
    {
      "question_no": "Câu 1",
      "reasoning": "suy luận...",
      "score": float,
      "max_score": float,
      "feedback": "nhận xét chi tiết"
    }
  ]
}

KHÔNG tự ý phân bổ điểm nếu bài làm rỗng. Trả total_score = 0.
"""
```

**Skills của Essay Subagent:**

| Skill | Mô tả |
|-------|--------|
| `read_rubric_skill` | Load rubric từ context, parse criteria |
| `coherence_check_skill` | Đánh giá mạch văn, cấu trúc đoạn |
| `argument_depth_skill` | Phân tích chiều sâu lập luận, dẫn chứng |

---

### 5.2 STEM Subagent

**Khi nào dùng:** Toán, Vật lý, Hóa học, Sinh học (có công thức, hình vẽ)

```python
stem_subagent_config = {
    "name": "stem-grader",
    "description": "Chấm bài STEM: toán, lý, hóa, sinh — có công thức và hình vẽ",
    "prompt": STEM_PROMPT,
    "model": "google_genai:gemini-2.5-flash",   # vision mode khi cần
    "tools": [read_file],
}

STEM_PROMPT = """
Bạn là chuyên gia chấm bài STEM bậc phổ thông.

INPUT: Nhận /context.json — chú ý trường "vision_pages" chứa ảnh gốc
       cho các trang có công thức / hình vẽ

QUY TRÌNH CHẤM:
1. read_file("/context.json")
2. Với mỗi câu hỏi:
   a. Nếu trang là "text_only": đọc OCR text
   b. Nếu trang là "has_formula" / "has_diagram": đọc trực tiếp từ ảnh gốc
      (KHÔNG tin OCR cho công thức — quá nhiều lỗi)
3. Kiểm tra từng bước giải, KHÔNG chỉ kết quả cuối
4. Nếu kết quả sai nhưng phương pháp đúng: cho điểm thành phần

NGUYÊN TẮC QUAN TRỌNG:
- Công thức viết tay: đọc từ ảnh gốc, bỏ qua OCR
- Hình vẽ hình học: mô tả lại bằng text trong reasoning
- Lỗi đơn vị / lỗi dấu: trừ điểm nhẹ, không trừ toàn bộ

OUTPUT JSON → write_file("/grading_result.json"):
{
  "total_score": float,
  "overall_feedback": "nhận xét logic và trình bày",
  "questions": [
    {
      "question_no": "Câu 1",
      "student_steps": ["bước 1...", "bước 2..."],
      "reasoning": "kiểm tra từng bước...",
      "score": float,
      "max_score": float,
      "feedback": "lỗi cụ thể nếu có"
    }
  ]
}
"""
```

**Skills của STEM Subagent:**

| Skill | Mô tả |
|-------|--------|
| `formula_reader_skill` | Đọc công thức từ ảnh gốc, convert LaTeX |
| `step_checker_skill` | Kiểm tra từng bước giải có logic |

---

## 6. MCQ — Dùng AI (flash-lite)

MCQ **không** tách thành subagent riêng. Orchestrator gọi thẳng `skill_grade_mcq` — một lần call flash-lite — đủ xử lý chữ viết tay mờ, gạch xóa, khoanh sửa.

**Lý do không dùng Python lookup:**
- Chữ viết tay thực tế không phải lúc nào cũng rõ ràng
- Học sinh có thể gạch rồi khoanh lại → cần AI phán đoán đáp án cuối
- Flash-lite rẻ (~$0.001/call) và đủ năng lực cho task nhận dạng đơn giản

```python
MCQ_PROMPT = """
Bạn nhận ảnh trang trắc nghiệm của học sinh và đáp án chuẩn.

NHIỆM VỤ:
1. Nhận dạng từng câu: học sinh khoanh đáp án nào? (A/B/C/D)
   - Nếu có gạch xóa: lấy đáp án CUỐI CÙNG (sau khi sửa)
   - Nếu không rõ: ghi "unclear" và không tính điểm câu đó
2. So sánh với đáp án chuẩn
3. Tính điểm: đúng = điểm_mỗi_câu, sai/unclear = 0

OUTPUT JSON:
{
  "total_score": float,
  "correct_count": int,
  "total_questions": int,
  "questions": [
    {
      "question_no": "1",
      "student_answer": "A",
      "correct_answer": "B",
      "correct": false,
      "unclear": false,
      "score": 0
    }
  ],
  "overall_feedback": "Đúng X/Y câu = Z/10"
}
"""
```

---

## 7. Skills tái sử dụng (dùng ở Orchestrator)

### 7.1 skill_load_context

```python
@tool
def skill_load_context(session_id: str) -> str:
    """
    Đọc tất cả file đính kèm (.docx, .pdf) của phiên chấm.
    Tự chọn strategy: zipfile → docxlatex → Gemini native PDF.
    Ghi kết quả ra /exam_context.txt để subagent đọc lại.
    Trả về summary ngắn (không full text, tránh overflow context orchestrator).
    """
    files = _get_session_files(session_id)
    context_parts = []

    for f in files:
        path = _resolve_path(f.file_url)
        if path.endswith(".pdf"):
            result = _load_pdf_gemini_native(path)
        elif path.endswith(".docx"):
            result = _load_docx_threelayer(path)
        context_parts.append(result)

    full_context = "\n\n".join(context_parts)
    _write_to_filesystem(session_id, "exam_context.txt", full_context)

    return f"Loaded {len(full_context)} chars. has_formula={_detect_formula(full_context)}"
```

### 7.2 skill_classify_pages

```python
@tool
def skill_classify_pages(image_paths: list[str]) -> str:
    """
    Gửi thumbnail 256px của tất cả trang → gemini-flash-lite phân loại.
    1 API call duy nhất dù có 10 trang.
    Phân loại 4 loại: text_only | has_formula | has_diagram | mcq
    Ghi metadata ra /pages_meta.json.
    """
    thumbnails = [_resize_256px(p) for p in image_paths]
    result = _classify_batch(thumbnails)   # 1 call flash-lite ~$0.001
    _write_to_filesystem("pages_meta.json", json.dumps(result))
    summary = {t: sum(1 for p in result if p["type"]==t)
               for t in ["text_only","has_formula","has_diagram","mcq"]}
    return f"Classified {len(result)} pages: {summary}"
```

### 7.3 skill_build_package

```python
@tool
def skill_build_package(session_id: str) -> str:
    """
    Lắp ráp context package từ exam_context + pages_meta.
    Quyết định trang nào dùng OCR (text), trang nào giữ ảnh gốc (vision).
    Ghi /context.json — file này là input duy nhất cho subagents.
    """
    exam_context = _read_filesystem("exam_context.txt")
    pages_meta   = json.loads(_read_filesystem("pages_meta.json"))

    pages = []
    for meta in pages_meta:
        if meta["type"] in ["text_only", "mcq"]:
            ocr = _cheap_ocr(meta["image_path"])   # flash-lite
            pages.append({"type": meta["type"], "text": ocr, "image": None})
        else:
            pages.append({"type": meta["type"], "text": None,
                          "image": _b64(meta["image_path"])})

    package = {"exam_context": exam_context, "pages": pages,
               "has_vision": any(p["image"] for p in pages)}
    _write_to_filesystem("context.json", json.dumps(package))
    return f"Package built: {len(pages)} pages, vision={package['has_vision']}"
```

### 7.4 tool_validate_score (Python thuần)

```python
@tool
def tool_validate_score(grading_result_path: str) -> dict:
    """
    Hard validation bằng Python. KHÔNG gọi AI.
    Clamp điểm, kiểm tra consistency, trả kết quả cuối cùng.
    """
    data = json.loads(_read_filesystem(grading_result_path))

    total = float(data.get("total_score", 0))
    total = round(min(10.0, max(0.0, total)), 2)

    questions = data.get("questions", [])
    if questions:
        q_sum = sum(float(q.get("score", 0)) for q in questions)
        if abs(q_sum - total) > 0.5:
            total = round(min(10.0, max(0.0, q_sum)), 2)

    for q in questions:
        max_s = float(q.get("max_score", 10.0))
        q["score"] = round(min(max_s, max(0.0, float(q.get("score", 0)))), 2)

    data["total_score"] = total
    data["validated"] = True
    return data
```

---

## 8. Filesystem layout (Deep Agents virtual FS)

Deep Agents dùng virtual filesystem để tránh overflow context window.
Mỗi phiên chấm có namespace riêng:

```
/sessions/{session_id}/
├── exam_context.txt      ← nội dung đề + rubric (có thể 50k+ chars)
├── pages_meta.json       ← metadata từng trang ảnh
├── context.json          ← input cho subagents (text + ảnh b64)
├── grading_result.json   ← output từ subagent
└── todos.md              ← plan của orchestrator (auto by deep agents)
```

Orchestrator không giữ full text trong memory —
chỉ pass **file path** cho subagents → không overflow context.

---

## 9. Flow hoàn chỉnh

```python
def run_grading_session(session_id: str, image_paths: list) -> dict:
    """Entry point duy nhất"""

    result = orchestrator.invoke({
        "messages": [{
            "role": "user",
            "content": f"""
            Chấm bài cho phiên: {session_id}
            Số ảnh bài làm: {len(image_paths)}
            Đường dẫn ảnh: {image_paths}

            Hãy thực hiện đầy đủ quy trình chấm và trả về điểm số JSON.
            """
        }],
        "files": {},
        "session_id": session_id,
        "image_paths": image_paths,
    })

    final = result["files"].get(f"sessions/{session_id}/grading_result.json")
    return json.loads(final) if final else {"error": "No result"}
```

---

## 10. Model assignment theo vai trò

| Agent / Tool | Model | Lý do | Chi phí/call |
|---|---|---|---|
| Orchestrator | gemini-2.5-flash | Routing + planning | ~$0.002 |
| skill_classify_pages | gemini-2.5-flash-lite | Thumbnail nhỏ, task đơn giản | ~$0.001 |
| skill_load_context (PDF) | gemini-2.5-flash | Native PDF, 1 call | ~$0.003 |
| cheap_ocr (text pages) | gemini-2.5-flash-lite | Text thuần | ~$0.001/trang |
| skill_grade_mcq | gemini-2.5-flash-lite | Nhận dạng A/B/C/D + edge cases | ~$0.002 |
| essay-grader subagent | gemini-2.5-flash | LLM giỏi ngôn ngữ | ~$0.008 |
| stem-grader subagent | gemini-2.5-flash (vision) | Đọc công thức từ ảnh | ~$0.015 |
| tool_validate_score | Python thuần | Không AI | $0 |

**Tổng ước tính / phiên chấm điển hình (3 trang hỗn hợp):**

```
Classify pages:    $0.001
Load context PDF:  $0.003
OCR 1 trang text:  $0.001
MCQ grading:       $0.002
Orchestrator:      $0.003
Subagent (essay):  $0.008
Validate:          $0.000
─────────────────────────
Tổng:             ~$0.018 / phiên
```

---

## 11. Checklist implementation

### Phase 1 — Xác nhận nền tảng (2–3 ngày) ⚠️ Critical
- [ ] `pip install deepagents langchain-google-genai`
- [ ] Tạo `GradingFileSystem` backend (Frappe-aware)
- [ ] Implement `tool_validate_score` (Python)
- [ ] Test Orchestrator đơn giản: load 1 file + validate
- [ ] **Kiểm tra virtual filesystem không conflict với Frappe session**
- [ ] Nếu có vấn đề → switch sang LangGraph prebuilt react agent

### Phase 2 — Skills (2–3 ngày)
- [ ] `skill_load_context`: docx 3-tier + PDF Gemini native
- [ ] `skill_classify_pages`: thumbnail batch + flash-lite (4 loại trang)
- [ ] `skill_build_package`: assemble context.json
- [ ] Test với file đề bài thực tế (có công thức, có hình)

### Phase 3 — Essay Subagent (2–3 ngày)
- [ ] Essay subagent: prompt + test với bài văn thực
- [ ] Tune prompt: reasoning trước → điểm sau
- [ ] Test edge case: bài làm rỗng, bài làm lạc đề

### Phase 4 — STEM Subagent (2–3 ngày)
- [ ] STEM subagent: prompt + test bài toán có công thức
- [ ] Verify: công thức đọc từ ảnh gốc, KHÔNG từ OCR
- [ ] Test partial credit: sai kết quả nhưng đúng phương pháp

### Phase 5 — MCQ (1–2 ngày)
- [ ] `skill_grade_mcq` với flash-lite
- [ ] Test: chữ rõ, chữ mờ, gạch xóa, khoanh sửa
- [ ] Test: khoanh 2 đáp án → AI chọn đáp án cuối cùng

### Phase 6 — Integration (2 ngày)
- [ ] Kết nối vào Frappe `AI Grading Session`
- [ ] Streaming kết quả về frontend
- [ ] Error handling + fallback khi subagent fail
- [ ] Log chi phí thực tế mỗi phiên

### Phase 7 — Optimization (ongoing)
- [ ] Đo chi phí thực tế vs ước tính
- [ ] Tune system prompts từng subagent
- [ ] Thêm Gemini Prompt Cache cho phiên nhiều bài cùng đề
- [ ] LangSmith tracing để debug

---

## 12. So sánh với v1

| Vấn đề v1 | Giải pháp v2 |
|---|---|
| Code Subagent phức tạp, rủi ro bảo mật | Bỏ hoàn toàn |
| MCQ dùng Python lookup, không xử lý chữ mờ | MCQ dùng flash-lite AI |
| 3 subagents | 2 subagents + 1 MCQ skill nhẹ |
| Aggregator bịa điểm | Bỏ aggregator, validate Python thuần |
| Context overflow state | Virtual filesystem offload |
| OCR chạy trước classify | Classify thumbnail → rồi mới quyết định OCR hay giữ ảnh |

---

## 13. Dependencies

```bash
pip install deepagents
pip install langchain-google-genai
pip install langchain-core langchain
pip install docxlatex        # OMML → LaTeX
pip install Pillow            # thumbnail resize
pip install langsmith         # optional monitoring
```

```python
# .env
GOOGLE_API_KEY=...
LANGCHAIN_API_KEY=...         # LangSmith (optional)
LANGCHAIN_TRACING_V2=true     # optional
```
