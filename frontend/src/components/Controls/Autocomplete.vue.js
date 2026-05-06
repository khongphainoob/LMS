/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, } from '@headlessui/vue';
import { Popover } from 'frappe-ui';
import { ChevronDown, X } from 'lucide-vue-next';
import { ref, computed, useAttrs, useSlots, watch, nextTick } from 'vue';
const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    options: {
        type: Array,
        default: () => [],
    },
    size: {
        type: String,
        default: 'md',
    },
    label: {
        type: String,
        default: '',
    },
    variant: {
        type: String,
        default: 'subtle',
    },
    placeholder: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    filterable: {
        type: Boolean,
        default: true,
    },
});
const emit = defineEmits(['update:modelValue', 'update:query', 'change']);
const query = ref('');
const showOptions = ref(false);
const search = ref(null);
const attrs = useAttrs();
const slots = useSlots();
const valuePropPassed = computed(() => 'value' in attrs);
const selectedValue = computed({
    get() {
        return valuePropPassed.value ? attrs.value : props.modelValue;
    },
    set(val) {
        query.value = '';
        if (val) {
            showOptions.value = false;
        }
        emit(valuePropPassed.value ? 'change' : 'update:modelValue', val);
    },
});
function close() {
    showOptions.value = false;
}
const groups = computed(() => {
    if (!props.options || props.options.length == 0)
        return [];
    let groups = props.options[0]?.group
        ? props.options
        : [{ group: '', items: props.options }];
    return groups
        .map((group, i) => {
        return {
            key: i,
            group: group.group,
            hideLabel: group.hideLabel || false,
            items: props.filterable ? filterOptions(group.items) : group.items,
        };
    })
        .filter((group) => group.items.length > 0);
});
function filterOptions(options) {
    if (!query.value) {
        return options;
    }
    return options.filter((option) => {
        let searchTexts = [option.label, option.value];
        return searchTexts.some((text) => (text || '').toString().toLowerCase().includes(query.value.toLowerCase()));
    });
}
function displayValue(option) {
    if (typeof option === 'string') {
        let allOptions = groups.value.flatMap((group) => group.items);
        let selectedOption = allOptions.find((o) => o.value === option);
        return selectedOption?.label || option;
    }
    return option?.label;
}
watch(query, (q) => {
    emit('update:query', q);
});
watch(showOptions, (val) => {
    if (val) {
        nextTick(() => {
            search.value.el.focus();
        });
    }
});
const textColor = computed(() => {
    return props.disabled ? 'text-ink-gray-5' : 'text-ink-gray-8';
});
const inputClasses = computed(() => {
    let sizeClasses = {
        sm: 'text-base rounded h-7',
        md: 'text-base rounded h-8',
        lg: 'text-lg rounded-md h-10',
        xl: 'text-xl rounded-md h-10',
    }[props.size];
    let paddingClasses = {
        sm: 'py-1.5 px-2',
        md: 'py-1.5 px-2.5',
        lg: 'py-1.5 px-3',
        xl: 'py-1.5 px-3',
    }[props.size];
    let variant = props.disabled ? 'disabled' : props.variant;
    let variantClasses = {
        subtle: 'border border-gray-100 bg-surface-gray-2 placeholder-ink-gray-4 hover:border-outline-gray-modals hover:bg-surface-gray-3 focus:bg-surface-white focus:border-outline-gray-4 focus:shadow-sm focus:ring-0 focus-visible:ring-2 focus-visible:ring-outline-gray-3',
        outline: 'border border-outline-gray-2 bg-surface-white placeholder-ink-gray-4 hover:border-outline-gray-3 hover:shadow-sm focus:bg-surface-white focus:border-outline-gray-4 focus:shadow-sm focus:ring-0 focus-visible:ring-2 focus-visible:ring-outline-gray-3',
        disabled: [
            'border bg-surface-menu-bar placeholder-ink-gray-3',
            props.variant === 'outline'
                ? 'border-outline-gray-2'
                : 'border-transparent',
        ],
    }[variant];
    return [
        sizeClasses,
        paddingClasses,
        variantClasses,
        textColor.value,
        'transition-colors w-full',
    ];
});
const __VLS_exposed = { query };
defineExpose(__VLS_exposed);
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.__(__VLS_ctx.label));
    if (__VLS_ctx.attrs.required) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-red-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    }
}
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
{
    const { default: __VLS_5 } = __VLS_3.slots;
    const [{ open: isComboboxOpen }] = __VLS_vSlot(__VLS_5);
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
        const [{ open: openPopover, togglePopover }] = __VLS_vSlot(__VLS_12);
        var __VLS_13 = {
            ...({ open: openPopover, togglePopover }),
        };
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (() => togglePopover()) },
            ...{ class: "flex w-full items-center justify-between focus:outline-none" },
            ...{ class: (__VLS_ctx.inputClasses) },
            disabled: (__VLS_ctx.attrs.readonly),
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center w-[90%]" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-[90%]']} */ ;
        var __VLS_15 = {};
        if (__VLS_ctx.selectedValue) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "block truncate text-base leading-5" },
            });
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            (__VLS_ctx.displayValue(__VLS_ctx.selectedValue));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-base leading-5 text-ink-gray-4" },
            });
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
            (__VLS_ctx.placeholder || '');
        }
        let __VLS_17;
        /** @ts-ignore @type { | typeof __VLS_components.ChevronDown} */
        ChevronDown;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_19 = __VLS_18({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [label, label, __, attrs, attrs, selectedValue, selectedValue, selectedValue, showOptions, inputClasses, displayValue, placeholder,];
    }
    {
        const { body: __VLS_22 } = __VLS_9.slots;
        const [{ isOpen }] = __VLS_vSlot(__VLS_22);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (isOpen) }, null, null);
        /** @type {__VLS_StyleScopedClasses['']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-1 rounded-lg bg-surface-white py-1 text-base border-2" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative px-1.5 pt-0.5" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-0.5']} */ ;
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.ComboboxInput} */
        ComboboxInput;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            ...{ 'onChange': {} },
            ref: "search",
            ...{ class: "form-input w-full" },
            type: "text",
            value: (__VLS_ctx.query),
            autocomplete: "off",
            placeholder: "Search",
        }));
        const __VLS_25 = __VLS_24({
            ...{ 'onChange': {} },
            ref: "search",
            ...{ class: "form-input w-full" },
            type: "text",
            value: (__VLS_ctx.query),
            autocomplete: "off",
            placeholder: "Search",
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        let __VLS_28;
        const __VLS_29 = ({ change: {} },
            { onChange: ((e) => {
                    __VLS_ctx.query = e.target.value;
                }) });
        var __VLS_30 = {};
        /** @type {__VLS_StyleScopedClasses['form-input']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_26;
        var __VLS_27;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.selectedValue = null;
                    // @ts-ignore
                    [selectedValue, query, query,];
                } },
            ...{ class: "absolute right-1.5 inline-flex h-7 w-7 items-center justify-center" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        let __VLS_32;
        /** @ts-ignore @type { | typeof __VLS_components.X} */
        X;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            ...{ class: "h-4 w-4 stroke-1.5 text-ink-gray-7" },
        }));
        const __VLS_34 = __VLS_33({
            ...{ class: "h-4 w-4 stroke-1.5 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        let __VLS_37;
        /** @ts-ignore @type { | typeof __VLS_components.ComboboxOptions | typeof __VLS_components.ComboboxOptions} */
        ComboboxOptions;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            ...{ class: "my-1 max-h-[12rem] overflow-y-auto px-1.5" },
            static: true,
        }));
        const __VLS_39 = __VLS_38({
            ...{ class: "my-1 max-h-[12rem] overflow-y-auto px-1.5" },
            static: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-[12rem]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        const { default: __VLS_42 } = __VLS_40.slots;
        for (const [group] of __VLS_vFor((__VLS_ctx.groups))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mt-1.5" },
                key: (group.key),
            });
            __VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (group.items.length > 0) }, null, null);
            /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
            if (group.group && !group.hideLabel) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "px-2.5 py-1.5 text-sm font-medium text-ink-gray-4" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
                (group.group);
            }
            for (const [option] of __VLS_vFor((group.items))) {
                let __VLS_43;
                /** @ts-ignore @type { | typeof __VLS_components.ComboboxOption | typeof __VLS_components.ComboboxOption} */
                ComboboxOption;
                // @ts-ignore
                const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
                    as: "template",
                    key: (option.value),
                    value: (option),
                }));
                const __VLS_45 = __VLS_44({
                    as: "template",
                    key: (option.value),
                    value: (option),
                }, ...__VLS_functionalComponentArgsRest(__VLS_44));
                {
                    const { default: __VLS_48 } = __VLS_46.slots;
                    const [{ active, selected }] = __VLS_vSlot(__VLS_48);
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        ...{ class: ([
                                'flex items-center rounded px-2.5 py-2 text-base',
                                { 'bg-surface-gray-2': active },
                            ]) },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
                    var __VLS_49 = {
                        ...({ active, selected, option }),
                    };
                    var __VLS_51 = {
                        ...({ active, selected, option }),
                    };
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
                    [groups,];
                    __VLS_46.slots['' /* empty slot name completion */];
                }
                var __VLS_46;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
        }
        if (__VLS_ctx.groups.length == 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                ...{ class: "mt-1.5 rounded-md px-2.5 py-1.5 text-base text-ink-gray-5" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        }
        // @ts-ignore
        [groups,];
        var __VLS_40;
        if (__VLS_ctx.slots.footer) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "border-t p-1.5 pb-0.5" },
            });
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['pb-0.5']} */ ;
            var __VLS_53 = {
                ...({ value: __VLS_ctx.search?.el._value, close: __VLS_ctx.close }),
            };
        }
        // @ts-ignore
        [slots, search, close,];
    }
    // @ts-ignore
    [];
    var __VLS_9;
    // @ts-ignore
    [];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
// @ts-ignore
var __VLS_14 = __VLS_13, __VLS_16 = __VLS_15, __VLS_31 = __VLS_30, __VLS_50 = __VLS_49, __VLS_52 = __VLS_51, __VLS_54 = __VLS_53;
// @ts-ignore
[];
const __VLS_base = (await import('vue')).defineComponent({
    setup: () => __VLS_exposed,
    emits: {},
    props: {
        modelValue: {
            type: String,
            default: '',
        },
        options: {
            type: Array,
            default: () => [],
        },
        size: {
            type: String,
            default: 'md',
        },
        label: {
            type: String,
            default: '',
        },
        variant: {
            type: String,
            default: 'subtle',
        },
        placeholder: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        filterable: {
            type: Boolean,
            default: true,
        },
    },
});
const __VLS_export = {};
export default {};
