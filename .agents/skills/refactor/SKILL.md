# Refactor Skill — Frappe Python + Vue
> Nhận biết code smell và cách refactor đúng trong Frappe ecosystem.

## Python / Frappe Code Smells

### 1. God Method trong Controller
```python
# ❌ Trước — validate() làm quá nhiều thứ
def validate(self):
    if not self.supplier:
        frappe.throw("Supplier required")
    if not self.items:
        frappe.throw("Items required")
    for row in self.items:
        if row.qty <= 0:
            frappe.throw(f"Row {row.idx}: qty invalid")
        if not frappe.db.exists("Item", row.item_code):
            frappe.throw(f"Item {row.item_code} not found")
        row.amount = row.qty * row.rate
    self.total = sum(r.amount for r in self.items)
    self.tax_amount = self.total * 0.1
    self.grand_total = self.total + self.tax_amount
    if self.grand_total > 1000000:
        frappe.msgprint("Large order, needs approval")

# ✅ Sau — tách thành private methods có tên rõ ràng
def validate(self):
    self._validate_mandatory_fields()
    self._validate_items()
    self._calculate_totals()
    self._warn_if_large_order()

def _validate_mandatory_fields(self):
    if not self.supplier:
        frappe.throw(_("Supplier is required"), frappe.MandatoryError)

def _validate_items(self):
    if not self.items:
        frappe.throw(_("Please add at least one item"))
    for row in self.items:
        if flt(row.qty) <= 0:
            frappe.throw(_("Row {0}: Quantity must be greater than zero").format(row.idx))
        if not frappe.db.exists("Item", row.item_code):
            frappe.throw(_("Item {0} does not exist").format(row.item_code))
        row.amount = flt(row.qty) * flt(row.rate)

def _calculate_totals(self):
    self.total = sum(flt(r.amount) for r in self.items)
    self.tax_amount = flt(self.total) * flt(self.tax_rate or 0) / 100
    self.grand_total = self.total + self.tax_amount

def _warn_if_large_order(self):
    if flt(self.grand_total) > 1_000_000:
        frappe.msgprint(_("Large order amount. Please ensure proper approval."),
            indicator="orange", alert=True)
```

### 2. Duplicate DB Calls
```python
# ❌ Trước — gọi DB nhiều lần cho cùng 1 record
def on_submit(self):
    supplier_email = frappe.db.get_value("Supplier", self.supplier, "email_id")
    supplier_currency = frappe.db.get_value("Supplier", self.supplier, "default_currency")
    supplier_terms = frappe.db.get_value("Supplier", self.supplier, "payment_terms")

# ✅ Sau — 1 lần gọi, lấy nhiều field
def on_submit(self):
    supplier_data = frappe.db.get_value(
        "Supplier", self.supplier,
        ["email_id", "default_currency", "payment_terms"],
        as_dict=True,
    ) or {}
    supplier_email    = supplier_data.get("email_id")
    supplier_currency = supplier_data.get("default_currency")
    supplier_terms    = supplier_data.get("payment_terms")
```

### 3. Raw String Concatenation cho điều kiện
```python
# ❌ Trước
condition = "docstatus = 1"
if supplier:
    condition += f" AND supplier = '{supplier}'"  # SQL injection risk!
if from_date:
    condition += f" AND transaction_date >= '{from_date}'"

# ✅ Sau — dùng frappe.db.get_all với filters dict
filters = {"docstatus": 1}
if supplier:
    filters["supplier"] = supplier
if from_date:
    filters["transaction_date"] = [">=", from_date]

orders = frappe.db.get_all("Purchase Order", filters=filters, fields=["name", "grand_total"])
```

### 4. Repeated Permission Check
```python
# ❌ Trước — lặp permission check ở nhiều endpoint
@frappe.whitelist()
def get_order(name):
    if not frappe.has_permission("Purchase Order", doc=name):
        frappe.throw("No permission")
    ...

@frappe.whitelist()
def update_order(name, data):
    if not frappe.has_permission("Purchase Order", doc=name):
        frappe.throw("No permission")
    ...

# ✅ Sau — extract decorator/helper
def require_po_permission(ptype="read"):
    def decorator(fn):
        def wrapper(name, *args, **kwargs):
            frappe.has_permission("Purchase Order", doc=name, ptype=ptype, throw=True)
            return fn(name, *args, **kwargs)
        return wrapper
    return decorator

@frappe.whitelist()
@require_po_permission("read")
def get_order(name): ...

@frappe.whitelist()
@require_po_permission("write")
def update_order(name, data): ...
```

---

## Vue / Nuxt Code Smells

### 1. Logic nặng trong template
```vue
<!-- ❌ Trước -->
<template>
  <span>
    {{ order.status === 'Draft' ? 'Chờ duyệt' :
       order.status === 'Submitted' ? 'Đã nộp' :
       order.status === 'Cancelled' ? 'Đã hủy' : order.status }}
  </span>
  <span :class="order.grand_total > 1000000 ? 'text-red-500' :
                order.grand_total > 500000 ? 'text-yellow-500' : 'text-green-500'">
    {{ order.grand_total.toLocaleString() }}
  </span>
</template>

<!-- ✅ Sau — computed properties -->
<template>
  <span>{{ statusLabel }}</span>
  <span :class="totalClass">{{ formattedTotal }}</span>
</template>

<script setup lang="ts">
const STATUS_LABELS: Record<string, string> = {
  Draft: 'Chờ duyệt',
  Submitted: 'Đã nộp',
  Cancelled: 'Đã hủy',
}

const statusLabel = computed(() => STATUS_LABELS[props.order.status] ?? props.order.status)

const totalClass = computed(() => {
  if (props.order.grand_total > 1_000_000) return 'text-red-500'
  if (props.order.grand_total > 500_000)   return 'text-yellow-500'
  return 'text-green-500'
})

const formattedTotal = computed(() =>
  props.order.grand_total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
)
</script>
```

### 2. Component quá lớn — tách composable
```vue
<!-- ❌ Trước — 300 dòng script setup -->
<script setup lang="ts">
// 50 dòng fetch logic
// 40 dòng filter logic
// 60 dòng form logic
// 30 dòng export logic
</script>

<!-- ✅ Sau — mỗi concern thành 1 composable -->
<script setup lang="ts">
const { orders, fetchOrders, loading }     = useOrders()
const { filters, applyFilter, resetFilter } = useOrderFilter()
const { form, submitForm, resetForm }       = useOrderForm()
const { exportToExcel }                     = useOrderExport()
</script>
```

### 3. Prop drilling qua nhiều tầng
```ts
// ❌ Trước — truyền prop qua 3-4 component lồng nhau
// Parent → Child → GrandChild → GreatGrandChild

// ✅ Sau — dùng provide/inject cho data không thay đổi thường xuyên
// Trong parent
provide('currentOrder', readonly(order))

// Trong deep child
const order = inject<Ref<Order>>('currentOrder')
```

---

## Refactor Checklist
- [ ] Function > 30 dòng → tách thành private methods
- [ ] Cùng 1 logic lặp > 2 lần → extract helper/composable
- [ ] Magic number/string → đặt tên constant
- [ ] Điều kiện phức tạp → extract thành function tên rõ nghĩa
- [ ] DB call trong loop → batch thành 1 query
- [ ] Frappe `frappe.db.sql()` với string format → đổi sang parameterized
- [ ] Component > 200 dòng → tách composable hoặc sub-component
