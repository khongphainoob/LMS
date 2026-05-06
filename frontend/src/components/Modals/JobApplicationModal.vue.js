/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, FileUploader, Button, createResource, toast } from 'frappe-ui';
import { FileText, Upload } from 'lucide-vue-next';
import { ref, inject } from 'vue';
import { getFileSize } from '@/utils/';
const resume = ref(null);
const show = defineModel();
const user = inject('$user');
const application = defineModel('application');
const props = defineProps({
    job: {
        type: String,
        required: true,
    },
});
const validateFile = (file) => {
    let extension = file.name.split('.').pop().toLowerCase();
    if (extension != 'pdf') {
        return 'Only PDF file is allowed';
    }
};
const jobApplication = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'LMS Job Application',
                user: user.data?.name,
                resume: resume.value?.file_url,
                job: props.job,
            },
        };
    },
});
const submitResume = (close) => {
    jobApplication.submit({}, {
        validate() {
            if (!resume.value) {
                return 'Please upload your resume';
            }
        },
        onSuccess() {
            toast.success('Your application has been submitted successfully');
            application.value.reload();
            close();
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
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
    ...{ class: "text-base" },
    options: ({
        title: __VLS_ctx.__('Apply for this job'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => {
                    __VLS_ctx.submitResume(close);
                },
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    ...{ class: "text-base" },
    options: ({
        title: __VLS_ctx.__('Apply for this job'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => {
                    __VLS_ctx.submitResume(close);
                },
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-4 text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Submit your resume to proceed with your application for this position. Upon submission, it will be shared with the job poster.'));
    if (!__VLS_ctx.resume) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        let __VLS_8;
        /** @ts-ignore @type { | typeof __VLS_components.FileUploader | typeof __VLS_components.FileUploader} */
        FileUploader;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            ...{ 'onSuccess': {} },
            fileTypes: (['.pdf']),
            validateFile: (__VLS_ctx.validateFile),
            uploadArgs: ({ private: 1 }),
        }));
        const __VLS_10 = __VLS_9({
            ...{ 'onSuccess': {} },
            fileTypes: (['.pdf']),
            validateFile: (__VLS_ctx.validateFile),
            uploadArgs: ({ private: 1 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_13;
        const __VLS_14 = ({ success: {} },
            { onSuccess: ((file) => {
                    __VLS_ctx.resume = file;
                }) });
        const { default: __VLS_15 } = __VLS_11.slots;
        {
            const { default: __VLS_16 } = __VLS_11.slots;
            const [{ file, progress, uploading, openFileSelector }] = __VLS_vSlot(__VLS_16);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "" },
            });
            /** @type {__VLS_StyleScopedClasses['']} */ ;
            let __VLS_17;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
                ...{ 'onClick': {} },
                loading: (uploading),
            }));
            const __VLS_19 = __VLS_18({
                ...{ 'onClick': {} },
                loading: (uploading),
            }, ...__VLS_functionalComponentArgsRest(__VLS_18));
            let __VLS_22;
            const __VLS_23 = ({ click: {} },
                { onClick: (openFileSelector) });
            const { default: __VLS_24 } = __VLS_20.slots;
            {
                const { prefix: __VLS_25 } = __VLS_20.slots;
                let __VLS_26;
                /** @ts-ignore @type { | typeof __VLS_components.Upload} */
                Upload;
                // @ts-ignore
                const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
                    ...{ class: "size-4 stroke-1.5" },
                }));
                const __VLS_28 = __VLS_27({
                    ...{ class: "size-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_27));
                /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                // @ts-ignore
                [show, __, __, __, submitResume, resume, resume, validateFile,];
            }
            (uploading ? `Uploading ${progress}%` : 'Upload your resume');
            // @ts-ignore
            [];
            var __VLS_20;
            var __VLS_21;
            // @ts-ignore
            [];
            __VLS_11.slots['' /* empty slot name completion */];
        }
        // @ts-ignore
        [];
        var __VLS_11;
        var __VLS_12;
    }
    else {
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
        let __VLS_31;
        /** @ts-ignore @type { | typeof __VLS_components.FileText} */
        FileText;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
            ...{ class: "h-5 w-5 stroke-1.5 text-ink-gray-7" },
        }));
        const __VLS_33 = __VLS_32({
            ...{ class: "h-5 w-5 stroke-1.5 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
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
        (__VLS_ctx.resume.file_name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm text-ink-gray-4 mt-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        (__VLS_ctx.getFileSize(__VLS_ctx.resume.file_size));
    }
    // @ts-ignore
    [resume, resume, getFileSize,];
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
            job: {
                type: String,
                required: true,
            },
        },
    },
});
export default {};
