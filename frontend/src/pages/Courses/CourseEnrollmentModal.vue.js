/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, call, Dialog, FormControl, toast } from 'frappe-ui';
import { ref } from 'vue';
import { openSettings } from '@/utils';
import Link from '@/components/Controls/Link.vue';
const show = defineModel({ required: true, default: false });
const student = ref(null);
const payment = ref(null);
const purchasedCertificate = ref(false);
const props = defineProps();
const enrollStudent = (close) => {
    let validationPassed = validateData();
    if (!validationPassed)
        return;
    call('frappe.client.insert', {
        doc: {
            doctype: 'LMS Enrollment',
            course: props.course.data?.name,
            member: student.value,
            payment: purchasedCertificate.value ? payment.value : null,
            purchased_certificate: purchasedCertificate.value,
        },
    })
        .then(() => {
        toast.success(__('Student enrolled successfully'));
        close();
    })
        .catch((err) => {
        toast.error(__(err.messages?.[0] || err));
        console.error(err);
    });
};
const validateData = () => {
    if (!student.value) {
        toast.error(__('Please select a student to enroll.'));
        return false;
    }
    if (purchasedCertificate.value && !payment.value) {
        toast.error(__('Please select a payment for the purchased certificate.'));
        return false;
    }
    return true;
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
        title: __VLS_ctx.__('Enroll a Student'),
        size: 'xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Enroll a Student'),
        size: 'xl',
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
        type: "checkbox",
        label: (__VLS_ctx.__('Purchased Certificate')),
        modelValue: (__VLS_ctx.purchasedCertificate),
    }));
    const __VLS_10 = __VLS_9({
        type: "checkbox",
        label: (__VLS_ctx.__('Purchased Certificate')),
        modelValue: (__VLS_ctx.purchasedCertificate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_13 = Link;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        doctype: "User",
        label: (__VLS_ctx.__('Student')),
        placeholder: " ",
        modelValue: (__VLS_ctx.student),
        required: (true),
        onCreate: (() => {
            __VLS_ctx.openSettings('Members');
            __VLS_ctx.show = false;
        }),
    }));
    const __VLS_15 = __VLS_14({
        doctype: "User",
        label: (__VLS_ctx.__('Student')),
        placeholder: " ",
        modelValue: (__VLS_ctx.student),
        required: (true),
        onCreate: (() => {
            __VLS_ctx.openSettings('Members');
            __VLS_ctx.show = false;
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    if (__VLS_ctx.purchasedCertificate) {
        const __VLS_18 = Link;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            doctype: "LMS Payment",
            label: (__VLS_ctx.__('Payment')),
            placeholder: " ",
            modelValue: (__VLS_ctx.payment),
            onCreate: (() => {
                __VLS_ctx.openSettings('Transactions');
                __VLS_ctx.show = false;
            }),
        }));
        const __VLS_20 = __VLS_19({
            doctype: "LMS Payment",
            label: (__VLS_ctx.__('Payment')),
            placeholder: " ",
            modelValue: (__VLS_ctx.payment),
            onCreate: (() => {
                __VLS_ctx.openSettings('Transactions');
                __VLS_ctx.show = false;
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    }
    // @ts-ignore
    [show, show, show, __, __, __, __, purchasedCertificate, purchasedCertificate, student, openSettings, openSettings, payment,];
}
{
    const { actions: __VLS_23 } = __VLS_3.slots;
    const [{ close }] = __VLS_vSlot(__VLS_23);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    let __VLS_24;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_29;
    const __VLS_30 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.enrollStudent(close);
                // @ts-ignore
                [enrollStudent,];
            } });
    const { default: __VLS_31 } = __VLS_27.slots;
    (__VLS_ctx.__('Enroll'));
    // @ts-ignore
    [__,];
    var __VLS_27;
    var __VLS_28;
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
