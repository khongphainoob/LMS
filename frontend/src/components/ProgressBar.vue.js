/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { Tooltip } from 'frappe-ui';
const props = defineProps({
    progress: {
        type: Number,
        default: 0,
    },
    size: {
        type: String,
        default: 'sm',
    },
});
const progressBarWidth = computed(() => {
    const formattedPercentage = Math.min(Math.ceil(props.progress), 100);
    return `${formattedPercentage}%`;
});
const progressBarHeight = computed(() => {
    if (props.size === 'sm') {
        return 'h-1';
    }
    if (props.size === 'md') {
        return 'h-2';
    }
    if (props.size === 'lg') {
        return 'h-3';
    }
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
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
Tooltip;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    text: (`${props.progress}%`),
}));
const __VLS_2 = __VLS_1({
    text: (`${props.progress}%`),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-full bg-surface-gray-3 rounded-full h-1" },
    ...{ class: (__VLS_ctx.$attrs.class) },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-gray-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-surface-gray-7 rounded-full" },
    ...{ class: (__VLS_ctx.progressBarHeight) },
    ...{ style: ({ width: __VLS_ctx.progressBarWidth }) },
});
/** @type {__VLS_StyleScopedClasses['bg-surface-gray-7']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
// @ts-ignore
[$attrs, progressBarHeight, progressBarWidth,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        progress: {
            type: Number,
            default: 0,
        },
        size: {
            type: String,
            default: 'sm',
        },
    },
});
export default {};
