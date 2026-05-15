# Error Handling Skill — Frappe + Vue
> Pattern xử lý lỗi nhất quán từ DB → Python → API → Vue.

## Frappe Error Types
```python
frappe.ValidationError    # Business rule violation — hiện cho user
frappe.MandatoryError     # Required field missing
frappe.PermissionError    # Không có quyền
frappe.AuthenticationError # Chưa login / token sai
frappe.DoesNotExistError  # Record không tồn tại
frappe.DuplicateEntryError # Trùng unique key
frappe.DataError          # Data format sai
```

---

## Python — Controller Layer
```python
def validate(self):
    # frappe.throw — dừng execution, hiện lỗi cho user (popup)
    if not self.supplier:
        frappe.throw(_("Supplier is required"), frappe.MandatoryError)

    # frappe.msgprint — không dừng, chỉ cảnh báo
    if flt(self.grand_total) > 1_000_000:
        frappe.msgprint(_("Large amount — ensure approval"), indicator="orange", alert=True)

    # frappe.log_error — ghi vào Error Log, không hiện cho user
    try:
        self._fetch_exchange_rate()
    except Exception:
        frappe.log_error(frappe.get_traceback(), "Exchange Rate Fetch Failed")
        frappe.msgprint(_("Could not fetch exchange rate, using last known rate"),
            indicator="yellow")
```

---

## Python — API Layer
```python
@frappe.whitelist()
def process_order(order_id: str) -> dict:
    # 1. Validate input trước — fail fast
    if not order_id or not isinstance(order_id, str):
        frappe.throw(_("Invalid order ID"), frappe.ValidationError)

    # 2. Check existence
    if not frappe.db.exists("Purchase Order", order_id):
        frappe.throw(_("Order {0} not found").format(order_id), frappe.DoesNotExistError)

    # 3. Check permission
    frappe.has_permission("Purchase Order", doc=order_id, throw=True)

    # 4. Business logic trong try/except với context rõ ràng
    try:
        doc = frappe.get_doc("Purchase Order", order_id)
        result = _do_processing(doc)
        frappe.db.commit()
        return {"status": "success", "data": result}

    except frappe.ValidationError:
        raise  # Re-raise Frappe errors — frontend sẽ hiện cho user

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), f"Process Order Failed: {order_id}")
        frappe.throw(_("An error occurred while processing order. Please try again."))
```

---

## Python — Batch Job Layer
```python
def process_all_pending_orders():
    """Xử lý hàng loạt — không để 1 lỗi dừng toàn bộ batch."""
    pending = frappe.db.get_all("Purchase Order",
        filters={"status": "Pending Processing", "docstatus": 1},
        pluck="name")

    results = {"success": [], "failed": []}

    for order_id in pending:
        try:
            frappe.db.savepoint(f"sp_{order_id}")
            _process_single(order_id)
            results["success"].append(order_id)
            frappe.db.release_savepoint(f"sp_{order_id}")

        except Exception as e:
            frappe.db.rollback(save_point=f"sp_{order_id}")
            results["failed"].append({"id": order_id, "error": str(e)})
            frappe.log_error(frappe.get_traceback(), f"Batch Process Failed: {order_id}")

    frappe.db.commit()
    frappe.logger().info(
        f"Batch complete: {len(results['success'])} ok, {len(results['failed'])} failed"
    )
    return results
```

---

## Vue — API Call Error Handling

### Pattern chuẩn cho mọi Frappe API call
```ts
// composables/useOrderActions.ts
export function useOrderActions() {
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const errorMessage = ref('')

  async function submitOrder(orderName: string) {
    status.value = 'loading'
    errorMessage.value = ''

    try {
      await frappe.call({
        method: 'my_app.api.order_api.submit_order',
        args: { order_name: orderName },
        freeze: true,
        freeze_message: __('Submitting...'),
      })
      status.value = 'success'
      frappe.show_alert({ message: __('Order submitted successfully'), indicator: 'green' })

    } catch (err: unknown) {
      status.value = 'error'
      // Frappe trả lỗi dạng { exc_type, exc, message }
      const frappeErr = err as { message?: string; exc_type?: string }
      errorMessage.value = frappeErr.message || __('An unexpected error occurred')
      frappe.msgprint({
        title: __('Submission Failed'),
        message: errorMessage.value,
        indicator: 'red',
      })
    }
  }

  return { status, errorMessage, submitOrder }
}
```

### Hiển thị error state trong component
```vue
<template>
  <div v-if="status === 'error'" class="error-banner">
    <i class="ti ti-alert-circle" aria-hidden="true"></i>
    {{ errorMessage }}
    <button @click="retry">Thử lại</button>
  </div>
</template>
```

---

## Frappe Client Script Error Handling
```js
// Trong form client script
frappe.ui.form.on('Purchase Order', {
  async custom_action(frm) {
    try {
      const result = await frappe.call({
        method: 'my_app.api.order_api.custom_action',
        args: { name: frm.doc.name },
      })
      if (result.message?.status === 'success') {
        frm.reload_doc()
        frappe.show_alert({ message: __('Action completed'), indicator: 'green' })
      }
    } catch (err) {
      // frappe.call tự hiện lỗi từ server
      // Chỉ cần xử lý cleanup nếu cần
      frm.refresh()
    }
  },
})
```

---

## Error Logging Levels
```python
# INFO — flow bình thường, dùng cho audit trail
frappe.logger().info(f"Order {self.name} submitted by {frappe.session.user}")

# WARNING — unexpected nhưng recoverable
frappe.logger().warning(f"Exchange rate not found for {self.currency}, using fallback")

# ERROR — cần xem xét nhưng app vẫn chạy
frappe.log_error(frappe.get_traceback(), "Email Send Failed")

# CRITICAL — frappe.throw — dừng execution, hiện cho user
frappe.throw(_("Critical validation failed"))
```

---

## Error Handling Checklist
- [ ] Mọi `@frappe.whitelist()` có try/except với rollback khi cần
- [ ] Batch job dùng savepoint — 1 lỗi không dừng toàn bộ
- [ ] Vue API call có status state: `idle | loading | success | error`
- [ ] Lỗi hiện cho user bằng `frappe.throw` (bị interrupt) hoặc `frappe.msgprint` (warning)
- [ ] Internal error ghi vào Error Log bằng `frappe.log_error`
- [ ] Không expose traceback/stack trace cho user
- [ ] Frappe `ValidationError` re-raise, không wrap thêm
