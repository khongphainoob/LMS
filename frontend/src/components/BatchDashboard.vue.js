/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import UpcomingEvaluations from '@/components/UpcomingEvaluations.vue';
import Assessments from '@/components/Assessments.vue';
const props = defineProps({
    batch: {
        type: Object,
        default: null,
    },
    isStudent: {
        type: Boolean,
        default: false,
    },
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-10" },
});
/** @type {__VLS_StyleScopedClasses['space-y-10']} */ ;
const __VLS_0 = UpcomingEvaluations;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    batch: (__VLS_ctx.batch.data.name),
    endDate: (__VLS_ctx.batch.data.evaluation_end_date),
    courses: (__VLS_ctx.batch.data.courses),
}));
const __VLS_2 = __VLS_1({
    batch: (__VLS_ctx.batch.data.name),
    endDate: (__VLS_ctx.batch.data.evaluation_end_date),
    courses: (__VLS_ctx.batch.data.courses),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_5 = Assessments;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    batch: (__VLS_ctx.batch.data.name),
}));
const __VLS_7 = __VLS_6({
    batch: (__VLS_ctx.batch.data.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
// @ts-ignore
[batch, batch, batch, batch,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batch: {
            type: Object,
            default: null,
        },
        isStudent: {
            type: Boolean,
            default: false,
        },
    },
});
export default {};
