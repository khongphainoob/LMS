frappe.ui.form.on('AI Quiz', {
    refresh: function(frm) {
        if (frm.doc.status === 'Failed') {
            frm.add_custom_button(__('Thử lại (Retry)'), function() {
                frappe.call({
                    method: 'lms.lms.services.ai_quiz.api.retry_quiz',
                    args: {
                        quiz_id: frm.doc.name
                    },
                    freeze: true,
                    freeze_message: __('Đang xếp hàng chạy lại...'),
                    callback: function(r) {
                        if (!r.exc) {
                            frappe.show_alert({message: r.message.message, indicator: 'green'});
                            frm.reload_doc();
                        }
                    }
                });
            }).addClass('btn-primary');
        }
    }
});
