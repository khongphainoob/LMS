# Coding Conventions
> Cross-cutting. Áp dụng cho mọi file, mọi layer, mọi thời điểm.

## Ngôn ngữ & Encoding
- Toàn bộ code, comment, docstring viết bằng **tiếng Anh**
- File encoding: UTF-8, line ending: LF
- Indent: 1 tab (Python/Frappe), 2 spaces (Vue/JS/JSON)

---

## Naming

### Python / Frappe
| Loại | Convention | Ví dụ |
|---|---|---|
| Module, package | `snake_case` | `purchase_order` |
| Class / DocType | `PascalCase` | `PurchaseOrder` |
| Function, variable | `snake_case` | `get_pending_items()` |
| Constant | `UPPER_SNAKE` | `MAX_RETRY_COUNT` |
| Private method | `_snake_case` | `_validate_due_date()` |
| Frappe hook | `snake_case` | `on_submit`, `before_save` |

### Vue / Nuxt / JS
| Loại | Convention | Ví dụ |
|---|---|---|
| Component file | `PascalCase.vue` | `PurchaseOrderForm.vue` |
| Composable | `camelCase` bắt đầu `use` | `useOrderStatus()` |
| Props, emits | `camelCase` | `itemCode`, `@update:modelValue` |
| CSS class | `kebab-case` | `order-summary-card` |
| Constant | `UPPER_SNAKE` | `DEFAULT_PAGE_SIZE` |

### MariaDB / Frappe DocType
- Table name = DocType name dạng `snake_case` với prefix `tab`: `tabPurchase Order`
- Custom field name: `custom_<field_name>` (không bỏ prefix `custom_`)
- Frappe tự quản lý schema — không viết DDL thủ công

---

## File & Folder Structure

### Frappe App
```
my_app/
  my_app/
    doctype/
      purchase_order/
        purchase_order.py        # Controller
        purchase_order.js        # Client script
        purchase_order.json      # DocType meta
        test_purchase_order.py   # Unit test
    hooks.py
    utils/
      validators.py
      helpers.py
    api/                         # Whitelisted API endpoints
      order_api.py
```

### Vue / Nuxt
```
pages/
  orders/
    index.vue          # List view
    [id].vue           # Detail view
components/
  orders/
    OrderCard.vue
    OrderFilter.vue
composables/
  useOrders.ts
  useOrderStatus.ts
utils/
  formatters.ts
  validators.ts
```

---

## Import Order

### Python
```python
# 1. stdlib
import json
from datetime import datetime

# 2. third-party
import frappe
from frappe import _
from frappe.utils import nowdate, flt

# 3. internal app
from my_app.utils.validators import validate_due_date
```

### Vue / JS
```js
// 1. Vue core
import { ref, computed, onMounted } from 'vue'

// 2. Nuxt / framework
import { useFrappe } from '~/composables/useFrappe'

// 3. External libs
import dayjs from 'dayjs'

// 4. Internal
import OrderCard from '~/components/orders/OrderCard.vue'
```

---

## Git Commit Format
```
<type>(<scope>): <short description>

type  : feat | fix | refactor | test | docs | chore | hotfix
scope : doctype tên / module / component
```

Ví dụ:
```
feat(purchase-order): add approval workflow trigger
fix(stock-ledger): correct valuation on backdated entry
refactor(api): extract common permission check to helper
test(sales-invoice): add test for tax calculation edge case
```

---

## Frappe-specific Rules
- Luôn dùng `frappe._()` cho string hiển thị ra UI (i18n)
- Không hardcode Company name — luôn dùng `frappe.defaults.get_default("company")`
- Không truy cập `frappe.db` trực tiếp trong DocType controller nếu có method wrapper sẵn
- Permission check: luôn dùng `frappe.has_permission()` trước khi trả data sensitive
- Không dùng `frappe.db.sql()` raw khi có ORM equivalent — raw SQL chỉ dùng khi thực sự cần (report phức tạp, aggregation)

---

## Code Size Limits
| Loại | Giới hạn khuyến nghị |
|---|---|
| Function / method | ≤ 30 dòng |
| Class / DocType controller | ≤ 200 dòng |
| Vue component `<script>` | ≤ 150 dòng |
| Vue component `<template>` | ≤ 100 dòng |
| File tổng | ≤ 400 dòng |

Nếu vượt → tách composable, helper, hoặc base class.
