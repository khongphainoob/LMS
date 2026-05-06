/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, createResource, Dialog, FileUploader, FormControl, Switch, toast, } from 'frappe-ui';
import { reactive, watch, inject } from 'vue';
import { getFileSize } from '@/utils/';
import { FileText, X } from 'lucide-vue-next';
import { useOnboarding, useTelemetry } from 'frappe-ui/frappe';
const show = defineModel();
const outline = defineModel('outline');
const user = inject('$user');
const { capture } = useTelemetry();
const { updateOnboardingStep } = useOnboarding('learning');
const props = defineProps({
    course: {
        type: String,
        required: true,
    },
    chapterDetail: {
        type: Object,
    },
});
const chapter = reactive({
    title: '',
    is_scorm_package: 0,
    scorm_package: null,
});
const chapterResource = createResource({
    url: 'lms.lms.api.upsert_chapter',
    makeParams(values) {
        return {
            title: chapter.title,
            course: props.course,
            is_scorm_package: chapter.is_scorm_package,
            scorm_package: chapter.scorm_package,
            name: props.chapterDetail?.name,
        };
    },
});
const chapterReference = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'Chapter Reference',
                chapter: values.name,
                parent: props.course,
                parenttype: 'LMS Course',
                parentfield: 'chapters',
            },
        };
    },
});
const addChapter = async (close) => {
    chapterResource.submit({}, {
        validate() {
            return validateChapter();
        },
        onSuccess: (data) => {
            if (user.data?.is_system_manager)
                updateOnboardingStep('create_first_chapter');
            capture('chapter_created');
            chapterReference.submit({ name: data.name }, {
                onSuccess(data) {
                    cleanChapter();
                    outline.value.reload();
                    toast.success(__('Chapter added successfully'));
                },
                onError(err) {
                    toast.error(err.messages?.[0] || err);
                },
            });
            close();
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const validateChapter = () => {
    if (!chapter.title) {
        return __('Title is required');
    }
    if (chapter.is_scorm_package && !chapter.scorm_package) {
        return __('Please upload a SCORM package');
    }
};
const cleanChapter = () => {
    chapter.title = '';
    chapter.is_scorm_package = 0;
    chapter.scorm_package = null;
};
const editChapter = (close) => {
    chapterResource.submit({}, {
        validate() {
            if (!chapter.title) {
                return 'Title is required';
            }
        },
        onSuccess() {
            outline.value.reload();
            toast.success(__('Chapter updated successfully'));
            close();
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
watch(() => props.chapterDetail, (newChapter) => {
    chapter.title = newChapter?.title;
    chapter.is_scorm_package = newChapter?.is_scorm_package;
    chapter.scorm_package = newChapter?.scorm_package;
});
const validateFile = (file) => {
    let extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'zip') {
        return __('Only zip files are allowed');
    }
};
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
        title: __VLS_ctx.chapterDetail ? __VLS_ctx.__('Edit Chapter') : __VLS_ctx.__('Add Chapter'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.chapterDetail ? __VLS_ctx.__('Edit') : __VLS_ctx.__('Create'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.chapterDetail ? __VLS_ctx.editChapter(close) : __VLS_ctx.addChapter(close),
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.chapterDetail ? __VLS_ctx.__('Edit Chapter') : __VLS_ctx.__('Add Chapter'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.chapterDetail ? __VLS_ctx.__('Edit') : __VLS_ctx.__('Create'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.chapterDetail ? __VLS_ctx.editChapter(close) : __VLS_ctx.addChapter(close),
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        label: "Title",
        modelValue: (__VLS_ctx.chapter.title),
        required: (true),
    }));
    const __VLS_10 = __VLS_9({
        label: "Title",
        modelValue: (__VLS_ctx.chapter.title),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.Switch} */
    Switch;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        size: "sm",
        label: (__VLS_ctx.__('SCORM Package')),
        description: (__VLS_ctx.__('Enable this only if you want to upload a SCORM package as a chapter.')),
        modelValue: (__VLS_ctx.chapter.is_scorm_package),
    }));
    const __VLS_15 = __VLS_14({
        size: "sm",
        label: (__VLS_ctx.__('SCORM Package')),
        description: (__VLS_ctx.__('Enable this only if you want to upload a SCORM package as a chapter.')),
        modelValue: (__VLS_ctx.chapter.is_scorm_package),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    if (__VLS_ctx.chapter.is_scorm_package) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        if (!__VLS_ctx.chapter.scorm_package) {
            let __VLS_18;
            /** @ts-ignore @type { | typeof __VLS_components.FileUploader | typeof __VLS_components.FileUploader} */
            FileUploader;
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                ...{ 'onSuccess': {} },
                fileTypes: (['.zip']),
                validateFile: (__VLS_ctx.validateFile),
            }));
            const __VLS_20 = __VLS_19({
                ...{ 'onSuccess': {} },
                fileTypes: (['.zip']),
                validateFile: (__VLS_ctx.validateFile),
            }, ...__VLS_functionalComponentArgsRest(__VLS_19));
            let __VLS_23;
            const __VLS_24 = ({ success: {} },
                { onSuccess: ((file) => (__VLS_ctx.chapter.scorm_package = file)) });
            const { default: __VLS_25 } = __VLS_21.slots;
            {
                const { default: __VLS_26 } = __VLS_21.slots;
                const [{ file, progress, uploading, openFileSelector }] = __VLS_vSlot(__VLS_26);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "mb-4" },
                });
                /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
                let __VLS_27;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
                    ...{ 'onClick': {} },
                    loading: (uploading),
                }));
                const __VLS_29 = __VLS_28({
                    ...{ 'onClick': {} },
                    loading: (uploading),
                }, ...__VLS_functionalComponentArgsRest(__VLS_28));
                let __VLS_32;
                const __VLS_33 = ({ click: {} },
                    { onClick: (openFileSelector) });
                const { default: __VLS_34 } = __VLS_30.slots;
                (uploading ? `Uploading ${progress}%` : 'Upload an ZIP file');
                // @ts-ignore
                [show, chapterDetail, chapterDetail, chapterDetail, __, __, __, __, __, __, editChapter, addChapter, chapter, chapter, chapter, chapter, chapter, validateFile,];
                var __VLS_30;
                var __VLS_31;
                // @ts-ignore
                [];
                __VLS_21.slots['' /* empty slot name completion */];
            }
            // @ts-ignore
            [];
            var __VLS_21;
            var __VLS_22;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "" },
            });
            /** @type {__VLS_StyleScopedClasses['']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "border rounded-md p-2 mr-2" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
            let __VLS_35;
            /** @ts-ignore @type { | typeof __VLS_components.FileText} */
            FileText;
            // @ts-ignore
            const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
                ...{ class: "h-5 w-5 stroke-1.5 text-ink-gray-7" },
            }));
            const __VLS_37 = __VLS_36({
                ...{ class: "h-5 w-5 stroke-1.5 text-ink-gray-7" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_36));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-col" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-ink-gray-9" },
            });
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            (__VLS_ctx.chapter.scorm_package.file_name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-sm text-ink-gray-4 mt-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            (__VLS_ctx.getFileSize(__VLS_ctx.chapter.scorm_package.file_size));
            let __VLS_40;
            /** @ts-ignore @type { | typeof __VLS_components.X} */
            X;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                ...{ 'onClick': {} },
                ...{ class: "bg-surface-gray-3 rounded-md cursor-pointer stroke-1.5 w-5 h-5 p-1 ml-4" },
            }));
            const __VLS_42 = __VLS_41({
                ...{ 'onClick': {} },
                ...{ class: "bg-surface-gray-3 rounded-md cursor-pointer stroke-1.5 w-5 h-5 p-1 ml-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            let __VLS_45;
            const __VLS_46 = ({ click: {} },
                { onClick: (() => (__VLS_ctx.chapter.scorm_package = null)) });
            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
            var __VLS_43;
            var __VLS_44;
        }
    }
    // @ts-ignore
    [chapter, chapter, chapter, getFileSize,];
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
            course: {
                type: String,
                required: true,
            },
            chapterDetail: {
                type: Object,
            },
        },
    },
});
export default {};
