/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Button, createListResource, createResource, dayjs, ECharts, FormControl, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, ListRowItem, Select, Tooltip, } from 'frappe-ui';
import { computed, ref, watch } from 'vue';
import { Plus, Star } from 'lucide-vue-next';
import { formatAmount } from '@/utils';
import colors from '@/utils/frappe-ui-colors.json';
import CourseEnrollmentModal from '@/pages/Courses/CourseEnrollmentModal.vue';
import NumberChartGraph from '@/components/NumberChartGraph.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import StudentCourseProgress from '@/pages/Courses/StudentCourseProgress.vue';
const props = defineProps();
const showEnrollmentModal = ref(false);
const searchFilter = ref(null);
const showProgressModal = ref(false);
const currentStudent = ref(null);
const theme = ref(localStorage.getItem('theme') == 'dark' ? 'darkMode' : 'lightMode');
const chartDetails = createResource({
    url: 'lms.lms.api.get_course_progress_distribution',
    makeParams() {
        return {
            course: props.course.data?.name,
        };
    },
    auto: true,
});
const progressList = createListResource({
    doctype: 'LMS Enrollment',
    filters: {
        course: props.course.data?.name,
    },
    fields: [
        'name',
        'member',
        'member_name',
        'member_image',
        'member_username',
        'progress',
        'creation',
    ],
    pageLength: 100,
    auto: true,
    cache: ['courseProgress', props.course.data?.name],
});
const lessonProgress = createResource({
    url: 'lms.lms.api.get_lesson_completion_stats',
    params: {
        course: props.course.data?.name,
    },
    auto: true,
});
const updateLessonProgress = (value) => {
    if (value == 'completion_rate') {
        lessonProgress.data?.sort((a, b) => {
            const rateA = a.completion_count / (props.course.data?.enrollments || 1);
            const rateB = b.completion_count / (props.course.data?.enrollments || 1);
            return rateB - rateA;
        });
    }
    else if (value == 'index') {
        lessonProgress.data?.sort((a, b) => {
            return a.chapter_idx - b.chapter_idx || a.idx - b.idx;
        });
    }
};
watch([searchFilter], () => {
    let filterApplied = false;
    let filters = {
        course: props.course.data?.name,
    };
    if (searchFilter.value) {
        filters.member_name = ['like', `%${searchFilter.value}%`];
        filterApplied = true;
    }
    progressList.update({
        filters: filters,
    });
    progressList.reload();
});
const averageCompletionRate = computed(() => {
    let value = Math.ceil(chartDetails.data?.average_progress) || 0;
    return value + '%';
});
const progressColors = computed(() => {
    let colorList = [];
    colorList.push(colors[theme.value]['red'][400]);
    colorList.push(colors[theme.value]['amber'][400]);
    colorList.push(colors[theme.value]['blue'][400]);
    colorList.push(colors[theme.value]['green'][400]);
    return colorList;
});
const progressColumns = computed(() => {
    return [
        {
            label: __('Name'),
            key: 'member_name',
            width: '40%',
        },
        {
            label: __('Progress'),
            key: 'progress',
            width: '30%',
        },
        {
            label: __('Start Date'),
            key: 'creation',
            align: 'right',
        },
    ];
});
const lessonProgressSortingOptions = [
    {
        label: __('Lesson Index'),
        value: 'index',
        onClick() {
            updateLessonProgress('index');
        },
    },
    {
        label: __('Completion Rate'),
        value: 'completion_rate',
        onClick() {
            updateLessonProgress('completion_rate');
        },
    },
];
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
    ...{ class: "p-5" },
});
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-4 gap-5 mb-5" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
const __VLS_0 = NumberChartGraph;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: (__VLS_ctx.__('Enrolled')),
    value: (__VLS_ctx.formatAmount(__VLS_ctx.course.data?.enrollments)),
}));
const __VLS_2 = __VLS_1({
    title: (__VLS_ctx.__('Enrolled')),
    value: (__VLS_ctx.formatAmount(__VLS_ctx.course.data?.enrollments)),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_5 = NumberChartGraph;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    title: (__VLS_ctx.__('Average Completion Rate')),
    value: (__VLS_ctx.averageCompletionRate),
}));
const __VLS_7 = __VLS_6({
    title: (__VLS_ctx.__('Average Completion Rate')),
    value: (__VLS_ctx.averageCompletionRate),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const __VLS_10 = NumberChartGraph || NumberChartGraph;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    title: (__VLS_ctx.__('Average Rating')),
    value: (__VLS_ctx.course.data?.rating || 0),
}));
const __VLS_12 = __VLS_11({
    title: (__VLS_ctx.__('Average Rating')),
    value: (__VLS_ctx.course.data?.rating || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const { default: __VLS_15 } = __VLS_13.slots;
{
    const { prefix: __VLS_16 } = __VLS_13.slots;
    let __VLS_17;
    /** @ts-ignore @type { | typeof __VLS_components.Star} */
    Star;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        ...{ class: "size-5 text-transparent fill-amber-500" },
    }));
    const __VLS_19 = __VLS_18({
        ...{ class: "size-5 text-transparent fill-amber-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['fill-amber-500']} */ ;
    // @ts-ignore
    [__, __, __, formatAmount, course, course, averageCompletionRate,];
}
// @ts-ignore
[];
var __VLS_13;
const __VLS_22 = NumberChartGraph;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
    title: (__VLS_ctx.__('Lessons')),
    value: (__VLS_ctx.course.data?.lessons),
}));
const __VLS_24 = __VLS_23({
    title: (__VLS_ctx.__('Lessons')),
    value: (__VLS_ctx.course.data?.lessons),
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-[2fr_1fr] gap-5 items-start" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-[2fr_1fr]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
if (__VLS_ctx.course.data?.enrollments) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border rounded-lg py-3 px-4" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg text-ink-gray-9 font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.__('Students'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    let __VLS_27;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        modelValue: (__VLS_ctx.searchFilter),
        placeholder: (__VLS_ctx.__('Search by name')),
        type: "text",
    }));
    const __VLS_29 = __VLS_28({
        modelValue: (__VLS_ctx.searchFilter),
        placeholder: (__VLS_ctx.__('Search by name')),
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_32;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_37;
    const __VLS_38 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.course.data?.enrollments))
                    return;
                __VLS_ctx.showEnrollmentModal = true;
                // @ts-ignore
                [__, __, __, course, course, searchFilter, showEnrollmentModal,];
            } });
    const { default: __VLS_39 } = __VLS_35.slots;
    {
        const { prefix: __VLS_40 } = __VLS_35.slots;
        let __VLS_41;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
            ...{ class: "size-4 stroke-1.5" },
        }));
        const __VLS_43 = __VLS_42({
            ...{ class: "size-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Enroll'));
    // @ts-ignore
    [__,];
    var __VLS_35;
    var __VLS_36;
    if (__VLS_ctx.progressList.loading || __VLS_ctx.progressList.data?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "max-h-[63vh] overflow-y-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['max-h-[63vh]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
        ListView;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            columns: (__VLS_ctx.progressColumns),
            rows: (__VLS_ctx.progressList.data),
            rowKey: "name",
            options: ({
                selectable: false,
                showTooltip: false,
            }),
        }));
        const __VLS_48 = __VLS_47({
            columns: (__VLS_ctx.progressColumns),
            rows: (__VLS_ctx.progressList.data),
            rowKey: "name",
            options: ({
                selectable: false,
                showTooltip: false,
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        const { default: __VLS_51 } = __VLS_49.slots;
        let __VLS_52;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
        ListHeader;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-white border-b rounded-none p-2" },
        }));
        const __VLS_54 = __VLS_53({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-white border-b rounded-none p-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        const { default: __VLS_57 } = __VLS_55.slots;
        for (const [item] of __VLS_vFor((__VLS_ctx.progressColumns))) {
            let __VLS_58;
            /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
            ListHeaderItem;
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                item: (item),
                key: (item.key),
            }));
            const __VLS_60 = __VLS_59({
                item: (item),
                key: (item.key),
            }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            // @ts-ignore
            [progressList, progressList, progressList, progressColumns, progressColumns,];
        }
        // @ts-ignore
        [];
        var __VLS_55;
        for (const [row] of __VLS_vFor((__VLS_ctx.progressList.data))) {
            let __VLS_63;
            /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
            ListRows;
            // @ts-ignore
            const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
                ...{ class: "max-h-[500px]" },
            }));
            const __VLS_65 = __VLS_64({
                ...{ class: "max-h-[500px]" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_64));
            /** @type {__VLS_StyleScopedClasses['max-h-[500px]']} */ ;
            const { default: __VLS_68 } = __VLS_66.slots;
            let __VLS_69;
            /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
            ListRow;
            // @ts-ignore
            const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
                ...{ 'onClick': {} },
                row: (row),
                ...{ class: "cursor-pointer" },
            }));
            const __VLS_71 = __VLS_70({
                ...{ 'onClick': {} },
                row: (row),
                ...{ class: "cursor-pointer" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_70));
            let __VLS_74;
            const __VLS_75 = ({ click: {} },
                { onClick: (() => {
                        __VLS_ctx.showProgressModal = true;
                        __VLS_ctx.currentStudent = row;
                    }) });
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            const { default: __VLS_76 } = __VLS_72.slots;
            {
                const { default: __VLS_77 } = __VLS_72.slots;
                const [{ column, item }] = __VLS_vSlot(__VLS_77);
                let __VLS_78;
                /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
                ListRowItem;
                // @ts-ignore
                const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
                    item: (row[column.key]),
                    align: (column.align),
                    ...{ class: "w-full" },
                }));
                const __VLS_80 = __VLS_79({
                    item: (row[column.key]),
                    align: (column.align),
                    ...{ class: "w-full" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_79));
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                const { default: __VLS_83 } = __VLS_81.slots;
                {
                    const { prefix: __VLS_84 } = __VLS_81.slots;
                    if (column.key == 'member_name') {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                        let __VLS_85;
                        /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
                        Avatar;
                        // @ts-ignore
                        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
                            ...{ class: "flex items-center" },
                            image: (row['member_image']),
                            label: (item),
                            size: "sm",
                        }));
                        const __VLS_87 = __VLS_86({
                            ...{ class: "flex items-center" },
                            image: (row['member_image']),
                            label: (item),
                            size: "sm",
                        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
                        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    }
                    else if (column.key == 'progress') {
                        const __VLS_90 = ProgressBar;
                        // @ts-ignore
                        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
                            progress: (Math.ceil(row[column.key])),
                            ...{ class: "!mx-0 !mr-4" },
                        }));
                        const __VLS_92 = __VLS_91({
                            progress: (Math.ceil(row[column.key])),
                            ...{ class: "!mx-0 !mr-4" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
                        /** @type {__VLS_StyleScopedClasses['!mx-0']} */ ;
                        /** @type {__VLS_StyleScopedClasses['!mr-4']} */ ;
                    }
                    // @ts-ignore
                    [progressList, showProgressModal, currentStudent,];
                }
                if (column.key == 'creation') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    (__VLS_ctx.dayjs(row[column.key]).format('DD MMM YYYY'));
                }
                else if (column.key == 'progress') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "text-xs !mx-0 w-5" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['!mx-0']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                    (Math.ceil(row[column.key]));
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    (row[column.key].toString());
                }
                // @ts-ignore
                [dayjs,];
                var __VLS_81;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_72;
            var __VLS_73;
            // @ts-ignore
            [];
            var __VLS_66;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_49;
        if (__VLS_ctx.progressList.data && __VLS_ctx.progressList.hasNextPage) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-center my-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['my-3']} */ ;
            let __VLS_95;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
                ...{ 'onClick': {} },
            }));
            const __VLS_97 = __VLS_96({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_96));
            let __VLS_100;
            const __VLS_101 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.course.data?.enrollments))
                            return;
                        if (!(__VLS_ctx.progressList.loading || __VLS_ctx.progressList.data?.length))
                            return;
                        if (!(__VLS_ctx.progressList.data && __VLS_ctx.progressList.hasNextPage))
                            return;
                        __VLS_ctx.progressList.next();
                        // @ts-ignore
                        [progressList, progressList, progressList,];
                    } });
            const { default: __VLS_102 } = __VLS_98.slots;
            (__VLS_ctx.__('Load More'));
            // @ts-ignore
            [__,];
            var __VLS_98;
            var __VLS_99;
        }
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
if (__VLS_ctx.chartDetails.data?.average_progress > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border rounded-lg p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-5 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    (__VLS_ctx.__('Progress Summary'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-[2fr_1fr] items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-[2fr_1fr]']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col space-y-4 flex-1 text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    for (const [row] of __VLS_vFor((__VLS_ctx.chartDetails.data?.progress_distribution))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "size-2 rounded" },
            ...{ style: ({
                    backgroundColor: __VLS_ctx.colors[__VLS_ctx.theme][row.name.startsWith('Just')
                        ? 'red'
                        : row.name.startsWith('In')
                            ? 'amber'
                            : row.name.startsWith('Adv')
                                ? 'blue'
                                : 'green'][400],
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['size-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        let __VLS_103;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
            text: (row.name.split('(')[1].replace(')', '')),
        }));
        const __VLS_105 = __VLS_104({
            text: (row.name.split('(')[1].replace(')', '')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_104));
        const { default: __VLS_108 } = __VLS_106.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ml-2" },
        });
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        (row.name.split('(')[0]);
        // @ts-ignore
        [__, chartDetails, chartDetails, colors, theme,];
        var __VLS_106;
        let __VLS_109;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
            text: (row.value),
        }));
        const __VLS_111 = __VLS_110({
            text: (row.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        const { default: __VLS_114 } = __VLS_112.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ml-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        (Math.round((row.value / __VLS_ctx.course.data?.enrollments) * 100));
        // @ts-ignore
        [course,];
        var __VLS_112;
        // @ts-ignore
        [];
    }
    let __VLS_115;
    /** @ts-ignore @type { | typeof __VLS_components.ECharts} */
    ECharts;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
        ...{ class: "w-40 h-20" },
        options: ({
            color: __VLS_ctx.progressColors,
            series: [
                {
                    type: 'pie',
                    radius: ['50%', '70%'],
                    center: ['50%', '50%'],
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                    emphasis: {
                        label: {
                            show: false,
                        },
                        scale: false,
                    },
                    legend: {
                        show: false,
                    },
                    data: __VLS_ctx.chartDetails.data?.progress_distribution || [],
                },
            ],
            showInlineLabels: false,
        }),
    }));
    const __VLS_117 = __VLS_116({
        ...{ class: "w-40 h-20" },
        options: ({
            color: __VLS_ctx.progressColors,
            series: [
                {
                    type: 'pie',
                    radius: ['50%', '70%'],
                    center: ['50%', '50%'],
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                    emphasis: {
                        label: {
                            show: false,
                        },
                        scale: false,
                    },
                    legend: {
                        show: false,
                    },
                    data: __VLS_ctx.chartDetails.data?.progress_distribution || [],
                },
            ],
            showInlineLabels: false,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    /** @type {__VLS_StyleScopedClasses['w-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-20']} */ ;
}
if (__VLS_ctx.lessonProgress.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border rounded-lg pt-4 px-4" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Lesson Completion'));
    let __VLS_120;
    /** @ts-ignore @type { | typeof __VLS_components.Select} */
    Select;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
        ...{ 'onUpdate:modelValue': {} },
        options: (__VLS_ctx.lessonProgressSortingOptions),
        placeholder: (__VLS_ctx.__('Sort by')),
        ...{ class: "!w-32" },
    }));
    const __VLS_122 = __VLS_121({
        ...{ 'onUpdate:modelValue': {} },
        options: (__VLS_ctx.lessonProgressSortingOptions),
        placeholder: (__VLS_ctx.__('Sort by')),
        ...{ class: "!w-32" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_125;
    const __VLS_126 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': ((value) => __VLS_ctx.updateLessonProgress(value)) });
    /** @type {__VLS_StyleScopedClasses['!w-32']} */ ;
    var __VLS_123;
    var __VLS_124;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "divide-y max-h-[43vh] text-ink-gray-7 overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[43vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    for (const [progress] of __VLS_vFor((__VLS_ctx.lessonProgress.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between text-sm py-2 my-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "" },
        });
        /** @type {__VLS_StyleScopedClasses['']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mr-3 text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        (progress.chapter_idx);
        (progress.idx);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (progress.title);
        let __VLS_127;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
            text: (progress.completion_count),
        }));
        const __VLS_129 = __VLS_128({
            text: (progress.completion_count),
        }, ...__VLS_functionalComponentArgsRest(__VLS_128));
        const { default: __VLS_132 } = __VLS_130.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (Math.ceil((progress.completion_count / __VLS_ctx.course.data?.enrollments) *
            100));
        // @ts-ignore
        [__, __, course, chartDetails, progressColors, lessonProgress, lessonProgress, lessonProgressSortingOptions, updateLessonProgress,];
        var __VLS_130;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.showEnrollmentModal) {
    const __VLS_133 = CourseEnrollmentModal;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
        modelValue: (__VLS_ctx.showEnrollmentModal),
        course: (__VLS_ctx.course),
    }));
    const __VLS_135 = __VLS_134({
        modelValue: (__VLS_ctx.showEnrollmentModal),
        course: (__VLS_ctx.course),
    }, ...__VLS_functionalComponentArgsRest(__VLS_134));
}
if (__VLS_ctx.showProgressModal) {
    const __VLS_138 = StudentCourseProgress;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
        modelValue: (__VLS_ctx.showProgressModal),
        course: (__VLS_ctx.course),
        student: (__VLS_ctx.currentStudent),
        lessons: (__VLS_ctx.lessonProgress),
    }));
    const __VLS_140 = __VLS_139({
        modelValue: (__VLS_ctx.showProgressModal),
        course: (__VLS_ctx.course),
        student: (__VLS_ctx.currentStudent),
        lessons: (__VLS_ctx.lessonProgress),
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
}
// @ts-ignore
[course, course, showEnrollmentModal, showEnrollmentModal, showProgressModal, showProgressModal, currentStudent, lessonProgress,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
