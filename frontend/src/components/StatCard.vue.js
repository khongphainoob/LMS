/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
const props = withDefaults(defineProps(), {
    progress: 0,
    color: 'blue',
    suffix: '',
});
const radius = 24;
const circumference = 2 * Math.PI * radius;
const dashOffset = computed(() => {
    return circumference - (props.progress / 100) * circumference;
});
const colorMap = {
    orange: {
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        track: '#fed7aa',
        ring: '#f97316',
        ringText: 'text-orange-600 dark:text-orange-400',
        count: 'text-ink-gray-9',
        label: 'text-ink-gray-6',
    },
    pink: {
        bg: 'bg-pink-50 dark:bg-pink-950/30',
        track: '#fbcfe8',
        ring: '#ec4899',
        ringText: 'text-pink-600 dark:text-pink-400',
        count: 'text-ink-gray-9',
        label: 'text-ink-gray-6',
    },
    green: {
        bg: 'bg-green-50 dark:bg-green-950/30',
        track: '#bbf7d0',
        ring: '#22c55e',
        ringText: 'text-green-600 dark:text-green-400',
        count: 'text-ink-gray-9',
        label: 'text-ink-gray-6',
    },
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        track: '#bfdbfe',
        ring: '#3b82f6',
        ringText: 'text-blue-600 dark:text-blue-400',
        count: 'text-ink-gray-9',
        label: 'text-ink-gray-6',
    },
    amber: {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        track: '#fde68a',
        ring: '#f59e0b',
        ringText: 'text-amber-600 dark:text-amber-400',
        count: 'text-ink-gray-9',
        label: 'text-ink-gray-6',
    },
};
const currentColor = computed(() => colorMap[props.color] || colorMap.blue);
const bgClass = computed(() => currentColor.value.bg);
const trackColor = computed(() => currentColor.value.track);
const ringColor = computed(() => currentColor.value.ring);
const ringTextColor = computed(() => currentColor.value.ringText);
const countColor = computed(() => currentColor.value.count);
const labelColor = computed(() => currentColor.value.label);
const __VLS_defaults = {
    progress: 0,
    color: 'blue',
    suffix: '',
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4 rounded-xl p-5 transition-all duration-300 hover:shadow-md" },
    ...{ class: (__VLS_ctx.bgClass) },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative flex-shrink-0" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "56",
    height: "56",
    viewBox: "0 0 56 56",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "28",
    cy: "28",
    r: "24",
    fill: "none",
    stroke: (__VLS_ctx.trackColor),
    'stroke-width': "4",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "28",
    cy: "28",
    r: "24",
    fill: "none",
    stroke: (__VLS_ctx.ringColor),
    'stroke-width': "4",
    'stroke-linecap': "round",
    'stroke-dasharray': (__VLS_ctx.circumference),
    'stroke-dashoffset': (__VLS_ctx.dashOffset),
    transform: "rotate(-90 28 28)",
    ...{ class: "transition-all duration-500" },
});
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "absolute inset-0 flex items-center justify-center text-sm font-bold" },
    ...{ class: (__VLS_ctx.ringTextColor) },
});
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
(__VLS_ctx.progress);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-2xl font-bold" },
    ...{ class: (__VLS_ctx.countColor) },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
(__VLS_ctx.count);
(__VLS_ctx.suffix);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-sm" },
    ...{ class: (__VLS_ctx.labelColor) },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
(__VLS_ctx.label);
// @ts-ignore
[bgClass, trackColor, ringColor, circumference, dashOffset, ringTextColor, progress, countColor, count, suffix, labelColor, label,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
    props: {},
});
export default {};
