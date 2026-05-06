/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { FileUploader } from 'frappe-ui';
import { onMounted, ref, nextTick } from 'vue';
const fileUploader = ref(null);
const emit = defineEmits(['fileUploaded']);
const props = defineProps({
    onFileUploaded: {
        type: Function,
        required: true,
    },
});
onMounted(async () => {
    await nextTick();
    const fileInput = fileUploader.value.$el.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.click();
    }
});
const addFile = (file) => {
    props.onFileUploaded({
        file_url: file.file_url,
        file_type: file.file_type,
    });
};
const validateFile = (file) => {
    let extension = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'mp4', 'mov', 'mp3', 'pdf'].includes(extension)) {
        return 'Only image and video files are allowed.';
    }
};
const isVideo = (type) => {
    return ['mov', 'mp4', 'avi', 'mkv', 'webm'].includes(type.toLowerCase());
};
const isAudio = (type) => {
    return ['mp3', 'wav', 'ogg'].includes(type.toLowerCase());
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
/** @ts-ignore @type { | typeof __VLS_components.FileUploader} */
FileUploader;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onSuccess': {} },
    fileTypes: (['image/*', 'video/*', 'audio/*', '.pdf']),
    validateFile: (__VLS_ctx.validateFile),
    ref: "fileUploader",
    ...{ class: "hide" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSuccess': {} },
    fileTypes: (['image/*', 'video/*', 'audio/*', '.pdf']),
    validateFile: (__VLS_ctx.validateFile),
    ref: "fileUploader",
    ...{ class: "hide" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ success: {} },
    { onSuccess: ((data) => __VLS_ctx.addFile(data)) });
var __VLS_7 = {};
/** @type {__VLS_StyleScopedClasses['hide']} */ ;
var __VLS_3;
var __VLS_4;
// @ts-ignore
var __VLS_8 = __VLS_7;
// @ts-ignore
[validateFile, addFile,];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    props: {
        onFileUploaded: {
            type: Function,
            required: true,
        },
    },
});
export default {};
