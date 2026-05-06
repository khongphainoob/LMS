/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Button, createListResource, FeatherIcon, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, ListRowItem, ListSelectBanner, toast, } from 'frappe-ui';
import { ChevronLeft, GraduationCap, Plus, Trash2 } from 'lucide-vue-next';
import { computed, inject, ref } from 'vue';
import BadgeAssignmentForm from '@/components/Settings/BadgeAssignmentForm.vue';
const show = defineModel();
const dayjs = inject('$dayjs');
const showForm = ref(false);
const currentAssignmentID = ref('');
const props = defineProps();
const assignments = createListResource({
    doctype: 'LMS Badge Assignment',
    fields: [
        'name',
        'member',
        'member_name',
        'member_username',
        'member_image',
        'issued_on',
        'badge',
    ],
    filters: {
        badge: props.badgeName,
    },
    order_by: 'issued_on desc',
    transform(data) {
        return data.map((item) => {
            return {
                ...item,
                issued_on: item.issued_on
                    ? dayjs(item.issued_on).format('DD MMM YYYY')
                    : null,
            };
        });
    },
    auto: true,
});
const openForm = (assignmentID) => {
    currentAssignmentID.value = assignmentID;
    showForm.value = true;
};
const deleteBadgeAssignment = (selections, unselectAll) => {
    Array.from(selections).forEach(async (assignment) => {
        await assignments.delete.submit(assignment);
    });
    unselectAll();
    toast.success(__('Badge assignments deleted successfully'));
};
const columns = computed(() => {
    return [
        {
            label: __('Member'),
            key: 'member_name',
            icon: 'user',
            width: '60%',
        },
        {
            label: __('Issued On'),
            key: 'issued_on',
            icon: 'calendar',
            align: 'center',
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
    ...{ class: "text-base" },
});
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between space-x-2 mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
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
    ...{ class: "size-5 stroke-1.5 text-ink-gray-5 cursor-pointer" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: "size-5 stroke-1.5 text-ink-gray-5 cursor-pointer" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (() => {
            __VLS_ctx.show = false;
        }) });
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(props.badgeName);
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
            __VLS_ctx.openForm('new');
            // @ts-ignore
            [show, openForm,];
        } });
const { default: __VLS_14 } = __VLS_10.slots;
{
    const { prefix: __VLS_15 } = __VLS_10.slots;
    let __VLS_16;
    /** @ts-ignore @type { | typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        ...{ class: "size-4 stroke-1.5" },
    }));
    const __VLS_18 = __VLS_17({
        ...{ class: "size-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [];
}
(__VLS_ctx.__('New'));
// @ts-ignore
[__,];
var __VLS_10;
var __VLS_11;
if (__VLS_ctx.assignments.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    let __VLS_21;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        rows: (__VLS_ctx.assignments.data),
        columns: (__VLS_ctx.columns),
        rowKey: "name",
        options: ({
            showTooltip: false,
            onRowClick: (row) => {
                __VLS_ctx.openForm(row.name);
            },
        }),
    }));
    const __VLS_23 = __VLS_22({
        rows: (__VLS_ctx.assignments.data),
        columns: (__VLS_ctx.columns),
        rowKey: "name",
        options: ({
            showTooltip: false,
            onRowClick: (row) => {
                __VLS_ctx.openForm(row.name);
            },
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    const { default: __VLS_26 } = __VLS_24.slots;
    let __VLS_27;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_29 = __VLS_28({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    const { default: __VLS_32 } = __VLS_30.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.columns))) {
        let __VLS_33;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
            item: (item),
        }));
        const __VLS_35 = __VLS_34({
            item: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        const { default: __VLS_38 } = __VLS_36.slots;
        {
            const { prefix: __VLS_39 } = __VLS_36.slots;
            const [{ item }] = __VLS_vSlot(__VLS_39);
            if (item.icon) {
                let __VLS_40;
                /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
                FeatherIcon;
                // @ts-ignore
                const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                    name: (item.icon),
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }));
                const __VLS_42 = __VLS_41({
                    name: (item.icon),
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_41));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            }
            // @ts-ignore
            [openForm, assignments, assignments, columns, columns,];
        }
        // @ts-ignore
        [];
        var __VLS_36;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_30;
    let __VLS_45;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({}));
    const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
    const { default: __VLS_50 } = __VLS_48.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.assignments.data))) {
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            row: (row),
        }));
        const __VLS_53 = __VLS_52({
            row: (row),
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        const { default: __VLS_56 } = __VLS_54.slots;
        {
            const { default: __VLS_57 } = __VLS_54.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_57);
            let __VLS_58;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                item: (row[column.key]),
                align: (column.align),
            }));
            const __VLS_60 = __VLS_59({
                item: (row[column.key]),
                align: (column.align),
            }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            const { default: __VLS_63 } = __VLS_61.slots;
            {
                const { prefix: __VLS_64 } = __VLS_61.slots;
                if (column.key == 'member_name') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    let __VLS_65;
                    /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
                    Avatar;
                    // @ts-ignore
                    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
                        ...{ class: "flex items-center" },
                        image: (row['member_image']),
                        label: (item),
                        size: "sm",
                    }));
                    const __VLS_67 = __VLS_66({
                        ...{ class: "flex items-center" },
                        image: (row['member_image']),
                        label: (item),
                        size: "sm",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                }
                // @ts-ignore
                [assignments,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "leading-5 text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (row[column.key]);
            // @ts-ignore
            [];
            var __VLS_61;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_54;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_48;
    let __VLS_70;
    /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
    ListSelectBanner;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({}));
    const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const { default: __VLS_75 } = __VLS_73.slots;
    {
        const { actions: __VLS_76 } = __VLS_73.slots;
        const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_76);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_77;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_79 = __VLS_78({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        let __VLS_82;
        const __VLS_83 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.assignments.data?.length))
                        return;
                    __VLS_ctx.deleteBadgeAssignment(selections, unselectAll);
                    // @ts-ignore
                    [deleteBadgeAssignment,];
                } });
        const { default: __VLS_84 } = __VLS_80.slots;
        let __VLS_85;
        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
        Trash2;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_87 = __VLS_86({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
        var __VLS_80;
        var __VLS_81;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_73;
    // @ts-ignore
    [];
    var __VLS_24;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col items-center justify-center mt-44" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-44']} */ ;
    let __VLS_90;
    /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
    GraduationCap;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        ...{ class: "size-10 mx-auto stroke-1 text-ink-gray-5" },
    }));
    const __VLS_92 = __VLS_91({
        ...{ class: "size-10 mx-auto stroke-1 text-ink-gray-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    /** @type {__VLS_StyleScopedClasses['size-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-7 mb-2.5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2.5']} */ ;
    (__VLS_ctx.__('No Assignments'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "leading-5 text-base w-2/5 text-base text-center text-ink-gray-7" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-2/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    (__VLS_ctx.__('This badge has not been assigned to any students yet'));
}
const __VLS_95 = BadgeAssignmentForm;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
    modelValue: (__VLS_ctx.showForm),
    badgeAssignmentID: (__VLS_ctx.currentAssignmentID),
    badge: (props.badgeName),
    badgeAssignments: (__VLS_ctx.assignments),
}));
const __VLS_97 = __VLS_96({
    modelValue: (__VLS_ctx.showForm),
    badgeAssignmentID: (__VLS_ctx.currentAssignmentID),
    badge: (props.badgeName),
    badgeAssignments: (__VLS_ctx.assignments),
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
// @ts-ignore
[__, __, assignments, showForm, currentAssignmentID,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
