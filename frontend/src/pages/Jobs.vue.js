/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, Breadcrumbs, call, createResource, FormControl, TabButtons, usePageMeta, } from 'frappe-ui';
import { Plus, Search } from 'lucide-vue-next';
import { sessionStore } from '../stores/session';
import { inject, computed, ref, onMounted, watch } from 'vue';
import JobCard from '@/components/JobCard.vue';
import Link from '@/components/Controls/Link.vue';
import EmptyState from '@/components/EmptyState.vue';
const user = inject('$user');
const jobType = ref(null);
const workMode = ref(null);
const { brand } = sessionStore();
const searchQuery = ref('');
const country = ref(null);
const filters = ref({});
const orFilters = ref({});
const jobCount = ref(0);
const closedJobs = ref(0);
const activeTab = ref('Open');
const readOnlyMode = window.read_only_mode;
onMounted(() => {
    getClosedJobCount();
    setFiltersFromURL();
    updateJobs();
});
const isModerator = computed(() => {
    return user.data?.is_moderator;
});
const getClosedJobCount = () => {
    if (!user.data?.name) {
        return;
    }
    const filters = {
        status: 'Closed',
    };
    if (!isModerator.value) {
        filters.owner = user.data?.name;
    }
    call('frappe.client.get_count', {
        doctype: 'Job Opportunity',
        filters: filters,
    }).then((count) => {
        closedJobs.value = count;
    });
};
const setFiltersFromURL = () => {
    let queries = new URLSearchParams(location.search);
    if (queries.has('type')) {
        jobType.value = queries.get('type');
    }
    if (queries.has('work_mode')) {
        workMode.value = queries.get('work_mode');
    }
};
const tabs = computed(() => {
    const tabsArray = [
        {
            label: __('Open'),
        },
    ];
    if (closedJobs.value) {
        tabsArray.push({
            label: __('Closed'),
        });
    }
    return tabsArray;
});
const jobs = createResource({
    url: 'lms.lms.api.get_job_opportunities',
    cache: ['jobs'],
});
const updateJobs = () => {
    updateFilters();
    jobs.update({
        params: {
            filters: filters.value,
            orFilters: orFilters.value,
        },
    });
    jobs.reload();
};
const updateFilters = () => {
    filters.value.status = 'Open';
    if (jobType.value && jobType.value !== ' ') {
        filters.value.type = jobType.value;
    }
    else {
        delete filters.value.type;
    }
    if (workMode.value && workMode.value !== ' ') {
        filters.value.work_mode = workMode.value;
    }
    else {
        delete filters.value.work_mode;
    }
    if (searchQuery.value) {
        orFilters.value = {
            job_title: ['like', `%${searchQuery.value}%`],
            company_name: ['like', `%${searchQuery.value}%`],
            location: ['like', `%${searchQuery.value}%`],
        };
    }
    else {
        orFilters.value = {};
    }
    if (country.value) {
        filters.value.country = country.value;
    }
    else {
        delete filters.value.country;
    }
    if (activeTab.value === 'Closed') {
        filters.value.status = 'Closed';
        if (!isModerator.value) {
            filters.value.owner = user.data?.name;
        }
    }
    else {
        filters.value.status = 'Open';
        delete filters.value.owner;
    }
};
watch(activeTab, (val) => {
    updateJobs();
});
watch(country, (val) => {
    updateJobs();
});
watch(jobs, () => {
    jobCount.value = jobs.data?.length || 0;
});
const jobTypes = computed(() => {
    return [
        { label: __(' '), value: ' ' },
        { label: __('Full Time'), value: 'Full Time' },
        { label: __('Part Time'), value: 'Part Time' },
        { label: __('Contract'), value: 'Contract' },
        { label: __('Freelance'), value: 'Freelance' },
    ];
});
const workModes = computed(() => {
    return [
        { label: __(' '), value: ' ' },
        { label: __('On site'), value: 'On-site' },
        { label: __('Hybrid'), value: 'Hybrid' },
        { label: __('Remote'), value: 'Remote' },
    ];
});
usePageMeta(() => {
    return {
        title: __('Jobs'),
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "" },
});
/** @type {__VLS_StyleScopedClasses['']} */ ;
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
    ...{ class: "h-7" },
    items: ([{ label: __VLS_ctx.__('Jobs'), route: { name: 'Jobs' } }]),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-7" },
    items: ([{ label: __VLS_ctx.__('Jobs'), route: { name: 'Jobs' } }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
if (__VLS_ctx.user.data?.name) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        to: ({
            name: 'JobForm',
            params: {
                jobName: 'new',
            },
        }),
    }));
    const __VLS_7 = __VLS_6({
        to: ({
            name: 'JobForm',
            params: {
                jobName: 'new',
            },
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const { default: __VLS_10 } = __VLS_8.slots;
    if (!__VLS_ctx.readOnlyMode) {
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            variant: "solid",
        }));
        const __VLS_13 = __VLS_12({
            variant: "solid",
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        const { default: __VLS_16 } = __VLS_14.slots;
        {
            const { prefix: __VLS_17 } = __VLS_14.slots;
            let __VLS_18;
            /** @ts-ignore @type { | typeof __VLS_components.Plus} */
            Plus;
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                ...{ class: "h-4 w-4" },
            }));
            const __VLS_20 = __VLS_19({
                ...{ class: "h-4 w-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_19));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            // @ts-ignore
            [__, user, readOnlyMode,];
        }
        (__VLS_ctx.__('New Job'));
        // @ts-ignore
        [__,];
        var __VLS_14;
    }
    // @ts-ignore
    [];
    var __VLS_8;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center justify-between w-full md:w-4/5 mx-auto mb-2 p-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:space-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:w-4/5']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold text-ink-gray-9 md:mb-0" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['md:mb-0']} */ ;
(__VLS_ctx.__('{0} {1} Jobs').format(__VLS_ctx.jobCount, __VLS_ctx.activeTab));
if (__VLS_ctx.tabs.length > 1) {
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
    TabButtons;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.activeTab),
        buttons: (__VLS_ctx.tabs),
        ...{ class: "lg:hidden" },
    }));
    const __VLS_25 = __VLS_24({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.activeTab),
        buttons: (__VLS_ctx.tabs),
        ...{ class: "lg:hidden" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_28;
    const __VLS_29 = ({ change: {} },
        { onChange: (__VLS_ctx.updateJobs) });
    /** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
    var __VLS_26;
    var __VLS_27;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['md:space-x-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:space-y-0']} */ ;
if (__VLS_ctx.tabs.length > 1) {
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
    TabButtons;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.activeTab),
        buttons: (__VLS_ctx.tabs),
        ...{ class: "hidden lg:block" },
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.activeTab),
        buttons: (__VLS_ctx.tabs),
        ...{ class: "hidden lg:block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ change: {} },
        { onChange: (__VLS_ctx.updateJobs) });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:block']} */ ;
    var __VLS_33;
    var __VLS_34;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
let __VLS_37;
/** @ts-ignore @type { | typeof __VLS_components.FormControl | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    ...{ 'onInput': {} },
    type: "text",
    placeholder: (__VLS_ctx.__('Search')),
    modelValue: (__VLS_ctx.searchQuery),
    ...{ class: "w-full" },
}));
const __VLS_39 = __VLS_38({
    ...{ 'onInput': {} },
    type: "text",
    placeholder: (__VLS_ctx.__('Search')),
    modelValue: (__VLS_ctx.searchQuery),
    ...{ class: "w-full" },
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_42;
const __VLS_43 = ({ input: {} },
    { onInput: (__VLS_ctx.updateJobs) });
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
const { default: __VLS_44 } = __VLS_40.slots;
{
    const { prefix: __VLS_45 } = __VLS_40.slots;
    let __VLS_46;
    /** @ts-ignore @type { | typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-5" },
        name: "search",
    }));
    const __VLS_48 = __VLS_47({
        ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-5" },
        name: "search",
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    // @ts-ignore
    [__, __, jobCount, activeTab, activeTab, activeTab, tabs, tabs, tabs, tabs, updateJobs, updateJobs, updateJobs, searchQuery,];
}
// @ts-ignore
[];
var __VLS_40;
var __VLS_41;
if (__VLS_ctx.user.data) {
    const __VLS_51 = Link;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        doctype: "Country",
        modelValue: (__VLS_ctx.country),
        placeholder: (__VLS_ctx.__('Country')),
        ...{ class: "w-full" },
    }));
    const __VLS_53 = __VLS_52({
        doctype: "Country",
        modelValue: (__VLS_ctx.country),
        placeholder: (__VLS_ctx.__('Country')),
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-2 gap-4" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
let __VLS_56;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.jobType),
    type: "select",
    options: (__VLS_ctx.jobTypes),
    ...{ class: "w-full min-w-32" },
    placeholder: (__VLS_ctx.__('Type')),
}));
const __VLS_58 = __VLS_57({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.jobType),
    type: "select",
    options: (__VLS_ctx.jobTypes),
    ...{ class: "w-full min-w-32" },
    placeholder: (__VLS_ctx.__('Type')),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_61;
const __VLS_62 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': (__VLS_ctx.updateJobs) });
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-32']} */ ;
var __VLS_59;
var __VLS_60;
let __VLS_63;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.workMode),
    type: "select",
    options: (__VLS_ctx.workModes),
    ...{ class: "w-full min-w-32" },
    placeholder: (__VLS_ctx.__('Work Mode')),
}));
const __VLS_65 = __VLS_64({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.workMode),
    type: "select",
    options: (__VLS_ctx.workModes),
    ...{ class: "w-full min-w-32" },
    placeholder: (__VLS_ctx.__('Work Mode')),
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
let __VLS_68;
const __VLS_69 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': (__VLS_ctx.updateJobs) });
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-32']} */ ;
var __VLS_66;
var __VLS_67;
if (__VLS_ctx.jobs.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full md:w-4/5 mx-auto p-5 pt-0" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:w-4/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 lg:grid-cols-3 gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    for (const [job] of __VLS_vFor((__VLS_ctx.jobs.data))) {
        let __VLS_70;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
            to: ({
                name: 'JobDetail',
                params: { job: job.name },
            }),
            key: (job.name),
        }));
        const __VLS_72 = __VLS_71({
            to: ({
                name: 'JobDetail',
                params: { job: job.name },
            }),
            key: (job.name),
        }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        const { default: __VLS_75 } = __VLS_73.slots;
        const __VLS_76 = JobCard;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
            job: (job),
        }));
        const __VLS_78 = __VLS_77({
            job: (job),
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        // @ts-ignore
        [__, __, __, user, updateJobs, updateJobs, country, jobType, jobTypes, workMode, workModes, jobs, jobs,];
        var __VLS_73;
        // @ts-ignore
        [];
    }
}
else {
    const __VLS_81 = EmptyState;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
        type: "Job Openings",
    }));
    const __VLS_83 = __VLS_82({
        type: "Job Openings",
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
