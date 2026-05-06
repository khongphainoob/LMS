/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, getCurrentInstance, inject, onMounted, onBeforeUnmount, reactive, ref, } from 'vue';
import { Breadcrumbs, FormControl, Button, TextEditor, createResource, usePageMeta, toast, call, } from 'frappe-ui';
import { escapeHTML, getMetaInfo, openSettings, sanitizeHTML, updateMetaInfo, } from '@/utils';
import { useRouter } from 'vue-router';
import { Trash2 } from 'lucide-vue-next';
import { useOnboarding, useTelemetry } from 'frappe-ui/frappe';
import { sessionStore } from '../stores/session';
import Uploader from '@/components/Controls/Uploader.vue';
import MultiSelect from '@/components/Controls/MultiSelect.vue';
import Link from '@/components/Controls/Link.vue';
const router = useRouter();
const user = inject('$user');
const { brand } = sessionStore();
const { updateOnboardingStep } = useOnboarding('learning');
const instructors = ref([]);
const app = getCurrentInstance();
const { capture } = useTelemetry();
const { $dialog } = app.appContext.config.globalProperties;
const props = defineProps({
    batchName: {
        type: String,
        required: true,
    },
});
const batch = reactive({
    title: '',
    published: false,
    description: '',
    batch_details: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    timezone: '',
    evaluation_end_date: '',
    confirmation_email_template: '',
    seat_count: '',
    medium: '',
    category: '',
    allow_self_enrollment: false,
    certification: false,
    meta_image: null,
    paid_batch: false,
    currency: '',
    amount: 0,
    zoom_account: '',
    video_link: '',
});
const meta = reactive({
    description: '',
    keywords: '',
});
onMounted(() => {
    if (!user.data)
        window.location.href = '/login';
    if (props.batchName != 'new') {
        fetchBatchInfo();
    }
    else {
        capture('batch_form_opened');
    }
    window.addEventListener('keydown', keyboardShortcut);
});
const fetchBatchInfo = () => {
    batchDetail.reload();
    getMetaInfo('batches', props.batchName, meta);
};
const keyboardShortcut = (e) => {
    if (e.key === 's' &&
        (e.ctrlKey || e.metaKey) &&
        !e.target.classList.contains('ProseMirror')) {
        saveBatch();
        e.preventDefault();
    }
};
onBeforeUnmount(() => {
    window.removeEventListener('keydown', keyboardShortcut);
});
const newBatch = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'LMS Batch',
                meta_image: batch.image,
                video_link: batch.video_link,
                instructors: instructors.value.map((instructor) => ({
                    instructor: instructor,
                })),
                ...batch,
            },
        };
    },
});
const batchDetail = createResource({
    url: 'frappe.client.get',
    makeParams(values) {
        return {
            doctype: 'LMS Batch',
            name: props.batchName,
        };
    },
    onSuccess(data) {
        updateBatchData(data);
    },
});
const updateBatchData = (data) => {
    Object.keys(data).forEach((key) => {
        if (key == 'instructors') {
            data.instructors.forEach((instructor) => {
                instructors.value.push(instructor.instructor);
            });
        }
        else if (['start_time', 'end_time'].includes(key)) {
            batch[key] = formatTime(data[key]);
        }
        else if (Object.hasOwn(batch, key))
            batch[key] = data[key];
    });
    let checkboxes = [
        'published',
        'paid_batch',
        'allow_self_enrollment',
        'certification',
    ];
    for (let idx in checkboxes) {
        let key = checkboxes[idx];
        batch[key] = batch[key] ? true : false;
    }
};
const formatTime = (timeStr) => {
    let [hours, minutes, seconds] = timeStr.split(':');
    hours = hours.length == 1 ? '0' + hours : hours;
    return `${hours}:${minutes}`;
};
const editBatch = createResource({
    url: 'frappe.client.set_value',
    makeParams(values) {
        return {
            doctype: 'LMS Batch',
            name: props.batchName,
            fieldname: {
                meta_image: batch.meta_image,
                video_link: batch.video_link,
                instructors: instructors.value.map((instructor) => ({
                    instructor: instructor,
                })),
                ...batch,
            },
        };
    },
});
const validateFields = () => {
    batch.description = sanitizeHTML(batch.description);
    batch.batch_details = sanitizeHTML(batch.batch_details);
    Object.keys(batch).forEach((key) => {
        if (!['description', 'batch_details'].includes(key) &&
            typeof batch[key] === 'string') {
            batch[key] = escapeHTML(batch[key]);
        }
    });
};
const saveBatch = () => {
    validateFields();
    if (batchDetail.data) {
        editBatchDetails();
    }
    else {
        createNewBatch();
    }
};
const createNewBatch = () => {
    newBatch.submit({}, {
        onSuccess(data) {
            if (user.data?.is_system_manager) {
                updateOnboardingStep('create_first_batch', true, false, () => {
                    localStorage.setItem('firstBatch', data.name);
                });
            }
            updateMetaInfo('batches', data.name, meta);
            capture('batch_created');
            router.push({
                name: 'BatchDetail',
                params: {
                    batchName: data.name,
                },
            });
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const editBatchDetails = () => {
    editBatch.submit({}, {
        onSuccess(data) {
            updateMetaInfo('batches', data.name, meta);
            router.push({
                name: 'BatchDetail',
                params: {
                    batchName: data.name,
                },
            });
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const deleteBatch = () => {
    $dialog({
        title: __('Confirm your action to delete'),
        message: __('Deleting this batch will also delete all its data including enrolled students, linked courses, assessments, feedback and discussions. Are you sure you want to continue?'),
        actions: [
            {
                label: __('Delete'),
                theme: 'red',
                variant: 'solid',
                onClick({ close }) {
                    trashBatch(close);
                    close();
                },
            },
        ],
    });
};
const trashBatch = (close) => {
    call('lms.lms.api.delete_batch', {
        batch: props.batchName,
    }).then(() => {
        toast.success(__('Batch deleted successfully'));
        close();
        router.push({
            name: 'Batches',
        });
    });
};
const breadcrumbs = computed(() => {
    let crumbs = [
        {
            label: __('Batches'),
            route: {
                name: 'Batches',
            },
        },
    ];
    if (batchDetail.data) {
        crumbs.push({
            label: batchDetail.data.title,
            route: {
                name: 'BatchDetail',
                params: {
                    batchName: props.batchName,
                },
            },
        });
    }
    crumbs.push({
        label: props.batchName == 'new' ? 'New Batch' : 'Edit Batch',
        route: { name: 'BatchForm', params: { batchName: props.batchName } },
    });
    return crumbs;
});
usePageMeta(() => {
    return {
        title: props.batchName == 'new' ? 'New Batch' : batchDetail.data?.title,
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
    ...{ class: "h-7" },
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-7" },
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
if (__VLS_ctx.batchDetail.data?.name) {
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
        { onClick: (__VLS_ctx.deleteBatch) });
    const { default: __VLS_12 } = __VLS_8.slots;
    {
        const { icon: __VLS_13 } = __VLS_8.slots;
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
        Trash2;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ class: "size-4 stroke-1.5" },
        }));
        const __VLS_16 = __VLS_15({
            ...{ class: "size-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [breadcrumbs, batchDetail, deleteBatch,];
    }
    // @ts-ignore
    [];
    var __VLS_8;
    var __VLS_9;
}
let __VLS_19;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    ...{ 'onClick': {} },
    variant: "solid",
}));
const __VLS_21 = __VLS_20({
    ...{ 'onClick': {} },
    variant: "solid",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_24;
const __VLS_25 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.saveBatch();
            // @ts-ignore
            [saveBatch,];
        } });
const { default: __VLS_26 } = __VLS_22.slots;
(__VLS_ctx.__('Save'));
// @ts-ignore
[__,];
var __VLS_22;
var __VLS_23;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "py-5" },
});
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-5 md:px-20 pb-5 space-y-5 border-b mb-5" },
});
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['md:px-20']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg text-ink-gray-9 font-semibold mb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
(__VLS_ctx.__('Details'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
let __VLS_27;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
    modelValue: (__VLS_ctx.batch.title),
    label: (__VLS_ctx.__('Title')),
    required: (true),
    ...{ class: "w-full" },
}));
const __VLS_29 = __VLS_28({
    modelValue: (__VLS_ctx.batch.title),
    label: (__VLS_ctx.__('Title')),
    required: (true),
    ...{ class: "w-full" },
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
const __VLS_32 = MultiSelect;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.instructors),
    doctype: "Course Evaluator",
    label: (__VLS_ctx.__('Instructors')),
    required: (true),
    onCreate: ((close) => __VLS_ctx.openSettings('Evaluators', close)),
    filters: ({ ignore_user_type: 1 }),
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.instructors),
    doctype: "Course Evaluator",
    label: (__VLS_ctx.__('Instructors')),
    required: (true),
    onCreate: ((close) => __VLS_ctx.openSettings('Evaluators', close)),
    filters: ({ ignore_user_type: 1 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_37;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    modelValue: (__VLS_ctx.batch.description),
    label: (__VLS_ctx.__('Short Description')),
    type: "textarea",
    rows: (8),
    placeholder: (__VLS_ctx.__('Short description of the batch')),
    required: (true),
}));
const __VLS_39 = __VLS_38({
    modelValue: (__VLS_ctx.batch.description),
    label: (__VLS_ctx.__('Short Description')),
    type: "textarea",
    rows: (8),
    placeholder: (__VLS_ctx.__('Short description of the batch')),
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-5 md:px-20 pb-5 space-y-5 border-b mb-5" },
});
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['md:px-20']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg text-ink-gray-9 font-semibold mb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
(__VLS_ctx.__('Settings'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-5" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
let __VLS_42;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    modelValue: (__VLS_ctx.batch.published),
    type: "checkbox",
    label: (__VLS_ctx.__('Published')),
}));
const __VLS_44 = __VLS_43({
    modelValue: (__VLS_ctx.batch.published),
    type: "checkbox",
    label: (__VLS_ctx.__('Published')),
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
let __VLS_47;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    modelValue: (__VLS_ctx.batch.allow_self_enrollment),
    type: "checkbox",
    label: (__VLS_ctx.__('Allow self enrollment')),
}));
const __VLS_49 = __VLS_48({
    modelValue: (__VLS_ctx.batch.allow_self_enrollment),
    type: "checkbox",
    label: (__VLS_ctx.__('Allow self enrollment')),
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
let __VLS_52;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.batch.certification),
    type: "checkbox",
    label: (__VLS_ctx.__('Certification')),
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.batch.certification),
    type: "checkbox",
    label: (__VLS_ctx.__('Certification')),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-5 md:px-20 pb-5 space-y-5 border-b mb-5" },
});
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['md:px-20']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg text-ink-gray-9 font-semibold mb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
(__VLS_ctx.__('Date and Time'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-10" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
let __VLS_57;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    modelValue: (__VLS_ctx.batch.start_date),
    label: (__VLS_ctx.__('Batch Start Date')),
    type: "date",
    ...{ class: "mb-4" },
    required: (true),
}));
const __VLS_59 = __VLS_58({
    modelValue: (__VLS_ctx.batch.start_date),
    label: (__VLS_ctx.__('Batch Start Date')),
    type: "date",
    ...{ class: "mb-4" },
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
let __VLS_62;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    modelValue: (__VLS_ctx.batch.end_date),
    label: (__VLS_ctx.__('Batch End Date')),
    type: "date",
    ...{ class: "mb-4" },
    required: (true),
}));
const __VLS_64 = __VLS_63({
    modelValue: (__VLS_ctx.batch.end_date),
    label: (__VLS_ctx.__('Batch End Date')),
    type: "date",
    ...{ class: "mb-4" },
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
let __VLS_67;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    modelValue: (__VLS_ctx.batch.start_time),
    label: (__VLS_ctx.__('Session Start Time')),
    type: "time",
    ...{ class: "mb-4" },
    required: (true),
}));
const __VLS_69 = __VLS_68({
    modelValue: (__VLS_ctx.batch.start_time),
    label: (__VLS_ctx.__('Session Start Time')),
    type: "time",
    ...{ class: "mb-4" },
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
let __VLS_72;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
    modelValue: (__VLS_ctx.batch.end_time),
    label: (__VLS_ctx.__('Session End Time')),
    type: "time",
    ...{ class: "mb-4" },
    required: (true),
}));
const __VLS_74 = __VLS_73({
    modelValue: (__VLS_ctx.batch.end_time),
    label: (__VLS_ctx.__('Session End Time')),
    type: "time",
    ...{ class: "mb-4" },
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
let __VLS_77;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
    modelValue: (__VLS_ctx.batch.timezone),
    label: (__VLS_ctx.__('Timezone')),
    type: "text",
    placeholder: (__VLS_ctx.__('Example: IST (+5:30)')),
    ...{ class: "mb-4" },
    required: (true),
}));
const __VLS_79 = __VLS_78({
    modelValue: (__VLS_ctx.batch.timezone),
    label: (__VLS_ctx.__('Timezone')),
    type: "text",
    placeholder: (__VLS_ctx.__('Example: IST (+5:30)')),
    ...{ class: "mb-4" },
    required: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
let __VLS_82;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
    modelValue: (__VLS_ctx.batch.evaluation_end_date),
    label: (__VLS_ctx.__('Evaluation End Date')),
    type: "date",
    ...{ class: "mb-4" },
}));
const __VLS_84 = __VLS_83({
    modelValue: (__VLS_ctx.batch.evaluation_end_date),
    label: (__VLS_ctx.__('Evaluation End Date')),
    type: "date",
    ...{ class: "mb-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-5 md:px-20 pb-5 space-y-5 border-b mb-5" },
});
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['md:px-20']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-sm text-ink-gray-5 mb-1" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
(__VLS_ctx.__('Batch Details'));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-ink-red-3" },
});
/** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
let __VLS_87;
/** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
TextEditor;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
    ...{ 'onChange': {} },
    content: (__VLS_ctx.batch.batch_details),
    editable: (true),
    fixedMenu: (true),
    editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] max-h-[20rem] overflow-y-scroll mb-4",
}));
const __VLS_89 = __VLS_88({
    ...{ 'onChange': {} },
    content: (__VLS_ctx.batch.batch_details),
    editable: (true),
    fixedMenu: (true),
    editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] max-h-[20rem] overflow-y-scroll mb-4",
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
let __VLS_92;
const __VLS_93 = ({ change: {} },
    { onChange: ((val) => (__VLS_ctx.batch.batch_details = val)) });
var __VLS_90;
var __VLS_91;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-5 md:px-20 pb-5 space-y-5 border-b mb-5" },
});
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['md:px-20']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg text-ink-gray-9 font-semibold mb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
(__VLS_ctx.__('Configurations'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-10" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
let __VLS_94;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    modelValue: (__VLS_ctx.batch.seat_count),
    label: (__VLS_ctx.__('Seat Count')),
    type: "number",
    ...{ class: "mb-4" },
    placeholder: (__VLS_ctx.__('Number of seats available')),
}));
const __VLS_96 = __VLS_95({
    modelValue: (__VLS_ctx.batch.seat_count),
    label: (__VLS_ctx.__('Seat Count')),
    type: "number",
    ...{ class: "mb-4" },
    placeholder: (__VLS_ctx.__('Number of seats available')),
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
const __VLS_99 = Link;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    doctype: "Email Template",
    label: (__VLS_ctx.__('Email Template')),
    modelValue: (__VLS_ctx.batch.confirmation_email_template),
    onCreate: ((value, close) => {
        __VLS_ctx.openSettings('Email Templates', close);
    }),
}));
const __VLS_101 = __VLS_100({
    doctype: "Email Template",
    label: (__VLS_ctx.__('Email Template')),
    modelValue: (__VLS_ctx.batch.confirmation_email_template),
    onCreate: ((value, close) => {
        __VLS_ctx.openSettings('Email Templates', close);
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
const __VLS_104 = Link;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
    doctype: "LMS Zoom Settings",
    label: (__VLS_ctx.__('Zoom Account')),
    modelValue: (__VLS_ctx.batch.zoom_account),
    onCreate: ((value, close) => {
        __VLS_ctx.openSettings('Zoom Accounts', close);
    }),
}));
const __VLS_106 = __VLS_105({
    doctype: "LMS Zoom Settings",
    label: (__VLS_ctx.__('Zoom Account')),
    modelValue: (__VLS_ctx.batch.zoom_account),
    onCreate: ((value, close) => {
        __VLS_ctx.openSettings('Zoom Accounts', close);
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
let __VLS_109;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
    modelValue: (__VLS_ctx.batch.medium),
    type: "select",
    options: ([
        {
            label: __VLS_ctx.__('Online'),
            value: 'Online',
        },
        {
            label: __VLS_ctx.__('Offline'),
            value: 'Offline',
        },
    ]),
    label: (__VLS_ctx.__('Medium')),
    ...{ class: "mb-4" },
}));
const __VLS_111 = __VLS_110({
    modelValue: (__VLS_ctx.batch.medium),
    type: "select",
    options: ([
        {
            label: __VLS_ctx.__('Online'),
            value: 'Online',
        },
        {
            label: __VLS_ctx.__('Offline'),
            value: 'Offline',
        },
    ]),
    label: (__VLS_ctx.__('Medium')),
    ...{ class: "mb-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
const __VLS_114 = Link;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
    doctype: "LMS Category",
    label: (__VLS_ctx.__('Category')),
    modelValue: (__VLS_ctx.batch.category),
    onCreate: ((value, close) => __VLS_ctx.openSettings('Categories', close)),
}));
const __VLS_116 = __VLS_115({
    doctype: "LMS Category",
    label: (__VLS_ctx.__('Category')),
    modelValue: (__VLS_ctx.batch.category),
    onCreate: ((value, close) => __VLS_ctx.openSettings('Categories', close)),
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
const __VLS_119 = Uploader;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
    modelValue: (__VLS_ctx.batch.video_link),
    label: (__VLS_ctx.__('Preview Video')),
    type: "video",
    required: (false),
}));
const __VLS_121 = __VLS_120({
    modelValue: (__VLS_ctx.batch.video_link),
    label: (__VLS_ctx.__('Preview Video')),
    type: "video",
    required: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-5 md:px-20 pb-5 space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['md:px-20']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg text-ink-gray-9 font-semibold" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
(__VLS_ctx.__('Pricing'));
let __VLS_124;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
    modelValue: (__VLS_ctx.batch.paid_batch),
    type: "checkbox",
    label: (__VLS_ctx.__('Paid Batch')),
}));
const __VLS_126 = __VLS_125({
    modelValue: (__VLS_ctx.batch.paid_batch),
    type: "checkbox",
    label: (__VLS_ctx.__('Paid Batch')),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
if (__VLS_ctx.batch.paid_batch) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    let __VLS_129;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
        modelValue: (__VLS_ctx.batch.amount),
        label: (__VLS_ctx.__('Amount')),
        type: "number",
    }));
    const __VLS_131 = __VLS_130({
        modelValue: (__VLS_ctx.batch.amount),
        label: (__VLS_ctx.__('Amount')),
        type: "number",
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    const __VLS_134 = Link;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
        doctype: "Currency",
        modelValue: (__VLS_ctx.batch.currency),
        filters: ({ enabled: 1 }),
        label: (__VLS_ctx.__('Currency')),
    }));
    const __VLS_136 = __VLS_135({
        doctype: "Currency",
        modelValue: (__VLS_ctx.batch.currency),
        filters: ({ enabled: 1 }),
        label: (__VLS_ctx.__('Currency')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-5 md:px-20 pb-5 space-y-5 border-b" },
});
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['md:px-20']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg text-ink-gray-9 font-semibold" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
(__VLS_ctx.__('Meta Tags'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
const __VLS_139 = Uploader;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
    modelValue: (__VLS_ctx.batch.meta_image),
    label: (__VLS_ctx.__('Meta Image')),
    type: "image",
    required: (false),
}));
const __VLS_141 = __VLS_140({
    modelValue: (__VLS_ctx.batch.meta_image),
    label: (__VLS_ctx.__('Meta Image')),
    type: "image",
    required: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
let __VLS_144;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
    modelValue: (__VLS_ctx.meta.description),
    label: (__VLS_ctx.__('Meta Description')),
    type: "textarea",
    rows: (7),
}));
const __VLS_146 = __VLS_145({
    modelValue: (__VLS_ctx.meta.description),
    label: (__VLS_ctx.__('Meta Description')),
    type: "textarea",
    rows: (7),
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_149;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
    modelValue: (__VLS_ctx.meta.keywords),
    label: (__VLS_ctx.__('Meta Keywords')),
    type: "textarea",
    rows: (7),
    placeholder: (__VLS_ctx.__('Comma separated keywords for SEO')),
}));
const __VLS_151 = __VLS_150({
    modelValue: (__VLS_ctx.meta.keywords),
    label: (__VLS_ctx.__('Meta Keywords')),
    type: "textarea",
    rows: (7),
    placeholder: (__VLS_ctx.__('Comma separated keywords for SEO')),
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
// @ts-ignore
[__, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, instructors, openSettings, openSettings, openSettings, openSettings, meta, meta,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batchName: {
            type: String,
            required: true,
        },
    },
});
export default {};
