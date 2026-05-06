/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
const props = defineProps({
    label: { type: String, required: true },
    value: { type: [Number, String], default: 0 },
    trend: { type: Number, default: null },
    subtitle: { type: String, default: '' },
    variant: { type: String, default: 'default' },
    progress: { type: Number, default: 0 },
    showProgress: { type: Boolean, default: false },
    progressLabel: { type: String, default: 'Progress' },
});
const displayValue = computed(() => {
    if (typeof props.value === 'number' && props.value >= 1000) {
        return props.value.toLocaleString();
    }
    return props.value;
});
const borderClass = computed(() => {
    const map = {
        success: 'border-emerald-100',
        warning: 'border-amber-100',
        danger: 'border-rose-100',
        info: 'border-blue-100',
        default: 'border-gray-100',
    };
    return map[props.variant] || map.default;
});
const progressClass = computed(() => {
    const map = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500',
        info: 'bg-blue-500',
        default: 'bg-[#2d6a4f]',
    };
    return map[props.variant] || map.default;
});
const accentTextClass = computed(() => {
    const map = {
        success: 'text-emerald-600',
        warning: 'text-amber-600',
        danger: 'text-rose-600',
        info: 'text-blue-600',
        default: 'text-[#2d6a4f]',
    };
    return map[props.variant] || map.default;
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
    ...{ class: "rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md" },
    ...{ class: (__VLS_ctx.borderClass) },
});
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
(__VLS_ctx.label);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-baseline gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-baseline']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-3xl font-bold text-gray-900" },
});
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
(__VLS_ctx.displayValue);
if (__VLS_ctx.trend != null) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs font-medium" },
        ...{ class: (__VLS_ctx.trend > 0 ? 'text-emerald-600' : 'text-rose-600') },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.trend > 0 ? '↑' : '↓');
    (Math.abs(__VLS_ctx.trend));
}
if (__VLS_ctx.subtitle) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-1 text-[11px] text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    (__VLS_ctx.subtitle);
}
if (__VLS_ctx.showProgress) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-medium text-gray-400 tracking-wide" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    (__VLS_ctx.progressLabel);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-bold" },
        ...{ class: (__VLS_ctx.accentTextClass) },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.progress);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-1.5 w-full rounded-full bg-gray-100 overflow-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-full rounded-full transition-all duration-700 ease-out" },
        ...{ class: (__VLS_ctx.progressClass) },
        ...{ style: ({ width: __VLS_ctx.progress + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-out']} */ ;
}
// @ts-ignore
[borderClass, label, displayValue, trend, trend, trend, trend, subtitle, subtitle, showProgress, progressLabel, accentTextClass, progress, progress, progressClass,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        label: { type: String, required: true },
        value: { type: [Number, String], default: 0 },
        trend: { type: Number, default: null },
        subtitle: { type: String, default: '' },
        variant: { type: String, default: 'default' },
        progress: { type: Number, default: 0 },
        showProgress: { type: Boolean, default: false },
        progressLabel: { type: String, default: 'Progress' },
    },
});
export default {};
