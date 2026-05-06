/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, createListResource, Dialog, NumberChart, TabButtons, } from 'frappe-ui';
import { computed, ref, watch } from 'vue';
import { enablePlyr, formatTimestamp } from '@/utils';
import VideoBlock from '@/components/VideoBlock.vue';
const show = defineModel();
const currentTab = ref('');
const searchText = ref('');
const props = defineProps();
const statistics = createListResource({
    doctype: 'LMS Video Watch Duration',
    filters: {
        lesson: props.lessonName,
    },
    fields: [
        'name',
        'member',
        'member_name',
        'member_image',
        'member_username',
        'source',
        'watch_time',
    ],
    cache: ['videoStatistics', props.lessonName],
    onSuccess() {
        currentTab.value = Object.keys(statisticsData.value)[0];
    },
});
watch(() => props.lessonName, () => {
    if (props.lessonName) {
        statistics.filters.lesson = props.lessonName;
        statistics.reload();
    }
});
watch(searchText, () => {
    let filterApplied = false;
    let filters = {
        lesson: props.lessonName,
    };
    if (searchText.value) {
        filters.member_name = ['like', `%${searchText.value}%`];
        filterApplied = true;
    }
    statistics.update({
        filters: filters,
    });
    statistics.reload({});
});
watch(show, () => {
    if (show.value) {
        enablePlyr();
    }
});
const statisticsData = computed(() => {
    const grouped = {};
    statistics.data.forEach((item) => {
        if (!grouped[item.source]) {
            grouped[item.source] = [];
        }
        grouped[item.source].push(item);
    });
    return grouped;
});
const averageWatchTime = computed(() => {
    let totalWatchTime = 0;
    currentTabData.value.forEach((item) => {
        totalWatchTime += parseFloat(item.watch_time);
    });
    return formatTimestamp(totalWatchTime / currentTabData.value.length);
});
const currentTabData = computed(() => {
    return statisticsData.value[currentTab.value] || [];
});
const isPlyrSource = computed(() => {
    return (currentTab.value.includes('youtube') || currentTab.value.includes('vimeo'));
});
const provider = computed(() => {
    if (currentTab.value.includes('youtube')) {
        return 'youtube';
    }
    else if (currentTab.value.includes('vimeo')) {
        return 'vimeo';
    }
    return '';
});
const embedURL = computed(() => {
    if (isPlyrSource.value) {
        return currentTab.value.replace('watch?v=', 'embed/');
    }
    return '';
});
const tabs = computed(() => {
    return Object.keys(statisticsData.value).map((source, index) => ({
        label: __(`Video ${index + 1}`),
        value: source,
    }));
});
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
        size: '4xl',
        title: __VLS_ctx.__('Video Statistics for {0}').format(__VLS_ctx.lessonTitle),
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '4xl',
        title: __VLS_ctx.__('Video Statistics for {0}').format(__VLS_ctx.lessonTitle),
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
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    if (__VLS_ctx.tabs.length > 1) {
        let __VLS_8;
        /** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
        TabButtons;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            buttons: (__VLS_ctx.tabs),
            modelValue: (__VLS_ctx.currentTab),
            ...{ class: "w-fit" },
        }));
        const __VLS_10 = __VLS_9({
            buttons: (__VLS_ctx.tabs),
            modelValue: (__VLS_ctx.currentTab),
            ...{ class: "w-fit" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    }
    if (__VLS_ctx.currentTab) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-[55%,40%] gap-5" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-[55%,40%]']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-5 border rounded-md p-2 pt-4 h-[70vh] overflow-y-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-[70vh]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-[70%,30%] text-sm text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-[70%,30%]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "px-4" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        (__VLS_ctx.__('Member'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        (__VLS_ctx.__('Watch Time'));
        for (const [row] of __VLS_vFor((__VLS_ctx.currentTabData))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "hover:bg-surface-gray-1 cursor-pointer rounded-md py-1 px-2" },
            });
            /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            let __VLS_13;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                to: ({
                    name: 'Profile',
                    params: { username: row.member_username },
                }),
            }));
            const __VLS_15 = __VLS_14({
                to: ({
                    name: 'Profile',
                    params: { username: row.member_username },
                }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            const { default: __VLS_18 } = __VLS_16.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-[70%,30%] items-center" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-[70%,30%]']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            let __VLS_19;
            /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
            Avatar;
            // @ts-ignore
            const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                image: (row.member_image),
                label: (row.member_name),
                size: "xl",
            }));
            const __VLS_21 = __VLS_20({
                image: (row.member_image),
                label: (row.member_name),
                size: "xl",
            }, ...__VLS_functionalComponentArgsRest(__VLS_20));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-1" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (row.member_name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-sm text-ink-gray-6" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
            (row.member);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-center text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (__VLS_ctx.formatTimestamp(row.watch_time));
            // @ts-ignore
            [show, __, __, __, lessonTitle, tabs, tabs, currentTab, currentTab, currentTabData, formatTimestamp,];
            var __VLS_16;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-5" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.NumberChart} */
        NumberChart;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            ...{ class: "border rounded-md" },
            config: ({
                title: __VLS_ctx.__('Average Watch Time'),
                value: __VLS_ctx.averageWatchTime,
            }),
        }));
        const __VLS_26 = __VLS_25({
            ...{ class: "border rounded-md" },
            config: ({
                title: __VLS_ctx.__('Average Watch Time'),
                value: __VLS_ctx.averageWatchTime,
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        if (__VLS_ctx.isPlyrSource) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "video-player" },
                src: (__VLS_ctx.currentTab),
            });
            /** @type {__VLS_StyleScopedClasses['video-player']} */ ;
        }
        else {
            const __VLS_29 = VideoBlock;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                file: (__VLS_ctx.currentTab),
            }));
            const __VLS_31 = __VLS_30({
                file: (__VLS_ctx.currentTab),
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (__VLS_ctx.__('No statistics available for this video.'));
    }
    // @ts-ignore
    [__, __, currentTab, currentTab, averageWatchTime, isPlyrSource,];
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
