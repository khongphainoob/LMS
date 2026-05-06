/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { call, Dialog, toast } from 'frappe-ui';
import { ref, inject } from 'vue';
import { useOnboarding } from 'frappe-ui/frappe';
import { openSettings } from '@/utils';
import Link from '@/components/Controls/Link.vue';
const students = defineModel('reloadStudents');
const batchModal = defineModel('batchModal');
const student = ref(null);
const payment = ref(null);
const user = inject('$user');
const { updateOnboardingStep } = useOnboarding('learning');
const show = defineModel();
const props = defineProps({
    batch: {
        type: String,
        default: null,
    },
});
const addStudent = (close) => {
    call('frappe.client.insert', {
        doc: {
            doctype: 'LMS Batch Enrollment',
            batch: props.batch,
            member: student.value,
            payment: payment.value,
        },
    })
        .then(() => {
        if (user.data?.is_system_manager)
            updateOnboardingStep('add_batch_student');
        students.value.reload();
        batchModal.value.reload();
        student.value = null;
        payment.value = null;
        close();
    })
        .catch((err) => {
        toast.error(err.messages?.[0] || err);
        console.error(err);
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
        title: __VLS_ctx.__('Enroll a Student'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.addStudent(close),
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Enroll a Student'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.addStudent(close),
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
    const __VLS_8 = Link;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        doctype: "User",
        modelValue: (__VLS_ctx.student),
        filters: ({ ignore_user_type: 1 }),
        placeholder: " ",
        label: (__VLS_ctx.__('Student')),
        onCreate: (() => {
            __VLS_ctx.openSettings('Members');
            __VLS_ctx.show = false;
        }),
        required: (true),
    }));
    const __VLS_10 = __VLS_9({
        doctype: "User",
        modelValue: (__VLS_ctx.student),
        filters: ({ ignore_user_type: 1 }),
        placeholder: " ",
        label: (__VLS_ctx.__('Student')),
        onCreate: (() => {
            __VLS_ctx.openSettings('Members');
            __VLS_ctx.show = false;
        }),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_13 = Link;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        doctype: "LMS Payment",
        modelValue: (__VLS_ctx.payment),
        placeholder: " ",
        label: (__VLS_ctx.__('Payment')),
        onCreate: (() => {
            __VLS_ctx.openSettings('Transactions');
            __VLS_ctx.show = false;
        }),
    }));
    const __VLS_15 = __VLS_14({
        doctype: "LMS Payment",
        modelValue: (__VLS_ctx.payment),
        placeholder: " ",
        label: (__VLS_ctx.__('Payment')),
        onCreate: (() => {
            __VLS_ctx.openSettings('Transactions');
            __VLS_ctx.show = false;
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    // @ts-ignore
    [show, show, show, __, __, __, __, addStudent, student, openSettings, openSettings, payment,];
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
                default: null,
            },
        },
    },
});
export default {};
