# 🚀 Need To Develop - Kế Hoạch Phát Triển Hệ Thống LMS

> **Nghiên cứu và đề xuất** các hạng mục cần phát triển, cải tiến dựa trên best practices từ industry leaders.
> Cập nhật: 2026-04-04

---

## 📋 Tổng Quan Hiện Trạng

### Điểm Mạnh Hiện Tại
- ✅ Kiến trúc Frappe Framework ổn định, modular
- ✅ RBAC (Role-Based Access Control) 4 roles cơ bản
- ✅ SCORM package support
- ✅ Payment gateway integration (Stripe/Razorpay)
- ✅ Full-text search (SQLite FTS5)
- ✅ AI Grading module cơ bản (session/submission)
- ✅ Live class integration (Zoom)
- ✅ Certificate system
- ✅ Notification system
- ✅ Multi-language support

### Điểm Yếu Cần Cải Tiến
- ❌ `api.py` quá lớn (~2800 dòng) - cần phân tách
- ❌ `utils.py` quá lớn (~2300 dòng) - cần refactor
- ❌ Thiếu input validation chặt chẽ (SQL injection potential)
- ❌ Thiếu rate limiting trên nhiều API endpoints
- ❌ AI Grading chưa có actual AI inference logic
- ❌ Không có API versioning
- ❌ Thiếu comprehensive unit tests
- ❌ Chưa có caching strategy rõ ràng
- ❌ Thiếu audit logging
- ❌ Chưa tối ưu cho concurrent users

---

## 🔴 PRIORITY 1: Cần Làm Ngay (Critical)

### 1.1 Refactor Monolithic API File
**Vấn đề**: `api.py` 2800 dòng, `utils.py` 2300 dòng - khó maintain, khó test.

**Giải pháp** (theo Martin Fowler - Refactoring patterns):
```
lms/lms/api/
├── __init__.py          ← Re-export tất cả whitelist functions
├── course_api.py        ← Course CRUD, lessons, chapters (~500 dòng)
├── batch_api.py         ← Batch management (~300 dòng)
├── assessment_api.py    ← Quiz, assignment, exercise (~400 dòng)
├── certification_api.py ← Certificate, evaluation (~300 dòng)
├── user_api.py          ← User info, profile, members (~300 dòng)
├── payment_api.py       ← Billing, payment links (~200 dòng)
├── notification_api.py  ← Notifications (~100 dòng)
├── statistics_api.py    ← Charts, heatmap, streak (~300 dòng)
├── ai_grading_api.py    ← AI grading operations (~400 dòng)
└── settings_api.py      ← LMS settings, sidebar (~200 dòng)
```

### 1.2 Security Hardening
**Vấn đề**: Nhiều endpoint thiếu proper validation.

**Cần làm:**
- [ ] Thêm `@rate_limit` cho tất cả write endpoints
- [ ] Validate tất cả string inputs chống XSS/injection
- [ ] Thêm CSRF protection cho non-Frappe endpoints
- [ ] Review `allow_guest=True` endpoints - giảm thiểu exposure
- [ ] Encrypt sensitive data (API keys đã dùng Password field ✅)
- [ ] Thêm IP-based rate limiting cho login/signup

### 1.3 Input Sanitization
**Vấn đề cụ thể trong code hiện tại:**
```python
# api.py line 2214 - SQL injection risk via search parameter
filters["session_name"] = ["like", f"%{search}%"]

# api.py line 573 - SQL injection risk via search
or_filters["full_name"] = ["like", f"%{search}%"]
```

**Giải pháp:**
- Sử dụng `frappe.db.escape()` cho tất cả user inputs
- Implement input validation middleware
- Whitelist allowed characters per field type

---

## 🟡 PRIORITY 2: Cần Phát Triển (Important)

### 2.1 API Versioning
```python
# Hiện tại: /api/method/lms.lms.api.get_courses
# Đề xuất: /api/v1/lms/courses, /api/v2/lms/courses
```

### 2.2 Comprehensive Caching Strategy
**Reference**: Redis caching theo Frappe best practices

```python
# Cần implement:
@frappe.whitelist(allow_guest=True)
def get_courses(filters=None, start=0):
    cache_key = f"lms_courses:{json.dumps(filters)}:{start}"
    cached = frappe.cache().get_value(cache_key)
    if cached:
        return cached
    # ... fetch logic ...
    frappe.cache().set_value(cache_key, result, expires_in_sec=300)
    return result
```

**Cache invalidation strategy:**
- Course create/update/delete → clear course cache
- Enrollment → clear user-specific caches
- Settings change → clear all LMS caches

### 2.3 Background Job Queue Optimization
**Hiện tại**: Chỉ dùng scheduler events cơ bản.

**Cần phát triển:**
- [ ] Dedicated queue cho AI grading (heavy computation)
- [ ] Priority queue cho certificate generation
- [ ] Retry mechanism với exponential backoff
- [ ] Dead letter queue cho failed jobs
- [ ] Job monitoring dashboard

### 2.4 Database Optimization
**Cần làm:**
- [ ] Thêm database indexes cho frequently queried fields:
  - `LMS Enrollment(member, course)` - composite index
  - `LMS Course Progress(member, course, status)` - composite index
  - `AI Grading Submission(session, student)` - composite index
  - `LMS Course(published, upcoming)` - composite index
- [ ] Implement pagination cho tất cả list queries
- [ ] Optimize N+1 queries trong `get_courses()`, `get_members()`
- [ ] Connection pooling configuration

### 2.5 Audit & Logging System
**Reference**: OWASP Logging Best Practices

```python
# Cần implement:
class AuditLog:
    """Ghi lại mọi thay đổi dữ liệu nhạy cảm"""
    fields = [
        "user", "action", "doctype", "docname",
        "old_data", "new_data", "ip_address",
        "user_agent", "timestamp"
    ]
```

---

## 🟢 PRIORITY 3: Nên Phát Triển (Enhancement)

### 3.1 Analytics & Reporting Module
- [ ] Learning Analytics Dashboard (xLRS/xAPI compatible)
- [ ] Student progress heatmaps
- [ ] Course completion funnel
- [ ] Revenue analytics
- [ ] AI Grading effectiveness metrics
- [ ] Export to CSV/Excel/PDF

### 3.2 Advanced Notification System
- [ ] Push notifications (Web Push API)
- [ ] SMS notifications (Twilio/SNS)
- [ ] In-app real-time notifications (WebSocket)
- [ ] Email digest (daily/weekly summary)
- [ ] Notification preferences per user

### 3.3 Content Management Improvements
- [ ] Versioning cho course content
- [ ] Draft/Review/Published workflow
- [ ] Content templates marketplace
- [ ] Bulk import/export courses
- [ ] Multi-media CDN integration
- [ ] Collaborative editing (OT/CRDT)

### 3.4 Gamification Module
- [ ] Points system (beyond badges)
- [ ] Leaderboards
- [ ] Achievement milestones
- [ ] Learning paths với prerequisites
- [ ] Daily challenges
- [ ] Social sharing achievements

### 3.5 Mobile-First API
- [ ] GraphQL endpoint cho mobile apps
- [ ] Offline sync support
- [ ] Progressive loading / infinite scroll
- [ ] Image optimization pipeline
- [ ] Response compression (gzip/brotli)

### 3.6 Integration Ecosystem
- [ ] LTI 1.3 (Learning Tools Interoperability) support
- [ ] xAPI / SCORM 2004 compliance
- [ ] SSO (SAML 2.0 / OAuth 2.0) improvements
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Video conferencing (Teams, Meet) beyond Zoom
- [ ] Plagiarism detection integration
- [ ] CRM integration for B2B sales

### 3.7 Multi-Tenant Architecture
- [ ] Organization-level isolation
- [ ] White-label support
- [ ] Custom domain per organization
- [ ] Per-tenant configuration overrides
- [ ] Data isolation và backup per tenant

---

## 🔧 Technical Debt Items

### Code Quality
| Item | Current State | Target |
|------|--------------|--------|
| Test coverage | ~5% (3 test files) | >70% |
| API documentation | None | OpenAPI/Swagger spec |
| Type hints | Partial | Full typing |
| Code linting | .flake8 exists | CI enforcement |
| Error handling | Generic try/except | Specific exception classes |
| Logging | Minimal | Structured logging (JSON) |

### Architecture Debt
| Item | Issue | Solution |
|------|-------|----------|
| Monolithic API | Single 2800-line file | Modular API package |
| Tight coupling | Utils imported everywhere | Service layer pattern |
| No DTO pattern | Raw dict returns | Typed response models |
| Sync-only processing | AI grading blocks request | Async task queue |
| No circuit breaker | External API failures cascade | Circuit breaker pattern |

---

## 📅 Đề Xuất Roadmap

### Phase 1: Foundation (1-2 tháng)
1. Refactor api.py → modular API package
2. Security audit & hardening
3. Database index optimization
4. Unit test coverage → 40%

### Phase 2: Scale (2-3 tháng)
5. Caching strategy implementation
6. Background job queue refactor
7. AI Grading module completion (see AI_module.md)
8. Analytics dashboard MVP

### Phase 3: Growth (3-6 tháng)
9. Mobile API (GraphQL)
10. LTI 1.3 integration
11. Advanced gamification
12. Multi-tenant support

### Phase 4: Enterprise (6-12 tháng)
13. White-label & custom domains
14. Marketplace for courses/templates
15. AI-powered content recommendations
16. Dataset monetization pipeline

---

## 📚 Tài Liệu Tham Khảo

1. **Martin Fowler** - Refactoring: Improving the Design of Existing Code
2. **OWASP** - Web Application Security Testing Guide
3. **Frappe Documentation** - [frappeframework.com/docs](https://frappeframework.com/docs)
4. **12-Factor App** - [12factor.net](https://12factor.net)
5. **Clean Architecture** - Robert C. Martin (Uncle Bob)
6. **Designing Data-Intensive Applications** - Martin Kleppmann
7. **System Design Interview** - Alex Xu
