/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Button, call, ListView, ListHeader, ListRows, ListRow, ListRowItem, ListSelectBanner, toast, } from 'frappe-ui';
import { computed, getCurrentInstance, inject } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
const dayjs = inject('$dayjs');
const app = getCurrentInstance();
const $dialog = app?.appContext.config.globalProperties.$dialog;
const emit = defineEmits(['updateStep']);
const props = defineProps();
const openForm = (coupon = {}) => {
    emit('updateStep', 'details', { ...coupon });
};
const confirmDeletion = (selections, unselectAll) => {
    if (selections.length === 0) {
        toast.info(__('No coupons selected for deletion'));
        return;
    }
    $dialog({
        title: __('Delete this coupon?'),
        message: __('This will permanently delete the coupon and the code will no longer be valid.'),
        actions: [
            {
                label: __('Delete'),
                theme: 'red',
                variant: 'solid',
                onClick({ close }) {
                    call('lms.lms.api.delete_documents', {
                        doctype: 'LMS Coupon',
                        documents: Array.from(selections),
                    }).then((data) => {
                        toast.success(__('Coupon(s) deleted successfully'));
                        coupons.reload();
                        unselectAll();
                        close();
                    });
                },
            },
        ],
    });
};
function trashCoupon(name, close) {
    call('frappe.client.delete', { doctype: 'LMS Coupon', name }).then(() => {
        toast.success(__('Coupon deleted successfully'));
        coupons.reload();
        if (typeof close === 'function')
            close();
    });
}
const columns = computed(() => {
    return [
        {
            label: __('Code'),
            key: 'code',
            icon: 'tag',
            width: '150px',
        },
        {
            label: __('Discount'),
            key: 'discount',
            align: 'center',
            width: '80px',
            icon: 'dollar-sign',
        },
        {
            label: __('Expires On'),
            key: 'expires_on',
            width: '120px',
            icon: 'calendar',
        },
        {
            label: __('Usage Limit'),
            key: 'usage_limit',
            align: 'center',
            width: '100px',
            icon: 'hash',
        },
        {
            label: __('Redemption Count'),
            key: 'redemption_count',
            align: 'center',
            width: '100px',
            icon: 'users',
        },
        {
            label: __('Enabled'),
            key: 'enabled',
            align: 'center',
            icon: 'check-square',
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
            __VLS_ctx.openForm();
            // @ts-ignore
            [__, __, label, description, openForm,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
{
    const { prefix: __VLS_8 } = __VLS_3.slots;
    let __VLS_9;
    /** @ts-ignore @type { | typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
        ...{ class: "h-3 w-3 stroke-1.5" },
    }));
    const __VLS_11 = __VLS_10({
        ...{ class: "h-3 w-3 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [];
}
(__VLS_ctx.__('New'));
// @ts-ignore
[__,];
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.coupons.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "overflow-y-scroll" },
    });
    /** @type {__VLS_StyleScopedClasses['overflow-y-scroll']} */ ;
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        columns: (__VLS_ctx.columns),
        rows: (__VLS_ctx.coupons.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: true,
            onRowClick: (row) => {
                __VLS_ctx.openForm(row);
            },
        }),
    }));
    const __VLS_16 = __VLS_15({
        columns: (__VLS_ctx.columns),
        rows: (__VLS_ctx.coupons.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: true,
            onRowClick: (row) => {
                __VLS_ctx.openForm(row);
            },
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const { default: __VLS_19 } = __VLS_17.slots;
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_22 = __VLS_21({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
    const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
    const { default: __VLS_30 } = __VLS_28.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.coupons.data))) {
        let __VLS_31;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
            row: (row),
            key: (row.name),
        }));
        const __VLS_33 = __VLS_32({
            row: (row),
            key: (row.name),
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        const { default: __VLS_36 } = __VLS_34.slots;
        {
            const { default: __VLS_37 } = __VLS_34.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_37);
            let __VLS_38;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
                item: (row[column.key]),
                align: (column.align),
            }));
            const __VLS_40 = __VLS_39({
                item: (row[column.key]),
                align: (column.align),
            }, ...__VLS_functionalComponentArgsRest(__VLS_39));
            const { default: __VLS_43 } = __VLS_41.slots;
            if (column.key == 'enabled') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                if (row[column.key]) {
                    let __VLS_44;
                    /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                    Badge;
                    // @ts-ignore
                    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
                        theme: "green",
                    }));
                    const __VLS_46 = __VLS_45({
                        theme: "green",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
                    const { default: __VLS_49 } = __VLS_47.slots;
                    (__VLS_ctx.__('Enabled'));
                    // @ts-ignore
                    [__, openForm, coupons, coupons, coupons, columns,];
                    var __VLS_47;
                }
                else {
                    let __VLS_50;
                    /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                    Badge;
                    // @ts-ignore
                    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
                        theme: "gray",
                    }));
                    const __VLS_52 = __VLS_51({
                        theme: "gray",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
                    const { default: __VLS_55 } = __VLS_53.slots;
                    (__VLS_ctx.__('Disabled'));
                    // @ts-ignore
                    [__,];
                    var __VLS_53;
                }
            }
            else if (column.key == 'expires_on') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (__VLS_ctx.dayjs(row[column.key]).format('DD MMM YYYY'));
            }
            else if (column.key == 'discount') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                if (row['discount_type'] == 'Percentage') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    (row['percentage_discount']);
                }
                else if (row['discount_type'] == 'Fixed Amount') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    (row['fixed_amount_discount']);
                }
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
            [dayjs,];
            var __VLS_41;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_34;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_28;
    let __VLS_56;
    /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
    ListSelectBanner;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
    const { default: __VLS_61 } = __VLS_59.slots;
    {
        const { actions: __VLS_62 } = __VLS_59.slots;
        const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_62);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_63;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_65 = __VLS_64({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        let __VLS_68;
        const __VLS_69 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.coupons.data?.length))
                        return;
                    __VLS_ctx.confirmDeletion(selections, unselectAll);
                    // @ts-ignore
                    [confirmDeletion,];
                } });
        const { default: __VLS_70 } = __VLS_66.slots;
        let __VLS_71;
        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
        Trash2;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_73 = __VLS_72({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
        var __VLS_66;
        var __VLS_67;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_59;
    // @ts-ignore
    [];
    var __VLS_17;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center text-ink-gray-6 italic mt-40" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['italic']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-40']} */ ;
    (__VLS_ctx.__('No coupons created yet.'));
}
// @ts-ignore
[__,];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    __typeProps: {},
});
export default {};
