/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, DonutChart, FormControl, ListView, NumberChart, } from 'frappe-ui';
import { computed, ref, watch } from 'vue';
import { getColor } from '@/utils';
const show = defineModel({ default: false });
const searchFilter = ref(null);
const props = defineProps();
const progressList = ref(props.programMembers || []);
const progressDistribution = computed(() => {
    const categories = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
    const distribution = categories.map((category) => {
        const [min, max] = category.slice(0, -1).split('-').map(Number);
        return {
            category,
            count: props.programMembers.filter((member) => {
                const progress = member.progress || 0;
                return progress >= min && progress < max;
            }).length,
        };
    });
    return distribution;
});
const averageProgress = computed(() => {
    if (props.programMembers.length === 0)
        return 0;
    const totalProgress = props.programMembers.reduce((sum, member) => sum + (member.progress || 0), 0);
    return totalProgress / props.programMembers.length;
});
watch(searchFilter, () => {
    if (searchFilter.value) {
        progressList.value = props.programMembers.filter((member) => member.full_name.toLowerCase().includes(searchFilter.value?.toLowerCase()));
    }
    else {
        progressList.value = props.programMembers;
    }
});
const progressColumns = computed(() => {
    return [
        {
            label: __('Member'),
            key: 'full_name',
            width: '50%',
        },
        {
            label: __('Progress (%)'),
            key: 'progress',
            align: 'right',
        },
    ];
});
const __VLS_defaultModels = {
    'modelValue': false,
};
let __VLS_modelEmit;
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Progress Summary for {0}').format(__VLS_ctx.programName),
        size: '2xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Progress Summary for {0}').format(__VLS_ctx.programName),
        size: '2xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between space-x-4 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        ...{ class: "border rounded-md w-full" },
        config: ({
            title: __VLS_ctx.__('Enrollments'),
            value: __VLS_ctx.programMembers.length || 0,
        }),
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "border rounded-md w-full" },
        config: ({
            title: __VLS_ctx.__('Enrollments'),
            value: __VLS_ctx.programMembers.length || 0,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
    NumberChart;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        ...{ class: "border rounded-md w-full" },
        config: ({
            title: __VLS_ctx.__('Average Progress %'),
            value: __VLS_ctx.averageProgress || 0,
        }),
    }));
    const __VLS_15 = __VLS_14({
        ...{ class: "border rounded-md w-full" },
        config: ({
            title: __VLS_ctx.__('Average Progress %'),
            value: __VLS_ctx.averageProgress || 0,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.DonutChart} */
    DonutChart;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        config: ({
            data: __VLS_ctx.progressDistribution || [],
            title: __VLS_ctx.__('Progress Distribution'),
            categoryColumn: 'category',
            valueColumn: 'count',
            colors: [
                __VLS_ctx.getColor('red', 400),
                __VLS_ctx.getColor('amber', 400),
                __VLS_ctx.getColor('pink', 400),
                __VLS_ctx.getColor('blue', 400),
                __VLS_ctx.getColor('green', 400),
            ],
        }),
    }));
    const __VLS_20 = __VLS_19({
        config: ({
            data: __VLS_ctx.progressDistribution || [],
            title: __VLS_ctx.__('Progress Distribution'),
            categoryColumn: 'category',
            valueColumn: 'count',
            colors: [
                __VLS_ctx.getColor('red', 400),
                __VLS_ctx.getColor('amber', 400),
                __VLS_ctx.getColor('pink', 400),
                __VLS_ctx.getColor('blue', 400),
                __VLS_ctx.getColor('green', 400),
            ],
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-10" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        modelValue: (__VLS_ctx.searchFilter),
        placeholder: (__VLS_ctx.__('Search by Member')),
        ...{ class: "mb-4" },
    }));
    const __VLS_25 = __VLS_24({
        modelValue: (__VLS_ctx.searchFilter),
        placeholder: (__VLS_ctx.__('Search by Member')),
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    if (__VLS_ctx.progressList.length) {
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.ListView} */
        ListView;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
            columns: (__VLS_ctx.progressColumns),
            rows: (__VLS_ctx.progressList),
            rowKey: "name",
            options: ({
                selectable: false,
                showTooltip: false,
            }),
        }));
        const __VLS_30 = __VLS_29({
            columns: (__VLS_ctx.progressColumns),
            rows: (__VLS_ctx.progressList),
            rowKey: "name",
            options: ({
                selectable: false,
                showTooltip: false,
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center text-gray-500" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        (__VLS_ctx.__('No members found.'));
    }
    // @ts-ignore
    [show, __, __, __, __, __, __, programName, programMembers, averageProgress, progressDistribution, getColor, getColor, getColor, getColor, getColor, searchFilter, progressList, progressList, progressColumns,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
