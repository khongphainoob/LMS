/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, inject, onMounted } from 'vue';
import { Badge, Breadcrumbs, call, createResource, Tooltip, usePageMeta, } from 'frappe-ui';
import { sessionStore } from '@/stores/session';
import { LockKeyhole, Info } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import CourseCard from '@/components/CourseCard.vue';
const { brand } = sessionStore();
const router = useRouter();
const user = inject('$user');
const props = defineProps();
onMounted(() => {
    checkIfEnrolled();
});
const checkIfEnrolled = () => {
    call('frappe.client.get_value', {
        doctype: 'LMS Program Member',
        filters: {
            member: user.data.name,
            parent: props.programName,
        },
        parent: 'LMS Program',
        fieldname: 'name',
    }).then((data) => {
        if (data.name) {
            program.reload();
        }
        else {
            router.push({ name: 'Programs' });
        }
    });
};
const program = createResource({
    url: 'lms.lms.utils.get_program_details',
    params: {
        program_name: props.programName,
    },
});
const openCourse = (course, enforceCourseOrder) => {
    if (!course.eligible && enforceCourseOrder)
        return;
    router.push({
        name: 'CourseDetail',
        params: { courseName: course.name },
    });
};
const breadcrumbs = computed(() => {
    return [
        { label: __('Programs'), route: { name: 'Programs' } },
        {
            label: props.programName,
            route: {
                name: 'ProgramDetail',
                params: { programName: props.programName },
            },
        },
    ];
});
usePageMeta(() => {
    return {
        title: props.programName,
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
if (__VLS_ctx.program.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pt-5 px-5 pb-10 mx-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.program.data.name);
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
    Badge;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        theme: (__VLS_ctx.program.data.progress < 100 ? 'orange' : 'green'),
    }));
    const __VLS_7 = __VLS_6({
        theme: (__VLS_ctx.program.data.progress < 100 ? 'orange' : 'green'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const { default: __VLS_10 } = __VLS_8.slots;
    (__VLS_ctx.program.data.progress);
    (__VLS_ctx.__('completed'));
    // @ts-ignore
    [breadcrumbs, program, program, program, program, __,];
    var __VLS_8;
    if (__VLS_ctx.program.data.enforce_course_order) {
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            placement: "right",
            text: (__VLS_ctx.__('Courses must be completed in order. You can only start the next course after completing the previous one.')),
        }));
        const __VLS_13 = __VLS_12({
            placement: "right",
            text: (__VLS_ctx.__('Courses must be completed in order. You can only start the next course after completing the previous one.')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        const { default: __VLS_16 } = __VLS_14.slots;
        let __VLS_17;
        /** @ts-ignore @type { | typeof __VLS_components.Info} */
        Info;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
            ...{ class: "size-3 cursor-pointer" },
        }));
        const __VLS_19 = __VLS_18({
            ...{ class: "size-3 cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        // @ts-ignore
        [program, __,];
        var __VLS_14;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    for (const [course] of __VLS_vFor((__VLS_ctx.program.data.courses))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (course.name),
            ...{ class: "relative group" },
            ...{ class: ((course.eligible && __VLS_ctx.program.data.enforce_course_order) ||
                    !__VLS_ctx.program.data.enforce_course_order
                    ? 'cursor-pointer'
                    : 'cursor-default') },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        const __VLS_22 = CourseCard;
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
            ...{ 'onClick': {} },
            course: (course),
        }));
        const __VLS_24 = __VLS_23({
            ...{ 'onClick': {} },
            course: (course),
        }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        let __VLS_27;
        const __VLS_28 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.program.data))
                        return;
                    __VLS_ctx.openCourse(course, __VLS_ctx.program.data.enforce_course_order);
                    // @ts-ignore
                    [program, program, program, program, openCourse,];
                } });
        var __VLS_25;
        var __VLS_26;
        if (!course.eligible && __VLS_ctx.program.data.enforce_course_order) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute inset-0 flex flex-col items-center justify-center space-y-2 text-ink-white rounded-md invisible group-hover:visible" },
                ...{ style: ({
                        background: 'radial-gradient(circle, darkgray 0%, lightgray 100%)',
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:visible']} */ ;
            let __VLS_29;
            /** @ts-ignore @type { | typeof __VLS_components.LockKeyhole} */
            LockKeyhole;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                ...{ class: "size-5" },
            }));
            const __VLS_31 = __VLS_30({
                ...{ class: "size-5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
            /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-medium text-center leading-5 px-10" },
            });
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-10']} */ ;
            (__VLS_ctx.__('Please complete the previous course to unlock this one.'));
        }
        // @ts-ignore
        [program, __,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
