# Game Center - Gamification Plan (Full Redesign)

> Version: 3.0 | Date: 2026-04-29 | Status: Planning (Restructured after Architecture Review)
>
> **Quyết định kiến trúc đã chốt:**
> - XP/Level: Sqrt curve (`Level = 1 + floor(sqrt(XP/50))`)
> - Game Score: Server-side verification (pragmatic approach)
> - Leaderboard: Hybrid — realtime cho post-game/submit, scheduled 15min cho global
> - Quiz→Batch: Bảng trung gian riêng, KHÔNG thêm field vào LMS Quiz gốc
> - Composite Score: Scoped theo batch (chỉ tính course thuộc batch đó)

---

## 1. Role System & Permissions

### 1.1 Roles Defined

| Role | Code | Description |
|------|------|-------------|
| Student | `LMS Student` | Học viên, xem/chơi game, xem leaderboard/badges của mình |
| Course Creator | `Course Creator` | Giảng viên, tạo quiz cho lớp, xem thống kê lớp |
| Moderator | `Moderator` | Quản lý, quản lý tất cả lớp, tạo quiz toàn hệ thống |
| Batch Evaluator | `Batch Evaluator` | Chấm điểm, xem thống kê lớp được gán |
| System Manager | `System Manager` | Admin đầy đủ quyền |

### 1.2 Role Detection

#### Frontend (UI rendering only — KHÔNG dùng cho authorization)
```js
// Từ userResource.data (lms.lms.api.get_user_info)
const is_instructor = userResource.data?.is_instructor    // Course Creator
const is_moderator = userResource.data?.is_moderator      // Moderator
const is_evaluator = userResource.data?.is_evaluator      // Batch Evaluator
const is_student = !is_instructor && !is_moderator && !is_evaluator
```

#### Backend Authorization [CRITICAL]
Mọi API phải enforce server-side. Pattern chuẩn của codebase:

```python
# Admin API pattern
@frappe.whitelist()
def create_batch_quiz(batch, title, questions, duration, passing_pct):
    frappe.only_for(["Moderator", "Course Creator"])
    # Instructor: kiểm tra ownership
    if "Moderator" not in frappe.get_roles():
        if not frappe.db.exists("Course Instructor",
            {"instructor": frappe.session.user, "parent": batch}):
            frappe.throw(_("You can only create quizzes for your own batches."))

# Student API pattern — dùng frappe.session.user, không nhận member param
@frappe.whitelist()
def get_user_game_profile():
    member = frappe.session.user  # Luôn lấy từ session, không từ client

# Leaderboard — kiểm tra enrollment
@frappe.whitelist()
def get_leaderboard(batch=None, ...):
    if batch:
        # Student chỉ xem batch mình enrolled
        if "Moderator" not in frappe.get_roles() and "Course Creator" not in frappe.get_roles():
            if not frappe.db.exists("LMS Batch Enrollment",
                {"member": frappe.session.user, "batch": batch}):
                frappe.throw(_("You are not enrolled in this batch."))
```

### 1.3 Permission Matrix

| Feature | Student | Instructor | Evaluator | Moderator |
|---------|---------|------------|-----------|-----------|
| Overview (của mình) | ✅ | ✅ | ✅ | ✅ |
| Play Mini Games | ✅ | ✅ | ✅ | ✅ |
| Leaderboard (global) | ✅ | ✅ | ✅ | ✅ |
| Leaderboard (per batch) | ✅ chỉ lớp đã enroll | ✅ lớp mình dạy | ✅ lớp được gán | ✅ tất cả |
| Badges Gallery | ✅ | ✅ | ✅ | ✅ |
| Create Quiz for Batch | ❌ | ✅ lớp mình dạy | ❌ | ✅ tất cả |
| View Batch Statistics | ❌ | ✅ lớp mình dạy | ✅ lớp được gán | ✅ tất cả |
| Manage Badges | ❌ | ❌ | ❌ | ✅ |
| Game Settings | ❌ | ❌ | ❌ | ✅ |

### 1.4 API Authorization Audit

| API | Required Role | Backend Check |
|-----|--------------|---------------|
| `get_user_game_profile` | All (self) | `frappe.session.user` |
| `get_game_center_stats` | All (self) | `frappe.session.user` |
| `get_leaderboard` | All | Enrollment check for batch |
| `submit_game_session` | All (self) | Session ownership + score clamp |
| `start_game_session` | All (self) | Rate limit check |
| `create_batch_quiz` | Instructor/Moderator | `frappe.only_for()` + ownership |
| `award_badge` | Moderator | `frappe.only_for("Moderator")` |
| `create_badge` | Moderator | `frappe.only_for("Moderator")` |
| `create_game` | Moderator | `frappe.only_for("Moderator")` |
| `assign_game_to_batch` | Instructor/Moderator | `frappe.only_for()` + ownership |
| `get_batch_statistics` | Instructor/Evaluator/Moderator | `frappe.only_for()` + batch check |

---

## 2. Tab: Overview

### 2.1 Student View

```
┌──────────────────────────────────────────────────────────┐
│  Game Center                                            │
├────────────────────────────┬─────────────────────────────┤
│   ╭──── XP Ring ────╮     │  Level 7  68/100 XP        │
│   │       7          │     │  ██████████░░░░░░           │
│   │     LEVEL         │     │                             │
│   ╰───────────────────╯     │  🔥 12 day streak           │
│                            │  ⏱ 47h learned              │
│  Nguyen Van A              │  🏆 6/12 badges             │
├────────────────────────────┴─────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│  │  🎯85% │ │  📋78% │ │  📚5/8 │ │  📈668 │            │
│  │ Quiz   │ │ Assign │ │ Course │ │ Score  │            │
│  └────────┘ └────────┘ └────────┘ └────────┘            │
│  Performance Breakdown                                    │
│  Quiz Score      ██████████░░  85%                        │
│  Assignment     █████████░░░  78%                        │
│  Completion     ████████░░░░  65%                        │
│  Streak         ███████░░░░░  40%                        │
│  Study Hours    █████░░░░░░░  47%                        │
│  ┌── Recent Badges ──┐ ┌── Quick Actions ────────────┐  │
│  │ 🏆🔥📚⚡🎓🌟🔒   │ │ [🎮 Play] [🏆 Board] [🎖️]  │  │
│  └────────────────────┘ └────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Data Sources:**
- `lms.lms.api.get_user_game_profile` → level, xp, stats
- `lms.lms.api.get_game_center_stats` → recent_badges, score breakdown

### 2.2 XP/Level Progression (Sqrt Curve)

```python
# Server-side (api.py)
import math

def calculate_level(total_xp):
    """Sqrt curve: level cao hơn đòi hỏi XP nhiều hơn theo cấp số nhân.
    Level 1: 0 XP | Level 2: 50 XP | Level 5: 800 XP | Level 10: 4050 XP
    """
    level = 1 + int(math.sqrt(total_xp / 50))
    xp_for_current = 50 * (level - 1) ** 2
    xp_for_next = 50 * level ** 2
    xp_in_level = total_xp - xp_for_current
    xp_needed = xp_for_next - xp_for_current
    return {
        "level": level,
        "xp": round(xp_in_level, 1),
        "xp_to_next": xp_needed,
        "xp_percent": round(xp_in_level / xp_needed * 100, 1) if xp_needed > 0 else 100,
    }
```

### 2.3 Instructor/Moderator View

Giống Student nhưng thêm:
- **Batch Stats Summary Card**: tổng số học viên, avg score, completion rate
- **Quick Actions** thêm: "Create Quiz", "View Batch Stats", "Manage Badges"

```
┌── Instructor Extra ─────────────────────────────┐
│  📊 Your Classes Summary                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Lớp A    │ │ Lớp B    │ │ Lớp C    │         │
│  │ 25 stds  │ │ 18 stds  │ │ 32 stds  │         │
│  │ 78% avg  │ │ 82% avg  │ │ 71% avg  │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│  [+ Create Quiz] [📊 Batch Stats] [🎖️ Badges]   │
└───────────────────────────────────────────────────┘
```

---

## 3. Tab: Mini Games

### 3.1 Game List (All Roles)

| # | Game | Type | Mô tả | Difficulty |
|---|------|------|-------|------------|
| 1 | Memory Match | Puzzle | Lật thẻ ghép cặp, grid 3x3→6x6 | Easy→Hard |
| 2 | Timed Quiz | Speed | 8 câu hỏi đa chủ đề, 15s/câu | Medium |
| 3 | Spin the Wheel | Luck | Vòng quay 12 ô, 5 lượt | Easy |
| 4 | Word Scramble | Word | 10 từ khó, hint, 3 mạng | Medium |
| 5 | Drag & Drop | Sort | 5 vòng sắp xếp (số, chữ, timeline...) | Medium→Hard |

### 3.2 Server-Side Verification [CRITICAL]

#### Score Clamping
```python
MAX_SCORE_PER_GAME = {
    "memory_match": 500,   # best time + least moves
    "timed_quiz": 800,     # 8 correct × 100
    "spin_wheel": 500,     # 5 spins × 100 max
    "word_scramble": 300,  # 10 words × 30 max
    "drag_drop": 500,      # 5 rounds × 100
}
```

#### Session Lifecycle
```python
@frappe.whitelist()
def start_game_session(class_game):
    """Creates LMS Game Session, returns session_id."""
    # Rate limit: max 1 session per 30 seconds
    recent = frappe.db.count("LMS Game Session", {
        "member": frappe.session.user,
        "class_game": class_game,
        "completed_at": [">", add_to_date(now_datetime(), seconds=-30)]
    })
    if recent > 0:
        frappe.throw(_("Please wait before starting another session."))

    session = frappe.new_doc("LMS Game Session")
    session.class_game = class_game
    session.member = frappe.session.user
    session.status = "Started"
    session.started_at = now_datetime()
    session.insert()
    return {"session_id": session.name}

@frappe.whitelist()
def submit_game_session(session_id, raw_score, metadata=None):
    """Validates and saves score. One-time submit per session."""
    session = frappe.get_doc("LMS Game Session", session_id)

    # Ownership check
    if session.member != frappe.session.user:
        frappe.throw(_("Unauthorized."), frappe.PermissionError)

    # Idempotency: already completed
    if session.status == "Completed":
        frappe.throw(_("Session already submitted."))

    # Get game type & clamp score
    game_type = frappe.get_value("LMS Game",
        frappe.get_value("LMS Class Game", session.class_game, "game"), "game_type")
    max_score = MAX_SCORE_PER_GAME.get(game_type, 1000)
    raw_score = min(cint(raw_score), max_score)

    # Save
    session.raw_score = raw_score
    session.normalized_score = round(raw_score / max_score * 100, 1)
    session.status = "Completed"
    session.completed_at = now_datetime()
    session.duration_seconds = time_diff_in_seconds(session.completed_at, session.started_at)
    session.metadata = json.dumps(metadata) if metadata else None
    session.save()

    # Update progress
    update_game_progress(session)

    return {"score": raw_score, "normalized": session.normalized_score}
```

### 3.3 Game Mechanics Detail

#### 3.3.1 Memory Match
- 18 cặp emoji, `gridSize`: 3×3(4 pairs), 4×4(8), 5×5(12), 6×6(18)
- Score = base on moves + time bonus
- Timer starts on first flip

#### 3.3.2 Timed Quiz
- 8 câu hỏi, 15 giây mỗi câu, 6 categories
- Auto-advance khi hết giờ
- **Câu hỏi lấy từ `LMS Gamification Question Bank`** (không hardcode)

#### 3.3.3 Spin the Wheel
- SVG wheel 12 segments, 5 spins per session
- Point values: 5, 10, 15, 20, 25, 30, 50, 100 + 3 "miss" segments

#### 3.3.4 Word Scramble
- 10 từ, 3 lives, 3 hints
- **Từ vựng lấy từ `LMS Gamification Question Bank`**

#### 3.3.5 Drag & Drop Sort
- 5 rounds, mỗi round 5 items
- Drag & drop + click fallback (mobile)

### 3.4 Instructor/Moderator: Quiz Creation Mode

```
┌─ Create Quiz for Class ──────────────────────────┐
│  Select Batch: [Lớp AI 2026 ▼]                   │
│  Quiz Title: [___________________________]         │
│  Duration: [15] min    Passing: [60]%             │
│  Questions:                                       │
│  ┌─ Q1 ─────────────────────────────────────┐   │
│  │ What is Python?                            │   │
│  │ ○ A programming language  ✓               │   │
│  │ ○ A snake / A framework / A database      │   │
│  │ Correct: A    Marks: 1                    │   │
│  └───────────────────────────────────────────┘   │
│  [+ Add Question]                                 │
│  [Save Quiz]  [Cancel]                            │
└───────────────────────────────────────────────────┘
```

---

## 4. Tab: Leaderboard

### 4.1 Student View

```
┌─ Leaderboard ───────────────────────────────────┐
│  [All Time ▼]  [Lớp AI 2026 ▼]                  │
│  ┌── Podium ─────────────────────────────────┐   │
│  │      🥈          👑          🥉           │   │
│  │    #2 480pts   #1 520pts   #3 445pts      │   │
│  └──────────────────────────────────────────┘   │
│  ┌─ YOUR RANK ──────────────────────────────┐   │
│  │ #5  👨‍🎓 Nguyen Van A (You)   418 pts    │   │
│  └──────────────────────────────────────────┘   │
│  #4  Hoang Van E   420 pts  75% 14d              │
│  #5  Nguyen Van A  418 pts  65% 12d (You)        │
│  #6  Vu Thi F      350 pts  60% 10d              │
└───────────────────────────────────────────────────┘
```

### 4.2 Scoped Composite Score [FIX from v2.0]

**Problem (v2.0):** `calculate_composite_score()` tính toàn bộ quiz/assignment không filter batch → leaderboard per-batch sai.

**Fix:** Score phải scoped theo batch:

```python
def calculate_composite_score(member, batch=None):
    """Composite score scoped to batch courses when batch provided."""
    W_QUIZ, W_ASSIGNMENT, W_COMPLETION = 0.30, 0.25, 0.25
    W_STREAK, W_HOURS = 0.10, 0.10
    STREAK_CAP, HOURS_CAP = 30, 100

    filters = {"member": member}
    if batch:
        courses = frappe.get_all("Batch Course", {"parent": batch}, pluck="course")
        if courses:
            filters["course"] = ["in", courses]

    # Quiz score — scoped
    quiz_data = frappe.db.get_all("LMS Quiz Submission", filters=filters, fields=["percentage"])
    avg_quiz_pct = sum(q.percentage for q in quiz_data) / len(quiz_data) if quiz_data else 0

    # Assignment score — scoped
    assign_filters = {**filters, "status": ["in", ["Pass", "Fail"]]}
    assignment_data = frappe.db.get_all("LMS Assignment Submission",
        filters=assign_filters, fields=["numeric_score", "score_out_of"])
    # ... rest same as current ...
```

### 4.3 Hybrid Refresh Strategy

| Event | Update Type | Mechanism |
|-------|------------|-----------|
| Game session completed | **Real-time** | `publish_realtime("game_score_updated")` |
| Quiz/Assignment submitted | **Real-time** | `publish_realtime("submission_completed")` |
| Timed Quiz countdown | **Real-time** | Frontend timer (no server) |
| Global leaderboard ranking | **Scheduled** | Background job every 15 min |
| Batch stats aggregation | **Scheduled** | Background job every 15 min |

```python
# hooks.py
scheduler_events = {
    "cron": {
        "*/15 * * * *": [
            "lms.lms.tasks.recalculate_leaderboard",
        ]
    }
}
```

### 4.4 Instructor/Moderator View

- Batch filter = danh sách lớp mình dạy (not enroll)
- Class Stats Summary cards so sánh nhiều lớp
- Export CSV button
- "Compare" mode: xem side-by-side 2 lớp

### 4.5 Leaderboard Data Flow

```
get_leaderboard(batch, period, limit)
  ├── batch=null → global (from materialized table)
  ├── batch="BTC-001" → batch enrollments + scoped score
  ├── period="weekly" → filter submissions last 7 days
  └── period="monthly" → filter submissions last 30 days
```

## 5. Tab: Badges

### 5.1 Student View

```
┌─ Badge Gallery ──────────────────────────────────┐
│  6/12 earned    [All] [Earned] [Locked]           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  │  📚  │ │  🔥  │ │  🎯  │ │  🎓  │            │
│  │EARNED│ │EARNED│ │EARNED│ │EARNED│            │
│  │15 Jan│ │22 Jan│ │01 Feb│ │10 Feb│            │
│  └──────┘ └──────┘ └──────┘ └──────┘            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  │  ⚡  │ │  🏆  │ │  🔥  │ │  👥  │            │
│  │EARNED│ │EARNED│ │LOCKED│ │LOCKED│            │
│  │15 Feb│ │20 Mar│ │40%▓▓░│ │60%▓▓▓░│           │
│  └──────┘ └──────┘ └──────┘ └──────┘            │
└───────────────────────────────────────────────────┘
```

### 5.2 Badge Definitions (12 Badges)

| # | Name | Emoji | Criteria | Category | Auto-Award Method |
|---|------|-------|----------|----------|-------------------|
| 1 | Bookworm | 📚 | Complete first lesson | Learning | DocType hook (LMS Course Progress) |
| 2 | 7-Day Streak | 🔥 | 7 consecutive learning days* | Streak | **Scheduled task** |
| 3 | Quiz Master | 🎯 | Score 100% on any quiz | Academic | DocType hook (LMS Quiz Submission) |
| 4 | Scholar | 🎓 | Complete 5 courses | Learning | **Scheduled task** |
| 5 | Speed Demon | ⚡ | Complete quiz under 30s | Speed | DocType hook (LMS Quiz Submission) |
| 6 | Top Student | 🏆 | Reach top 5 on leaderboard | Social | **Scheduled task** |
| 7 | Unstoppable | 🔥 | 30-day learning streak* | Streak | **Scheduled task** |
| 8 | Dedicated Learner | 👥 | Enroll in 10 courses | Learning | DocType hook (LMS Enrollment) |
| 9 | Quiz Champion | 📋 | Complete all quizzes in a course | Academic | **Scheduled task** |
| 10 | Team Player | 🤝 | Help 5 classmates in discussions | Social | DocType hook (Discussion) |
| 11 | Night Owl | 🌙 | Study past midnight 10 times | Engagement | **Scheduled task** |
| 12 | Perfect Week | ⭐ | Complete all weekly assignments | Academic | **Scheduled task** |

> **Lưu ý về Streak**: Hệ thống hiện tại bỏ qua T7/CN (business days only).
> Badge "7-Day Streak" = 7 ngày làm việc liên tiếp ≈ 9 ngày calendar.

### 5.3 Auto-Award Hooks Architecture

Badges chia 2 loại:
1. **Event-driven** (DocType hooks via `process_badges()`): Trigger ngay khi document được tạo/cập nhật
2. **State-driven** (Scheduled tasks): Phải aggregate data → chạy daily cronjob

```python
# lms/hooks.py — existing mechanism
doc_events = {
    "*": {
        "after_insert": "lms.lms.doctype.lms_badge.lms_badge.process_badges",
        "on_update": "lms.lms.doctype.lms_badge.lms_badge.process_badges",
    }
}

# NEW: Scheduled badge checks for state-driven badges
scheduler_events = {
    "daily": [
        "lms.lms.tasks.check_gamification_badges",
    ]
}
```

```python
# lms/lms/tasks.py (NEW)
def check_gamification_badges():
    """Daily check for state-driven badges (streak, leaderboard, completion)."""
    members = frappe.get_all("LMS Enrollment", group_by="member", pluck="member")
    for member in members:
        check_streak_badges(member)
        check_leaderboard_badges(member)
        check_completion_badges(member)

def check_streak_badges(member):
    from lms.lms.api import fetch_activity_dates, calculate_streaks, calculate_current_streak
    dates = fetch_activity_dates(member)
    streak, _ = calculate_streaks(dates)
    current = calculate_current_streak(dates, streak)
    if current >= 7:
        auto_award_if_not_exists("7-Day Streak", member)
    if current >= 30:
        auto_award_if_not_exists("Unstoppable", member)

def auto_award_if_not_exists(badge_title, member):
    if frappe.db.exists("LMS Badge Assignment", {"badge": badge_title, "member": member}):
        return
    assignment = frappe.new_doc("LMS Badge Assignment")
    assignment.badge = badge_title
    assignment.member = member
    assignment.issued_on = frappe.utils.today()
    assignment.insert(ignore_permissions=True)
```

### 5.4 Moderator Badge Management

```
┌─ Badge Management (Moderator only) ─────────────┐
│  [+ Create New Badge]                             │
│  Badge: [Select Badge ▼]                          │
│  Award to: [Select Student ▼]                     │
│  Class: [All Classes ▼]                           │
│  [Award Badge]                                    │
│  Recent Awards:                                   │
│  🏆 Top Student → Nguyen Van A (20 Mar 2026)     │
└───────────────────────────────────────────────────┘
```

---

## 6. Backend API & DocTypes

### 6.1 New Gamification DocTypes

#### LMS Game (master definition)
| Field | Type | Description |
|-------|------|-------------|
| `title` | Data | Tên game |
| `game_type` | Select | memory_match, timed_quiz, spin_wheel, word_scramble, drag_drop |
| `delivery_mode` | Select | embedded, popup, fullscreen |
| `scoring_model` | Select | best, sum, avg |
| `max_score` | Int | Ngưỡng điểm tối đa (server-side clamp) |
| `configuration` | JSON | Game-specific config |
| `is_active` | Check | |
| `version` | Int | |

#### LMS Class Game (game assigned to batch)
| Field | Type | Description |
|-------|------|-------------|
| `game` | Link → LMS Game | |
| `batch` | Link → LMS Batch | |
| `weight_in_final_grade` | Percent | |
| `max_attempts` | Int | 0 = unlimited |
| `available_from` | Datetime | |
| `available_until` | Datetime | |
| `settings` | JSON | Override game config |

#### LMS Game Session (one play session)
| Field | Type | Description |
|-------|------|-------------|
| `class_game` | Link → LMS Class Game | |
| `member` | Link → User | |
| `attempt_no` | Int | Auto-increment |
| `status` | Select | Started, Completed, Abandoned |
| `started_at` | Datetime | |
| `completed_at` | Datetime | |
| `duration_seconds` | Int | |
| `raw_score` | Int | Client-submitted, clamped |
| `normalized_score` | Float | raw / max × 100 |
| `metadata` | JSON | Game-specific data |

#### LMS Game Progress (aggregate per member per class_game)
| Field | Type | Description |
|-------|------|-------------|
| `class_game` | Link → LMS Class Game | |
| `member` | Link → User | |
| `best_score` | Int | |
| `average_score` | Float | |
| `total_score` | Int | |
| `attempt_count` | Int | |
| `progress_percentage` | Float | |
| `last_session` | Link → LMS Game Session | |

> **Unique constraint**: (`class_game`, `member`)

#### LMS Gamification Question Bank [NEW]
| Field | Type | Description |
|-------|------|-------------|
| `question_text` | Small Text | Câu hỏi |
| `question_type` | Select | mcq, word_scramble, sort_order |
| `options` | JSON | Đáp án [{label, is_correct}] |
| `correct_answer` | Data | Cho word_scramble |
| `hint` | Data | |
| `category` | Select | Tech, Science, Math, Art, General, History, Nature |
| `difficulty` | Select | Easy, Medium, Hard |
| `sort_items` | JSON | Cho drag_drop: [{item, order}] |

> **Lưu ý**: Bảng này THAY THẾ việc hardcode câu hỏi trong Vue components và KHÔNG can thiệp vào `LMS Quiz` gốc.

#### LMS Assessment Assignment [NEW] (Quiz ↔ Batch junction)
| Field | Type | Description |
|-------|------|-------------|
| `quiz` | Link → LMS Quiz | |
| `batch` | Link → LMS Batch | |
| `available_from` | Datetime | |
| `available_until` | Datetime | |
| `weight` | Percent | Trọng số trong tổng điểm batch |
| `assigned_by` | Link → User | Instructor/Moderator |

> **Lý do tách riêng**: Một LMS Quiz có thể được gán cho nhiều batch khác nhau (reusable). Nếu thêm `batch` trực tiếp vào LMS Quiz sẽ tạo coupling 1:1.

### 6.2 DocType Permissions

| DocType | LMS Student | Course Creator | Moderator |
|---------|------------|----------------|-----------|
| LMS Game | Read | Read | CRUD |
| LMS Class Game | Read (enrolled batch) | Read+Create (own batch) | CRUD |
| LMS Game Session | Read+Create (self) | Read (own batch) | Read all |
| LMS Game Progress | Read (self) | Read (own batch) | Read all |
| LMS Gamification Question Bank | — | Read+Create | CRUD |
| LMS Assessment Assignment | Read (enrolled) | Read+Create (own batch) | CRUD |

### 6.3 Scoring Model Logic

```python
def update_game_progress(session):
    """Update LMS Game Progress after session completion."""
    class_game = frappe.get_doc("LMS Class Game", session.class_game)
    game = frappe.get_doc("LMS Game", class_game.game)

    progress_name = frappe.db.get_value("LMS Game Progress",
        {"class_game": session.class_game, "member": session.member})

    if progress_name:
        progress = frappe.get_doc("LMS Game Progress", progress_name)
    else:
        progress = frappe.new_doc("LMS Game Progress")
        progress.class_game = session.class_game
        progress.member = session.member
        progress.best_score = 0
        progress.total_score = 0
        progress.attempt_count = 0

    progress.attempt_count += 1
    progress.last_session = session.name

    if game.scoring_model == "best":
        progress.best_score = max(progress.best_score or 0, session.raw_score)
    elif game.scoring_model == "sum":
        progress.total_score = (progress.total_score or 0) + session.raw_score
        progress.best_score = progress.total_score
    elif game.scoring_model == "avg":
        total = (progress.average_score or 0) * (progress.attempt_count - 1) + session.raw_score
        progress.average_score = round(total / progress.attempt_count, 1)
        progress.best_score = round(progress.average_score)

    progress.progress_percentage = round(progress.best_score / game.max_score * 100, 1)
    progress.save()

    # Real-time update
    frappe.publish_realtime("game_score_updated", {
        "class_game": session.class_game,
        "member": session.member,
        "best_score": progress.best_score,
    }, user=session.member, after_commit=True)
```

### 6.4 API Endpoints (Full List)

```python
# ── Profile & Stats ──
@frappe.whitelist()
def get_user_game_profile():
    """Returns: level (sqrt curve), xp, stats, badges count"""

@frappe.whitelist()
def get_game_center_stats():
    """Returns: composite_score, breakdown, recent_badges"""

# ── Leaderboard ──
@frappe.whitelist()
def get_leaderboard(batch=None, period="all_time", limit=25):
    """Returns: ranked list. Scoped composite score when batch provided.
    Enrollment check for students viewing per-batch."""

# ── Instructor/Admin ──
@frappe.whitelist()
def get_instructor_batches_stats():
    """frappe.only_for(['Moderator', 'Course Creator'])"""

@frappe.whitelist()
def get_batch_statistics(batch):
    """frappe.only_for(['Moderator', 'Course Creator', 'Batch Evaluator'])"""

# ── Quiz Management (via LMS Assessment Assignment) ──
@frappe.whitelist()
def create_batch_quiz(batch, title, questions, duration, passing_pct):
    """frappe.only_for(['Moderator', 'Course Creator']) + ownership check"""

# ── Badges ──
@frappe.whitelist()
def get_user_badges(member=None):
    """Returns: all badges with earned status + progress %"""

@frappe.whitelist()
def award_badge(badge, member, batch=None):
    """frappe.only_for('Moderator')"""

@frappe.whitelist()
def create_badge(title, description, image, category):
    """frappe.only_for('Moderator')"""

# ── Game Management ──
@frappe.whitelist()
def create_game(data):
    """frappe.only_for('Moderator')"""

@frappe.whitelist()
def assign_game_to_batch(game, batch, settings=None):
    """frappe.only_for(['Moderator', 'Course Creator']) + ownership"""

@frappe.whitelist()
def list_class_games(batch=None, member=None):
    """Returns class games available to user"""

# ── Game Session Lifecycle ──
@frappe.whitelist()
def start_game_session(class_game):
    """Rate-limited. Returns session_id."""

@frappe.whitelist()
def submit_game_session(session_id, raw_score, metadata=None):
    """Ownership check + score clamp + one-time submit."""

@frappe.whitelist()
def get_game_progress(class_game, member=None):
    """Returns LMS Game Progress for current user"""
```

### 6.5 Database Indexes

```python
# Via DocType JSON field property "search_index": 1
# Or via migration patch:

# LMS Game Session
# INDEX (class_game, member)
# INDEX (member, completed_at)

# LMS Game Progress
# UNIQUE (class_game, member)

# LMS Gamification Question Bank
# INDEX (question_type, category, difficulty)

# LMS Assessment Assignment
# UNIQUE (quiz, batch)
```

### 6.6 Caching Strategy

```python
# Game profile — cache 5 minutes
@frappe.whitelist()
def get_user_game_profile():
    cache_key = f"game_profile:{frappe.session.user}"
    cached = frappe.cache().get_value(cache_key)
    if cached:
        return cached
    result = _compute_game_profile()
    frappe.cache().set_value(cache_key, result, expires_in_sec=300)
    return result

# Invalidate on score update
def update_game_progress(session):
    # ... save progress ...
    frappe.cache().delete_value(f"game_profile:{session.member}")

# Leaderboard — cache 15 minutes (refreshed by scheduled job)
def recalculate_leaderboard():
    """Scheduled every 15 min. Bulk SQL aggregation."""
    # Single query instead of N loops
    # Store results in LMS Game Leaderboard Entry or cache
```

### 6.7 Realtime Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `game_score_updated` | After `submit_game_session` | `{class_game, member, best_score}` |
| `leaderboard_updated` | After scheduled recalculation | `{batch, top_5: [...]}` |
| `badge_awarded` | After badge auto-award | `{member, badge, emoji}` |

---

## 7. File Structure

```
frontend/src/pages/GameCenter/
├── GameCenter.vue              ← Main page (tabs, role-based rendering)
├── OverviewTab.vue             ← Overview section
├── GamesTab.vue                ← Games grid + active game
├── LeaderboardTab.vue          ← Leaderboard with role-based filters
├── BadgesTab.vue               ← Badge gallery + management
├── gameRegistry.js             ← [NEW] Dynamic game component mapping
├── games/
│   ├── MemoryMatch.vue
│   ├── TimedQuiz.vue
│   ├── SpinTheWheel.vue
│   ├── WordScramble.vue
│   └── DragDropSort.vue
└── instructor/
    ├── CreateQuizModal.vue
    ├── BatchStatsCard.vue
    └── BadgeManager.vue

lms/lms/
├── api.py                      ← Game + leaderboard APIs (enhanced)
├── tasks.py                    ← [NEW] Scheduled badge checks + leaderboard recalc
└── doctype/
    ├── lms_game/               ← [NEW]
    ├── lms_class_game/         ← [NEW]
    ├── lms_game_session/       ← [NEW]
    ├── lms_game_progress/      ← [NEW]
    ├── lms_gamification_question_bank/  ← [NEW]
    ├── lms_assessment_assignment/       ← [NEW]
    ├── lms_badge/              ← Existing (add frappe.only_for to assign_badge)
    └── lms_badge_assignment/   ← Existing
```

### 7.1 Dynamic Game Registry [NEW]

```js
// frontend/src/pages/GameCenter/gameRegistry.js
const GAME_COMPONENTS = {
    'memory_match': () => import('./games/MemoryMatch.vue'),
    'timed_quiz': () => import('./games/TimedQuiz.vue'),
    'spin_wheel': () => import('./games/SpinTheWheel.vue'),
    'word_scramble': () => import('./games/WordScramble.vue'),
    'drag_drop': () => import('./games/DragDropSort.vue'),
}

export function resolveGameComponent(gameType) {
    return GAME_COMPONENTS[gameType] || null
}

// Usage in GamesTab.vue — load from API instead of hardcoded array
// const games = createResource({ url: 'lms.lms.api.list_class_games', auto: true })
```

---

## 8. Implementation Phases

### Phase 1: Security & Architecture Foundation (Week 1)
- [ ] Add `frappe.only_for()` to existing `assign_badge()` in `lms_badge.py`
- [ ] Add batch enrollment check to `get_leaderboard()`
- [ ] Add `batch` param to `calculate_composite_score()` for scoped scoring
- [ ] Update `get_user_game_profile()` to use sqrt XP formula
- [ ] Split GameCenter.vue into tab components (OverviewTab, GamesTab, etc.)
- [ ] Add role-conditional rendering

### Phase 2: New DocTypes & Game Infrastructure (Week 1-2)
- [ ] Create DocTypes: LMS Game, LMS Class Game, LMS Game Session, LMS Game Progress
- [ ] Create DocType: LMS Gamification Question Bank
- [ ] Create DocType: LMS Assessment Assignment (Quiz ↔ Batch junction)
- [ ] Set DocType permissions per role
- [ ] Add SQL indexes
- [ ] Add fixtures for default games

### Phase 3: Server-Side Game Verification (Week 2)
- [ ] Implement `start_game_session()` with rate limiting
- [ ] Implement `submit_game_session()` with score clamping + ownership
- [ ] Implement `update_game_progress()` with scoring models (best/sum/avg)
- [ ] Wire frontend games to session lifecycle API
- [ ] Add `gameRegistry.js` for dynamic game loading

### Phase 4: Leaderboard Enhancement (Week 2-3)
- [ ] Enhance `get_leaderboard()` with period filter (weekly/monthly)
- [ ] Implement materialized leaderboard via scheduled job
- [ ] Add caching layer (5min profile, 15min leaderboard)
- [ ] Add `publish_realtime` events for score updates
- [ ] Build LeaderboardTab.vue with batch filter + podium

### Phase 5: Quiz & Question Bank (Week 3)
- [ ] Populate LMS Gamification Question Bank with initial data
- [ ] Build CreateQuizModal.vue using LMS Assessment Assignment
- [ ] Update TimedQuiz.vue to fetch questions from API
- [ ] Update WordScramble.vue to fetch words from API
- [ ] Wire quiz submission flow

### Phase 6: Badge System Enhancement (Week 3-4)
- [ ] Implement `check_gamification_badges()` scheduled task
- [ ] Add `award_badge` API with Moderator check
- [ ] Add `create_badge` API with Moderator check
- [ ] Build BadgeManager.vue
- [ ] Add `get_user_badges()` with progress percentage
- [ ] Replace mock badge data with API calls

### Phase 7: Connect Real Data & Polish (Week 4)
- [ ] Replace ALL mock data with `createResource()` calls
- [ ] Add loading/error/empty states to all tabs
- [ ] Animations (Lottie for badge unlock, confetti)
- [ ] Mobile responsive testing
- [ ] Vietnamese translations
- [ ] A11y audit

### Phase 8: Migration & Deployment (Week 4)
- [ ] Create patches: `lms.lms.patches.v0_gamification.create_default_games`
- [ ] Create patches: `lms.lms.patches.v0_gamification.seed_question_bank`
- [ ] Create patches: `lms.lms.patches.v0_gamification.backfill_leaderboard`
- [ ] Add entries to `patches.txt`
- [ ] Performance testing with 100+ students
- [ ] Role permission integration testing

## 9. Component Props & Events

### GameCenter.vue (Main)
```js
// No props — root page component
// Manages: activeTab, activeGame via vue-router
```

### OverviewTab.vue
```js
Props: { userRole: String }
Data: createResource('lms.lms.api.get_user_game_profile')
Events: { 'switch-tab': (tabName) }
```

### GamesTab.vue
```js
Props: { userRole: String }
Data: createResource('lms.lms.api.list_class_games')
Events: { 'open-game': (game) }
```

### LeaderboardTab.vue
```js
Props: { userRole: String, batches: Array }
Data: createResource('lms.lms.api.get_leaderboard')
Events: { 'switch-tab': (tabName) }
```

### BadgesTab.vue
```js
Props: { userRole: String }
Data: createResource('lms.lms.api.get_user_badges')
Events: { 'switch-tab': (tabName) }
```

### CreateQuizModal.vue
```js
Props: { batch: String, visible: Boolean }
Events: { close, 'quiz-created': (quiz) }
```

---

## 10. Design Tokens

### Colors
| Usage | Light | Dark |
|-------|-------|------|
| XP Ring (normal) | `#3b82f6` (blue-500) | `#3b82f6` |
| XP Ring (max level) | `#f59e0b` (amber-500) | `#f59e0b` |
| Rank 1 | `#f59e0b` amber gradient | amber-900/40 |
| Rank 2 | `#9ca3af` gray | gray-800 |
| Rank 3 | `#f97316` orange gradient | orange-900/30 |
| Your Rank card | `border-blue-500` | `border-blue-400` |
| Earned badge tag | `bg-green-500 text-white` | same |
| Locked overlay | `opacity-50` | same |
| Progress bar (locked) | `bg-gray-400` | `bg-gray-500` |

### Spacing
- Card padding: `p-5` (desktop), `p-4` (mobile)
- Grid gap: `gap-3` (cards), `gap-4` (sections)
- Border radius: `rounded-xl` (cards), `rounded-2xl` (hero card)

### Animations
- Card hover: `hover:shadow-md hover:-translate-y-1 transition-all duration-300`
- XP Ring fill: `transition-all duration-1000`
- Tab switch: `transition-colors duration-200`
- Badge unlock: scale bounce (keyframe)
- Podium: slide-up entrance animation

---

## 11. Security, Performance & Rate Limiting

### 11.1 Rate Limiting

| API | Rate Limit | Mechanism |
|-----|-----------|-----------|
| `start_game_session` | 1 per 30s per user | DB check recent sessions |
| `submit_game_session` | 1 per session (idempotent) | Session status check |
| `get_leaderboard` | 30/min per user | Frappe rate limiter or cache |
| `award_badge` | 10/min per admin | `frappe.only_for` + reasonable limit |

### 11.2 Performance Optimizations

| Problem | Solution |
|---------|----------|
| `get_leaderboard` O(N×5 queries) | Materialized table + scheduled recalc |
| `fetch_activity_dates` loads all history | `SELECT DISTINCT DATE(creation)` SQL |
| No caching for profile/leaderboard | Redis cache with TTL (5min/15min) |
| Badge check per member is expensive | Batch check in daily scheduled task |

### 11.3 Existing Code Fixes Required

| File | Fix | Priority |
|------|-----|----------|
| `lms_badge.py:L63` `assign_badge()` | Add `frappe.only_for("Moderator")` | 🔴 Critical |
| `api.py` `calculate_composite_score()` | Add `batch` param for scoped scoring | 🔴 Critical |
| `api.py` `get_leaderboard()` | Add enrollment check for student batch access | 🔴 Critical |
| `api.py` `get_user_game_profile()` | Replace linear XP with sqrt formula | ⚠️ Important |
| `GameCenter.vue` | Replace hardcoded mock data with `createResource()` | ⚠️ Important |

---

## 12. Migration & Patch Plan

### patches.txt entries
```
lms.lms.patches.v0_gamification.create_gamification_doctypes
lms.lms.patches.v0_gamification.create_default_games
lms.lms.patches.v0_gamification.seed_question_bank
lms.lms.patches.v0_gamification.backfill_leaderboard
```

### Fixture Data

#### Default Games (5)
```python
games = [
    {"title": "Memory Match", "game_type": "memory_match", "scoring_model": "best", "max_score": 500},
    {"title": "Timed Quiz", "game_type": "timed_quiz", "scoring_model": "best", "max_score": 800},
    {"title": "Spin the Wheel", "game_type": "spin_wheel", "scoring_model": "sum", "max_score": 500},
    {"title": "Word Scramble", "game_type": "word_scramble", "scoring_model": "best", "max_score": 300},
    {"title": "Drag & Drop Sort", "game_type": "drag_drop", "scoring_model": "best", "max_score": 500},
]
```

#### Question Bank Seed (sample)
```python
questions = [
    {"question_text": "What does HTML stand for?", "question_type": "mcq",
     "category": "Tech", "difficulty": "Easy",
     "options": [{"label": "Hyper Text Markup Language", "is_correct": True}, ...]},
    {"question_text": "ALGORITHM", "question_type": "word_scramble",
     "category": "Tech", "difficulty": "Medium",
     "correct_answer": "ALGORITHM", "hint": "A step-by-step procedure"},
    # ... more questions ...
]
```

---

## Appendix A: Architecture Decision Log

| # | Decision | Chosen Option | Rationale |
|---|----------|--------------|-----------|
| 1 | XP/Level Formula | Sqrt curve | Diminishing returns tạo motivation lâu dài |
| 2 | Game Score Trust | Server-side pragmatic | Score clamp + session token + rate limit |
| 3 | Leaderboard Refresh | Hybrid realtime + scheduled | Balance UX immediacy vs server load |
| 4 | Quiz→Batch Mapping | Junction table (LMS Assessment Assignment) | Cho phép 1 quiz dùng lại nhiều batch |
| 5 | Composite Score | Scoped theo batch | Fix lỗi cross-batch score pollution |
| 6 | Badge Auto-Award | DocType hooks + scheduled tasks | State-driven badges cần aggregate check |
| 7 | Game Content | LMS Gamification Question Bank | Tách khỏi LMS Quiz, dynamic content |
