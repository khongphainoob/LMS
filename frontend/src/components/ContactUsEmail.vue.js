/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, call, Dialog, FormControl, TextEditor, toast } from 'frappe-ui';
import { ref } from 'vue';
import { useSettings } from '@/stores/settings';
const show = defineModel({ required: true, default: false });
const subject = ref('');
const message = ref('');
const settingsStore = useSettings();
const sendMail = (close) => {
    call('frappe.core.doctype.communication.email.make', {
        recipients: settingsStore.settings?.data?.contact_us_email,
        subject: subject.value,
        content: message.value,
        send_email: true,
    })
        .then(() => {
        toast.success(__('Email sent successfully'));
        close();
        subject.value = '';
        message.value = '';
    })
        .catch(() => {
        toast.error(__('Failed to send email'));
        close();
    });
};
const __VLS_defaultModels = {
    'modelValue': false,
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
        title: __VLS_ctx.__('Contact Us'),
        size: 'md',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Contact Us'),
        size: 'md',
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
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.subject),
        label: (__VLS_ctx.__('Subject')),
        type: "text",
        required: (true),
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.subject),
        label: (__VLS_ctx.__('Subject')),
        type: "text",
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1.5 text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Message'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        ...{ 'onChange': {} },
        fixedMenu: (true),
        editorClass: "prose-sm py-2 px-2 min-h-[200px] border-outline-gray-2 hover:border-outline-gray-3 rounded-b-md bg-surface-gray-3",
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onChange': {} },
        fixedMenu: (true),
        editorClass: "prose-sm py-2 px-2 min-h-[200px] border-outline-gray-2 hover:border-outline-gray-3 rounded-b-md bg-surface-gray-3",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    const __VLS_19 = ({ change: {} },
        { onChange: ((val) => (__VLS_ctx.message = val)) });
    var __VLS_16;
    var __VLS_17;
    // @ts-ignore
    [show, __, __, __, subject, message,];
}
{
    const { actions: __VLS_20 } = __VLS_3.slots;
    const [{ close }] = __VLS_vSlot(__VLS_20);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pb-5 float-right" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['float-right']} */ ;
    let __VLS_21;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_23 = __VLS_22({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    let __VLS_26;
    const __VLS_27 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.sendMail(close);
                // @ts-ignore
                [sendMail,];
            } });
    const { default: __VLS_28 } = __VLS_24.slots;
    (__VLS_ctx.__('Send'));
    // @ts-ignore
    [__,];
    var __VLS_24;
    var __VLS_25;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
