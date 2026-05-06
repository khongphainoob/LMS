/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, Input, TextEditor, createResource, toast } from 'frappe-ui';
import { reactive } from 'vue';
const show = defineModel();
const props = defineProps({
    batch: {
        type: String,
        required: true,
    },
    students: {
        type: Array,
        required: true,
    },
});
const announcement = reactive({
    subject: '',
    replyTo: '',
    announcement: '',
});
const announcementResource = createResource({
    url: 'frappe.core.doctype.communication.email.make',
    makeParams(values) {
        return {
            recipients: announcement.replyTo,
            bcc: props.students.join(', '),
            subject: announcement.subject,
            content: announcement.announcement,
            doctype: 'LMS Batch',
            name: props.batch,
            send_email: 1,
        };
    },
});
const makeAnnouncement = (close) => {
    announcementResource.submit({}, {
        validate() {
            if (!props.students.length) {
                return __('No students in this batch');
            }
            if (!announcement.subject) {
                return __('Subject is required');
            }
            if (!announcement.announcement) {
                return __('Announcement is required');
            }
            if (!announcement.replyTo) {
                return __('Reply To is required');
            }
        },
        onSuccess() {
            close();
            toast.success(__('Announcement has been sent successfully'));
        },
        onError(err) {
            toast.error(__(err.messages?.[0] || err));
        },
    });
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
        title: __VLS_ctx.__('Make an Announcement'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.makeAnnouncement(close),
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Make an Announcement'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.makeAnnouncement(close),
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1.5 text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Subject'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        type: "text",
        modelValue: (__VLS_ctx.announcement.subject),
    }));
    const __VLS_10 = __VLS_9({
        type: "text",
        modelValue: (__VLS_ctx.announcement.subject),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1.5 text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Reply To'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        type: "text",
        modelValue: (__VLS_ctx.announcement.replyTo),
    }));
    const __VLS_15 = __VLS_14({
        type: "text",
        modelValue: (__VLS_ctx.announcement.replyTo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1.5 text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Announcement'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ 'onChange': {} },
        fixedMenu: (true),
        editorClass: "prose-sm py-2 px-2 min-h-[200px] border-outline-gray-2 hover:border-outline-gray-3 rounded-b-md bg-surface-gray-3",
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onChange': {} },
        fixedMenu: (true),
        editorClass: "prose-sm py-2 px-2 min-h-[200px] border-outline-gray-2 hover:border-outline-gray-3 rounded-b-md bg-surface-gray-3",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = ({ change: {} },
        { onChange: ((val) => (__VLS_ctx.announcement.announcement = val)) });
    var __VLS_21;
    var __VLS_22;
    // @ts-ignore
    [show, __, __, __, __, __, makeAnnouncement, announcement, announcement, announcement,];
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
            batch: {
                type: String,
                required: true,
            },
            students: {
                type: Array,
                required: true,
            },
        },
    },
});
export default {};
