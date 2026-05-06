/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource, Tooltip } from 'frappe-ui';
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import { Calendar, Clock, Info, Monitor, MoveRight, Video, } from 'lucide-vue-next';
import { formatTime } from '@/utils';
import CourseCard from '@/components/CourseCard.vue';
import BatchCard from '@/components/BatchCard.vue';
import StatCard from '@/components/StatCard.vue';
import Leaderboard from '@/pages/Home/Leaderboard.vue';
const user = inject('$user');
const dayjs = inject('$dayjs');
const router = useRouter();
const props = defineProps();
const createdCourses = createResource({
    url: 'lms.lms.api.get_created_courses',
    auto: true,
});
const createdBatches = createResource({
    url: 'lms.lms.api.get_created_batches',
    auto: true,
});
const adminPerformance = createResource({
    url: 'lms.lms.api.get_admin_performance_stats',
    auto: true,
});
const adminBatches = createdBatches;
const getClassEnd = (cls) => {
    const classStart = new Date(`${cls.date}T${cls.time}`);
    return new Date(classStart.getTime() + cls.duration * 60000);
};
const canAccessClass = (cls) => {
    if (cls.date < dayjs().format('YYYY-MM-DD'))
        return false;
    if (cls.date > dayjs().format('YYYY-MM-DD'))
        return false;
    if (hasClassEnded(cls))
        return false;
    return true;
};
const hasClassEnded = (cls) => {
    const classEnd = getClassEnd(cls);
    const now = new Date();
    return now > classEnd;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
const __VLS_0 = StatCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: (__VLS_ctx.__('Courses Created')),
    count: (__VLS_ctx.createdCourses.data?.length || 0),
    progress: (0),
    color: "blue",
}));
const __VLS_2 = __VLS_1({
    label: (__VLS_ctx.__('Courses Created')),
    count: (__VLS_ctx.createdCourses.data?.length || 0),
    progress: (0),
    color: "blue",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_5 = StatCard;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    label: (__VLS_ctx.__('Upcoming Batches')),
    count: (__VLS_ctx.createdBatches.data?.length || 0),
    progress: (0),
    color: "orange",
}));
const __VLS_7 = __VLS_6({
    label: (__VLS_ctx.__('Upcoming Batches')),
    count: (__VLS_ctx.createdBatches.data?.length || 0),
    progress: (0),
    color: "orange",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const __VLS_10 = StatCard;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    label: (__VLS_ctx.__('Evaluations')),
    count: (__VLS_ctx.evals?.data?.length || 0),
    progress: (0),
    color: "pink",
}));
const __VLS_12 = __VLS_11({
    label: (__VLS_ctx.__('Evaluations')),
    count: (__VLS_ctx.evals?.data?.length || 0),
    progress: (0),
    color: "pink",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
const __VLS_15 = StatCard;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    label: (__VLS_ctx.__('Total Students')),
    count: (__VLS_ctx.adminPerformance.data?.total_students || 0),
    progress: (0),
    color: "blue",
}));
const __VLS_17 = __VLS_16({
    label: (__VLS_ctx.__('Total Students')),
    count: (__VLS_ctx.adminPerformance.data?.total_students || 0),
    progress: (0),
    color: "blue",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const __VLS_20 = StatCard;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    label: (__VLS_ctx.__('Avg Completion')),
    count: (__VLS_ctx.adminPerformance.data?.avg_completion || 0),
    progress: (__VLS_ctx.adminPerformance.data?.avg_completion || 0),
    suffix: "%",
    color: "green",
}));
const __VLS_22 = __VLS_21({
    label: (__VLS_ctx.__('Avg Completion')),
    count: (__VLS_ctx.adminPerformance.data?.avg_completion || 0),
    progress: (__VLS_ctx.adminPerformance.data?.avg_completion || 0),
    suffix: "%",
    color: "green",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_25 = StatCard;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    label: (__VLS_ctx.__('Avg Quiz Score')),
    count: (__VLS_ctx.adminPerformance.data?.avg_quiz_score || 0),
    progress: (__VLS_ctx.adminPerformance.data?.avg_quiz_score || 0),
    suffix: "%",
    color: "orange",
}));
const __VLS_27 = __VLS_26({
    label: (__VLS_ctx.__('Avg Quiz Score')),
    count: (__VLS_ctx.adminPerformance.data?.avg_quiz_score || 0),
    progress: (__VLS_ctx.adminPerformance.data?.avg_quiz_score || 0),
    suffix: "%",
    color: "orange",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
if (__VLS_ctx.createdCourses.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-semibold text-lg text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('My Courses'));
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        to: ({
            name: 'Courses',
        }),
    }));
    const __VLS_32 = __VLS_31({
        to: ({
            name: 'Courses',
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    const { default: __VLS_35 } = __VLS_33.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex items-center space-x-1 text-ink-gray-5 text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('See all'));
    let __VLS_36;
    /** @ts-ignore @type { | typeof __VLS_components.MoveRight} */
    MoveRight;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        ...{ class: "size-3 stroke-1.5" },
    }));
    const __VLS_38 = __VLS_37({
        ...{ class: "size-3 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [__, __, __, __, __, __, __, __, createdCourses, createdCourses, createdBatches, evals, adminPerformance, adminPerformance, adminPerformance, adminPerformance, adminPerformance,];
    var __VLS_33;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    for (const [course] of __VLS_vFor((__VLS_ctx.createdCourses.data))) {
        let __VLS_41;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
            to: ({ name: 'CourseDetail', params: { courseName: course.name } }),
        }));
        const __VLS_43 = __VLS_42({
            to: ({ name: 'CourseDetail', params: { courseName: course.name } }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        const { default: __VLS_46 } = __VLS_44.slots;
        const __VLS_47 = CourseCard;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            course: (course),
        }));
        const __VLS_49 = __VLS_48({
            course: (course),
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        // @ts-ignore
        [createdCourses,];
        var __VLS_44;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.createdBatches.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-10" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-semibold text-lg text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Upcoming Batches'));
    let __VLS_52;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        to: ({
            name: 'Batches',
        }),
    }));
    const __VLS_54 = __VLS_53({
        to: ({
            name: 'Batches',
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const { default: __VLS_57 } = __VLS_55.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex items-center space-x-1 text-ink-gray-5 text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('See all'));
    let __VLS_58;
    /** @ts-ignore @type { | typeof __VLS_components.MoveRight} */
    MoveRight;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        ...{ class: "size-3 stroke-1.5" },
    }));
    const __VLS_60 = __VLS_59({
        ...{ class: "size-3 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [__, __, createdBatches,];
    var __VLS_55;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    for (const [batch] of __VLS_vFor((__VLS_ctx.createdBatches.data))) {
        let __VLS_63;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
            to: ({ name: 'BatchDetail', params: { batchName: batch.name } }),
        }));
        const __VLS_65 = __VLS_64({
            to: ({ name: 'BatchDetail', params: { batchName: batch.name } }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        const { default: __VLS_68 } = __VLS_66.slots;
        const __VLS_69 = BatchCard;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
            batch: (batch),
        }));
        const __VLS_71 = __VLS_70({
            batch: (batch),
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        // @ts-ignore
        [createdBatches,];
        var __VLS_66;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.liveClasses?.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-10" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-semibold text-lg text-ink-gray-9 mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    (__VLS_ctx.__('Upcoming Live Classes'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    for (const [cls] of __VLS_vFor((__VLS_ctx.liveClasses?.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border hover:border-outline-gray-3 rounded-md p-3" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-outline-gray-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-semibold text-ink-gray-9 text-lg leading-5 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (cls.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-7 text-sm leading-5 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        (cls.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-auto space-y-3 text-ink-gray-7 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        let __VLS_74;
        /** @ts-ignore @type { | typeof __VLS_components.Calendar} */
        Calendar;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }));
        const __VLS_76 = __VLS_75({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.dayjs(cls.date).format('DD MMMM YYYY'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        let __VLS_79;
        /** @ts-ignore @type { | typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }));
        const __VLS_81 = __VLS_80({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatTime(cls.time));
        (__VLS_ctx.dayjs(__VLS_ctx.getClassEnd(cls)).format('HH:mm A'));
        if (__VLS_ctx.canAccessClass(cls)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-2 text-ink-gray-9 mt-auto" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
            if (__VLS_ctx.user.data?.is_moderator || __VLS_ctx.user.data?.is_evaluator) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                    href: (cls.start_url),
                    target: "_blank",
                    ...{ class: "cursor-pointer inline-flex items-center justify-center gap-2 transition-colors focus:outline-none text-ink-gray-8 bg-surface-gray-2 hover:bg-surface-gray-3 active:bg-surface-gray-4 focus-visible:ring focus-visible:ring-outline-gray-3 h-7 text-base px-2 rounded" },
                    ...{ class: (cls.join_url ? 'w-full' : 'w-1/2') },
                });
                /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['active:bg-surface-gray-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring-outline-gray-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                let __VLS_84;
                /** @ts-ignore @type { | typeof __VLS_components.Monitor} */
                Monitor;
                // @ts-ignore
                const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }));
                const __VLS_86 = __VLS_85({
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_85));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                (__VLS_ctx.__('Start'));
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (cls.join_url),
                target: "_blank",
                ...{ class: "w-full cursor-pointer inline-flex items-center justify-center gap-2 transition-colors focus:outline-none text-ink-gray-8 bg-surface-gray-2 hover:bg-surface-gray-3 active:bg-surface-gray-4 focus-visible:ring focus-visible:ring-outline-gray-3 h-7 text-base px-2 rounded" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['active:bg-surface-gray-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-outline-gray-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            let __VLS_89;
            /** @ts-ignore @type { | typeof __VLS_components.Video} */
            Video;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_91 = __VLS_90({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_90));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            (__VLS_ctx.__('Join'));
        }
        else if (__VLS_ctx.hasClassEnded(cls)) {
            let __VLS_94;
            /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
            Tooltip;
            // @ts-ignore
            const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
                text: (__VLS_ctx.__('This class has ended')),
                placement: "right",
            }));
            const __VLS_96 = __VLS_95({
                text: (__VLS_ctx.__('This class has ended')),
                placement: "right",
            }, ...__VLS_functionalComponentArgsRest(__VLS_95));
            const { default: __VLS_99 } = __VLS_97.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-2 text-ink-amber-3 w-fit" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-amber-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
            let __VLS_100;
            /** @ts-ignore @type { | typeof __VLS_components.Info} */
            Info;
            // @ts-ignore
            const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }));
            const __VLS_102 = __VLS_101({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_101));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__('Ended'));
            // @ts-ignore
            [__, __, __, __, __, liveClasses, liveClasses, dayjs, dayjs, formatTime, getClassEnd, canAccessClass, user, user, hasClassEnded,];
            var __VLS_97;
        }
        // @ts-ignore
        [];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-10" },
});
/** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
const __VLS_105 = Leaderboard;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    mode: "admin",
    batches: (__VLS_ctx.adminBatches.data),
}));
const __VLS_107 = __VLS_106({
    mode: "admin",
    batches: (__VLS_ctx.adminBatches.data),
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
// @ts-ignore
[adminBatches,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
