/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, } from '@headlessui/vue';
import { createResource, Popover, Button } from 'frappe-ui';
import { ref, computed, nextTick, useAttrs } from 'vue';
import { set, watchDebounced } from '@vueuse/core';
import { X, Plus } from 'lucide-vue-next';
const props = defineProps({
    label: {
        type: String,
    },
    size: {
        type: String,
        default: 'sm',
    },
    doctype: {
        type: String,
        required: true,
    },
    filters: {
        type: Object,
        default: () => ({}),
    },
    validate: {
        type: Function,
        default: null,
    },
    errorMessage: {
        type: Function,
        default: (value) => `${value} is an Invalid value`,
    },
    required: {
        type: Boolean,
    },
});
const values = defineModel();
const attrs = useAttrs();
const search = ref(null);
const error = ref(null);
const query = ref('');
const text = ref('');
const showOptions = ref(false);
const emit = defineEmits(['update:modelValue']);
const selectedValue = computed({
    get: () => query.value || '',
    set: (val) => {
        query.value = '';
        val?.value && addValue(val.value);
        showOptions.value = false;
        emit('update:modelValue', values.value);
    },
});
watchDebounced(query, (val) => {
    val = val || '';
    if (text.value === val)
        return;
    text.value = val;
    reload(val);
}, { debounce: 300, immediate: true });
const filterOptions = createResource({
    url: 'frappe.desk.search.search_link',
    method: 'POST',
    cache: [text.value, props.doctype],
    auto: true,
    params: {
        txt: text.value,
        doctype: props.doctype,
    },
});
const options = computed(() => {
    setFocus();
    const allOptions = filterOptions.data || [];
    return allOptions.filter((option) => !values.value?.includes(option.value));
});
function reload(val) {
    filterOptions.update({
        params: {
            txt: val,
            doctype: props.doctype,
        },
    });
    filterOptions.reload();
}
const addValue = (value) => {
    error.value = null;
    if (value) {
        const splitValues = value.split(',');
        splitValues.forEach((value) => {
            value = value.trim();
            if (value) {
                // check if value is not already in the values array
                if (!values.value?.includes(value)) {
                    // check if value is valid
                    if (value && props.validate && !props.validate(value)) {
                        error.value = props.errorMessage(value);
                        return;
                    }
                    // add value to values array
                    if (!values.value) {
                        values.value = [value];
                    }
                    else {
                        values.value.push(value);
                    }
                    value = value.replace(value, '');
                }
            }
        });
        !error.value && (value = '');
    }
};
const removeValue = (value) => {
    values.value = values.value.filter((v) => v !== value);
    emit('update:modelValue', values.value);
};
function setFocus() {
    search.value.$el.focus();
}
const __VLS_exposed = { setFocus };
defineExpose(__VLS_exposed);
const labelClasses = computed(() => {
    return [
        {
            sm: 'text-xs',
            md: 'text-base',
        }[props.size || 'sm'],
        'text-ink-gray-5',
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block mb-1" },
        ...{ class: (__VLS_ctx.labelClasses) },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.label);
    if (__VLS_ctx.required) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-red-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-full" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Combobox | typeof __VLS_components.Combobox} */
Combobox;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.selectedValue),
    nullable: true,
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.selectedValue),
    nullable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
Popover;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    ...{ class: "w-full" },
    show: (__VLS_ctx.showOptions),
}));
const __VLS_8 = __VLS_7({
    ...{ class: "w-full" },
    show: (__VLS_ctx.showOptions),
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
const { default: __VLS_11 } = __VLS_9.slots;
{
    const { target: __VLS_12 } = __VLS_9.slots;
    const [{ togglePopover }] = __VLS_vSlot(__VLS_12);
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.ComboboxInput} */
    ComboboxInput;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        ...{ 'onChange': {} },
        ...{ 'onClick': {} },
        ...{ 'onFocus': {} },
        ref: "search",
        ...{ class: "search-input form-input w-full focus-visible:!ring-0" },
        type: "text",
        value: (__VLS_ctx.query),
        autocomplete: "off",
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onChange': {} },
        ...{ 'onClick': {} },
        ...{ 'onFocus': {} },
        ref: "search",
        ...{ class: "search-input form-input w-full focus-visible:!ring-0" },
        type: "text",
        value: (__VLS_ctx.query),
        autocomplete: "off",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    const __VLS_19 = ({ change: {} },
        { onChange: ((e) => {
                __VLS_ctx.query = e.target.value;
                __VLS_ctx.showOptions = true;
            }) });
    const __VLS_20 = ({ click: {} },
        { onClick: ((e) => {
                __VLS_ctx.showOptions = true;
                __VLS_ctx.nextTick(() => {
                    __VLS_ctx.setFocus();
                });
            }) });
    const __VLS_21 = ({ focus: {} },
        { onFocus: (() => {
                if (!__VLS_ctx.filterOptions.data || __VLS_ctx.filterOptions.data.length === 0) {
                    __VLS_ctx.reload('');
                }
            }) });
    var __VLS_22 = {};
    /** @type {__VLS_StyleScopedClasses['search-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:!ring-0']} */ ;
    var __VLS_16;
    var __VLS_17;
    // @ts-ignore
    [label, label, labelClasses, required, selectedValue, showOptions, showOptions, showOptions, query, query, nextTick, setFocus, filterOptions, filterOptions, reload,];
}
{
    const { body: __VLS_24 } = __VLS_9.slots;
    const [{ isOpen, close }] = __VLS_vSlot(__VLS_24);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (isOpen) }, null, null);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col mt-1 rounded-lg bg-surface-white py-1 text-base border-2 max-h-[13rem]" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[13rem]']} */ ;
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.ComboboxOptions | typeof __VLS_components.ComboboxOptions} */
    ComboboxOptions;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        ...{ class: "flex-1 my-1 overflow-y-auto px-1.5" },
        ...{ class: (__VLS_ctx.options.length ? 'min-h-[6rem]' : 'min-h-[3.8rem]') },
        static: true,
    }));
    const __VLS_27 = __VLS_26({
        ...{ class: "flex-1 my-1 overflow-y-auto px-1.5" },
        ...{ class: (__VLS_ctx.options.length ? 'min-h-[6rem]' : 'min-h-[3.8rem]') },
        static: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    const { default: __VLS_30 } = __VLS_28.slots;
    if (__VLS_ctx.options.length) {
        for (const [option] of __VLS_vFor((__VLS_ctx.options))) {
            let __VLS_31;
            /** @ts-ignore @type { | typeof __VLS_components.ComboboxOption | typeof __VLS_components.ComboboxOption} */
            ComboboxOption;
            // @ts-ignore
            const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
                key: (option.value),
                value: (option),
            }));
            const __VLS_33 = __VLS_32({
                key: (option.value),
                value: (option),
            }, ...__VLS_functionalComponentArgsRest(__VLS_32));
            {
                const { default: __VLS_36 } = __VLS_34.slots;
                const [{ active }] = __VLS_vSlot(__VLS_36);
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    ...{ class: ([
                            'flex cursor-pointer items-center rounded px-2 py-1 text-base',
                            { 'bg-surface-gray-2': active },
                        ]) },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex flex-col gap-1 p-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-base font-medium text-ink-gray-8" },
                });
                /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
                (option.value == option.label
                    ? option.description
                    : option.label);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-sm text-ink-gray-5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
                (option.value);
                // @ts-ignore
                [options, options, options,];
                __VLS_34.slots['' /* empty slot name completion */];
            }
            var __VLS_34;
            // @ts-ignore
            [];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-7 px-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        (__VLS_ctx.__('No results found'));
    }
    // @ts-ignore
    [__,];
    var __VLS_28;
    if (__VLS_ctx.attrs.onCreate) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "px-1 pt-2 bg-white border-t" },
        });
        /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        let __VLS_37;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            ...{ 'onClick': {} },
            variant: "ghost",
            ...{ class: "w-full !justify-start" },
            label: (__VLS_ctx.__('Create New')),
        }));
        const __VLS_39 = __VLS_38({
            ...{ 'onClick': {} },
            variant: "ghost",
            ...{ class: "w-full !justify-start" },
            label: (__VLS_ctx.__('Create New')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        let __VLS_42;
        const __VLS_43 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.attrs.onCreate))
                        return;
                    __VLS_ctx.attrs.onCreate(close);
                    // @ts-ignore
                    [__, attrs, attrs,];
                } });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['!justify-start']} */ ;
        const { default: __VLS_44 } = __VLS_40.slots;
        {
            const { prefix: __VLS_45 } = __VLS_40.slots;
            let __VLS_46;
            /** @ts-ignore @type { | typeof __VLS_components.Plus} */
            Plus;
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_48 = __VLS_47({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_40;
        var __VLS_41;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_9;
// @ts-ignore
[];
var __VLS_3;
if (__VLS_ctx.values.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-2 mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    for (const [value] of __VLS_vFor((__VLS_ctx.values))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between break-all bg-surface-gray-2 text-ink-gray-7 word-wrap p-2 rounded-md mr-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['break-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['word-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "break-all" },
        });
        /** @type {__VLS_StyleScopedClasses['break-all']} */ ;
        (value);
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.X} */
        X;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            ...{ 'onClick': {} },
            ...{ class: "size-4 stroke-1.5 cursor-pointer" },
        }));
        const __VLS_53 = __VLS_52({
            ...{ 'onClick': {} },
            ...{ class: "size-4 stroke-1.5 cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        let __VLS_56;
        const __VLS_57 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.values.length))
                        return;
                    __VLS_ctx.removeValue(value);
                    // @ts-ignore
                    [values, values, removeValue,];
                } });
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        var __VLS_54;
        var __VLS_55;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
var __VLS_23 = __VLS_22;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => __VLS_exposed,
    emits: {
        ...{},
        ...{},
    },
    props: {
        ...{},
        ...{
            label: {
                type: String,
            },
            size: {
                type: String,
                default: 'sm',
            },
            doctype: {
                type: String,
                required: true,
            },
            filters: {
                type: Object,
                default: () => ({}),
            },
            validate: {
                type: Function,
                default: null,
            },
            errorMessage: {
                type: Function,
                default: (value) => `${value} is an Invalid value`,
            },
            required: {
                type: Boolean,
            },
        },
    },
});
export default {};
