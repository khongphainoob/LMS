/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Button, createListResource, Dropdown, FeatherIcon, FormControl, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, ListRowItem, toast, } from 'frappe-ui';
import { computed, ref } from 'vue';
import { Plus } from 'lucide-vue-next';
import { cleanError } from '@/utils';
import BadgeForm from '@/components/Settings/BadgeForm.vue';
import BadgeAssignments from '@/components/Settings/BadgeAssignments.vue';
const showForm = ref(false);
const selectedBadge = ref(null);
const showAssignments = ref(false);
const showAssignmentsFor = ref(null);
const props = defineProps();
const badges = createListResource({
    doctype: 'LMS Badge',
    fields: [
        'name',
        'title',
        'enabled',
        'description',
        'image',
        'grant_only_once',
        'event',
        'reference_doctype',
        'condition',
        'user_field',
        'field_to_check',
    ],
    order_by: 'creation desc',
    auto: true,
});
const getMoreOptions = (badgeName) => {
    return [
        {
            label: __('Edit'),
            icon: 'edit',
            onClick() {
                openForm(badgeName);
            },
        },
        {
            label: __('Assignments'),
            icon: 'download',
            onClick() {
                showAssignmentsFor.value = badgeName;
                showAssignments.value = true;
            },
        },
        {
            label: __('Delete'),
            icon: 'trash-2',
            onClick() {
                deleteBadge(badgeName);
            },
        },
    ];
};
const openForm = (badgeName) => {
    selectedBadge.value = badgeName;
    showForm.value = true;
};
const deleteBadge = (badgeName) => {
    badges.delete
        .submit(badgeName)
        .then(() => {
        badges.reload();
        toast.success(__('Badge deleted successfully'));
    })
        .catch((err) => {
        toast.error(cleanError(err.messages[0]) || __('Error deleting badge'));
    });
};
const doctypeLabel = computed(() => {
    return {
        'LMS Course': __('Course'),
        'LMS Batch': __('Batch'),
        'LMS Enrollment': __('Course Enrollment'),
        'LMS Batch Enrollment': __('Batch Enrollment'),
        'LMS Quiz Submission': __('Quiz Submission'),
        'LMS Assignment Submission': __('Assignment Submission'),
        'LMS Programming Exercise Submission': __('Programming Exercise Submission'),
    };
});
const columns = computed(() => {
    return [
        {
            label: __('Badge'),
            key: 'title',
            icon: 'award',
            align: 'left',
            width: '25%',
        },
        {
            label: __('Assigned For'),
            key: 'reference_doctype',
            icon: 'info',
            align: 'left',
            width: '35%',
        },
        {
            label: __('Status'),
            key: 'enabled',
            icon: 'check-square',
            align: 'left',
            width: '15%',
        },
        {
            label: __('Grant Only Once'),
            key: 'grant_only_once',
            icon: 'check',
            align: 'center',
            width: '20%',
        },
        {
            key: 'action',
            align: 'right',
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
if (__VLS_ctx.showAssignments) {
    const __VLS_0 = BadgeAssignments;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        modelValue: (__VLS_ctx.showAssignments),
        badgeName: (__VLS_ctx.showAssignmentsFor),
    }));
    const __VLS_2 = __VLS_1({
        modelValue: (__VLS_ctx.showAssignments),
        badgeName: (__VLS_ctx.showAssignmentsFor),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
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
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(__VLS_ctx.showAssignments))
                    return;
                __VLS_ctx.openForm('new');
                // @ts-ignore
                [showAssignments, showAssignments, showAssignmentsFor, label, __, description, openForm,];
            } });
    const { default: __VLS_12 } = __VLS_8.slots;
    {
        const { prefix: __VLS_13 } = __VLS_8.slots;
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }));
        const __VLS_16 = __VLS_15({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('New'));
    // @ts-ignore
    [__,];
    var __VLS_8;
    var __VLS_9;
    if (__VLS_ctx.badges.data?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "overflow-y-scroll" },
        });
        /** @type {__VLS_StyleScopedClasses['overflow-y-scroll']} */ ;
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
        ListView;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            columns: (__VLS_ctx.columns),
            rows: (__VLS_ctx.badges.data),
            rowKey: "name",
            options: ({
                showTooltip: false,
                selectable: false,
            }),
        }));
        const __VLS_21 = __VLS_20({
            columns: (__VLS_ctx.columns),
            rows: (__VLS_ctx.badges.data),
            rowKey: "name",
            options: ({
                showTooltip: false,
                selectable: false,
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        const { default: __VLS_24 } = __VLS_22.slots;
        let __VLS_25;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
        ListHeader;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }));
        const __VLS_27 = __VLS_26({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        const { default: __VLS_30 } = __VLS_28.slots;
        for (const [item] of __VLS_vFor((__VLS_ctx.columns))) {
            let __VLS_31;
            /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
            ListHeaderItem;
            // @ts-ignore
            const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
                item: (item),
                key: (item.key),
            }));
            const __VLS_33 = __VLS_32({
                item: (item),
                key: (item.key),
            }, ...__VLS_functionalComponentArgsRest(__VLS_32));
            const { default: __VLS_36 } = __VLS_34.slots;
            {
                const { prefix: __VLS_37 } = __VLS_34.slots;
                const [{ item }] = __VLS_vSlot(__VLS_37);
                if (item.icon) {
                    let __VLS_38;
                    /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
                    FeatherIcon;
                    // @ts-ignore
                    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
                        name: (item.icon),
                        ...{ class: "h-4 w-4 stroke-1.5" },
                    }));
                    const __VLS_40 = __VLS_39({
                        name: (item.icon),
                        ...{ class: "h-4 w-4 stroke-1.5" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
                    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                }
                // @ts-ignore
                [badges, badges, columns, columns,];
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
        let __VLS_43;
        /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
        ListRows;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({}));
        const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
        const { default: __VLS_48 } = __VLS_46.slots;
        for (const [row] of __VLS_vFor((__VLS_ctx.badges.data))) {
            let __VLS_49;
            /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
            ListRow;
            // @ts-ignore
            const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
                row: (row),
                key: (row.name),
            }));
            const __VLS_51 = __VLS_50({
                row: (row),
                key: (row.name),
            }, ...__VLS_functionalComponentArgsRest(__VLS_50));
            const { default: __VLS_54 } = __VLS_52.slots;
            {
                const { default: __VLS_55 } = __VLS_52.slots;
                const [{ column, item }] = __VLS_vSlot(__VLS_55);
                let __VLS_56;
                /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
                ListRowItem;
                // @ts-ignore
                const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
                    item: (row[column.key]),
                    align: (column.align),
                }));
                const __VLS_58 = __VLS_57({
                    item: (row[column.key]),
                    align: (column.align),
                }, ...__VLS_functionalComponentArgsRest(__VLS_57));
                const { default: __VLS_61 } = __VLS_59.slots;
                if (column.key == 'enabled') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    if (row[column.key]) {
                        let __VLS_62;
                        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                        Badge;
                        // @ts-ignore
                        const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                            theme: "green",
                        }));
                        const __VLS_64 = __VLS_63({
                            theme: "green",
                        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
                        const { default: __VLS_67 } = __VLS_65.slots;
                        (__VLS_ctx.__('Enabled'));
                        // @ts-ignore
                        [__, badges,];
                        var __VLS_65;
                    }
                    else {
                        let __VLS_68;
                        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                        Badge;
                        // @ts-ignore
                        const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
                            theme: "gray",
                        }));
                        const __VLS_70 = __VLS_69({
                            theme: "gray",
                        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
                        const { default: __VLS_73 } = __VLS_71.slots;
                        (__VLS_ctx.__('Disabled'));
                        // @ts-ignore
                        [__,];
                        var __VLS_71;
                    }
                }
                else if (column.key == 'reference_doctype') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    (__VLS_ctx.doctypeLabel[row[column.key]] || row[column.key]);
                }
                else if (column.key == 'grant_only_once') {
                    let __VLS_74;
                    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
                    FormControl;
                    // @ts-ignore
                    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
                        modelValue: (row[column.key]),
                        type: "checkbox",
                        disabled: (true),
                    }));
                    const __VLS_76 = __VLS_75({
                        modelValue: (row[column.key]),
                        type: "checkbox",
                        disabled: (true),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
                }
                else if (column.key != 'action') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "leading-5 text-sm" },
                    });
                    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    (row[column.key]);
                }
                else {
                    let __VLS_79;
                    /** @ts-ignore @type { | typeof __VLS_components.Dropdown} */
                    Dropdown;
                    // @ts-ignore
                    const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
                        options: (__VLS_ctx.getMoreOptions(row.name)),
                        button: ({
                            icon: 'more-horizontal',
                            onblur: (e) => {
                                e.stopPropagation();
                            },
                        }),
                        placement: "right",
                    }));
                    const __VLS_81 = __VLS_80({
                        options: (__VLS_ctx.getMoreOptions(row.name)),
                        button: ({
                            icon: 'more-horizontal',
                            onblur: (e) => {
                                e.stopPropagation();
                            },
                        }),
                        placement: "right",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
                }
                // @ts-ignore
                [doctypeLabel, doctypeLabel, getMoreOptions,];
                var __VLS_59;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_52;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_46;
        // @ts-ignore
        [];
        var __VLS_22;
    }
}
const __VLS_84 = BadgeForm;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.showForm),
    badgeName: (__VLS_ctx.selectedBadge),
    badges: (__VLS_ctx.badges),
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.showForm),
    badgeName: (__VLS_ctx.selectedBadge),
    badges: (__VLS_ctx.badges),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
// @ts-ignore
[badges, showForm, selectedBadge,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
