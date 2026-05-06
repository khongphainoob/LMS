/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, FormControl, toast } from 'frappe-ui';
import { ref } from 'vue';
import { ChevronLeft } from 'lucide-vue-next';
import CouponItems from '@/components/Settings/Coupons/CouponItems.vue';
const couponItems = ref(null);
const emit = defineEmits(['updateStep']);
const props = defineProps();
const saveCoupon = () => {
    if (props.data?.name) {
        editCoupon();
    }
    else {
        createCoupon();
    }
};
const editCoupon = () => {
    props.coupons.setValue.submit({
        ...props.data,
    }, {
        onSuccess(data) {
            if (couponItems.value) {
                couponItems.value.saveItems();
            }
        },
    });
};
const createCoupon = () => {
    if (couponItems.value) {
        let rows = couponItems.value.saveItems();
        props.data.applicable_items = rows;
    }
    props.coupons.insert.submit({
        ...props.data,
    }, {
        onSuccess(data) {
            toast.success(__('Coupon created successfully'));
            emit('updateStep', 'details', { ...data });
        },
        onError(err) {
            toast.error(err.messages?.[0] || err.message || err);
            console.error(err);
        },
    });
};
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col text-base h-full" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-2 mb-8 -ml-1.5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['-ml-1.5']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.ChevronLeft} */
ChevronLeft;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    ...{ class: "size-5 stroke-1.5 text-ink-gray-7 cursor-pointer" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: "size-5 stroke-1.5 text-ink-gray-7 cursor-pointer" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('updateStep', 'list');
            // @ts-ignore
            [emit,];
        } });
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.data?.name ? __VLS_ctx.__('Edit Coupon') : __VLS_ctx.__('New Coupon'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-4 overflow-y-auto" },
});
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    modelValue: (__VLS_ctx.data.enabled),
    label: (__VLS_ctx.__('Enabled')),
    type: "checkbox",
}));
const __VLS_9 = __VLS_8({
    modelValue: (__VLS_ctx.data.enabled),
    label: (__VLS_ctx.__('Enabled')),
    type: "checkbox",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-2 gap-4" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
let __VLS_12;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.data.code),
    label: (__VLS_ctx.__('Coupon Code')),
    required: (true),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.data.code),
    label: (__VLS_ctx.__('Coupon Code')),
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_17;
const __VLS_18 = ({ input: {} },
    { onInput: (() => (__VLS_ctx.data.code = __VLS_ctx.data.code.toUpperCase())) });
var __VLS_15;
var __VLS_16;
let __VLS_19;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    modelValue: (__VLS_ctx.data.discount_type),
    label: (__VLS_ctx.__('Discount Type')),
    required: (true),
    type: "select",
    options: (['Percentage', 'Fixed Amount']),
}));
const __VLS_21 = __VLS_20({
    modelValue: (__VLS_ctx.data.discount_type),
    label: (__VLS_ctx.__('Discount Type')),
    required: (true),
    type: "select",
    options: (['Percentage', 'Fixed Amount']),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_24;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.data.expires_on),
    label: (__VLS_ctx.__('Expires On')),
    type: "date",
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.data.expires_on),
    label: (__VLS_ctx.__('Expires On')),
    type: "date",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
if (__VLS_ctx.data.discount_type === 'Percentage') {
    let __VLS_29;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        modelValue: (__VLS_ctx.data.percentage_discount),
        required: (true),
        label: (__VLS_ctx.__('Discount Percentage')),
        type: "number",
    }));
    const __VLS_31 = __VLS_30({
        modelValue: (__VLS_ctx.data.percentage_discount),
        required: (true),
        label: (__VLS_ctx.__('Discount Percentage')),
        type: "number",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
}
else {
    let __VLS_34;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
        modelValue: (__VLS_ctx.data.fixed_amount_discount),
        required: (true),
        label: (__VLS_ctx.__('Discount Amount')),
        type: "number",
    }));
    const __VLS_36 = __VLS_35({
        modelValue: (__VLS_ctx.data.fixed_amount_discount),
        required: (true),
        label: (__VLS_ctx.__('Discount Amount')),
        type: "number",
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
}
let __VLS_39;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    modelValue: (__VLS_ctx.data.usage_limit),
    label: (__VLS_ctx.__('Usage Limit')),
    type: "number",
}));
const __VLS_41 = __VLS_40({
    modelValue: (__VLS_ctx.data.usage_limit),
    label: (__VLS_ctx.__('Usage Limit')),
    type: "number",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
let __VLS_44;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.data.redemptions_count),
    label: (__VLS_ctx.__('Redemptions Count')),
    type: "number",
    disabled: (true),
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.data.redemptions_count),
    label: (__VLS_ctx.__('Redemptions Count')),
    type: "number",
    disabled: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "py-8" },
});
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "font-semibold text-ink-gray-9 mb-2" },
});
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
(__VLS_ctx.__('Applicable For'));
const __VLS_49 = CouponItems;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    ref: "couponItems",
    data: (__VLS_ctx.data),
    coupons: (__VLS_ctx.coupons),
}));
const __VLS_51 = __VLS_50({
    ref: "couponItems",
    data: (__VLS_ctx.data),
    coupons: (__VLS_ctx.coupons),
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
var __VLS_54 = {};
var __VLS_52;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-auto space-x-2 ml-auto" },
});
/** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
let __VLS_56;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    ...{ 'onClick': {} },
    variant: "solid",
}));
const __VLS_58 = __VLS_57({
    ...{ 'onClick': {} },
    variant: "solid",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_61;
const __VLS_62 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.saveCoupon();
            // @ts-ignore
            [data, data, data, data, data, data, data, data, data, data, data, data, data, __, __, __, __, __, __, __, __, __, __, __, coupons, saveCoupon,];
        } });
const { default: __VLS_63 } = __VLS_59.slots;
(__VLS_ctx.__('Save'));
// @ts-ignore
[__,];
var __VLS_59;
var __VLS_60;
// @ts-ignore
var __VLS_55 = __VLS_54;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    __typeProps: {},
});
export default {};
