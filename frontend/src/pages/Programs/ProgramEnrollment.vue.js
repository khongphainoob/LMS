/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, call, createResource, Dialog, toast, Tooltip } from 'frappe-ui';
import { inject, watch } from 'vue';
import { BookOpen, User } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
const show = defineModel();
const user = inject('$user');
const router = useRouter();
const props = defineProps();
const program = createResource({
    url: 'lms.lms.utils.get_program_details',
    makeParams(values) {
        return {
            program_name: props.programName,
        };
    },
    auto: false,
});
watch(() => props.programName, () => {
    if (props.programName) {
        program.reload();
    }
});
const enrollInProgram = (close) => {
    call('lms.lms.utils.enroll_in_program', {
        program: props.programName,
    })
        .then(() => {
        toast.success(__('Successfully enrolled in program'));
        router.push({
            name: 'ProgramDetail',
            params: { programName: props.programName },
        });
        close();
    })
        .catch((error) => {
        toast.error(__('Failed to enroll in program: {0}').format(error.message));
        console.error('Enrollment Error:', error);
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
        size: '2xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '2xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-title': __VLS_7 } = __VLS_3.slots;
    if (__VLS_ctx.program.data) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xl font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.__('Enrollment for Program {0}').format(__VLS_ctx.program.data?.name));
    }
    // @ts-ignore
    [show, program, program, __,];
}
{
    const { 'body-content': __VLS_8 } = __VLS_3.slots;
    if (__VLS_ctx.program.data) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-base text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-surface-blue-2 text-ink-blue-3 p-2 rounded-md leading-5" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-surface-blue-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-blue-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('This program consists of {0} courses').format(__VLS_ctx.program.data.courses.length));
        if (__VLS_ctx.program.data.enforce_course_order) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__(' designed as a structured learning path to guide your progress. Courses in this program must be taken in order, and each course will unlock as you complete the previous one. '));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__(' designed as a learning path to guide your progress. You may take the courses in any order that suits you. '));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Are you sure you want to enroll?'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-5" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm font-semibold text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (__VLS_ctx.__('Courses in this Program'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-2" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        for (const [course] of __VLS_vFor((__VLS_ctx.program.data.courses))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-col border border-outline-gray-2 p-2 rounded-md h-full" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-semibold text-ink-gray-9 leading-5 mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            (course.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-5 text-sm text-ink-gray-5 mb-8" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
            let __VLS_9;
            /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
            Tooltip;
            // @ts-ignore
            const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
                text: (__VLS_ctx.__('Lessons')),
            }));
            const __VLS_11 = __VLS_10({
                text: (__VLS_ctx.__('Lessons')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_10));
            const { default: __VLS_14 } = __VLS_12.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex items-center space-x-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
            let __VLS_15;
            /** @ts-ignore @type { | typeof __VLS_components.BookOpen} */
            BookOpen;
            // @ts-ignore
            const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
                ...{ class: "size-3 stroke-1.5" },
            }));
            const __VLS_17 = __VLS_16({
                ...{ class: "size-3 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_16));
            /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (course.lessons);
            (__VLS_ctx.__('lessons'));
            // @ts-ignore
            [program, program, program, program, __, __, __, __, __, __, __,];
            var __VLS_12;
            let __VLS_20;
            /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
            Tooltip;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                text: (__VLS_ctx.__('Enrolled Students')),
            }));
            const __VLS_22 = __VLS_21({
                text: (__VLS_ctx.__('Enrolled Students')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            const { default: __VLS_25 } = __VLS_23.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex items-center space-x-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
            let __VLS_26;
            /** @ts-ignore @type { | typeof __VLS_components.User} */
            User;
            // @ts-ignore
            const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
                ...{ class: "size-3 stroke-1.5" },
            }));
            const __VLS_28 = __VLS_27({
                ...{ class: "size-3 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_27));
            /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (course.enrollments);
            (__VLS_ctx.__('students'));
            // @ts-ignore
            [__, __,];
            var __VLS_23;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-1 mt-auto" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
            let __VLS_31;
            /** @ts-ignore @type { | typeof __VLS_components.UserAvatar} */
            UserAvatar;
            // @ts-ignore
            const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
                user: (course.instructors[0]),
            }));
            const __VLS_33 = __VLS_32({
                user: (course.instructors[0]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_32));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-ink-gray-9" },
            });
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            (course.instructors[0].full_name);
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
}
{
    const { actions: __VLS_36 } = __VLS_3.slots;
    const [{ close }] = __VLS_vSlot(__VLS_36);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end space-x-2 group" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_39 = __VLS_38({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    let __VLS_42;
    const __VLS_43 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.enrollInProgram(close);
                // @ts-ignore
                [enrollInProgram,];
            } });
    const { default: __VLS_44 } = __VLS_40.slots;
    (__VLS_ctx.__('Confirm Enrollment'));
    // @ts-ignore
    [__,];
    var __VLS_40;
    var __VLS_41;
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
