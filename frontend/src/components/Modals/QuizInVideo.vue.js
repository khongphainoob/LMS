/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, Button, FormControl, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, ListRowItem, ListSelectBanner, toast, } from 'frappe-ui';
import { computed, reactive, ref, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import { formatTimestamp } from '@/utils';
import Link from '@/components/Controls/Link.vue';
const show = defineModel();
const allQuizzes = ref([]);
const quiz = reactive({
    time: '',
    quiz: '',
});
const props = defineProps({
    quizzes: {
        type: Array,
        default: () => [],
    },
    saveQuizzes: {
        type: Function,
        required: true,
    },
    duration: {
        type: Number,
        default: 0,
    },
});
const addQuiz = () => {
    quiz.time = `${getTimeInSeconds()}`;
    if (!isTimeValid() || !isFormComplete())
        return;
    allQuizzes.value.push({
        time: quiz.time,
        quiz: quiz.quiz,
    });
    props.saveQuizzes(allQuizzes.value);
    quiz.time = '';
    quiz.quiz = '';
};
const getTimeInSeconds = () => {
    if (quiz.time && !quiz.time.includes(':')) {
        quiz.time = `${quiz.time}:00`;
    }
    const timeParts = quiz.time.split(':');
    const timeInSeconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    return timeInSeconds;
};
const isTimeValid = () => {
    if (parseInt(quiz.time) > props.duration) {
        toast.error(__('Time in video exceeds the total duration of the video.'));
        return false;
    }
    return true;
};
const isFormComplete = () => {
    if (!quiz.time) {
        toast.error(__('Please enter a valid timestamp'));
        return false;
    }
    if (!quiz.quiz) {
        toast.error(__('Please select a quiz'));
        return false;
    }
    return true;
};
const removeQuiz = (selections, unselectAll) => {
    Array.from(selections).forEach((selection) => {
        const index = allQuizzes.value.findIndex((q) => q.quiz === selection);
        if (index !== -1) {
            allQuizzes.value.splice(index, 1);
        }
        unselectAll();
    });
    props.saveQuizzes(allQuizzes.value);
};
watch(() => props.quizzes, (newQuizzes) => {
    allQuizzes.value = newQuizzes;
}, { immediate: true });
const columns = computed(() => {
    return [
        {
            key: 'quiz',
            label: __('Quiz'),
        },
        {
            key: 'time',
            label: __('Time in Video (minutes)'),
            align: 'center',
        },
    ];
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
        title: __VLS_ctx.__('Add quiz to this video'),
        size: '2xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Add quiz to this video'),
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
        ...{ class: "flex items-end gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        label: (__VLS_ctx.__('Time in Video')),
        modelValue: (__VLS_ctx.quiz.time),
        type: "text",
        placeholder: "2:15",
        ...{ class: "flex-1" },
    }));
    const __VLS_10 = __VLS_9({
        label: (__VLS_ctx.__('Time in Video')),
        modelValue: (__VLS_ctx.quiz.time),
        type: "text",
        placeholder: "2:15",
        ...{ class: "flex-1" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    const __VLS_13 = Link;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        modelValue: (__VLS_ctx.quiz.quiz),
        label: (__VLS_ctx.__('Quiz')),
        doctype: "LMS Quiz",
        ...{ class: "flex-1" },
    }));
    const __VLS_15 = __VLS_14({
        modelValue: (__VLS_ctx.quiz.quiz),
        label: (__VLS_ctx.__('Quiz')),
        doctype: "LMS Quiz",
        ...{ class: "flex-1" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.addQuiz();
                // @ts-ignore
                [show, __, __, __, quiz, quiz, addQuiz,];
            } });
    const { default: __VLS_25 } = __VLS_21.slots;
    {
        const { prefix: __VLS_26 } = __VLS_21.slots;
        let __VLS_27;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }));
        const __VLS_29 = __VLS_28({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Add'));
    // @ts-ignore
    [__,];
    var __VLS_21;
    var __VLS_22;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-10 mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-medium mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    (__VLS_ctx.__('Quizzes in this video'));
    if (__VLS_ctx.allQuizzes.length) {
        let __VLS_32;
        /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
        ListView;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            columns: (__VLS_ctx.columns),
            rows: (__VLS_ctx.allQuizzes),
            rowKey: "quiz",
            options: ({
                showTooltip: false,
            }),
        }));
        const __VLS_34 = __VLS_33({
            columns: (__VLS_ctx.columns),
            rows: (__VLS_ctx.allQuizzes),
            rowKey: "quiz",
            options: ({
                showTooltip: false,
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        const { default: __VLS_37 } = __VLS_35.slots;
        let __VLS_38;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
        ListHeader;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }));
        const __VLS_40 = __VLS_39({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        const { default: __VLS_43 } = __VLS_41.slots;
        for (const [item] of __VLS_vFor((__VLS_ctx.columns))) {
            let __VLS_44;
            /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
            ListHeaderItem;
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
                item: (item),
            }));
            const __VLS_46 = __VLS_45({
                item: (item),
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            const { default: __VLS_49 } = __VLS_47.slots;
            {
                const { prefix: __VLS_50 } = __VLS_47.slots;
                const [{ item }] = __VLS_vSlot(__VLS_50);
                if (item.icon) {
                    const __VLS_51 = (item.icon);
                    // @ts-ignore
                    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                        ...{ class: "h-4 w-4 stroke-1.5 ml-4" },
                    }));
                    const __VLS_53 = __VLS_52({
                        ...{ class: "h-4 w-4 stroke-1.5 ml-4" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
                    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
                }
                // @ts-ignore
                [__, allQuizzes, allQuizzes, columns, columns,];
            }
            // @ts-ignore
            [];
            var __VLS_47;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_41;
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
        ListRows;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
        const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
        const { default: __VLS_61 } = __VLS_59.slots;
        for (const [row] of __VLS_vFor((__VLS_ctx.allQuizzes))) {
            let __VLS_62;
            /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
            ListRow;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                row: (row),
            }));
            const __VLS_64 = __VLS_63({
                row: (row),
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            const { default: __VLS_67 } = __VLS_65.slots;
            {
                const { default: __VLS_68 } = __VLS_65.slots;
                const [{ column, item }] = __VLS_vSlot(__VLS_68);
                let __VLS_69;
                /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
                ListRowItem;
                // @ts-ignore
                const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
                    item: (row[column.key]),
                    align: (column.align),
                }));
                const __VLS_71 = __VLS_70({
                    item: (row[column.key]),
                    align: (column.align),
                }, ...__VLS_functionalComponentArgsRest(__VLS_70));
                const { default: __VLS_74 } = __VLS_72.slots;
                if (column.key == 'time') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "leading-5 text-sm" },
                    });
                    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    (__VLS_ctx.formatTimestamp(row[column.key]));
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "leading-5 text-sm" },
                    });
                    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    (row[column.key]);
                }
                // @ts-ignore
                [allQuizzes, formatTimestamp,];
                var __VLS_72;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_65;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_59;
        let __VLS_75;
        /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
        ListSelectBanner;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({}));
        const __VLS_77 = __VLS_76({}, ...__VLS_functionalComponentArgsRest(__VLS_76));
        const { default: __VLS_80 } = __VLS_78.slots;
        {
            const { actions: __VLS_81 } = __VLS_78.slots;
            const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_81);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            let __VLS_82;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
                ...{ 'onClick': {} },
                variant: "ghost",
            }));
            const __VLS_84 = __VLS_83({
                ...{ 'onClick': {} },
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_83));
            let __VLS_87;
            const __VLS_88 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.allQuizzes.length))
                            return;
                        __VLS_ctx.removeQuiz(selections, unselectAll);
                        // @ts-ignore
                        [removeQuiz,];
                    } });
            const { default: __VLS_89 } = __VLS_85.slots;
            let __VLS_90;
            /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
            Trash2;
            // @ts-ignore
            const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_92 = __VLS_91({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_91));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
            var __VLS_85;
            var __VLS_86;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_78;
        // @ts-ignore
        [];
        var __VLS_35;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5 italic text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        (__VLS_ctx.__('No quizzes added yet.'));
    }
    // @ts-ignore
    [__,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        ...{},
        ...{
            quizzes: {
                type: Array,
                default: () => [],
            },
            saveQuizzes: {
                type: Function,
                required: true,
            },
            duration: {
                type: Number,
                default: 0,
            },
        },
    },
});
export default {};
