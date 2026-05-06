/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { AxisChart, Breadcrumbs, createResource, DonutChart, NumberChart, Tooltip, usePageMeta, } from 'frappe-ui';
import { computed } from 'vue';
import { sessionStore } from '../stores/session';
const { brand } = sessionStore();
const breadcrumbs = computed(() => {
    return [
        {
            label: __('Statistics'),
            route: {
                name: 'Statistics',
            },
        },
    ];
});
const chartDetails = createResource({
    url: 'lms.lms.api.get_chart_details',
    method: 'GET',
    cache: ['statistics'],
    auto: true,
});
const signupsChart = createResource({
    url: 'lms.lms.utils.get_chart_data',
    method: 'GET',
    params: {
        chart_name: 'New Signups',
    },
    auto: true,
    transform(data) {
        return data.map((item) => {
            return {
                date: new Date(item.date),
                signups: item.count,
            };
        });
    },
});
const enrollmentChart = createResource({
    url: 'lms.lms.utils.get_chart_data',
    method: 'GET',
    cache: ['enrollments'],
    params: {
        chart_name: 'Course Enrollments',
    },
    auto: true,
    transform(data) {
        return data.map((item) => {
            return {
                date: new Date(item.date),
                enrollments: item.count,
            };
        });
    },
});
const certification = createResource({
    url: 'lms.lms.utils.get_chart_data',
    method: 'GET',
    cache: ['certifications'],
    params: {
        chart_name: 'Certification',
    },
    auto: true,
    transform(data) {
        return data.map((item) => {
            return {
                date: new Date(item.date),
                certifications: item.count,
            };
        });
    },
});
const courseCompletion = createResource({
    url: 'lms.lms.utils.get_course_completion_data',
    method: 'GET',
    auto: true,
    cache: ['courseCompletion'],
});
usePageMeta(() => {
    return {
        title: __('Statistics'),
        icon: brand.favicon,
    };
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "" },
});
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-5']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Breadcrumbs} */
Breadcrumbs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "h-7" },
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-7" },
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
if (__VLS_ctx.chartDetails.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        text: (__VLS_ctx.__('Published Courses')),
    }));
    const __VLS_7 = __VLS_6({
        text: (__VLS_ctx.__('Published Courses')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const { default: __VLS_10 } = __VLS_8.slots;
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({ title: __VLS_ctx.__('Courses'), value: __VLS_ctx.chartDetails.data.courses }),
    }));
    const __VLS_13 = __VLS_12({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({ title: __VLS_ctx.__('Courses'), value: __VLS_ctx.chartDetails.data.courses }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    // @ts-ignore
    [breadcrumbs, chartDetails, chartDetails, __, __,];
    var __VLS_8;
    let __VLS_16;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        text: (__VLS_ctx.__('Active Members')),
    }));
    const __VLS_18 = __VLS_17({
        text: (__VLS_ctx.__('Active Members')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const { default: __VLS_21 } = __VLS_19.slots;
    let __VLS_22;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({ title: __VLS_ctx.__('Signups'), value: __VLS_ctx.chartDetails.data.users }),
    }));
    const __VLS_24 = __VLS_23({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({ title: __VLS_ctx.__('Signups'), value: __VLS_ctx.chartDetails.data.users }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    // @ts-ignore
    [chartDetails, __, __,];
    var __VLS_19;
    let __VLS_27;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        text: (__VLS_ctx.__('Course Enrollments')),
    }));
    const __VLS_29 = __VLS_28({
        text: (__VLS_ctx.__('Course Enrollments')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    const { default: __VLS_32 } = __VLS_30.slots;
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({
            title: __VLS_ctx.__('Enrollments'),
            value: __VLS_ctx.chartDetails.data.enrollments,
        }),
    }));
    const __VLS_35 = __VLS_34({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({
            title: __VLS_ctx.__('Enrollments'),
            value: __VLS_ctx.chartDetails.data.enrollments,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    // @ts-ignore
    [chartDetails, __, __,];
    var __VLS_30;
    let __VLS_38;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        text: (__VLS_ctx.__('Course Completions')),
    }));
    const __VLS_40 = __VLS_39({
        text: (__VLS_ctx.__('Course Completions')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    const { default: __VLS_43 } = __VLS_41.slots;
    let __VLS_44;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({
            title: __VLS_ctx.__('Completions'),
            value: __VLS_ctx.chartDetails.data.completions,
        }),
    }));
    const __VLS_46 = __VLS_45({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({
            title: __VLS_ctx.__('Completions'),
            value: __VLS_ctx.chartDetails.data.completions,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    // @ts-ignore
    [chartDetails, __, __,];
    var __VLS_41;
    let __VLS_49;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        text: (__VLS_ctx.__('Certified Members')),
    }));
    const __VLS_51 = __VLS_50({
        text: (__VLS_ctx.__('Certified Members')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    const { default: __VLS_54 } = __VLS_52.slots;
    let __VLS_55;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({
            title: __VLS_ctx.__('Certifications'),
            value: __VLS_ctx.chartDetails.data.certifications,
        }),
    }));
    const __VLS_57 = __VLS_56({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        config: ({
            title: __VLS_ctx.__('Certifications'),
            value: __VLS_ctx.chartDetails.data.certifications,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    // @ts-ignore
    [chartDetails, __, __,];
    var __VLS_52;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 min-h-72 p-2" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-72']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    if (__VLS_ctx.signupsChart.data) {
        let __VLS_60;
        /** @ts-ignore @type { | typeof __VLS_components.AxisChart} */
        AxisChart;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
            config: ({
                data: __VLS_ctx.signupsChart.data,
                title: __VLS_ctx.__('Signups'),
                subtitle: __VLS_ctx.__('Signups per day'),
                xAxis: {
                    key: 'date',
                    type: 'time',
                    title: __VLS_ctx.__('Date'),
                    timeGrain: 'day',
                },
                yAxis: {
                    title: __VLS_ctx.__('Signups'),
                },
                series: [{ name: 'signups', type: 'line', showDataPoints: true }],
            }),
        }));
        const __VLS_62 = __VLS_61({
            config: ({
                data: __VLS_ctx.signupsChart.data,
                title: __VLS_ctx.__('Signups'),
                subtitle: __VLS_ctx.__('Signups per day'),
                xAxis: {
                    key: 'date',
                    type: 'time',
                    title: __VLS_ctx.__('Date'),
                    timeGrain: 'day',
                },
                yAxis: {
                    title: __VLS_ctx.__('Signups'),
                },
                series: [{ name: 'signups', type: 'line', showDataPoints: true }],
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 min-h-72 p-2" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-72']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    if (__VLS_ctx.enrollmentChart.data) {
        let __VLS_65;
        /** @ts-ignore @type { | typeof __VLS_components.AxisChart} */
        AxisChart;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
            config: ({
                data: __VLS_ctx.enrollmentChart.data,
                title: __VLS_ctx.__('Enrollments'),
                subtitle: __VLS_ctx.__('Enrollments per day'),
                xAxis: {
                    key: 'date',
                    type: 'time',
                    title: __VLS_ctx.__('Date'),
                    timeGrain: 'day',
                },
                yAxis: {
                    title: __VLS_ctx.__('Enrollments'),
                },
                series: [
                    { name: 'enrollments', type: 'line', showDataPoints: true },
                ],
            }),
        }));
        const __VLS_67 = __VLS_66({
            config: ({
                data: __VLS_ctx.enrollmentChart.data,
                title: __VLS_ctx.__('Enrollments'),
                subtitle: __VLS_ctx.__('Enrollments per day'),
                xAxis: {
                    key: 'date',
                    type: 'time',
                    title: __VLS_ctx.__('Date'),
                    timeGrain: 'day',
                },
                yAxis: {
                    title: __VLS_ctx.__('Enrollments'),
                },
                series: [
                    { name: 'enrollments', type: 'line', showDataPoints: true },
                ],
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-2" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    if (__VLS_ctx.certification.data) {
        let __VLS_70;
        /** @ts-ignore @type { | typeof __VLS_components.AxisChart} */
        AxisChart;
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
            config: ({
                data: __VLS_ctx.certification.data,
                title: __VLS_ctx.__('Certifications'),
                subtitle: __VLS_ctx.__('Certifications per day'),
                xAxis: {
                    key: 'date',
                    type: 'time',
                    title: __VLS_ctx.__('Date'),
                    timeGrain: 'day',
                },
                yAxis: {
                    title: __VLS_ctx.__('Certifications'),
                },
                series: [
                    {
                        name: 'certifications',
                        type: 'line',
                        showDataPoints: true,
                    },
                ],
            }),
        }));
        const __VLS_72 = __VLS_71({
            config: ({
                data: __VLS_ctx.certification.data,
                title: __VLS_ctx.__('Certifications'),
                subtitle: __VLS_ctx.__('Certifications per day'),
                xAxis: {
                    key: 'date',
                    type: 'time',
                    title: __VLS_ctx.__('Date'),
                    timeGrain: 'day',
                },
                yAxis: {
                    title: __VLS_ctx.__('Certifications'),
                },
                series: [
                    {
                        name: 'certifications',
                        type: 'line',
                        showDataPoints: true,
                    },
                ],
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-2" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    if (__VLS_ctx.courseCompletion.data) {
        let __VLS_75;
        /** @ts-ignore @type { | typeof __VLS_components.DonutChart} */
        DonutChart;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
            config: ({
                data: __VLS_ctx.courseCompletion.data,
                title: __VLS_ctx.__('Completions'),
                subtitle: __VLS_ctx.__('Course Completion'),
                categoryColumn: 'label',
                valueColumn: 'value',
            }),
        }));
        const __VLS_77 = __VLS_76({
            config: ({
                data: __VLS_ctx.courseCompletion.data,
                title: __VLS_ctx.__('Completions'),
                subtitle: __VLS_ctx.__('Course Completion'),
                categoryColumn: 'label',
                valueColumn: 'value',
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    }
}
// @ts-ignore
[__, __, __, __, __, __, __, __, __, __, __, __, __, __, signupsChart, signupsChart, enrollmentChart, enrollmentChart, certification, certification, courseCompletion, courseCompletion,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
