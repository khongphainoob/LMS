/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, ListView, ListHeader, ListHeaderItem, FeatherIcon, ListRows, ListRow, ListRowItem, FormControl, } from 'frappe-ui';
import { computed, ref, watch } from 'vue';
import { RefreshCw } from 'lucide-vue-next';
import Link from '@/components/Controls/Link.vue';
const billingName = ref(null);
const paymentReceived = ref(false);
const paymentForCertificate = ref(false);
const member = ref(null);
const emit = defineEmits(['updateStep']);
const props = defineProps();
watch([billingName, member, paymentReceived, paymentForCertificate], ([newBillingName, newMember, newPaymentReceived, newPaymentForCertificate,]) => {
    props.transactions.update({
        filters: [
            newBillingName ? [['billing_name', 'like', `%${newBillingName}%`]] : [],
            newMember ? [['member', '=', newMember]] : [],
            newPaymentReceived
                ? [['payment_received', '=', newPaymentReceived]]
                : [],
            newPaymentForCertificate
                ? [['payment_for_certificate', '=', newPaymentForCertificate]]
                : [],
        ].flat(),
    });
    props.transactions.reload();
}, { immediate: true });
const openForm = (transaction) => {
    emit('updateStep', 'details', { ...transaction });
};
const getCurrencySymbol = (currency) => {
    const currencySymbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        AED: 'د.إ',
        CHF: 'Fr',
        JPY: '¥',
        AUD: '$',
    };
    return currencySymbols[currency] || currency;
};
const columns = computed(() => {
    return [
        {
            label: __('Billing Name'),
            icon: 'user',
            key: 'billing_name',
            width: '30%',
        },
        {
            label: __('Amount'),
            icon: 'dollar-sign',
            key: 'amount',
            width: '20%',
            align: 'right',
        },
        {
            label: __('Payment Received'),
            icon: 'check-circle',
            key: 'payment_received',
            width: '25%',
            align: 'center',
        },
        {
            label: __('Payment for Certificate'),
            icon: 'award',
            key: 'payment_for_certificate',
            width: '25%',
            align: 'center',
        },
    ];
});
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
    ...{ class: "flex min-h-0 flex-col text-base" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold mb-1 text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__(__VLS_ctx.label));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-ink-gray-6 leading-5" },
});
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
(__VLS_ctx.__(__VLS_ctx.description));
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.emit('updateStep', 'new', null);
            // @ts-ignore
            [__, __, label, description, emit,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
{
    const { prefix: __VLS_8 } = __VLS_3.slots;
    let __VLS_9;
    /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
    FeatherIcon;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
        name: "plus",
        ...{ class: "h-4 w-4 stroke-1.5" },
    }));
    const __VLS_11 = __VLS_10({
        name: "plus",
        ...{ class: "h-4 w-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [];
}
(__VLS_ctx.__('Add Transaction'));
// @ts-ignore
[__,];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-5 mb-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
let __VLS_14;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    modelValue: (__VLS_ctx.billingName),
    placeholder: (__VLS_ctx.__('Filter by Billing Name')),
}));
const __VLS_16 = __VLS_15({
    modelValue: (__VLS_ctx.billingName),
    placeholder: (__VLS_ctx.__('Filter by Billing Name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const __VLS_19 = Link;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    modelValue: (__VLS_ctx.member),
    doctype: "User",
    placeholder: (__VLS_ctx.__('Filter by Member')),
}));
const __VLS_21 = __VLS_20({
    modelValue: (__VLS_ctx.member),
    doctype: "User",
    placeholder: (__VLS_ctx.__('Filter by Member')),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_24;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.paymentReceived),
    type: "checkbox",
    label: (__VLS_ctx.__('Payment Received')),
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.paymentReceived),
    type: "checkbox",
    label: (__VLS_ctx.__('Payment Received')),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_29;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    modelValue: (__VLS_ctx.paymentForCertificate),
    type: "checkbox",
    label: (__VLS_ctx.__('Payment for Certificate')),
}));
const __VLS_31 = __VLS_30({
    modelValue: (__VLS_ctx.paymentForCertificate),
    type: "checkbox",
    label: (__VLS_ctx.__('Payment for Certificate')),
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
if (__VLS_ctx.transactions.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "overflow-y-scroll" },
    });
    /** @type {__VLS_StyleScopedClasses['overflow-y-scroll']} */ ;
    let __VLS_34;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
        columns: (__VLS_ctx.columns),
        rows: (__VLS_ctx.transactions.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: false,
            onRowClick: (row) => {
                __VLS_ctx.openForm(row);
            },
        }),
    }));
    const __VLS_36 = __VLS_35({
        columns: (__VLS_ctx.columns),
        rows: (__VLS_ctx.transactions.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: false,
            onRowClick: (row) => {
                __VLS_ctx.openForm(row);
            },
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    const { default: __VLS_39 } = __VLS_37.slots;
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_42 = __VLS_41({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    const { default: __VLS_45 } = __VLS_43.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.columns))) {
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            item: (item),
        }));
        const __VLS_48 = __VLS_47({
            item: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        const { default: __VLS_51 } = __VLS_49.slots;
        {
            const { prefix: __VLS_52 } = __VLS_49.slots;
            const [{ item }] = __VLS_vSlot(__VLS_52);
            if (item.icon) {
                let __VLS_53;
                /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
                FeatherIcon;
                // @ts-ignore
                const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
                    name: (item.icon),
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }));
                const __VLS_55 = __VLS_54({
                    name: (item.icon),
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_54));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            }
            // @ts-ignore
            [__, __, __, __, billingName, member, paymentReceived, paymentForCertificate, transactions, transactions, columns, columns, openForm,];
        }
        // @ts-ignore
        [];
        var __VLS_49;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_43;
    let __VLS_58;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({}));
    const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const { default: __VLS_63 } = __VLS_61.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.transactions.data))) {
        let __VLS_64;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
            row: (row),
        }));
        const __VLS_66 = __VLS_65({
            row: (row),
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        const { default: __VLS_69 } = __VLS_67.slots;
        {
            const { default: __VLS_70 } = __VLS_67.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_70);
            let __VLS_71;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
                item: (row[column.key]),
                align: (column.align),
            }));
            const __VLS_73 = __VLS_72({
                item: (row[column.key]),
                align: (column.align),
            }, ...__VLS_functionalComponentArgsRest(__VLS_72));
            const { default: __VLS_76 } = __VLS_74.slots;
            if (['payment_received', 'payment_for_certificate'].includes(column.key)) {
                let __VLS_77;
                /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
                FormControl;
                // @ts-ignore
                const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
                    type: "checkbox",
                    modelValue: (row[column.key]),
                    disabled: (true),
                }));
                const __VLS_79 = __VLS_78({
                    type: "checkbox",
                    modelValue: (row[column.key]),
                    disabled: (true),
                }, ...__VLS_functionalComponentArgsRest(__VLS_78));
            }
            else if (column.key == 'amount') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (__VLS_ctx.getCurrencySymbol(row['currency']));
                (row[column.key]);
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "leading-5 text-sm" },
                });
                /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                (row[column.key]);
            }
            // @ts-ignore
            [transactions, getCurrencySymbol,];
            var __VLS_74;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_67;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_61;
    // @ts-ignore
    [];
    var __VLS_37;
    if (__VLS_ctx.transactions.data.length && __VLS_ctx.transactions.hasNextPage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-center mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        let __VLS_82;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
            ...{ 'onClick': {} },
        }));
        const __VLS_84 = __VLS_83({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        let __VLS_87;
        const __VLS_88 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.transactions.data?.length))
                        return;
                    if (!(__VLS_ctx.transactions.data.length && __VLS_ctx.transactions.hasNextPage))
                        return;
                    __VLS_ctx.transactions.next();
                    // @ts-ignore
                    [transactions, transactions, transactions,];
                } });
        const { default: __VLS_89 } = __VLS_85.slots;
        {
            const { prefix: __VLS_90 } = __VLS_85.slots;
            let __VLS_91;
            /** @ts-ignore @type { | typeof __VLS_components.RefreshCw} */
            RefreshCw;
            // @ts-ignore
            const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
                ...{ class: "h-3 w-3 stroke-1.5" },
            }));
            const __VLS_93 = __VLS_92({
                ...{ class: "h-3 w-3 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_92));
            /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Load More'));
        // @ts-ignore
        [__,];
        var __VLS_85;
        var __VLS_86;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    __typeProps: {},
});
export default {};
