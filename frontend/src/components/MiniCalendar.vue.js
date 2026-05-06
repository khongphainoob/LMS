/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const monthYear = computed(() => {
    return `${monthNames[currentMonth.value]} ${currentYear.value}`;
});
const calendarCells = computed(() => {
    const year = currentYear.value;
    const month = currentMonth.value;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells = [];
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({
            day: daysInPrevMonth - i,
            isCurrentMonth: false,
            isToday: false,
        });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({
            day: d,
            isCurrentMonth: true,
            isToday: d === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear(),
        });
    }
    // Next month days
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
        cells.push({
            day: d,
            isCurrentMonth: false,
            isToday: false,
        });
    }
    return cells;
});
const prevMonth = () => {
    if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
    }
    else {
        currentMonth.value--;
    }
};
const nextMonth = () => {
    if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
    }
    else {
        currentMonth.value++;
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rounded-xl border border-outline-gray-2 bg-surface-white p-4" },
});
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-sm font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.monthYear);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.prevMonth) },
    ...{ class: "flex items-center justify-center w-6 h-6 rounded-md hover:bg-surface-gray-2 transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.ChevronLeft} */
ChevronLeft;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-4 stroke-1.5 text-ink-gray-6" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-4 stroke-1.5 text-ink-gray-6" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.nextMonth) },
    ...{ class: "flex items-center justify-center w-6 h-6 rounded-md hover:bg-surface-gray-2 transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.ChevronRight} */
ChevronRight;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ class: "size-4 stroke-1.5 text-ink-gray-6" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "size-4 stroke-1.5 text-ink-gray-6" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-7 gap-0 mb-1" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-7']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
for (const [day] of __VLS_vFor((__VLS_ctx.dayLabels))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (day),
        ...{ class: "text-center text-xs font-medium text-ink-gray-5 py-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    (day);
    // @ts-ignore
    [monthYear, prevMonth, nextMonth, dayLabels,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-7 gap-0" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-7']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-0']} */ ;
for (const [cell, index] of __VLS_vFor((__VLS_ctx.calendarCells))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: "text-center text-xs py-1.5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    if (cell.day) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors" },
            ...{ class: ({
                    'bg-ink-gray-9 text-surface-white font-semibold': cell.isToday && !cell.isCurrentMonth,
                    'bg-ink-gray-9 text-surface-white font-semibold': cell.isToday && cell.isCurrentMonth,
                    'bg-surface-gray-2 text-ink-gray-7': !cell.isCurrentMonth && !cell.isToday,
                    'text-ink-gray-7': cell.isCurrentMonth && !cell.isToday,
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (cell.day);
    }
    // @ts-ignore
    [calendarCells,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
