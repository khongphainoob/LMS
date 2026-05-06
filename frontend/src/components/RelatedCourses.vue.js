/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource } from 'frappe-ui';
import { watch } from 'vue';
import CourseCard from '@/components/CourseCard.vue';
const props = defineProps({
    courseName: {
        type: String,
        required: true,
    },
});
const relatedCourses = createResource({
    url: 'lms.lms.utils.get_related_courses',
    cache: ['related_courses', props.courseName],
    makeParams() {
        return {
            course: props.courseName,
        };
    },
    auto: true,
});
watch(() => props.courseName, () => {
    relatedCourses.reload();
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
if (__VLS_ctx.relatedCourses.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-10" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-6" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-2xl font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Related Courses'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['2xl:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    for (const [course] of __VLS_vFor((__VLS_ctx.relatedCourses.data))) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            key: (course.name),
            to: ({ name: 'CourseDetail', params: { courseName: course.name } }),
            ...{ class: "cursor-pointer" },
        }));
        const __VLS_2 = __VLS_1({
            key: (course.name),
            to: ({ name: 'CourseDetail', params: { courseName: course.name } }),
            ...{ class: "cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        const { default: __VLS_5 } = __VLS_3.slots;
        const __VLS_6 = CourseCard;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            course: (course),
        }));
        const __VLS_8 = __VLS_7({
            course: (course),
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        // @ts-ignore
        [relatedCourses, relatedCourses, __,];
        var __VLS_3;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        courseName: {
            type: String,
            required: true,
        },
    },
});
export default {};
