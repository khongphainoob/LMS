# Testing Skill — Frappe (pytest) + Vue (Vitest)
> Unit test, integration test, và Frappe-specific test patterns.

## Frappe Unit Test

### File structure
```
doctype/
  purchase_order/
    purchase_order.py
    test_purchase_order.py   # ← test file, prefix test_
```

### Base test pattern
```python
# test_purchase_order.py
import frappe
import unittest
from frappe.utils import nowdate, add_days


class TestPurchaseOrder(unittest.TestCase):

    def setUp(self):
        """Chạy trước mỗi test. Tạo data cần thiết."""
        self.supplier = self._make_supplier()

    def tearDown(self):
        """Chạy sau mỗi test. Frappe tự rollback nếu dùng test runner."""
        pass

    # ── Happy path ───────────────────────────────────────────────────────
    def test_create_purchase_order(self):
        """PO được tạo thành công với data hợp lệ."""
        po = self._make_purchase_order()
        self.assertEqual(po.docstatus, 0)
        self.assertGreater(po.grand_total, 0)

    def test_submit_purchase_order(self):
        """PO submit được khi workflow đúng."""
        po = self._make_purchase_order()
        po.workflow_state = "Approved"
        po.submit()
        self.assertEqual(po.docstatus, 1)

    # ── Edge cases ───────────────────────────────────────────────────────
    def test_empty_items_raises_error(self):
        """PO không có items phải raise lỗi khi validate."""
        po = frappe.get_doc({
            "doctype": "Purchase Order",
            "supplier": self.supplier,
            "transaction_date": nowdate(),
            "items": [],
        })
        with self.assertRaises(frappe.ValidationError):
            po.insert()

    def test_zero_qty_raises_error(self):
        """Item có qty = 0 phải bị reject."""
        po = self._make_purchase_order(qty=0)
        with self.assertRaises(frappe.ValidationError):
            po.insert()

    # ── Helpers ──────────────────────────────────────────────────────────
    def _make_supplier(self) -> str:
        if frappe.db.exists("Supplier", "_Test Supplier"):
            return "_Test Supplier"
        supplier = frappe.get_doc({
            "doctype": "Supplier",
            "supplier_name": "_Test Supplier",
            "supplier_group": "All Supplier Groups",
        })
        supplier.insert(ignore_permissions=True)
        return supplier.name

    def _make_purchase_order(self, qty: float = 10.0) -> "frappe.model.document.Document":
        po = frappe.get_doc({
            "doctype": "Purchase Order",
            "supplier": self.supplier,
            "transaction_date": nowdate(),
            "schedule_date": add_days(nowdate(), 7),
            "items": [{
                "item_code": "_Test Item",
                "qty": qty,
                "rate": 100.0,
                "schedule_date": add_days(nowdate(), 7),
            }],
        })
        po.insert(ignore_permissions=True)
        return po
```

### Chạy test
```bash
# Chạy toàn bộ test của app
bench --site site1.local run-tests --app my_app

# Chạy test của 1 module
bench --site site1.local run-tests --module my_app.doctype.purchase_order.test_purchase_order

# Chạy 1 test cụ thể
bench --site site1.local run-tests \
  --module my_app.doctype.purchase_order.test_purchase_order \
  --test test_submit_purchase_order
```

---

## Test API Endpoint
```python
# test_order_api.py
import frappe
import unittest
from unittest.mock import patch


class TestOrderAPI(unittest.TestCase):

    def setUp(self):
        frappe.set_user("Administrator")  # set user context cho test

    def test_get_order_summary_returns_correct_fields(self):
        from my_app.api.order_api import get_order_summary

        # Tạo test data
        po = self._make_submitted_po()

        result = get_order_summary(po.name)

        self.assertIn("supplier", result)
        self.assertIn("grand_total", result)
        self.assertEqual(result["supplier"], po.supplier)

    def test_get_order_summary_rejects_unauthorized(self):
        from my_app.api.order_api import get_order_summary

        frappe.set_user("Guest")
        po = self._make_submitted_po()

        with self.assertRaises(frappe.PermissionError):
            get_order_summary(po.name)
```

---

## Mock Frappe trong test phức tạp
```python
from unittest.mock import patch, MagicMock

def test_send_reminder_does_not_crash_on_missing_email(self):
    from my_app.tasks.daily import send_overdue_reminders

    with patch("frappe.sendmail") as mock_mail:
        with patch("frappe.db.get_all", return_value=[{
            "name": "PO-0001",
            "supplier": "Supplier A",
            "grand_total": 5000,
        }]):
            with patch("frappe.db.get_value", return_value=None):  # email = None
                send_overdue_reminders()
                mock_mail.assert_not_called()  # không gửi nếu không có email
```

---

## Vue / Nuxt — Vitest

### Setup
```bash
pnpm add -D vitest @vue/test-utils happy-dom
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
```

### Component test pattern
```ts
// components/orders/__tests__/OrderCard.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderCard from '../OrderCard.vue'

describe('OrderCard', () => {
  it('renders supplier name', () => {
    const wrapper = mount(OrderCard, {
      props: {
        order: {
          name: 'PO-0001',
          supplier_name: 'Acme Corp',
          grand_total: 10000,
          status: 'Draft',
        },
      },
    })
    expect(wrapper.text()).toContain('Acme Corp')
  })

  it('emits view event when clicked', async () => {
    const wrapper = mount(OrderCard, { props: { order: mockOrder } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('view')).toBeTruthy()
    expect(wrapper.emitted('view')?.[0]).toEqual(['PO-0001'])
  })
})
```

### Composable test pattern
```ts
// composables/__tests__/useOrders.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrders } from '../useOrders'

// Mock Frappe API call
vi.mock('~/composables/useFrappeCall', () => ({
  useFrappeCall: () => ({
    call: vi.fn().mockResolvedValue([
      { name: 'PO-0001', supplier: 'Acme', grand_total: 5000 },
    ]),
  }),
}))

describe('useOrders', () => {
  it('loads orders on mount', async () => {
    const { orders, fetchOrders } = useOrders()
    await fetchOrders()
    expect(orders.value).toHaveLength(1)
    expect(orders.value[0].name).toBe('PO-0001')
  })
})
```

---

## Testing Checklist
| Layer | Cần test |
|---|---|
| DocType validate | happy path + từng validation rule |
| DocType hooks | on_submit tạo đúng ledger, on_cancel reverse đúng |
| API endpoint | permission check, response shape, edge cases |
| Scheduled job | không crash khi data rỗng, không crash khi mail thiếu |
| Vue component | render đúng props, emit đúng event |
| Composable | state thay đổi đúng sau API call |

## Coverage target
- Controller (validate, hooks): **≥ 80%**
- API endpoints: **100% permission check paths**
- Composables: **≥ 70%**
- Vue components: **critical user interactions**
