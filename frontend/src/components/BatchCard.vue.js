/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { formatTime } from '@/utils';
import { Clock, Globe } from 'lucide-vue-next';
import DateRange from '@/components/Common/DateRange.vue';
import CourseInstructors from '@/components/CourseInstructors.vue';
import UserAvatar from '@/components/UserAvatar.vue';
const props = defineProps({
    batch: {
        type: Object,
        default: null,
    },
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col border border-outline-gray-2 bg-surface-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 shadow-sm rounded-xl p-5 h-full" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
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
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg leading-5 font-semibold mb-2 text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.batch.title);
if (__VLS_ctx.batch.seat_count && __VLS_ctx.batch.seats_left > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs bg-green-100 text-green-700 self-start px-2 py-0.5 rounded-md" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-green-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['self-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    (__VLS_ctx.batch.seats_left);
    if (__VLS_ctx.batch.seats_left > 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Seats Left'));
    }
    else if (__VLS_ctx.batch.seats_left == 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Seat Left'));
    }
}
else if (__VLS_ctx.batch.seat_count && __VLS_ctx.batch.seats_left <= 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs bg-red-100 text-red-700 self-start px-2 py-0.5 rounded-md" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['self-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    (__VLS_ctx.__('Sold Out'));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "short-introduction text-sm text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['short-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
(__VLS_ctx.batch.description);
if (__VLS_ctx.batch.amount) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-semibold text-ink-gray-9 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    (__VLS_ctx.batch.price);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col space-y-2 mt-auto" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
const __VLS_0 = DateRange;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    startDate: (__VLS_ctx.batch.start_date),
    endDate: (__VLS_ctx.batch.end_date),
    ...{ class: "text-sm text-ink-gray-7" },
}));
const __VLS_2 = __VLS_1({
    startDate: (__VLS_ctx.batch.start_date),
    endDate: (__VLS_ctx.batch.end_date),
    ...{ class: "text-sm text-ink-gray-7" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center text-sm text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Clock} */
Clock;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ class: "h-4 w-4 stroke-1.5 mr-2 text-ink-gray-7" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "h-4 w-4 stroke-1.5 mr-2 text-ink-gray-7" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.formatTime(__VLS_ctx.batch.start_time));
(__VLS_ctx.formatTime(__VLS_ctx.batch.end_time));
if (__VLS_ctx.batch.timezone) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center text-sm text-ink-gray-7" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.Globe} */
    Globe;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        ...{ class: "h-4 w-4 stroke-1.5 mr-2 text-ink-gray-5" },
    }));
    const __VLS_12 = __VLS_11({
        ...{ class: "h-4 w-4 stroke-1.5 mr-2 text-ink-gray-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.batch.timezone);
}
if (__VLS_ctx.batch.instructors?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex avatar-group overlap mt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['overlap']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-6 mr-1" },
        ...{ class: ({ 'avatar-group overlap': __VLS_ctx.batch.instructors.length > 1 }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['overlap']} */ ;
    for (const [instructor] of __VLS_vFor((__VLS_ctx.batch.instructors))) {
        const __VLS_15 = UserAvatar;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            user: (instructor),
        }));
        const __VLS_17 = __VLS_16({
            user: (instructor),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        // @ts-ignore
        [batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, __, __, __, formatTime, formatTime,];
    }
    const __VLS_20 = CourseInstructors;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        instructors: (__VLS_ctx.batch.instructors),
    }));
    const __VLS_22 = __VLS_21({
        instructors: (__VLS_ctx.batch.instructors),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
// @ts-ignore
[batch,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batch: {
            type: Object,
            default: null,
        },
    },
});
export default {};
