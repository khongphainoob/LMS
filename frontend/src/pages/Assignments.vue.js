/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, Button, call, createListResource, FormControl, ListView, usePageMeta, } from 'frappe-ui';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { Plus } from 'lucide-vue-next';
import { useRouter, useRoute } from 'vue-router';
import { sessionStore } from '../stores/session';
import AssignmentForm from '@/components/Modals/AssignmentForm.vue';
import EmptyState from '@/components/EmptyState.vue';
const user = inject('$user');
const dayjs = inject('$dayjs');
const titleFilter = ref('');
const typeFilter = ref('');
const showAssignmentForm = ref(false);
const assignmentID = ref('new');
const assignmentCount = ref(0);
const { brand } = sessionStore();
const router = useRouter();
const route = useRoute();
const readOnlyMode = window.read_only_mode;
onMounted(() => {
    if (!user.data?.is_moderator && !user.data?.is_instructor) {
        router.push({ name: 'Courses' });
    }
    if (route.query.new === 'true') {
        assignmentID.value = 'new';
        showAssignmentForm.value = true;
    }
    getAssignmentCount();
    titleFilter.value = router.currentRoute.value.query.title;
    typeFilter.value = router.currentRoute.value.query.type;
});
watch([titleFilter, typeFilter], () => {
    router.push({
        query: {
            title: titleFilter.value,
            type: typeFilter.value,
        },
    });
    reloadAssignments();
});
const reloadAssignments = () => {
    assignments.update({
        filters: assignmentFilter.value,
    });
    assignments.reload();
};
const assignmentFilter = computed(() => {
    let filters = {};
    if (titleFilter.value) {
        filters.title = ['like', `%${titleFilter.value}%`];
    }
    if (typeFilter.value) {
        filters.type = typeFilter.value;
    }
    return filters;
});
const assignments = createListResource({
    doctype: 'LMS Assignment',
    fields: ['name', 'title', 'type', 'creation', 'question', 'course'],
    orderBy: 'modified desc',
    cache: ['assignments'],
    transform(data) {
        return data.map((row) => {
            return {
                ...row,
                creation: dayjs(row.creation).fromNow(),
            };
        });
    },
});
const assignmentColumns = computed(() => {
    return [
        {
            label: __('Title'),
            key: 'title',
            width: 2,
        },
        {
            label: __('Type'),
            key: 'type',
            width: 1,
            align: 'left',
        },
        {
            label: __('Created'),
            key: 'creation',
            width: 1,
            align: 'right',
        },
    ];
});
const getAssignmentCount = () => {
    call('frappe.client.get_count', {
        doctype: 'LMS Assignment',
    }).then((data) => {
        assignmentCount.value = data;
    });
};
const assignmentTypes = computed(() => {
    let types = ['', 'Document', 'Image', 'PDF', 'URL', 'Text'];
    return types.map((type) => {
        return {
            label: __(type),
            value: type,
        };
    });
});
const breadcrumbs = computed(() => [
    {
        label: __('Assignments'),
        route: { name: 'Assignments' },
    },
]);
usePageMeta(() => {
    return {
        title: __('Assignments'),
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
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (!__VLS_ctx.readOnlyMode) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ click: {} },
        { onClick: (() => {
                __VLS_ctx.assignmentID = 'new';
                __VLS_ctx.showAssignmentForm = true;
            }) });
    const { default: __VLS_12 } = __VLS_8.slots;
    {
        const { prefix: __VLS_13 } = __VLS_8.slots;
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ class: "w-4 h-4" },
        }));
        const __VLS_16 = __VLS_15({
            ...{ class: "w-4 h-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        // @ts-ignore
        [breadcrumbs, readOnlyMode, assignmentID, showAssignmentForm,];
    }
    (__VLS_ctx.__('Create'));
    // @ts-ignore
    [__,];
    var __VLS_8;
    var __VLS_9;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "md:w-3/4 md:mx-auto py-5 mx-5" },
});
/** @type {__VLS_StyleScopedClasses['md:w-3/4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
if (__VLS_ctx.assignmentCount) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('{0} Assignments').format(__VLS_ctx.assignmentCount));
}
if (__VLS_ctx.assignments.data?.length || __VLS_ctx.assignmentCount > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    let __VLS_19;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        modelValue: (__VLS_ctx.titleFilter),
        placeholder: (__VLS_ctx.__('Search by title')),
    }));
    const __VLS_21 = __VLS_20({
        modelValue: (__VLS_ctx.titleFilter),
        placeholder: (__VLS_ctx.__('Search by title')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    let __VLS_24;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        modelValue: (__VLS_ctx.typeFilter),
        type: "select",
        options: (__VLS_ctx.assignmentTypes),
        placeholder: (__VLS_ctx.__('Type')),
    }));
    const __VLS_26 = __VLS_25({
        modelValue: (__VLS_ctx.typeFilter),
        type: "select",
        options: (__VLS_ctx.assignmentTypes),
        placeholder: (__VLS_ctx.__('Type')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
if (__VLS_ctx.assignments.data?.length) {
    let __VLS_29;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        columns: (__VLS_ctx.assignmentColumns),
        rows: (__VLS_ctx.assignments.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: false,
            onRowClick: (row) => {
                if (__VLS_ctx.readOnlyMode)
                    return;
                __VLS_ctx.assignmentID = row.name;
                __VLS_ctx.showAssignmentForm = true;
            },
        }),
    }));
    const __VLS_31 = __VLS_30({
        columns: (__VLS_ctx.assignmentColumns),
        rows: (__VLS_ctx.assignments.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: false,
            onRowClick: (row) => {
                if (__VLS_ctx.readOnlyMode)
                    return;
                __VLS_ctx.assignmentID = row.name;
                __VLS_ctx.showAssignmentForm = true;
            },
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
}
else {
    const __VLS_34 = EmptyState;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
        type: "Assignments",
    }));
    const __VLS_36 = __VLS_35({
        type: "Assignments",
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
}
if (__VLS_ctx.assignments.data && __VLS_ctx.assignments.hasNextPage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center my-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-5']} */ ;
    let __VLS_39;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
        ...{ 'onClick': {} },
    }));
    const __VLS_41 = __VLS_40({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    let __VLS_44;
    const __VLS_45 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.assignments.data && __VLS_ctx.assignments.hasNextPage))
                    return;
                __VLS_ctx.assignments.next();
                // @ts-ignore
                [readOnlyMode, assignmentID, showAssignmentForm, __, __, __, assignmentCount, assignmentCount, assignmentCount, assignments, assignments, assignments, assignments, assignments, assignments, titleFilter, typeFilter, assignmentTypes, assignmentColumns,];
            } });
    const { default: __VLS_46 } = __VLS_42.slots;
    (__VLS_ctx.__('Load More'));
    // @ts-ignore
    [__,];
    var __VLS_42;
    var __VLS_43;
}
const __VLS_47 = AssignmentForm;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    modelValue: (__VLS_ctx.showAssignmentForm),
    assignments: (__VLS_ctx.assignments),
    assignmentID: (__VLS_ctx.assignmentID),
}));
const __VLS_49 = __VLS_48({
    modelValue: (__VLS_ctx.showAssignmentForm),
    assignments: (__VLS_ctx.assignments),
    assignmentID: (__VLS_ctx.assignmentID),
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
// @ts-ignore
[assignmentID, showAssignmentForm, assignments,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
