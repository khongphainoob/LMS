/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { validateFile } from '@/utils';
import { Button, FileUploader } from 'frappe-ui';
import { Image, Video } from 'lucide-vue-next';
import { computed } from 'vue';
const emit = defineEmits();
const props = withDefaults(defineProps(), {
    modelValue: '',
    label: '',
    description: '',
    type: 'image',
    required: true,
    shape: 'square',
});
const fileType = computed(() => {
    return props.type === 'image' ? 'image/*' : 'video/*';
});
const saveFile = (file) => {
    emit('update:modelValue', file.file_url);
};
const removeImage = () => {
    emit('update:modelValue', '');
};
const __VLS_defaults = {
    modelValue: '',
    label: '',
    description: '',
    type: 'image',
    required: true,
    shape: 'square',
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
    ...{ class: "mb-4" },
});
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5 mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    (__VLS_ctx.__(__VLS_ctx.label));
    if (__VLS_ctx.required) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-red-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    }
}
if (!__VLS_ctx.modelValue) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.FileUploader | typeof __VLS_components.FileUploader} */
    FileUploader;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onSuccess': {} },
        fileTypes: ([__VLS_ctx.fileType]),
        validateFile: ((file) => __VLS_ctx.validateFile(file, true, __VLS_ctx.type)),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onSuccess': {} },
        fileTypes: ([__VLS_ctx.fileType]),
        validateFile: ((file) => __VLS_ctx.validateFile(file, true, __VLS_ctx.type)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ success: {} },
        { onSuccess: ((file) => __VLS_ctx.saveFile(file)) });
    const { default: __VLS_7 } = __VLS_3.slots;
    {
        const { default: __VLS_8 } = __VLS_3.slots;
        const [{ file, progress, uploading, openFileSelector }] = __VLS_vSlot(__VLS_8);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border rounded-md w-fit py-7 px-20" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-20']} */ ;
        const __VLS_9 = (props.type === 'image' ? __VLS_ctx.Image : __VLS_ctx.Video);
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
            ...{ class: "size-5 stroke-1 text-ink-gray-7" },
        }));
        const __VLS_11 = __VLS_10({
            ...{ class: "size-5 stroke-1 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ml-4" },
        });
        /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ 'onClick': {} },
        }));
        const __VLS_16 = __VLS_15({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        let __VLS_19;
        const __VLS_20 = ({ click: {} },
            { onClick: (openFileSelector) });
        const { default: __VLS_21 } = __VLS_17.slots;
        (__VLS_ctx.__('Upload'));
        // @ts-ignore
        [label, label, __, __, required, modelValue, fileType, validateFile, type, saveFile, Image, Video,];
        var __VLS_17;
        var __VLS_18;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-1 text-ink-gray-5 text-sm leading-5" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        (__VLS_ctx.__(__VLS_ctx.description));
        // @ts-ignore
        [__, description,];
        __VLS_3.slots['' /* empty slot name completion */];
    }
    // @ts-ignore
    [];
    var __VLS_3;
    var __VLS_4;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    if (__VLS_ctx.type == 'image') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.modelValue),
            ...{ class: ([
                    'border object-cover',
                    __VLS_ctx.shape === 'circle'
                        ? 'w-20 h-20 rounded-full'
                        : 'w-44 h-auto min-h-20 rounded-md',
                ]) },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
            controls: true,
            ...{ class: "border rounded-md w-44 h-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-44']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.source)({
            src: (__VLS_ctx.modelValue),
        });
        (__VLS_ctx.__('Your browser does not support the video tag.'));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ml-4" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
    let __VLS_22;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        ...{ 'onClick': {} },
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_27;
    const __VLS_28 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.modelValue))
                    return;
                __VLS_ctx.removeImage();
                // @ts-ignore
                [__, modelValue, modelValue, type, shape, removeImage,];
            } });
    const { default: __VLS_29 } = __VLS_25.slots;
    (__VLS_ctx.__('Remove'));
    // @ts-ignore
    [__,];
    var __VLS_25;
    var __VLS_26;
    if (__VLS_ctx.description) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-2 text-ink-gray-5 text-sm leading-5" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        (__VLS_ctx.__(__VLS_ctx.description));
    }
}
// @ts-ignore
[__, description, description,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
