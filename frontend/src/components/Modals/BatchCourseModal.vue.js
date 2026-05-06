/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, createResource, toast } from 'frappe-ui';
import { ref, inject } from 'vue';
import Link from '@/components/Controls/Link.vue';
import { useOnboarding } from 'frappe-ui/frappe';
import { openSettings } from '@/utils';
import { useRouter } from 'vue-router';
const show = defineModel();
const course = ref(null);
const evaluator = ref(null);
const user = inject('$user');
const courses = defineModel('courses');
const router = useRouter();
const { updateOnboardingStep } = useOnboarding('learning');
const props = defineProps({
    batch: {
        type: String,
        default: null,
    },
});
const createBatchCourse = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'Batch Course',
                parent: props.batch,
                parenttype: 'LMS Batch',
                parentfield: 'courses',
                course: course.value,
                evaluator: evaluator.value,
            },
        };
    },
});
const addCourse = (close) => {
    createBatchCourse.submit({}, {
        onSuccess() {
            if (user.data?.is_system_manager)
                updateOnboardingStep('add_batch_course');
            close();
            courses.value.reload();
            course.value = null;
            evaluator.value = null;
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
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
        title: __VLS_ctx.__('Add a course'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.addCourse(close),
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Add a course'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.addCourse(close),
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    const __VLS_8 = Link;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        doctype: "LMS Course",
        modelValue: (__VLS_ctx.course),
        label: (__VLS_ctx.__('Course')),
        required: (true),
        onCreate: ((value, close) => {
            close();
            __VLS_ctx.router.push({
                name: 'Courses',
                query: { newCourse: '1' },
            });
        }),
    }));
    const __VLS_10 = __VLS_9({
        doctype: "LMS Course",
        modelValue: (__VLS_ctx.course),
        label: (__VLS_ctx.__('Course')),
        required: (true),
        onCreate: ((value, close) => {
            close();
            __VLS_ctx.router.push({
                name: 'Courses',
                query: { newCourse: '1' },
            });
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_13 = Link;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        doctype: "Course Evaluator",
        modelValue: (__VLS_ctx.evaluator),
        label: (__VLS_ctx.__('Evaluator')),
        onCreate: ((value, close) => __VLS_ctx.openSettings('Evaluators', close)),
        ...{ class: "mt-4" },
    }));
    const __VLS_15 = __VLS_14({
        doctype: "Course Evaluator",
        modelValue: (__VLS_ctx.evaluator),
        label: (__VLS_ctx.__('Evaluator')),
        onCreate: ((value, close) => __VLS_ctx.openSettings('Evaluators', close)),
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    // @ts-ignore
    [show, __, __, __, __, addCourse, course, router, evaluator, openSettings,];
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
            batch: {
                type: String,
                default: null,
            },
        },
    },
});
export default {};
