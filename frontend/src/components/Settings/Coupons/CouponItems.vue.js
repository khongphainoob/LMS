/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch } from 'vue';
import { Button, createListResource, FormControl } from 'frappe-ui';
import { Plus, X } from 'lucide-vue-next';
import Link from '@/components/Controls/Link.vue';
const rows = ref([]);
const props = defineProps();
const applicableItems = createListResource({
    doctype: 'LMS Coupon Item',
    fields: [
        'reference_doctype',
        'reference_name',
        'name',
        'parent',
        'parenttype',
        'parentfield',
    ],
    parent: 'LMS Coupon',
    onSuccess(data) {
        rows.value = data;
    },
});
const addRow = () => {
    rows.value.push({
        reference_doctype: 'LMS Course',
        reference_name: null,
        name: null,
    });
};
watch(() => props.data, () => {
    if (props.data?.name) {
        applicableItems.update({
            filters: {
                parent: props.data.name,
            },
        });
        applicableItems.reload();
    }
    else {
        addRow();
    }
}, { immediate: true });
const saveItems = (parent = null) => {
    return rows.value;
};
const removeRow = (rowToRemove) => {
    rows.value = rows.value.filter((row) => row !== rowToRemove);
    if (rowToRemove.name) {
        applicableItems.delete.submit(rowToRemove.name, {
            onSuccess() {
                props.coupons.reload();
                applicableItems.reload();
            },
        });
    }
};
const __VLS_exposed = {
    saveItems,
};
defineExpose(__VLS_exposed);
const __VLS_ctx = {
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
    ...{ class: "relative overflow-x-auto border rounded-md" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
    ...{ class: "w-full text-sm text-left text-ink-gray-5" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({
    ...{ class: "text-xs text-ink-gray-7 uppercase bg-surface-gray-2" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
    scope: "col",
    ...{ class: "px-6 py-2" },
});
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
(__VLS_ctx.__('Document Type'));
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
    scope: "col",
    ...{ class: "px-6 py-2" },
});
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
(__VLS_ctx.__('Document Name'));
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
    scope: "col",
    ...{ class: "px-6 py-2 w-16" },
});
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
for (const [row] of __VLS_vFor((__VLS_ctx.rows))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
        ...{ class: "bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-200" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        ...{ class: "px-6 py-2" },
    });
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        type: "select",
        modelValue: (row.reference_doctype),
        options: ([
            { label: __VLS_ctx.__('Course'), value: 'LMS Course' },
            { label: __VLS_ctx.__('Batch'), value: 'LMS Batch' },
        ]),
    }));
    const __VLS_2 = __VLS_1({
        type: "select",
        modelValue: (row.reference_doctype),
        options: ([
            { label: __VLS_ctx.__('Course'), value: 'LMS Course' },
            { label: __VLS_ctx.__('Batch'), value: 'LMS Batch' },
        ]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        ...{ class: "px-6 py-2" },
    });
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    const __VLS_5 = Link;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        doctype: (row.reference_doctype),
        modelValue: (row.reference_name),
        ...{ class: "bg-white" },
    }));
    const __VLS_7 = __VLS_6({
        doctype: (row.reference_doctype),
        modelValue: (row.reference_name),
        ...{ class: "bg-white" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        ...{ class: "px-6 py-2" },
    });
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        ...{ 'onClick': {} },
        variant: "ghost",
    }));
    const __VLS_12 = __VLS_11({
        ...{ 'onClick': {} },
        variant: "ghost",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    let __VLS_15;
    const __VLS_16 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.removeRow(row);
                // @ts-ignore
                [__, __, __, __, rows, removeRow,];
            } });
    const { default: __VLS_17 } = __VLS_13.slots;
    {
        const { icon: __VLS_18 } = __VLS_13.slots;
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.X} */
        X;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            ...{ class: "size-4 stroke-1.5" },
        }));
        const __VLS_21 = __VLS_20({
            ...{ class: "size-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_13;
    var __VLS_14;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-4" },
});
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
let __VLS_24;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_29;
const __VLS_30 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.addRow();
            // @ts-ignore
            [addRow,];
        } });
const { default: __VLS_31 } = __VLS_27.slots;
{
    const { prefix: __VLS_32 } = __VLS_27.slots;
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        ...{ class: "size-4 stroke-1.5" },
    }));
    const __VLS_35 = __VLS_34({
        ...{ class: "size-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [];
}
(__VLS_ctx.__('Add Row'));
// @ts-ignore
[__,];
var __VLS_27;
var __VLS_28;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => __VLS_exposed,
    __typeProps: {},
});
export default {};
