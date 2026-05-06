/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { AxisChart, createResource, NumberChart } from 'frappe-ui';
import { computed } from 'vue';
const props = defineProps();
const studentCount = createResource({
    url: 'frappe.client.get_count',
    cache: ['batch_student_count', props.batch?.data?.name],
    params: {
        doctype: 'LMS Batch Enrollment',
        filters: { batch: props.batch?.data?.name },
    },
    auto: true,
});
const assessmentCount = createResource({
    url: 'lms.lms.utils.get_batch_assessment_count',
    cache: ['batch_assessment_count', props.batch?.data?.name],
    params: {
        batch: props.batch?.data?.name,
    },
    auto: true,
});
const chartData = createResource({
    url: 'lms.lms.utils.get_batch_chart_data',
    cache: ['batch_chart_data', props.batch?.data?.name],
    params: { batch: props.batch?.data?.name },
    auto: true,
});
const certificationCount = createResource({
    url: 'frappe.client.get_count',
    cache: ['batch_certificate_count', props.batch?.data?.name],
    params: {
        doctype: 'LMS Certificate',
        filters: { batch_name: props.batch?.data?.name },
    },
    auto: true,
});
const filteredChartData = computed(() => (chartData.data || []).filter((item) => item.value > 0));
const showProgressChart = computed(() => studentCount.data &&
    (props.batch?.data?.courses?.length || assessmentCount.data));
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.batch?.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full flex items-center justify-between pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-medium text-ink-gray-7" },
    });
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    (__VLS_ctx.__('Statistics'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 md:grid-cols-4 gap-5 mb-8" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "border rounded-md" },
        config: ({ title: __VLS_ctx.__('Students'), value: __VLS_ctx.studentCount.data || 0 }),
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "border rounded-md" },
        config: ({ title: __VLS_ctx.__('Students'), value: __VLS_ctx.studentCount.data || 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ class: "border rounded-md" },
        config: ({
            title: __VLS_ctx.__('Certified'),
            value: __VLS_ctx.certificationCount.data || 0,
        }),
    }));
    const __VLS_7 = __VLS_6({
        ...{ class: "border rounded-md" },
        config: ({
            title: __VLS_ctx.__('Certified'),
            value: __VLS_ctx.certificationCount.data || 0,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        ...{ class: "border rounded-md" },
        config: ({
            title: __VLS_ctx.__('Courses'),
            value: __VLS_ctx.batch?.data?.courses?.length || 0,
        }),
    }));
    const __VLS_12 = __VLS_11({
        ...{ class: "border rounded-md" },
        config: ({
            title: __VLS_ctx.__('Courses'),
            value: __VLS_ctx.batch?.data?.courses?.length || 0,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    let __VLS_15;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        ...{ class: "border rounded-md" },
        config: ({ title: __VLS_ctx.__('Assessments'), value: __VLS_ctx.assessmentCount.data || 0 }),
    }));
    const __VLS_17 = __VLS_16({
        ...{ class: "border rounded-md" },
        config: ({ title: __VLS_ctx.__('Assessments'), value: __VLS_ctx.assessmentCount.data || 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    if (__VLS_ctx.showProgressChart) {
        let __VLS_20;
        /** @ts-ignore @type { | typeof __VLS_components.AxisChart} */
        AxisChart;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            ...{ class: "border rounded-lg p-3 min-h-[300px]" },
            config: ({
                data: __VLS_ctx.filteredChartData,
                title: __VLS_ctx.__('Batch Summary'),
                subtitle: __VLS_ctx.__('Progress of students in courses and assessments'),
                xAxis: {
                    key: 'task',
                    title: __VLS_ctx.__('Tasks'),
                    type: 'category',
                },
                yAxis: {
                    title: __VLS_ctx.__('Number of Students'),
                    echartOptions: {
                        minInterval: 1,
                    },
                },
                swapXY: true,
                series: [
                    {
                        name: 'value',
                        type: 'bar',
                    },
                ],
            }),
        }));
        const __VLS_22 = __VLS_21({
            ...{ class: "border rounded-lg p-3 min-h-[300px]" },
            config: ({
                data: __VLS_ctx.filteredChartData,
                title: __VLS_ctx.__('Batch Summary'),
                subtitle: __VLS_ctx.__('Progress of students in courses and assessments'),
                xAxis: {
                    key: 'task',
                    title: __VLS_ctx.__('Tasks'),
                    type: 'category',
                },
                yAxis: {
                    title: __VLS_ctx.__('Number of Students'),
                    echartOptions: {
                        minInterval: 1,
                    },
                },
                swapXY: true,
                series: [
                    {
                        name: 'value',
                        type: 'bar',
                    },
                ],
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[300px]']} */ ;
    }
}
// @ts-ignore
[batch, batch, __, __, __, __, __, __, __, __, __, studentCount, certificationCount, assessmentCount, showProgressChart, filteredChartData,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
