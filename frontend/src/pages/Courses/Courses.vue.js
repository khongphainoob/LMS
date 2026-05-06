/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, Button, call, createListResource, Dropdown, FormControl, Select, TabButtons, usePageMeta, } from 'frappe-ui';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { ChevronDown, Plus } from 'lucide-vue-next';
import { sessionStore } from '@/stores/session';
import { canCreateCourse } from '@/utils';
import CourseCard from '@/components/CourseCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useRouter } from 'vue-router';
import NewCourseModal from '@/pages/Courses/NewCourseModal.vue';
const user = inject('$user');
const dayjs = inject('$dayjs');
const start = ref(0);
const pageLength = ref(30);
const categories = ref([
    {
        label: '',
        value: null,
    },
]);
const currentCategory = ref(null);
const title = ref('');
const certification = ref(false);
const filters = ref({});
const currentTab = ref('live');
const { brand } = sessionStore();
const courseCount = ref(0);
const router = useRouter();
const showCourseModal = ref(false);
onMounted(() => {
    setFiltersFromQuery();
    updateCourses();
    getCourseCount();
});
const setFiltersFromQuery = () => {
    let queries = new URLSearchParams(location.search);
    title.value = queries.get('title') || '';
    currentCategory.value = queries.get('category') || null;
    certification.value = queries.get('certification') || false;
    if (queries.get('newCourse') == '1') {
        showCourseModal.value = true;
    }
};
const courses = createListResource({
    doctype: 'LMS Course',
    url: 'lms.lms.utils.get_courses',
    cache: ['courses', user.data?.name],
    pageLength: pageLength.value,
    start: start.value,
});
const setCategories = (data) => {
    let allCategories = data.map((course) => course.category);
    allCategories = allCategories.filter((category, index) => allCategories.indexOf(category) === index && category);
    if (categories.value.length <= allCategories.length) {
        updateCategories(data);
    }
};
const isPersonaCaptured = async () => {
    let persona = await call('frappe.client.get_single_value', {
        doctype: 'LMS Settings',
        field: 'persona_captured',
    });
    return persona;
};
const identifyUserPersona = async () => {
    if (user.data?.is_system_manager && !user.data?.developer_mode) {
        let personaCaptured = await isPersonaCaptured();
        if (personaCaptured)
            return;
        if (!courseCount.value) {
            router.push({
                name: 'PersonaForm',
            });
        }
    }
};
const getCourseCount = () => {
    if (!user.data)
        return;
    if (!user.data.is_moderator)
        return;
    call('frappe.client.get_count', {
        doctype: 'LMS Course',
    }).then((data) => {
        courseCount.value = data;
        identifyUserPersona();
    });
};
const updateCourses = () => {
    updateFilters();
    courses.update({
        filters: filters.value,
    });
    courses.reload().then((data) => {
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
    delete filters.value['live'];
    delete filters.value['created'];
    delete filters.value['published_on'];
    delete filters.value['upcoming'];
    if (currentTab.value == 'enrolled' && user.data?.is_student) {
        filters.value['enrolled'] = 1;
        delete filters.value['published'];
    }
    else {
        delete filters.value['published'];
        delete filters.value['enrolled'];
        if (currentTab.value == 'live') {
            filters.value['published'] = 1;
            filters.value['upcoming'] = 0;
            filters.value['live'] = 1;
        }
        else if (currentTab.value == 'upcoming') {
            filters.value['upcoming'] = 1;
        }
        else if (currentTab.value == 'new') {
            filters.value['published'] = 1;
            filters.value['published_on'] = [
                '>=',
                dayjs().add(-3, 'month').format('YYYY-MM-DD'),
            ];
        }
        else if (currentTab.value == 'created') {
            filters.value['created'] = 1;
        }
        else if (currentTab.value == 'unpublished') {
            filters.value['published'] = 0;
        }
    }
};
const updateStudentFilter = () => {
    if (!user.data || (user.data?.is_student && currentTab.value != 'enrolled')) {
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
    let queryString = '';
    if (queries.toString()) {
        queryString = `?${queries.toString()}`;
    }
    history.replaceState({}, '', `${location.pathname}${queryString}`);
};
const updateCategories = (data) => {
    data.forEach((course) => {
        if (course.category &&
            !categories.value.find((category) => category.value === course.category))
            categories.value.push({
                label: course.category,
                value: course.category,
            });
    });
};
watch(currentTab, () => {
    updateCourses();
});
const courseTabs = computed(() => {
    let tabs = [
        {
            label: __('Live'),
            value: 'live',
        },
        {
            label: __('New'),
            value: 'new',
        },
        {
            label: __('Upcoming'),
            value: 'upcoming',
        },
    ];
    if (user.data?.is_moderator ||
        user.data?.is_instructor ||
        user.data?.is_evaluator) {
        tabs.push({ label: __('Created'), value: 'created' });
        tabs.push({ label: __('Unpublished'), value: 'unpublished' });
    }
    else if (user.data) {
        tabs.push({ label: __('Enrolled'), value: 'enrolled' });
    }
    return tabs;
});
const breadcrumbs = computed(() => [
    {
        label: __('Courses'),
        route: { name: 'Courses' },
    },
]);
usePageMeta(() => {
    return {
        title: __('Courses'),
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
if (__VLS_ctx.canCreateCourse()) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Dropdown | typeof __VLS_components.Dropdown} */
    Dropdown;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        placement: "right",
        side: "bottom",
        options: ([
            {
                label: __VLS_ctx.__('New Course'),
                icon: 'book-open',
                onClick() {
                    __VLS_ctx.showCourseModal = true;
                },
            },
            {
                label: __VLS_ctx.__('Import Course'),
                icon: 'upload',
                onClick() {
                    __VLS_ctx.router.push({
                        name: 'NewDataImport',
                        params: { doctype: 'LMS Course' },
                    });
                },
            },
        ]),
    }));
    const __VLS_7 = __VLS_6({
        placement: "right",
        side: "bottom",
        options: ([
            {
                label: __VLS_ctx.__('New Course'),
                icon: 'book-open',
                onClick() {
                    __VLS_ctx.showCourseModal = true;
                },
            },
            {
                label: __VLS_ctx.__('Import Course'),
                icon: 'upload',
                onClick() {
                    __VLS_ctx.router.push({
                        name: 'NewDataImport',
                        params: { doctype: 'LMS Course' },
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
            [breadcrumbs, canCreateCourse, __, __, showCourseModal, router,];
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
(__VLS_ctx.__('All Courses'));
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
let __VLS_30;
/** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
TabButtons;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    buttons: (__VLS_ctx.courseTabs),
    modelValue: (__VLS_ctx.currentTab),
    ...{ class: "w-fit" },
}));
const __VLS_32 = __VLS_31({
    buttons: (__VLS_ctx.courseTabs),
    modelValue: (__VLS_ctx.currentTab),
    ...{ class: "w-fit" },
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
/** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
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
    ...{ class: "w-full lg:min-w-0 lg:w-32 xl:w-40" },
}));
const __VLS_37 = __VLS_36({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.title),
    placeholder: (__VLS_ctx.__('Search by Title')),
    type: "text",
    ...{ class: "w-full lg:min-w-0 lg:w-32 xl:w-40" },
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_40;
const __VLS_41 = ({ input: {} },
    { onInput: (...[$event]) => {
            __VLS_ctx.updateCourses();
            // @ts-ignore
            [__, __, courseTabs, currentTab, title, updateCourses,];
        } });
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:w-32']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:w-40']} */ ;
var __VLS_38;
var __VLS_39;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-full lg:min-w-0 lg:w-32 xl:w-40" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
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
                __VLS_ctx.updateCourses();
                // @ts-ignore
                [__, updateCourses, categories, categories, currentCategory,];
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
            __VLS_ctx.updateCourses();
            // @ts-ignore
            [__, updateCourses, certification,];
        } });
var __VLS_52;
var __VLS_53;
if (__VLS_ctx.courses.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['2xl:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
    for (const [course] of __VLS_vFor((__VLS_ctx.courses.data))) {
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            to: ({ name: 'CourseDetail', params: { courseName: course.name } }),
        }));
        const __VLS_58 = __VLS_57({
            to: ({ name: 'CourseDetail', params: { courseName: course.name } }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        const { default: __VLS_61 } = __VLS_59.slots;
        const __VLS_62 = CourseCard;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
            course: (course),
        }));
        const __VLS_64 = __VLS_63({
            course: (course),
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        // @ts-ignore
        [courses, courses,];
        var __VLS_59;
        // @ts-ignore
        [];
    }
}
else if (!__VLS_ctx.courses.list.loading) {
    const __VLS_67 = EmptyState;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        type: "Courses",
    }));
    const __VLS_69 = __VLS_68({
        type: "Courses",
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
}
if (!__VLS_ctx.courses.list.loading && __VLS_ctx.courses.hasNextPage) {
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
                if (!(!__VLS_ctx.courses.list.loading && __VLS_ctx.courses.hasNextPage))
                    return;
                __VLS_ctx.courses.next();
                // @ts-ignore
                [courses, courses, courses, courses,];
            } });
    const { default: __VLS_79 } = __VLS_75.slots;
    (__VLS_ctx.__('Load More'));
    // @ts-ignore
    [__,];
    var __VLS_75;
    var __VLS_76;
}
if (__VLS_ctx.showCourseModal) {
    const __VLS_80 = NewCourseModal;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
        modelValue: (__VLS_ctx.showCourseModal),
        courses: (__VLS_ctx.courses),
    }));
    const __VLS_82 = __VLS_81({
        modelValue: (__VLS_ctx.showCourseModal),
        courses: (__VLS_ctx.courses),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
}
// @ts-ignore
[showCourseModal, showCourseModal, courses,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
