/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { GraduationCap } from 'lucide-vue-next';
import { computed } from 'vue';
const props = defineProps({
    type: String,
});
const localizedType = computed(() => {
    const baseType = props.type || '';
    const translatedType = __(baseType);
    return translatedType.toLowerCase();
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
    ...{ class: "flex flex-col items-center justify-center mt-60" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-60']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
GraduationCap;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-10 mx-auto stroke-1 text-ink-gray-5" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-10 mx-auto stroke-1 text-ink-gray-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-10']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg font-semibold text-ink-gray-7 mb-2.5" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2.5']} */ ;
(__VLS_ctx.__('No {0}').format(__VLS_ctx.localizedType));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "leading-5 text-base w-full md:w-2/5 text-base text-center text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:w-2/5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
(__VLS_ctx.__('There are no {0} currently. Keep an eye out, fresh learning experiences are on the way!').format(__VLS_ctx.localizedType));
// @ts-ignore
[__, __, localizedType, localizedType,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        type: String,
    },
});
export default {};
