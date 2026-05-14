# Docs Skill — Frappe Python + Vue
> Docstring, README, ADR, và Frappe-specific documentation patterns.

## Python Docstring (Google style)
```python
def get_supplier_credit_limit(supplier: str, company: str) -> float:
    """
    Lấy credit limit của supplier cho công ty cụ thể.

    Credit limit được lấy từ Supplier master nếu có,
    fallback về giá trị mặc định từ Accounts Settings.

    Args:
        supplier: Tên Supplier (name field trong Supplier DocType)
        company: Tên Company

    Returns:
        Credit limit dạng float, đơn vị là currency của company.
        Trả về 0.0 nếu không có giới hạn.

    Raises:
        frappe.DoesNotExistError: Nếu supplier không tồn tại.

    Example:
        >>> limit = get_supplier_credit_limit("Acme Corp", "My Company")
        >>> print(f"Credit limit: {limit:,.0f}")
        Credit limit: 50,000,000
    """
    if not frappe.db.exists("Supplier", supplier):
        frappe.throw(frappe._("Supplier {0} not found").format(supplier),
                     frappe.DoesNotExistError)

    limit = frappe.db.get_value("Supplier", supplier, "custom_credit_limit") or 0
    if not limit:
        limit = frappe.db.get_single_value("Accounts Settings", "default_credit_limit") or 0
    return float(limit)
```

### Docstring ngắn cho method rõ nghĩa
```python
def _calculate_totals(self):
    """Tính total, tax_amount, grand_total từ items. Gọi trong validate()."""
    self.total = sum(flt(r.amount) for r in self.items)
    ...
```

### Không cần docstring khi
- Function/method < 5 dòng và tên đã tự giải thích
- Private helper hiển nhiên (`_set_missing_values`)
- Frappe lifecycle hook chuẩn (`validate`, `on_submit`) — đã documented bởi Frappe

---

## Vue Component JSDoc
```vue
<script setup lang="ts">
/**
 * Hiển thị summary card của một Purchase Order.
 *
 * @example
 * <OrderCard :order="order" @view="handleView" />
 */

const props = defineProps<{
  /** Order object từ API */
  order: PurchaseOrder
  /** Hiển thị action buttons (mặc định: true) */
  showActions?: boolean
}>()

const emit = defineEmits<{
  /** Trigger khi user click vào card */
  view: [orderName: string]
  /** Trigger khi user click Submit */
  submit: [order: PurchaseOrder]
}>()
</script>
```

---

## Composable Documentation
```ts
/**
 * Quản lý danh sách Purchase Orders với filter và pagination.
 *
 * @example
 * const { orders, loading, fetchOrders, applyFilter } = useOrders()
 * await fetchOrders()
 * applyFilter({ supplier: 'Acme Corp' })
 */
export function useOrders() {
  const orders = ref<PurchaseOrder[]>([])
  const loading = ref(false)

  /** Tải danh sách orders theo filter hiện tại */
  async function fetchOrders(filters?: Partial<PurchaseOrderFilters>) { ... }

  /** Áp dụng filter và reload danh sách */
  function applyFilter(filter: Partial<PurchaseOrderFilters>) { ... }

  return { orders, loading, fetchOrders, applyFilter }
}
```

---

## API Endpoint Documentation
```python
@frappe.whitelist()
def list_purchase_orders(
    supplier: str | None = None,
    from_date: str | None = None,
    to_date: str | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    """
    Danh sách Purchase Orders có filter và pagination.

    Endpoint: POST /api/method/my_app.api.order_api.list_purchase_orders

    Args:
        supplier: Lọc theo tên Supplier (optional)
        from_date: Từ ngày, format YYYY-MM-DD (optional)
        to_date: Đến ngày, format YYYY-MM-DD (optional)
        status: Draft | Submitted | Cancelled (optional)
        page: Trang hiện tại, bắt đầu từ 1
        page_size: Số record mỗi trang, max 100

    Returns:
        {
            "data": [...],        # list of order dicts
            "total": int,         # tổng số record (không filter page)
            "page": int,
            "page_size": int
        }

    Permission:
        Yêu cầu quyền Read trên Purchase Order DocType.
    """
```

---

## README Structure cho Frappe App
```markdown
# My App

Mô tả ngắn về app làm gì (1-2 câu).

## Cài đặt

```bash
bench get-app my_app https://github.com/org/my_app
bench --site site1.local install-app my_app
bench --site site1.local migrate
```

## Cấu hình

| Setting | Mô tả | Mặc định |
|---|---|---|
| `external_api_key` | API key cho service ngoài | — |
| `default_credit_limit` | Credit limit mặc định | 0 |

Cấu hình trong `site_config.json` hoặc DocType "My App Settings".

## DocTypes chính

- **Purchase Order** — mở rộng với approval workflow
- **My Custom DocType** — ...

## API Endpoints

Xem [API Documentation](docs/api.md)

## Development

```bash
# Chạy test
bench --site site1.local run-tests --app my_app

# Lint
cd apps/my_app && ruff check .
```
```

---

## ADR (Architecture Decision Record)
```markdown
# ADR-001: Dùng Custom Field thay vì fork DocType ERPNext

**Date:** 2024-01-15
**Status:** Accepted

## Context
Cần thêm trường Approval Note vào Purchase Order.
Có 2 lựa chọn: fork DocType gốc hoặc thêm Custom Field.

## Decision
Dùng Custom Field (`custom_approval_note`) qua Customize Form.

## Consequences
- ✅ Không conflict khi update ERPNext
- ✅ Quản lý qua fixture, deploy tự động
- ⚠️  Field name phải giữ prefix `custom_`
- ⚠️  Không thể đặt Custom Field trước các field bắt buộc của ERPNext
```

Lưu ADR tại: `docs/decisions/ADR-001-custom-field-vs-fork.md`
