/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { createListResource } from 'frappe-ui';
import CouponList from '@/components/Settings/Coupons/CouponList.vue';
import CouponDetails from '@/components/Settings/Coupons/CouponDetails.vue';
const step = ref('list');
const data = ref(null);
const props = defineProps();
const updateStep = (newStep, newData) => {
    step.value = newStep;
    if (newData) {
        data.value = newData;
    }
};
const coupons = createListResource({
    doctype: 'LMS Coupon',
    fields: [
        'name',
        'code',
        'discount_type',
        'percentage_discount',
        'fixed_amount_discount',
        'expires_on',
        'usage_limit',
        'redemption_count',
        'enabled',
    ],
    auto: true,
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.step === 'list') {
    const __VLS_0 = CouponList;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onUpdateStep': {} },
        label: (props.label),
        description: (props.description),
        coupons: (__VLS_ctx.coupons),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onUpdateStep': {} },
        label: (props.label),
        description: (props.description),
        coupons: (__VLS_ctx.coupons),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ updateStep: {} },
        { onUpdateStep: (__VLS_ctx.updateStep) });
    var __VLS_7 = {};
    var __VLS_3;
    var __VLS_4;
}
else if (__VLS_ctx.step == 'details') {
    const __VLS_8 = CouponDetails;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        ...{ 'onUpdateStep': {} },
        coupons: (__VLS_ctx.coupons),
        data: (__VLS_ctx.data),
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onUpdateStep': {} },
        coupons: (__VLS_ctx.coupons),
        data: (__VLS_ctx.data),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    const __VLS_14 = ({ updateStep: {} },
        { onUpdateStep: (__VLS_ctx.updateStep) });
    var __VLS_15 = {};
    var __VLS_11;
    var __VLS_12;
}
// @ts-ignore
[step, step, coupons, coupons, updateStep, updateStep, data,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
