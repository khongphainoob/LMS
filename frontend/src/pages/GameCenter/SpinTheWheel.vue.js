/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from "vue";
const wheelSize = 280;
const textRadius = (wheelSize / 2) - 40;
const rotation = ref(0);
const isSpinning = ref(false);
const showResult = ref(false);
const lastResult = ref(null);
const totalPoints = ref(0);
const spinsLeft = ref(5);
const history = ref([]);
const segments = [
    { points: 10, label: "", color: "#3B82F6" },
    { points: "miss", label: "", color: "#EF4444" },
    { points: 25, label: "", color: "#10B981" },
    { points: 5, label: "", color: "#F59E0B" },
    { points: 50, label: "\u{1F31F}", color: "#8B5CF6" },
    { points: "miss", label: "", color: "#EF4444" },
    { points: 15, label: "", color: "#06B6D4" },
    { points: 30, label: "", color: "#EC4899" },
    { points: "miss", label: "", color: "#EF4444" },
    { points: 20, label: "", color: "#14B8A6" },
    { points: 100, label: "\u{1F389}", color: "#F97316" },
    { points: 5, label: "", color: "#6366F1" },
];
function getSegmentAngle(idx) {
    const segAngle = (2 * Math.PI) / segments.length;
    return -Math.PI / 2 + segAngle * idx + segAngle / 2;
}
function getSegmentPath(idx) {
    const cx = wheelSize / 2;
    const cy = wheelSize / 2;
    const r = wheelSize / 2 - 2;
    const segAngle = (2 * Math.PI) / segments.length;
    const startAngle = -Math.PI / 2 + segAngle * idx;
    const endAngle = startAngle + segAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = segAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}
function spin() {
    if (isSpinning.value || spinsLeft.value <= 0)
        return;
    isSpinning.value = true;
    showResult.value = false;
    spinsLeft.value--;
    const spinAmount = 1800 + Math.random() * 1440;
    rotation.value += spinAmount;
    setTimeout(() => {
        const normalizedDeg = (rotation.value % 360 + 360) % 360;
        const segAngle = 360 / segments.length;
        const pointerAngle = (360 - normalizedDeg + 90) % 360;
        const segIndex = Math.floor(pointerAngle / segAngle) % segments.length;
        const result = segments[segIndex].points;
        lastResult.value = result;
        showResult.value = true;
        if (result !== "miss") {
            totalPoints.value += result;
        }
        history.value.push(result);
        isSpinning.value = false;
    }, 4200);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-4" },
});
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__("Spin the Wheel"));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
(__VLS_ctx.__("Points: {0}").format(__VLS_ctx.totalPoints));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-6" },
});
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-center mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative" },
    ...{ style: ({ width: __VLS_ctx.wheelSize + 'px', height: __VLS_ctx.wheelSize + 'px' }) },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "absolute -top-2 left-1/2 -translate-x-1/2 z-10" },
});
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['-top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md" },
});
/** @type {__VLS_StyleScopedClasses['w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-[12px]']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r-[12px]']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t-[20px]']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-shadow-md']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: (__VLS_ctx.wheelSize),
    height: (__VLS_ctx.wheelSize),
    viewBox: (`0 0 ${__VLS_ctx.wheelSize} ${__VLS_ctx.wheelSize}`),
    ...{ class: "rounded-full shadow-lg" },
    ...{ style: ({ transform: `rotate(${__VLS_ctx.rotation}deg)`, transition: __VLS_ctx.isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }) },
});
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
for (const [segment, idx] of __VLS_vFor((__VLS_ctx.segments))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
        key: (idx),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: (__VLS_ctx.getSegmentPath(idx)),
        fill: (segment.color),
        stroke: "white",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
        x: (__VLS_ctx.wheelSize / 2 + Math.cos(__VLS_ctx.getSegmentAngle(idx)) * __VLS_ctx.textRadius),
        y: (__VLS_ctx.wheelSize / 2 + Math.sin(__VLS_ctx.getSegmentAngle(idx)) * __VLS_ctx.textRadius),
        'text-anchor': (__VLS_ctx.middle),
        'dominant-baseline': "middle",
        transform: (`rotate(${__VLS_ctx.getSegmentAngle(idx) * (180 / Math.PI) + 90}, ${__VLS_ctx.wheelSize / 2 + Math.cos(__VLS_ctx.getSegmentAngle(idx)) * __VLS_ctx.textRadius}, ${__VLS_ctx.wheelSize / 2 + Math.sin(__VLS_ctx.getSegmentAngle(idx)) * __VLS_ctx.textRadius})`),
        fill: "white",
        ...{ class: "text-[10px] font-bold pointer-events-none" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    (segment.points);
    __VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
        x: (__VLS_ctx.wheelSize / 2 + Math.cos(__VLS_ctx.getSegmentAngle(idx)) * (__VLS_ctx.textRadius - 18)),
        y: (__VLS_ctx.wheelSize / 2 + Math.sin(__VLS_ctx.getSegmentAngle(idx)) * (__VLS_ctx.textRadius - 18)),
        'text-anchor': (__VLS_ctx.middle),
        'dominant-baseline': "middle",
        transform: (`rotate(${__VLS_ctx.getSegmentAngle(idx) * (180 / Math.PI) + 90}, ${__VLS_ctx.wheelSize / 2 + Math.cos(__VLS_ctx.getSegmentAngle(idx)) * (__VLS_ctx.textRadius - 18)}, ${__VLS_ctx.wheelSize / 2 + Math.sin(__VLS_ctx.getSegmentAngle(idx)) * (__VLS_ctx.textRadius - 18)})`),
        fill: "white",
        ...{ class: "pointer-events-none" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    (segment.label);
    // @ts-ignore
    [__, __, totalPoints, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, wheelSize, rotation, isSpinning, segments, getSegmentPath, getSegmentAngle, getSegmentAngle, getSegmentAngle, getSegmentAngle, getSegmentAngle, getSegmentAngle, getSegmentAngle, getSegmentAngle, getSegmentAngle, getSegmentAngle, textRadius, textRadius, textRadius, textRadius, textRadius, textRadius, textRadius, textRadius, middle, middle,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: (__VLS_ctx.wheelSize / 2),
    cy: (__VLS_ctx.wheelSize / 2),
    r: (20),
    fill: "white",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-center" },
});
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.spin) },
    disabled: (__VLS_ctx.isSpinning || __VLS_ctx.spinsLeft <= 0),
    ...{ class: "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300" },
    ...{ class: (__VLS_ctx.isSpinning || __VLS_ctx.spinsLeft <= 0
            ? 'bg-surface-gray-2 text-ink-gray-4 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95') },
});
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
(__VLS_ctx.isSpinning ? __VLS_ctx.__("Spinning...") : __VLS_ctx.__("SPIN!"));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xs text-ink-gray-5 mt-2" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
(__VLS_ctx.__("Spins left: {0}").format(__VLS_ctx.spinsLeft));
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    enterActiveClass: "transition-all duration-300",
    enterFromClass: "opacity-0 scale-90",
    leaveActiveClass: "transition-all duration-200",
    leaveToClass: "opacity-0 scale-90",
}));
const __VLS_2 = __VLS_1({
    enterActiveClass: "transition-all duration-300",
    enterFromClass: "opacity-0 scale-90",
    leaveActiveClass: "transition-all duration-200",
    leaveToClass: "opacity-0 scale-90",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.showResult) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-4 text-center p-4 rounded-xl" },
        ...{ class: (__VLS_ctx.lastResult === 'miss'
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800') },
    });
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-2xl mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.lastResult === 'miss' ? "\u{1F614}" : "\u{1F389}");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.lastResult === 'miss' ? __VLS_ctx.__("Try again!") : __VLS_ctx.__("+" + __VLS_ctx.lastResult + " points!"));
}
// @ts-ignore
[__, __, __, __, __, wheelSize, wheelSize, isSpinning, isSpinning, isSpinning, spin, spinsLeft, spinsLeft, spinsLeft, showResult, lastResult, lastResult, lastResult, lastResult,];
var __VLS_3;
if (__VLS_ctx.history.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 justify-center flex-wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__("History:"));
    for (const [h, idx] of __VLS_vFor((__VLS_ctx.history.slice(-10)))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            key: (idx),
            ...{ class: "text-xs px-2 py-0.5 rounded-full font-medium" },
            ...{ class: (h === 'miss'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400') },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (h === 'miss' ? __VLS_ctx.__("Miss") : "+" + h);
        // @ts-ignore
        [__, __, history, history,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
