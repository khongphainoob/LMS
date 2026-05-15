# Schema Sync Skill — Frappe DocType ↔ Python ↔ Vue
> Giữ DocType JSON, Python type hints, và Vue types luôn đồng bộ.

## Vấn đề cần giải quyết
Trong Frappe, source of truth của schema là **DocType JSON**.
Khi thêm/sửa/xóa field → Python code và Vue types phải được cập nhật theo.

---

## Quy trình thay đổi schema (bắt buộc theo thứ tự)

```
1. Sửa DocType JSON  (hoặc Customize Form trên UI)
        ↓
2. bench migrate  (áp dụng vào MariaDB)
        ↓
3. Cập nhật Python type hints / Pydantic model
        ↓
4. Cập nhật Vue TypeScript interface
        ↓
5. Cập nhật test data trong test files
        ↓
6. bench export-fixtures  (nếu dùng Custom Field)
```

**Không bỏ bước nào.** Bỏ bước 3-4 là nguồn gốc của lỗi runtime khó debug.

---

## 1. DocType JSON — Source of Truth
```json
// doctype/purchase_order/purchase_order.json (excerpt)
{
  "fields": [
    { "fieldname": "supplier",       "fieldtype": "Link",      "options": "Supplier", "reqd": 1 },
    { "fieldname": "transaction_date","fieldtype": "Date",      "reqd": 1 },
    { "fieldname": "grand_total",    "fieldtype": "Currency",  "read_only": 1 },
    { "fieldname": "custom_approval_note", "fieldtype": "Small Text" }
  ]
}
```

---

## 2. Python Type Hints (TypedDict / dataclass)
```python
# types/purchase_order.py
from typing import TypedDict, Optional
from datetime import date


class PurchaseOrderItem(TypedDict):
    item_code: str
    item_name: str
    qty: float
    rate: float
    amount: float
    idx: int


class PurchaseOrderDict(TypedDict):
    """Mirrors Purchase Order DocType fields."""
    name: str
    supplier: str
    supplier_name: str
    transaction_date: date
    schedule_date: Optional[date]
    grand_total: float
    total: float
    status: str                    # Draft | Submitted | Cancelled | Closed
    docstatus: int                 # 0=Draft, 1=Submitted, 2=Cancelled
    workflow_state: Optional[str]
    custom_approval_note: Optional[str]
    items: list[PurchaseOrderItem]
```

Dùng trong API:
```python
from my_app.types.purchase_order import PurchaseOrderDict

@frappe.whitelist()
def get_order_summary(order_id: str) -> PurchaseOrderDict:
    frappe.has_permission("Purchase Order", doc=order_id, throw=True)
    doc = frappe.get_doc("Purchase Order", order_id)
    return doc.as_dict()
```

---

## 3. Vue TypeScript Interface
```ts
// types/purchase-order.ts — mirror của DocType + Python type

export interface PurchaseOrderItem {
  item_code: string
  item_name: string
  qty: number
  rate: number
  amount: number
  idx: number
}

export interface PurchaseOrder {
  name: string
  supplier: string
  supplier_name: string
  transaction_date: string       // ISO date string từ API
  schedule_date: string | null
  grand_total: number
  total: number
  status: 'Draft' | 'To Receive and Bill' | 'Completed' | 'Cancelled' | 'Closed'
  docstatus: 0 | 1 | 2
  workflow_state: string | null
  custom_approval_note: string | null
  items: PurchaseOrderItem[]
}

// Response wrapper từ Frappe API
export interface FrappeListResponse<T> {
  message: T[]
}

export interface FrappeSingleResponse<T> {
  message: T
}
```

---

## 4. Khi thêm Custom Field — Checklist

Giả sử thêm field `custom_reviewed_by` vào Purchase Order:

**Bước 1:** Thêm vào Customize Form UI → Export fixtures
```bash
bench --site site1.local export-fixtures
```

**Bước 2:** Cập nhật `PurchaseOrderDict` (Python)
```python
class PurchaseOrderDict(TypedDict):
    # ... existing fields ...
    custom_reviewed_by: Optional[str]   # ← thêm dòng này
```

**Bước 3:** Cập nhật `PurchaseOrder` interface (TypeScript)
```ts
export interface PurchaseOrder {
  // ... existing fields ...
  custom_reviewed_by: string | null     // ← thêm dòng này
}
```

**Bước 4:** Cập nhật test helper nếu cần
```python
def _make_purchase_order(self, ...):
    return frappe.get_doc({
        "doctype": "Purchase Order",
        # ...
        "custom_reviewed_by": None,   # ← thêm nếu required
    })
```

---

## 5. Detect Schema Drift

Script kiểm tra field trong DocType JSON vs Python TypedDict:
```python
# scripts/check_schema_sync.py
import frappe
import ast
import json
from pathlib import Path


def check_po_sync():
    # Đọc fields từ DocType JSON
    meta_path = Path("my_app/doctype/purchase_order/purchase_order.json")
    meta = json.loads(meta_path.read_text())
    doctype_fields = {f["fieldname"] for f in meta["fields"]
                      if f["fieldtype"] not in ("Section Break", "Column Break", "HTML")}

    # Đọc keys từ TypedDict (parse AST đơn giản)
    types_path = Path("my_app/types/purchase_order.py")
    tree = ast.parse(types_path.read_text())
    typed_dict_fields = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef) and node.name == "PurchaseOrderDict":
            for item in node.body:
                if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                    typed_dict_fields.add(item.target.id)

    missing_in_types = doctype_fields - typed_dict_fields
    extra_in_types   = typed_dict_fields - doctype_fields - {"name", "owner", "creation", "modified"}

    if missing_in_types:
        print(f"⚠️  Fields in DocType but NOT in TypedDict: {missing_in_types}")
    if extra_in_types:
        print(f"⚠️  Fields in TypedDict but NOT in DocType: {extra_in_types}")
    if not missing_in_types and not extra_in_types:
        print("✅  Schema in sync")
```

Chạy trong CI hoặc pre-commit:
```bash
python scripts/check_schema_sync.py
```

---

## API Contract — Response Shape phải nhất quán
```python
# Mọi API endpoint trả về shape cố định
# Không trả raw doc.as_dict() cho frontend — filter field cần thiết

@frappe.whitelist()
def list_purchase_orders(filters: str = "{}") -> list[dict]:
    """
    Returns:
        list of dicts with keys: name, supplier_name, grand_total, status, transaction_date
    """
    import json
    parsed_filters = json.loads(filters)
    parsed_filters["docstatus"] = 1

    return frappe.db.get_all(
        "Purchase Order",
        filters=parsed_filters,
        fields=["name", "supplier", "supplier_name", "grand_total", "status", "transaction_date"],
        order_by="transaction_date desc",
        limit=50,
    )
```

TypeScript phải mirror đúng fields đó:
```ts
export interface PurchaseOrderListItem {
  name: string
  supplier: string
  supplier_name: string
  grand_total: number
  status: string
  transaction_date: string
}
```
