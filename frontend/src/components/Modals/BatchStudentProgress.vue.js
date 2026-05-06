/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Badge, Dialog } from 'frappe-ui';
import StudentHeatmap from '@/components/StudentHeatmap.vue';
const show = defineModel();
const props = defineProps({
    student: {
        type: Object,
        default: null,
    },
});
const isAssignment = (value) => {
    return isNaN(value);
};
const getStatusTheme = (status) => {
    if (status === 'Pass') {
        return 'green';
    }
    else if (status == 'Not Graded') {
        return 'orange';
    }
    else {
        return 'red';
    }
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
        size: 'xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: 'xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { body: __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-5 space-y-10 text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
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
        image: (__VLS_ctx.student.user_image),
        size: "3xl",
    }));
    const __VLS_10 = __VLS_9({
        image: (__VLS_ctx.student.user_image),
        size: "3xl",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xl font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.student.full_name);
    if (Object.keys(__VLS_ctx.student.assessments).length ||
        Object.keys(__VLS_ctx.student.courses).length) {
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            theme: (__VLS_ctx.student.progress === 100 ? 'green' : 'red'),
        }));
        const __VLS_15 = __VLS_14({
            theme: (__VLS_ctx.student.progress === 100 ? 'green' : 'red'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        const { default: __VLS_18 } = __VLS_16.slots;
        (__VLS_ctx.student.progress);
        (__VLS_ctx.__('Complete'));
        // @ts-ignore
        [show, student, student, student, student, student, student, __,];
        var __VLS_16;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-7" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    (__VLS_ctx.student.email);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-8" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
    if (Object.keys(__VLS_ctx.student.assessments).length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center border-b pb-1 font-medium text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        (__VLS_ctx.__('Assessment'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Percentage/Status'));
        for (const [assessment] of __VLS_vFor((Object.keys(__VLS_ctx.student.assessments)))) {
            let __VLS_19;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                ...{ class: "flex items-center text-ink-gray-7 font-medium" },
                to: ({
                    name: __VLS_ctx.student.assessments[assessment].type == 'LMS Assignment'
                        ? 'AssignmentSubmission'
                        : '',
                    params: __VLS_ctx.student.assessments[assessment].type == 'LMS Assignment'
                        ? {
                            assignmentID: __VLS_ctx.student.assessments[assessment].assessment,
                            submissionName: __VLS_ctx.student.assessments[assessment].submission,
                        }
                        : {},
                }),
            }));
            const __VLS_21 = __VLS_20({
                ...{ class: "flex items-center text-ink-gray-7 font-medium" },
                to: ({
                    name: __VLS_ctx.student.assessments[assessment].type == 'LMS Assignment'
                        ? 'AssignmentSubmission'
                        : '',
                    params: __VLS_ctx.student.assessments[assessment].type == 'LMS Assignment'
                        ? {
                            assignmentID: __VLS_ctx.student.assessments[assessment].assessment,
                            submissionName: __VLS_ctx.student.assessments[assessment].submission,
                        }
                        : {},
                }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_20));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            const { default: __VLS_24 } = __VLS_22.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            (assessment);
            if (__VLS_ctx.isAssignment(__VLS_ctx.student.assessments[assessment].status)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                let __VLS_25;
                /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                Badge;
                // @ts-ignore
                const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
                    theme: (__VLS_ctx.getStatusTheme(__VLS_ctx.student.assessments[assessment].status)),
                }));
                const __VLS_27 = __VLS_26({
                    theme: (__VLS_ctx.getStatusTheme(__VLS_ctx.student.assessments[assessment].status)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_26));
                const { default: __VLS_30 } = __VLS_28.slots;
                (__VLS_ctx.student.assessments[assessment].status);
                // @ts-ignore
                [student, student, student, student, student, student, student, student, student, student, __, __, isAssignment, getStatusTheme,];
                var __VLS_28;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.student.assessments[assessment].status);
            }
            // @ts-ignore
            [student,];
            var __VLS_22;
            // @ts-ignore
            [];
        }
    }
    if (Object.keys(__VLS_ctx.student.courses).length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center border-b pb-1 font-medium text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        (__VLS_ctx.__('Courses'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Progress'));
        for (const [course] of __VLS_vFor((Object.keys(__VLS_ctx.student.courses)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center text-ink-gray-7 font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            (course);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (Math.floor(__VLS_ctx.student.courses[course]));
            // @ts-ignore
            [student, student, student, __, __,];
        }
    }
    const __VLS_31 = StudentHeatmap;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        member: (__VLS_ctx.student.email),
        days: (120),
    }));
    const __VLS_33 = __VLS_32({
        member: (__VLS_ctx.student.email),
        days: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    // @ts-ignore
    [student,];
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
            student: {
                type: Object,
                default: null,
            },
        },
    },
});
export default {};
