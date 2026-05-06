/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Button, Badge, call, createListResource, FeatherIcon, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, ListRowItem, ListSelectBanner, toast, } from 'frappe-ui';
import { computed, inject, onMounted, ref } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import { cleanError } from '@/utils';
import ZoomAccountModal from '@/components/Modals/ZoomAccountModal.vue';
const user = inject('$user');
const showForm = ref(false);
const currentAccount = ref(null);
const props = defineProps({
    label: String,
    description: String,
});
const zoomAccounts = createListResource({
    doctype: 'LMS Zoom Settings',
    fields: [
        'name',
        'enabled',
        'member',
        'member_name',
        'member_image',
        'account_id',
        'client_id',
        'client_secret',
    ],
    cache: ['zoomAccounts'],
});
onMounted(() => {
    fetchZoomAccounts();
});
const fetchZoomAccounts = () => {
    if (!user?.data?.is_moderator && !user?.data?.is_evaluator)
        return;
    if (!user?.data?.is_moderator) {
        zoomAccounts.update({
            filters: {
                member: user.data.name,
            },
        });
    }
    zoomAccounts.reload();
};
const openForm = (accountID) => {
    currentAccount.value = accountID;
    showForm.value = true;
};
const removeAccount = (selections, unselectAll) => {
    call('lms.lms.api.delete_documents', {
        doctype: 'LMS Zoom Settings',
        documents: Array.from(selections),
    })
        .then(() => {
        zoomAccounts.reload();
        toast.success(__('Email Templates deleted successfully'));
        unselectAll();
    })
        .catch((err) => {
        toast.error(cleanError(err.messages[0]) || __('Error deleting email templates'));
    });
};
const columns = computed(() => {
    return [
        {
            label: __('Member'),
            key: 'member_name',
            icon: 'user',
        },
        {
            label: __('Account Name'),
            key: 'name',
            icon: 'video',
        },
        {
            label: __('Status'),
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
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col min-h-0 text-base" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col space-y-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.label);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-ink-gray-6 leading-5" },
});
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
(__VLS_ctx.__(__VLS_ctx.description));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-5']} */ ;
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
            __VLS_ctx.openForm('new');
            // @ts-ignore
            [label, __, description, openForm,];
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
if (__VLS_ctx.zoomAccounts.data?.length) {
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
        rows: (__VLS_ctx.zoomAccounts.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            onRowClick: (row) => {
                __VLS_ctx.openForm(row.name);
            },
        }),
    }));
    const __VLS_16 = __VLS_15({
        columns: (__VLS_ctx.columns),
        rows: (__VLS_ctx.zoomAccounts.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            onRowClick: (row) => {
                __VLS_ctx.openForm(row.name);
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
    const { default: __VLS_25 } = __VLS_23.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.columns))) {
        let __VLS_26;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
            item: (item),
        }));
        const __VLS_28 = __VLS_27({
            item: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const { default: __VLS_31 } = __VLS_29.slots;
        {
            const { prefix: __VLS_32 } = __VLS_29.slots;
            const [{ item }] = __VLS_vSlot(__VLS_32);
            if (item.icon) {
                let __VLS_33;
                /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
                FeatherIcon;
                // @ts-ignore
                const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
                    name: (item.icon),
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }));
                const __VLS_35 = __VLS_34({
                    name: (item.icon),
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_34));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            }
            // @ts-ignore
            [openForm, zoomAccounts, zoomAccounts, columns, columns,];
        }
        // @ts-ignore
        [];
        var __VLS_29;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_23;
    let __VLS_38;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({}));
    const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
    const { default: __VLS_43 } = __VLS_41.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.zoomAccounts.data))) {
        let __VLS_44;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            row: (row),
        }));
        const __VLS_46 = __VLS_45({
            row: (row),
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        const { default: __VLS_49 } = __VLS_47.slots;
        {
            const { default: __VLS_50 } = __VLS_47.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_50);
            let __VLS_51;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                item: (row[column.key]),
                align: (column.align),
            }));
            const __VLS_53 = __VLS_52({
                item: (row[column.key]),
                align: (column.align),
            }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            const { default: __VLS_56 } = __VLS_54.slots;
            {
                const { prefix: __VLS_57 } = __VLS_54.slots;
                if (column.key == 'member_name') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    let __VLS_58;
                    /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
                    Avatar;
                    // @ts-ignore
                    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                        ...{ class: "flex items-center" },
                        image: (row['member_image']),
                        label: (item),
                        size: "sm",
                    }));
                    const __VLS_60 = __VLS_59({
                        ...{ class: "flex items-center" },
                        image: (row['member_image']),
                        label: (item),
                        size: "sm",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                }
                // @ts-ignore
                [zoomAccounts,];
            }
            if (column.key == 'enabled') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                if (row[column.key]) {
                    let __VLS_63;
                    /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                    Badge;
                    // @ts-ignore
                    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
                        theme: "green",
                    }));
                    const __VLS_65 = __VLS_64({
                        theme: "green",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
                    const { default: __VLS_68 } = __VLS_66.slots;
                    (__VLS_ctx.__('Enabled'));
                    // @ts-ignore
                    [__,];
                    var __VLS_66;
                }
                else {
                    let __VLS_69;
                    /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                    Badge;
                    // @ts-ignore
                    const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
                        theme: "gray",
                    }));
                    const __VLS_71 = __VLS_70({
                        theme: "gray",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
                    const { default: __VLS_74 } = __VLS_72.slots;
                    (__VLS_ctx.__('Disabled'));
                    // @ts-ignore
                    [__,];
                    var __VLS_72;
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
            [];
            var __VLS_54;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_47;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_41;
    let __VLS_75;
    /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
    ListSelectBanner;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({}));
    const __VLS_77 = __VLS_76({}, ...__VLS_functionalComponentArgsRest(__VLS_76));
    const { default: __VLS_80 } = __VLS_78.slots;
    {
        const { actions: __VLS_81 } = __VLS_78.slots;
        const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_81);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_82;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_84 = __VLS_83({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        let __VLS_87;
        const __VLS_88 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.zoomAccounts.data?.length))
                        return;
                    __VLS_ctx.removeAccount(selections, unselectAll);
                    // @ts-ignore
                    [removeAccount,];
                } });
        const { default: __VLS_89 } = __VLS_85.slots;
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
        Trash2;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_92 = __VLS_91({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
        var __VLS_85;
        var __VLS_86;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_78;
    // @ts-ignore
    [];
    var __VLS_17;
}
const __VLS_95 = ZoomAccountModal;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
    modelValue: (__VLS_ctx.showForm),
    zoomAccounts: (__VLS_ctx.zoomAccounts),
    accountID: (__VLS_ctx.currentAccount),
}));
const __VLS_97 = __VLS_96({
    modelValue: (__VLS_ctx.showForm),
    zoomAccounts: (__VLS_ctx.zoomAccounts),
    accountID: (__VLS_ctx.currentAccount),
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
// @ts-ignore
[zoomAccounts, showForm, currentAccount,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        label: String,
        description: String,
    },
});
export default {};
