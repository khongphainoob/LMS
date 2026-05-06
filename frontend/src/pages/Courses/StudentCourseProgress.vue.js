/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Badge, createListResource, createResource, Dialog, Tooltip, } from 'frappe-ui';
import ProgressBar from '@/components/ProgressBar.vue';
import { computed } from 'vue';
import { Check, Minus } from 'lucide-vue-next';
const show = defineModel({ required: true, default: false });
const props = defineProps();
const lessonProgress = createListResource({
    doctype: 'LMS Course Progress',
    filters: {
        course: ['=', props.course.data?.name],
        member: ['=', props.student?.member],
    },
    fields: ['name', 'lesson', 'status'],
    auto: true,
});
const assessmentProgress = createResource({
    url: 'lms.lms.api.get_course_assessment_progress',
    params: {
        course: props.course.data?.name,
        member: props.student?.member,
    },
    auto: true,
});
const getLessonStatus = (lesson) => {
    return (lessonProgress.data?.find((lp) => lp.lesson === lesson.lesson)
        ?.status || __('Pending'));
};
const getLessonStatusTheme = (lesson) => {
    const status = getLessonStatus(lesson);
    if (status === 'Complete') {
        return 'green';
    }
    else {
        return 'orange';
    }
};
const getAssessmentStatusTheme = (status) => {
    if (status.includes('Pass'))
        return 'green';
    else if (status.includes('Fail'))
        return 'red';
    else
        return 'orange';
};
const hasAssessmentData = computed(() => {
    return ((assessmentProgress.data?.quizzes &&
        assessmentProgress.data.quizzes.length > 0) ||
        (assessmentProgress.data?.assignments &&
            assessmentProgress.data.assignments.length > 0) ||
        (assessmentProgress.data?.exercises &&
            assessmentProgress.data.exercises.length > 0));
});
const __VLS_defaultModels = {
    'modelValue': false,
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
        title: __VLS_ctx.__('Student Progress'),
        size: __VLS_ctx.hasAssessmentData ? '3xl' : 'xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Student Progress'),
        size: __VLS_ctx.hasAssessmentData ? '3xl' : 'xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base text-ink-gray-9 max-h-[70vh] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[70vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between mb-5 px-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
    Avatar;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        image: (__VLS_ctx.student?.member_image),
        label: (__VLS_ctx.student?.member_name),
        size: "xl",
    }));
    const __VLS_10 = __VLS_9({
        image: (__VLS_ctx.student?.member_image),
        label: (__VLS_ctx.student?.member_name),
        size: "xl",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.student?.member_name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.student.member);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-25 space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['w-25']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-5 text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (Math.round(__VLS_ctx.student.progress));
    (__VLS_ctx.__('completed'));
    const __VLS_13 = ProgressBar;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        label: (__VLS_ctx.__('Course Progress')),
        progress: (__VLS_ctx.student.progress),
    }));
    const __VLS_15 = __VLS_14({
        label: (__VLS_ctx.__('Course Progress')),
        progress: (__VLS_ctx.student.progress),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-5" },
        ...{ class: (__VLS_ctx.hasAssessmentData ? 'grid-cols-2' : '') },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    if (__VLS_ctx.lessons.data) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-outline-gray-modals rounded-lg px-3 pt-3 max-h-[60vh] overflow-y-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-modals']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-[60vh]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5 mb-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
        (__VLS_ctx.__('Lesson Progress'));
        for (const [progress] of __VLS_vFor((__VLS_ctx.lessons.data))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between text-sm py-2 my-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "" },
            });
            /** @type {__VLS_StyleScopedClasses['']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "mr-3 text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (progress.chapter_idx);
            (progress.idx);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (progress.title);
            if (__VLS_ctx.getLessonStatus(progress) == 'Complete') {
                let __VLS_18;
                /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
                Tooltip;
                // @ts-ignore
                const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                    text: (__VLS_ctx.__('Complete')),
                }));
                const __VLS_20 = __VLS_19({
                    text: (__VLS_ctx.__('Complete')),
                }, ...__VLS_functionalComponentArgsRest(__VLS_19));
                const { default: __VLS_23 } = __VLS_21.slots;
                let __VLS_24;
                /** @ts-ignore @type { | typeof __VLS_components.Check} */
                Check;
                // @ts-ignore
                const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
                    ...{ class: "text-ink-green-3 size-4" },
                }));
                const __VLS_26 = __VLS_25({
                    ...{ class: "text-ink-green-3 size-4" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_25));
                /** @type {__VLS_StyleScopedClasses['text-ink-green-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                // @ts-ignore
                [show, __, __, __, __, __, hasAssessmentData, hasAssessmentData, student, student, student, student, student, student, lessons, lessons, getLessonStatus,];
                var __VLS_21;
            }
            else {
                let __VLS_29;
                /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
                Tooltip;
                // @ts-ignore
                const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                    text: (__VLS_ctx.__('Pending')),
                }));
                const __VLS_31 = __VLS_30({
                    text: (__VLS_ctx.__('Pending')),
                }, ...__VLS_functionalComponentArgsRest(__VLS_30));
                const { default: __VLS_34 } = __VLS_32.slots;
                let __VLS_35;
                /** @ts-ignore @type { | typeof __VLS_components.Minus} */
                Minus;
                // @ts-ignore
                const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
                    ...{ class: "text-ink-amber-2 size-4" },
                }));
                const __VLS_37 = __VLS_36({
                    ...{ class: "text-ink-amber-2 size-4" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_36));
                /** @type {__VLS_StyleScopedClasses['text-ink-amber-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                // @ts-ignore
                [__,];
                var __VLS_32;
            }
            // @ts-ignore
            [];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    if (__VLS_ctx.assessmentProgress.data?.quizzes?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-outline-gray-modals rounded-lg px-3 pt-3 h-fit" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-modals']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-fit']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5 mb-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
        (__VLS_ctx.__('Quiz Progress'));
        for (const [quiz] of __VLS_vFor((__VLS_ctx.assessmentProgress.data.quizzes))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between text-sm py-2 my-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            (quiz.quiz_title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            (quiz.score);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            (quiz.percentage);
            // @ts-ignore
            [__, assessmentProgress, assessmentProgress,];
        }
    }
    if (__VLS_ctx.assessmentProgress.data?.assignments?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-outline-gray-modals rounded-lg px-3 pt-3 h-fit" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-modals']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-fit']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5 mb-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
        (__VLS_ctx.__('Assignment Progress'));
        for (const [assignment] of __VLS_vFor((__VLS_ctx.assessmentProgress.data.assignments))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between text-sm py-2 my-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            (assignment.assignment_title);
            let __VLS_40;
            /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
            Badge;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                theme: (__VLS_ctx.getAssessmentStatusTheme(assignment.status)),
            }));
            const __VLS_42 = __VLS_41({
                theme: (__VLS_ctx.getAssessmentStatusTheme(assignment.status)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            const { default: __VLS_45 } = __VLS_43.slots;
            (assignment.status);
            // @ts-ignore
            [__, assessmentProgress, assessmentProgress, getAssessmentStatusTheme,];
            var __VLS_43;
            // @ts-ignore
            [];
        }
    }
    if (__VLS_ctx.assessmentProgress.data?.exercises?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-outline-gray-modals rounded-lg px-3 pt-3 h-fit" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-modals']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-fit']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5 mb-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
        (__VLS_ctx.__('Programming Exercise Progress'));
        for (const [exercise] of __VLS_vFor((__VLS_ctx.assessmentProgress.data.exercises))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between text-sm py-2 my-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            (exercise.exercise_title);
            let __VLS_46;
            /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
            Badge;
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                theme: (__VLS_ctx.getAssessmentStatusTheme(exercise.status)),
            }));
            const __VLS_48 = __VLS_47({
                theme: (__VLS_ctx.getAssessmentStatusTheme(exercise.status)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            const { default: __VLS_51 } = __VLS_49.slots;
            (exercise.status);
            // @ts-ignore
            [__, assessmentProgress, assessmentProgress, getAssessmentStatusTheme,];
            var __VLS_49;
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
