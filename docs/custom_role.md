# Hệ Thống Phân Quyền LMS - Hướng Dẫn Custom Role

> **Tài liệu này** mô tả chi tiết hệ thống phân quyền (Role & Permission) trong LMS app,
> cách custom từng role trong code, và cách quản lý qua UI trên Frappe.

---

## 1. Tổng Quan Kiến Trúc Phân Quyền

Hệ thống phân quyền LMS được xây dựng trên nền tảng Frappe Framework, hoạt động theo mô hình:

```
User → Has Role (child table) → Role → DocType Permissions → CRUD operations
```

### Các tầng kiểm soát quyền:

| Tầng | Mô tả | Nơi cấu hình |
|------|--------|---------------|
| **DocType Permission** | Quyền CRUD trên từng DocType theo Role | File `*.json` trong mỗi doctype |
| **API Permission** | Giới hạn truy cập API endpoint | `frappe.only_for()` trong Python |
| **Business Logic** | Kiểm tra quyền theo logic nghiệp vụ | Helper functions trong `utils.py` |
| **Frontend Guard** | Ẩn/hiện UI dựa trên role | Vue components kiểm tra `$user.data` |

---

## 2. Danh Sách Tất Cả Roles Trong Hệ Thống

### 2.1. Roles do LMS tự tạo (Custom Roles)

| Role | Mô tả | Desk Access | Tạo tại |
|------|--------|-------------|---------|
| **Moderator** | Quản trị viên LMS, quyền cao nhất (sau System Manager) | ❌ | `lms/install.py` → `create_moderator_role()` |
| **Course Creator** | Người tạo/quản lý khóa học | ❌ | `lms/install.py` → `create_course_creator_role()` |
| **Batch Evaluator** | Người chấm điểm, đánh giá học viên | ❌ | `lms/install.py` → `create_evaluator_role()` |
| **LMS Student** | Học viên, role mặc định khi đăng ký | ❌ | `lms/install.py` → `create_lms_student_role()` |

### 2.2. Roles từ Frappe Framework (System Roles)

| Role | Mô tả |
|------|--------|
| **System Manager** | Quản trị hệ thống, quyền cao nhất tuyệt đối |
| **Administrator** | Super user, bypass tất cả kiểm tra quyền |
| **Guest** | Người dùng chưa đăng nhập |
| **All** | Tất cả user đã đăng nhập |

### 2.3. Thứ Tự Ưu Tiên Role (Hierarchy)

```
Administrator (bypass all)
    └── System Manager (full system access)
        └── Moderator (LMS admin - quản lý toàn bộ LMS)
            ├── Course Creator (tạo/sửa khóa học)
            ├── Batch Evaluator (chấm điểm/đánh giá)
            └── LMS Student (học viên - quyền thấp nhất)
```

---

## 3. Chi Tiết Quyền Của Từng Role

### 3.1. Moderator (Quản trị viên LMS)

**Quyền DocType:**
| DocType | Read | Write | Create | Delete |
|---------|------|-------|--------|--------|
| LMS Course | ✅ | ✅ | ✅ | ✅ |
| LMS Batch | ✅ | ✅ | ✅ | ✅ |
| LMS Quiz | ✅ | ✅ | ✅ | ✅ |
| LMS Assignment | ✅ | ✅ | ✅ | ✅ |
| LMS Certificate | ✅ | ✅ | ✅ | ✅ |
| LMS Settings | ✅ | ✅ | - | - |
| Course Lesson | ✅ | ✅ | ✅ | ✅ |
| LMS Badge | ✅ | ✅ | ✅ | ✅ |
| Tất cả DocType khác | ✅ | ✅ | ✅ | ✅ |

**Quyền API (frappe.only_for):**
- `save_role()` - Gán/xóa role cho user
- `add_an_evaluator()` - Thêm evaluator mới
- `get_members()` - Xem danh sách thành viên
- `update_sidebar_item()` / `delete_sidebar_item()` - Quản lý sidebar
- `delete_documents()` - Xóa document
- `get_payment_gateway_details()` - Xem cổng thanh toán
- `save_evaluation_details()` - Lưu đánh giá
- `save_certificate_details()` - Cấp chứng chỉ
- Và nhiều API quản trị khác...

**Logic nghiệp vụ:**
- `can_modify_course()` → Moderator LUÔN được phép sửa khóa học
- `can_modify_batch()` → Moderator LUÔN được phép sửa batch
- `validate_course_access()` → Moderator bypass kiểm tra truy cập

---

### 3.2. Course Creator (Người tạo khóa học)

**Quyền DocType:**
| DocType | Read | Write | Create | Delete |
|---------|------|-------|--------|--------|
| LMS Course | ✅ | ✅ | ✅ | ✅ |
| Course Lesson | ✅ | ✅ | ✅ | ✅ |
| Course Chapter | ✅ | ✅ | ✅ | ✅ |
| LMS Quiz | ✅ | ✅ | ✅ | - |
| LMS Assignment | ✅ | ✅ | ✅ | - |
| LMS Certificate | ✅ | ✅ | ✅ | - |

**Quyền API:**
- `get_all_users()` - Xem danh sách user
- `get_lesson_creation_details()` - Tạo/sửa bài học
- `save_lesson()` - Lưu nội dung bài học

**Giới hạn:**
- Chỉ sửa được khóa học mình là instructor (kiểm tra qua `can_modify_course()`)
- KHÔNG thể gán role cho user khác
- KHÔNG thể quản lý settings

---

### 3.3. Batch Evaluator (Người chấm điểm)

**Quyền DocType:**
| DocType | Read | Write | Create | Delete |
|---------|------|-------|--------|--------|
| LMS Certificate | ✅ | ✅ | ✅ | - |
| LMS Certificate Request | ✅ | ✅ | - | - |
| Course Evaluator | ✅ | ✅ | ✅ | - |
| LMS Assignment Submission | ✅ | ✅ | - | - |
| LMS Programming Exercise | ✅ | - | - | - |

**Quyền API:**
- `get_evaluator_details()` - Xem thông tin evaluator
- `save_evaluation_details()` - Lưu kết quả đánh giá
- `save_certificate_details()` - Cấp chứng chỉ
- `get_all_users()` - Xem danh sách user
- `get_roles()` - Xem role của user

---

### 3.4. LMS Student (Học viên)

**Quyền DocType:**
| DocType | Read | Write | Create | Delete |
|---------|------|-------|--------|--------|
| LMS Course | ✅ (public only) | - | - | - |
| Course Lesson | ✅ (enrolled) | - | - | - |
| LMS Quiz Submission | ✅ (own) | ✅ (own) | ✅ | - |
| LMS Assignment Submission | ✅ (own) | ✅ (own) | ✅ | - |
| LMS Certificate | ✅ (own) | - | - | - |
| User Skill | ✅ | ✅ | ✅ | - |
| LMS Lesson Note | ✅ (own) | ✅ (own) | ✅ | - |

**Giới hạn:**
- Chỉ xem được khóa học đã publish
- Chỉ truy cập bài học khi đã enroll
- Không thể sửa nội dung khóa học

---

## 4. Custom Role Trong Code

### 4.1. Tạo Role Mới

**Bước 1: Định nghĩa role trong `install.py`**

File: `lms/install.py`

```python
# Thêm vào function create_lms_roles()
def create_lms_roles():
    create_course_creator_role()
    create_moderator_role()
    create_evaluator_role()
    create_lms_student_role()
    create_custom_role()  # ← Thêm role mới

# Tạo function mới
def create_custom_role():
    """Ví dụ: Tạo role 'Content Reviewer' - người duyệt nội dung"""
    if frappe.db.exists("Role", "Content Reviewer"):
        frappe.db.set_value("Role", "Content Reviewer", "desk_access", 0)
    else:
        role = frappe.new_doc("Role")
        role.update({
            "role_name": "Content Reviewer",
            "home_page": "",
            "desk_access": 0,  # 0 = không truy cập Frappe Desk
        })
        role.save()
```

**Bước 2: Gán role mới cho admin**

File: `lms/install.py` → function `give_lms_roles_to_admin()`

```python
def give_lms_roles_to_admin():
    roles = ["Course Creator", "Moderator", "Batch Evaluator", "Content Reviewer"]  # ← Thêm vào
    for role in roles:
        if not frappe.db.exists("Has Role", {"parent": "Administrator", "role": role}):
            doc = frappe.new_doc("Has Role")
            doc.parent = "Administrator"
            doc.parenttype = "User"
            doc.parentfield = "roles"
            doc.role = role
            doc.save()
```

**Bước 3: Đăng ký xóa role khi uninstall (tùy chọn)**

File: `lms/install.py` → function `delete_lms_roles()`

```python
def delete_lms_roles():
    roles = ["Course Creator", "Moderator", "Content Reviewer"]  # ← Thêm vào
    for role in roles:
        if frappe.db.exists("Role", role):
            frappe.db.delete("Role", role)
```

---

### 4.2. Gán Permission Cho DocType

**Cách 1: Sửa file JSON của DocType**

File: `lms/lms/doctype/lms_course/lms_course.json` → phần `"permissions"`

```json
{
  "permissions": [
    {
      "role": "System Manager",
      "read": 1, "write": 1, "create": 1, "delete": 1,
      "email": 1, "export": 1, "print": 1, "report": 1, "share": 1
    },
    {
      "role": "Course Creator",
      "read": 1, "write": 1, "create": 1, "delete": 1,
      "email": 1, "export": 1, "import": 1, "print": 1, "report": 1, "share": 1
    },
    {
      "role": "Moderator",
      "read": 1, "write": 1, "create": 1, "delete": 1,
      "email": 1, "export": 1, "import": 1, "print": 1, "report": 1, "share": 1
    },
    {
      "role": "Content Reviewer",
      "read": 1, "write": 0, "create": 0, "delete": 0,
      "email": 0, "export": 1, "print": 1, "report": 1, "share": 0
    }
  ]
}
```

> ⚠️ **Lưu ý**: Sau khi sửa file JSON, cần chạy `bench migrate` để áp dụng.

**Các permission flag có thể set:**

| Flag | Ý nghĩa |
|------|---------|
| `read` | Xem document |
| `write` | Sửa document |
| `create` | Tạo mới document |
| `delete` | Xóa document |
| `submit` | Submit document (cho doctype có workflow) |
| `cancel` | Cancel document |
| `amend` | Amend (sửa bản đã submit) |
| `report` | Xem report |
| `export` | Export data |
| `import` | Import data |
| `share` | Chia sẻ document |
| `print` | In document |
| `email` | Gửi email từ document |
| `if_owner` | Chỉ áp dụng nếu user là owner (kết hợp với flag khác) |
| `permlevel` | Cấp độ field-level permission (0, 1, 2...) |

---

### 4.3. Bảo Vệ API Endpoint

**Cách 1: Dùng `frappe.only_for()` (RECOMMENDED)**

File: `lms/lms/api.py`

```python
@frappe.whitelist()
def review_course_content(course, status, comment):
    """Chỉ Content Reviewer mới được duyệt nội dung"""
    frappe.only_for(["Content Reviewer", "Moderator"])
    # logic xử lý...
    frappe.db.set_value("LMS Course", course, "review_status", status)
    return {"success": True}
```

**Cách 2: Dùng `frappe.only_for()` với nhiều role**

```python
@frappe.whitelist()
def manage_batch_students(batch, action, student):
    """Moderator HOẶC Batch Evaluator mới được quản lý học viên"""
    frappe.only_for(["Moderator", "Batch Evaluator"])
    # logic xử lý...
```

**Cách 3: Kiểm tra role thủ công (cho logic phức tạp)**

```python
@frappe.whitelist()
def get_dashboard_data():
    roles = frappe.get_roles()
    
    data = {}
    if "Moderator" in roles or "System Manager" in roles:
        # Admin view - xem tất cả
        data["all_courses"] = frappe.db.count("LMS Course")
        data["all_students"] = frappe.db.count("User", {"enabled": 1})
    elif "Course Creator" in roles:
        # Instructor view - chỉ xem khóa học của mình
        data["my_courses"] = frappe.db.count(
            "Course Instructor",
            {"instructor": frappe.session.user}
        )
    elif "Content Reviewer" in roles:
        # Reviewer view - xem khóa học cần duyệt
        data["pending_reviews"] = frappe.db.count(
            "LMS Course", {"review_status": "Pending"}
        )
    else:
        # Student view
        data["enrolled"] = frappe.db.count(
            "LMS Enrollment", {"member": frappe.session.user}
        )
    
    return data
```

---

### 4.4. Tạo Helper Function Cho Role Mới

File: `lms/lms/utils.py`

```python
# ==========================================
# Role Helper Functions
# ==========================================

def has_moderator_role(member=None):
    return frappe.db.get_value(
        "Has Role",
        {"parent": member or frappe.session.user, "role": "Moderator"},
        "name",
    )

def has_course_instructor_role(member=None):
    return frappe.db.get_value(
        "Has Role",
        {"parent": member or frappe.session.user, "role": "Course Creator"},
        "name",
    )

def has_evaluator_role(member=None):
    return frappe.db.get_value(
        "Has Role",
        {"parent": member or frappe.session.user, "role": "Batch Evaluator"},
        "name",
    )

def has_student_role(member=None):
    return frappe.db.get_value(
        "Has Role",
        {"parent": member or frappe.session.user, "role": "LMS Student"},
        "name",
    )

# ← THÊM ROLE MỚI
def has_content_reviewer_role(member=None):
    """Kiểm tra user có role Content Reviewer không"""
    return frappe.db.get_value(
        "Has Role",
        {"parent": member or frappe.session.user, "role": "Content Reviewer"},
        "name",
    )
```

---

### 4.5. Cập Nhật `get_user_info()` API

File: `lms/lms/api.py` → function `get_user_info()`

```python
@frappe.whitelist()
def get_user_info():
    if frappe.session.user == "Guest":
        return None

    user = frappe.db.get_value(
        "User",
        frappe.session.user,
        ["name", "email", "enabled", "user_image", "full_name", "user_type", "username"],
        as_dict=1,
    )
    user["roles"] = frappe.get_roles(user.name)
    user.is_instructor = "Course Creator" in user.roles
    user.is_moderator = "Moderator" in user.roles
    user.is_evaluator = "Batch Evaluator" in user.roles
    user.is_content_reviewer = "Content Reviewer" in user.roles    # ← THÊM
    user.is_student = (
        not user.is_instructor
        and not user.is_moderator
        and not user.is_evaluator
        and not user.is_content_reviewer                           # ← THÊM
    )
    user.is_system_manager = "System Manager" in user.roles
    # ...
    return user
```

---

### 4.6. Cập Nhật `get_roles()` và `save_role()` API

File: `lms/lms/utils.py`

```python
@frappe.whitelist()
def get_roles(name):
    frappe.only_for(["Moderator", "Batch Evaluator"])
    return {
        "moderator": has_moderator_role(name),
        "course_creator": has_course_instructor_role(name),
        "batch_evaluator": has_evaluator_role(name),
        "lms_student": has_student_role(name),
        "content_reviewer": has_content_reviewer_role(name),  # ← THÊM
    }
```

File: `lms/lms/api.py` → `save_role()` (không cần sửa, đã generic):

```python
@frappe.whitelist()
def save_role(user, role, value):
    frappe.only_for("Moderator")
    if cint(value):
        doc = frappe.get_doc({
            "doctype": "Has Role",
            "parent": user,
            "role": role,           # ← Nhận bất kỳ role name nào
            "parenttype": "User",
            "parentfield": "roles",
        })
        doc.save(ignore_permissions=True)
    else:
        frappe.db.delete("Has Role", {"parent": user, "role": role})
    frappe.clear_cache(user=user)
    return True
```

---

### 4.7. Cập Nhật `check_app_permission()`

File: `lms/lms/api.py`

```python
def check_app_permission():
    """Check if the user has permission to access the app."""
    if frappe.session.user == "Administrator":
        return True

    roles = frappe.get_roles()
    lms_roles = [
        "Moderator",
        "Course Creator",
        "Batch Evaluator",
        "LMS Student",
        "Content Reviewer",    # ← THÊM
    ]
    if any(role in roles for role in lms_roles):
        return True

    return False
```

---

### 4.8. Cập Nhật Frontend (Vue)

**File: `frontend/src/pages/ProfileRoles.vue`**

```vue
<template>
  <div class="mt-7">
    <h2 class="mb-3 text-lg font-semibold text-ink-gray-9">
      {{ __('Settings') }}
    </h2>
    <div v-if="readOnlyMode" class="...">
      <!-- read-only message -->
    </div>
    <div v-else class="flex flex-col md:flex-row gap-4 md:gap-0 justify-between w-3/4 mt-5">
      <FormControl
        :label="__('Moderator')"
        v-model="moderator"
        type="checkbox"
        @change.stop="changeRole('moderator')"
      />
      <FormControl
        :label="__('Course Creator')"
        v-model="course_creator"
        type="checkbox"
        @change.stop="changeRole('course_creator')"
      />
      <FormControl
        :label="__('Evaluator')"
        v-model="batch_evaluator"
        type="checkbox"
        @change.stop="changeRole('batch_evaluator')"
      />
      <FormControl
        :label="__('Student')"
        v-model="lms_student"
        type="checkbox"
        @change.stop="changeRole('lms_student')"
      />
      <!-- ← THÊM ROLE MỚI -->
      <FormControl
        :label="__('Content Reviewer')"
        v-model="content_reviewer"
        type="checkbox"
        @change.stop="changeRole('content_reviewer')"
      />
    </div>
  </div>
</template>

<script setup>
// Thêm ref mới
const content_reviewer = ref(false)

// Cập nhật roles list trong onSuccess
const roles = createResource({
  url: 'lms.lms.utils.get_roles',
  // ...
  onSuccess(data) {
    let roles = [
      'moderator',
      'course_creator',
      'batch_evaluator',
      'lms_student',
      'content_reviewer',  // ← THÊM
    ]
    for (let role of roles) {
      if (data[role]) eval(role).value = true
    }
  },
})

// changeRole() đã generic, không cần sửa
// Nó tự convert 'content_reviewer' → 'Content Reviewer'
</script>
```

---

## 5. Custom Role Trên UI (Frappe Admin)

### 5.1. Tạo Role Mới qua UI

1. Đăng nhập **Frappe Desk** (Administrator)
2. Truy cập URL: `/app/role/new`
3. Điền thông tin:
   - **Role Name**: `Content Reviewer`
   - **Desk Access**: ❌ (uncheck - vì LMS dùng frontend riêng)
   - **Home Page**: để trống
4. Click **Save**

### 5.2. Gán Permission cho DocType qua UI

1. Truy cập URL: `/app/doctype/LMS Course`
2. Scroll xuống phần **Permission Rules**
3. Click **Add Row**
4. Chọn Role: `Content Reviewer`
5. Tick các quyền: Read ✅, Write ❌, Create ❌, Delete ❌
6. Click **Save**

> ⚠️ **Lưu ý**: Permission thay đổi qua UI sẽ lưu dưới dạng **Custom Permission** 
> (bảng `Custom DocPerm`), KHÔNG sửa file JSON gốc. 
> Điều này có nghĩa là khi chạy `bench migrate` hoặc update app, 
> custom permissions sẽ KHÔNG bị ghi đè.

### 5.3. Gán Role cho User qua UI

1. Truy cập URL: `/app/user/{email}`
2. Scroll xuống phần **Roles**
3. Click **Add Row**
4. Chọn role cần gán (ví dụ: `Content Reviewer`)
5. Click **Save**

### 5.4. Quản Lý Role qua LMS Frontend

1. Đăng nhập LMS với tài khoản Moderator
2. Vào **Settings** → **Members**
3. Click vào user cần thay đổi role
4. Vào tab **Roles**
5. Toggle các checkbox để bật/tắt role

> 💡 Tính năng này sử dụng API `lms.lms.api.save_role` → chỉ user có role 
> **Moderator** mới có quyền thay đổi role của người khác.

---

## 6. So Sánh: Custom Qua Code vs Qua UI

| Tiêu chí | Code (JSON/Python) | UI (Frappe Admin) |
|----------|--------------------|--------------------|
| **Persistence** | Lưu trong source code, version controlled | Lưu trong DB (Custom DocPerm) |
| **Migrate-safe** | Bị overwrite khi `bench migrate` nếu sửa JSON gốc | KHÔNG bị overwrite |
| **Portability** | Deploy cùng app | Cần export/import qua fixtures |
| **Khi nào dùng** | Role là phần core của app | Custom riêng cho từng site |
| **Khuyến nghị** | ✅ Cho development | ✅ Cho production customization |

---

## 7. Checklist Khi Tạo Role Mới

### Nếu custom qua CODE:

- [ ] **1. Tạo Role** → Thêm function trong `lms/install.py`
- [ ] **2. Đăng ký trong `create_lms_roles()`** → Gọi function mới
- [ ] **3. Gán cho Admin** → Thêm vào `give_lms_roles_to_admin()`
- [ ] **4. Đăng ký xóa** → Thêm vào `delete_lms_roles()` (nếu cần)
- [ ] **5. Tạo Helper function** → Thêm `has_xxx_role()` trong `utils.py`
- [ ] **6. Gán DocType Permission** → Sửa file `.json` của các doctype liên quan
- [ ] **7. Bảo vệ API** → Thêm `frappe.only_for()` vào các endpoint cần thiết
- [ ] **8. Cập nhật `get_user_info()`** → Thêm flag `is_xxx` trong `api.py`
- [ ] **9. Cập nhật `get_roles()`** → Thêm role vào response trong `utils.py`
- [ ] **10. Cập nhật `check_app_permission()`** → Thêm role vào danh sách cho phép
- [ ] **11. Cập nhật Frontend** → Thêm checkbox trong `ProfileRoles.vue`
- [ ] **12. Chạy `bench migrate`** → Áp dụng thay đổi permission

### Nếu custom qua UI:

- [ ] **1. Tạo Role** → `/app/role/new`
- [ ] **2. Gán Permission** → Sửa permission trong DocType hoặc dùng Role Permission Manager
- [ ] **3. Gán cho User** → Sửa User document hoặc dùng LMS Frontend
- [ ] **4. Test** → Đăng nhập bằng user có role mới, kiểm tra quyền

---

## 8. Ví dụ Thực Tế: Tạo Role "Teaching Assistant"

### Mục tiêu:
- Xem được tất cả khóa học
- Xem được bài nộp của học viên
- Chấm điểm assignment
- KHÔNG được tạo/xóa khóa học
- KHÔNG được quản lý user/settings

### Bước 1: Tạo Role

```python
# lms/install.py
def create_teaching_assistant_role():
    if frappe.db.exists("Role", "Teaching Assistant"):
        frappe.db.set_value("Role", "Teaching Assistant", "desk_access", 0)
    else:
        role = frappe.new_doc("Role")
        role.update({
            "role_name": "Teaching Assistant",
            "home_page": "",
            "desk_access": 0,
        })
        role.save()
```

### Bước 2: Gán Permission

```json
// Thêm vào lms_course.json → permissions
{
  "role": "Teaching Assistant",
  "read": 1,
  "write": 0,
  "create": 0,
  "delete": 0,
  "export": 1,
  "print": 1,
  "report": 1
}

// Thêm vào lms_assignment_submission.json → permissions
{
  "role": "Teaching Assistant",
  "read": 1,
  "write": 1,
  "create": 0,
  "delete": 0
}
```

### Bước 3: Helper Function

```python
# lms/lms/utils.py
def has_teaching_assistant_role(member=None):
    return frappe.db.get_value(
        "Has Role",
        {"parent": member or frappe.session.user, "role": "Teaching Assistant"},
        "name",
    )
```

### Bước 4: Bảo Vệ API

```python
# lms/lms/api.py
@frappe.whitelist()
def grade_assignment(submission, grade, feedback):
    """TA, Evaluator, hoặc Moderator mới được chấm điểm"""
    frappe.only_for(["Teaching Assistant", "Batch Evaluator", "Moderator"])

    frappe.db.set_value("LMS Assignment Submission", submission, {
        "grade": grade,
        "feedback": feedback,
        "status": "Graded",
    })
    return {"success": True}
```

### Bước 5: Cập Nhật Frontend

```javascript
// Trong component kiểm tra quyền
const canGrade = computed(() => {
  const roles = $user.data?.roles || []
  return roles.includes('Teaching Assistant') ||
         roles.includes('Batch Evaluator') ||
         roles.includes('Moderator')
})
```

### Bước 6: Apply

```bash
cd ~/frappe-bench
bench --site your-site.local migrate
bench --site your-site.local clear-cache
```

---

## 9. Lưu Ý Quan Trọng

### 9.1. Security Best Practices

1. **LUÔN kiểm tra quyền ở backend** - Frontend chỉ ẩn UI, không bảo mật thực sự
2. **Dùng `frappe.only_for()`** cho mọi API endpoint nhạy cảm
3. **Dùng `if_owner`** khi student chỉ nên xem document của chính mình
4. **Clear cache** sau khi thay đổi role: `frappe.clear_cache(user=user_email)`

### 9.2. Common Patterns Trong Codebase

```python
# Pattern 1: frappe.only_for() - raise PermissionError nếu không có role
frappe.only_for("Moderator")

# Pattern 2: Kiểm tra thủ công bằng frappe.get_roles()
roles = frappe.get_roles()
if "Moderator" in roles:
    # admin logic

# Pattern 3: Helper function từ utils.py
from lms.lms.utils import has_moderator_role
if has_moderator_role():
    # moderator logic

# Pattern 4: Frontend check
# $user.data.is_moderator (flag set in get_user_info)
# $user.data.roles.includes('Moderator') (check roles array)
```

### 9.3. File Locations Tham Khảo

| File | Vai trò |
|------|---------|
| `lms/install.py` | Tạo/xóa Role khi cài đặt |
| `lms/hooks.py` | Config `has_permission`, fixtures |
| `lms/lms/utils.py` | Helper functions: `has_xxx_role()`, `can_modify_xxx()` |
| `lms/lms/api.py` | API endpoints với `frappe.only_for()` |
| `lms/lms/doctype/*/xxx.json` | DocType permission rules |
| `frontend/src/pages/ProfileRoles.vue` | UI quản lý role |
| `frontend/src/components/Settings/Members.vue` | UI danh sách members |

---

## 10. Các Lệnh Bench Hữu Ích

```bash
# Áp dụng thay đổi permission sau khi sửa JSON
bench --site your-site.local migrate

# Xóa cache sau khi thay đổi role
bench --site your-site.local clear-cache

# Xem danh sách role hiện có
bench --site your-site.local console
>>> frappe.get_all("Role", pluck="name")

# Xem quyền của 1 user
bench --site your-site.local console
>>> frappe.get_roles("user@example.com")

# Gán role cho user qua console
bench --site your-site.local console
>>> user = frappe.get_doc("User", "user@example.com")
>>> user.add_roles("Content Reviewer")

# Xóa role khỏi user
bench --site your-site.local console
>>> user = frappe.get_doc("User", "user@example.com")
>>> user.remove_roles("Content Reviewer")

# Xem permission của 1 DocType cho 1 role
bench --site your-site.local console
>>> frappe.get_all("DocPerm",
...     filters={"parent": "LMS Course", "role": "Content Reviewer"},
...     fields=["*"],
... )

# Reset permissions về mặc định (từ JSON)
bench --site your-site.local console
>>> frappe.permissions.reset_perms("LMS Course")
```
