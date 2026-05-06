/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { FormControl, Popover } from 'frappe-ui';
import * as icons from 'lucide-vue-next';
import { ref, computed, onMounted, nextTick } from 'vue';
const iconQuery = ref('');
const selectedIcon = ref('');
const search = ref(null);
const emit = defineEmits(['update:modelValue', 'change']);
const iconArray = ref(Object.keys(icons)
    .sort(() => 0.5 - Math.random())
    .slice(0, 100)
    .reduce((result, key) => {
    result[key] = icons[key];
    return result;
}, {}));
const props = defineProps({
    label: {
        type: String,
        default: 'Icon',
    },
    modelValue: {
        type: String,
        default: '',
    },
});
onMounted(() => {
    selectedIcon.value = props.modelValue;
});
const setIcon = (icon, close) => {
    emit('update:modelValue', icon);
    selectedIcon.value = icon;
    iconQuery.value = '';
    close();
};
const filteredIcons = computed(() => {
    if (!iconQuery.value) {
        return iconArray.value;
    }
    return Object.keys(icons)
        .filter((icon) => icon.toLowerCase().includes(iconQuery.value.toLowerCase()))
        .reduce((result, key) => {
        result[key] = icons[key];
        return result;
    }, {});
});
const openPopover = (togglePopover) => {
    togglePopover();
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1.5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-xs text-ink-gray-5" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
(__VLS_ctx.label);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-full" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
Popover;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { target: __VLS_6 } = __VLS_3.slots;
    const [{ togglePopover }] = __VLS_vSlot(__VLS_6);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openPopover(togglePopover);
                // @ts-ignore
                [label, openPopover,];
            } },
        ...{ class: "flex w-full items-center space-x-2 focus:outline-none bg-surface-gray-2 rounded h-7 py-1.5 px-2 hover:bg-surface-gray-3 focus:bg-surface-white border border-gray-100 hover:border-outline-gray-modals focus:border-outline-gray-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-outline-gray-modals']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-outline-gray-4']} */ ;
    if (__VLS_ctx.selectedIcon) {
        const __VLS_7 = (__VLS_ctx.icons[__VLS_ctx.selectedIcon]);
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            ...{ class: "w-4 h-4 text-ink-gray-7 stroke-1.5" },
        }));
        const __VLS_9 = __VLS_8({
            ...{ class: "w-4 h-4 text-ink-gray-7 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    }
    else {
        const __VLS_12 = (__VLS_ctx.icons.Folder);
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            ...{ class: "w-4 h-4 text-ink-gray-7 stroke-1.5" },
        }));
        const __VLS_14 = __VLS_13({
            ...{ class: "w-4 h-4 text-ink-gray-7 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    }
    if (__VLS_ctx.selectedIcon) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.selectedIcon);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (__VLS_ctx.__('Choose an icon'));
    }
    // @ts-ignore
    [selectedIcon, selectedIcon, selectedIcon, selectedIcon, icons, icons, __,];
}
{
    const { 'body-main': __VLS_17 } = __VLS_3.slots;
    const [{ close, isOpen }] = __VLS_vSlot(__VLS_17);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-3 max-h-56 overflow-auto w-full" },
    });
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-56']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ref: "search",
        modelValue: (__VLS_ctx.iconQuery),
        placeholder: (__VLS_ctx.__('Search for an icon')),
        autocomplete: "off",
    }));
    const __VLS_20 = __VLS_19({
        ref: "search",
        modelValue: (__VLS_ctx.iconQuery),
        placeholder: (__VLS_ctx.__('Search for an icon')),
        autocomplete: "off",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    var __VLS_23 = {};
    var __VLS_21;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-10 gap-4 mt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    for (const [iconComponent, iconName] of __VLS_vFor((__VLS_ctx.filteredIcons))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        const __VLS_25 = (iconComponent);
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
            ...{ 'onClick': {} },
            ...{ class: "h-4 w-4 stroke-1.5 text-ink-gray-7 cursor-pointer" },
        }));
        const __VLS_27 = __VLS_26({
            ...{ 'onClick': {} },
            ...{ class: "h-4 w-4 stroke-1.5 text-ink-gray-7 cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        let __VLS_30;
        const __VLS_31 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.setIcon(iconName, close);
                    // @ts-ignore
                    [__, iconQuery, filteredIcons, setIcon,];
                } });
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        var __VLS_28;
        var __VLS_29;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_24 = __VLS_23;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    props: {
        label: {
            type: String,
            default: 'Icon',
        },
        modelValue: {
            type: String,
            default: '',
        },
    },
});
export default {};
