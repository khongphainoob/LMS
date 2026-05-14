# Frontend Skill — Vue 3 / Nuxt + Frappe
> Áp dụng khi viết component, page, composable tương tác với Frappe backend.

## ⚡ Codebase Context — LMS Frontend

**Stack:** Vue 3 (Composition API, `<script setup>`) + Vite + TailwindCSS + frappe-ui

### File Structure
```
frontend/src/
├── pages/AI/                       # AI feature pages
│   ├── AIGrading/                  # 12 components: Workspace, Config, Rubric...
│   ├── Chatbot/                    # 3 components: Tutor, Helper, Socratic
│   ├── AIIntegration.vue           # AI config page
│   └── StudentScoreDashboard.vue   # Score dashboard
├── components/                     # Reusable components
│   ├── AIGrading/                  # AI grading sub-components
│   ├── chatbot/                    # Chatbot UI components
│   └── Rubric/                     # Rubric builder components
├── router.js                       # Vue Router (hash-based SPA)
├── stores/                         # State management
└── styles/                         # CSS / design tokens
```

### Lưu ý codebase-specific
- **Design system:** Dùng TailwindCSS (không phải vanilla CSS) — xem `tailwind.config.js`
- **frappe-ui:** Import components từ `frappe-ui` package
- **Routing:** Hash-based SPA, route config tại `router.js`
- **File lớn cần chú ý:** `MCQGradingWorkspace.vue` (~37KB), `AIGradingEssayConfig.vue` (~35KB) — nên tách composable khi sửa
- **API calls:** Dùng `createResource` từ frappe-ui hoặc `frappe.call()` trực tiếp

---

## Component Structure (thứ tự chuẩn)
```vue
<template>
  <!-- 1 root element hoặc Fragment -->
</template>

<script setup lang="ts">
// imports
// props & emits
// composables / store
// reactive state
// computed
// methods
// lifecycle hooks
// watchers (cuối cùng)
</script>

<style scoped>
/* chỉ dùng khi cần override Frappe/ERPNext UI */
</style>
```

---

## Props & Emits
```vue
<script setup lang="ts">
// Luôn define props với type rõ ràng
const props = defineProps<{
  doctype: string
  docname: string
  readOnly?: boolean
}>()

// Emit dùng defineEmits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': [doc: FrappeDoc]
}>()
</script>
```

---

## Gọi Frappe API từ Vue

### Dùng `frappe.call` (trong Frappe desk context)
```js
const result = await frappe.call({
  method: 'my_app.api.order_api.get_order_summary',
  args: { order_id: props.docname },
  freeze: true,                      // hiện loading overlay
  freeze_message: __('Loading...'),
})
// result.message là data trả về
```

### Dùng fetch API (Nuxt standalone)
```ts
// composables/useFrappeCall.ts
export function useFrappeCall() {
  async function call<T>(method: string, args?: Record<string, unknown>): Promise<T> {
    const res = await $fetch<{ message: T }>('/api/method/' + method, {
      method: 'POST',
      body: args,
    })
    return res.message
  }
  return { call }
}
```

---

## Frappe Form Client Script Pattern
```js
// purchase_order.js — đặt trong doctype folder
frappe.ui.form.on('Purchase Order', {
  // Trigger khi form load
  refresh(frm) {
    if (frm.doc.docstatus === 1) {
      frm.add_custom_button(__('Create Invoice'), () => {
        frappe.model.open_mapped_doc({
          method: 'my_app.api.order_api.make_purchase_invoice',
          frm,
        })
      }, __('Create'))
    }
  },

  // Trigger khi field thay đổi
  supplier(frm) {
    if (!frm.doc.supplier) return
    frm.trigger('fetch_supplier_defaults')
  },

  async fetch_supplier_defaults(frm) {
    const { message } = await frappe.call({
      method: 'my_app.api.order_api.get_supplier_defaults',
      args: { supplier: frm.doc.supplier },
    })
    if (message) {
      frm.set_value('payment_terms_template', message.payment_terms)
    }
  },

  // Child table row change
  'items.qty'(frm, cdt, cdn) {
    const row = locals[cdt][cdn]
    frappe.model.set_value(cdt, cdn, 'amount', row.qty * row.rate)
    frm.refresh_field('items')
  },
})
```

---

## State Management (Nuxt standalone)
- Dùng `useState` cho server-synced global state
- Dùng `ref`/`reactive` cho local component state
- Không dùng Vuex/Pinia nếu Frappe `frappe.call` + composable đủ dùng

```ts
// composables/useCurrentUser.ts
export function useCurrentUser() {
  const user = useState('current_user', () => null)

  async function fetchUser() {
    const { call } = useFrappeCall()
    user.value = await call('frappe.client.get_value', {
      doctype: 'User',
      filters: { name: frappe.session.user },
      fieldname: ['full_name', 'user_image', 'roles'],
    })
  }

  return { user, fetchUser }
}
```

---

## Form Validation
```ts
// Validate trước khi submit — không để Frappe server bắt lỗi toàn bộ
function validateForm(): string[] {
  const errors: string[] = []
  if (!form.value.supplier) errors.push(__('Supplier is required'))
  if (form.value.items.length === 0) errors.push(__('Add at least one item'))
  return errors
}

async function handleSubmit() {
  const errors = validateForm()
  if (errors.length) {
    frappe.msgprint({ title: __('Validation Error'), message: errors.join('<br>'), indicator: 'red' })
    return
  }
  // proceed
}
```

---

## Loading & Error States
```vue
<template>
  <div v-if="status === 'loading'">
    <FrappeSpinner />
  </div>
  <div v-else-if="status === 'error'">
    <ErrorBanner :message="error" />
  </div>
  <div v-else>
    <!-- content -->
  </div>
</template>

<script setup lang="ts">
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const error = ref<string>('')
</script>
```

---

## Frappe UI Components (dùng sẵn, không tự viết lại)
| Nhu cầu | Component |
|---|---|
| Link field | `frappe.ui.form.ControlLink` |
| Date picker | `frappe.ui.form.ControlDate` |
| Dialog | `new frappe.ui.Dialog({})` |
| Confirm | `frappe.confirm()` |
| Toast | `frappe.show_alert()` |
| Loading | `frappe.freeze()` / `frappe.unfreeze()` |

---

## Không làm
- Không dùng `document.getElementById` — dùng `frm.get_field('field_name').$input`
- Không manipulate DOM Frappe form trực tiếp trừ khi không có API
- Không import Vue component vào Frappe client script (context khác nhau)
- Không để `console.log` trong code production — dùng `frappe.logger()`
