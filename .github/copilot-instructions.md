# Stack: Frappe Framework + MariaDB + Vue 3 / Nuxt + TypeScript
# Áp dụng tự động cho mọi file trong repo này.

## Tech Stack
- **Backend:** Frappe Framework (Python), MariaDB
- **Frontend:** Vue 3 (Composition API, `<script setup>`), Nuxt 3, TypeScript
- **Package manager:** pnpm (frontend), pip + bench (backend)
- **Test:** pytest (Frappe runner), Vitest (Vue)

---

## Quy tắc tuyệt đối (không bao giờ vi phạm)

### Python / Frappe
- Không dùng `frappe.db.sql()` với string format hoặc f-string — luôn dùng `%(key)s` parameterized
- Không gọi `doc.save()` bên trong `validate()` — gây infinite loop
- Không hardcode company name, currency, fiscal year — lấy từ `frappe.defaults`
- Mọi `@frappe.whitelist()` phải gọi `frappe.has_permission()` hoặc `frappe.has_role()` trước khi trả data
- String hiển thị cho user phải wrap bằng `frappe._("...")` để hỗ trợ i18n
- Không ALTER TABLE thủ công — mọi schema change đi qua DocType JSON + `bench migrate`

### Vue / TypeScript
- Luôn dùng `<script setup lang="ts">` — không dùng Options API
- Props và emits phải có TypeScript type explicit
- Không dùng `document.getElementById` để access Frappe form element — dùng `frm.get_field()`
- Không import Vue component vào Frappe client script (`.js` trong doctype folder)
- Không để `console.log` trong code — dùng `frappe.logger()` (backend) hoặc xóa (frontend)

---

## Naming Conventions

### Python
- Function, variable, module: `snake_case`
- Class, DocType: `PascalCase`
- Constant: `UPPER_SNAKE_CASE`
- Private method: `_snake_case`

### Vue / TypeScript
- Component file: `PascalCase.vue`
- Composable: `camelCase` bắt đầu bằng `use` (ví dụ: `useOrders`)
- Props, emits: `camelCase`
- CSS class: `kebab-case`

---

## Code Patterns hay dùng

### Frappe DocType Controller
```python
class MyDocType(Document):
    def validate(self):
        self._validate_mandatory_fields()
        self._calculate_totals()

    def on_submit(self):
        self._create_ledger_entries()

    def _validate_mandatory_fields(self):
        if not self.supplier:
            frappe.throw(frappe._("Supplier is required"), frappe.MandatoryError)
```

### Frappe API Endpoint
```python
@frappe.whitelist()
def my_endpoint(docname: str) -> dict:
    frappe.has_permission("My DocType", doc=docname, throw=True)
    doc = frappe.get_doc("My DocType", docname)
    return {"field": doc.field}
```

### Frappe DB Query
```python
# ORM — ưu tiên
results = frappe.db.get_all("Purchase Order",
    filters={"docstatus": 1, "supplier": supplier_name},
    fields=["name", "grand_total"],
    order_by="transaction_date desc")

# Raw SQL — chỉ khi cần aggregation
results = frappe.db.sql("""
    SELECT supplier, SUM(grand_total) as total
    FROM `tabPurchase Order`
    WHERE docstatus = 1 AND company = %(company)s
    GROUP BY supplier
""", {"company": company}, as_dict=True)
```

### Vue Composable
```ts
export function useResource() {
  const data = ref([])
  const loading = ref(false)
  const error = ref('')

  async function fetch() {
    loading.value = true
    error.value = ''
    try {
      const result = await frappe.call({ method: '...', args: {} })
      data.value = result.message
    } catch (err) {
      error.value = (err as any).message || 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}
```

---

## Error Handling
- Backend: `frappe.throw()` để dừng + hiện lỗi user, `frappe.log_error()` để log internal
- Frontend: mọi `frappe.call()` cần try/catch, hiện lỗi bằng `frappe.msgprint()`
- Batch job: dùng `frappe.db.savepoint()` — không để 1 lỗi dừng toàn bộ batch

## File size limits
- Python function: ≤ 30 dòng
- Python class: ≤ 200 dòng
- Vue `<script setup>`: ≤ 150 dòng
- Vue `<template>`: ≤ 100 dòng
- Nếu vượt → tách composable, helper, hoặc base class

## Git commit format
```
<type>(<scope>): <short description>
type: feat | fix | refactor | test | docs | chore | hotfix
scope: doctype-name | module | component
```