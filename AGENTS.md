# AGENTS.md — Antigravity Orchestration Guide
# Stack: Frappe Framework + MariaDB + Vue 3 (Composition API) + LangChain/LangGraph
# LMS App: Learning Management System with AI-powered Grading, Chatbot, and Socratic Tutor

---

## 1. Project Overview

**Frappe LMS** — Hệ thống quản lý học tập tích hợp AI, bao gồm:
- **Core LMS:** Courses, Lessons, Quizzes, Batches, Certificates, Enrollments
- **AI Grading:** Multi-agent pipeline chấm bài (MCQ, essay, STEM) với OCR + LLM
- **AI Chatbot:** Agentic RAG chatbot hỗ trợ học viên (LangGraph-based)
- **Socratic Tutor:** AI tutor dạy kèm theo phương pháp Socratic

---

## 2. Codebase Map

```
apps/lms/
├── lms/                          # Frappe app root
│   ├── hooks.py                  # App hooks, doc_events, scheduler_events
│   ├── lms/                      # Main LMS module
│   │   ├── api.py                # Whitelisted API endpoints (100K+ lines)
│   │   ├── utils.py              # Shared utilities (64K+ lines)
│   │   ├── agents/               # 🤖 AI Agent system (LangChain/LangGraph)
│   │   │   ├── orchestrator.py   # Multi-expert grading pipeline
│   │   │   ├── chatbot/          # LangGraph chatbot (graph, nodes, state)
│   │   │   ├── subagents/        # Specialist agents (visual, logic, MCQ, essay, reviewer)
│   │   │   ├── skills/           # Agent tools (course, document, grading, OCR, web)
│   │   │   ├── schemas.py        # Pydantic schemas for agent I/O
│   │   │   ├── model_router.py   # LLM provider routing
│   │   │   └── session_store.py  # Grading session state management
│   │   ├── services/             # Service layer
│   │   │   ├── base_service.py   # BaseService with CRUD + caching
│   │   │   ├── ai_grading/       # AI grading service, API, cost tracking
│   │   │   ├── chatbot/          # Chatbot API + session management
│   │   │   └── socratic/         # Socratic tutor service
│   │   └── doctype/              # 95+ DocTypes (schema definitions)
│   ├── doctype/                  # Additional DocTypes (lms_ai_settings)
│   └── plugins.py                # Lesson page extensions, markdown macros
├── frontend/                     # Vue 3 SPA (Vite + TailwindCSS)
│   └── src/
│       ├── pages/                # Route pages
│       │   ├── AI/               # AI feature pages
│       │   │   ├── AIGrading/    # 12 grading UI components
│       │   │   ├── Chatbot/      # 3 chatbot/tutor components
│       │   │   ├── AIIntegration.vue
│       │   │   └── StudentScoreDashboard.vue
│       │   ├── Courses/          # Course management pages
│       │   └── ...               # Batch, Quiz, Profile, etc.
│       ├── components/           # Reusable UI components
│       ├── stores/               # State management
│       ├── router.js             # Vue Router config
│       └── styles/               # CSS / design system
└── .agents/skills/               # 📘 Skill definitions cho AI coding agents
```

---

## 3. Skill Routing — Khi nào dùng Skill nào

### Bảng quyết định nhanh

| Yêu cầu / Ngữ cảnh | Skill chính | Skill phụ (luôn kèm theo) |
|---|---|---|
| Viết/sửa DocType controller, lifecycle hooks | **backend** | conventions, error-handling |
| Viết API endpoint `@frappe.whitelist()` | **backend** | security, error-handling |
| Thay đổi DocType JSON, thêm field | **database** | schema-sync |
| Viết raw SQL, query optimization | **database** | security (parameterized query) |
| Viết Vue component, page mới | **frontend** | conventions |
| Viết composable, Frappe client script | **frontend** | error-handling |
| Code AI agent, LangGraph graph, node | **AI** | error-handling |
| Viết RAG pipeline, chatbot, memory | **AI** | backend (cho Frappe integration) |
| Thêm Custom Field cho DocType gốc | **database** | schema-sync |
| Thêm field → cập nhật Python type + Vue type | **schema-sync** | — |
| Viết test Python (Frappe runner) | **testing** | — |
| Viết test Vue (Vitest) | **testing** | frontend |
| Tách hàm dài, extract composable | **refactor** | conventions |
| Fix SQL injection, permission check | **security** | backend |
| Viết docstring, README, ADR | **docs** | — |
| Mọi file, mọi lúc | **conventions** | — (luôn áp dụng ngầm) |

### Flowchart quyết định chi tiết

```
User yêu cầu → Xác định LAYER nào bị ảnh hưởng:

┌─ Python backend?
│   ├─ DocType controller (validate, on_submit...) → [backend] + [conventions] + [error-handling]
│   ├─ API endpoint (@frappe.whitelist) → [backend] + [security] + [error-handling]
│   ├─ Scheduled job / hook → [backend] + [error-handling]
│   ├─ AI agent code (agents/, services/ai_grading) → [AI] + [error-handling]
│   └─ Utility / helper → [backend] + [conventions]
│
├─ Frontend Vue?
│   ├─ Component / page mới → [frontend] + [conventions]
│   ├─ Frappe client script (.js trong doctype/) → [frontend]
│   ├─ Composable (useXxx) → [frontend] + [refactor]
│   └─ AI UI (AIGrading/, Chatbot/) → [frontend] + [AI]
│
├─ Database / Schema?
│   ├─ Thêm/sửa DocType field → [database] + [schema-sync]
│   ├─ Custom Field cho DocType gốc → [database] + [schema-sync]
│   ├─ Complex query / report → [database] + [security]
│   └─ Index / performance → [database]
│
├─ Code quality?
│   ├─ Hàm quá dài (> 30 dòng) → [refactor]
│   ├─ Logic lặp > 2 lần → [refactor]
│   ├─ Component > 200 dòng → [refactor] + [frontend]
│   └─ Code review / audit → [security] + [refactor]
│
└─ Documentation?
    ├─ Docstring, API docs → [docs]
    ├─ README, ADR → [docs]
    └─ Type sync check → [schema-sync]
```

---

## 4. Quy tắc tuyệt đối (Skill: conventions — luôn áp dụng)

> Đọc chi tiết: `.agents/skills/conventions/SKILL.md`

### Python / Frappe
- **SQL injection:** Không dùng `frappe.db.sql()` với f-string — luôn dùng `%(key)s` parameterized
- **Infinite loop:** Không gọi `doc.save()` trong `validate()`
- **Hardcode:** Không hardcode company, currency — lấy từ `frappe.defaults`
- **Permission:** Mọi `@frappe.whitelist()` phải check permission trước khi trả data
- **i18n:** String hiển thị → wrap bằng `frappe._("...")`
- **Schema:** Không ALTER TABLE thủ công — dùng DocType JSON + `bench migrate`

### Vue / TypeScript
- Luôn dùng `<script setup>` (Composition API)
- Props/emits phải có type explicit
- Không `document.getElementById` trong Frappe context
- Không `console.log` trong production

### Naming
| Layer | Convention | Ví dụ codebase |
|---|---|---|
| Python function | `snake_case` | `run_grading_session()`, `skill_load_context()` |
| Python class | `PascalCase` | `GradingSession`, `BaseService` |
| DocType | `PascalCase` (space-separated) | `AI Grading Session`, `LMS Course` |
| Vue component | `PascalCase.vue` | `AIGradingEssayWorkspace.vue` |
| CSS class | `kebab-case` | `grading-workspace-card` |

### File size limits
- Function: ≤ 30 dòng → tách private methods
- Class: ≤ 200 dòng → tách base class/mixin
- Vue `<script setup>`: ≤ 150 dòng → tách composable
- Vue `<template>`: ≤ 100 dòng → tách sub-component
- Tổng file: ≤ 400 dòng

---

## 5. Codebase-specific Patterns (Bổ sung vào Skills)

### 5.1 AI Agent Layer — `lms/lms/agents/`

> Đọc chi tiết: `.agents/skills/AI/SKILL.md`

**Kiến trúc đang dùng:**
```
agents/
├── orchestrator.py        # Sequential pipeline: Context → Classify → Grade → Review
├── chatbot/
│   ├── graph.py           # LangGraph StateGraph cho chatbot
│   ├── state.py           # ChatState TypedDict
│   └── nodes/             # Graph nodes (agent, tools, etc.)
├── subagents/             # Specialist agents (stateless functions)
│   ├── visual_specialist.py
│   ├── logic_specialist.py
│   ├── mcq_grader.py
│   ├── essay_grader.py
│   ├── stem_grader.py
│   ├── reviewer_specialist.py
│   ├── aggregator.py
│   └── shared_context.py
├── skills/                # LangChain tools (@tool decorated)
│   ├── document_skills.py # OCR, page classify, answer key extract
│   ├── course_skills.py   # Get course/lesson content
│   ├── grading_skills.py  # Grading utilities
│   └── web_skills.py      # Web search
├── model_router.py        # Route to OpenAI/Gemini/OpenRouter
├── schemas.py             # Pydantic schemas (GradingResult, etc.)
└── session_store.py       # GradingSession state object
```

**Quy tắc riêng cho AI layer:**
- `model_router.py` quản lý LLM provider — không hardcode API key, dùng `frappe.conf` hoặc `LMS AI Settings` DocType
- Subagents là stateless functions nhận context dict, trả result dict
- `orchestrator.py` quản lý flow: Context Init → Page Classify → Expert Analysis → Aggregation → Review (loop max 2 lần)
- Session state lưu qua `GradingSession` object, persist to disk
- Chatbot dùng LangGraph `StateGraph` — state nhỏ, typed, reducer rõ ràng

### 5.2 Service Layer — `lms/lms/services/`

> Đọc chi tiết: `.agents/skills/backend/SKILL.md`

**Pattern chuẩn:**
```python
# Kế thừa BaseService cho CRUD + caching
from lms.lms.services.base_service import BaseService, cache_result, handle_service_errors

class AIGradingService(BaseService):
    def __init__(self):
        super().__init__("AI Grading Session")

    @cache_result(ttl=600)
    def get_rubric(self, rubric_id):
        ...

    @handle_service_errors(default_return=[], log_error=True)
    def get_submissions(self, session_id):
        ...
```

**Services hiện có:**
| Service | Module | Chức năng |
|---|---|---|
| `ai_grading/` | AI Grading | Session management, API, cost tracking, provider adapter |
| `chatbot/` | Chatbot | API endpoints, session management |
| `socratic/` | Socratic Tutor | Tutor service logic |
| `base_service.py` | Common | BaseService CRUD, `@cache_result`, `@handle_service_errors` |

### 5.3 API Layer — `lms/lms/api.py`

> Đọc chi tiết: `.agents/skills/backend/SKILL.md` + `.agents/skills/security/SKILL.md`

**Lưu ý đặc biệt:**
- File `api.py` đã **rất lớn** (100K+ bytes) — khi thêm endpoint mới, ưu tiên đặt trong `services/<module>/api.py` thay vì thêm vào file chính
- Mọi endpoint `@frappe.whitelist()` phải kiểm tra permission
- AI-related endpoints nên đặt trong `services/ai_grading/ai_grading_api.py` hoặc `services/chatbot/api.py`

### 5.4 DocType Map — Các DocType quan trọng

> Đọc chi tiết: `.agents/skills/database/SKILL.md`

**Core LMS:**
| DocType | Dùng cho |
|---|---|
| `LMS Course` | Khóa học |
| `Course Chapter` | Chương trong khóa học |
| `Course Lesson` | Bài học |
| `LMS Quiz` / `LMS Question` | Quiz + câu hỏi |
| `LMS Batch` / `LMS Enrollment` | Lớp học + đăng ký |
| `LMS Certificate` | Chứng chỉ |

**AI Grading:**
| DocType | Dùng cho |
|---|---|
| `AI Grading Session` | Phiên chấm bài |
| `AI Grading Submission` | Bài nộp của học viên |
| `AI Grading Rubric` / `AI Grading Criterion` | Rubric chấm điểm |
| `AI Grading Log` | Log quá trình chấm |
| `AI Grading Cost Track` | Theo dõi chi phí LLM |
| `AI Grading Member` | Thành viên trong phiên chấm |

**Chatbot:**
| DocType | Dùng cho |
|---|---|
| `Chatbot Session` / `Chatbot Message` | Phiên chat + tin nhắn |
| `Chatbot Config` | Cấu hình chatbot |
| `Socratic Session` / `Socratic Message` | Phiên Socratic Tutor |

**Settings:**
| DocType | Dùng cho |
|---|---|
| `LMS Settings` | Cấu hình chung LMS |
| `LMS AI Settings` | Cấu hình AI (API keys, models) |

### 5.5 Frontend Architecture — `frontend/src/`

> Đọc chi tiết: `.agents/skills/frontend/SKILL.md`

**Stack:** Vue 3 (Composition API) + Vite + TailwindCSS + frappe-ui

**Route structure:** `frontend/src/router.js` — hash-based SPA routing

**AI Pages:**
| File | Route | Chức năng |
|---|---|---|
| `pages/AI/AIGrading.vue` | `/ai-grading` | Entry point AI Grading |
| `pages/AI/AIGrading/AIGradingEssayWorkspace.vue` | — | Workspace chấm essay |
| `pages/AI/AIGrading/MCQGradingWorkspace.vue` | — | Workspace chấm MCQ |
| `pages/AI/AIGrading/RubricBuilder.vue` | — | Tạo rubric chấm điểm |
| `pages/AI/Chatbot/StudentAIHelper.vue` | — | AI Helper cho học viên |
| `pages/AI/Chatbot/SocraticTutorWorkspace.vue` | — | Socratic Tutor UI |
| `pages/AI/StudentScoreDashboard.vue` | — | Dashboard điểm số |
| `pages/AI/AIIntegration.vue` | — | Trang cấu hình AI |

---

## 6. Error Handling Pattern (Codebase-specific)

> Đọc chi tiết: `.agents/skills/error-handling/SKILL.md`

### Python Backend
```python
# API endpoint — pattern chuẩn trong codebase
@frappe.whitelist()
def grade_submission(session_id: str, submission_id: str) -> dict:
    # 1. Validate input
    if not session_id:
        frappe.throw(_("Session ID is required"), frappe.ValidationError)

    # 2. Check permission
    frappe.has_permission("AI Grading Session", doc=session_id, throw=True)

    # 3. Business logic with error handling
    try:
        result = _process_grading(session_id, submission_id)
        return {"status": "success", "data": result}
    except frappe.ValidationError:
        raise  # Re-raise Frappe errors
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), f"Grading Failed: {session_id}")
        frappe.throw(_("An error occurred during grading. Please try again."))
```

### AI Agent — dùng try/except trong mọi node
```python
# Subagent pattern — từ orchestrator.py
try:
    session.visual_reports = run_visual_analysis(context, image_paths, page_types)
    session.log_step("Visual Analysis", "Success", elapsed)
except Exception as e:
    logger.error(f"Visual analysis failed: {e}", exc_info=True)
    session.log_step("Visual Analysis", "Failed", elapsed)
    # Graceful degradation — continue pipeline
```

---

## 7. Security Checklist (Codebase-specific)

> Đọc chi tiết: `.agents/skills/security/SKILL.md`

- [ ] API key (OpenAI, Gemini) lấy từ `LMS AI Settings` DocType hoặc `frappe.conf`, KHÔNG hardcode
- [ ] Mọi `@frappe.whitelist()` endpoint kiểm tra `frappe.has_permission()`
- [ ] SQL query dùng `%(key)s` parameterized — KHÔNG f-string
- [ ] File upload: validate MIME type, dùng `is_private=1`
- [ ] `allow_guest=True` chỉ cho endpoint thực sự public
- [ ] Không log API keys, student PII vào Error Log

---

## 8. Testing Pattern

> Đọc chi tiết: `.agents/skills/testing/SKILL.md`

**Backend:**
```bash
# Chạy test toàn bộ app
bench --site lms.localhost run-tests --app lms

# Chạy test module cụ thể
bench --site lms.localhost run-tests --module lms.lms.services.ai_grading.test_graph
```

**Test files hiện có:**
- `lms/lms/test_api.py` — API endpoint tests
- `lms/lms/test_utils.py` — Utility tests
- `lms/lms/test_helpers.py` — Helper function tests
- `lms/lms/services/ai_grading/test_graph.py` — AI grading pipeline tests
- `lms/lms/services/ai_grading/test_mcq_agent.py` — MCQ agent tests
- `scripts/agent_test_lab/` — Integration test scripts

---

## 9. Schema Sync Workflow

> Đọc chi tiết: `.agents/skills/schema-sync/SKILL.md`

Khi thêm/sửa field trên DocType:
1. Sửa DocType JSON (hoặc Customize Form)
2. `bench --site lms.localhost migrate`
3. Cập nhật `schemas.py` (Pydantic models trong `agents/`)
4. Cập nhật Vue TypeScript interfaces nếu có
5. Cập nhật test data
6. `bench --site lms.localhost export-fixtures` (nếu Custom Field)

---

## 10. Refactor Signals

> Đọc chi tiết: `.agents/skills/refactor/SKILL.md`

**Các file lớn cần chú ý (potential refactor targets):**
| File | Size | Ghi chú |
|---|---|---|
| `lms/lms/api.py` | ~100KB | Cần tách thành modules theo domain |
| `lms/lms/utils.py` | ~65KB | Cần tách helpers theo concern |
| `frontend/src/pages/AI/AIGrading/MCQGradingWorkspace.vue` | ~37KB | Cần tách composable |
| `frontend/src/pages/AI/AIGrading/AIGradingEssayConfig.vue` | ~35KB | Cần tách composable |
| `frontend/src/pages/GameCenter.vue` | ~28KB | Cần tách sub-components |
| `frontend/src/pages/Lesson.vue` | ~27KB | Cần tách sub-components |

**Refactor rules:**
- DB call lặp trong loop → batch thành 1 query
- Magic string → constant
- Hàm > 30 dòng → tách private methods
- Component > 200 dòng → tách composable

---

## 11. Docs & Documentation

> Đọc chi tiết: `.agents/skills/docs/SKILL.md`

- Python: Google-style docstring cho public functions
- Vue: JSDoc comment cho component props/emits
- API: Docstring ghi rõ endpoint path, args, returns, permission
- Không cần docstring cho: private helper < 5 dòng, Frappe lifecycle hooks chuẩn

---

## 12. Git Commit Format

```
<type>(<scope>): <short description>

type  : feat | fix | refactor | test | docs | chore | hotfix
scope : ai-grading | chatbot | socratic | course | batch | quiz | frontend | api

# Ví dụ:
feat(ai-grading): add MCQ answer key verification step
fix(chatbot): resolve memory leak in LangGraph session store
refactor(api): extract grading endpoints to services/ai_grading/api
test(ai-grading): add edge case test for empty submission
docs(agents): update AGENTS.md with codebase map
```

---

## 13. Skill Files Reference

| Skill | File | Khi nào đọc |
|---|---|---|
| **AI** | `.agents/skills/AI/SKILL.md` | LangChain, LangGraph, RAG, chatbot, memory |
| **backend** | `.agents/skills/backend/SKILL.md` | DocType controller, API, hooks, scheduler |
| **conventions** | `.agents/skills/conventions/SKILL.md` | Naming, file structure, import order — **luôn áp dụng** |
| **database** | `.agents/skills/database/SKILL.md` | Query, index, migration, Custom Field |
| **docs** | `.agents/skills/docs/SKILL.md` | Docstring, README, ADR, API docs |
| **error-handling** | `.agents/skills/error-handling/SKILL.md` | try/except, frappe.throw, batch savepoint |
| **frontend** | `.agents/skills/frontend/SKILL.md` | Vue component, composable, Frappe client script |
| **refactor** | `.agents/skills/refactor/SKILL.md` | Code smell, extract method, tách composable |
| **schema-sync** | `.agents/skills/schema-sync/SKILL.md` | DocType ↔ Python ↔ Vue type sync |
| **security** | `.agents/skills/security/SKILL.md` | Permission, SQL injection, XSS, CSRF, secrets |
| **testing** | `.agents/skills/testing/SKILL.md` | pytest (Frappe), Vitest (Vue), mock patterns |
| **wsl-env** | `.agents/skills/wsl-env/SKILL.md` | Hướng dẫn chỉnh sửa trực tiếp môi trường WSL không qua copy |

---

## 14. AI System Stability & Scaling Guidelines
Để tránh lỗi cạn kiệt RAM và nghẽn Worker trên kiến trúc Monolithic khi scale hệ thống LMS, áp dụng các thiết kế phân luồng sau:

### 14.1. Nhóm "Phản hồi tức thì" (Chatbot, Socratic AI)
- **Yêu cầu:** Token streaming mượt mà, phản hồi ngay lập tức để giữ mạch học cho User.
- **Thiết kế:**
  - Dùng Stream API (Server-Sent Events / Socket.io qua `frappe.publish_realtime`) để đẩy token từng bước.
  - Sử dụng Redis làm đệm lưu tạm lịch sử chat (tránh Write IO lên MariaDB liên tục), chỉ tổng hợp / persist vào database khi kết thúc phiên.
  - Rate Limit: Bắt buộc giới hạn request (vd. 5 câu/phút/user) trên Redis.

### 14.2. Nhóm "Xử lý nặng & Đợi lâu" (Tạo Quiz, Rubric, Chấm điểm)
- **Yêu cầu:** Agent (LangGraph/Pipeline) suy nghĩ và phân tích phức tạp, mất từ 30s - 2 phút.
- **Thiết kế:**
  - Tuyệt đối TRÁNH block web worker. Mọi `langgraph.invoke()` nặng phải bọc bởi `frappe.enqueue`.
  - Queue `long` cho AI pipeline. Queue `default` hoặc `short` cho các web process. Trả về Toast Notification báo đã nhận yêu cầu.
  - Sử dụng `frappe.publish_realtime` push message về client khi task background chạy xong. 

### 14.3. Nhóm "RAG & Xử lý tài liệu" (Upload, Chunking, Embedding)
- **Yêu cầu:** OCR, đọc PDF, tạo vector cực kỳ tốn RAM/CPU.
- **Thiết kế:**
  - Offload tính toán Vector: Dùng External Vector DB chuyên dụng (Pinecone/Milvus bản free), tuyệt đối không lưu raw vector vào MariaDB.
  - Tách quá trình Embedding ra Background Task riêng hoàn toàn: User upload -> Lưu Frappe File -> Đẩy vào Background Queue (`frappe.enqueue(queue="long")`) -> Worker gọi Cohere / OpenAI tạo Embedding đẩy lên Pinecone -> Cập nhật trạng thái file "Đã sẵn sàng".
  - Tối ưu tra cứu RAG: Ưu tiên Hybrid Search (Keyword tìm chính xác + Vector) thay vì để LLM tự quét full docs tiết kiệm tokens.
  - Gọi External AI API (OpenAI, Gemini, Anthropic) thay vì self-host model trên Server.

### 14.4. Set up Dedicated Workers
- Chia CPU core cho từng queue: Ví dụ 4 vCPU -> 1 core cho default (web API), 2 cores cho `long` (Xử lý batch & AI Grading task), 1 core cho `short` (Socket/Game). Có setup rõ ràng trong `common_site_config.json` hay `supervisor.conf`.

