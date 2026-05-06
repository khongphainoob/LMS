/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { inject } from 'vue';
import { createResource, Tooltip } from 'frappe-ui';
import { formatTime } from '@/utils';
import { Calendar, Clock, Info, Monitor, MoveRight, Video, } from 'lucide-vue-next';
import CourseCard from '@/components/CourseCard.vue';
import BatchCard from '@/components/BatchCard.vue';
import StatCard from '@/components/StatCard.vue';
import Leaderboard from '@/pages/Home/Leaderboard.vue';
const dayjs = inject('$dayjs');
const user = inject('$user');
const props = defineProps();
const homeStats = createResource({
    url: 'lms.lms.api.get_home_stats',
    auto: true,
});
const performanceStats = createResource({
    url: 'lms.lms.api.get_performance_stats',
    auto: true,
});
const hoursSpent = createResource({
    url: 'lms.lms.api.get_hours_spent',
    auto: true,
});
const myCourses = createResource({
    url: 'lms.lms.api.get_my_courses',
    auto: true,
});
const myBatches = createResource({
    url: 'lms.lms.api.get_my_batches',
    auto: true,
});
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
    label: (__VLS_ctx.__('Lessons')),
    count: (__VLS_ctx.homeStats.data?.total_lessons || 0),
    progress: (__VLS_ctx.homeStats.data?.lesson_progress || 0),
    color: "orange",
}));
const __VLS_2 = __VLS_1({
    label: (__VLS_ctx.__('Lessons')),
    count: (__VLS_ctx.homeStats.data?.total_lessons || 0),
    progress: (__VLS_ctx.homeStats.data?.lesson_progress || 0),
    color: "orange",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_5 = StatCard;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    label: (__VLS_ctx.__('Assignments')),
    count: (__VLS_ctx.homeStats.data?.total_assignments || 0),
    progress: (0),
    color: "pink",
}));
const __VLS_7 = __VLS_6({
    label: (__VLS_ctx.__('Assignments')),
    count: (__VLS_ctx.homeStats.data?.total_assignments || 0),
    progress: (0),
    color: "pink",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const __VLS_10 = StatCard;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    label: (__VLS_ctx.__('Quizzes')),
    count: (__VLS_ctx.homeStats.data?.total_quizzes || 0),
    progress: (0),
    color: "green",
}));
const __VLS_12 = __VLS_11({
    label: (__VLS_ctx.__('Quizzes')),
    count: (__VLS_ctx.homeStats.data?.total_quizzes || 0),
    progress: (0),
    color: "green",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
const __VLS_15 = StatCard;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    label: (__VLS_ctx.__('Avg Quiz Score')),
    count: (__VLS_ctx.performanceStats.data?.avg_quiz_score || 0),
    progress: (__VLS_ctx.performanceStats.data?.avg_quiz_score || 0),
    suffix: "%",
    color: "blue",
}));
const __VLS_17 = __VLS_16({
    label: (__VLS_ctx.__('Avg Quiz Score')),
    count: (__VLS_ctx.performanceStats.data?.avg_quiz_score || 0),
    progress: (__VLS_ctx.performanceStats.data?.avg_quiz_score || 0),
    suffix: "%",
    color: "blue",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const __VLS_20 = StatCard;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    label: (__VLS_ctx.__('Avg Assignment Score')),
    count: (__VLS_ctx.performanceStats.data?.avg_assignment_score || 0),
    progress: (__VLS_ctx.performanceStats.data?.avg_assignment_score || 0),
    suffix: "%",
    color: "amber",
}));
const __VLS_22 = __VLS_21({
    label: (__VLS_ctx.__('Avg Assignment Score')),
    count: (__VLS_ctx.performanceStats.data?.avg_assignment_score || 0),
    progress: (__VLS_ctx.performanceStats.data?.avg_assignment_score || 0),
    suffix: "%",
    color: "amber",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_25 = StatCard;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    label: (__VLS_ctx.__('Overall Completion')),
    count: (__VLS_ctx.performanceStats.data?.overall_completion || 0),
    progress: (__VLS_ctx.performanceStats.data?.overall_completion || 0),
    suffix: "%",
    color: "pink",
}));
const __VLS_27 = __VLS_26({
    label: (__VLS_ctx.__('Overall Completion')),
    count: (__VLS_ctx.performanceStats.data?.overall_completion || 0),
    progress: (__VLS_ctx.performanceStats.data?.overall_completion || 0),
    suffix: "%",
    color: "pink",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const __VLS_30 = StatCard;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    label: (__VLS_ctx.__('Game XP')),
    count: (__VLS_ctx.performanceStats.data?.avg_game_score || 0),
    progress: (__VLS_ctx.performanceStats.data?.avg_game_score || 0),
    suffix: "%",
    color: "purple",
}));
const __VLS_32 = __VLS_31({
    label: (__VLS_ctx.__('Game XP')),
    count: (__VLS_ctx.performanceStats.data?.avg_game_score || 0),
    progress: (__VLS_ctx.performanceStats.data?.avg_game_score || 0),
    suffix: "%",
    color: "purple",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const __VLS_35 = StatCard;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    label: (__VLS_ctx.__('Hours Spent')),
    count: (__VLS_ctx.hoursSpent.data?.total_hours || 0),
    progress: (Math.min(__VLS_ctx.hoursSpent.data?.total_hours || 0, 100)),
    suffix: "h",
    color: "green",
}));
const __VLS_37 = __VLS_36({
    label: (__VLS_ctx.__('Hours Spent')),
    count: (__VLS_ctx.hoursSpent.data?.total_hours || 0),
    progress: (Math.min(__VLS_ctx.hoursSpent.data?.total_hours || 0, 100)),
    suffix: "h",
    color: "green",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
if (__VLS_ctx.myCourses.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
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
    (__VLS_ctx.myCourses.data[0].membership
        ? __VLS_ctx.__('My Courses')
        : __VLS_ctx.__('Our Popular Courses'));
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        to: ({
            name: 'Courses',
        }),
    }));
    const __VLS_42 = __VLS_41({
        to: ({
            name: 'Courses',
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const { default: __VLS_45 } = __VLS_43.slots;
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
    let __VLS_46;
    /** @ts-ignore @type { | typeof __VLS_components.MoveRight} */
    MoveRight;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        ...{ class: "size-3 stroke-1.5" },
    }));
    const __VLS_48 = __VLS_47({
        ...{ class: "size-3 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [__, __, __, __, __, __, __, __, __, __, __, homeStats, homeStats, homeStats, homeStats, performanceStats, performanceStats, performanceStats, performanceStats, performanceStats, performanceStats, performanceStats, performanceStats, hoursSpent, hoursSpent, myCourses, myCourses,];
    var __VLS_43;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    for (const [course] of __VLS_vFor((__VLS_ctx.myCourses.data))) {
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            to: ({ name: 'CourseDetail', params: { courseName: course.name } }),
        }));
        const __VLS_53 = __VLS_52({
            to: ({ name: 'CourseDetail', params: { courseName: course.name } }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        const { default: __VLS_56 } = __VLS_54.slots;
        const __VLS_57 = CourseCard;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            course: (course),
        }));
        const __VLS_59 = __VLS_58({
            course: (course),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        // @ts-ignore
        [myCourses,];
        var __VLS_54;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.myBatches.data?.length) {
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
    (__VLS_ctx.myBatches.data?.[0].students.includes(__VLS_ctx.user.data?.name)
        ? __VLS_ctx.__('My Batches')
        : __VLS_ctx.__('Our Upcoming Batches'));
    let __VLS_62;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        to: ({
            name: 'Batches',
        }),
    }));
    const __VLS_64 = __VLS_63({
        to: ({
            name: 'Batches',
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const { default: __VLS_67 } = __VLS_65.slots;
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
    let __VLS_68;
    /** @ts-ignore @type { | typeof __VLS_components.MoveRight} */
    MoveRight;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        ...{ class: "size-3 stroke-1.5" },
    }));
    const __VLS_70 = __VLS_69({
        ...{ class: "size-3 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [__, __, __, myBatches, myBatches, user,];
    var __VLS_65;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    for (const [batch] of __VLS_vFor((__VLS_ctx.myBatches.data))) {
        let __VLS_73;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
            to: ({ name: 'BatchDetail', params: { batchName: batch.name } }),
        }));
        const __VLS_75 = __VLS_74({
            to: ({ name: 'BatchDetail', params: { batchName: batch.name } }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        const { default: __VLS_78 } = __VLS_76.slots;
        const __VLS_79 = BatchCard;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            batch: (batch),
        }));
        const __VLS_81 = __VLS_80({
            batch: (batch),
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        // @ts-ignore
        [myBatches,];
        var __VLS_76;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.myLiveClasses.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-10" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-semibold text-lg mb-3 text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Upcoming Live Classes'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    for (const [cls] of __VLS_vFor((__VLS_ctx.myLiveClasses.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-outline-gray-2 bg-surface-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 shadow-sm rounded-xl p-5" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
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
            ...{ class: "text-ink-gray-5 leading-5 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        (cls.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-auto space-y-4 text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        let __VLS_84;
        /** @ts-ignore @type { | typeof __VLS_components.Calendar} */
        Calendar;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }));
        const __VLS_86 = __VLS_85({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
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
        let __VLS_89;
        /** @ts-ignore @type { | typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }));
        const __VLS_91 = __VLS_90({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
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
                let __VLS_94;
                /** @ts-ignore @type { | typeof __VLS_components.Monitor} */
                Monitor;
                // @ts-ignore
                const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }));
                const __VLS_96 = __VLS_95({
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_95));
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
            let __VLS_99;
            /** @ts-ignore @type { | typeof __VLS_components.Video} */
            Video;
            // @ts-ignore
            const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_101 = __VLS_100({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_100));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            (__VLS_ctx.__('Join'));
        }
        else if (__VLS_ctx.hasClassEnded(cls)) {
            let __VLS_104;
            /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
            Tooltip;
            // @ts-ignore
            const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
                text: (__VLS_ctx.__('This class has ended')),
                placement: "right",
            }));
            const __VLS_106 = __VLS_105({
                text: (__VLS_ctx.__('This class has ended')),
                placement: "right",
            }, ...__VLS_functionalComponentArgsRest(__VLS_105));
            const { default: __VLS_109 } = __VLS_107.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-2 text-ink-amber-3 w-fit" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-amber-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
            let __VLS_110;
            /** @ts-ignore @type { | typeof __VLS_components.Info} */
            Info;
            // @ts-ignore
            const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }));
            const __VLS_112 = __VLS_111({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_111));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__('Ended'));
            // @ts-ignore
            [__, __, __, __, __, user, user, myLiveClasses, myLiveClasses, dayjs, dayjs, formatTime, getClassEnd, canAccessClass, hasClassEnded,];
            var __VLS_107;
        }
        // @ts-ignore
        [];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-10" },
});
/** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
const __VLS_115 = Leaderboard;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
    mode: "student",
}));
const __VLS_117 = __VLS_116({
    mode: "student",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
