/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
// import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Popover, FileUploader, Button } from 'frappe-ui';
export default {};
const __VLS_ctx = {};
const __VLS_componentsOption = {
    Popover,
    FileUploader,
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
        ...{ class: "absolute left-1/2 mt-3 max-w-sm -translate-x-1/2 transform rounded-lg bg-surface-white px-4 sm:px-0 lg:max-w-3xl" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
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
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.TextInput} */
    TextInput;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        type: "text",
        placeholder: "search by keyword",
        modelValue: (__VLS_ctx.search),
        debounce: (300),
    }));
    const __VLS_13 = __VLS_12({
        type: "text",
        placeholder: "search by keyword",
        modelValue: (__VLS_ctx.search),
        debounce: (300),
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    let __VLS_16;
    /** @ts-ignore @type { | typeof __VLS_components.FileUploader | typeof __VLS_components.FileUploader} */
    FileUploader;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        ...{ 'onSuccess': {} },
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onSuccess': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_21;
    const __VLS_22 = ({ success: {} },
        { onSuccess: ((file) => __VLS_ctx.$emit('select', file.file_url)) });
    const { default: __VLS_23 } = __VLS_19.slots;
    {
        const { default: __VLS_24 } = __VLS_19.slots;
        const [{ file, progress, uploading, openFileSelector }] = __VLS_vSlot(__VLS_24);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-full text-center" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
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
        [search, $emit,];
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
    for (const [image] of __VLS_vFor((__VLS_ctx.$resources.images.data))) {
        let __VLS_33;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
            ...{ 'onClick': {} },
            key: (image.id),
            ...{ class: "h-[50px] w-[200px] overflow-hidden rounded hover:opacity-80" },
        }));
        const __VLS_35 = __VLS_34({
            ...{ 'onClick': {} },
            key: (image.id),
            ...{ class: "h-[50px] w-[200px] overflow-hidden rounded hover:opacity-80" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        let __VLS_38;
        const __VLS_39 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.$emit('select', image.urls.raw);
                    // @ts-ignore
                    [$emit, $resources,];
                } });
        /** @type {__VLS_StyleScopedClasses['h-[50px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-[200px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:opacity-80']} */ ;
        const { default: __VLS_40 } = __VLS_36.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (image.urls.raw +
                '&w=200&h=50&fit=crop&crop=entropy,faces,focalpoint'),
        });
        // @ts-ignore
        [];
        var __VLS_36;
        var __VLS_37;
        // @ts-ignore
        [];
    }
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
    // @ts-ignore
    [__, __,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_9 = __VLS_8;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    name: 'UnsplashImageBrowser',
    components: {
        Popover,
        FileUploader,
    },
    emits: ['select'],
    resources: {
        images() {
            return {
                url: 'gameplan.api.get_unsplash_photos',
                params: { keyword: this.search },
                auto: true,
                debounce: 500,
            };
        },
    },
    data() {
        return {
            search: '',
        };
    },
});
