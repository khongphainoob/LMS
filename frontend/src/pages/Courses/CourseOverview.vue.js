/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Star, Users } from 'lucide-vue-next';
import { Badge, Tooltip } from 'frappe-ui';
import CourseCardOverlay from '@/components/CourseCardOverlay.vue';
import CourseOutline from '@/components/CourseOutline.vue';
import CourseReviews from '@/components/CourseReviews.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import CourseInstructors from '@/components/CourseInstructors.vue';
import RelatedCourses from '@/components/RelatedCourses.vue';
const props = defineProps();
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
    ...{ class: "p-5" },
});
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between w-full space-x-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "md:w-2/3" },
});
/** @type {__VLS_StyleScopedClasses['md:w-2/3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-3xl font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.course.data.title);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-3 leading-6 text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['my-3']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
(__VLS_ctx.course.data.short_introduction);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
if (parseInt(__VLS_ctx.course.data.rating) > 0) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        text: (__VLS_ctx.__('Average Rating')),
        ...{ class: "flex items-center" },
    }));
    const __VLS_2 = __VLS_1({
        text: (__VLS_ctx.__('Average Rating')),
        ...{ class: "flex items-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.Star} */
    Star;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        ...{ class: "size-4 text-transparent fill-yellow-500" },
    }));
    const __VLS_8 = __VLS_7({
        ...{ class: "size-4 text-transparent fill-yellow-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['fill-yellow-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ml-1 text-ink-gray-7" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    (__VLS_ctx.course.data.rating);
    // @ts-ignore
    [course, course, course, course, __,];
    var __VLS_3;
}
if (parseInt(__VLS_ctx.course.data.rating) > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mx-3" },
    });
    /** @type {__VLS_StyleScopedClasses['mx-3']} */ ;
}
if (__VLS_ctx.course.data.enrollment_count) {
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        text: (__VLS_ctx.__('Enrolled Students')),
        ...{ class: "flex items-center" },
    }));
    const __VLS_13 = __VLS_12({
        text: (__VLS_ctx.__('Enrolled Students')),
        ...{ class: "flex items-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    const { default: __VLS_16 } = __VLS_14.slots;
    let __VLS_17;
    /** @ts-ignore @type { | typeof __VLS_components.Users} */
    Users;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        ...{ class: "h-4 w-4 text-ink-gray-7" },
    }));
    const __VLS_19 = __VLS_18({
        ...{ class: "h-4 w-4 text-ink-gray-7" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ml-1" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
    (__VLS_ctx.course.data.enrollment_count_formatted);
    // @ts-ignore
    [course, course, course, __,];
    var __VLS_14;
}
if (__VLS_ctx.course.data.enrollment_count) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mx-3" },
    });
    /** @type {__VLS_StyleScopedClasses['mx-3']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "h-6 mr-1" },
    ...{ class: ({
            'avatar-group overlap': __VLS_ctx.course.data.instructors.length > 1,
        }) },
});
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['overlap']} */ ;
for (const [instructor] of __VLS_vFor((__VLS_ctx.course.data.instructors))) {
    const __VLS_22 = UserAvatar;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        user: (instructor),
    }));
    const __VLS_24 = __VLS_23({
        user: (instructor),
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    // @ts-ignore
    [course, course, course,];
}
const __VLS_27 = CourseInstructors;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
    instructors: (__VLS_ctx.course.data.instructors),
}));
const __VLS_29 = __VLS_28({
    instructors: (__VLS_ctx.course.data.instructors),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
if (__VLS_ctx.course.data.tags) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex my-4 w-fit" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    for (const [tag] of __VLS_vFor((__VLS_ctx.course.data.tags.split(', ')))) {
        let __VLS_32;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            theme: "gray",
            size: "lg",
            ...{ class: "mr-2 text-ink-gray-9" },
        }));
        const __VLS_34 = __VLS_33({
            theme: "gray",
            size: "lg",
            ...{ class: "mr-2 text-ink-gray-9" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        const { default: __VLS_37 } = __VLS_35.slots;
        (tag);
        // @ts-ignore
        [course, course, course,];
        var __VLS_35;
        // @ts-ignore
        [];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "md:hidden my-4" },
});
/** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['my-4']} */ ;
const __VLS_38 = CourseCardOverlay;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    course: (__VLS_ctx.course),
}));
const __VLS_40 = __VLS_39({
    course: (__VLS_ctx.course),
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal mt-10" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.course.data.description) }, null, null);
/** @type {__VLS_StyleScopedClasses['ProseMirror']} */ ;
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-table:table-fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-td:p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-td:border']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:border']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-td:border-outline-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:border-outline-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-td:relative']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:relative']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
/** @type {__VLS_StyleScopedClasses['!whitespace-normal']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-10" },
});
/** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
const __VLS_43 = CourseOutline;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    title: (__VLS_ctx.__('Course Outline')),
    courseName: (__VLS_ctx.course.data.name),
    showOutline: (true),
    getProgress: (__VLS_ctx.course.data.membership ? true : false),
}));
const __VLS_45 = __VLS_44({
    title: (__VLS_ctx.__('Course Outline')),
    courseName: (__VLS_ctx.course.data.name),
    showOutline: (true),
    getProgress: (__VLS_ctx.course.data.membership ? true : false),
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
const __VLS_48 = CourseReviews;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    courseName: (__VLS_ctx.course.data.name),
    avg_rating: (__VLS_ctx.course.data.rating),
    membership: (__VLS_ctx.course.data.membership),
}));
const __VLS_50 = __VLS_49({
    courseName: (__VLS_ctx.course.data.name),
    avg_rating: (__VLS_ctx.course.data.rating),
    membership: (__VLS_ctx.course.data.membership),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hidden md:block" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['md:block']} */ ;
const __VLS_53 = CourseCardOverlay;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    course: (__VLS_ctx.course),
}));
const __VLS_55 = __VLS_54({
    course: (__VLS_ctx.course),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
const __VLS_58 = RelatedCourses;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
    courseName: (__VLS_ctx.course.data.name),
}));
const __VLS_60 = __VLS_59({
    courseName: (__VLS_ctx.course.data.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
// @ts-ignore
[course, course, course, course, course, course, course, course, course, __,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
