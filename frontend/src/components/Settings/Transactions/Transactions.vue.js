/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { createListResource } from 'frappe-ui';
import TransactionList from '@/components/Settings/Transactions/TransactionList.vue';
import TransactionDetails from '@/components/Settings/Transactions/TransactionDetails.vue';
const step = ref('list');
const data = ref(null);
const show = defineModel('show');
const props = defineProps();
const updateStep = (newStep, newData) => {
    step.value = newStep;
    if (newData) {
        data.value = newData;
    }
    else {
        data.value = null;
    }
};
const transactions = createListResource({
    doctype: 'LMS Payment',
    fields: [
        'name',
        'member',
        'billing_name',
        'source',
        'payment_for_document_type',
        'payment_for_document',
        'payment_received',
        'payment_for_certificate',
        'currency',
        'amount',
        'amount_with_gst',
        'coupon',
        'coupon_code',
        'discount_amount',
        'original_amount',
        'order_id',
        'payment_id',
        'gstin',
        'pan',
        'address',
    ],
    auto: true,
    orderBy: 'modified desc',
});
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
if (__VLS_ctx.step == 'new') {
    const __VLS_0 = TransactionDetails;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onUpdateStep': {} },
        transactions: (__VLS_ctx.transactions),
        data: (__VLS_ctx.data),
        show: (__VLS_ctx.show),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onUpdateStep': {} },
        transactions: (__VLS_ctx.transactions),
        data: (__VLS_ctx.data),
        show: (__VLS_ctx.show),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ updateStep: {} },
        { onUpdateStep: (__VLS_ctx.updateStep) });
    var __VLS_7 = {};
    var __VLS_3;
    var __VLS_4;
}
else if (__VLS_ctx.step === 'list') {
    const __VLS_8 = TransactionList;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        ...{ 'onUpdateStep': {} },
        label: (props.label),
        description: (props.description),
        transactions: (__VLS_ctx.transactions),
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onUpdateStep': {} },
        label: (props.label),
        description: (props.description),
        transactions: (__VLS_ctx.transactions),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    const __VLS_14 = ({ updateStep: {} },
        { onUpdateStep: (__VLS_ctx.updateStep) });
    var __VLS_15 = {};
    var __VLS_11;
    var __VLS_12;
}
else if (__VLS_ctx.step == 'details') {
    const __VLS_16 = TransactionDetails;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        ...{ 'onUpdateStep': {} },
        transactions: (__VLS_ctx.transactions),
        data: (__VLS_ctx.data),
        show: (__VLS_ctx.show),
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onUpdateStep': {} },
        transactions: (__VLS_ctx.transactions),
        data: (__VLS_ctx.data),
        show: (__VLS_ctx.show),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_21;
    const __VLS_22 = ({ updateStep: {} },
        { onUpdateStep: (__VLS_ctx.updateStep) });
    var __VLS_23 = {};
    var __VLS_19;
    var __VLS_20;
}
// @ts-ignore
[step, step, step, transactions, transactions, transactions, data, data, show, show, updateStep, updateStep, updateStep,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
