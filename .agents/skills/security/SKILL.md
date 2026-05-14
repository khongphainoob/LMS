# Security Skill — Frappe + MariaDB + Vue
> Checklist bảo mật cụ thể cho Frappe ecosystem.

## 1. Permission & Access Control

### Frappe Permission Model
```python
# Luôn check permission trước khi trả data
@frappe.whitelist()
def get_sensitive_data(docname: str) -> dict:
    # Level 0: check read permission
    frappe.has_permission("Purchase Order", doc=docname, throw=True)

    # Level 1: check custom role nếu cần
    if not frappe.has_role("Purchase Manager"):
        frappe.throw(_("Insufficient permissions"), frappe.PermissionError)

    # Level 2: check ownership nếu cần
    doc = frappe.get_doc("Purchase Order", docname)
    if doc.owner != frappe.session.user and not frappe.has_role("System Manager"):
        frappe.throw(_("You can only view your own orders"))

    return doc.as_dict()
```

### Guest API — luôn explicit
```python
# Chỉ allow guest khi thực sự cần (public form, webhook)
@frappe.whitelist(allow_guest=True)
def public_webhook(payload: str):
    # Validate token riêng — không tin tưởng caller
    token = frappe.request.headers.get("X-Webhook-Token")
    if not _verify_webhook_token(token):
        frappe.throw(_("Invalid token"), frappe.AuthenticationError)
```

---

## 2. SQL Injection Prevention

### Luôn dùng parameterized query
```python
# ✅ Đúng
frappe.db.sql(
    "SELECT name FROM `tabItem` WHERE item_group = %(group)s",
    {"group": item_group}
)

# ❌ Sai — SQL injection
frappe.db.sql(f"SELECT name FROM `tabItem` WHERE item_group = '{item_group}'")
frappe.db.sql("SELECT name FROM `tabItem` WHERE item_group = '%s'" % item_group)
```

### Filter với frappe.db.get_all — tự động safe
```python
# frappe.db.get_all tự escape filter values
frappe.db.get_all("Item", filters={"item_group": user_input})  # ✅ safe
```

### Dynamic field/table name — phải validate
```python
ALLOWED_DOCTYPES = {"Purchase Order", "Sales Invoice", "Item"}

def get_doc_count(doctype: str) -> int:
    if doctype not in ALLOWED_DOCTYPES:
        frappe.throw(_("Invalid DocType"), frappe.ValidationError)
    # Bây giờ mới dùng doctype trong query
    return frappe.db.count(doctype)
```

---

## 3. XSS Prevention

### Vue / Client side
```vue
<!-- ✅ Vue tự escape -->
<div>{{ userInput }}</div>

<!-- ❌ Chỉ dùng khi data đã được sanitize server-side -->
<div v-html="sanitizedContent"></div>
```

### Frappe Jinja template
```python
# ✅ Auto-escape trong Jinja
{{ doc.supplier_name }}

# ❌ Tắt escape — chỉ dùng cho trusted HTML
{{ doc.description | safe }}
```

### Sanitize HTML input từ user
```python
from frappe.utils import sanitize_html

def validate(self):
    if self.custom_description:
        self.custom_description = sanitize_html(self.custom_description)
```

---

## 4. CSRF Protection
- Frappe tự xử lý CSRF token cho tất cả POST requests từ desk
- Với custom Vue/Nuxt app: đảm bảo gửi `X-Frappe-CSRF-Token` header

```ts
// composables/useFrappeCall.ts
const csrfToken = () => (window as any).csrf_token || ''

await $fetch('/api/method/my_app.api.order_api.create_order', {
  method: 'POST',
  headers: { 'X-Frappe-CSRF-Token': csrfToken() },
  body: payload,
})
```

---

## 5. Sensitive Data Handling

### Không log sensitive data
```python
# ❌ Sai
frappe.logger().info(f"Processing payment for card {card_number}")

# ✅ Đúng
frappe.logger().info(f"Processing payment for order {order_id}")
```

### Mask data trong API response
```python
@frappe.whitelist()
def get_payment_info(order_id: str) -> dict:
    frappe.has_permission("Purchase Order", doc=order_id, throw=True)
    data = frappe.db.get_value("Payment Entry", {"reference_name": order_id},
        ["bank_account", "reference_no"], as_dict=True)
    if data:
        # Mask account number
        data["bank_account"] = "****" + data["bank_account"][-4:]
    return data or {}
```

### Environment variables — không hardcode secret
```python
# ❌ Sai
API_KEY = "sk-prod-abc123xyz"

# ✅ Đúng — lấy từ Frappe site config
api_key = frappe.conf.get("external_api_key")
# hoặc từ Custom DocType "App Settings"
api_key = frappe.db.get_single_value("My App Settings", "api_key")
```

---

## 6. File Upload Security
```python
@frappe.whitelist()
def upload_document(doctype: str, docname: str):
    # Validate doctype whitelist
    ALLOWED_DOCTYPES = {"Purchase Order", "Supplier"}
    if doctype not in ALLOWED_DOCTYPES:
        frappe.throw(_("Upload not allowed for this document type"))

    frappe.has_permission(doctype, doc=docname, ptype="write", throw=True)

    file_doc = frappe.get_doc({
        "doctype": "File",
        "attached_to_doctype": doctype,
        "attached_to_name": docname,
        "is_private": 1,  # mặc định private
    })
    file_doc.save()
```

---

## 7. Rate Limiting cho API Custom
```python
import frappe
from frappe.rate_limiter import rate_limit

@frappe.whitelist(allow_guest=True)
@rate_limit(key="ip", limit=10, seconds=60)  # 10 req/min per IP
def public_api_endpoint(data: str):
    ...
```

---

## Security Checklist trước khi deploy
- [ ] Tất cả `@frappe.whitelist()` endpoint đã check permission
- [ ] Không có raw SQL dùng string format
- [ ] Không có hardcoded credential/secret
- [ ] File upload validate MIME type và size
- [ ] Sensitive data không xuất hiện trong log
- [ ] `allow_guest=True` chỉ dùng cho endpoint thực sự public
- [ ] Custom Role được tạo đúng, không dùng "All" làm shortcut
