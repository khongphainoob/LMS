/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, FormControl, Popover } from 'frappe-ui';
import { computed } from 'vue';
import { Palette, X } from 'lucide-vue-next';
import { getColor } from '@/utils';
const emit = defineEmits(['update:modelValue', 'change']);
const props = defineProps();
const colors = computed(() => {
    return [
        'Red',
        'Blue',
        'Green',
        'Amber',
        'Purple',
        'Cyan',
        'Orange',
        'Violet',
        'Pink',
        'Teal',
        'Gray',
        'Yellow',
    ];
});
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
    ...{ class: "text-xs text-ink-gray-5 mb-1" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
(__VLS_ctx.__(__VLS_ctx.label));
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
Popover;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    placement: "bottom",
    ...{ class: "!block" },
}));
const __VLS_2 = __VLS_1({
    placement: "bottom",
    ...{ class: "!block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['!block']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { target: __VLS_6 } = __VLS_3.slots;
    const [{ togglePopover, isOpen }] = __VLS_vSlot(__VLS_6);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        ...{ 'onFocus': {} },
        ...{ 'onUpdate:modelValue': {} },
        type: "text",
        autocomplete: "off",
        ...{ class: "w-full" },
        placeholder: (__VLS_ctx.__('Set Color')),
        modelValue: (__VLS_ctx.modelValue),
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onFocus': {} },
        ...{ 'onUpdate:modelValue': {} },
        type: "text",
        autocomplete: "off",
        ...{ class: "w-full" },
        placeholder: (__VLS_ctx.__('Set Color')),
        modelValue: (__VLS_ctx.modelValue),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = ({ focus: {} },
        { onFocus: (togglePopover) });
    const __VLS_14 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': ((val) => __VLS_ctx.emit('update:modelValue', val)) });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    const { default: __VLS_15 } = __VLS_10.slots;
    {
        const { prefix: __VLS_16 } = __VLS_10.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "size-4 rounded-full" },
            ...{ style: (__VLS_ctx.modelValue
                    ? {
                        backgroundColor: __VLS_ctx.getColor(__VLS_ctx.modelValue.toLowerCase(), 400),
                    }
                    : {}) },
        });
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        if (!__VLS_ctx.modelValue) {
            let __VLS_17;
            /** @ts-ignore @type { | typeof __VLS_components.Palette} */
            Palette;
            // @ts-ignore
            const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
                ...{ class: "size-4 stroke-1.5 text-ink-gray-5" },
            }));
            const __VLS_19 = __VLS_18({
                ...{ class: "size-4 stroke-1.5 text-ink-gray-5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_18));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        }
        // @ts-ignore
        [__, __, label, modelValue, modelValue, modelValue, modelValue, emit, getColor,];
    }
    {
        const { suffix: __VLS_22 } = __VLS_10.slots;
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            variant: "ghost",
        }));
        const __VLS_25 = __VLS_24({
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        const { default: __VLS_28 } = __VLS_26.slots;
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.X} */
        X;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            ...{ 'onClick': {} },
            ...{ class: "size-3 text-ink-gray-5" },
        }));
        const __VLS_31 = __VLS_30({
            ...{ 'onClick': {} },
            ...{ class: "size-3 text-ink-gray-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        let __VLS_34;
        const __VLS_35 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.emit('update:modelValue', null);
                    // @ts-ignore
                    [emit,];
                } });
        /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        var __VLS_32;
        var __VLS_33;
        // @ts-ignore
        [];
        var __VLS_26;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_10;
    var __VLS_11;
    // @ts-ignore
    [];
}
{
    const { body: __VLS_36 } = __VLS_3.slots;
    const [{ close }] = __VLS_vSlot(__VLS_36);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rounded-lg bg-surface-white p-3 border w-fit mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5 mb-1.5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
    (__VLS_ctx.__('Swatches'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-7 gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    for (const [color] of __VLS_vFor((__VLS_ctx.colors))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: ((e) => {
                    __VLS_ctx.emit('update:modelValue', color);
                    close();
                    __VLS_ctx.emit('change', color);
                }) },
            key: (color),
            ...{ class: "size-5 rounded-full cursor-pointer" },
            ...{ style: ({
                    backgroundColor: __VLS_ctx.getColor(color.toLowerCase(), 400),
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        // @ts-ignore
        [__, emit, emit, getColor, colors,];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-sm text-ink-gray-5 mt-2" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
(__VLS_ctx.description);
// @ts-ignore
[description,];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    __typeProps: {},
});
export default {};
