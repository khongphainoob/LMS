/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, createResource, FormControl, Breadcrumbs, usePageMeta, toast, call, } from 'frappe-ui';
import { reactive, inject, onMounted, computed, ref, watch } from 'vue';
import { sessionStore } from '../stores/session';
import Link from '@/components/Controls/Link.vue';
import NotPermitted from '@/components/NotPermitted.vue';
import { X } from 'lucide-vue-next';
import { useTelemetry } from 'frappe-ui/frappe';
import { getLmsRoute } from '@/utils/basePath';
const user = inject('$user');
const { brand } = sessionStore();
const showConsentWarning = ref(false);
const { capture } = useTelemetry();
onMounted(() => {
    const script = document.createElement('script');
    script.src = `https://checkout.razorpay.com/v1/checkout.js`;
    document.body.appendChild(script);
    if (user.data?.name) {
        access.submit();
    }
});
const props = defineProps({
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
});
const access = createResource({
    url: 'lms.lms.api.validate_billing_access',
    params: {
        billing_type: props.type,
        name: props.name,
    },
    onSuccess(data) {
        setBillingDetails(data.address);
        orderSummary.submit();
    },
});
const orderSummary = createResource({
    url: 'lms.lms.utils.get_order_summary',
    makeParams(values) {
        return {
            doctype: props.type == 'batch' ? 'LMS Batch' : 'LMS Course',
            docname: props.name,
            country: billingDetails.country,
            coupon: appliedCoupon.value,
        };
    },
    onError(err) {
        showError(err);
    },
});
const appliedCoupon = ref(null);
const billingDetails = reactive({});
const setBillingDetails = (data) => {
    billingDetails.billing_name = data?.billing_name || '';
    billingDetails.address_line1 = data?.address_line1 || '';
    billingDetails.address_line2 = data?.address_line2 || '';
    billingDetails.city = data?.city || '';
    billingDetails.state = data?.state || '';
    billingDetails.country = data?.country || '';
    billingDetails.pincode = data?.pincode || '';
    billingDetails.phone = data?.phone || '';
    billingDetails.source = data?.source || '';
    billingDetails.gstin = data?.gstin || '';
    billingDetails.pan = data?.pan || '';
};
const paymentLink = createResource({
    url: 'lms.lms.payments.get_payment_link',
    makeParams(values) {
        let data = {
            doctype: props.type == 'batch' ? 'LMS Batch' : 'LMS Course',
            docname: props.name,
            title: orderSummary.data.title,
            amount: orderSummary.data.original_amount,
            discount_amount: orderSummary.data.discount_amount || 0,
            gst_amount: orderSummary.data.gst_applied || 0,
            currency: orderSummary.data.currency,
            address: billingDetails,
            redirect_to: redirectTo.value,
            payment_for_certificate: props.type == 'certificate',
            coupon_code: appliedCoupon.value,
            coupon: orderSummary.data.coupon,
        };
        return data;
    },
});
const generatePaymentLink = () => {
    paymentLink.submit({}, {
        validate() {
            if (!billingDetails.source) {
                return __('Please let us know where you heard about us from.');
            }
            if (!billingDetails.member_consent) {
                showConsentWarning.value = true;
                return __('Please provide your consent to proceed with the payment.');
            }
            return validateAddress();
        },
        onSuccess(data) {
            capture('checkout_initiated', { type: props.type });
            window.location.href = data;
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
function applyCouponCode() {
    if (!appliedCoupon.value) {
        toast.error(__('Please enter a coupon code'));
        return;
    }
    orderSummary.reload();
}
function removeCoupon() {
    appliedCoupon.value = null;
    orderSummary.reload();
}
const validateAddress = () => {
    let mandatoryFields = [
        'billing_name',
        'address_line1',
        'city',
        'pincode',
        'country',
        'phone',
        'source',
    ];
    for (let field of mandatoryFields) {
        if (!billingDetails[field])
            return ('Please enter a valid ' +
                field
                    .replaceAll('_', ' ')
                    .toLowerCase()
                    .replace(/\b\w/g, (s) => s.toUpperCase()));
    }
    if (billingDetails.gstin && !billingDetails.pan)
        return 'Please enter a valid pan number.';
    if (billingDetails.country == 'India' && !billingDetails.state)
        return 'Please enter a valid state with correct spelling and the first letter capitalized.';
    const states = [
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chhattisgarh',
        'Delhi',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jammu and Kashmir',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttar Pradesh',
        'Uttarakhand',
        'West Bengal',
    ];
    if (billingDetails.country == 'India' &&
        !states.includes(billingDetails.state))
        return 'Please enter a valid state with correct spelling and the first letter capitalized.';
};
const showError = (err) => {
    toast.error(err.messages?.[0] || err);
};
const changeCurrency = (country) => {
    billingDetails.country = country;
    orderSummary.reload();
};
const redirectTo = computed(() => {
    if (props.type == 'course') {
        return getLmsRoute(`courses/${props.name}`);
    }
    else if (props.type == 'batch') {
        return getLmsRoute(`batches/${props.name}`);
    }
    else if (props.type == 'certificate') {
        return getLmsRoute(`courses/${props.name}/certification`);
    }
});
watch(billingDetails, () => {
    if (billingDetails.member_consent) {
        showConsentWarning.value = false;
    }
});
usePageMeta(() => {
    return {
        title: __('Billing Details'),
        icon: brand.favicon,
    };
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "" },
});
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-5']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Breadcrumbs} */
Breadcrumbs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "h-7" },
    items: ([{ label: __VLS_ctx.__('Billing Details'), route: { name: 'Billing' } }]),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-7" },
    items: ([{ label: __VLS_ctx.__('Billing Details'), route: { name: 'Billing' } }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
if (__VLS_ctx.access.data?.access && __VLS_ctx.orderSummary.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pt-5 pb-10 mx-5" },
    });
    /** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col lg:flex-row justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col lg:order-last mb-10 lg:mt-10 lg:w-1/4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:order-last']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:mt-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:w-1/4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-fit bg-surface-gray-2 rounded-md p-5 space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['h-fit']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-5 uppercase text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.__('Payment for '));
    (__VLS_ctx.type);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "leading-5 text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.orderSummary.data.title);
    if (__VLS_ctx.orderSummary.data.gst_applied ||
        __VLS_ctx.orderSummary.data.discount_amount) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5 uppercase text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        (__VLS_ctx.__('Original Amount'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.orderSummary.data.original_amount_formatted);
    }
    if (__VLS_ctx.orderSummary.data.discount_amount) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (__VLS_ctx.__('Discount'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (__VLS_ctx.orderSummary.data.discount_amount_formatted);
    }
    if (__VLS_ctx.orderSummary.data.gst_applied) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5 uppercase text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        (__VLS_ctx.__('GST Amount'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.orderSummary.data.gst_amount_formatted);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-1 border-t border-outline-gray-3 pt-4 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "uppercase text-ink-gray-5 text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.__('Total'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.orderSummary.data.total_amount_formatted);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-surface-gray-2 rounded-md p-4 space-y-2 my-5" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-gray-5 uppercase text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.__('Enter a Coupon Code'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onInput': {} },
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.appliedCoupon),
        disabled: (__VLS_ctx.orderSummary.data.discount_amount > 0),
        placeholder: "COUPON2025",
        autocomplete: "off",
        ...{ class: "flex-1 [&_input]:bg-white" },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onInput': {} },
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.appliedCoupon),
        disabled: (__VLS_ctx.orderSummary.data.discount_amount > 0),
        placeholder: "COUPON2025",
        autocomplete: "off",
        ...{ class: "flex-1 [&_input]:bg-white" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ input: {} },
        { onInput: (...[$event]) => {
                if (!(__VLS_ctx.access.data?.access && __VLS_ctx.orderSummary.data))
                    return;
                __VLS_ctx.appliedCoupon = $event.target.value.toUpperCase();
                // @ts-ignore
                [__, __, __, __, __, __, __, access, orderSummary, orderSummary, orderSummary, orderSummary, orderSummary, orderSummary, orderSummary, orderSummary, orderSummary, orderSummary, orderSummary, type, appliedCoupon, appliedCoupon,];
            } });
    const __VLS_12 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.applyCouponCode) });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['[&_input]:bg-white']} */ ;
    var __VLS_8;
    var __VLS_9;
    if (!__VLS_ctx.orderSummary.data.discount_amount) {
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            ...{ 'onClick': {} },
            variant: "outline",
        }));
        const __VLS_15 = __VLS_14({
            ...{ 'onClick': {} },
            variant: "outline",
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_18;
        const __VLS_19 = ({ click: {} },
            { onClick: (__VLS_ctx.applyCouponCode) });
        const { default: __VLS_20 } = __VLS_16.slots;
        (__VLS_ctx.__('Apply'));
        // @ts-ignore
        [__, orderSummary, applyCouponCode, applyCouponCode,];
        var __VLS_16;
        var __VLS_17;
    }
    if (__VLS_ctx.orderSummary.data.discount_amount) {
        let __VLS_21;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
            ...{ 'onClick': {} },
            variant: "outline",
        }));
        const __VLS_23 = __VLS_22({
            ...{ 'onClick': {} },
            variant: "outline",
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        let __VLS_26;
        const __VLS_27 = ({ click: {} },
            { onClick: (__VLS_ctx.removeCoupon) });
        const { default: __VLS_28 } = __VLS_24.slots;
        {
            const { icon: __VLS_29 } = __VLS_24.slots;
            let __VLS_30;
            /** @ts-ignore @type { | typeof __VLS_components.X} */
            X;
            // @ts-ignore
            const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_32 = __VLS_31({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_31));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [orderSummary, removeCoupon,];
        }
        // @ts-ignore
        [];
        var __VLS_24;
        var __VLS_25;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "bg-surface-amber-2 text-ink-amber-2 text-sm leading-5 p-2 rounded-md" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-amber-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-amber-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    (__VLS_ctx.__('Please ensure that the billing name you enter is correct, as it will be used on your invoice.'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 lg:mr-10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:mr-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Address'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        label: (__VLS_ctx.__('Billing Name')),
        modelValue: (__VLS_ctx.billingDetails.billing_name),
        required: (true),
    }));
    const __VLS_37 = __VLS_36({
        label: (__VLS_ctx.__('Billing Name')),
        modelValue: (__VLS_ctx.billingDetails.billing_name),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        label: (__VLS_ctx.__('Address Line 1')),
        modelValue: (__VLS_ctx.billingDetails.address_line1),
        required: (true),
    }));
    const __VLS_42 = __VLS_41({
        label: (__VLS_ctx.__('Address Line 1')),
        modelValue: (__VLS_ctx.billingDetails.address_line1),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_45;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
        label: (__VLS_ctx.__('Address Line 2')),
        modelValue: (__VLS_ctx.billingDetails.address_line2),
    }));
    const __VLS_47 = __VLS_46({
        label: (__VLS_ctx.__('Address Line 2')),
        modelValue: (__VLS_ctx.billingDetails.address_line2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    let __VLS_50;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        label: (__VLS_ctx.__('City')),
        modelValue: (__VLS_ctx.billingDetails.city),
        required: (true),
    }));
    const __VLS_52 = __VLS_51({
        label: (__VLS_ctx.__('City')),
        modelValue: (__VLS_ctx.billingDetails.city),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    let __VLS_55;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        label: (__VLS_ctx.__('State/Province')),
        modelValue: (__VLS_ctx.billingDetails.state),
    }));
    const __VLS_57 = __VLS_56({
        label: (__VLS_ctx.__('State/Province')),
        modelValue: (__VLS_ctx.billingDetails.state),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    const __VLS_60 = Link;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
        ...{ 'onChange': {} },
        doctype: "Country",
        value: (__VLS_ctx.billingDetails.country),
        label: (__VLS_ctx.__('Country')),
        required: (true),
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onChange': {} },
        doctype: "Country",
        value: (__VLS_ctx.billingDetails.country),
        label: (__VLS_ctx.__('Country')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_65;
    const __VLS_66 = ({ change: {} },
        { onChange: ((option) => __VLS_ctx.changeCurrency(option)) });
    var __VLS_63;
    var __VLS_64;
    let __VLS_67;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        label: (__VLS_ctx.__('Postal Code')),
        modelValue: (__VLS_ctx.billingDetails.pincode),
        required: (true),
    }));
    const __VLS_69 = __VLS_68({
        label: (__VLS_ctx.__('Postal Code')),
        modelValue: (__VLS_ctx.billingDetails.pincode),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    let __VLS_72;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        label: (__VLS_ctx.__('Phone Number')),
        modelValue: (__VLS_ctx.billingDetails.phone),
        required: (true),
    }));
    const __VLS_74 = __VLS_73({
        label: (__VLS_ctx.__('Phone Number')),
        modelValue: (__VLS_ctx.billingDetails.phone),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    const __VLS_77 = Link;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
        ...{ 'onChange': {} },
        doctype: "LMS Source",
        value: (__VLS_ctx.billingDetails.source),
        label: (__VLS_ctx.__('Where did you hear about us?')),
        required: (true),
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onChange': {} },
        doctype: "LMS Source",
        value: (__VLS_ctx.billingDetails.source),
        label: (__VLS_ctx.__('Where did you hear about us?')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_82;
    const __VLS_83 = ({ change: {} },
        { onChange: ((option) => (__VLS_ctx.billingDetails.source = option)) });
    var __VLS_80;
    var __VLS_81;
    if (__VLS_ctx.billingDetails.country == 'India') {
        let __VLS_84;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
            label: (__VLS_ctx.__('GST Number')),
            modelValue: (__VLS_ctx.billingDetails.gstin),
        }));
        const __VLS_86 = __VLS_85({
            label: (__VLS_ctx.__('GST Number')),
            modelValue: (__VLS_ctx.billingDetails.gstin),
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    }
    if (__VLS_ctx.billingDetails.country == 'India') {
        let __VLS_89;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
            label: (__VLS_ctx.__('PAN Number')),
            modelValue: (__VLS_ctx.billingDetails.pan),
        }));
        const __VLS_91 = __VLS_90({
            label: (__VLS_ctx.__('PAN Number')),
            modelValue: (__VLS_ctx.billingDetails.pan),
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col lg:flex-row items-start lg:items-center justify-between border-t pt-4 mt-8 space-y-4 lg:space-y-0" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:space-y-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    let __VLS_94;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
        label: (__VLS_ctx.__('I consent to my personal information being stored for invoicing')),
        type: "checkbox",
        ...{ class: "leading-6" },
        modelValue: (__VLS_ctx.billingDetails.member_consent),
    }));
    const __VLS_96 = __VLS_95({
        label: (__VLS_ctx.__('I consent to my personal information being stored for invoicing')),
        type: "checkbox",
        ...{ class: "leading-6" },
        modelValue: (__VLS_ctx.billingDetails.member_consent),
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    if (__VLS_ctx.showConsentWarning) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-1 text-xs text-ink-red-3" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
        (__VLS_ctx.__('Please provide your consent to proceed with the payment'));
    }
    let __VLS_99;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
        ...{ 'onClick': {} },
        variant: "solid",
        size: "md",
    }));
    const __VLS_101 = __VLS_100({
        ...{ 'onClick': {} },
        variant: "solid",
        size: "md",
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    let __VLS_104;
    const __VLS_105 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.access.data?.access && __VLS_ctx.orderSummary.data))
                    return;
                __VLS_ctx.generatePaymentLink();
                // @ts-ignore
                [__, __, __, __, __, __, __, __, __, __, __, __, __, __, __, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, billingDetails, changeCurrency, showConsentWarning, generatePaymentLink,];
            } });
    const { default: __VLS_106 } = __VLS_102.slots;
    (__VLS_ctx.__('Proceed to Payment'));
    // @ts-ignore
    [__,];
    var __VLS_102;
    var __VLS_103;
}
else if (__VLS_ctx.access.data?.message) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    const __VLS_107 = NotPermitted;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
        text: (__VLS_ctx.access.data.message),
        buttonLabel: (__VLS_ctx.type == 'course' ? 'Checkout Course' : 'Checkout Batch'),
        buttonLink: (__VLS_ctx.type == 'course'
            ? __VLS_ctx.getLmsRoute(`courses/${__VLS_ctx.name}`)
            : __VLS_ctx.getLmsRoute(`batches/${__VLS_ctx.name}`)),
    }));
    const __VLS_109 = __VLS_108({
        text: (__VLS_ctx.access.data.message),
        buttonLabel: (__VLS_ctx.type == 'course' ? 'Checkout Course' : 'Checkout Batch'),
        buttonLink: (__VLS_ctx.type == 'course'
            ? __VLS_ctx.getLmsRoute(`courses/${__VLS_ctx.name}`)
            : __VLS_ctx.getLmsRoute(`batches/${__VLS_ctx.name}`)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
}
else if (!__VLS_ctx.user.data?.name) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    const __VLS_112 = NotPermitted;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
        text: "Please login to access this page.",
        buttonLink: (`/login?redirect-to=${__VLS_ctx.getLmsRoute(`billing/${__VLS_ctx.type}/${__VLS_ctx.name}`)}`),
    }));
    const __VLS_114 = __VLS_113({
        text: "Please login to access this page.",
        buttonLink: (`/login?redirect-to=${__VLS_ctx.getLmsRoute(`billing/${__VLS_ctx.type}/${__VLS_ctx.name}`)}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
}
// @ts-ignore
[access, access, type, type, type, getLmsRoute, getLmsRoute, getLmsRoute, name, name, name, user,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        type: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
});
export default {};
