# 📦 LMS Backend - Tài Liệu Chi Tiết Codebase

> **Tài liệu nghiên cứu toàn bộ backend** của Frappe LMS Application.
> Phiên bản: 2026-04-04 | Framework: Frappe v15+

---

## 📁 Cây Thư Mục Tổng Quan (Backend Only)

```
lms/                              ← Root Python package
├── __init__.py                   ← Khai báo version app
├── hooks.py                      ← ⭐ CẤU HÌNH TRUNG TÂM - định nghĩa toàn bộ hooks
├── install.py                    ← Logic cài đặt/gỡ cài đặt app
├── auth.py                       ← Middleware xác thực API endpoint
├── plugins.py                    ← Plugin system (render quiz, video, assignment...)
├── page_renderers.py             ← Custom page renderer (SCORM)
├── sqlite.py                     ← Full-text search engine (SQLite FTS5)
├── activation.py                 ← Thông tin site activation
├── command_palette.py             ← Command palette integration
├── widgets.py                    ← Website context widgets
├── unsplash.py                   ← Unsplash API integration
├── test_auth.py                  ← Unit test cho auth
├── test_widgets.py               ← Unit test cho widgets
├── modules.txt                   ← Khai báo modules (LMS, Job)
│
├── lms/                          ← ⭐ MODULE CHÍNH - LMS Core
│   ├── __init__.py
│   ├── api.py                    ← ⭐ API CHÍNH (~2800 dòng) - tất cả whitelist endpoints
│   ├── utils.py                  ← ⭐ UTILITIES (~2300 dòng) - helper functions
│   ├── user.py                   ← User management (signup, username, login)
│   ├── payments.py               ← Payment processing & gateway integration
│   ├── md.py                     ← Markdown macro parser
│   ├── onboarding.py             ← Onboarding flow
│   ├── telemetry.py              ← PostHog telemetry
│   ├── test_api.py               ← Unit tests cho API
│   ├── test_helpers.py           ← Test helper functions
│   ├── test_utils.py             ← Unit tests cho utils
│   │
│   ├── doctype/                  ← ⭐ TẤT CẢ DATA MODELS (71 DocTypes)
│   │   ├── lms_course/           ← Khóa học
│   │   ├── course_chapter/       ← Chương trong khóa học
│   │   ├── course_lesson/        ← Bài học
│   │   ├── chapter_reference/    ← Liên kết chapter-course
│   │   ├── lesson_reference/     ← Liên kết lesson-chapter
│   │   ├── course_instructor/    ← Giảng viên khóa học
│   │   ├── course_evaluator/     ← Người đánh giá
│   │   │
│   │   ├── lms_batch/            ← Lớp học (batch)
│   │   ├── batch_course/         ← Khóa học trong batch
│   │   ├── lms_batch_enrollment/ ← Đăng ký batch
│   │   ├── lms_batch_feedback/   ← Phản hồi batch
│   │   ├── lms_batch_timetable/  ← Thời khóa biểu
│   │   ├── lms_timetable_legend/ ← Chú thích TKB
│   │   ├── lms_timetable_template/ ← Template TKB
│   │   │
│   │   ├── lms_enrollment/       ← Đăng ký khóa học
│   │   ├── lms_course_progress/  ← Tiến trình học
│   │   ├── lms_course_review/    ← Đánh giá khóa học
│   │   ├── lms_course_interest/  ← Quan tâm khóa học
│   │   ├── lms_course_mentor_mapping/ ← Mapping mentor
│   │   │
│   │   ├── lms_quiz/             ← Bài kiểm tra trắc nghiệm
│   │   ├── lms_quiz_question/    ← Câu hỏi quiz
│   │   ├── lms_quiz_result/      ← Kết quả quiz
│   │   ├── lms_quiz_submission/  ← Bài nộp quiz
│   │   ├── lms_question/         ← Ngân hàng câu hỏi
│   │   ├── lms_option/           ← Lựa chọn đáp án
│   │   │
│   │   ├── lms_assignment/       ← Bài tập
│   │   ├── lms_assignment_submission/ ← Bài nộp bài tập
│   │   ├── lms_assessment/       ← Đánh giá tổng hợp
│   │   │
│   │   ├── lms_programming_exercise/ ← Bài tập lập trình
│   │   ├── lms_programming_exercise_submission/ ← Bài nộp code
│   │   ├── lms_test_case/        ← Test case cho code
│   │   ├── lms_test_case_submission/ ← Kết quả test case
│   │   │
│   │   ├── lms_certificate/      ← Chứng chỉ
│   │   ├── lms_certificate_evaluation/ ← Đánh giá chứng chỉ
│   │   ├── lms_certificate_request/ ← Yêu cầu chứng chỉ
│   │   ├── certification/        ← Chứng nhận
│   │   │
│   │   ├── lms_live_class/       ← Lớp học trực tuyến
│   │   ├── lms_live_class_participant/ ← Người tham gia live
│   │   ├── lms_zoom_settings/    ← Cài đặt Zoom
│   │   ├── zoom_settings/        ← Zoom settings legacy
│   │   ├── evaluator_schedule/   ← Lịch đánh giá
│   │   │
│   │   ├── lms_payment/          ← Thanh toán
│   │   ├── lms_coupon/           ← Mã giảm giá
│   │   ├── lms_coupon_item/      ← Chi tiết coupon
│   │   ├── payment_country/      ← Quốc gia thanh toán
│   │   │
│   │   ├── lms_program/          ← Chương trình học
│   │   ├── lms_program_course/   ← Khóa học trong chương trình
│   │   ├── lms_program_member/   ← Thành viên chương trình
│   │   │
│   │   ├── lms_badge/            ← Huy hiệu
│   │   ├── lms_badge_assignment/ ← Gán huy hiệu
│   │   ├── lms_lesson_note/      ← Ghi chú bài học
│   │   ├── lms_video_watch_duration/ ← Thời lượng xem video
│   │   │
│   │   ├── lms_settings/         ← ⭐ Cài đặt hệ thống LMS
│   │   ├── lms_category/         ← Danh mục
│   │   ├── lms_section/          ← Section layout
│   │   ├── lms_sidebar_item/     ← Menu sidebar
│   │   ├── lms_source/           ← Nguồn đăng ký
│   │   │
│   │   ├── ai_grading_session/   ← ⭐ AI Grading - Phiên chấm
│   │   ├── ai_grading_submission/← ⭐ AI Grading - Bài nộp
│   │   ├── ai_grading_member/    ← AI Grading - Thành viên
│   │   ├── lms_ai_settings/      ← ⭐ AI Settings (API keys, models)
│   │   │
│   │   ├── related_courses/      ← Khóa học liên quan
│   │   ├── scheduled_flow/       ← Flow tự động
│   │   ├── education_detail/     ← Chi tiết học vấn
│   │   ├── work_experience/      ← Kinh nghiệm làm việc
│   │   ├── skills/               ← Kỹ năng
│   │   ├── user_skill/           ← Kỹ năng user
│   │   ├── preferred_function/   ← Chức năng ưa thích
│   │   ├── preferred_industry/   ← Ngành ưa thích
│   │   ├── function/             ← Chức năng
│   │   └── industry/             ← Ngành nghề
│   │
│   ├── dashboard_chart/          ← Dashboard charts config
│   ├── notification/             ← Notification templates
│   ├── page/                     ← Desk pages
│   ├── report/                   ← Reports
│   ├── print_format/             ← Print format (certificates)
│   ├── web_form/                 ← Web forms
│   ├── web_template/             ← Web templates
│   ├── widgets/                  ← Dashboard widgets
│   └── workspace/                ← Desk workspace config
│
├── job/                          ← MODULE JOB - Tuyển dụng
│   ├── __init__.py
│   ├── doctype/
│   │   ├── job_opportunity/      ← Cơ hội việc làm
│   │   ├── job_settings/         ← Cài đặt tuyển dụng
│   │   └── lms_job_application/  ← Đơn ứng tuyển
│   ├── notification/             ← Job notifications
│   └── web_form/                 ← Job web forms
│
├── overrides/                    ← Override Frappe core classes
│   └── web_template.py           ← Custom Web Template
│
├── patches/                      ← Database migration patches
│   ├── patches.txt               ← Patch registry
│   ├── v0_0/                     ← Version 0.x patches
│   ├── v1_0/                     ← Version 1.x patches
│   └── v2_0/                     ← Version 2.x patches
│
├── fixtures/                     ← Default data exports
│   ├── custom_field.json         ← Custom fields cho User doctype
│   ├── function.json             ← Dữ liệu chức năng mặc định
│   ├── industry.json             ← Dữ liệu ngành nghề
│   └── lms_category.json         ← Danh mục mặc định
│
├── templates/                    ← Jinja2 HTML templates
│   ├── emails/                   ← Email templates
│   ├── pages/                    ← Web page templates
│   ├── assessments.html          ← Template đánh giá
│   ├── assignment.html           ← Template bài tập
│   ├── exercise.html             ← Template bài tập lập trình
│   ├── signup-form.html          ← Form đăng ký custom
│   └── ...                       ← Các template khác
│
├── www/                          ← Web-accessible pages
│   ├── _lms.html                 ← SPA entry point
│   ├── _lms.py                   ← SPA context builder
│   ├── certificate.html          ← Certificate page
│   ├── certificate.py            ← Certificate context
│   └── new-sign-up.html          ← Sign up page
│
├── public/                       ← Static assets
│   ├── css/                      ← Stylesheets
│   ├── js/                       ← JavaScript files
│   └── images/                   ← Images & icons
│
├── locale/                       ← Internationalization
├── translations/                 ← Translation files
└── desktop_icon/                 ← Desktop icon config
```

---

## 📄 Chi Tiết Từng File Backend Quan Trọng

### 1. `lms/hooks.py` — Cấu Hình Trung Tâm
| Mục | Mô tả |
|-----|-------|
| **Mục đích** | Định nghĩa toàn bộ cấu hình hooks của Frappe app |
| **after_install** | Tạo batch sources, set permissions cho discussions |
| **after_sync** | Tạo roles (Course Creator, Moderator, Batch Evaluator, LMS Student) |
| **scheduler_events** | Hourly: cập nhật thống kê, lịch đánh giá, live class. Daily: job openings, payment reminders |
| **doc_events** | Hook vào User validate, Discussion Reply, Notification Log |
| **website_route_rules** | Route `/lms/<path>` → SPA entry, certificate routes |
| **jinja methods** | Export hàm utility cho Jinja templates |
| **auth_hooks** | Middleware chặn endpoint cho Website Users |
| **lms_markdown_macro_renderers** | Render Exercise, Quiz, Video, Assignment trong markdown |
| **page_renderer** | SCORMRenderer cho SCORM packages |

### 2. `lms/auth.py` — Middleware Xác Thực
| Mục | Mô tả |
|-----|-------|
| **Mục đích** | Kiểm soát quyền truy cập API cho Website Users |
| **ALLOWED_PATHS** | Whitelist ~50 Frappe core endpoints được phép |
| **authenticate()** | Check `block_endpoints` config, cho phép System Users bypass |
| **Logic** | LMS paths luôn được phép, Server Scripts được phép, custom endpoints configurable |

### 3. `lms/install.py` — Lifecycle Management
| Mục | Mô tả |
|-----|-------|
| **after_install** | Tạo LMS Source records, set discussion permissions |
| **after_sync** | Tạo 4 roles, set default certificate print format, gán roles cho Admin |
| **before_uninstall** | Xóa custom fields và roles |

### 4. `lms/plugins.py` — Plugin System
| Mục | Mô tả |
|-----|-------|
| **PageExtension** | Base class inject CSS/JS vào web pages |
| **ProfileTab** | Base class cho profile page tabs |
| **LiveCodeExtension** | Inject live code editor |
| **quiz_renderer** | Render quiz inline trong lesson (questions, options, history) |
| **exercise_renderer** | Render programming exercise |
| **youtube_video_renderer** | Embed YouTube iframe |
| **video_renderer** / **audio_renderer** / **pdf_renderer** | Media renderers |
| **assignment_renderer** | Render assignment upload form |
| **show_custom_signup** | Custom signup form template |

### 5. `lms/sqlite.py` — Full-Text Search Engine
| Mục | Mô tả |
|-----|-------|
| **LearningSearch** | Extends Frappe SQLiteSearch, FTS5 index |
| **Indexed doctypes** | LMS Course, LMS Batch, Job Opportunity, Course Instructor |
| **Scoring** | Published courses/batches get 1.3x boost |
| **Background indexing** | Chạy qua scheduler, enqueue vào `long` queue |

### 6. `lms/page_renderers.py` — SCORM Renderer
| Mục | Mô tả |
|-----|-------|
| **SCORMRenderer** | Serve SCORM package files từ `public/scorm/` |
| **Logic** | Tìm file theo path, fallback tìm trong thư mục con |

### 7. `lms/lms/api.py` — API Endpoints (~2800 dòng)
Đây là file lớn nhất, chứa tất cả `@frappe.whitelist()` endpoints:

| Endpoint | Mô tả | Auth |
|----------|-------|------|
| `get_user_info` | Lấy thông tin user + roles | Login |
| `get_translations` | Lấy translations theo language | Guest OK |
| `validate_billing_access` | Kiểm tra quyền thanh toán | Login |
| `get_job_details` / `get_job_opportunities` | Job board | Guest OK |
| `get_chart_details` | Thống kê tổng quan | Guest OK |
| `get_branding` | Branding settings | Guest OK |
| `get_unsplash_photos` | Ảnh Unsplash | Login |
| `get_evaluator_details` | Chi tiết evaluator + Google Calendar | Evaluator |
| `get_certified_participants` | Danh sách người có chứng chỉ | Login |
| `get_all_users` | Tất cả users | Moderator/Creator/Evaluator |
| `get_sidebar_settings` | Cấu hình sidebar | Guest OK |
| `delete_lesson` / `delete_chapter` | Xóa content | Course owner |
| `update_lesson_index` / `update_chapter_index` | Drag & drop reorder | Course owner |
| `get_members` | Quản lý members | Moderator |
| `save_evaluation_details` | Lưu đánh giá | Evaluator/Moderator |
| `save_certificate_details` | Cấp chứng chỉ | Evaluator/Moderator |
| `upsert_chapter` | Tạo/sửa chapter + SCORM | Course owner |
| `mark_lesson_progress` | Đánh dấu hoàn thành | Login |
| `get_heatmap_data` | Heatmap hoạt động user | Instructor+ |
| `get_notifications` | Notifications | Login |
| `get_lms_settings` | Public LMS settings | Guest OK |
| `get_profile_details` | Profile công khai | Login |
| `get_streak_info` | Streak info | Login |
| `get_my_live_classes` / `get_admin_live_classes` | Live classes | Login |
| `get_my_courses` / `get_created_courses` | Dashboard courses | Login |
| `get_lesson_completion_stats` | Thống kê completion | Creator/Moderator |
| `get_course_assessment_progress` | Progress chi tiết | Course owner |
| **AI Grading APIs** | | |
| `get_ai_grading_sessions` | List sessions | Login |
| `create_ai_grading_session` | Tạo session mới | Login |
| `update_ai_grading_session` | Cập nhật session | Login |
| `delete_ai_grading_session` | Xóa session + submissions | Login |
| `get_ai_grading_submissions` | List submissions | Login |
| `add_ai_grading_submission` | Thêm student vào session | Login |
| `save_ai_grading_result` | Lưu kết quả AI chấm | Login |
| `get_ai_grading_analytics` | Analytics tổng hợp | Moderator |
| `get_ai_grading_dissatisfaction_feed` | Feed "Not satisfied" | Moderator |
| `get_ai_grading_session_statistics` | Thống kê chi tiết session | Login |
| `send_ai_grading_result_email` | Gửi email kết quả | Login |

### 8. `lms/lms/utils.py` — Utility Functions (~2300 dòng)
| Nhóm Hàm | Mô tả |
|-----------|-------|
| **Routing** | `get_lms_path()`, `get_lms_route()`, `extend_bootinfo()` |
| **Slugify** | `slugify()`, `generate_slug()` |
| **Membership** | `get_membership()`, `get_course_progress()` |
| **Course Structure** | `get_chapters()`, `get_lessons()`, `get_lesson_details()` |
| **Lesson Icons** | `get_lesson_icon()` - detect video/quiz/assignment |
| **Instructors** | `get_instructors()`, `is_instructor()` |
| **Ratings** | `get_average_rating()`, `get_reviews()` |
| **Notifications** | `handle_notifications()`, `create_notification_log()`, `notify_mentions_*` |
| **Charts** | `get_chart_data()`, `get_course_completion_data()` |
| **Currency** | `check_multicurrency()`, `apply_gst()`, `get_current_exchange_rate()` |
| **Courses** | `get_courses()`, `get_course_details()`, `get_batch_details()` |
| **Permissions** | `has_moderator_role()`, `has_evaluator_role()`, `can_modify_course()` |
| **Guest Access** | `guest_access_allowed()` |

### 9. `lms/lms/user.py` — User Management
| Hàm | Mô tả |
|-----|-------|
| `validate_username_duplicates` | Auto-generate unique username |
| `after_insert` | Gán role "LMS Student" cho user mới |
| `sign_up` | Custom signup: tạo user, gán role, set country, rate limit |
| `on_login` | Redirect về LMS route nếu default app là "lms" |

### 10. `lms/lms/payments.py` — Payment Processing
| Hàm | Mô tả |
|-----|-------|
| `get_payment_link` | Tạo payment link qua gateway (Stripe/Razorpay) |
| `record_payment` | Ghi nhận thông tin thanh toán |
| `save_address` | Lưu/cập nhật billing address |

---

## 📊 Doctype Schema - Các Nhóm Chính

### A. Core Learning (15 doctypes)
`LMS Course` → `Course Chapter` → `Course Lesson`  
`Chapter Reference` (liên kết) → `Lesson Reference` (liên kết)  
`LMS Enrollment` → `LMS Course Progress`  
`Course Instructor` | `Course Evaluator`

### B. Assessment (10 doctypes)
`LMS Quiz` → `LMS Quiz Question` → `LMS Question` → `LMS Option`  
`LMS Quiz Submission` → `LMS Quiz Result`  
`LMS Assignment` → `LMS Assignment Submission`  
`LMS Programming Exercise` → `LMS Programming Exercise Submission`

### C. Batch Management (7 doctypes)
`LMS Batch` → `Batch Course` | `LMS Assessment`  
`LMS Batch Enrollment` | `LMS Batch Feedback`  
`LMS Batch Timetable` | `LMS Timetable Template`

### D. Certification (3 doctypes)
`LMS Certificate` | `LMS Certificate Evaluation` | `LMS Certificate Request`

### E. AI Grading (4 doctypes)
`LMS AI Settings` (singleton) - API keys cho OpenAI/Gemini/Anthropic  
`AI Grading Session` → `AI Grading Submission` → `AI Grading Member`

### F. Payment (3 doctypes)
`LMS Payment` | `LMS Coupon` → `LMS Coupon Item`

### G. Job Module (3 doctypes)
`Job Opportunity` | `Job Settings` | `LMS Job Application`

### H. Social/Profile (8 doctypes)
`LMS Badge` → `LMS Badge Assignment`  
`LMS Course Review` | `LMS Lesson Note`  
`Skills` | `User Skill` | `Education Detail` | `Work Experience`

---

## 🔐 Hệ Thống Roles & Permissions

| Role | Quyền | Mô tả |
|------|-------|-------|
| **System Manager** | Full CRUD tất cả | Admin hệ thống |
| **Moderator** | Manage users, courses, batches, AI analytics | Quản trị nội dung |
| **Course Creator** | Tạo/sửa/xóa courses, chapters, lessons | Giảng viên |
| **Batch Evaluator** | Đánh giá, cấp chứng chỉ | Người đánh giá |
| **LMS Student** | Read courses, submit quizzes, enroll | Học viên |
| **Academic User** | Read/Write AI grading (no delete) | Giáo viên |
| **Instructor** | Read/Write AI grading (no delete) | Giảng viên |

---

## ⚡ Scheduler Jobs

| Tần suất | Job | Mô tả |
|----------|-----|-------|
| **All** | `sqlite.build_index_in_background` | Rebuild search index |
| **Hourly** | `certificate_request.schedule_evals` | Schedule evaluation sessions |
| **Hourly** | `api.update_course_statistics` | Cập nhật lesson count, enrollments, rating |
| **Hourly** | `certificate_request.mark_eval_as_completed` | Đánh dấu eval hoàn thành |
| **Hourly** | `lms_live_class.update_attendance` | Cập nhật attendance Zoom |
| **Daily** | `job_opportunity.update_job_openings` | Cập nhật job listings |
| **Daily** | `lms_payment.send_payment_reminder` | Nhắc thanh toán |
| **Daily** | `lms_batch.send_batch_start_reminder` | Nhắc batch bắt đầu |
| **Daily** | `lms_live_class.send_live_class_reminder` | Nhắc lớp live |
| **Daily** | `lms_course.send_notification_for_published_courses` | Thông báo khóa mới |
