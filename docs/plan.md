# 📘 Development Plan for LMS Modernization

> **Goal:** Transform the LMS application into a modern, secure, and maintainable platform with a sleek Vue.js front‑end, clean back‑end APIs, fine‑grained permission handling, and an intuitive admin UI.
> **Target date:** Q3 2026 (≈ 6 months)

---

## 🎯 High‑Level Objectives
| # | Objective | Success Metric |
|---|-----------|----------------|
| 1 | **Front‑end revamp** – Vue 3 + Vite, component library, responsive design | > 90 % of UI components migrated, visual regression < 5 % |
| 2 | **Back‑end API redesign** – modular, versioned, typed, RBAC‑driven | API coverage ≥ 95 %, < 2 % security findings after audit |
| 3 | **Admin UI overhaul** – drag‑and‑drop page builder, live schema editor | Admin tasks (create/edit DocTypes, permissions) ≤ 3 clicks |
| 4 | **Security hardening** – input sanitization, rate‑limiting, CSP, audit logs | OWASP Top 10 compliance, zero critical findings |
| 5 | **Code quality & CI/CD** – linting, type‑checking, unit/integration tests, automated releases | Test coverage ≥ 80 %, CI pipeline green on every PR |

---

## 🗂️ Phase Breakdown

### Phase 1 – Foundations (4 weeks)
1. **Project scaffolding**
   - Initialise a **Vite‑Vue 3** workspace under `frontend/`.
   - Add **Tailwind CSS** (optional dark mode) and **Vuetify 3** for UI components.
   - Set up **ESLint**, **Prettier**, **Stylelint**, **TypeScript**.
2. **Back‑end groundwork**
   - Introduce **API versioning** (`/api/v1/…`).
   - Create a **service layer** (`lms/lms/services/`) to decouple business logic from `api.py`.
   - Add **Pydantic** models for request/response validation.
3. **CI/CD pipeline**
   - GitHub Actions: lint → type‑check → unit tests → build front‑end.
   - Deploy a **staging site** on a Docker compose environment.

### Phase 2 – Front‑end Migration (6 weeks)
| Sprint | Tasks |
|--------|-------|
| 1 | Implement **authentication flow** (login, signup, password reset) using **Vue‑Router** and **Pinia** store. Integrate with existing `/api/method/lms.lms.api.login` (to be refactored). |
| 2 | Build **layout components** – Header, Sidebar, Footer, Dark/Light theme toggle. Use **CSS variables** for brand colours. |
| 3 | Migrate **Dashboard** (courses, progress, notifications) to Vue pages. Re‑use existing API endpoints after they are versioned. |
| 4 | Port **Course/Chapter/Lesson** editors – rich‑text editor (TipTap), media upload, SCORM viewer component. |
| 5 | Implement **AI Grading UI** – session list, submission review, feedback modal. |
| 6 | Polish **responsive design**, add micro‑animations (Framer Motion), accessibility audit (ARIA). |

### Phase 3 – Back‑end Refactor (8 weeks)
1. **Modular API package** (`lms/lms/api/`)
   - `course_api.py`, `batch_api.py`, `assessment_api.py`, `admin_api.py`, `auth_api.py`, `ai_grading_api.py`, `settings_api.py`.
   - Each file exports only its whitelist functions.
2. **Permission layer**
   - Central `lms/lms/permissions.py` with helper `has_permission(user, doctype, action)`.
   - Replace ad‑hoc `frappe.only_for` checks with this unified function.
3. **Input validation**
   - Use **Pydantic** schemas for every endpoint (auto‑generated OpenAPI spec).
   - Sanitize LIKE queries, escape `%`/`_` characters.
4. **Rate limiting**
   - Decorator `@rate_limit(key=user.name, limit=30/minute)` using Redis.
5. **Audit logging**
   - New DocType `API Audit Log` capturing user, endpoint, payload hash, response status, latency.
6. **Background jobs**
   - Move heavy tasks (AI grading, PDF/SCORM processing) to **Redis‑RQ** workers.
7. **Testing**
   - Unit tests for service layer (`tests/unit/`), integration tests for API (`tests/integration/`).
   - Mock external AI providers.

### Phase 4 – Admin UI Revamp (5 weeks)
| Sprint | Tasks |
|--------|-------|
| 1 | Build **Admin Dashboard** in Vue – navigation tree of DocTypes, quick‑create buttons. |
| 2 | Implement **Schema Editor** – fetch DocType JSON, allow inline field add/remove, save via new `/api/v1/admin/doctypes` endpoint. |
| 3 | Permission matrix UI – role‑based checkboxes, bulk assign, real‑time validation. |
| 4 | Add **Live Preview** for site settings (branding, email templates). |
| 5 | Integrate **audit log viewer** with filters (user, endpoint, date). |

### Phase 5 – Security & Performance Hardenings (4 weeks)
1. **Content Security Policy** – set strict CSP headers via Nginx.
2. **CSRF & XSS** – ensure all forms include CSRF token, escape user‑generated HTML in Vue (use `v-html` only after sanitisation).
3. **Database optimisation**
   - Add indexes identified in `system_design.md` (enrollment, progress, AI submission).
   - Enable **connection pooling** (`db_pool_size=20`).
4. **Load testing** – run Locust scripts simulating 200 concurrent users, tune Gunicorn workers and Redis.
5. **Pen‑test** – external security audit, remediate findings.

### Phase 6 – Release & Monitoring (3 weeks)
- Tag **v2.0** (major UI/API version).
- Deploy to production behind **HAProxy** with blue‑green rollout.
- Set up **Prometheus + Grafana** dashboards for API latency, error rates, AI cost tracking.
- Create **runbooks** for rollback and incident response.

---

## 🛠️ Technical Stack Summary
| Layer | Technology |
|-------|------------|
| Front‑end | Vue 3, Vite, TypeScript, Pinia, Vue‑Router, Tailwind CSS, Vuetify 3, Axios |
| Back‑end | Frappe Framework (Python 3.11), Pydantic, Redis‑RQ, PostgreSQL (or MariaDB), OpenAPI/Swagger |
| Auth | JWT (short‑lived) + Frappe session cookies |
| CI/CD | GitHub Actions, Docker, Docker‑Compose, Semantic Release |
| Monitoring | Prometheus, Grafana, Loki (logs), Alertmanager |
| Testing | PyTest, Faker, Cypress (E2E), Vitest (unit Vue) |

---

## 📅 Timeline Overview
| Month | Deliverable |
|-------|-------------|
| **May** | Project scaffolding, CI/CD, API versioning, initial Vue app, auth flow prototype |
| **June** | Dashboard & course UI migration, modular API package, permission layer |
| **July** | Admin UI, background workers, rate‑limiting, audit log |
| **August** | Security hardening, performance tuning, load testing |
| **September** | Final QA, blue‑green release, monitoring dashboards |

---

## 📌 Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| **Scope creep** – UI features expanding beyond MVP | Delay | Strict sprint goals, backlog grooming, feature flags |
| **Breaking existing integrations** | Users lose access | Version APIs (`/v1/`), keep backward‑compatible endpoints for 2 months |
| **Performance regression** after refactor | Slow UI | Automated performance tests, incremental roll‑out |
| **Security regressions** | Data breach | Continuous security scanning, OWASP ZAP in CI |
| **Team skill gap (Vue)** | Slower dev | Pair‑programming, internal workshops, external Vue trainer |

---

## 📂 Repository Layout (post‑upgrade)
```
lms/
├── frontend/                # Vue 3 app (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── router/
│   └── vite.config.ts
├── lms/
│   ├── api/                # Modular API files
│   ├── services/           # Business logic layer
│   ├── permissions.py      # Central RBAC helpers
│   ├── doctype/            # Existing DocTypes + new admin ones
│   ├── hooks.py            # Updated for new API versioning
│   └── ...
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
│   ├── plan.md            # **THIS FILE**
│   ├── backend.md
│   └── ...
└── .github/workflows/    # CI pipelines
```

---

## ✅ Next Steps
1. **Create `plan.md`** (this file) – ✅ done.
2. **Open a feature branch** `feature/ui‑modernisation`.
3. **Kick‑off sprint 0** – set up Vite/Vue repo, CI pipelines.
4. **Assign owners** for front‑end, back‑end, security, QA.
5. **Schedule sprint planning** with the team (next Monday).

---

*Prepared by Antigravity – your AI‑assisted development partner.*
