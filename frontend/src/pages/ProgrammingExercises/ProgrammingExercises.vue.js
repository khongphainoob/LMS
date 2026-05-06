/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, getCurrentInstance, inject, onMounted, ref } from 'vue';
import { Breadcrumbs, Button, call, createListResource, dayjs, FormControl, ListView, ListHeader, ListRows, ListRow, ListRowItem, FeatherIcon, ListSelectBanner, toast, usePageMeta, } from 'frappe-ui';
import { ClipboardList, Plus } from 'lucide-vue-next';
import { sessionStore } from '@/stores/session';
import { useRouter } from 'vue-router';
import ProgrammingExerciseForm from '@/pages/ProgrammingExercises/ProgrammingExerciseForm.vue';
const exerciseCount = ref(0);
const readOnlyMode = window.read_only_mode;
const { brand } = sessionStore();
const showForm = ref(false);
const exerciseID = ref('new');
const user = inject('$user');
const titleFilter = ref('');
const languageFilter = ref('');
const router = useRouter();
const app = getCurrentInstance();
const { $dialog } = app?.appContext.config.globalProperties;
onMounted(() => {
    validatePermissions();
    getExerciseCount();
});
const validatePermissions = () => {
    if (!user.data?.is_instructor &&
        !user.data?.is_moderator &&
        !user.data?.is_evaluator) {
        router.push({
            name: 'ProgrammingExerciseSubmissions',
        });
    }
};
const getExerciseCount = (filters = {}) => {
    call('frappe.client.get_count', {
        doctype: 'LMS Programming Exercise',
        filters: filters,
    })
        .then((count) => {
        exerciseCount.value = count;
    })
        .catch((error) => {
        console.error('Error fetching exercise count:', error);
    });
};
const exercises = createListResource({
    doctype: 'LMS Programming Exercise',
    cache: ['programmingExercises'],
    fields: ['name', 'title', 'language', 'problem_statement', 'modified'],
    auto: true,
    orderBy: 'modified desc',
});
const updateList = () => {
    let filters = getFilters();
    exercises.update({
        filters: filters,
    });
    exercises.reload();
    getExerciseCount(filters);
};
const getFilters = () => {
    let filters = {};
    if (titleFilter.value) {
        filters['title'] = ['like', `%${titleFilter.value}%`];
    }
    if (languageFilter.value && languageFilter.value.trim() !== '') {
        filters['language'] = languageFilter.value;
    }
    return filters;
};
const showDeleteConfirmation = (selections, unselectAll) => {
    $dialog({
        title: __('Confirm Your Action'),
        message: __('Deleting these exercises will permanently remove them from the system, along with all associated submissions. This action is irreversible. Are you sure you want to proceed?'),
        actions: [
            {
                label: __('Delete'),
                theme: 'red',
                variant: 'solid',
                onClick(close) {
                    deleteExercises(selections, unselectAll);
                    close();
                },
            },
        ],
    });
};
const deleteExercises = (selections, unselectAll) => {
    Array.from(selections).forEach(async (exerciseName) => {
        call('lms.lms.api.delete_programming_exercise', {
            exercise: exerciseName,
        })
            .then(() => {
            toast.success(__('Exercise deleted successfully'));
            updateList();
        })
            .catch((error) => {
            toast.error(__(error.message || error));
            console.error('Error deleting exercise:', error);
        });
    });
    unselectAll();
};
const languages = [
    { label: __(' '), value: ' ' },
    { label: __('Python'), value: 'Python' },
    { label: __('JavaScript'), value: 'JavaScript' },
];
const columns = computed(() => {
    return [
        {
            label: __('Title'),
            key: 'title',
            width: 3,
        },
        {
            label: __('Language'),
            key: 'language',
            width: 2,
            align: 'left',
        },
        {
            label: __('Updated On'),
            key: 'modified',
            width: 1,
        },
    ];
});
usePageMeta(() => {
    return {
        title: __('Programming Exercises'),
        icon: brand.favicon,
    };
});
const breadcrumbs = computed(() => {
    return [
        {
            label: __('Programming Exercises'),
            route: { name: 'ProgrammingExercises' },
        },
    ];
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
    ...{ class: "space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
routerLink;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    to: ({
        name: 'ProgrammingExerciseSubmissions',
    }),
}));
const __VLS_7 = __VLS_6({
    to: ({
        name: 'ProgrammingExerciseSubmissions',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_10 } = __VLS_8.slots;
let __VLS_11;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
const { default: __VLS_16 } = __VLS_14.slots;
{
    const { prefix: __VLS_17 } = __VLS_14.slots;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.ClipboardList} */
    ClipboardList;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ class: "size-4 stroke-1.5" },
    }));
    const __VLS_20 = __VLS_19({
        ...{ class: "size-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [breadcrumbs,];
}
(__VLS_ctx.__('Check All Submissions'));
// @ts-ignore
[__,];
var __VLS_14;
// @ts-ignore
[];
var __VLS_8;
if (!__VLS_ctx.readOnlyMode) {
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_25 = __VLS_24({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_28;
    const __VLS_29 = ({ click: {} },
        { onClick: (() => {
                __VLS_ctx.exerciseID = 'new';
                __VLS_ctx.showForm = true;
            }) });
    const { default: __VLS_30 } = __VLS_26.slots;
    {
        const { prefix: __VLS_31 } = __VLS_26.slots;
        let __VLS_32;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_34 = __VLS_33({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [readOnlyMode, exerciseID, showForm,];
    }
    (__VLS_ctx.__('Create'));
    // @ts-ignore
    [__,];
    var __VLS_26;
    var __VLS_27;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-5" },
});
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('{0} Exercises').format(__VLS_ctx.exerciseCount));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-2 gap-5" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
let __VLS_37;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.titleFilter),
    placeholder: (__VLS_ctx.__('Search by Title')),
}));
const __VLS_39 = __VLS_38({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.titleFilter),
    placeholder: (__VLS_ctx.__('Search by Title')),
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_42;
const __VLS_43 = ({ input: {} },
    { onInput: (__VLS_ctx.updateList) });
var __VLS_40;
var __VLS_41;
let __VLS_44;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.languageFilter),
    type: "select",
    options: (__VLS_ctx.languages),
    placeholder: (__VLS_ctx.__('Type')),
}));
const __VLS_46 = __VLS_45({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.languageFilter),
    type: "select",
    options: (__VLS_ctx.languages),
    placeholder: (__VLS_ctx.__('Type')),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_49;
const __VLS_50 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': (__VLS_ctx.updateList) });
var __VLS_47;
var __VLS_48;
if (__VLS_ctx.exercises.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    let __VLS_51;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        columns: (__VLS_ctx.columns),
        rows: (__VLS_ctx.exercises.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: true,
            onRowClick: (row) => {
                if (__VLS_ctx.readOnlyMode)
                    return;
                __VLS_ctx.exerciseID = row.name;
                __VLS_ctx.showForm = true;
            },
        }),
    }));
    const __VLS_53 = __VLS_52({
        columns: (__VLS_ctx.columns),
        rows: (__VLS_ctx.exercises.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: true,
            onRowClick: (row) => {
                if (__VLS_ctx.readOnlyMode)
                    return;
                __VLS_ctx.exerciseID = row.name;
                __VLS_ctx.showForm = true;
            },
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    const { default: __VLS_56 } = __VLS_54.slots;
    let __VLS_57;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_59 = __VLS_58({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    let __VLS_62;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({}));
    const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const { default: __VLS_67 } = __VLS_65.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.exercises.data))) {
        let __VLS_68;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
            row: (row),
            ...{ class: "hover:bg-surface-gray-1" },
        }));
        const __VLS_70 = __VLS_69({
            row: (row),
            ...{ class: "hover:bg-surface-gray-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-1']} */ ;
        const { default: __VLS_73 } = __VLS_71.slots;
        {
            const { default: __VLS_74 } = __VLS_71.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_74);
            let __VLS_75;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
                item: (row[column.key]),
                align: (column.align),
            }));
            const __VLS_77 = __VLS_76({
                item: (row[column.key]),
                align: (column.align),
            }, ...__VLS_functionalComponentArgsRest(__VLS_76));
            const { default: __VLS_80 } = __VLS_78.slots;
            if (column.key == 'modified') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-sm text-ink-gray-5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
                (__VLS_ctx.dayjs(row[column.key]).format('MMM D, YYYY'));
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (row[column.key]);
            }
            // @ts-ignore
            [__, __, __, readOnlyMode, exerciseID, showForm, exerciseCount, titleFilter, updateList, updateList, languageFilter, languages, exercises, exercises, exercises, columns, dayjs,];
            var __VLS_78;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_71;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_65;
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
                    if (!(__VLS_ctx.exercises.data?.length))
                        return;
                    __VLS_ctx.showDeleteConfirmation(selections, unselectAll);
                    // @ts-ignore
                    [showDeleteConfirmation,];
                } });
        const { default: __VLS_95 } = __VLS_91.slots;
        let __VLS_96;
        /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
        FeatherIcon;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
            name: "trash-2",
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_98 = __VLS_97({
            name: "trash-2",
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
    var __VLS_54;
}
else {
    let __VLS_101;
    /** @ts-ignore @type { | typeof __VLS_components.EmptyState} */
    EmptyState;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
        type: "Programming Exercises",
    }));
    const __VLS_103 = __VLS_102({
        type: "Programming Exercises",
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
}
if (__VLS_ctx.exercises.data && __VLS_ctx.exercises.hasNextPage) {
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
                if (!(__VLS_ctx.exercises.data && __VLS_ctx.exercises.hasNextPage))
                    return;
                __VLS_ctx.exercises.next();
                // @ts-ignore
                [exercises, exercises, exercises,];
            } });
    const { default: __VLS_113 } = __VLS_109.slots;
    (__VLS_ctx.__('Load More'));
    // @ts-ignore
    [__,];
    var __VLS_109;
    var __VLS_110;
}
const __VLS_114 = ProgrammingExerciseForm;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
    modelValue: (__VLS_ctx.showForm),
    exerciseID: (__VLS_ctx.exerciseID),
    exercises: (__VLS_ctx.exercises),
}));
const __VLS_116 = __VLS_115({
    modelValue: (__VLS_ctx.showForm),
    exerciseID: (__VLS_ctx.exerciseID),
    exercises: (__VLS_ctx.exercises),
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
// @ts-ignore
[exerciseID, showForm, exercises,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
