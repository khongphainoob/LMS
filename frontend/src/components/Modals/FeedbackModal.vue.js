/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, ListView, Avatar, ListHeader, ListRows, ListRow, ListRowItem, Rating, } from 'frappe-ui';
import { computed } from 'vue';
const show = defineModel();
const ratingKeys = ['content', 'instructors', 'value'];
const props = defineProps({
    feedbackList: {
        type: Array,
        required: true,
    },
});
const feedbackColumns = computed(() => {
    return [
        {
            label: __('Member'),
            key: 'member_name',
            width: '10rem',
        },
        {
            label: __('Feedback'),
            key: 'feedback',
            width: '15rem',
        },
        {
            label: __('Content'),
            key: 'content',
            width: '9rem',
        },
        {
            label: __('Instructors'),
            key: 'instructors',
            width: '9rem',
        },
        {
            label: __('Value'),
            key: 'value',
            width: '9rem',
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
        size: '4xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '4xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { body: __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-5 min-h-[300px]" },
    });
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[300px]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    (__VLS_ctx.__('Training Feedback'));
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        columns: (__VLS_ctx.feedbackColumns),
        rows: (__VLS_ctx.feedbackList),
        rowKey: "name",
        options: ({
            showTooltip: false,
            rowHeight: 'h-16',
            selectable: false,
        }),
    }));
    const __VLS_10 = __VLS_9({
        columns: (__VLS_ctx.feedbackColumns),
        rows: (__VLS_ctx.feedbackList),
        rowKey: "name",
        options: ({
            showTooltip: false,
            rowHeight: 'h-16',
            selectable: false,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const { default: __VLS_13 } = __VLS_11.slots;
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_16 = __VLS_15({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    let __VLS_19;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
    const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const { default: __VLS_24 } = __VLS_22.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.feedbackList))) {
        let __VLS_25;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
            row: (row),
            ...{ class: "group feedback-list" },
        }));
        const __VLS_27 = __VLS_26({
            row: (row),
            ...{ class: "group feedback-list" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['feedback-list']} */ ;
        const { default: __VLS_30 } = __VLS_28.slots;
        {
            const { default: __VLS_31 } = __VLS_28.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_31);
            let __VLS_32;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
                item: (row[column.key]),
                align: (column.align),
                ...{ class: "text-sm" },
            }));
            const __VLS_34 = __VLS_33({
                item: (row[column.key]),
                align: (column.align),
                ...{ class: "text-sm" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            const { default: __VLS_37 } = __VLS_35.slots;
            {
                const { prefix: __VLS_38 } = __VLS_35.slots;
                if (column.key == 'member_name') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    let __VLS_39;
                    /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
                    Avatar;
                    // @ts-ignore
                    const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
                        ...{ class: "flex" },
                        image: (row['member_image']),
                        label: (item),
                        size: "sm",
                    }));
                    const __VLS_41 = __VLS_40({
                        ...{ class: "flex" },
                        image: (row['member_image']),
                        label: (item),
                        size: "sm",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                }
                // @ts-ignore
                [show, __, feedbackColumns, feedbackList, feedbackList,];
            }
            if (__VLS_ctx.ratingKeys.includes(column.key)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                let __VLS_44;
                /** @ts-ignore @type { | typeof __VLS_components.Rating} */
                Rating;
                // @ts-ignore
                const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
                    modelValue: (row[column.key]),
                    readonly: (true),
                }));
                const __VLS_46 = __VLS_45({
                    modelValue: (row[column.key]),
                    readonly: (true),
                }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "leading-5" },
                });
                /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                (row[column.key]);
            }
            // @ts-ignore
            [ratingKeys,];
            var __VLS_35;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_28;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_22;
    // @ts-ignore
    [];
    var __VLS_11;
    // @ts-ignore
    [];
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
            feedbackList: {
                type: Array,
                required: true,
            },
        },
    },
});
export default {};
