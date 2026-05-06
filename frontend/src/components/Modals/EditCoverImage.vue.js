/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Popover, TextInput, FileUploader, Button, createResource, } from 'frappe-ui';
import { ref, watch } from 'vue';
const search = ref(null);
const emit = defineEmits(['select']);
const images = createResource({
    url: 'lms.lms.api.get_unsplash_photos',
    makeParams: () => {
        return {
            keyword: search.value,
        };
    },
    auto: true,
    debounce: 500,
});
watch(() => search.value, () => {
    images.reload();
});
const saveImage = (file) => {
    emit('select', file.file_url);
};
const validateFile = (file) => {
    let extension = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(extension)) {
        return 'Only image file is allowed.';
    }
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
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
Popover;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    transition: "default",
}));
const __VLS_2 = __VLS_1({
    transition: "default",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { target: __VLS_7 } = __VLS_3.slots;
    const [{ isOpen, togglePopover }] = __VLS_vSlot(__VLS_7);
    var __VLS_8 = {
        ...({ isOpen, togglePopover }),
    };
}
{
    const { body: __VLS_10 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute left-1/2 mt-3 w-96 max-w-lg -translate-x-1/2 transform rounded-lg bg-surface-white px-4 sm:px-0 lg:max-w-3xl" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-96']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:px-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:max-w-3xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "overflow-hidden rounded-lg p-3 shadow-2xl ring-1 ring-black ring-opacity-5" },
    });
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-opacity-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.TextInput} */
    TextInput;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        type: "text",
        placeholder: "search by keyword",
        modelValue: (__VLS_ctx.search),
        debounce: (300),
        ...{ class: "flex-1" },
    }));
    const __VLS_13 = __VLS_12({
        type: "text",
        placeholder: "search by keyword",
        modelValue: (__VLS_ctx.search),
        debounce: (300),
        ...{ class: "flex-1" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    let __VLS_16;
    /** @ts-ignore @type { | typeof __VLS_components.FileUploader | typeof __VLS_components.FileUploader} */
    FileUploader;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        ...{ 'onSuccess': {} },
        fileTypes: (['image/*']),
        validateFile: (__VLS_ctx.validateFile),
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onSuccess': {} },
        fileTypes: (['image/*']),
        validateFile: (__VLS_ctx.validateFile),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_21;
    const __VLS_22 = ({ success: {} },
        { onSuccess: ((file) => __VLS_ctx.saveImage(file)) });
    const { default: __VLS_23 } = __VLS_19.slots;
    {
        const { default: __VLS_24 } = __VLS_19.slots;
        const [{ file, progress, uploading, openFileSelector }] = __VLS_vSlot(__VLS_24);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "" },
        });
        /** @type {__VLS_StyleScopedClasses['']} */ ;
        let __VLS_25;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
            ...{ 'onClick': {} },
            loading: (uploading),
        }));
        const __VLS_27 = __VLS_26({
            ...{ 'onClick': {} },
            loading: (uploading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        let __VLS_30;
        const __VLS_31 = ({ click: {} },
            { onClick: (openFileSelector) });
        const { default: __VLS_32 } = __VLS_28.slots;
        (uploading ? `Uploading ${progress}%` : 'Upload Image');
        // @ts-ignore
        [search, validateFile, saveImage,];
        var __VLS_28;
        var __VLS_29;
        // @ts-ignore
        [];
        __VLS_19.slots['' /* empty slot name completion */];
    }
    // @ts-ignore
    [];
    var __VLS_19;
    var __VLS_20;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative mt-2 grid w-[25.5rem] gap-2 bg-surface-white lg:grid-cols-2" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[25.5rem]']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
    for (const [image] of __VLS_vFor((__VLS_ctx.images.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.$emit('select', image.urls.raw);
                    // @ts-ignore
                    [images, $emit,];
                } },
            key: (image.id),
            ...{ class: "h-[50px] w-[200px] overflow-hidden rounded hover:opacity-80" },
        });
        /** @type {__VLS_StyleScopedClasses['h-[50px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-[200px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:opacity-80']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (image.urls.raw +
                '&w=200&h=50&fit=crop&crop=entropy,faces,focalpoint'),
        });
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.images.data) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-2 text-center text-sm text-ink-gray-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
        (__VLS_ctx.__('Image search powered by'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            ...{ class: "underline" },
            target: "_blank",
            href: "https://unsplash.com",
        });
        /** @type {__VLS_StyleScopedClasses['underline']} */ ;
        (__VLS_ctx.__('Unsplash'));
    }
    // @ts-ignore
    [images, __, __,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_9 = __VLS_8;
// @ts-ignore
[];
const __VLS_base = (await import('vue')).defineComponent({
    emits: {},
});
const __VLS_export = {};
export default {};
