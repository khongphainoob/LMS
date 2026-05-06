/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { call, createResource, dayjs, Dialog, FormControl, toast, } from 'frappe-ui';
import { ref, watch, inject } from 'vue';
import { Calendar } from 'lucide-vue-next';
import { formatTime } from '@/utils/';
const user = inject('$user');
const show = defineModel();
const evaluations = defineModel('reloadEvals');
const props = defineProps({
    courses: {
        type: Array,
        default: [],
    },
    batch: {
        type: String,
        default: null,
    },
    endDate: {
        type: String,
        default: null,
    },
});
const evaluation = ref({
    course: '',
    date: '',
    start_time: '',
    end_time: '',
    day: '',
    batch: props.batch,
    member: user.data.name,
});
function submitEvaluation(close) {
    if (!evaluation.value.date || !evaluation.value.start_time) {
        toast.warning(__('Please select a slot for your evaluation.'), {
            duration: 10,
        });
        return;
    }
    call('frappe.client.insert', {
        doc: {
            doctype: 'LMS Certificate Request',
            batch_name: evaluation.value.batch,
            ...evaluation.value,
        },
    })
        .then(() => {
        evaluations.value.reload();
        close();
    })
        .catch((err) => {
        console.log(err.messages?.[0] || err);
        toast.warning(__(err.messages?.[0] || err), { duration: 20 });
    });
}
const getCourses = () => {
    const courses = [];
    for (const course of props.courses) {
        if (course.evaluator) {
            courses.push({
                label: course.title,
                value: course.course,
            });
        }
    }
    if (courses.length === 1) {
        evaluation.value.course = courses[0].value;
    }
    return courses;
};
const slots = createResource({
    url: 'lms.lms.doctype.course_evaluator.course_evaluator.get_schedule',
    makeParams(values) {
        return {
            course: values.course,
            batch: props.batch,
        };
    },
});
watch(() => evaluation.value.course, (course) => {
    slots.reload(evaluation.value);
});
const saveSlot = (slot, row) => {
    evaluation.value.start_time = slot.start_time;
    evaluation.value.end_time = slot.end_time;
    evaluation.value.date = row.date;
    evaluation.value.day = row.day;
};
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
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Schedule your evaluation'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.submitEvaluation(close),
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Schedule your evaluation'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.submitEvaluation(close),
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-4 text-base max-h-[60vh]" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[60vh]']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.evaluation.course),
        type: "select",
        label: (__VLS_ctx.__('Course')),
        options: (__VLS_ctx.getCourses()),
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.evaluation.course),
        type: "select",
        label: (__VLS_ctx.__('Course')),
        options: (__VLS_ctx.getCourses()),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    if (__VLS_ctx.slots.data?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4 overflow-y-auto mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-9 font-medium" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.__('Available Slots'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-5" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
        for (const [row] of __VLS_vFor((__VLS_ctx.slots.data))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center text-ink-gray-7 space-x-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            let __VLS_13;
            /** @ts-ignore @type { | typeof __VLS_components.Calendar} */
            Calendar;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                ...{ class: "size-3" },
            }));
            const __VLS_15 = __VLS_14({
                ...{ class: "size-3" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-ink-gray-9" },
            });
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            (__VLS_ctx.dayjs(row.date).format('DD MMMM YYYY'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-ink-gray-5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            (row.day);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-3 gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            for (const [slot] of __VLS_vFor((row.slots))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.slots.data?.length))
                                return;
                            __VLS_ctx.saveSlot(slot, row);
                            // @ts-ignore
                            [show, __, __, __, __, submitEvaluation, evaluation, getCourses, slots, slots, dayjs, saveSlot,];
                        } },
                    ...{ class: "text-base text-center border rounded-md text-ink-gray-8 p-2 cursor-pointer text-ink-gray-7 hover:bg-surface-gray-2 hover:border-outline-gray-3" },
                    ...{ class: ({
                            'border-outline-gray-4 text-ink-gray-9': __VLS_ctx.evaluation.date == row.date &&
                                __VLS_ctx.evaluation.start_time == slot.start_time,
                        }) },
                });
                /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-outline-gray-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-outline-gray-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                (__VLS_ctx.formatTime(slot.start_time));
                (__VLS_ctx.formatTime(slot.end_time));
                // @ts-ignore
                [evaluation, evaluation, formatTime, formatTime,];
            }
            // @ts-ignore
            [];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-red-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
        (__VLS_ctx.__('No slots available for the selected course.'));
    }
    // @ts-ignore
    [__,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        ...{},
        ...{
            courses: {
                type: Array,
                default: [],
            },
            batch: {
                type: String,
                default: null,
            },
            endDate: {
                type: String,
                default: null,
            },
        },
    },
});
export default {};
