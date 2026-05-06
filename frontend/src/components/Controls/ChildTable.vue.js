/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { nextTick, ref, watch } from 'vue';
import { Button } from 'frappe-ui';
import { Ellipsis, Plus, Trash2 } from 'lucide-vue-next';
import { onClickOutside } from '@vueuse/core';
const rows = defineModel();
const menuRef = ref(null);
const menuOpenIndex = ref(null);
const menuTopPosition = ref('');
const menuLeftPosition = ref('0px');
const emit = defineEmits();
const props = withDefaults(defineProps(), {
    columns: () => [],
});
const columns = ref(props.columns);
watch(rows, () => {
    if (rows.value && rows.value.length < 1) {
        addRow();
    }
});
const addRow = () => {
    if (!rows.value) {
        rows.value = [];
    }
    let newRow = {};
    columns.value.forEach((column) => {
        newRow[column.toLowerCase().split(' ').join('_')] = '';
    });
    rows.value.push(newRow);
    focusNewRowInput();
    emit('update:modelValue', rows.value);
};
const focusNewRowInput = () => {
    nextTick(() => {
        const rowElements = document.querySelectorAll('.overflow-x-auto .grid')[rows.value.length];
        const firstInput = rowElements.querySelector('input');
        if (firstInput) {
            ;
            firstInput.focus();
        }
    });
};
const deleteRow = (index) => {
    rows.value?.splice(index, 1);
    emit('update:modelValue', rows.value ?? []);
};
const getGridTemplateColumns = () => {
    return [...Array(columns.value.length).fill('1fr'), '0.25fr'].join(' ');
};
const toggleMenu = (index, event) => {
    menuOpenIndex.value = menuOpenIndex.value === index ? null : index;
};
onClickOutside(menuRef, () => {
    menuOpenIndex.value = null;
});
const showKey = (key) => {
    let columnsLower = columns.value.map((col) => col.toLowerCase().split(' ').join('_'));
    return columnsLower.includes(key);
};
let __VLS_modelEmit;
const __VLS_defaults = {
    columns: () => [],
};
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xs text-ink-gray-5 mb-2" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
(__VLS_ctx.label);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overflow-visible border rounded-md" },
});
/** @type {__VLS_StyleScopedClasses['overflow-visible']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overflow-x-auto" },
});
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid items-center space-x-4 p-2 border-b" },
    ...{ style: ({ gridTemplateColumns: __VLS_ctx.getGridTemplateColumns() }) },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
for (const [column, index] of __VLS_vFor((__VLS_ctx.columns))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (column);
    // @ts-ignore
    [label, getGridTemplateColumns, columns,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
for (const [row, rowIndex] of __VLS_vFor((__VLS_ctx.rows))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (rowIndex),
        ...{ class: "grid items-center space-x-4 p-2" },
        ...{ style: ({ gridTemplateColumns: __VLS_ctx.getGridTemplateColumns() }) },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    for (const [key] of __VLS_vFor((Object.keys(row)))) {
        (key);
        if (__VLS_ctx.showKey(key)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                ...{ class: "py-1.5 px-2 border-none focus:ring-0 focus:border focus:border-gray-300 focus:bg-surface-gray-2 rounded-md text-sm focus:outline-none" },
            });
            (row[key]);
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:ring-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:border']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:border-gray-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        }
        // @ts-ignore
        [getGridTemplateColumns, rows, showKey,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        variant: "ghost",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        variant: "ghost",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: ((event) => __VLS_ctx.toggleMenu(rowIndex, event)) });
    const { default: __VLS_7 } = __VLS_3.slots;
    {
        const { icon: __VLS_8 } = __VLS_3.slots;
        let __VLS_9;
        /** @ts-ignore @type { | typeof __VLS_components.Ellipsis} */
        Ellipsis;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
            ...{ class: "size-4 text-ink-gray-7 stroke-1.5 cursor-pointer" },
        }));
        const __VLS_11 = __VLS_10({
            ...{ class: "size-4 text-ink-gray-7 stroke-1.5 cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        // @ts-ignore
        [toggleMenu,];
    }
    // @ts-ignore
    [];
    var __VLS_3;
    var __VLS_4;
    if (__VLS_ctx.menuOpenIndex === rowIndex) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ref: "menuRef",
            ...{ class: "absolute right-0 w-32 z-50 bg-surface-white border border-outline-gray-1 rounded-md shadow-sm" },
            ...{ class: (rowIndex == (__VLS_ctx.rows?.length ?? 0) - 1
                    ? 'bottom-full mb-1'
                    : 'top-full mt-1') },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.menuOpenIndex === rowIndex))
                        return;
                    __VLS_ctx.deleteRow(rowIndex);
                    // @ts-ignore
                    [rows, menuOpenIndex, deleteRow,];
                } },
            ...{ class: "flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-ink-red-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
        Trash2;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ class: "size-4 stroke-1.5" },
        }));
        const __VLS_16 = __VLS_15({
            ...{ class: "size-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Delete'));
    }
    // @ts-ignore
    [__,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-2" },
});
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
let __VLS_19;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    ...{ 'onClick': {} },
}));
const __VLS_21 = __VLS_20({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_24;
const __VLS_25 = ({ click: {} },
    { onClick: (__VLS_ctx.addRow) });
const { default: __VLS_26 } = __VLS_22.slots;
{
    const { prefix: __VLS_27 } = __VLS_22.slots;
    let __VLS_28;
    /** @ts-ignore @type { | typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        ...{ class: "size-4 text-ink-gray-7" },
    }));
    const __VLS_30 = __VLS_29({
        ...{ class: "size-4 text-ink-gray-7" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    // @ts-ignore
    [addRow,];
}
(__VLS_ctx.__('Add Row'));
// @ts-ignore
[__,];
var __VLS_22;
var __VLS_23;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
