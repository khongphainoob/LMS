/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createListResource, Breadcrumbs, Button, ListView, ListRow, ListRows, ListHeader, ListHeaderItem, usePageMeta, } from 'frappe-ui';
import { computed, onMounted, inject } from 'vue';
import { sessionStore } from '../stores/session';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/EmptyState.vue';
const { brand } = sessionStore();
const router = useRouter();
const user = inject('$user');
onMounted(() => {
    if (!user.data?.is_instructor && !user.data?.is_moderator)
        router.push({ name: 'Courses' });
});
const props = defineProps({
    quizID: {
        type: String,
        required: true,
    },
});
const submissions = createListResource({
    doctype: 'LMS Quiz Submission',
    filters: {
        quiz: props.quizID,
    },
    fields: ['name', 'member_name', 'score', 'percentage', 'quiz_title'],
    orderBy: 'creation desc',
    auto: true,
});
const quizColumns = computed(() => {
    return [
        {
            label: __('Member'),
            key: 'member_name',
            width: 1,
        },
        {
            label: __('Score'),
            key: 'score',
            width: 1,
            align: 'center',
        },
        {
            label: __('Percentage'),
            key: 'percentage',
            width: 1,
            align: 'center',
        },
    ];
});
const breadcrumbs = computed(() => {
    return [{ label: __('Quiz Submissions') }];
});
usePageMeta(() => {
    return {
        title: __('Quiz Submissions'),
        icon: brand.favicon,
    };
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
if (__VLS_ctx.submissions.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "md:w-3/4 md:mx-auto py-5 mx-5" },
    });
    /** @type {__VLS_StyleScopedClasses['md:w-3/4']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xl font-semibold mb-5 text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.submissions.data[0].quiz_title);
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        columns: (__VLS_ctx.quizColumns),
        rows: (__VLS_ctx.submissions.data),
        rowKey: "name",
        options: ({ showTooltip: false, selectable: false }),
    }));
    const __VLS_7 = __VLS_6({
        columns: (__VLS_ctx.quizColumns),
        rows: (__VLS_ctx.submissions.data),
        rowKey: "name",
        options: ({ showTooltip: false, selectable: false }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const { default: __VLS_10 } = __VLS_8.slots;
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_13 = __VLS_12({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    const { default: __VLS_16 } = __VLS_14.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.quizColumns))) {
        let __VLS_17;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
            item: (item),
        }));
        const __VLS_19 = __VLS_18({
            item: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        // @ts-ignore
        [breadcrumbs, submissions, submissions, submissions, quizColumns, quizColumns,];
    }
    // @ts-ignore
    [];
    var __VLS_14;
    let __VLS_22;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({}));
    const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
    const { default: __VLS_27 } = __VLS_25.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.submissions.data))) {
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
            to: ({
                name: 'QuizSubmission',
                params: {
                    submission: row.name,
                },
            }),
        }));
        const __VLS_30 = __VLS_29({
            to: ({
                name: 'QuizSubmission',
                params: {
                    submission: row.name,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        const { default: __VLS_33 } = __VLS_31.slots;
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            row: (row),
        }));
        const __VLS_36 = __VLS_35({
            row: (row),
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        // @ts-ignore
        [submissions,];
        var __VLS_31;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_25;
    // @ts-ignore
    [];
    var __VLS_8;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center my-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-5']} */ ;
    if (__VLS_ctx.submissions.hasNextPage) {
        let __VLS_39;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
            ...{ 'onClick': {} },
        }));
        const __VLS_41 = __VLS_40({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        let __VLS_44;
        const __VLS_45 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.submissions.data?.length))
                        return;
                    if (!(__VLS_ctx.submissions.hasNextPage))
                        return;
                    __VLS_ctx.submissions.next();
                    // @ts-ignore
                    [submissions, submissions,];
                } });
        const { default: __VLS_46 } = __VLS_42.slots;
        (__VLS_ctx.__('Load More'));
        // @ts-ignore
        [__,];
        var __VLS_42;
        var __VLS_43;
    }
}
else {
    const __VLS_47 = EmptyState;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        type: "Quiz Submissions",
    }));
    const __VLS_49 = __VLS_48({
        type: "Quiz Submissions",
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        quizID: {
            type: String,
            required: true,
        },
    },
});
export default {};
