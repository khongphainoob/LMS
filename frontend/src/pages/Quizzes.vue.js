/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, Button, createListResource, Dialog, FeatherIcon, FormControl, ListView, ListRows, ListRow, ListRowItem, ListHeader, ListHeaderItem, ListSelectBanner, toast, usePageMeta, } from 'frappe-ui';
import { useRouter, useRoute } from 'vue-router';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { Plus } from 'lucide-vue-next';
import { sessionStore } from '@/stores/session';
import { escapeHTML } from '@/utils';
import { useTelemetry } from 'frappe-ui/frappe';
import EmptyState from '@/components/EmptyState.vue';
const { brand } = sessionStore();
const { capture } = useTelemetry();
const user = inject('$user');
const dayjs = inject('$dayjs');
const router = useRouter();
const route = useRoute();
const search = ref('');
const readOnlyMode = window.read_only_mode;
const quizFilters = ref({});
const showForm = ref(false);
const title = ref('');
onMounted(() => {
    if (!user.data?.is_moderator && !user.data?.is_instructor) {
        router.push({ name: 'Courses' });
    }
    else if (!user.data?.is_moderator) {
        quizFilters.value['owner'] = user.data?.name;
    }
    if (route.query.new === 'true') {
        showForm.value = true;
    }
});
watch(search, () => {
    quizFilters.value['title'] = ['like', `%${search.value}%`];
    quizzes.update({
        filters: quizFilters.value,
    });
    quizzes.reload();
});
const quizzes = createListResource({
    doctype: 'LMS Quiz',
    filters: quizFilters,
    fields: [
        'name',
        'title',
        'passing_percentage',
        'total_marks',
        'show_answers',
        'max_attempts',
        'modified',
    ],
    auto: true,
    cache: ['quizzes', user.data?.name],
    orderBy: 'modified desc',
    transform(data) {
        return data.map((quiz) => {
            return {
                ...quiz,
                modified: dayjs(quiz.modified).fromNow(),
            };
        });
    },
});
const validateTitle = () => {
    title.value = escapeHTML(title.value.trim());
};
const insertQuiz = (close) => {
    validateTitle();
    quizzes.insert.submit({
        title: title.value,
    }, {
        onSuccess(data) {
            toast.success(__('Quiz created successfully'));
            close();
            title.value = '';
            capture('quiz_created');
            router.push({
                name: 'QuizForm',
                params: {
                    quizID: data.name,
                },
            });
        },
        onError(error) {
            toast.error(__('Error creating quiz: {0}', error.message));
        },
    });
};
const deleteQuiz = (selections, unselectAll) => {
    Array.from(selections).forEach(async (quizName) => {
        await quizzes.delete.submit(quizName);
    });
    unselectAll();
    toast.success(__('Quizzes deleted successfully'));
};
const quizColumns = computed(() => {
    return [
        {
            label: __('Title'),
            key: 'title',
            width: 2,
            icon: 'file-text',
        },
        {
            label: __('Total Marks'),
            key: 'total_marks',
            width: 1,
            align: 'center',
            icon: 'hash',
        },
        {
            label: __('Passing Percentage'),
            key: 'passing_percentage',
            width: 1,
            align: 'center',
            icon: 'percent',
        },
        {
            label: __('Max Attempts'),
            key: 'max_attempts',
            width: 1,
            align: 'center',
            icon: 'repeat',
        },
        {
            label: __('Show Answers'),
            key: 'show_answers',
            width: 1,
            align: 'center',
            icon: 'eye',
        },
        {
            label: __('Modified'),
            key: 'modified',
            width: 1,
            align: 'center',
            icon: 'clock',
        },
    ];
});
const breadcrumbs = computed(() => {
    return [
        {
            label: __('Quizzes'),
            route: {
                name: 'Quizzes',
            },
        },
    ];
});
usePageMeta(() => {
    return {
        title: __('Quizzes'),
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
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (!__VLS_ctx.readOnlyMode) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.showForm = true;
                // @ts-ignore
                [breadcrumbs, readOnlyMode, showForm,];
            } });
    const { default: __VLS_12 } = __VLS_8.slots;
    {
        const { prefix: __VLS_13 } = __VLS_8.slots;
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ class: "w-4 h-4" },
        }));
        const __VLS_16 = __VLS_15({
            ...{ class: "w-4 h-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Create'));
    // @ts-ignore
    [__,];
    var __VLS_8;
    var __VLS_9;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "py-5 mx-5" },
});
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg font-semibold text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
(__VLS_ctx.quizzes.data?.length
    ? __VLS_ctx.__('{0} Quizzes').format(__VLS_ctx.quizzes.data.length)
    : __VLS_ctx.__('No Quizzes'));
let __VLS_19;
/** @ts-ignore @type { | typeof __VLS_components.FormControl | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    modelValue: (__VLS_ctx.search),
    type: "text",
    placeholder: "Search",
}));
const __VLS_21 = __VLS_20({
    modelValue: (__VLS_ctx.search),
    type: "text",
    placeholder: "Search",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
{
    const { prefix: __VLS_25 } = __VLS_22.slots;
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
    FeatherIcon;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        name: "search",
        ...{ class: "size-4 text-ink-gray-5" },
    }));
    const __VLS_28 = __VLS_27({
        name: "search",
        ...{ class: "size-4 text-ink-gray-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    // @ts-ignore
    [__, __, quizzes, quizzes, search,];
}
// @ts-ignore
[];
var __VLS_22;
if (__VLS_ctx.quizzes.data?.length) {
    let __VLS_31;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        columns: (__VLS_ctx.quizColumns),
        rows: (__VLS_ctx.quizzes.data),
        rowKey: "name",
        options: ({ showTooltip: false, selectable: true }),
    }));
    const __VLS_33 = __VLS_32({
        columns: (__VLS_ctx.quizColumns),
        rows: (__VLS_ctx.quizzes.data),
        rowKey: "name",
        options: ({ showTooltip: false, selectable: true }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const { default: __VLS_36 } = __VLS_34.slots;
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_39 = __VLS_38({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    const { default: __VLS_42 } = __VLS_40.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.quizColumns))) {
        let __VLS_43;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
            item: (item),
        }));
        const __VLS_45 = __VLS_44({
            item: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        const { default: __VLS_48 } = __VLS_46.slots;
        {
            const { prefix: __VLS_49 } = __VLS_46.slots;
            const [{ item }] = __VLS_vSlot(__VLS_49);
            let __VLS_50;
            /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
            FeatherIcon;
            // @ts-ignore
            const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
                name: (item.icon?.toString()),
                ...{ class: "h-4 w-4" },
            }));
            const __VLS_52 = __VLS_51({
                name: (item.icon?.toString()),
                ...{ class: "h-4 w-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_51));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            // @ts-ignore
            [quizzes, quizzes, quizColumns, quizColumns,];
        }
        // @ts-ignore
        [];
        var __VLS_46;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_40;
    let __VLS_55;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({}));
    const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const { default: __VLS_60 } = __VLS_58.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.quizzes.data))) {
        let __VLS_61;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
            to: ({
                name: 'QuizForm',
                params: {
                    quizID: row.name,
                },
            }),
        }));
        const __VLS_63 = __VLS_62({
            to: ({
                name: 'QuizForm',
                params: {
                    quizID: row.name,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        const { default: __VLS_66 } = __VLS_64.slots;
        let __VLS_67;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
            row: (row),
        }));
        const __VLS_69 = __VLS_68({
            row: (row),
        }, ...__VLS_functionalComponentArgsRest(__VLS_68));
        const { default: __VLS_72 } = __VLS_70.slots;
        {
            const { default: __VLS_73 } = __VLS_70.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_73);
            let __VLS_74;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
                item: (row[column.key]),
                align: (column.align),
            }));
            const __VLS_76 = __VLS_75({
                item: (row[column.key]),
                align: (column.align),
            }, ...__VLS_functionalComponentArgsRest(__VLS_75));
            const { default: __VLS_79 } = __VLS_77.slots;
            if (column.key == 'show_answers') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                let __VLS_80;
                /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
                FormControl;
                // @ts-ignore
                const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
                    type: "checkbox",
                    modelValue: (row[column.key]),
                    disabled: (true),
                }));
                const __VLS_82 = __VLS_81({
                    type: "checkbox",
                    modelValue: (row[column.key]),
                    disabled: (true),
                }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            }
            else if (column.key == 'modified') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-xs text-ink-gray-5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
                (row[column.key]);
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (row[column.key]);
            }
            // @ts-ignore
            [quizzes,];
            var __VLS_77;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_70;
        // @ts-ignore
        [];
        var __VLS_64;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_58;
    let __VLS_85;
    /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
    ListSelectBanner;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({}));
    const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
    const { default: __VLS_90 } = __VLS_88.slots;
    {
        const { actions: __VLS_91 } = __VLS_88.slots;
        const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_91);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_92;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_94 = __VLS_93({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_97;
        const __VLS_98 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.quizzes.data?.length))
                        return;
                    __VLS_ctx.deleteQuiz(selections, unselectAll);
                    // @ts-ignore
                    [deleteQuiz,];
                } });
        const { default: __VLS_99 } = __VLS_95.slots;
        let __VLS_100;
        /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
        FeatherIcon;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
            name: "trash-2",
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_102 = __VLS_101({
            name: "trash-2",
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
        var __VLS_95;
        var __VLS_96;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_88;
    // @ts-ignore
    [];
    var __VLS_34;
}
else {
    const __VLS_105 = EmptyState;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        type: "Quizzes",
    }));
    const __VLS_107 = __VLS_106({
        type: "Quizzes",
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
}
if (__VLS_ctx.quizzes.hasNextPage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center my-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-5']} */ ;
    let __VLS_110;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
        ...{ 'onClick': {} },
    }));
    const __VLS_112 = __VLS_111({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    let __VLS_115;
    const __VLS_116 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.quizzes.hasNextPage))
                    return;
                __VLS_ctx.quizzes.next();
                // @ts-ignore
                [quizzes, quizzes,];
            } });
    const { default: __VLS_117 } = __VLS_113.slots;
    (__VLS_ctx.__('Load More'));
    // @ts-ignore
    [__,];
    var __VLS_113;
    var __VLS_114;
}
let __VLS_118;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
    modelValue: (__VLS_ctx.showForm),
    options: ({
        title: __VLS_ctx.__('Create a Quiz'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick({ close }) {
                    __VLS_ctx.insertQuiz(close);
                },
            },
        ],
    }),
}));
const __VLS_120 = __VLS_119({
    modelValue: (__VLS_ctx.showForm),
    options: ({
        title: __VLS_ctx.__('Create a Quiz'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick({ close }) {
                    __VLS_ctx.insertQuiz(close);
                },
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
const { default: __VLS_123 } = __VLS_121.slots;
{
    const { 'body-content': __VLS_124 } = __VLS_121.slots;
    let __VLS_125;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.title),
        label: (__VLS_ctx.__('Title')),
        type: "text",
    }));
    const __VLS_127 = __VLS_126({
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.title),
        label: (__VLS_ctx.__('Title')),
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    let __VLS_130;
    const __VLS_131 = ({ keydown: {} },
        { onKeydown: (...[$event]) => {
                __VLS_ctx.insertQuiz(() => (__VLS_ctx.showForm = false));
                // @ts-ignore
                [showForm, showForm, __, __, __, insertQuiz, insertQuiz, title,];
            } });
    var __VLS_128;
    var __VLS_129;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_121;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
