/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createResource, Toast } from 'frappe-ui';
import apexchart from 'vue3-apexcharts';
import AIAnalyticsStatCard from '@/components/AIGrading/AIAnalyticsStatCard.vue';
const props = defineProps({
    type: { type: String, required: true },
    sessionSlug: { type: String, required: true },
});
const route = useRoute();
const router = useRouter();
const sessionDoc = ref(null);
// 1. Load Session basic details
const sessionResource = createResource({
    url: 'lms.lms.api.get_ai_grading_session_by_slug',
    auto: true,
    makeParams() {
        return {
            session_slug: props.sessionSlug,
            grading_type: props.type === 'test' ? 'Test' : (props.type === 'hw' ? 'Homework' : 'Exam')
        };
    },
    onSuccess(data) {
        if (data) {
            sessionDoc.value = data;
            statsResource.submit();
        }
    }
});
// 2. Load Detailed Statistics
const statsResource = createResource({
    url: 'lms.lms.api.get_ai_grading_session_statistics',
    makeParams() {
        return {
            session: sessionDoc.value?.name
        };
    }
});
const stats = computed(() => {
    return statsResource.data || {
        total: 0,
        graded: 0,
        ungraded: 0,
        high_scores: 0,
        low_scores: 0,
        score_distribution: [],
        avg_score: 0,
        top_failed_questions: [],
        at_risk_students: []
    };
});
const progressPercent = computed(() => {
    if (!stats.value.total)
        return 0;
    return Math.round((stats.value.graded / stats.value.total) * 100);
});
// 3. Email Functionality
const emailResource = createResource({
    url: 'lms.lms.api.send_ai_grading_result_email',
    onSuccess() {
        Toast(__('Email sent successfully!'));
    }
});
function sendEmail(submissionId) {
    emailResource.submit({ submission: submissionId });
}
// 4. Chart Configuration
const chartSeries = computed(() => {
    return [{
            name: __('Students'),
            data: stats.value.score_distribution?.map(d => d.count) || []
        }];
});
const chartOptions = computed(() => {
    return {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '50%',
                distributed: true
            }
        },
        colors: ['#f43f5e', '#facc15', '#3b82f6', '#10b981', '#059669'],
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: {
            categories: stats.value.score_distribution?.map(d => d.bucket) || [],
            labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { style: { colors: '#94a3b8', fontSize: '11px' } }
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } }
        },
        tooltip: { theme: 'light' }
    };
});
onMounted(() => {
    if (props.sessionSlug) {
        sessionResource.fetch();
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
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push({ name: 'AIGradingEssayConfig', params: { type: __VLS_ctx.type } });
            // @ts-ignore
            [$router, type,];
        } },
    ...{ class: "mb-2 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-700 font-medium" },
});
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.__('Back to Config'));
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-2xl font-bold text-gray-900 tracking-tight" },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
(__VLS_ctx.__('Session Statistics'));
(__VLS_ctx.sessionDoc?.session_name || '...');
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-sm text-gray-500" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
(__VLS_ctx.__('Detailed insights and performance analysis for this session.'));
if (__VLS_ctx.sessionDoc) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    (__VLS_ctx.sessionDoc.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm" },
        ...{ style: ({ backgroundColor: '#2d6a4f' }) },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    (__VLS_ctx.sessionDoc.status);
}
if (__VLS_ctx.statsResource.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
    for (const [i] of __VLS_vFor((4))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (i),
            ...{ class: "h-32 rounded-xl border border-gray-100 bg-gray-50/50" },
        });
        /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-50/50']} */ ;
        // @ts-ignore
        [__, __, __, sessionDoc, sessionDoc, sessionDoc, sessionDoc, statsResource,];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
    const __VLS_0 = AIAnalyticsStatCard;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        label: (__VLS_ctx.__('Grading Progress')),
        value: (__VLS_ctx.stats.graded + '/' + __VLS_ctx.stats.total),
        progress: (__VLS_ctx.progressPercent),
        showProgress: true,
        progressLabel: (__VLS_ctx.__('Completion Rate')),
        variant: "default",
    }));
    const __VLS_2 = __VLS_1({
        label: (__VLS_ctx.__('Grading Progress')),
        value: (__VLS_ctx.stats.graded + '/' + __VLS_ctx.stats.total),
        progress: (__VLS_ctx.progressPercent),
        showProgress: true,
        progressLabel: (__VLS_ctx.__('Completion Rate')),
        variant: "default",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_5 = AIAnalyticsStatCard;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        label: (__VLS_ctx.__('Average Score')),
        value: (__VLS_ctx.stats.avg_score),
        subtitle: (__VLS_ctx.__('Across all graded papers')),
        variant: "info",
    }));
    const __VLS_7 = __VLS_6({
        label: (__VLS_ctx.__('Average Score')),
        value: (__VLS_ctx.stats.avg_score),
        subtitle: (__VLS_ctx.__('Across all graded papers')),
        variant: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const __VLS_10 = AIAnalyticsStatCard;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        label: (__VLS_ctx.__('High Scores (≥8)')),
        value: (__VLS_ctx.stats.high_scores),
        progress: (__VLS_ctx.stats.total ? Math.round((__VLS_ctx.stats.high_scores / __VLS_ctx.stats.total) * 100) : 0),
        showProgress: true,
        progressLabel: (__VLS_ctx.__('Excellence Rate')),
        variant: "success",
    }));
    const __VLS_12 = __VLS_11({
        label: (__VLS_ctx.__('High Scores (≥8)')),
        value: (__VLS_ctx.stats.high_scores),
        progress: (__VLS_ctx.stats.total ? Math.round((__VLS_ctx.stats.high_scores / __VLS_ctx.stats.total) * 100) : 0),
        showProgress: true,
        progressLabel: (__VLS_ctx.__('Excellence Rate')),
        variant: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const __VLS_15 = AIAnalyticsStatCard;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        label: (__VLS_ctx.__('Low Scores (<5)')),
        value: (__VLS_ctx.stats.low_scores),
        progress: (__VLS_ctx.stats.total ? Math.round((__VLS_ctx.stats.low_scores / __VLS_ctx.stats.total) * 100) : 0),
        showProgress: true,
        progressLabel: (__VLS_ctx.__('At-risk Rate')),
        variant: "danger",
    }));
    const __VLS_17 = __VLS_16({
        label: (__VLS_ctx.__('Low Scores (<5)')),
        value: (__VLS_ctx.stats.low_scores),
        progress: (__VLS_ctx.stats.total ? Math.round((__VLS_ctx.stats.low_scores / __VLS_ctx.stats.total) * 100) : 0),
        showProgress: true,
        progressLabel: (__VLS_ctx.__('At-risk Rate')),
        variant: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rounded-xl border border-gray-100 bg-white p-6 shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-4 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "text-sm font-bold text-gray-800 uppercase tracking-wider" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
(__VLS_ctx.__('Score Distribution'));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-[10px] text-gray-400" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
(__VLS_ctx.__('Student counts per score range'));
if (__VLS_ctx.statsResource.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-64 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['h-64']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-64" },
    });
    /** @type {__VLS_StyleScopedClasses['h-64']} */ ;
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.apexchart | typeof __VLS_components.Apexchart | typeof __VLS_components.apexchart | typeof __VLS_components.Apexchart} */
    apexchart;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        type: "bar",
        height: "100%",
        options: (__VLS_ctx.chartOptions),
        series: (__VLS_ctx.chartSeries),
    }));
    const __VLS_22 = __VLS_21({
        type: "bar",
        height: "100%",
        options: (__VLS_ctx.chartOptions),
        series: (__VLS_ctx.chartSeries),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 gap-6 lg:grid-cols-2" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rounded-xl border border-gray-100 bg-white p-6 shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-4 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "text-sm font-bold text-gray-800 uppercase tracking-wider" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
(__VLS_ctx.__('Challenging Questions'));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-[10px] text-gray-400" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
(__VLS_ctx.__('Based on student failure rates'));
if (__VLS_ctx.statsResource.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    for (const [i] of __VLS_vFor((3))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (i),
            ...{ class: "h-12 bg-gray-50 rounded-lg animate-pulse" },
        });
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
        // @ts-ignore
        [__, __, __, __, __, __, __, __, __, __, __, __, statsResource, statsResource, stats, stats, stats, stats, stats, stats, stats, stats, stats, stats, stats, progressPercent, chartOptions, chartSeries,];
    }
}
else if (!__VLS_ctx.stats.top_failed_questions?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex h-32 items-center justify-center text-sm text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-50/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    (__VLS_ctx.__('No question data available yet.'));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    for (const [q, idx] of __VLS_vFor((__VLS_ctx.stats.top_failed_questions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (idx),
            ...{ class: "group" },
        });
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between mb-1.5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm font-semibold text-gray-700" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
        (q.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs font-bold text-rose-600" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-rose-600']} */ ;
        (q.fail_rate);
        (__VLS_ctx.__('fail'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-2 w-full rounded-full bg-gray-100 overflow-hidden" },
        });
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-full rounded-full bg-rose-500 transition-all duration-1000" },
            ...{ style: ({ width: q.fail_rate + '%' }) },
        });
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-rose-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-1000']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-1 text-[10px] text-gray-400" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        (q.fail_count);
        (q.total);
        (__VLS_ctx.__('students struggled with this part'));
        // @ts-ignore
        [__, __, __, stats, stats,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rounded-xl border border-gray-100 bg-white p-6 shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-4 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "text-sm font-bold text-gray-800 uppercase tracking-wider" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
(__VLS_ctx.__('At-Risk Students (< 5.0)'));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700" },
});
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-rose-100']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-rose-700']} */ ;
(__VLS_ctx.stats.low_scores);
(__VLS_ctx.__('Students'));
if (__VLS_ctx.statsResource.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    for (const [i] of __VLS_vFor((3))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (i),
            ...{ class: "h-12 bg-gray-50 rounded-lg animate-pulse" },
        });
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
        // @ts-ignore
        [__, __, statsResource, stats,];
    }
}
else if (!__VLS_ctx.stats.at_risk_students?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex h-32 items-center justify-center text-sm text-emerald-600 bg-emerald-50 rounded-xl border border-dashed border-emerald-100" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-emerald-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-emerald-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-emerald-100']} */ ;
    (__VLS_ctx.__('All students scored 5.0 or above!'));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "overflow-x-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
        ...{ class: "w-full text-left text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
        ...{ class: "border-b border-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "pb-2 font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.__('Student'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "pb-2 text-center font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.__('SBD'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "pb-2 text-right font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.__('Score'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "pb-2 text-right font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.__('Action'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({
        ...{ class: "divide-y divide-gray-50" },
    });
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-gray-50']} */ ;
    for (const [s] of __VLS_vFor((__VLS_ctx.stats.at_risk_students))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            key: (s.student_id),
            ...{ class: "group hover:bg-gray-50/80 transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-gray-50/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "py-2.5" },
        });
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-bold text-gray-700" },
        });
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
        (s.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[10px] text-gray-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        (s.student_id);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "py-2.5 text-center font-mono text-xs text-gray-500" },
        });
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        (s.sbd || '—');
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "py-2.5 text-right font-bold text-rose-600" },
        });
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-rose-600']} */ ;
        (s.score.toFixed(1));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "py-2.5 text-right" },
        });
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.statsResource.loading))
                        return;
                    if (!!(!__VLS_ctx.stats.at_risk_students?.length))
                        return;
                    __VLS_ctx.sendEmail(s.submission_id);
                    // @ts-ignore
                    [__, __, __, __, __, stats, stats, sendEmail,];
                } },
            ...{ class: "inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600 shadow-sm border border-rose-100 transition-all hover:bg-rose-100" },
            disabled: (__VLS_ctx.emailResource.loading),
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-rose-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-rose-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-rose-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-rose-100']} */ ;
        if (__VLS_ctx.emailResource.loading && __VLS_ctx.emailResource.params.submission === s.submission_id) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__('Send Email'));
        }
        // @ts-ignore
        [__, emailResource, emailResource, emailResource,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        type: { type: String, required: true },
        sessionSlug: { type: String, required: true },
    },
});
export default {};
