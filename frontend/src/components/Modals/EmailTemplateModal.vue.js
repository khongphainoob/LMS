/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { call, Dialog, FormControl, TextEditor, toast } from 'frappe-ui';
import { reactive, watch } from 'vue';
import { cleanError } from '@/utils';
const props = defineProps({
    templateID: {
        type: String,
        default: 'new',
    },
});
const show = defineModel();
const emailTemplates = defineModel('emailTemplates');
const template = reactive({
    name: '',
    subject: '',
    use_html: false,
    response: '',
    response_html: '',
});
const saveTemplate = (close) => {
    if (props.templateID == 'new') {
        createNewTemplate(close);
    }
    else {
        updateTemplate(close);
    }
};
const createNewTemplate = (close) => {
    emailTemplates.value.insert.submit({
        __newname: template.name,
        ...template,
    }, {
        onSuccess() {
            emailTemplates.value.reload();
            refreshForm(close);
            toast.success(__('Email Template created successfully'));
        },
        onError(err) {
            refreshForm(close);
            toast.error(cleanError(err.messages[0]) || __('Error creating email template'));
        },
    });
};
const updateTemplate = async (close) => {
    if (props.templateID != template.name) {
        await renameDoc();
    }
    setValue(close);
};
const setValue = (close) => {
    emailTemplates.value.setValue.submit({
        ...template,
        name: template.name,
    }, {
        onSuccess() {
            emailTemplates.value.reload();
            refreshForm(close);
            toast.success(__('Email Template updated successfully'));
        },
        onError(err) {
            refreshForm(close);
            toast.error(cleanError(err.messages[0]) || __('Error updating email template'));
        },
    });
};
const renameDoc = async () => {
    await call('frappe.client.rename_doc', {
        doctype: 'Email Template',
        old_name: props.templateID,
        new_name: template.name,
    });
};
watch(() => props.templateID, (val) => {
    if (val !== 'new') {
        emailTemplates.value?.data.forEach((row) => {
            if (row.name === val) {
                template.name = row.name;
                template.subject = row.subject;
                template.use_html = row.use_html;
                template.response = row.response;
                template.response_html = row.response_html;
            }
        });
    }
}, { flush: 'post' });
const refreshForm = (close) => {
    close();
    template.name = '';
    template.subject = '';
    template.use_html = false;
    template.response = '';
    template.response_html = '';
};
let __VLS_modelEmit;
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.templateID == 'new'
            ? __VLS_ctx.__('New Email Template')
            : __VLS_ctx.__('Edit Email Template'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: ({ close }) => {
                    __VLS_ctx.saveTemplate(close);
                },
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.templateID == 'new'
            ? __VLS_ctx.__('New Email Template')
            : __VLS_ctx.__('Edit Email Template'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: ({ close }) => {
                    __VLS_ctx.saveTemplate(close);
                },
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        label: (__VLS_ctx.__('Name')),
        modelValue: (__VLS_ctx.template.name),
        type: "text",
        required: (true),
        placeholder: (__VLS_ctx.__('Batch Enrollment Confirmation')),
    }));
    const __VLS_10 = __VLS_9({
        label: (__VLS_ctx.__('Name')),
        modelValue: (__VLS_ctx.template.name),
        type: "text",
        required: (true),
        placeholder: (__VLS_ctx.__('Batch Enrollment Confirmation')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        label: (__VLS_ctx.__('Subject')),
        modelValue: (__VLS_ctx.template.subject),
        type: "text",
        required: (true),
        placeholder: (__VLS_ctx.__('Your enrollment in {{ batch_name }} is confirmed')),
    }));
    const __VLS_15 = __VLS_14({
        label: (__VLS_ctx.__('Subject')),
        modelValue: (__VLS_ctx.template.subject),
        type: "text",
        required: (true),
        placeholder: (__VLS_ctx.__('Your enrollment in {{ batch_name }} is confirmed')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        label: (__VLS_ctx.__('Use HTML')),
        modelValue: (__VLS_ctx.template.use_html),
        type: "checkbox",
    }));
    const __VLS_20 = __VLS_19({
        label: (__VLS_ctx.__('Use HTML')),
        modelValue: (__VLS_ctx.template.use_html),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    if (__VLS_ctx.template.use_html) {
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            label: (__VLS_ctx.__('Content')),
            modelValue: (__VLS_ctx.template.response_html),
            type: "textarea",
            required: (true),
            rows: (10),
            placeholder: (__VLS_ctx.__('<p>Dear {{ member_name }},</p>\n\n<p>You have been enrolled in our upcoming batch {{ batch_name }}.</p>\n\n<p>Thanks,</p>\n<p>Frappe Learning</p>')),
        }));
        const __VLS_25 = __VLS_24({
            label: (__VLS_ctx.__('Content')),
            modelValue: (__VLS_ctx.template.response_html),
            type: "textarea",
            required: (true),
            rows: (10),
            placeholder: (__VLS_ctx.__('<p>Dear {{ member_name }},</p>\n\n<p>You have been enrolled in our upcoming batch {{ batch_name }}.</p>\n\n<p>Thanks,</p>\n<p>Frappe Learning</p>')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs text-ink-gray-5 mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        (__VLS_ctx.__('Content'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-red-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
        TextEditor;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
            ...{ 'onChange': {} },
            content: (__VLS_ctx.template.response),
            editable: (true),
            fixedMenu: (true),
            placeholder: (__VLS_ctx.__('Dear {{ member_name }},\n\nYou have been enrolled in our upcoming batch {{ batch_name }}.\n\nThanks,\nFrappe Learning')),
            editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] max-h-[18rem] overflow-y-auto",
        }));
        const __VLS_30 = __VLS_29({
            ...{ 'onChange': {} },
            content: (__VLS_ctx.template.response),
            editable: (true),
            fixedMenu: (true),
            placeholder: (__VLS_ctx.__('Dear {{ member_name }},\n\nYou have been enrolled in our upcoming batch {{ batch_name }}.\n\nThanks,\nFrappe Learning')),
            editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] max-h-[18rem] overflow-y-auto",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        let __VLS_33;
        const __VLS_34 = ({ change: {} },
            { onChange: ((val) => (__VLS_ctx.template.response = val)) });
        var __VLS_31;
        var __VLS_32;
    }
    // @ts-ignore
    [show, templateID, __, __, __, __, __, __, __, __, __, __, __, __, saveTemplate, template, template, template, template, template, template, template,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        ...{},
        ...{
            templateID: {
                type: String,
                default: 'new',
            },
        },
    },
});
export default {};
