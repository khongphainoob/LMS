/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import Autocomplete from '@/components/Controls/Autocomplete.vue';
import { watchDebounced } from '@vueuse/core';
import { createResource, Button } from 'frappe-ui';
import { Plus, X } from 'lucide-vue-next';
import { useAttrs, computed, ref } from 'vue';
import { useSettings } from '@/stores/settings';
const props = defineProps({
    doctype: {
        type: String,
        required: true,
    },
    filters: {
        type: Object,
        default: () => ({}),
    },
    modelValue: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
});
const emit = defineEmits(['update:modelValue', 'change']);
const attrs = useAttrs();
const valuePropPassed = computed(() => 'value' in attrs);
const value = computed({
    get: () => (valuePropPassed.value ? attrs.value : props.modelValue),
    set: (val) => {
        return (val?.value &&
            emit(valuePropPassed.value ? 'change' : 'update:modelValue', val?.value));
    },
});
const autocomplete = ref(null);
const text = ref('');
const settingsStore = useSettings();
watchDebounced(() => autocomplete.value?.query, (val) => {
    val = val || '';
    if (text.value === val)
        return;
    text.value = val;
    reload(val);
}, { debounce: 300, immediate: true });
watchDebounced(() => props.doctype, () => reload(''), { debounce: 300, immediate: true });
watchDebounced(() => settingsStore.isSettingsOpen, (isOpen, wasOpen) => {
    if (wasOpen && !isOpen) {
        reload('');
    }
}, { debounce: 200 });
const options = createResource({
    url: 'frappe.desk.search.search_link',
    cache: [props.doctype, text.value],
    method: 'POST',
    auto: true,
    params: {
        txt: text.value,
        doctype: props.doctype,
        filters: props.filters,
    },
    transform: (data) => {
        return data.map((option) => {
            return {
                label: option.label || option.value,
                value: option.value,
                description: option.description,
            };
        });
    },
});
const reload = (val) => {
    options.update({
        params: {
            txt: val,
            doctype: props.doctype,
            filters: props.filters,
        },
    });
    options.reload();
};
const clearValue = (close) => {
    emit(valuePropPassed.value ? 'change' : 'update:modelValue', '');
    close();
};
const labelClasses = computed(() => {
    return [
        {
            sm: 'text-xs',
            md: 'text-base',
        }[attrs.size || 'sm'],
        'text-ink-gray-5',
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1.5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
if (__VLS_ctx.attrs.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block" },
        ...{ class: (__VLS_ctx.labelClasses) },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    (__VLS_ctx.attrs.label);
    if (__VLS_ctx.attrs.required) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-red-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    }
}
const __VLS_0 = Autocomplete || Autocomplete;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ref: "autocomplete",
    options: (__VLS_ctx.options.data),
    modelValue: (__VLS_ctx.value),
    size: (__VLS_ctx.attrs.size || 'sm'),
    variant: (__VLS_ctx.attrs.variant),
    placeholder: (__VLS_ctx.attrs.placeholder),
    filterable: (false),
    readonly: (__VLS_ctx.attrs.readonly),
}));
const __VLS_2 = __VLS_1({
    ref: "autocomplete",
    options: (__VLS_ctx.options.data),
    modelValue: (__VLS_ctx.value),
    size: (__VLS_ctx.attrs.size || 'sm'),
    variant: (__VLS_ctx.attrs.variant),
    placeholder: (__VLS_ctx.attrs.placeholder),
    filterable: (false),
    readonly: (__VLS_ctx.attrs.readonly),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_7 } = __VLS_3.slots;
{
    const { target: __VLS_8 } = __VLS_3.slots;
    const [{ open, togglePopover }] = __VLS_vSlot(__VLS_8);
    var __VLS_9 = {
        ...({ open, togglePopover }),
    };
    // @ts-ignore
    [attrs, attrs, attrs, attrs, attrs, attrs, attrs, labelClasses, options, value,];
}
{
    const { prefix: __VLS_11 } = __VLS_3.slots;
    var __VLS_12 = {};
    // @ts-ignore
    [];
}
{
    const { 'item-prefix': __VLS_14 } = __VLS_3.slots;
    const [{ active, selected, option }] = __VLS_vSlot(__VLS_14);
    var __VLS_15 = {
        ...({ active, selected, option }),
    };
    // @ts-ignore
    [];
}
{
    const { 'item-label': __VLS_17 } = __VLS_3.slots;
    const [{ active, selected, option }] = __VLS_vSlot(__VLS_17);
    var __VLS_18 = {
        ...({ active, selected, option }),
    };
    // @ts-ignore
    [];
}
{
    const { footer: __VLS_20 } = __VLS_3.slots;
    const [{ value, close }] = __VLS_vSlot(__VLS_20);
    if (__VLS_ctx.attrs.onCreate) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        let __VLS_21;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
            ...{ 'onClick': {} },
            variant: "ghost",
            ...{ class: "w-full !justify-start" },
            label: (__VLS_ctx.__('Create New')),
        }));
        const __VLS_23 = __VLS_22({
            ...{ 'onClick': {} },
            variant: "ghost",
            ...{ class: "w-full !justify-start" },
            label: (__VLS_ctx.__('Create New')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        let __VLS_26;
        const __VLS_27 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.attrs.onCreate))
                        return;
                    __VLS_ctx.attrs.onCreate(value, close);
                    // @ts-ignore
                    [attrs, attrs, __,];
                } });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['!justify-start']} */ ;
        const { default: __VLS_28 } = __VLS_24.slots;
        {
            const { prefix: __VLS_29 } = __VLS_24.slots;
            let __VLS_30;
            /** @ts-ignore @type { | typeof __VLS_components.Plus} */
            Plus;
            // @ts-ignore
            const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_32 = __VLS_31({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_31));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_24;
        var __VLS_25;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        ...{ 'onClick': {} },
        variant: "ghost",
        ...{ class: "w-full !justify-start" },
        label: (__VLS_ctx.__('Clear')),
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClick': {} },
        variant: "ghost",
        ...{ class: "w-full !justify-start" },
        label: (__VLS_ctx.__('Clear')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_40;
    const __VLS_41 = ({ click: {} },
        { onClick: (() => __VLS_ctx.clearValue(close)) });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['!justify-start']} */ ;
    const { default: __VLS_42 } = __VLS_38.slots;
    {
        const { prefix: __VLS_43 } = __VLS_38.slots;
        let __VLS_44;
        /** @ts-ignore @type { | typeof __VLS_components.X} */
        X;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_46 = __VLS_45({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [__, clearValue,];
    }
    // @ts-ignore
    [];
    var __VLS_38;
    var __VLS_39;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
if (__VLS_ctx.description) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.description);
}
// @ts-ignore
var __VLS_6 = __VLS_5, __VLS_10 = __VLS_9, __VLS_13 = __VLS_12, __VLS_16 = __VLS_15, __VLS_19 = __VLS_18;
// @ts-ignore
[description, description,];
const __VLS_base = (await import('vue')).defineComponent({
    emits: {},
    props: {
        doctype: {
            type: String,
            required: true,
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        modelValue: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
    },
});
const __VLS_export = {};
export default {};
