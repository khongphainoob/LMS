/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, Button, createListResource, Dropdown, FormControl, Select, TabButtons, usePageMeta, } from 'frappe-ui';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronDown, Plus } from 'lucide-vue-next';
import { sessionStore } from '@/stores/session';
import BatchCard from '@/components/BatchCard.vue';
import EmptyState from '@/components/EmptyState.vue';
const user = inject('$user');
const dayjs = inject('$dayjs');
const { brand } = sessionStore();
const start = ref(0);
const pageLength = ref(20);
const categories = ref([]);
const currentCategory = ref(null);
const title = ref('');
const certification = ref(false);
const filters = ref({});
const is_student = computed(() => user.data?.is_student);
const currentTab = ref(is_student.value ? 'all' : 'upcoming');
const orderBy = ref('start_date');
const readOnlyMode = window.read_only_mode;
const router = useRouter();
onMounted(() => {
    setFiltersFromQuery();
    updateBatches();
    categories.value = [
        {
            label: '',
            value: null,
        },
    ];
});
const setFiltersFromQuery = () => {
    let queries = new URLSearchParams(location.search);
    title.value = queries.get('title') || '';
    currentCategory.value = queries.get('category') || null;
    certification.value = queries.get('certification') || false;
};
const batches = createListResource({
    doctype: 'LMS Batch',
    url: 'lms.lms.utils.get_batches',
    cache: ['batches', user.data?.name],
    pageLength: pageLength.value,
    start: start.value,
});
const setCategories = (data) => {
    let allCategories = data.map((batch) => batch.category);
    allCategories = allCategories.filter((category, index) => allCategories.indexOf(category) === index && category);
    if (categories.value.length <= allCategories.length) {
        updateCategories(data);
    }
};
const updateBatches = () => {
    updateFilters();
    batches.update({
        filters: filters.value,
        orderBy: orderBy.value,
    });
    batches.reload().then((data) => {
        setCategories(data);
    });
};
const updateFilters = () => {
    updateCategoryFilter();
    updateTitleFilter();
    updateCertificationFilter();
    updateTabFilter();
    updateStudentFilter();
    setQueryParams();
};
const updateCategoryFilter = () => {
    if (currentCategory.value) {
        filters.value['category'] = currentCategory.value;
    }
    else {
        delete filters.value['category'];
    }
};
const updateTitleFilter = () => {
    if (title.value) {
        filters.value['title'] = ['like', `%${title.value}%`];
    }
    else {
        delete filters.value['title'];
    }
};
const updateCertificationFilter = () => {
    if (certification.value) {
        filters.value['certification'] = 1;
    }
    else {
        delete filters.value['certification'];
    }
};
const updateTabFilter = () => {
    orderBy.value = 'start_date';
    if (!user.data) {
        return;
    }
    if (currentTab.value == 'enrolled' && is_student.value) {
        filters.value['enrolled'] = 1;
        delete filters.value['start_date'];
        delete filters.value['published'];
        orderBy.value = 'start_date desc';
    }
    else if (is_student.value) {
        delete filters.value['enrolled'];
    }
    else {
        delete filters.value['start_date'];
        delete filters.value['published'];
        orderBy.value = 'start_date desc';
        if (currentTab.value == 'upcoming') {
            filters.value['start_date'] = ['>=', dayjs().format('YYYY-MM-DD')];
            filters.value['published'] = 1;
            orderBy.value = 'start_date';
        }
        else if (currentTab.value == 'archived') {
            filters.value['start_date'] = ['<=', dayjs().format('YYYY-MM-DD')];
        }
        else if (currentTab.value == 'unpublished') {
            filters.value['published'] = 0;
        }
    }
};
const updateStudentFilter = () => {
    if (!user.data || (is_student.value && currentTab.value != 'enrolled')) {
        filters.value['start_date'] = ['>=', dayjs().format('YYYY-MM-DD')];
        filters.value['published'] = 1;
    }
};
const setQueryParams = () => {
    let queries = new URLSearchParams(location.search);
    let filterKeys = {
        title: title.value,
        category: currentCategory.value,
        certification: certification.value,
    };
    Object.keys(filterKeys).forEach((key) => {
        if (filterKeys[key]) {
            queries.set(key, filterKeys[key]);
        }
        else {
            queries.delete(key);
        }
    });
    history.replaceState({}, '', `${location.pathname}${queries.size > 0 ? `?${queries.toString()}` : ''}`);
};
const updateCategories = (data) => {
    data.forEach((batch) => {
        if (batch.category &&
            !categories.value.find((category) => category.value === batch.category))
            categories.value.push({
                label: batch.category,
                value: batch.category,
            });
    });
};
watch(currentTab, () => {
    updateBatches();
});
const batchTabs = computed(() => {
    let tabs = [
        {
            label: __('All'),
            value: 'all',
        },
    ];
    if (user.data?.is_moderator ||
        user.data?.is_instructor ||
        user.data?.is_evaluator) {
        tabs.push({ label: __('Upcoming'), value: 'upcoming' });
        tabs.push({ label: __('Archived'), value: 'archived' });
        tabs.push({ label: __('Unpublished'), value: 'unpublished' });
    }
    else if (user.data) {
        tabs.push({ label: __('Enrolled'), value: 'enrolled' });
    }
    return tabs;
});
const canCreateBatch = () => {
    if (readOnlyMode)
        return false;
    if (user.data?.is_moderator ||
        user.data?.is_instructor ||
        user.data?.is_evaluator)
        return true;
    return false;
};
const breadcrumbs = computed(() => [
    {
        label: __('Batches'),
        route: { name: 'Batches' },
    },
]);
usePageMeta(() => {
    return {
        title: __('Batches'),
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
if (__VLS_ctx.canCreateBatch()) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Dropdown | typeof __VLS_components.Dropdown} */
    Dropdown;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        options: ([
            {
                label: __VLS_ctx.__('New Batch'),
                icon: 'users',
                onClick() {
                    __VLS_ctx.router.push({
                        name: 'BatchForm',
                        params: { batchName: 'new' },
                    });
                },
            },
            {
                label: __VLS_ctx.__('Import Batch'),
                icon: 'upload',
                onClick() {
                    __VLS_ctx.router.push({
                        name: 'NewDataImport',
                        params: { doctype: 'LMS Batch' },
                    });
                },
            },
        ]),
    }));
    const __VLS_7 = __VLS_6({
        options: ([
            {
                label: __VLS_ctx.__('New Batch'),
                icon: 'users',
                onClick() {
                    __VLS_ctx.router.push({
                        name: 'BatchForm',
                        params: { batchName: 'new' },
                    });
                },
            },
            {
                label: __VLS_ctx.__('Import Batch'),
                icon: 'upload',
                onClick() {
                    __VLS_ctx.router.push({
                        name: 'NewDataImport',
                        params: { doctype: 'LMS Batch' },
                    });
                },
            },
        ]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const { default: __VLS_10 } = __VLS_8.slots;
    {
        const { default: __VLS_11 } = __VLS_8.slots;
        const [{ open }] = __VLS_vSlot(__VLS_11);
        let __VLS_12;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            variant: "solid",
        }));
        const __VLS_14 = __VLS_13({
            variant: "solid",
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        const { default: __VLS_17 } = __VLS_15.slots;
        {
            const { prefix: __VLS_18 } = __VLS_15.slots;
            let __VLS_19;
            /** @ts-ignore @type { | typeof __VLS_components.Plus} */
            Plus;
            // @ts-ignore
            const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_21 = __VLS_20({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_20));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [breadcrumbs, canCreateBatch, __, __, router, router,];
        }
        (__VLS_ctx.__('Create'));
        {
            const { suffix: __VLS_24 } = __VLS_15.slots;
            let __VLS_25;
            /** @ts-ignore @type { | typeof __VLS_components.ChevronDown} */
            ChevronDown;
            // @ts-ignore
            const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
                ...{ class: ([
                        'w-4 h-4 stroke-1.5 ml-1 transform transition-transform',
                        open ? 'rotate-180' : '',
                    ]) },
            }));
            const __VLS_27 = __VLS_26({
                ...{ class: ([
                        'w-4 h-4 stroke-1.5 ml-1 transform transition-transform',
                        open ? 'rotate-180' : '',
                    ]) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_26));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['transform']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
            // @ts-ignore
            [__,];
        }
        // @ts-ignore
        [];
        var __VLS_15;
        // @ts-ignore
        [];
        __VLS_8.slots['' /* empty slot name completion */];
    }
    // @ts-ignore
    [];
    var __VLS_8;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-5 pb-10" },
});
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center justify-between mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:space-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg text-ink-gray-9 font-semibold" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
(__VLS_ctx.__('All Batches'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:space-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:space-x-4']} */ ;
if (__VLS_ctx.user.data) {
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
    TabButtons;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        buttons: (__VLS_ctx.batchTabs),
        modelValue: (__VLS_ctx.currentTab),
        ...{ class: "w-fit" },
    }));
    const __VLS_32 = __VLS_31({
        buttons: (__VLS_ctx.batchTabs),
        modelValue: (__VLS_ctx.currentTab),
        ...{ class: "w-fit" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-2 gap-2" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
let __VLS_35;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.title),
    placeholder: (__VLS_ctx.__('Search by Title')),
    type: "text",
    ...{ class: "min-w-40 lg:min-w-0 lg:w-32 xl:w-40" },
}));
const __VLS_37 = __VLS_36({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.title),
    placeholder: (__VLS_ctx.__('Search by Title')),
    type: "text",
    ...{ class: "min-w-40 lg:min-w-0 lg:w-32 xl:w-40" },
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_40;
const __VLS_41 = ({ input: {} },
    { onInput: (...[$event]) => {
            __VLS_ctx.updateBatches();
            // @ts-ignore
            [__, __, user, batchTabs, currentTab, title, updateBatches,];
        } });
/** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:w-32']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:w-40']} */ ;
var __VLS_38;
var __VLS_39;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-w-40 lg:min-w-0 lg:w-32 xl:w-40" },
});
/** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:w-32']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:w-40']} */ ;
if (__VLS_ctx.categories.length) {
    let __VLS_42;
    /** @ts-ignore @type { | typeof __VLS_components.Select} */
    Select;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.currentCategory),
        options: (__VLS_ctx.categories),
        placeholder: (__VLS_ctx.__('Category')),
    }));
    const __VLS_44 = __VLS_43({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.currentCategory),
        options: (__VLS_ctx.categories),
        placeholder: (__VLS_ctx.__('Category')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_47;
    const __VLS_48 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': (...[$event]) => {
                if (!(__VLS_ctx.categories.length))
                    return;
                __VLS_ctx.updateBatches();
                // @ts-ignore
                [__, updateBatches, categories, categories, currentCategory,];
            } });
    var __VLS_45;
    var __VLS_46;
}
let __VLS_49;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.certification),
    label: (__VLS_ctx.__('Certification')),
    type: "checkbox",
}));
const __VLS_51 = __VLS_50({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.certification),
    label: (__VLS_ctx.__('Certification')),
    type: "checkbox",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
let __VLS_54;
const __VLS_55 = ({ change: {} },
    { onChange: (...[$event]) => {
            __VLS_ctx.updateBatches();
            // @ts-ignore
            [__, updateBatches, certification,];
        } });
var __VLS_52;
var __VLS_53;
if (__VLS_ctx.batches.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    for (const [batch] of __VLS_vFor((__VLS_ctx.batches.data))) {
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            to: ({ name: 'BatchDetail', params: { batchName: batch.name } }),
        }));
        const __VLS_58 = __VLS_57({
            to: ({ name: 'BatchDetail', params: { batchName: batch.name } }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        const { default: __VLS_61 } = __VLS_59.slots;
        const __VLS_62 = BatchCard;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
            batch: (batch),
        }));
        const __VLS_64 = __VLS_63({
            batch: (batch),
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        // @ts-ignore
        [batches, batches,];
        var __VLS_59;
        // @ts-ignore
        [];
    }
}
else if (!__VLS_ctx.batches.list.loading) {
    const __VLS_67 = EmptyState;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        type: "Batches",
    }));
    const __VLS_69 = __VLS_68({
        type: "Batches",
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
}
if (!__VLS_ctx.batches.list.loading && __VLS_ctx.batches.hasNextPage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    let __VLS_72;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_77;
    const __VLS_78 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.batches.list.loading && __VLS_ctx.batches.hasNextPage))
                    return;
                __VLS_ctx.batches.next();
                // @ts-ignore
                [batches, batches, batches, batches,];
            } });
    const { default: __VLS_79 } = __VLS_75.slots;
    (__VLS_ctx.__('Load More'));
    // @ts-ignore
    [__,];
    var __VLS_75;
    var __VLS_76;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
