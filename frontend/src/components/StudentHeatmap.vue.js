/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource } from 'frappe-ui';
import { computed, inject, onMounted, ref, watch } from 'vue';
import ApexChart from 'vue3-apexcharts';
import { getColor } from '@/utils';
const user = inject('$user');
const labels = ref([]);
const memberName = ref(null);
const props = defineProps({
    member: {
        type: String,
    },
    days: {
        type: Number,
        default: 200,
    },
});
onMounted(() => {
    memberName.value = props.member || user.data?.name;
});
const heatmap = createResource({
    url: 'lms.lms.api.get_heatmap_data',
    makeParams(values) {
        return {
            member: values.member,
            base_days: props.days,
        };
    },
    auto: false,
    cache: ['heatmap', memberName.value],
});
watch(memberName, (newVal) => {
    heatmap.reload({
        member: newVal,
    }, {
        onSuccess(data) {
            labels.value = data.labels;
        },
    });
});
const chartOptions = computed(() => {
    return {
        chart: {
            type: 'heatmap',
            toolbar: {
                show: false,
            },
        },
        highlightOnHover: false,
        grid: {
            show: false,
        },
        plotOptions: {
            heatmap: {
                radius: 8,
                shadeIntensity: 0.2,
                enableShades: true,
                colorScale: {
                    ranges: [
                        { from: 0, to: 0, color: getColor('green', 400) },
                        { from: 1, to: 5, color: getColor('green', 200) },
                        { from: 6, to: 15, color: getColor('green', 500) },
                        { from: 16, to: 30, color: getColor('green', 700) },
                        { from: 31, to: 100, color: getColor('green', 800) },
                    ],
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            type: 'category',
            categories: labels.value,
            position: 'top',
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            tooltip: {
                enabled: false,
            },
        },
        yaxis: {
            type: 'category',
            categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            reversed: true,
            tooltip: {
                enabled: false,
            },
        },
        tooltip: {
            custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                return `<div class="text-xs bg-surface-gray-7 text-ink-white font-medium p-1">
					<div class="text-center">${heatmap.data.heatmap_data[seriesIndex].data[dataPointIndex].label}</div>
				</div>`;
            },
        },
    };
});
const chartSeries = computed(() => {
    if (!heatmap.data)
        return [];
    let series = heatmap.data.heatmap_data.map((row) => {
        return {
            name: row.name,
            data: row.data.map((value) => value.count),
        };
    });
    return series;
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
if (__VLS_ctx.heatmap.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold mb-2 text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.heatmap.data.total_activities);
    (__VLS_ctx.heatmap.data.total_activities > 1 ? __VLS_ctx.__('activities') : __VLS_ctx.__('activity'));
    (__VLS_ctx.__('in the last'));
    (__VLS_ctx.heatmap.data.weeks);
    (__VLS_ctx.__('weeks'));
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.ApexChart} */
    ApexChart;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        options: (__VLS_ctx.chartOptions),
        series: (__VLS_ctx.chartSeries),
        height: "240",
    }));
    const __VLS_2 = __VLS_1({
        options: (__VLS_ctx.chartOptions),
        series: (__VLS_ctx.chartSeries),
        height: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
// @ts-ignore
[heatmap, heatmap, heatmap, heatmap, __, __, __, __, chartOptions, chartSeries,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        member: {
            type: String,
        },
        days: {
            type: Number,
            default: 200,
        },
    },
});
export default {};
