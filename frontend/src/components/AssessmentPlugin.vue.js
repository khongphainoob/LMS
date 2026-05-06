/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, FormControl } from 'frappe-ui';
import { nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Link } from 'frappe-ui/frappe';
import { getLmsRoute } from '@/utils/basePath';
const show = ref(false);
const quiz = ref(null);
const assignment = ref(null);
const filterAssignmentsByCourse = ref(false);
const route = useRoute();
const props = defineProps({
    type: {
        type: String,
        required: true,
    },
    onAddition: {
        type: Function,
        required: true,
    },
});
onMounted(async () => {
    await nextTick();
    show.value = true;
});
const addAssessment = () => {
    props.onAddition(props.type == 'quiz' ? quiz.value : assignment.value);
    show.value = false;
};
const redirectToForm = () => {
    if (props.type == 'quiz') {
        window.open(getLmsRoute('quizzes?new=true'), '_blank');
    }
    else {
        window.open(getLmsRoute('assignments?new=true'), '_blank');
    }
};
const __VLS_ctx = {
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
        title: __VLS_ctx.type == 'quiz'
            ? __VLS_ctx.__('Add a quiz to your lesson')
            : __VLS_ctx.__('Add an assignment to your lesson'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: () => {
                    __VLS_ctx.addAssessment();
                },
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.type == 'quiz'
            ? __VLS_ctx.__('Add a quiz to your lesson')
            : __VLS_ctx.__('Add an assignment to your lesson'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: () => {
                    __VLS_ctx.addAssessment();
                },
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (__VLS_ctx.type == 'quiz') {
        let __VLS_8;
        /** @ts-ignore @type { | typeof __VLS_components.Link} */
        Link;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            modelValue: (__VLS_ctx.quiz),
            doctype: "LMS Quiz",
            label: (__VLS_ctx.__('Select a quiz')),
            placeholder: " ",
            onCreate: ((value, close) => __VLS_ctx.redirectToForm()),
        }));
        const __VLS_10 = __VLS_9({
            modelValue: (__VLS_ctx.quiz),
            doctype: "LMS Quiz",
            label: (__VLS_ctx.__('Select a quiz')),
            placeholder: " ",
            onCreate: ((value, close) => __VLS_ctx.redirectToForm()),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        if (__VLS_ctx.filterAssignmentsByCourse) {
            let __VLS_13;
            /** @ts-ignore @type { | typeof __VLS_components.Link} */
            Link;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                modelValue: (__VLS_ctx.assignment),
                doctype: "LMS Assignment",
                filters: ({
                    course: __VLS_ctx.route.params.courseName,
                }),
                placeholder: " ",
                label: (__VLS_ctx.__('Select an Assignment')),
                onCreate: ((value, close) => __VLS_ctx.redirectToForm()),
            }));
            const __VLS_15 = __VLS_14({
                modelValue: (__VLS_ctx.assignment),
                doctype: "LMS Assignment",
                filters: ({
                    course: __VLS_ctx.route.params.courseName,
                }),
                placeholder: " ",
                label: (__VLS_ctx.__('Select an Assignment')),
                onCreate: ((value, close) => __VLS_ctx.redirectToForm()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        }
        else {
            let __VLS_18;
            /** @ts-ignore @type { | typeof __VLS_components.Link} */
            Link;
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                modelValue: (__VLS_ctx.assignment),
                doctype: "LMS Assignment",
                placeholder: " ",
                label: (__VLS_ctx.__('Select an Assignment')),
                onCreate: ((value, close) => __VLS_ctx.redirectToForm()),
            }));
            const __VLS_20 = __VLS_19({
                modelValue: (__VLS_ctx.assignment),
                doctype: "LMS Assignment",
                placeholder: " ",
                label: (__VLS_ctx.__('Select an Assignment')),
                onCreate: ((value, close) => __VLS_ctx.redirectToForm()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        }
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            type: "checkbox",
            label: (__VLS_ctx.__('Filter assignments by course')),
            modelValue: (__VLS_ctx.filterAssignmentsByCourse),
        }));
        const __VLS_25 = __VLS_24({
            type: "checkbox",
            label: (__VLS_ctx.__('Filter assignments by course')),
            modelValue: (__VLS_ctx.filterAssignmentsByCourse),
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    }
    // @ts-ignore
    [show, type, type, __, __, __, __, __, __, __, addAssessment, quiz, redirectToForm, redirectToForm, redirectToForm, filterAssignmentsByCourse, filterAssignmentsByCourse, assignment, assignment, route,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        type: {
            type: String,
            required: true,
        },
        onAddition: {
            type: Function,
            required: true,
        },
    },
});
export default {};
