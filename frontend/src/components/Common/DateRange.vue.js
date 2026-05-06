/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Calendar } from 'lucide-vue-next';
import { getFormattedDateRange } from '@/utils';
const props = defineProps({
    startDate: {
        type: String,
    },
    endDate: {
        type: String,
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
    ...{ class: "flex items-center text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Calendar} */
Calendar;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.getFormattedDateRange(props.startDate, props.endDate));
// @ts-ignore
[getFormattedDateRange,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        startDate: {
            type: String,
        },
        endDate: {
            type: String,
        },
    },
});
export default {};
