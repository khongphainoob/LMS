/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog } from 'frappe-ui';
import { computed } from 'vue';
import VideoBlock from '@/components/VideoBlock.vue';
const show = defineModel();
const props = defineProps({
    type: {
        type: [String, null],
        required: true,
    },
    title: {
        type: [String, null],
        required: true,
    },
});
const file = computed(() => {
    if (props.type == 'youtube')
        return '/assets/lms/frontend/Youtube.mp4';
    if (props.type == 'quiz')
        return '/assets/lms/frontend/Quiz.mp4';
    if (props.type == 'upload')
        return '/assets/lms/frontend/Upload.mp4';
    if (props.type == 'remove')
        return '/assets/lms/frontend/Remove.mp4';
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
        title: __VLS_ctx.title,
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '4xl',
        title: __VLS_ctx.title,
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    const __VLS_8 = VideoBlock;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        file: (__VLS_ctx.file),
    }));
    const __VLS_10 = __VLS_9({
        file: (__VLS_ctx.file),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    // @ts-ignore
    [show, title, file,];
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
            type: {
                type: [String, null],
                required: true,
            },
            title: {
                type: [String, null],
                required: true,
            },
        },
    },
});
export default {};
