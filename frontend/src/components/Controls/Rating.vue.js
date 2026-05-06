/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Star } from 'lucide-vue-next';
import { ref, watch } from 'vue';
const props = defineProps({
    id: {
        type: String,
        default: '',
    },
    modelValue: {
        type: Number,
        default: 0,
    },
    label: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md',
    },
});
const iconClasses = (index) => {
    let classes = [
        {
            sm: 'size-4',
            md: 'size-5',
            lg: 'size-6',
            xl: 'size-7',
        }[props.size],
    ];
    if (index <= hoveredRating.value && index > rating.value) {
        classes.push('fill-yellow-200');
    }
    else if (index <= rating.value) {
        classes.push('fill-yellow-500');
    }
    return classes.join(' ');
};
const emit = defineEmits(['update:modelValue']);
const rating = ref(props.modelValue);
const hoveredRating = ref(0);
let emitChange = (value) => {
    emit('update:modelValue', value);
};
function markRating(index) {
    emitChange(index);
    rating.value = index;
}
watch(() => props.modelValue, (newVal) => {
    rating.value = newVal;
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
    ...{ class: "space-y-1" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
if (props.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (props.label);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex text-center" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
for (const [index] of __VLS_vFor((5))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onMouseover: (...[$event]) => {
                __VLS_ctx.hoveredRating = index;
                // @ts-ignore
                [hoveredRating,];
            } },
        ...{ onMouseleave: (...[$event]) => {
                __VLS_ctx.hoveredRating = 0;
                // @ts-ignore
                [hoveredRating,];
            } },
    });
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Star} */
    Star;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        ...{ class: "fill-gray-400 text-gray-50 stroke-1 mr-1 cursor-pointer" },
        ...{ class: (__VLS_ctx.iconClasses(index)) },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        ...{ class: "fill-gray-400 text-gray-50 stroke-1 mr-1 cursor-pointer" },
        ...{ class: (__VLS_ctx.iconClasses(index)) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.markRating(index);
                // @ts-ignore
                [iconClasses, markRating,];
            } });
    /** @type {__VLS_StyleScopedClasses['fill-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    var __VLS_3;
    var __VLS_4;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    props: {
        id: {
            type: String,
            default: '',
        },
        modelValue: {
            type: Number,
            default: 0,
        },
        label: {
            type: String,
            default: '',
        },
        size: {
            type: String,
            default: 'md',
        },
    },
});
export default {};
