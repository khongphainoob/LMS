/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, FormControl, toast } from 'frappe-ui';
import { useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { ChevronLeft } from 'lucide-vue-next';
import Link from '@/components/Controls/Link.vue';
const router = useRouter();
const transactionData = ref(null);
const emit = defineEmits(['updateStep']);
const show = defineModel('show');
const props = defineProps();
const saveTransaction = () => {
    if (props.data?.name) {
        updateTransaction();
    }
    else {
        createTransaction();
    }
};
const createTransaction = () => {
    console.log(props.transactions);
    props.transactions.insert
        .submit({
        ...transactionData.value,
    })
        .then(() => {
        toast.success(__('Transaction created successfully'));
    })
        .catch((err) => {
        toast.error(__(err.messages?.[0] || err));
        console.error(err);
    });
};
const updateTransaction = () => {
    props.transactions.setValue
        .submit({
        ...transactionData.value,
    })
        .then(() => {
        toast.success(__('Transaction updated successfully'));
    })
        .catch((err) => {
        toast.error(__(err.messages?.[0] || err));
        console.error(err);
    });
};
const openDetails = () => {
    if (props.data) {
        const docType = props.data.payment_for_document_type;
        const docName = props.data.payment_for_document;
        if (docType && docName) {
            router.push({
                name: docType == 'LMS Course' ? 'CourseDetail' : 'BatchDetail',
                params: {
                    [docType == 'LMS Course' ? 'courseName' : 'batchName']: docName,
                },
            });
        }
        show.value = false;
    }
};
const emptyTransactionData = {
    payment_received: false,
    payment_for_certificate: false,
    member: null,
    billing_name: null,
    source: null,
    payment_for_document_type: null,
    payment_for_document: null,
    member_consent: false,
    currency: null,
    amount: null,
    amount_with_gst: null,
    coupon: null,
    coupon_code: null,
    discount_amount: null,
    original_amount: null,
    order_id: null,
    payment_id: null,
    gstin: null,
    pan: null,
    address: null,
};
watch(() => props.data, (newVal) => {
    transactionData.value = newVal ? { ...newVal } : emptyTransactionData;
}, { immediate: true });
const documentTypeOptions = computed(() => {
    return [
        {
            label: __('Course'),
            value: 'LMS Course',
        },
        {
            label: __('Batch'),
            value: 'LMS Batch',
        },
    ];
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col h-full text-base" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-10 -ml-1.5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-10']} */ ;
/** @type {__VLS_StyleScopedClasses['-ml-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
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
(__VLS_ctx.__('Transaction Details'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
if (__VLS_ctx.transactionData?.payment_for_document_type &&
    __VLS_ctx.transactionData?.payment_for_document) {
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        ...{ 'onClick': {} },
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.transactionData?.payment_for_document_type &&
                    __VLS_ctx.transactionData?.payment_for_document))
                    return;
                __VLS_ctx.openDetails();
                // @ts-ignore
                [__, transactionData, transactionData, openDetails,];
            } });
    const { default: __VLS_14 } = __VLS_10.slots;
    (__VLS_ctx.__('Open the '));
    (__VLS_ctx.transactionData.payment_for_document_type == 'LMS Course'
        ? __VLS_ctx.__('Course')
        : __VLS_ctx.__('Batch'));
    // @ts-ignore
    [__, __, __, transactionData,];
    var __VLS_10;
    var __VLS_11;
}
let __VLS_15;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    ...{ 'onClick': {} },
    variant: "solid",
}));
const __VLS_17 = __VLS_16({
    ...{ 'onClick': {} },
    variant: "solid",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
const __VLS_21 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.saveTransaction();
            // @ts-ignore
            [saveTransaction,];
        } });
const { default: __VLS_22 } = __VLS_18.slots;
(__VLS_ctx.__('Save'));
// @ts-ignore
[__,];
var __VLS_18;
var __VLS_19;
if (__VLS_ctx.transactionData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        label: (__VLS_ctx.__('Payment Received')),
        type: "checkbox",
        modelValue: (__VLS_ctx.transactionData.payment_received),
    }));
    const __VLS_25 = __VLS_24({
        label: (__VLS_ctx.__('Payment Received')),
        type: "checkbox",
        modelValue: (__VLS_ctx.transactionData.payment_received),
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_28;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        label: (__VLS_ctx.__('Payment For Certificate')),
        type: "checkbox",
        modelValue: (__VLS_ctx.transactionData.payment_for_certificate),
    }));
    const __VLS_30 = __VLS_29({
        label: (__VLS_ctx.__('Payment For Certificate')),
        type: "checkbox",
        modelValue: (__VLS_ctx.transactionData.payment_for_certificate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        label: (__VLS_ctx.__('Member Consent')),
        type: "checkbox",
        modelValue: (__VLS_ctx.transactionData.member_consent),
        disabled: (true),
    }));
    const __VLS_35 = __VLS_34({
        label: (__VLS_ctx.__('Member Consent')),
        type: "checkbox",
        modelValue: (__VLS_ctx.transactionData.member_consent),
        disabled: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-5 mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    const __VLS_38 = Link;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        label: (__VLS_ctx.__('Member')),
        doctype: "User",
        modelValue: (__VLS_ctx.transactionData.member),
        required: (true),
    }));
    const __VLS_40 = __VLS_39({
        label: (__VLS_ctx.__('Member')),
        doctype: "User",
        modelValue: (__VLS_ctx.transactionData.member),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    let __VLS_43;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        label: (__VLS_ctx.__('Billing Name')),
        modelValue: (__VLS_ctx.transactionData.billing_name),
        required: (true),
    }));
    const __VLS_45 = __VLS_44({
        label: (__VLS_ctx.__('Billing Name')),
        modelValue: (__VLS_ctx.transactionData.billing_name),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    const __VLS_48 = Link;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        label: (__VLS_ctx.__('Source')),
        modelValue: (__VLS_ctx.transactionData.source),
        doctype: "LMS Source",
    }));
    const __VLS_50 = __VLS_49({
        label: (__VLS_ctx.__('Source')),
        modelValue: (__VLS_ctx.transactionData.source),
        doctype: "LMS Source",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_53;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        type: "select",
        options: (__VLS_ctx.documentTypeOptions),
        label: (__VLS_ctx.__('Payment For Document Type')),
        modelValue: (__VLS_ctx.transactionData.payment_for_document_type),
        doctype: "DocType",
    }));
    const __VLS_55 = __VLS_54({
        type: "select",
        options: (__VLS_ctx.documentTypeOptions),
        label: (__VLS_ctx.__('Payment For Document Type')),
        modelValue: (__VLS_ctx.transactionData.payment_for_document_type),
        doctype: "DocType",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    if (__VLS_ctx.transactionData.payment_for_document_type) {
        const __VLS_58 = Link;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
            label: (__VLS_ctx.__('Payment For Document')),
            modelValue: (__VLS_ctx.transactionData.payment_for_document),
            doctype: (__VLS_ctx.transactionData.payment_for_document_type),
        }));
        const __VLS_60 = __VLS_59({
            label: (__VLS_ctx.__('Payment For Document')),
            modelValue: (__VLS_ctx.transactionData.payment_for_document),
            doctype: (__VLS_ctx.transactionData.payment_for_document_type),
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-semibold mt-10" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    (__VLS_ctx.__('Payment Details'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-5 mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    const __VLS_63 = Link;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
        label: (__VLS_ctx.__('Currency')),
        modelValue: (__VLS_ctx.transactionData.currency),
        doctype: "Currency",
        required: (true),
    }));
    const __VLS_65 = __VLS_64({
        label: (__VLS_ctx.__('Currency')),
        modelValue: (__VLS_ctx.transactionData.currency),
        doctype: "Currency",
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    let __VLS_68;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        label: (__VLS_ctx.__('Amount')),
        modelValue: (__VLS_ctx.transactionData.amount),
        required: (true),
    }));
    const __VLS_70 = __VLS_69({
        label: (__VLS_ctx.__('Amount')),
        modelValue: (__VLS_ctx.transactionData.amount),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    if (__VLS_ctx.transactionData.amount_with_gst) {
        let __VLS_73;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
            label: (__VLS_ctx.__('Amount with GST')),
            modelValue: (__VLS_ctx.transactionData.amount_with_gst),
        }));
        const __VLS_75 = __VLS_74({
            label: (__VLS_ctx.__('Amount with GST')),
            modelValue: (__VLS_ctx.transactionData.amount_with_gst),
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    }
    if (__VLS_ctx.transactionData.coupon) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-semibold mt-10" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
        (__VLS_ctx.__('Coupon Details'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-3 gap-5 mt-5" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
        if (__VLS_ctx.transactionData.coupon) {
            let __VLS_78;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
                label: (__VLS_ctx.__('Coupon Code')),
                modelValue: (__VLS_ctx.transactionData.coupon),
            }));
            const __VLS_80 = __VLS_79({
                label: (__VLS_ctx.__('Coupon Code')),
                modelValue: (__VLS_ctx.transactionData.coupon),
            }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        }
        if (__VLS_ctx.transactionData.coupon) {
            let __VLS_83;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
                label: (__VLS_ctx.__('Coupon Code')),
                modelValue: (__VLS_ctx.transactionData.coupon_code),
            }));
            const __VLS_85 = __VLS_84({
                label: (__VLS_ctx.__('Coupon Code')),
                modelValue: (__VLS_ctx.transactionData.coupon_code),
            }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        }
        if (__VLS_ctx.transactionData.coupon) {
            let __VLS_88;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
                label: (__VLS_ctx.__('Discount Amount')),
                modelValue: (__VLS_ctx.transactionData.discount_amount),
            }));
            const __VLS_90 = __VLS_89({
                label: (__VLS_ctx.__('Discount Amount')),
                modelValue: (__VLS_ctx.transactionData.discount_amount),
            }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        }
        if (__VLS_ctx.transactionData.coupon) {
            let __VLS_93;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
                label: (__VLS_ctx.__('Original Amount')),
                modelValue: (__VLS_ctx.transactionData.original_amount),
            }));
            const __VLS_95 = __VLS_94({
                label: (__VLS_ctx.__('Original Amount')),
                modelValue: (__VLS_ctx.transactionData.original_amount),
            }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-semibold mt-10" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    (__VLS_ctx.__('Billing Details'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-5 mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    const __VLS_98 = Link;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
        label: (__VLS_ctx.__('Address')),
        modelValue: (__VLS_ctx.transactionData.address),
        doctype: "Address",
        required: (true),
    }));
    const __VLS_100 = __VLS_99({
        label: (__VLS_ctx.__('Address')),
        modelValue: (__VLS_ctx.transactionData.address),
        doctype: "Address",
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    let __VLS_103;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        label: (__VLS_ctx.__('GSTIN')),
        modelValue: (__VLS_ctx.transactionData.gstin),
    }));
    const __VLS_105 = __VLS_104({
        label: (__VLS_ctx.__('GSTIN')),
        modelValue: (__VLS_ctx.transactionData.gstin),
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    let __VLS_108;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
        label: (__VLS_ctx.__('PAN')),
        modelValue: (__VLS_ctx.transactionData.pan),
    }));
    const __VLS_110 = __VLS_109({
        label: (__VLS_ctx.__('PAN')),
        modelValue: (__VLS_ctx.transactionData.pan),
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    let __VLS_113;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
        label: (__VLS_ctx.__('Payment ID')),
        modelValue: (__VLS_ctx.transactionData.payment_id),
    }));
    const __VLS_115 = __VLS_114({
        label: (__VLS_ctx.__('Payment ID')),
        modelValue: (__VLS_ctx.transactionData.payment_id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    let __VLS_118;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
        label: (__VLS_ctx.__('Order ID')),
        modelValue: (__VLS_ctx.transactionData.order_id),
    }));
    const __VLS_120 = __VLS_119({
        label: (__VLS_ctx.__('Order ID')),
        modelValue: (__VLS_ctx.transactionData.order_id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
}
// @ts-ignore
[__, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, transactionData, documentTypeOptions,];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {
        ...{},
        ...{},
    },
    __typeProps: {},
});
export default {};
