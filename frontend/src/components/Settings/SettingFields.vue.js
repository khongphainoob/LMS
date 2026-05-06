/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { FormControl, FileUploader, Button, Switch } from 'frappe-ui';
import { computed, onMounted, watch } from 'vue';
import { getFileSize, validateFile } from '@/utils';
import { X } from 'lucide-vue-next';
import Link from '@/components/Controls/Link.vue';
import CodeEditor from '@/components/Controls/CodeEditor.vue';
const props = defineProps({
    sections: {
        type: Array,
        required: true,
    },
    data: {
        type: Object,
        required: true,
    },
});
onMounted(() => {
    props.sections.forEach((section) => {
        section.columns.forEach((column) => {
            column.fields.forEach((field) => {
                if (field.type == 'checkbox') {
                    field.value = props.data[field.name] ? true : false;
                }
                else {
                    field.value = props.data[field.name];
                }
            });
        });
    });
});
watch(props.sections, (newSections) => {
    // Makes the form dirty on change
    newSections.forEach((section) => {
        section.columns.forEach((column) => {
            column.fields.forEach((field) => {
                if (props.data[field.name] != field.value) {
                    props.data[field.name] = field.value;
                }
            });
        });
    });
}, { deep: true });
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-5 divide-y overflow-y-auto" },
});
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
for (const [section, index] of __VLS_vFor((__VLS_ctx.sections))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "py-5" },
    });
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    if (section.label) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-semibold text-ink-gray-9 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        (section.label);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: ({
                'flex justify-between space-x-8 w-full': section.columns.length > 1,
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    for (const [column, index] of __VLS_vFor((section.columns))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-full space-y-5" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
        for (const [field] of __VLS_vFor((column.fields))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            if (field.type == 'Link') {
                const __VLS_0 = Link;
                // @ts-ignore
                const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                    modelValue: (__VLS_ctx.data[field.name]),
                    doctype: (field.doctype),
                    label: (__VLS_ctx.__(field.label)),
                    description: (__VLS_ctx.__(field.description)),
                }));
                const __VLS_2 = __VLS_1({
                    modelValue: (__VLS_ctx.data[field.name]),
                    doctype: (field.doctype),
                    label: (__VLS_ctx.__(field.label)),
                    description: (__VLS_ctx.__(field.description)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            }
            else if (field.type == 'Code') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                const __VLS_5 = CodeEditor || CodeEditor;
                // @ts-ignore
                const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                    label: (__VLS_ctx.__(field.label)),
                    type: "HTML",
                    description: "The HTML you add here will be shown on your sign up page.",
                    modelValue: (__VLS_ctx.data[field.name]),
                    height: "250px",
                    ...{ class: "shrink-0" },
                    showLineNumbers: (true),
                }));
                const __VLS_7 = __VLS_6({
                    label: (__VLS_ctx.__(field.label)),
                    type: "HTML",
                    description: "The HTML you add here will be shown on your sign up page.",
                    modelValue: (__VLS_ctx.data[field.name]),
                    height: "250px",
                    ...{ class: "shrink-0" },
                    showLineNumbers: (true),
                }, ...__VLS_functionalComponentArgsRest(__VLS_6));
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            }
            else if (field.type == 'Upload') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "space-y-1 mb-2" },
                });
                /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-sm text-ink-gray-9 font-medium" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                (__VLS_ctx.__(field.label));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-sm text-ink-gray-5 leading-5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                (__VLS_ctx.__(field.description));
                if (!__VLS_ctx.data[field.name]) {
                    let __VLS_10;
                    /** @ts-ignore @type { | typeof __VLS_components.FileUploader | typeof __VLS_components.FileUploader} */
                    FileUploader;
                    // @ts-ignore
                    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
                        ...{ 'onSuccess': {} },
                        fileTypes: (['image/*']),
                        validateFile: (__VLS_ctx.validateFile),
                    }));
                    const __VLS_12 = __VLS_11({
                        ...{ 'onSuccess': {} },
                        fileTypes: (['image/*']),
                        validateFile: (__VLS_ctx.validateFile),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
                    let __VLS_15;
                    const __VLS_16 = ({ success: {} },
                        { onSuccess: ((file) => (__VLS_ctx.data[field.name] = file)) });
                    const { default: __VLS_17 } = __VLS_13.slots;
                    {
                        const { default: __VLS_18 } = __VLS_13.slots;
                        const [{ file, progress, uploading, openFileSelector }] = __VLS_vSlot(__VLS_18);
                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                            ...{ class: "" },
                        });
                        /** @type {__VLS_StyleScopedClasses['']} */ ;
                        let __VLS_19;
                        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                        Button;
                        // @ts-ignore
                        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                            ...{ 'onClick': {} },
                            loading: (uploading),
                        }));
                        const __VLS_21 = __VLS_20({
                            ...{ 'onClick': {} },
                            loading: (uploading),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
                        let __VLS_24;
                        const __VLS_25 = ({ click: {} },
                            { onClick: (openFileSelector) });
                        const { default: __VLS_26 } = __VLS_22.slots;
                        (uploading ? `Uploading ${progress}%` : 'Upload an image');
                        // @ts-ignore
                        [sections, data, data, data, data, __, __, __, __, __, validateFile,];
                        var __VLS_22;
                        var __VLS_23;
                        // @ts-ignore
                        [];
                        __VLS_13.slots['' /* empty slot name completion */];
                    }
                    // @ts-ignore
                    [];
                    var __VLS_13;
                    var __VLS_14;
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex items-center text-sm space-x-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex items-center justify-center rounded border border-outline-gray-modals bg-surface-gray-2" },
                        ...{ class: (field.size == 'lg' ? 'px-5 py-5' : 'px-20 py-8') },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-outline-gray-modals']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                        src: (__VLS_ctx.data[field.name]?.file_url || __VLS_ctx.data[field.name]),
                        ...{ class: "rounded" },
                        ...{ class: (field.size == 'lg' ? 'w-36' : 'size-6') },
                    });
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex flex-col flex-wrap" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "break-all text-ink-gray-9" },
                    });
                    /** @type {__VLS_StyleScopedClasses['break-all']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                    (__VLS_ctx.data[field.name]?.file_name ||
                        __VLS_ctx.data[field.name].split('/').pop());
                    if (__VLS_ctx.data[field.name]?.file_size) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "text-sm text-ink-gray-5 mt-1" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
                        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                        (__VLS_ctx.getFileSize(__VLS_ctx.data[field.name]?.file_size));
                    }
                    let __VLS_27;
                    /** @ts-ignore @type { | typeof __VLS_components.X} */
                    X;
                    // @ts-ignore
                    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
                        ...{ 'onClick': {} },
                        ...{ class: "border text-ink-gray-7 border-outline-gray-modals rounded-md cursor-pointer stroke-1.5 w-5 h-5 p-1 ml-4" },
                    }));
                    const __VLS_29 = __VLS_28({
                        ...{ 'onClick': {} },
                        ...{ class: "border text-ink-gray-7 border-outline-gray-modals rounded-md cursor-pointer stroke-1.5 w-5 h-5 p-1 ml-4" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
                    let __VLS_32;
                    const __VLS_33 = ({ click: {} },
                        { onClick: (...[$event]) => {
                                if (!!(field.type == 'Link'))
                                    return;
                                if (!!(field.type == 'Code'))
                                    return;
                                if (!(field.type == 'Upload'))
                                    return;
                                if (!!(!__VLS_ctx.data[field.name]))
                                    return;
                                __VLS_ctx.data[field.name] = null;
                                // @ts-ignore
                                [data, data, data, data, data, data, data, getFileSize,];
                            } });
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-outline-gray-modals']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
                    var __VLS_30;
                    var __VLS_31;
                }
            }
            else if (field.type == 'checkbox') {
                let __VLS_34;
                /** @ts-ignore @type { | typeof __VLS_components.Switch} */
                Switch;
                // @ts-ignore
                const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                    size: "sm",
                    label: (__VLS_ctx.__(field.label)),
                    description: (__VLS_ctx.__(field.description)),
                    modelValue: (field.value),
                }));
                const __VLS_36 = __VLS_35({
                    size: "sm",
                    label: (__VLS_ctx.__(field.label)),
                    description: (__VLS_ctx.__(field.description)),
                    modelValue: (field.value),
                }, ...__VLS_functionalComponentArgsRest(__VLS_35));
            }
            else {
                let __VLS_39;
                /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
                FormControl;
                // @ts-ignore
                const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
                    key: (field.name),
                    modelValue: (__VLS_ctx.data[field.name]),
                    label: (__VLS_ctx.__(field.label)),
                    type: (field.type),
                    rows: (field.rows),
                    options: (field.options),
                    description: (field.description),
                    placeholder: "",
                }));
                const __VLS_41 = __VLS_40({
                    key: (field.name),
                    modelValue: (__VLS_ctx.data[field.name]),
                    label: (__VLS_ctx.__(field.label)),
                    type: (field.type),
                    rows: (field.rows),
                    options: (field.options),
                    description: (field.description),
                    placeholder: "",
                }, ...__VLS_functionalComponentArgsRest(__VLS_40));
            }
            // @ts-ignore
            [data, __, __, __,];
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        sections: {
            type: Array,
            required: true,
        },
        data: {
            type: Object,
            required: true,
        },
    },
});
export default {};
