/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, FormControl, createResource, toast } from 'frappe-ui';
import Link from '@/components/Controls/Link.vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
const show = defineModel();
const assessmentType = ref(null);
const assessment = ref(null);
const assessments = defineModel('assessments');
const router = useRouter();
const props = defineProps({
    batch: {
        type: String,
        default: null,
    },
});
const assessmentResource = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'LMS Assessment',
                parent: props.batch,
                parenttype: 'LMS Batch',
                parentfield: 'assessment',
                assessment_type: assessmentType.value,
                assessment_name: assessment.value,
            },
        };
    },
});
const addAssessment = (close) => {
    assessmentResource.submit({}, {
        onSuccess(data) {
            assessments.value.reload();
            toast.success(__('Assessment added successfully'));
            close();
        },
    });
};
const assessmentTypes = computed(() => {
    return [
        { label: __('Quiz'), value: 'LMS Quiz' },
        { label: __('Assignment'), value: 'LMS Assignment' },
        { label: __('Programming Exercise'), value: 'LMS Programming Exercise' },
    ];
});
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
        title: __VLS_ctx.__('Add an assessment'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.addAssessment(close),
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Add an assessment'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.addAssessment(close),
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        type: "select",
        options: (__VLS_ctx.assessmentTypes),
        modelValue: (__VLS_ctx.assessmentType),
        label: (__VLS_ctx.__('Type')),
    }));
    const __VLS_10 = __VLS_9({
        type: "select",
        options: (__VLS_ctx.assessmentTypes),
        modelValue: (__VLS_ctx.assessmentType),
        label: (__VLS_ctx.__('Type')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_13 = Link;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        modelValue: (__VLS_ctx.assessment),
        doctype: (__VLS_ctx.assessmentType),
        label: (__VLS_ctx.__('Assessment')),
        onCreate: ((value, close) => {
            close();
            if (__VLS_ctx.assessmentType === 'LMS Quiz') {
                __VLS_ctx.router.push({
                    name: 'QuizForm',
                    params: {
                        quizID: 'new',
                    },
                });
            }
            else if (__VLS_ctx.assessmentType === 'LMS Assignment') {
                __VLS_ctx.router.push({
                    name: 'Assignments',
                });
            }
        }),
    }));
    const __VLS_15 = __VLS_14({
        modelValue: (__VLS_ctx.assessment),
        doctype: (__VLS_ctx.assessmentType),
        label: (__VLS_ctx.__('Assessment')),
        onCreate: ((value, close) => {
            close();
            if (__VLS_ctx.assessmentType === 'LMS Quiz') {
                __VLS_ctx.router.push({
                    name: 'QuizForm',
                    params: {
                        quizID: 'new',
                    },
                });
            }
            else if (__VLS_ctx.assessmentType === 'LMS Assignment') {
                __VLS_ctx.router.push({
                    name: 'Assignments',
                });
            }
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    // @ts-ignore
    [show, __, __, __, __, addAssessment, assessmentTypes, assessmentType, assessmentType, assessmentType, assessmentType, assessment, router, router,];
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
