# 🔐 Đăng nhập bên thứ 3 — Google OAuth & Social Login

> **Dành cho**: Admin/Developer triển khai Frappe LMS  
> **Cập nhật**: 2026-04-05  
> **Phạm vi**: Cơ chế hoạt động, lưu trữ trong code, và 2 kế hoạch deploy tự động

---

## Mục lục

1. [Tổng quan hệ thống đăng nhập](#1-tổng-quan-hệ-thống-đăng-nhập)
2. [Cơ chế hoạt động chi tiết](#2-cơ-chế-hoạt-động-chi-tiết)
3. [Lưu trữ trong code — nơi nào xử lý gì](#3-lưu-trữ-trong-code)
4. [Database lưu trữ như thế nào](#4-database-lưu-trữ-như-thế-nào)
5. [Kế hoạch 1: Script tự động qua Bench Console](#kế-hoạch-1-script-tự-động-qua-bench-console)
6. [Kế hoạch 2: Fixtures — Deploy lên cloud không cần config tay](#kế-hoạch-2-fixtures--deploy-lên-cloud-không-cần-config-tay)
7. [Cách lấy Google OAuth Credentials](#5-cách-lấy-google-oauth-credentials)
8. [Bảo mật & Lưu ý](#6-bảo-mật--lưu-ý)
9. [Troubleshooting](#7-troubleshooting)

---

## 1. Tổng quan Hệ thống Đăng nhập

Frappe LMS hỗ trợ **4 phương thức đăng nhập**:

```
┌─────────────────────────────────────────────────────┐
│                  Trang /login                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📧 Email + Password        ← Mặc định, luôn có    │
│                                                     │
│  🔗 Login with Email Link   ← Magic link (no pass)  │
│                                                     │
│  ─── hoặc tiếp tục với ──────────────────────        │
│                                                     │
│  🔵 Continue with Google    ← OAuth 2.0             │
│  ⬛ Continue with GitHub    ← OAuth 2.0             │
│  🔷 Continue with Facebook  ← OAuth 2.0             │
│  ...và các provider khác                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Các Social Login Provider được hỗ trợ sẵn

| Provider | Redirect URL | Trạng thái |
|---|---|---|
| **Google** | `/api/method/frappe.integrations.oauth2_logins.login_via_google` | ✅ Tích hợp sẵn |
| **GitHub** | `/api/method/frappe.integrations.oauth2_logins.login_via_github` | ✅ Tích hợp sẵn |
| **Facebook** | `/api/method/frappe.integrations.oauth2_logins.login_via_facebook` | ✅ Tích hợp sẵn |
| **Office 365** | `/api/method/frappe.integrations.oauth2_logins.login_via_office365` | ✅ Tích hợp sẵn |
| **Frappe** | `/api/method/frappe.integrations.oauth2_logins.login_via_frappe` | ✅ Tích hợp sẵn |
| **Salesforce** | `/api/method/frappe.integrations.oauth2_logins.login_via_salesforce` | ✅ Tích hợp sẵn |
| **Keycloak** | `/api/method/frappe.integrations.oauth2_logins.login_via_keycloak` | ✅ Tích hợp sẵn |
| **Custom** | `/api/method/frappe.integrations.oauth2_logins.custom/<name>` | ✅ Tuỳ chỉnh |

> **Quan trọng**: Tất cả đều dùng chuẩn **OAuth 2.0 Authorization Code Flow**. Frappe Framework đã xây dựng sẵn toàn bộ — LMS chỉ cần **bật** và **điền credentials**.

---

## 2. Cơ chế Hoạt động Chi tiết

### OAuth 2.0 Authorization Code Flow

```
User                    LMS Server              Google
 │                         │                       │
 │  1. Click "Continue     │                       │
 │     with Google"        │                       │
 │ ───────────────────►    │                       │
 │                         │                       │
 │  2. Redirect to Google  │                       │
 │ ◄───────────────────    │                       │
 │     (302 redirect)      │                       │
 │                         │                       │
 │  3. User đồng ý chia sẻ email/profile           │
 │ ────────────────────────────────────────────►    │
 │                         │                       │
 │  4. Google redirect lại với ?code=XXXXXX         │
 │ ◄────────────────────────────────────────────    │
 │  → /api/method/frappe.integrations.              │
 │    oauth2_logins.login_via_google                │
 │                         │                       │
 │                         │  5. Server đổi code    │
 │                         │     lấy access_token   │
 │                         │ ─────────────────►    │
 │                         │                       │
 │                         │  6. Google trả         │
 │                         │     access_token       │
 │                         │ ◄─────────────────    │
 │                         │                       │
 │                         │  7. Server dùng token  │
 │                         │     lấy email/profile  │
 │                         │ ─────────────────►    │
 │                         │                       │
 │                         │  8. Google trả         │
 │                         │     { email, name }    │
 │                         │ ◄─────────────────    │
 │                         │                       │
 │                         │  9. Tìm/tạo User      │
 │                         │     trong Frappe DB    │
 │                         │                       │
 │  10. Đặt session cookie │                       │
 │ ◄───────────────────    │                       │
 │  (sid=xxx, user_id=xxx) │                       │
 │                         │                       │
 │  11. Redirect về /lms   │                       │
 │ ◄───────────────────    │                       │
 │                         │                       │
 ▼ USER ĐĂNG NHẬP THÀNH CÔNG                      ▼
```

### Bước 9 chi tiết: Tìm/Tạo User

```python
# Frappe tự động xử lý:
# 1. Lấy email từ Google response
# 2. Kiểm tra User tồn tại trong DB:
#    - CÓ: Login luôn, set session
#    - KHÔNG: Tạo User mới (nếu sign_ups cho phép)
#      → User type: "Website User"
#      → Role: dựa vào Website Settings
#      → Full name: từ Google profile
```

---

## 3. Lưu trữ trong Code

### Kiến trúc file — Luồng xử lý từ frontend → backend

```
📂 apps/lms/
├── 📂 lms/
│   └── auth.py                              ← [1] ALLOWED_PATHS: whitelist OAuth URLs
│       Dòng 17-24: Cho phép các URL login_via_google, 
│                   login_via_github, v.v... bypass xác thực
│
📂 apps/frappe/frappe/
├── 📂 www/
│   └── login.py                             ← [2] Render trang /login
│       Dòng 67-97: Query "Social Login Key" từ DB
│                   → Render nút "Continue with Google" nếu enabled
│                   → Tạo authorize_url cho từng provider
│
├── 📂 integrations/
│   ├── oauth2_logins.py                     ← [3] Callback handlers
│   │   Dòng 12-13: login_via_google(code, state)
│   │               → Gọi login_via_oauth2("google", code, state)
│   │
│   └── 📂 doctype/social_login_key/
│       ├── social_login_key.json            ← [4] DB Schema
│       │   Fields: enable_social_login, client_id, client_secret,
│       │           authorize_url, access_token_url, redirect_url,
│       │           api_endpoint, sign_ups, ...
│       │
│       └── social_login_key.py              ← [5] Model logic
│           Dòng 150-167: Google preset config
│           {
│             base_url: "https://www.googleapis.com",
│             authorize_url: "https://accounts.google.com/o/oauth2/auth",
│             access_token_url: "https://accounts.google.com/o/oauth2/token",
│             redirect_url: "/api/method/frappe.integrations.oauth2_logins.login_via_google",
│             api_endpoint: "oauth2/v2/userinfo",
│             scope: "userinfo.profile userinfo.email"
│           }
│
├── 📂 utils/
│   └── oauth.py                             ← [6] OAuth utilities
│       → get_oauth2_authorize_url()        : Tạo Google authorize URL
│       → login_via_oauth2()                : Đổi code → token → user info → login
│       → get_oauth_keys()                  : Lấy client_id/secret từ DB
│       → redirect_post_login()             : Redirect sau login
│
└── 📂 templates/
    └── login.html                           ← [7] Template trang login
        → Render nút social login từ context["provider_logins"]
```

### Quan trọng: LMS auth.py whitelist

File `lms/auth.py` (dòng 17-24) **phải whitelist** các URL OAuth, nếu không Frappe sẽ block:

```python
ALLOWED_PATHS = [
    # ... các path khác ...
    "/api/method/frappe.www.login.login_via_google",
    "/api/method/frappe.www.login.login_via_github",
    "/api/method/frappe.www.login.login_via_facebook",
    "/api/method/frappe.www.login.login_via_frappe",
    "/api/method/frappe.www.login.login_via_office365",
    "/api/method/frappe.www.login.login_via_salesforce",
    "/api/method/frappe.www.login.login_via_fairlogin",
    "/api/method/frappe.www.login.login_via_keycloak",
    "/api/method/frappe.www.login.custom",
]
```

> ✅ **Đã có sẵn** — Không cần sửa gì thêm. LMS đã whitelist tất cả social login URLs.

---

## 4. Database Lưu trữ Như thế nào

### DocType: `Social Login Key`

Mỗi provider là **1 document** trong table `tabSocial Login Key`:

```sql
-- Xem tất cả Social Login Keys
SELECT name, provider_name, enable_social_login, client_id, 
       base_url, sign_ups
FROM `tabSocial Login Key`;

-- Kết quả ví dụ sau khi setup:
-- ┌────────┬───────────────┬─────────────────────┬──────────────┐
-- │ name   │ provider_name │ enable_social_login  │ client_id    │
-- ├────────┼───────────────┼─────────────────────┼──────────────┤
-- │ google │ Google        │ 1                   │ xxx.apps.goo │
-- │ github │ GitHub        │ 0                   │ NULL         │
-- └────────┴───────────────┴─────────────────────┴──────────────┘
```

### Nơi lưu Client Secret

```
Client Secret được mã hóa (encrypted) trong table `tabSocial Login Key`
→ field "client_secret" với fieldtype "Password"
→ Frappe encrypt bằng encryption_key trong site_config.json
→ KHÔNG BAO GIỜ lưu plaintext !
```

### User được tạo khi login bằng Google (lần đầu)

```sql
-- User mới sẽ được tạo trong tabUser:
INSERT INTO tabUser SET
  name = 'student@gmail.com',
  email = 'student@gmail.com',
  full_name = 'Nguyễn Văn A',        -- Từ Google profile
  user_type = 'Website User',         -- Mặc định cho social login
  enabled = 1;

-- Role mặc định:
INSERT INTO tabHas Role SET
  parent = 'student@gmail.com',
  role = 'LMS Student';               -- Frappe LMS tự gán
```

---

## 5. Cách lấy Google OAuth Credentials

> ⚠️ **Bước này bắt buộc** — Cần làm 1 lần trên Google Cloud Console

### Step-by-step

```
Bước 1: Truy cập Google Cloud Console
        → https://console.cloud.google.com/

Bước 2: Tạo Project mới (hoặc dùng project có sẵn)
        → "Select Project" → "New Project" → Đặt tên "LMS Auth"

Bước 3: Bật Google+ API (hoặc People API)
        → APIs & Services → Library
        → Tìm "Google+ API" hoặc "People API" → Enable

Bước 4: Tạo OAuth Consent Screen
        → APIs & Services → OAuth consent screen
        → User Type: "External"
        → App name: "LMS Trường ABC"
        → User support email: your-email
        → Authorized domains: yourdomain.com
        → Scopes: email, profile, openid
        → Save

Bước 5: Tạo OAuth 2.0 Credentials
        → APIs & Services → Credentials → Create Credentials
        → OAuth 2.0 Client IDs
        → Application type: "Web application"
        → Name: "LMS Login"
        → Authorized redirect URIs:
          https://lms.yourdomain.com/api/method/frappe.integrations.oauth2_logins.login_via_google

Bước 6: Copy credentials
        → Client ID:     xxxx.apps.googleusercontent.com
        → Client Secret: GOCSPX-xxxxxxxxxxxx
```

> **⚠️ Redirect URI phải chính xác!** Sai 1 ký tự → Google trả lỗi `redirect_uri_mismatch`

---

## Kế hoạch 1: Script tự động qua Bench Console

### Mô tả
Tạo 1 script Python chạy trên server sau khi deploy. Script tự động tạo/cập nhật `Social Login Key` cho Google — **không cần mở giao diện**.

### Ưu điểm
- ⚡ Nhanh, chạy 1 lệnh duy nhất
- 🔒 Client Secret truyền qua biến môi trường (không hardcode)
- 🔄 Có thể chạy lại nhiều lần (idempotent)
- ✅ Hoạt động trên mọi server (VPS, Docker, Frappe Cloud)

### Tạo file script

Tạo file `scripts/setup_google_login.py`:

```python
"""
Script tự động cấu hình Google OAuth cho Frappe LMS.
Chạy: bench --site <site_name> execute scripts.setup_google_login.setup

Yêu cầu biến môi trường:
  GOOGLE_CLIENT_ID     - Lấy từ Google Cloud Console
  GOOGLE_CLIENT_SECRET - Lấy từ Google Cloud Console
"""
import os
import frappe


def setup():
    # Lấy credentials từ biến môi trường
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")

    if not client_id or not client_secret:
        print("❌ ERROR: Thiếu biến môi trường GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET")
        print("   Chạy lại với:")
        print('   GOOGLE_CLIENT_ID="xxx" GOOGLE_CLIENT_SECRET="xxx" bench --site <site> execute scripts.setup_google_login.setup')
        return

    # Kiểm tra đã có Social Login Key cho Google chưa
    if frappe.db.exists("Social Login Key", "google"):
        # Cập nhật nếu đã tồn tại
        doc = frappe.get_doc("Social Login Key", "google")
        doc.enable_social_login = 1
        doc.client_id = client_id
        doc.client_secret = client_secret
        doc.sign_ups = "Allow"
        doc.save(ignore_permissions=True)
        print("✅ Đã CẬP NHẬT Google Social Login Key")
    else:
        # Tạo mới
        doc = frappe.new_doc("Social Login Key")
        doc.get_social_login_provider("Google", initialize=True)
        doc.client_id = client_id
        doc.client_secret = client_secret
        doc.sign_ups = "Allow"
        doc.save(ignore_permissions=True)
        print("✅ Đã TẠO MỚI Google Social Login Key")

    frappe.db.commit()

    # Xác nhận
    enabled = frappe.db.get_value("Social Login Key", "google", "enable_social_login")
    print(f"   Provider: Google")
    print(f"   Client ID: {client_id[:20]}...")
    print(f"   Enabled: {'✅ Yes' if enabled else '❌ No'}")
    print(f"   Sign ups: Allow")
    print(f"\n🎉 Trang /login bây giờ sẽ hiện nút 'Continue with Google'")
```

### Cách chạy

```bash
# 1. SSH vào server
ssh user@your-server

# 2. Copy script vào đúng thư mục
cp scripts/setup_google_login.py ~/frappe-bench/apps/lms/scripts/

# 3. Đặt biến môi trường và chạy
cd ~/frappe-bench

GOOGLE_CLIENT_ID="123456.apps.googleusercontent.com" \
GOOGLE_CLIENT_SECRET="GOCSPX-abcdef123456" \
bench --site lms.yourdomain.com execute lms.scripts.setup_google_login.setup

# Output:
# ✅ Đã TẠO MỚI Google Social Login Key
#    Provider: Google
#    Client ID: 123456.apps.googl...
#    Enabled: ✅ Yes
#    Sign ups: Allow
# 🎉 Trang /login bây giờ sẽ hiện nút 'Continue with Google'
```

### Tích hợp vào CI/CD

```yaml
# .github/workflows/deploy.yml (ví dụ)
- name: Setup Google Login
  run: |
    GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }} \
    GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }} \
    bench --site $SITE_NAME execute lms.scripts.setup_google_login.setup
```

---

## Kế hoạch 2: Fixtures — Deploy lên Cloud không cần config tay

### Mô tả
Dùng **Frappe Fixtures** để export/import config Google Login cùng với code. Khi deploy lên server mới, chỉ cần `bench migrate` — tự động tạo Social Login Key.

### Ưu điểm
- 📦 Config nằm trong Git — version control
- 🚀 Deploy hoàn toàn tự động (bench migrate tự import)
- 🔄 Reproducible — mọi server đều giống nhau
- 👥 Team review được config changes qua PR

### Step-by-step

#### Bước 1: Tạo file fixture

Tạo file `lms/fixtures/social_login_key.json`:

```json
[
  {
    "doctype": "Social Login Key",
    "name": "google",
    "provider_name": "Google",
    "social_login_provider": "Google",
    "enable_social_login": 1,
    "base_url": "https://www.googleapis.com",
    "custom_base_url": 0,
    "icon": "/assets/frappe/icons/social/google.svg",
    "authorize_url": "https://accounts.google.com/o/oauth2/auth",
    "access_token_url": "https://accounts.google.com/o/oauth2/token",
    "redirect_url": "/api/method/frappe.integrations.oauth2_logins.login_via_google",
    "api_endpoint": "oauth2/v2/userinfo",
    "auth_url_data": "{\"scope\": \"https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email\", \"response_type\": \"code\"}",
    "sign_ups": "Allow"
  }
]
```

> **⚠️ Lưu ý**: File fixture **KHÔNG chứa** `client_id` và `client_secret` vì lý do bảo mật (file này commit vào Git). Credentials sẽ được inject riêng.

#### Bước 2: Đăng ký fixture trong hooks.py

Sửa file `lms/hooks.py`:

```python
# Thêm vào section fixtures
fixtures = [
    {
        "dt": "Social Login Key",
        "filters": [["provider_name", "in", ["Google"]]]
    }
]
```

#### Bước 3: Tạo post-migrate script để inject credentials

Tạo file `lms/patches/inject_google_credentials.py`:

```python
"""
Inject Google OAuth credentials từ site_config.json sau khi migrate.
Credentials được đặt trong site_config, KHÔNG trong fixture file.
"""
import frappe

def execute():
    # Đọc credentials từ site_config.json (an toàn, không commit vào Git)
    google_client_id = frappe.conf.get("google_client_id")
    google_client_secret = frappe.conf.get("google_client_secret")

    if not google_client_id or not google_client_secret:
        print("⚠️  Google OAuth: Chưa có credentials trong site_config.json")
        print("   Thêm google_client_id và google_client_secret vào site_config.json")
        return

    if frappe.db.exists("Social Login Key", "google"):
        frappe.db.set_value("Social Login Key", "google", "client_id", google_client_id)
        # Dùng set_value cho Password field
        doc = frappe.get_doc("Social Login Key", "google")
        doc.client_secret = google_client_secret
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        print("✅ Google OAuth: Credentials injected thành công")
```

#### Bước 4: Cấu hình site_config.json trên server

```bash
# Trên server, thêm credentials vào site_config (chỉ 1 lần)
bench --site lms.yourdomain.com set-config google_client_id "123456.apps.googleusercontent.com"
bench --site lms.yourdomain.com set-config google_client_secret "GOCSPX-abcdef123456"
```

File `sites/lms.yourdomain.com/site_config.json` sẽ có:
```json
{
  "db_name": "xxx",
  "db_password": "xxx",
  "google_client_id": "123456.apps.googleusercontent.com",
  "google_client_secret": "GOCSPX-abcdef123456"
}
```

#### Bước 5: Deploy

```bash
# Lần đầu hoặc khi có code mới:
bench --site lms.yourdomain.com migrate
# → Fixture tự tạo Social Login Key
# → Patch tự inject credentials từ site_config

# KẾT QUẢ: Trang /login tự hiện nút "Continue with Google" 🎉
```

### Tổng kết flow Fixtures

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  fixture.json    │    │  site_config     │    │  bench migrate   │
│ (Git - No secret)│ +  │ (Server - Secret)│ →  │  = Auto setup!   │
│ • URLs           │    │ • client_id      │    │                  │
│ • Scopes         │    │ • client_secret  │    │  🎉 Done!        │
│ • Provider name  │    │                  │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## So sánh 2 Kế hoạch

| Tiêu chí | 🅰️ Script Console | 🅱️ Fixtures |
|---|---|---|
| **Độ khó** | ⭐ Rất dễ | ⭐⭐ Trung bình |
| **Tự động hóa** | ⚠️ Phải chạy script thủ công | ✅ Tự động khi `bench migrate` |
| **Git tracking** | ❌ Config không trong Git | ✅ Config (trừ secret) trong Git |
| **Nhiều server** | ❌ Chạy script trên mỗi server | ✅ Migrate 1 lần, tất cả đồng bộ |
| **Bảo mật secret** | ✅ Qua env vars | ✅ Qua site_config |
| **CI/CD** | ✅ Dễ tích hợp | ✅ Tích hợp tự nhiên |
| **Rollback** | ❌ Phải chạy script ngược | ✅ Git revert |
| **Phù hợp** | 1 server duy nhất | Nhiều môi trường (dev/staging/prod) |

### 🎯 Khuyến nghị

- **1 server duy nhất** (sinh viên, đồ án) → **Kế hoạch 1** (đơn giản hơn)
- **Nhiều môi trường / team** → **Kế hoạch 2** (chuyên nghiệp hơn)

---

## 6. Bảo mật & Lưu ý

### ✅ Những gì an toàn

- `client_secret` được **mã hóa** trong database (Frappe Password field)
- OAuth chỉ yêu cầu **email + profile** — KHÔNG truy cập Gmail, Drive, etc.
- Mọi redirect URL đều qua **HTTPS** (nếu đã cấu hình SSL)
- Frappe tự kiểm tra **state parameter** để chống CSRF
- User mới tự động được gán role `Website User` (quyền thấp nhất)

### ⚠️ Lưu ý quan trọng

| Vấn đề | Giải pháp |
|---|---|
| **KHÔNG bao giờ commit `client_secret` vào Git** | Dùng env vars hoặc site_config |
| **Redirect URI phải match chính xác** | Copy từ Google Console, bao gồm `https://` |
| **Google OAuth Consent Screen phải verified** | Nếu > 100 users, cần submit verification |
| **Site phải có HTTPS** | Google yêu cầu HTTPS cho production redirect URIs |
| **`sign_ups` nên là `Allow`** | Nếu không, chỉ User đã tồn tại mới login được |

### Lock down: Chỉ cho phép login bằng Google (tắt email/password)

```python
# Trong bench console:
# Tắt đăng nhập bằng email/password (chỉ dùng Google)
frappe.db.set_single_value("System Settings", "disable_user_pass_login", 1)
frappe.db.commit()

# LƯU Ý: Phải có ít nhất 1 Social Login Key enabled trước khi tắt!
```

---

## 7. Troubleshooting

### Lỗi thường gặp

#### ❌ "redirect_uri_mismatch"
```
Nguyên nhân: Redirect URI trong Google Console ≠ server URL
Fix: Kiểm tra lại Authorized redirect URIs trong Google Console
     Phải là: https://YOUR-DOMAIN/api/method/frappe.integrations.oauth2_logins.login_via_google
```

#### ❌ Nút "Continue with Google" không hiện
```
Nguyên nhân: Social Login Key chưa enabled hoặc thiếu client_secret
Fix: 
  bench --site <site> console
  >>> frappe.get_all("Social Login Key", fields=["name", "enable_social_login", "client_id"])
  # Kiểm tra enable_social_login = 1 và client_id có giá trị
```

#### ❌ "Access blocked: This app's request is invalid"
```
Nguyên nhân: OAuth Consent Screen chưa hoàn tất hoặc app chưa verify
Fix: Hoàn tất setup OAuth Consent Screen trên Google Cloud Console
     Thêm domain vào Authorized domains
```

#### ❌ User login bằng Google nhưng không vào LMS được
```
Nguyên nhân: User type là "Website User" nhưng thiếu role LMS
Fix:
  bench --site <site> console
  >>> user = frappe.get_doc("User", "student@gmail.com")
  >>> user.add_roles("LMS Student")
  >>> user.save()
  >>> frappe.db.commit()
```

#### ❌ Login thành công nhưng redirect về /app thay vì /lms
```
Nguyên nhân: redirect-to parameter không được set
Fix: User nên truy cập /login?redirect-to=/lms thay vì /login trực tiếp
     Hoặc bật "Make LMS the default home" trong LMS Settings
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│              SETUP GOOGLE LOGIN — 3 BƯỚC                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Lấy credentials từ Google Cloud Console             │
│     → console.cloud.google.com                          │
│     → Tạo OAuth 2.0 Client ID                          │
│     → Copy Client ID + Client Secret                    │
│                                                         │
│  2. Inject vào server (chọn 1 trong 2 cách):            │
│     🅰️ Script: bench execute + env vars                 │
│     🅱️ Fixtures: site_config + bench migrate            │
│                                                         │
│  3. Test: Truy cập /login → Click "Continue with Google"│
│                                                         │
│  ✅ Xong! Không cần sửa code, không cần restart.        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

*File này là companion cho [deploy.md](./deploy.md) và [config_instruction.md](./config_instruction.md). Tham khảo thêm tại [Frappe Social Login Documentation](https://docs.frappe.io/framework/user/en/social-login).*
