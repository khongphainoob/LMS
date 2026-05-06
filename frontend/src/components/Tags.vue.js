/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { FormControl } from 'frappe-ui';
import { X } from 'lucide-vue-next';
import { ref } from 'vue';
const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: 'Tags',
    },
});
let tags = ref(props.modelValue);
const emit = defineEmits(['update:modelValue']);
let newTag = ref('');
let emitChange = (value) => {
    emit('update:modelValue', value);
};
const updateTags = () => {
    if (newTag) {
        tags.value = tags.value ? `${tags.value}, ${newTag}` : newTag;
        newTag.value = '';
        emitChange(tags.value);
    }
};
const removeTag = (tag) => {
    tags.value = tags.value.replace(tag, '').replace(', ,', ',');
    emitChange(tags.value);
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
    ...{ class: "mb-1.5 text-sm text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
(__VLS_ctx.__(__VLS_ctx.label));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
(__VLS_ctx.tags);
for (const [tag] of __VLS_vFor((__VLS_ctx.tags?.split(', ')))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center bg-surface-gray-2 p-2 rounded-md mr-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    (tag);
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.X} */
    X;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        ...{ class: "stroke-1.5 w-3 h-3 ml-2 cursor-pointer" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        ...{ class: "stroke-1.5 w-3 h-3 ml-2 cursor-pointer" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.removeTag(tag);
                // @ts-ignore
                [__, label, tags, tags, removeTag,];
            } });
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    var __VLS_3;
    var __VLS_4;
    // @ts-ignore
    [];
}
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.newTag),
}));
const __VLS_9 = __VLS_8({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.newTag),
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_12;
const __VLS_13 = ({ keyup: {} },
    { onKeyup: (...[$event]) => {
            __VLS_ctx.updateTags();
            // @ts-ignore
            [newTag, updateTags,];
        } });
var __VLS_10;
var __VLS_11;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    props: {
        modelValue: {
            type: String,
            default: '',
        },
        label: {
            type: String,
            default: 'Tags',
        },
    },
});
export default {};
