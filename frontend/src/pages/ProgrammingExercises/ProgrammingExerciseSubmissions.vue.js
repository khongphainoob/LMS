/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Badge, Breadcrumbs, Button, createListResource, FeatherIcon, FormControl, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, ListRowItem, ListSelectBanner, usePageMeta, toast, } from 'frappe-ui';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { sessionStore } from '@/stores/session';
import { useRouter } from 'vue-router';
import { Trash2 } from 'lucide-vue-next';
import Link from '@/components/Controls/Link.vue';
import EmptyState from '@/components/EmptyState.vue';
const { brand } = sessionStore();
const dayjs = inject('$dayjs');
const user = inject('$user');
const filterFields = ['exercise', 'member', 'status'];
const filters = ref({
    exercise: '',
    member: '',
    status: '',
});
const router = useRouter();
onMounted(() => {
    setFiltersFromRoute();
    fetchBasedOnRole();
});
const setFiltersFromRoute = () => {
    filterFields.forEach((field) => {
        if (router.currentRoute.value.query[field]) {
            filters.value[field] = router.currentRoute.value.query[field];
        }
    });
};
const fetchBasedOnRole = () => {
    if (isStudent.value) {
        filters.value['member'] = user.data?.name;
    }
    else {
        submissions.reload();
    }
};
const submissions = createListResource({
    doctype: 'LMS Programming Exercise Submission',
    fields: [
        'name',
        'exercise',
        'exercise_title',
        'member_name',
        'member_image',
        'status',
        'modified',
    ],
    orderBy: 'modified desc',
    transform(data) {
        return data.map((submission) => {
            return {
                ...submission,
                modified: dayjs(submission.modified).fromNow(),
            };
        });
    },
});
watch(filters.value, () => {
    let filtersToApply = {};
    filterFields.forEach((field) => {
        if (filters.value[field]) {
            filtersToApply[field] = filters.value[field];
            router.push({
                query: {
                    ...router.currentRoute.value.query,
                    [field]: filters.value[field],
                },
            });
        }
        else {
            delete filtersToApply[field];
            const query = { ...router.currentRoute.value.query };
            delete query[field];
            router.push({
                query,
            });
        }
    });
    submissions.update({
        filters: {
            ...filtersToApply,
        },
    });
    submissions.reload();
});
const deleteExercises = (selections, unselectAll) => {
    Array.from(selections).forEach(async (submission) => {
        await submissions.delete.submit(submission);
    });
    unselectAll();
    toast.success(__('Submissions deleted successfully'));
};
const isStudent = computed(() => {
    return (!user.data?.is_instructor &&
        !user.data?.is_moderator &&
        !user.data?.is_evaluator);
});
const submissionColumns = computed(() => {
    return [
        {
            label: __('Member'),
            key: 'member_name',
            width: '30%',
            icon: 'user',
        },
        {
            label: __('Exercise'),
            key: 'exercise_title',
            width: '30%',
            icon: 'code',
        },
        {
            label: __('Status'),
            key: 'status',
            width: '20%',
            icon: 'check-circle',
        },
        {
            label: __('Modified'),
            key: 'modified',
            width: '15%',
            icon: 'clock',
            align: 'right',
        },
    ];
});
const breadcrumbs = computed(() => {
    return [
        {
            label: __('Programming Exercise Submissions'),
            route: {
                name: 'ProgrammingExerciseSubmissions',
            },
        },
    ];
});
usePageMeta(() => {
    return {
        title: __('Programming Exercises'),
        icon: brand.favicon,
    };
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
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
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-6" },
});
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between space-x-32 mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-32']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.submissions.data?.length
    ? __VLS_ctx.__('{0} Submissions').format(__VLS_ctx.submissions.data.length)
    : __VLS_ctx.__('No Submissions'));
if (__VLS_ctx.submissions.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    const __VLS_5 = Link;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        doctype: "LMS Programming Exercise",
        modelValue: (__VLS_ctx.filters.exercise),
        placeholder: (__VLS_ctx.__('Filter by Exercise')),
        ...{ class: "w-40" },
    }));
    const __VLS_7 = __VLS_6({
        doctype: "LMS Programming Exercise",
        modelValue: (__VLS_ctx.filters.exercise),
        placeholder: (__VLS_ctx.__('Filter by Exercise')),
        ...{ class: "w-40" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['w-40']} */ ;
    const __VLS_10 = Link;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        doctype: "User",
        modelValue: (__VLS_ctx.filters.member),
        placeholder: (__VLS_ctx.__('Filter by Member')),
        readonly: (__VLS_ctx.isStudent),
        ...{ class: "w-40" },
    }));
    const __VLS_12 = __VLS_11({
        doctype: "User",
        modelValue: (__VLS_ctx.filters.member),
        placeholder: (__VLS_ctx.__('Filter by Member')),
        readonly: (__VLS_ctx.isStudent),
        ...{ class: "w-40" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    /** @type {__VLS_StyleScopedClasses['w-40']} */ ;
    let __VLS_15;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        modelValue: (__VLS_ctx.filters.status),
        type: "select",
        options: ([
            { label: '', value: '' },
            { label: __VLS_ctx.__('Passed'), value: 'Passed' },
            { label: __VLS_ctx.__('Failed'), value: 'Failed' },
        ]),
        placeholder: (__VLS_ctx.__('Filter by Status')),
        ...{ class: "w-40" },
    }));
    const __VLS_17 = __VLS_16({
        modelValue: (__VLS_ctx.filters.status),
        type: "select",
        options: ([
            { label: '', value: '' },
            { label: __VLS_ctx.__('Passed'), value: 'Passed' },
            { label: __VLS_ctx.__('Failed'), value: 'Failed' },
        ]),
        placeholder: (__VLS_ctx.__('Filter by Status')),
        ...{ class: "w-40" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    /** @type {__VLS_StyleScopedClasses['w-40']} */ ;
}
if (__VLS_ctx.submissions.loading || __VLS_ctx.submissions.data?.length) {
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        columns: (__VLS_ctx.submissionColumns),
        rows: (__VLS_ctx.submissions.data),
        rowKey: "name",
        options: ({
            selectable: true,
            showTooltip: false,
        }),
    }));
    const __VLS_22 = __VLS_21({
        columns: (__VLS_ctx.submissionColumns),
        rows: (__VLS_ctx.submissions.data),
        rowKey: "name",
        options: ({
            selectable: true,
            showTooltip: false,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const { default: __VLS_25 } = __VLS_23.slots;
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_28 = __VLS_27({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    const { default: __VLS_31 } = __VLS_29.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.submissionColumns))) {
        let __VLS_32;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            item: (item),
            key: (item.key),
        }));
        const __VLS_34 = __VLS_33({
            item: (item),
            key: (item.key),
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        const { default: __VLS_37 } = __VLS_35.slots;
        {
            const { prefix: __VLS_38 } = __VLS_35.slots;
            const [{ item }] = __VLS_vSlot(__VLS_38);
            let __VLS_39;
            /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
            FeatherIcon;
            // @ts-ignore
            const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
                name: (item.icon?.toString()),
                ...{ class: "h-4 w-4" },
            }));
            const __VLS_41 = __VLS_40({
                name: (item.icon?.toString()),
                ...{ class: "h-4 w-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_40));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            // @ts-ignore
            [breadcrumbs, submissions, submissions, submissions, submissions, submissions, submissions, __, __, __, __, __, __, __, filters, filters, filters, isStudent, submissionColumns, submissionColumns,];
        }
        // @ts-ignore
        [];
        var __VLS_35;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_29;
    let __VLS_44;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const { default: __VLS_49 } = __VLS_47.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.submissions.data))) {
        let __VLS_50;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
            to: ({
                name: 'ProgrammingExerciseSubmission',
                params: {
                    exerciseID: row.exercise,
                    submissionID: row.name,
                },
            }),
        }));
        const __VLS_52 = __VLS_51({
            to: ({
                name: 'ProgrammingExerciseSubmission',
                params: {
                    exerciseID: row.exercise,
                    submissionID: row.name,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        const { default: __VLS_55 } = __VLS_53.slots;
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            row: (row),
            ...{ class: "hover:bg-surface-gray-1" },
        }));
        const __VLS_58 = __VLS_57({
            row: (row),
            ...{ class: "hover:bg-surface-gray-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-1']} */ ;
        const { default: __VLS_61 } = __VLS_59.slots;
        {
            const { default: __VLS_62 } = __VLS_59.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_62);
            let __VLS_63;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
                item: (row[column.key]),
                align: (column.align),
            }));
            const __VLS_65 = __VLS_64({
                item: (row[column.key]),
                align: (column.align),
            }, ...__VLS_functionalComponentArgsRest(__VLS_64));
            const { default: __VLS_68 } = __VLS_66.slots;
            {
                const { prefix: __VLS_69 } = __VLS_66.slots;
                if (column.key == 'member_name') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    let __VLS_70;
                    /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
                    Avatar;
                    // @ts-ignore
                    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                        ...{ class: "flex items-center" },
                        image: (row['member_image']),
                        label: (item),
                        size: "sm",
                    }));
                    const __VLS_72 = __VLS_71({
                        ...{ class: "flex items-center" },
                        image: (row['member_image']),
                        label: (item),
                        size: "sm",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                }
                // @ts-ignore
                [submissions,];
            }
            if (column.key == 'status') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                let __VLS_75;
                /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                Badge;
                // @ts-ignore
                const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
                    theme: (row[column.key] === 'Passed' ? 'green' : 'red'),
                }));
                const __VLS_77 = __VLS_76({
                    theme: (row[column.key] === 'Passed' ? 'green' : 'red'),
                }, ...__VLS_functionalComponentArgsRest(__VLS_76));
                const { default: __VLS_80 } = __VLS_78.slots;
                (row[column.key]);
                // @ts-ignore
                [];
                var __VLS_78;
            }
            else if (column.key == 'modified') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-sm text-ink-gray-5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
                (row[column.key]);
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (row[column.key]);
            }
            // @ts-ignore
            [];
            var __VLS_66;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_59;
        // @ts-ignore
        [];
        var __VLS_53;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_47;
    let __VLS_81;
    /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
    ListSelectBanner;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({}));
    const __VLS_83 = __VLS_82({}, ...__VLS_functionalComponentArgsRest(__VLS_82));
    const { default: __VLS_86 } = __VLS_84.slots;
    {
        const { actions: __VLS_87 } = __VLS_84.slots;
        const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_87);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_88;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_90 = __VLS_89({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        let __VLS_93;
        const __VLS_94 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.submissions.loading || __VLS_ctx.submissions.data?.length))
                        return;
                    __VLS_ctx.deleteExercises(selections, unselectAll);
                    // @ts-ignore
                    [deleteExercises,];
                } });
        const { default: __VLS_95 } = __VLS_91.slots;
        let __VLS_96;
        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
        Trash2;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_98 = __VLS_97({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
        var __VLS_91;
        var __VLS_92;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_84;
    // @ts-ignore
    [];
    var __VLS_23;
}
else {
    const __VLS_101 = EmptyState;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
        type: "Programming Exercise Submissions",
    }));
    const __VLS_103 = __VLS_102({
        type: "Programming Exercise Submissions",
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
}
if (__VLS_ctx.submissions.data && __VLS_ctx.submissions.hasNextPage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center my-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-5']} */ ;
    let __VLS_106;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
        ...{ 'onClick': {} },
    }));
    const __VLS_108 = __VLS_107({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    let __VLS_111;
    const __VLS_112 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.submissions.data && __VLS_ctx.submissions.hasNextPage))
                    return;
                __VLS_ctx.submissions.next();
                // @ts-ignore
                [submissions, submissions, submissions,];
            } });
    const { default: __VLS_113 } = __VLS_109.slots;
    (__VLS_ctx.__('Load More'));
    // @ts-ignore
    [__,];
    var __VLS_109;
    var __VLS_110;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
