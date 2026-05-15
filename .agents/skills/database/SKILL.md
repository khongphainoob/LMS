# Database Skill — MariaDB + Frappe ORM
> Frappe quản lý schema tự động qua DocType. Không viết DDL thủ công.

## Nguyên tắc cốt lõi
1. **Schema = DocType JSON** — mọi thay đổi cột/bảng đi qua DocType meta, không ALTER TABLE
2. **Migration = `bench migrate`** — sau khi thay đổi DocType JSON
3. **Không tự tạo table** — Frappe tạo `tab<DocType Name>` tự động
4. **Custom field** — dùng Customize Form hoặc fixture, không sửa DocType gốc của ERPNext

---

## Frappe Table Naming
```
DocType name     →  MariaDB table
─────────────────────────────────
Purchase Order   →  `tabPurchase Order`
Sales Invoice    →  `tabSales Invoice`
Item             →  `tabItem`
```

Child table (table field trong DocType):
```
Purchase Order Item  →  `tabPurchase Order Item`
```

---

## Query Patterns

### Get single record
```python
# Trả về dict hoặc None
doc = frappe.db.get_value(
    "Purchase Order",
    {"name": order_id, "docstatus": 1},
    ["name", "supplier", "grand_total"],
    as_dict=True,
)
if not doc:
    frappe.throw(_("Order not found or not submitted"))
```

### Get list với filter phức tạp
```python
items = frappe.db.get_all(
    "Purchase Order Item",
    filters={
        "parent": order_id,
        "qty": [">", 0],
        "item_group": ["in", ["Raw Material", "Consumable"]],
    },
    fields=["item_code", "item_name", "qty", "rate", "amount"],
    order_by="idx asc",
)
```

### Filter operators
```python
# Frappe filter operators
["=", "!=", ">", "<", ">=", "<="]
["like", "not like"]             # % wildcard
["in", "not in"]                 # list
["is", "is not"]                 # NULL check: ["is", "set"] / ["is", "not set"]
["between"]                      # date range: ["between", ["2024-01-01", "2024-12-31"]]
["ancestors of", "descendants of"]  # NestedSet DocTypes
```

### Aggregation — dùng raw SQL
```python
summary = frappe.db.sql("""
    SELECT
        i.item_group,
        SUM(poi.qty)    AS total_qty,
        SUM(poi.amount) AS total_amount
    FROM `tabPurchase Order Item` poi
    INNER JOIN `tabItem` i ON i.name = poi.item_code
    INNER JOIN `tabPurchase Order` po ON po.name = poi.parent
    WHERE po.docstatus = 1
      AND po.company = %(company)s
      AND po.transaction_date BETWEEN %(from_date)s AND %(to_date)s
    GROUP BY i.item_group
    ORDER BY total_amount DESC
""", {
    "company": company,
    "from_date": from_date,
    "to_date": to_date,
}, as_dict=True)
```

---

## Custom Field (Fixture pattern)
```python
# Định nghĩa trong fixtures/ — không sửa DocType JSON gốc

# fixtures/custom_field.json (generate bằng bench export-fixtures)
[
  {
    "doctype": "Custom Field",
    "dt": "Purchase Order",
    "fieldname": "custom_approval_note",
    "label": "Approval Note",
    "fieldtype": "Small Text",
    "insert_after": "status",
    "in_list_view": 0,
    "read_only": 0,
    "module": "My App"
  }
]
```

Export fixture:
```bash
bench --site site1.local export-fixtures
```

Apply sau migrate:
```bash
bench --site site1.local migrate
```

---

## Index & Performance

### Frappe tự tạo index cho
- `name` (primary key)
- `parent`, `parenttype`, `parentfield` (child table)
- `modified`, `creation`, `owner`
- Field có `search_index: 1` trong DocType meta

### Thêm search_index qua DocType
```json
// trong field definition của DocType JSON
{
  "fieldname": "supplier",
  "fieldtype": "Link",
  "options": "Supplier",
  "search_index": 1
}
```

### Query optimization checklist
```sql
-- Trước khi viết query phức tạp, EXPLAIN trước
EXPLAIN SELECT ...;

-- Kiểm tra index đang dùng
SHOW INDEX FROM `tabPurchase Order`;

-- Tránh
SELECT *                          -- luôn chỉ định field cần
WHERE YEAR(transaction_date) = 2024  -- không dùng được index
WHERE name LIKE '%PO%'            -- leading wildcard, full scan
```

---

## Transaction & Consistency
```python
# Frappe tự wrap mỗi request trong 1 transaction
# Nếu cần manual savepoint trong batch job:

def process_batch(order_ids: list[str]):
    success, failed = [], []

    for order_id in order_ids:
        try:
            frappe.db.savepoint(f"sp_{order_id}")
            _process_single_order(order_id)
            success.append(order_id)
        except Exception as e:
            frappe.db.rollback(save_point=f"sp_{order_id}")
            failed.append({"id": order_id, "error": str(e)})
            frappe.logger().warning(f"Failed to process {order_id}: {e}")

    frappe.db.commit()
    return {"success": success, "failed": failed}
```

---

## Backup & Migrate Workflow
```bash
# Trước khi thay đổi DocType schema
bench --site site1.local backup

# Sau khi sửa DocType JSON hoặc thêm Custom Field
bench --site site1.local migrate

# Kiểm tra migration log
bench --site site1.local migrate --verbose

# Nếu có vấn đề
bench --site site1.local restore <backup_file>
```

---

## Không làm
- Không `ALTER TABLE` thủ công — Frappe sẽ override khi migrate
- Không `DROP COLUMN` — mark field `hidden: 1` trong DocType thay vì xóa
- Không tạo index ngoài Frappe (sẽ bị xóa khi rebuild)
- Không dùng `frappe.db.sql()` với `%(var)s` nhưng quên truyền dict — gây lỗi syntax
- Không query `information_schema` trong production code
