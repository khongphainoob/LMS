/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Award, BookOpen, GraduationCap, Star, Users } from 'lucide-vue-next';
import { sessionStore } from '@/stores/session';
import { Tooltip } from 'frappe-ui';
import { formatAmount } from '@/utils';
import CourseInstructors from '@/components/CourseInstructors.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import colors from '@/utils/frappe-ui-colors.json';
const { user } = sessionStore();
const props = defineProps({
    course: {
        type: Object,
        default: null,
    },
});
const getGradientColor = () => {
    let theme = localStorage.getItem('theme') == 'dark' ? 'darkMode' : 'lightMode';
    let color = props.course.card_gradient?.toLowerCase() || 'blue';
    let colorMap = colors[theme][color];
    return `linear-gradient(to top right, black, ${colorMap[400]})`;
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
if (__VLS_ctx.course.title) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col h-full rounded-xl overflow-hidden text-ink-gray-9 bg-surface-white border border-outline-gray-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-[100%] h-[168px] bg-cover bg-center bg-no-repeat rounded-t-xl border-b border-outline-gray-2" },
        ...{ style: (__VLS_ctx.course.image
                ? { backgroundImage: `url('${encodeURI(__VLS_ctx.course.image)}')` }
                : {
                    backgroundImage: __VLS_ctx.getGradientColor(),
                    backgroundBlendMode: 'screen',
                }) },
    });
    /** @type {__VLS_StyleScopedClasses['w-[100%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[168px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-cover']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-no-repeat']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-t-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    if (!__VLS_ctx.course.image) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-center text-white flex-1 font-extrabold my-auto px-5 text-center leading-6 h-full" },
            ...{ class: (__VLS_ctx.course.title.length > 32
                    ? 'text-lg'
                    : __VLS_ctx.course.title.length > 20
                        ? 'text-xl'
                        : 'text-2xl') },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
        /** @type {__VLS_StyleScopedClasses['my-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        (__VLS_ctx.course.title);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col flex-auto p-5 rounded-b-xl bg-surface-white" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-b-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    if (__VLS_ctx.course.lessons) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            text: (__VLS_ctx.__('Lessons')),
        }));
        const __VLS_2 = __VLS_1({
            text: (__VLS_ctx.__('Lessons')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const { default: __VLS_5 } = __VLS_3.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        let __VLS_6;
        /** @ts-ignore @type { | typeof __VLS_components.BookOpen} */
        BookOpen;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }));
        const __VLS_8 = __VLS_7({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
        (__VLS_ctx.course.lessons);
        // @ts-ignore
        [course, course, course, course, course, course, course, course, course, getGradientColor, __,];
        var __VLS_3;
    }
    if (__VLS_ctx.course.enrollments) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            text: (__VLS_ctx.__('Enrolled Students')),
        }));
        const __VLS_13 = __VLS_12({
            text: (__VLS_ctx.__('Enrolled Students')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        const { default: __VLS_16 } = __VLS_14.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        let __VLS_17;
        /** @ts-ignore @type { | typeof __VLS_components.Users} */
        Users;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }));
        const __VLS_19 = __VLS_18({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
        (__VLS_ctx.formatAmount(__VLS_ctx.course.enrollments));
        // @ts-ignore
        [course, course, __, formatAmount,];
        var __VLS_14;
    }
    if (__VLS_ctx.course.rating) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        let __VLS_22;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
            text: (__VLS_ctx.__('Average Rating')),
        }));
        const __VLS_24 = __VLS_23({
            text: (__VLS_ctx.__('Average Rating')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        const { default: __VLS_27 } = __VLS_25.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.Star} */
        Star;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }));
        const __VLS_30 = __VLS_29({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
        (__VLS_ctx.course.rating);
        // @ts-ignore
        [course, course, __,];
        var __VLS_25;
    }
    if (__VLS_ctx.course.featured) {
        let __VLS_33;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
            text: (__VLS_ctx.__('Featured')),
        }));
        const __VLS_35 = __VLS_34({
            text: (__VLS_ctx.__('Featured')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        const { default: __VLS_38 } = __VLS_36.slots;
        let __VLS_39;
        /** @ts-ignore @type { | typeof __VLS_components.Award} */
        Award;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
            ...{ class: "size-4 stroke-2 text-ink-amber-3" },
        }));
        const __VLS_41 = __VLS_40({
            ...{ class: "size-4 stroke-2 text-ink-amber-3" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-amber-3']} */ ;
        // @ts-ignore
        [course, __,];
        var __VLS_36;
    }
    if (__VLS_ctx.course.image) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-semibold leading-6" },
            ...{ class: (__VLS_ctx.course.title.length > 32 ? 'text-lg' : 'text-xl') },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        (__VLS_ctx.course.title);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "short-introduction text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['short-introduction']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.course.short_introduction);
    if (__VLS_ctx.user && __VLS_ctx.course.membership) {
        const __VLS_44 = ProgressBar;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            progress: (__VLS_ctx.course.membership.progress),
        }));
        const __VLS_46 = __VLS_45({
            progress: (__VLS_ctx.course.membership.progress),
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    }
    if (__VLS_ctx.user && __VLS_ctx.course.membership) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm mt-2 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        (Math.ceil(__VLS_ctx.course.membership.progress));
        (__VLS_ctx.__('completed'));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mt-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex avatar-group overlap" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['overlap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-6 mr-1" },
        ...{ class: ({ 'avatar-group overlap': __VLS_ctx.course.instructors.length > 1 }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['overlap']} */ ;
    for (const [instructor] of __VLS_vFor((__VLS_ctx.course.instructors))) {
        const __VLS_49 = UserAvatar;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            user: (instructor),
        }));
        const __VLS_51 = __VLS_50({
            user: (instructor),
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        // @ts-ignore
        [course, course, course, course, course, course, course, course, course, course, __, user, user,];
    }
    const __VLS_54 = CourseInstructors;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
        instructors: (__VLS_ctx.course.instructors),
    }));
    const __VLS_56 = __VLS_55({
        instructors: (__VLS_ctx.course.instructors),
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    if (__VLS_ctx.course.paid_course) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (__VLS_ctx.course.price);
    }
    if (__VLS_ctx.course.paid_certificate || __VLS_ctx.course.enable_certification) {
        let __VLS_59;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
            text: (__VLS_ctx.__('Get Certified')),
        }));
        const __VLS_61 = __VLS_60({
            text: (__VLS_ctx.__('Get Certified')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_60));
        const { default: __VLS_64 } = __VLS_62.slots;
        let __VLS_65;
        /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
        GraduationCap;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
            ...{ class: "size-5 stroke-1.5 text-ink-gray-7" },
        }));
        const __VLS_67 = __VLS_66({
            ...{ class: "size-5 stroke-1.5 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        // @ts-ignore
        [course, course, course, course, course, __,];
        var __VLS_62;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        course: {
            type: Object,
            default: null,
        },
    },
});
export default {};
