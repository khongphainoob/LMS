# Backend Skill — Frappe Python
> Áp dụng khi viết DocType controller, API endpoint, hook, scheduled job.

## ⚡ Codebase Context — LMS Backend

### Service Layer Pattern — `lms/lms/services/`
```python
# Kế thừa BaseService cho CRUD + caching (base_service.py)
from lms.lms.services.base_service import BaseService, cache_result, handle_service_errors

class MyService(BaseService):
    def __init__(self):
        super().__init__("My DocType")

    @cache_result(ttl=600)           # Cache 10 phút
    def get_data(self, doc_id): ...

    @handle_service_errors(default_return=[], log_error=True)
    def list_items(self, filters): ...
```

### API Decomposition
- `lms/lms/api.py` đã rất lớn (~100KB) — **không thêm endpoint mới vào đây**
- API mới đặt trong `services/<module>/api.py`:
  - AI Grading: `services/ai_grading/ai_grading_api.py`
  - Chatbot: `services/chatbot/api.py`
- AI agents tools: `agents/skills/` (dùng `@tool` LangChain, không phải `@frappe.whitelist`)

### LMS-specific DocTypes hay dùng
| DocType | Dùng cho | Controller location |
|---|---|---|
| `LMS Course` | Khóa học | `lms/lms/doctype/lms_course/` |
| `AI Grading Session` | Phiên chấm bài | `lms/lms/doctype/ai_grading_session/` |
| `Chatbot Session` | Phiên chat | `lms/lms/doctype/chatbot_session/` |
| `LMS AI Settings` | Config AI keys/models | `lms/doctype/lms_ai_settings/` |

---

## DocType Controller Pattern
```python
# purchase_order.py
import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt, nowdate


class PurchaseOrder(Document):
    # ── Frappe lifecycle hooks (thứ tự thực thi) ──────────────────────────
    def validate(self):
        """Gọi khi save (draft). Dùng để validate business rules."""
        self._validate_items()
        self._calculate_totals()

    def before_submit(self):
        """Gọi trước khi submit. Dùng để check điều kiện submit."""
        self._check_approval_status()

    def on_submit(self):
        """Gọi sau khi submit thành công. Tạo ledger entries, notifications."""
        self._update_supplier_outstanding()
        self._notify_warehouse()

    def on_cancel(self):
        """Reverse các side effects của on_submit."""
        self._reverse_supplier_outstanding()

    def on_trash(self):
        """Dọn dẹp linked records trước khi xóa."""
        pass

    # ── Private methods ───────────────────────────────────────────────────
    def _validate_items(self):
        if not self.items:
            frappe.throw(_("Please add at least one item"), title=_("Validation Error"))

        for row in self.items:
            if flt(row.qty) <= 0:
                frappe.throw(
                    _("Row {0}: Quantity must be greater than zero").format(row.idx)
                )

    def _calculate_totals(self):
        self.total = sum(flt(row.amount) for row in self.items)
        self.grand_total = self.total + flt(self.taxes_and_charges_total)

    def _check_approval_status(self):
        if self.workflow_state != "Approved":
            frappe.throw(_("Document must be approved before submission"))
```

---

## Whitelisted API Endpoint
```python
# api/order_api.py
import frappe
from frappe import _


@frappe.whitelist()
def get_order_summary(order_id: str) -> dict:
    """
    Trả về summary của Purchase Order.

    Args:
        order_id: Tên document (PO-YYYY-XXXXX)

    Returns:
        dict gồm supplier, total, status, items count
    """
    frappe.has_permission("Purchase Order", doc=order_id, throw=True)

    doc = frappe.get_doc("Purchase Order", order_id)
    return {
        "supplier": doc.supplier,
        "supplier_name": doc.supplier_name,
        "total": doc.grand_total,
        "status": doc.status,
        "items_count": len(doc.items),
        "posting_date": str(doc.transaction_date),
    }


@frappe.whitelist()
def get_supplier_defaults(supplier: str) -> dict:
    """Lấy default values từ Supplier master."""
    if not frappe.db.exists("Supplier", supplier):
        frappe.throw(_("Supplier {0} not found").format(supplier))

    return frappe.db.get_value(
        "Supplier",
        supplier,
        ["payment_terms", "currency", "default_price_list"],
        as_dict=True,
    ) or {}
```

---

## Frappe DB Access — ORM vs Raw SQL

### Ưu tiên ORM
```python
# get single value
payment_terms = frappe.db.get_value("Supplier", supplier_name, "payment_terms")

# get multiple values
data = frappe.db.get_value("Supplier", supplier_name,
    ["payment_terms", "currency"], as_dict=True)

# get list
orders = frappe.db.get_all(
    "Purchase Order",
    filters={"supplier": supplier_name, "docstatus": 1},
    fields=["name", "grand_total", "transaction_date"],
    order_by="transaction_date desc",
    limit=20,
)

# check exists
if frappe.db.exists("Purchase Order", {"supplier": supplier_name, "status": "Draft"}):
    ...

# set value (không trigger hooks)
frappe.db.set_value("Purchase Order", order_id, "custom_reviewed", 1)
```

### Raw SQL — chỉ khi cần aggregation / report phức tạp
```python
# Luôn dùng parameterized query, KHÔNG format string
results = frappe.db.sql("""
    SELECT
        po.supplier,
        SUM(po.grand_total) AS total_value,
        COUNT(po.name)      AS order_count
    FROM `tabPurchase Order` po
    WHERE po.docstatus = 1
      AND po.transaction_date BETWEEN %(from_date)s AND %(to_date)s
    GROUP BY po.supplier
    ORDER BY total_value DESC
""", {"from_date": from_date, "to_date": to_date}, as_dict=True)
```

---

## Hooks Pattern (`hooks.py`)
```python
# hooks.py — chỉ khai báo, không chứa logic

doc_events = {
    "Purchase Order": {
        "on_submit": "my_app.events.purchase_order.on_submit",
        "on_cancel": "my_app.events.purchase_order.on_cancel",
    },
    "Sales Invoice": {
        "validate":  "my_app.events.sales_invoice.validate",
    },
}

scheduler_events = {
    "daily": [
        "my_app.tasks.daily.send_overdue_reminders",
    ],
    "hourly": [
        "my_app.tasks.hourly.sync_exchange_rates",
    ],
}

fixtures = [
    {"dt": "Custom Field", "filters": [["module", "=", "My App"]]},
    {"dt": "Property Setter", "filters": [["module", "=", "My App"]]},
]
```

---

## Scheduled Job
```python
# tasks/daily.py
import frappe
from frappe import _


def send_overdue_reminders():
    """Gửi email nhắc nhở PO quá hạn. Chạy daily."""
    overdue_orders = frappe.db.get_all(
        "Purchase Order",
        filters={
            "docstatus": 1,
            "status": ["not in", ["Closed", "Cancelled"]],
            "schedule_date": ["<", frappe.utils.nowdate()],
        },
        fields=["name", "supplier", "supplier_name", "grand_total"],
    )

    for order in overdue_orders:
        _send_reminder_email(order)

    frappe.logger().info(f"Sent overdue reminders for {len(overdue_orders)} orders")


def _send_reminder_email(order: dict):
    frappe.sendmail(
        recipients=[frappe.db.get_value("Supplier", order["supplier"], "email_id")],
        subject=_("Overdue Purchase Order: {0}").format(order["name"]),
        template="overdue_po_reminder",
        args=order,
        now=True,
    )
```

---

## Background Jobs (Async) & Realtime Streaming
```python
# Gọi tác vụ nặng trong background bằng frappe.enqueue thay vì block request HTTP.
# Sử dụng timeout và queue thích hợp ('default', 'short', 'long').
def create_quiz_async(lesson_id):
    # Đẩy tác vụ nặng cho background worker
    frappe.enqueue(
        "lms.lms.services.ai_grading.api.generate_quiz_logic",
        queue="long",
        timeout=300,
        lesson_id=lesson_id,
        user=frappe.session.user
    )
    # Trả về ngay cho Frontend
    return {"status": "queued", "message": "Quiz is being generated"}

def generate_quiz_logic(lesson_id, user):
    """Worker function"""
    try:
        # LangGraph invoke... 
        # Cập nhật kết quả vào database
        frappe.publish_realtime(
            event="quiz_generated",
            message={"lesson_id": lesson_id, "status": "Ready"},
            user=user  # Chỉ gửi cho người gọi
        )
    except Exception as e:
        frappe.log_error("Quiz Gen Failed")

# SSE / Socket Streaming: Dùng frappe.publish_realtime truyền token cho chatbot
def stream_chatbot(token, user):
    frappe.publish_realtime(
        event="chat_stream",
        message={"token": token},
        user=user
    )
```

---

## Error Handling trong Controller
```python
def validate(self):
    # Dùng frappe.throw để dừng và hiện lỗi cho user
    if not self.supplier:
        frappe.throw(_("Supplier is required"), frappe.MandatoryError)

    # Dùng frappe.msgprint để warning (không dừng)
    if flt(self.grand_total) > 1_000_000:
        frappe.msgprint(
            _("Large order amount. Please ensure proper approval."),
            indicator="orange",
            alert=True,
        )

    # Raise exception cụ thể cho code caller
    if not frappe.db.exists("Currency", self.currency):
        raise frappe.ValidationError(f"Currency {self.currency} not configured")
```

---

## Không làm
- Không dùng `frappe.db.sql()` với string format (`% values`) — luôn dùng `%(key)s`
- Không gọi `doc.save()` trong `validate()` — gây infinite loop
- Không import từ app khác trực tiếp — dùng `frappe.get_attr()` nếu cần
- Không để business logic trong `hooks.py` — chỉ khai báo path
- Không hardcode `company`, `currency`, `fiscal_year` — lấy từ `frappe.defaults`
