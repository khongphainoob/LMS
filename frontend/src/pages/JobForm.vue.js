/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, FormControl, createResource, Button, TextEditor, usePageMeta, toast, } from 'frappe-ui';
import { computed, onMounted, reactive, inject } from 'vue';
import { sessionStore } from '@/stores/session';
import { useRouter } from 'vue-router';
import { escapeHTML, sanitizeHTML } from '@/utils';
import Uploader from '@/components/Controls/Uploader.vue';
const user = inject('$user');
const router = useRouter();
const { brand } = sessionStore();
const props = defineProps({
    jobName: {
        type: String,
        default: 'new',
    },
});
const newJob = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'Job Opportunity',
                company_logo: job.company_logo,
                ...job,
            },
        };
    },
});
const updateJob = createResource({
    url: 'frappe.client.set_value',
    makeParams(values) {
        return {
            doctype: 'Job Opportunity',
            name: props.jobName,
            fieldname: {
                company_logo: job.company_logo,
                ...job,
            },
        };
    },
});
const jobDetail = createResource({
    url: 'frappe.client.get',
    makeParams(values) {
        return {
            doctype: 'Job Opportunity',
            name: props.jobName,
        };
    },
    onSuccess(data) {
        if (data.owner != user.data?.name && !user.data?.is_moderator) {
            router.push({
                name: 'Jobs',
            });
        }
        Object.keys(data).forEach((key) => {
            if (Object.hasOwn(job, key))
                job[key] = data[key];
        });
    },
});
const job = reactive({
    job_title: '',
    location: '',
    country: '',
    type: 'Full Time',
    work_mode: 'On-site',
    status: 'Open',
    company_name: '',
    company_website: '',
    company_logo: null,
    description: '',
    company_email_address: '',
});
onMounted(() => {
    if (!user.data) {
        router.push({
            name: 'Jobs',
        });
    }
    if (props.jobName != 'new')
        jobDetail.reload();
    addKeyboardShortcuts();
});
const addKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveJob();
        }
    });
};
const saveJob = () => {
    validateJobFields();
    if (jobDetail.data) {
        editJobDetails();
    }
    else {
        createNewJob();
    }
};
const createNewJob = () => {
    newJob.submit({}, {
        onSuccess(data) {
            router.push({
                name: 'JobDetail',
                params: {
                    job: data.name,
                },
            });
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const editJobDetails = () => {
    updateJob.submit({}, {
        onSuccess(data) {
            router.push({
                name: 'JobDetail',
                params: {
                    job: data.name,
                },
            });
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const validateJobFields = () => {
    job.description = sanitizeHTML(job.description);
    Object.keys(job).forEach((key) => {
        if (key != 'description' && typeof job[key] === 'string') {
            job[key] = escapeHTML(job[key]);
        }
    });
};
const jobTypes = computed(() => {
    return [
        { label: __('Full Time'), value: 'Full Time' },
        { label: __('Part Time'), value: 'Part Time' },
        { label: __('Contract'), value: 'Contract' },
        { label: __('Freelance'), value: 'Freelance' },
    ];
});
const workModes = computed(() => {
    return [
        { label: __('On site'), value: 'On-site' },
        { label: __('Hybrid'), value: 'Hybrid' },
        { label: __('Remote'), value: 'Remote' },
    ];
});
const jobStatuses = computed(() => {
    return [
        { label: __('Open'), value: 'Open' },
        { label: __('Closed'), value: 'Closed' },
    ];
});
const breadcrumbs = computed(() => {
    let crumbs = [
        {
            label: __('Jobs'),
            route: { name: 'Jobs' },
        },
        {
            label: props.jobName == 'new' ? __('New Job') : __('Edit Job'),
            route: { name: 'JobForm' },
        },
    ];
    return crumbs;
});
usePageMeta(() => {
    return {
        title: props.jobName == 'new' ? __('New Job') : jobDetail.data?.job_title,
        icon: brand.favicon,
    };
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
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
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
    { onClick: (...[$event]) => {
            __VLS_ctx.saveJob();
            // @ts-ignore
            [breadcrumbs, saveJob,];
        } });
const { default: __VLS_12 } = __VLS_8.slots;
(__VLS_ctx.__('Save'));
// @ts-ignore
[__,];
var __VLS_8;
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "py-5" },
});
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "container border-b mb-4 pb-5" },
});
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg font-semibold mb-4 text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Job Details'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-2 gap-5" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-4" },
});
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
let __VLS_13;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    modelValue: (__VLS_ctx.job.job_title),
    label: (__VLS_ctx.__('Title')),
    required: (true),
}));
const __VLS_15 = __VLS_14({
    modelValue: (__VLS_ctx.job.job_title),
    label: (__VLS_ctx.__('Title')),
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_18;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    modelValue: (__VLS_ctx.job.type),
    label: (__VLS_ctx.__('Type')),
    type: "select",
    options: (__VLS_ctx.jobTypes),
    required: (true),
}));
const __VLS_20 = __VLS_19({
    modelValue: (__VLS_ctx.job.type),
    label: (__VLS_ctx.__('Type')),
    type: "select",
    options: (__VLS_ctx.jobTypes),
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
let __VLS_23;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.job.work_mode),
    label: (__VLS_ctx.__('Work Mode')),
    type: "select",
    options: (__VLS_ctx.workModes),
    required: (true),
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.job.work_mode),
    label: (__VLS_ctx.__('Work Mode')),
    type: "select",
    options: (__VLS_ctx.workModes),
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-4" },
});
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
let __VLS_28;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.job.location),
    label: (__VLS_ctx.__('City')),
    required: (true),
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.job.location),
    label: (__VLS_ctx.__('City')),
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_33;
/** @ts-ignore @type { | typeof __VLS_components.Link} */
Link;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    modelValue: (__VLS_ctx.job.country),
    doctype: "Country",
    label: (__VLS_ctx.__('Country')),
    required: (true),
}));
const __VLS_35 = __VLS_34({
    modelValue: (__VLS_ctx.job.country),
    doctype: "Country",
    label: (__VLS_ctx.__('Country')),
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
if (__VLS_ctx.jobName != 'new') {
    let __VLS_38;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        modelValue: (__VLS_ctx.job.status),
        label: (__VLS_ctx.__('Status')),
        type: "select",
        options: (__VLS_ctx.jobStatuses),
        required: (true),
    }));
    const __VLS_40 = __VLS_39({
        modelValue: (__VLS_ctx.job.status),
        label: (__VLS_ctx.__('Status')),
        type: "select",
        options: (__VLS_ctx.jobStatuses),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "container border-b mb-4 pb-5" },
});
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg font-semibold mb-4 text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Company Details'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-2 gap-5" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
let __VLS_43;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    modelValue: (__VLS_ctx.job.company_name),
    label: (__VLS_ctx.__('Company Name')),
    ...{ class: "mb-4" },
    required: (true),
}));
const __VLS_45 = __VLS_44({
    modelValue: (__VLS_ctx.job.company_name),
    label: (__VLS_ctx.__('Company Name')),
    ...{ class: "mb-4" },
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
let __VLS_48;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.job.company_website),
    label: (__VLS_ctx.__('Company Website')),
    required: (true),
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.job.company_website),
    label: (__VLS_ctx.__('Company Website')),
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
let __VLS_53;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    modelValue: (__VLS_ctx.job.company_email_address),
    label: (__VLS_ctx.__('Company Email Address')),
    ...{ class: "mb-4" },
    required: (true),
}));
const __VLS_55 = __VLS_54({
    modelValue: (__VLS_ctx.job.company_email_address),
    label: (__VLS_ctx.__('Company Email Address')),
    ...{ class: "mb-4" },
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
const __VLS_58 = Uploader;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
    modelValue: (__VLS_ctx.job.company_logo),
    label: (__VLS_ctx.__('Company Logo')),
    required: (true),
}));
const __VLS_60 = __VLS_59({
    modelValue: (__VLS_ctx.job.company_logo),
    label: (__VLS_ctx.__('Company Logo')),
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "container mt-4" },
});
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-ink-gray-5 text-xs mb-1" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
(__VLS_ctx.__('Description'));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-ink-red-3" },
});
/** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
let __VLS_63;
/** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
TextEditor;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
    ...{ 'onChange': {} },
    content: (__VLS_ctx.job.description),
    editable: (true),
    fixedMenu: (true),
    editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] mb-4",
}));
const __VLS_65 = __VLS_64({
    ...{ 'onChange': {} },
    content: (__VLS_ctx.job.description),
    editable: (true),
    fixedMenu: (true),
    editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] mb-4",
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
let __VLS_68;
const __VLS_69 = ({ change: {} },
    { onChange: ((val) => (__VLS_ctx.job.description = val)) });
var __VLS_66;
var __VLS_67;
// @ts-ignore
[__, __, __, __, __, __, __, __, __, __, __, __, __, job, job, job, job, job, job, job, job, job, job, job, job, jobTypes, workModes, jobName, jobStatuses,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        jobName: {
            type: String,
            default: 'new',
        },
    },
});
export default {};
