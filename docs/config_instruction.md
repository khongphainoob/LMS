# ⚙️ Hướng Dẫn Cấu Hình LMS Khi Deploy (Configuration Guide)

> **Dành cho**: Admin/Developer triển khai Frappe LMS  
> **Cập nhật**: 2026-04-05  
> **Tổng quan**: 3 phương pháp cấu hình, phân tích ưu/nhược điểm, và khuyến nghị

---

## Mục lục

1. [Tổng quan hệ thống cấu hình](#1-tổng-quan-hệ-thống-cấu-hình)
2. [Danh sách cài đặt quan trọng](#2-danh-sách-cài-đặt-quan-trọng)
3. [Cách 1: Cấu hình qua Desk UI (Low-code)](#cách-1-cấu-hình-qua-desk-ui-low-code)
4. [Cách 2: Cấu hình qua Database trực tiếp](#cách-2-cấu-hình-qua-database-trực-tiếp)
5. [Cách 3: Cấu hình trực tiếp trong Code](#cách-3-cấu-hình-trực-tiếp-trong-code)
6. [So sánh 3 phương pháp](#4-so-sánh-tổng-hợp)
7. [Khuyến nghị theo tình huống](#5-khuyến-nghị-theo-tình-huống)
8. [Checklist cấu hình trước khi cho user dùng](#6-checklist-cấu-hình-trước-khi-cho-user-dùng)

---

## 1. Tổng quan Hệ thống Cấu hình

Frappe LMS lưu toàn bộ config trong **DocType `LMS Settings`** — một Single Document (chỉ có 1 bản ghi duy nhất trong database). Toàn bộ hệ thống đọc settings từ đây:

```
┌────────────────────┐
│   LMS Settings     │ ← Single DocType (1 bản ghi duy nhất)
│   (tabSingles)     │
├────────────────────┤
│ allow_guest_access │ ← Cho phép khách xem không cần đăng nhập
│ disable_pwa        │ ← Tắt Progressive Web App
│ payment_gateway    │ ← Cổng thanh toán
│ meta_description   │ ← SEO description
│ courses            │ ← Hiện Courses trên sidebar
│ batches            │ ← Hiện Batches trên sidebar
│ ...30+ fields khác │
└────────────────────┘
         │
    Đọc bởi:
    ├── Backend (Python)  → frappe.get_single("LMS Settings")
    ├── Frontend (Vue)    → API: lms.lms.api.get_lms_settings
    └── Templates (Jinja) → frappe.db.get_single_value(...)
```

---

## 2. Danh sách Cài đặt Quan trọng

### Tab General

| Field | Loại | Default | Mô tả |
|---|---|---|---|
| `allow_guest_access` | Check | ✅ 1 | Cho phép truy cập không cần login |
| `prevent_skipping_videos` | Check | ❌ 0 | Bắt buộc xem hết video |
| `disable_pwa` | Check | ❌ 0 | Tắt cài đặt PWA |
| `send_calendar_invite_for_evaluations` | Check | ❌ 0 | Gửi lời mời Google Calendar khi đánh giá |
| `default_home` | Check | ❌ 0 | Đặt LMS làm trang chủ mặc định |
| `livecode_url` | Data | `https://falcon.frappe.io/` | URL LiveCode server |
| `unsplash_access_key` | Data | (trống) | API key cho ảnh Unsplash |

### Tab Sidebar (Hiển thị menu)

| Field | Default | Mô tả |
|---|---|---|
| `courses` | ✅ 1 | Hiện menu Courses |
| `batches` | ✅ 1 | Hiện menu Batches |
| `jobs` | ✅ 1 | Hiện menu Jobs |
| `statistics` | ✅ 1 | Hiện menu Statistics |
| `notifications` | ✅ 1 | Hiện menu Notifications |
| `programming_exercises` | ✅ 1 | Hiện menu Programming Exercises |
| `ai_grading` | ❌ 0 | Hiện menu AI Grading |
| `certifications` | ❌ 0 | Hiện menu Certifications |

### Tab Signup

| Field | Default | Mô tả |
|---|---|---|
| `disable_signup` | ✅ 1 | Tắt đăng ký tự do (admin phải tạo tài khoản) |
| `user_category` | ❌ 0 | Hỏi loại user khi đăng ký |
| `custom_signup_content` | (trống) | HTML tùy chỉnh trang đăng ký |

### Tab Payment

| Field | Default | Mô tả |
|---|---|---|
| `payment_gateway` | (trống) | Cổng thanh toán (Razorpay, Stripe...) |
| `default_currency` | (trống) | Loại tiền tệ mặc định |
| `apply_gst` | ❌ 0 | Áp dụng GST cho Ấn Độ |

### Tab SEO

| Field | Mô tả |
|---|---|
| `meta_description` | Mô tả cho Google Search |
| `meta_image` | Hình ảnh chia sẻ mạng xã hội |
| `meta_keywords` | Từ khóa SEO |

### Tab Contact

| Field | Mô tả |
|---|---|
| `contact_us_email` | Email liên hệ hiển thị cho user |
| `contact_us_url` | URL trang liên hệ |

### Tab Email Templates

| Field | Mô tả |
|---|---|
| `certification_template` | Template email gửi chứng chỉ |
| `batch_confirmation_template` | Template email xác nhận đăng ký batch |
| `payment_reminder_template` | Template nhắc thanh toán |

---

## Cách 1: Cấu hình qua Desk UI (Low-code)

### Mô tả
Frappe có 2 giao diện (UI):
- **LMS Frontend** (`/lms/`) — giao diện Vue cho học sinh/giáo viên
- **Desk Backend** (`/app/`) — giao diện admin của Frappe Framework

Settings có thể cấu hình qua **cả hai** giao diện.

### 1A. Qua LMS Frontend Settings Panel

```
Bước 1: Đăng nhập với tài khoản Admin/Moderator
Bước 2: Click vào avatar góc trái sidebar → Settings (⚙️)
Bước 3: Một dialog sẽ mở ra với các tab:
         ├── Configuration → General
         ├── Lists → Members, Evaluators, Categories
         ├── Payment → Configuration, Gateways, Transactions
         └── Customize → Branding, Sidebar, Signup, SEO
Bước 4: Thay đổi giá trị → tự động save
```

**Ví dụ: Tắt khả năng đăng ký tự do**
```
Settings → Customize → Signup → ✅ Disable signup
```

**Ví dụ: Thêm logo trường học**
```
Settings → Customize → Branding → Upload Logo + Favicon
```

**Ví dụ: Ẩn menu Jobs khỏi sidebar** 
```
Settings → Customize → Sidebar → ❌ Bỏ check "Jobs"
```

### 1B. Qua Frappe Desk (`/app/lms-settings`)

```
Bước 1: Truy cập https://your-domain.com/app/lms-settings
Bước 2: Frappe sẽ hiển thị form LMS Settings với đầy đủ tabs:
         General | Sidebar | Signup Settings | Payment Settings | 
         Email Templates | SEO | Contact Us
Bước 3: Sửa giá trị trực tiếp
Bước 4: Click "Save" (Ctrl+S)
```

**Ví dụ: Cấu hình SEO**
```
/app/lms-settings → Tab "SEO"
→ Meta Description: "Hệ thống quản lý học tập trực tuyến"
→ Meta Keywords: "LMS, học trực tuyến, khóa học"
→ Upload Meta Image
→ Save
```

### ✅ Điểm mạnh

- **Không cần kiến thức kỹ thuật** — Ai cũng dùng được
- **An toàn** — Frappe tự validate dữ liệu, không thể nhập sai kiểu
- **Audit trail** — Mọi thay đổi được ghi lại (who, when, what) tại phần Version
- **Realtime** — Thay đổi có hiệu lực ngay, không cần restart server
- **Role-based access** — Chỉ System Manager hoặc Moderator mới sửa được
- **Backup-friendly** — Settings nằm trong database, backup tự động bao gồm

### ❌ Điểm yếu

- **Không version control (Git)** — Không thể track thay đổi bằng Git
- **Không reproducible** — Khó lặp lại chính xác trên server khác (phải cấu hình tay lại)
- **Giới hạn fields** — Chỉ sửa được những field có sẵn trong DocType schema
- **Cần login** — Phải có tài khoản admin

---

## Cách 2: Cấu hình qua Database Trực tiếp

### Mô tả
Frappe Single DocType lưu config trong table `tabSingles`:

```sql
SELECT field, value FROM tabSingles WHERE doctype = 'LMS Settings';
```

Mỗi setting field là 1 row riêng (field-value pairs).

### Step-by-step

#### 2A. Dùng Bench Console (Python — Khuyến nghị)

```bash
# SSH vào server
ssh user@your-server

# Vào frappe-bench directory
cd ~/frappe-bench

# Mở bench console
bench --site your-site.com console
```

```python
# === ĐỌC settings ===
settings = frappe.get_single("LMS Settings")
print(settings.allow_guest_access)   # 1
print(settings.disable_pwa)          # 0
print(settings.courses)              # 1

# === SỬA 1 field ===
frappe.db.set_single_value("LMS Settings", "allow_guest_access", 0)
frappe.db.commit()
print("✅ Guest access đã tắt")

# === SỬA nhiều fields cùng lúc ===
settings = frappe.get_single("LMS Settings")
settings.allow_guest_access = 0
settings.disable_signup = 1
settings.disable_pwa = 0
settings.meta_description = "Hệ thống LMS trường ABC"
settings.contact_us_email = "admin@truongabc.edu.vn"
settings.save()
frappe.db.commit()
print("✅ Đã cập nhật tất cả settings")

# === KIỂM TRA ===
frappe.get_single("LMS Settings").as_dict()
```

#### 2B. Dùng MariaDB/MySQL trực tiếp (Chỉ khi cần thiết)

```bash
# Kết nối database
bench --site your-site.com mariadb
```

```sql
-- Xem tất cả LMS Settings
SELECT field, value FROM tabSingles 
WHERE doctype = 'LMS Settings' 
ORDER BY field;

-- Sửa 1 setting
UPDATE tabSingles 
SET value = '0' 
WHERE doctype = 'LMS Settings' 
AND field = 'allow_guest_access';

-- Thêm Meta Description
UPDATE tabSingles 
SET value = 'Nền tảng học trực tuyến' 
WHERE doctype = 'LMS Settings' 
AND field = 'meta_description';

-- Nếu field chưa tồn tại, INSERT mới
INSERT INTO tabSingles (doctype, field, value) 
VALUES ('LMS Settings', 'meta_description', 'Nền tảng học trực tuyến')
ON DUPLICATE KEY UPDATE value = 'Nền tảng học trực tuyến';
```

#### 2C. Dùng Frappe API từ bên ngoài (REST)

```bash
# Đọc settings
curl -X GET "https://your-domain.com/api/resource/LMS Settings" \
  -H "Authorization: token api_key:api_secret"

# Sửa settings
curl -X PUT "https://your-domain.com/api/resource/LMS Settings/LMS Settings" \
  -H "Authorization: token api_key:api_secret" \
  -H "Content-Type: application/json" \
  -d '{"allow_guest_access": 0, "disable_signup": 1}'
```

### ✅ Điểm mạnh

- **Scriptable** — Có thể tự động hóa bằng script
- **Batch update** — Sửa nhiều settings cùng lúc
- **Reproducible** — Lưu script vào Git, chạy lại trên server khác
- **Không cần GUI** — Làm qua SSH/terminal
- **Bench console an toàn** — Frappe ORM tự validate, commit transaction

### ❌ Điểm yếu

- **⚠️ Rủi ro cao (SQL trực tiếp)** — Sai lệnh SQL có thể hỏng database
- **Cần kiến thức kỹ thuật** — Phải biết Python/SQL
- **Không có undo** — Phải backup trước khi thao tác
- **Cache** — Sau khi sửa DB trực tiếp, có thể cần `bench clear-cache` để frontend thấy thay đổi
- **Bypass validation** — SQL trực tiếp bỏ qua Frappe validation logic

### ⚠️ Lưu ý quan trọng

```bash
# LUÔN BACKUP trước khi sửa database
bench --site your-site.com backup

# Sau khi sửa bằng SQL trực tiếp, clean cache
bench --site your-site.com clear-cache

# Nếu sửa bằng bench console (Python), KHÔNG cần clear-cache
# vì frappe.db.commit() đã xử lý
```

---

## Cách 3: Cấu hình Trực tiếp trong Code

### Mô tả
Thay đổi **default values** hoặc **hành vi** bằng cách sửa source code. Có 2 cấp độ:

### 3A. Sửa DocType JSON (Schema Defaults)

File: `lms/lms/doctype/lms_settings/lms_settings.json`

```json
// Ví dụ: Đổi default "allow_guest_access" từ 1 → 0
{
  "default": "0",              // ← Sửa từ "1" thành "0"
  "fieldname": "allow_guest_access",
  "fieldtype": "Check",
  "label": "Allow Guest Access"
}
```

```bash
# Sau khi sửa JSON, chạy migrate để áp dụng
bench --site your-site.com migrate
```

**⚠️ Lưu ý**: Sửa JSON chỉ ảnh hưởng **default values cho site mới**. Site hiện tại đã có giá trị trong DB sẽ không bị ghi đè.

### 3B. Sửa Python Logic (Business Rules)

File: `lms/lms/doctype/lms_settings/lms_settings.py`

```python
# Ví dụ: Thêm custom validation khi save settings
class LMSSettings(Document):
    def validate(self):
        if self.allow_guest_access and self.disable_signup:
            frappe.throw("Không thể vừa cho guest access vừa tắt signup!")
```

### 3C. Thêm field mới vào Settings

**Bước 1**: Sửa `lms_settings.json` — thêm field mới

```json
// Thêm vào field_order:
"field_order": [
  // ... existing fields ...
  "custom_welcome_message"    // ← Thêm mới
],

// Thêm vào fields array:
{
  "fieldname": "custom_welcome_message",
  "fieldtype": "Small Text",
  "label": "Custom Welcome Message",
  "description": "Tin nhắn chào mừng hiển thị trên trang Home"
}
```

**Bước 2**: Sử dụng trong Python
```python
welcome = frappe.db.get_single_value("LMS Settings", "custom_welcome_message")
```

**Bước 3**: Sử dụng trong Vue Frontend
```javascript
// Đã có sẵn qua API get_lms_settings
const { settings } = useSettings()
console.log(settings.data?.custom_welcome_message)
```

**Bước 4**: Migrate
```bash
bench --site your-site.com migrate
bench build --app lms
bench restart
```

### 3D. Sửa Frontend Theme/Config

File: `frontend/tailwind.config.js` — Theme colors, fonts
File: `frontend/src/index.css` — CSS variables
File: `frontend/src/utils/index.js` — Utility functions

```javascript
// Ví dụ: Đổi font chữ toàn app
// File: tailwind.config.js
sans: ['"Plus Jakarta Sans"', 'sans-serif'],  // ← Sửa font
```

### 3E. Dùng Frappe Fixtures (Reproducible Config)

Tạo file `lms/fixtures/lms_settings.json`:

```json
[
  {
    "doctype": "LMS Settings",
    "allow_guest_access": 0,
    "disable_signup": 1,
    "courses": 1,
    "batches": 1,
    "jobs": 0,
    "statistics": 1,
    "meta_description": "Hệ thống LMS trường ABC",
    "contact_us_email": "admin@truongabc.edu.vn"
  }
]
```

Khai báo trong `hooks.py`:
```python
fixtures = [
    {"dt": "LMS Settings"}
]
```

Import khi deploy:
```bash
bench --site your-site.com import-fixtures
```

### ✅ Điểm mạnh

- **Version control** — Tất cả thay đổi tracked bằng Git
- **Reproducible** — Deploy lên server mới chỉ cần `bench migrate`
- **Team collaboration** — PR review, code review
- **Custom logic** — Thêm validation, business rules tùy ý
- **Fixtures** — Export/import config giữa các môi trường
- **Frontend theme** — Thay đổi toàn bộ giao diện

### ❌ Điểm yếu

- **Cần developer** — Yêu cầu biết Python, JavaScript, JSON
- **Deploy cycle** — Cần build + migrate + restart sau mỗi thay đổi
- **Không realtime** — Thay đổi không có hiệu lực ngay lập tức
- **Risk of conflicts** — Git merge conflicts khi nhiều người sửa
- **Overwriting user changes** — Fixtures có thể ghi đè cấu hình admin đã sửa trên UI
- **Breaking changes** — Sửa sai code có thể crash toàn bộ app

---

## 4. So sánh Tổng hợp

| Tiêu chí | 🅰️ Desk UI | 🅱️ Database | 🅲 Code |
|---|---|---|---|
| **Ai dùng được** | Mọi admin | DevOps/Developer | Developer |
| **Kiến thức cần** | ⭐ Không cần | ⭐⭐⭐ Python/SQL | ⭐⭐⭐⭐ Full-stack |
| **Tốc độ thay đổi** | ⚡ Tức thì | ⚡ Tức thì (+ clear cache) | 🐌 Cần build + restart |
| **An toàn** | ✅ Rất an toàn | ⚠️ Rủi ro trung bình | ⚠️ Rủi ro nếu sai code |
| **Git tracking** | ❌ Không | ❌ Không (trừ fixtures) | ✅ Có |
| **Reproducible** | ❌ Phải làm tay lại | ⚠️ Partial (script) | ✅ Hoàn toàn |
| **Scope** | Chỉ existing fields | Chỉ existing fields | Thêm field + logic mới |
| **Batch operations** | Từng field một | Nhiều field 1 lúc | Nhiều field + logic |
| **Rollback** | ❌ Khó (no undo) | ⚠️ Restore backup | ✅ Git revert |
| **Phù hợp cho** | Cấu hình hàng ngày | Migration/automation | Custom features |

---

## 5. Khuyến nghị theo Tình huống

### 🎯 Tình huống 1: "Lần đầu deploy, cần setup ban đầu"

> **Dùng: 🅰️ Desk UI + 🅱️ Bench Console**

```
1. Login vào /app/lms-settings
2. Cấu hình General, Sidebar, SEO, Contact qua UI
3. Upload Logo/Favicon qua Branding
4. Dùng bench console cho batch setup nếu cần:

bench --site your-site.com console
>>> s = frappe.get_single("LMS Settings")
>>> s.allow_guest_access = 1
>>> s.courses = 1
>>> s.batches = 1
>>> s.jobs = 0
>>> s.programming_exercises = 0
>>> s.meta_description = "LMS Trường ABC"
>>> s.save()
>>> frappe.db.commit()
```

### 🎯 Tình huống 2: "Đang chạy production, cần sửa nhỏ"

> **Dùng: 🅰️ Desk UI** (qua LMS Settings hoặc /app/lms-settings)

Lý do: An toàn, nhanh, không cần restart.

### 🎯 Tình huống 3: "Deploy lên server mới, muốn config giống server cũ"

> **Dùng: 🅲 Code (Fixtures)**

```bash
# Server cũ: Export config
bench --site old-site.com export-fixtures

# Commit file fixtures vào Git
git add lms/fixtures/
git commit -m "chore: export LMS Settings fixtures"

# Server mới: Import config
bench --site new-site.com migrate  # Tự động import fixtures
```

### 🎯 Tình huống 4: "Cần thêm settings field mới (customization)"

> **Dùng: 🅲 Code**

Sửa `lms_settings.json` → thêm field → `bench migrate`

### 🎯 Tình huống 5: "Automation / CI/CD pipeline"

> **Dùng: 🅱️ Database (Bench Console Script)**

Tạo file `scripts/setup-config.py`:
```python
#!/usr/bin/env python3
"""Script cấu hình LMS Settings cho production."""
import frappe

def setup():
    s = frappe.get_single("LMS Settings")
    s.allow_guest_access = 1
    s.disable_signup = 0
    s.courses = 1
    s.batches = 1
    s.jobs = 0
    s.statistics = 1
    s.ai_grading = 0
    s.meta_description = "Hệ thống quản lý học tập trực tuyến"
    s.save()
    frappe.db.commit()
    print("✅ LMS Settings configured for production")
```

Chạy:
```bash
bench --site your-site.com run-script scripts/setup-config.py
```

---

## 6. Checklist Cấu hình Trước khi cho User dùng

### Bắt buộc ❗

- [ ] **Branding**: Upload logo trường + favicon
- [ ] **SEO**: Điền meta description, keywords, image
- [ ] **Contact**: Nhập email liên hệ
- [ ] **Guest Access**: Quyết định cho guest xem hay bắt login
- [ ] **Signup**: Bật/tắt đăng ký tự do
- [ ] **Sidebar**: Ẩn menu không cần thiết (Jobs, Programming Exercises...)

### Khuyến nghị 📋

- [ ] **Email Templates**: Tạo templates cho batch confirmation, certification
- [ ] **PWA**: Quyết định bật/tắt Progressive Web App
- [ ] **Notifications**: Cấu hình gửi thông báo khi publish course/batch
- [ ] **Categories**: Tạo danh mục khóa học

### Chỉ khi cần 🔧

- [ ] **Payment Gateway**: Chỉ cần nếu bán khóa học
- [ ] **Zoom Accounts**: Chỉ cần nếu dạy live
- [ ] **Unsplash API Key**: Chỉ cần nếu muốn ảnh cover đẹp
- [ ] **LiveCode URL**: Chỉ cần nếu dạy lập trình

---

## Tóm tắt Quick Reference

```
┌──────────────────────────────────────────────────────────┐
│                 NÊN DÙNG CÁCH NÀO?                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Admin thường ngày    →  🅰️ Desk UI                      │
│  Setup lần đầu       →  🅰️ UI + 🅱️ Bench Console       │
│  Automation/CI        →  🅱️ Bench Console Script        │
│  Clone sang server   →  🅲 Code Fixtures                │
│  Thêm feature mới    →  🅲 Sửa Code                    │
│                                                          │
│  ⚠️ TRÁNH dùng SQL trực tiếp trừ khi biết mình làm gì! │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

*Tài liệu này là companion cho [deploy.md](./deploy.md). Tham khảo thêm tại [Frappe Documentation](https://docs.frappe.io).*
