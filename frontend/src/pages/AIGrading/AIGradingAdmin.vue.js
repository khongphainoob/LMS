/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { createResource } from 'frappe-ui';
import AIAnalyticsStatCard from '@/components/AIGrading/AIAnalyticsStatCard.vue';
import AIAnalyticsFeedbackTable from '@/components/AIGrading/AIAnalyticsFeedbackTable.vue';
import AIAnalyticsButton from '@/components/AIGrading/AIAnalyticsButton.vue';
const router = useRouter();
const user = inject('$user');
const feedbackSection = ref(null);
// Admin-only guard: redirect non-Moderator users
onMounted(() => {
    if (!user.data?.is_moderator) {
        router.push({ name: 'AIGradingEssay' });
    }
});
// Real analytics from backend API
const analyticsResource = createResource({
    url: 'lms.lms.api.get_ai_grading_analytics',
    auto: true,
});
const analytics = computed(() => {
    return analyticsResource.data || {
        total_sessions: 0,
        open_sessions: 0,
        total_submissions: 0,
        graded_today: 0,
        need_review: 0,
        total_rated: 0,
        satisfied_count: 0,
        dissatisfied_count: 0,
        satisfaction_rate: 0,
    };
});
// Real dissatisfaction feedback from backend API
const feedbackResource = createResource({
    url: 'lms.lms.api.get_ai_grading_dissatisfaction_feed',
    auto: true,
    makeParams() {
        return { limit: 50 };
    },
});
const feedbackList = computed(() => {
    return feedbackResource.data || [];
});
function scrollToFeedback() {
    feedbackSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-2xl font-bold text-gray-900 tracking-tight" },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
(__VLS_ctx.__('AI Grading Dashboard'));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-sm text-gray-500" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
(__VLS_ctx.__('Monitor AI performance and review teacher feedback.'));
const __VLS_0 = AIAnalyticsButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    label: (__VLS_ctx.__('AI Analytics')),
    icon: "✦",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    label: (__VLS_ctx.__('AI Analytics')),
    icon: "✦",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.scrollToFeedback) });
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
const __VLS_7 = AIAnalyticsStatCard;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    label: (__VLS_ctx.__('Graded Today')),
    value: (__VLS_ctx.analytics.graded_today),
    variant: "success",
}));
const __VLS_9 = __VLS_8({
    label: (__VLS_ctx.__('Graded Today')),
    value: (__VLS_ctx.analytics.graded_today),
    variant: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
const __VLS_12 = AIAnalyticsStatCard;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    label: (__VLS_ctx.__('Satisfaction Rate')),
    value: (__VLS_ctx.analytics.satisfaction_rate ? __VLS_ctx.analytics.satisfaction_rate + '%' : '—'),
    variant: "info",
}));
const __VLS_14 = __VLS_13({
    label: (__VLS_ctx.__('Satisfaction Rate')),
    value: (__VLS_ctx.analytics.satisfaction_rate ? __VLS_ctx.analytics.satisfaction_rate + '%' : '—'),
    variant: "info",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_17 = AIAnalyticsStatCard;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
    label: (__VLS_ctx.__('Review Flags')),
    value: (__VLS_ctx.analytics.need_review),
    variant: "danger",
}));
const __VLS_19 = __VLS_18({
    label: (__VLS_ctx.__('Review Flags')),
    value: (__VLS_ctx.analytics.need_review),
    variant: "danger",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
const __VLS_22 = AIAnalyticsStatCard;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
    label: (__VLS_ctx.__('Open Sessions')),
    value: (__VLS_ctx.analytics.open_sessions),
    variant: "warning",
}));
const __VLS_24 = __VLS_23({
    label: (__VLS_ctx.__('Open Sessions')),
    value: (__VLS_ctx.analytics.open_sessions),
    variant: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 gap-4 sm:grid-cols-3" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
const __VLS_27 = AIAnalyticsStatCard;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
    label: (__VLS_ctx.__('Total Sessions')),
    value: (__VLS_ctx.analytics.total_sessions),
}));
const __VLS_29 = __VLS_28({
    label: (__VLS_ctx.__('Total Sessions')),
    value: (__VLS_ctx.analytics.total_sessions),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
const __VLS_32 = AIAnalyticsStatCard;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    label: (__VLS_ctx.__('Total Submissions')),
    value: (__VLS_ctx.analytics.total_submissions),
}));
const __VLS_34 = __VLS_33({
    label: (__VLS_ctx.__('Total Submissions')),
    value: (__VLS_ctx.analytics.total_submissions),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_37 = AIAnalyticsStatCard;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    label: (__VLS_ctx.__('Dissatisfied')),
    value: (__VLS_ctx.analytics.dissatisfied_count),
    variant: "danger",
}));
const __VLS_39 = __VLS_38({
    label: (__VLS_ctx.__('Dissatisfied')),
    value: (__VLS_ctx.analytics.dissatisfied_count),
    variant: "danger",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "feedbackSection",
});
const __VLS_42 = AIAnalyticsFeedbackTable;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    items: (__VLS_ctx.feedbackList),
    loading: (__VLS_ctx.feedbackResource.loading),
}));
const __VLS_44 = __VLS_43({
    items: (__VLS_ctx.feedbackList),
    loading: (__VLS_ctx.feedbackResource.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
// @ts-ignore
[__, __, __, __, __, __, __, __, __, __, scrollToFeedback, analytics, analytics, analytics, analytics, analytics, analytics, analytics, analytics, feedbackList, feedbackResource,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
