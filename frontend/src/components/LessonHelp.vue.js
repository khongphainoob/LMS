/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Info } from 'lucide-vue-next';
import { ref } from 'vue';
import ExplanationVideos from '@/components/Modals/ExplanationVideos.vue';
const showExplanation = ref(false);
const type = ref(null);
const title = ref(null);
const contentMap = {
    quiz: {
        title: __('How to add a Quiz?'),
        description: 'Click on the add icon in the editor and select Quiz from the menu. It opens up a dialog, where you can either select a quiz from the list or create a new quiz. When you select the Create New option it redirects you to the quiz creation page.',
    },
    upload: {
        title: __('How to upload content from your system?'),
        description: 'To upload Image, Video, Audio or PDF from your system, click on the add icon and select upload from the menu. Then choose the file you want to add to the lesson and it gets added to your lesson.',
    },
    youtube: {
        title: __('How to add a YouTube Video?'),
        description: 'Copy the URL of the video from YouTube and paste it in the editor.',
    },
    remove: {
        title: __('How to remove an embed?'),
        description: 'To remove an embed like YouTube or Vimeo, put your cursor on the line below the embed, then drag your mouse cursor upwards to select the embed. Once the embed is selected press BackSpace.',
    },
};
const openHelpDialog = (contentType) => {
    type.value = contentType;
    title.value = contentMap[contentType].title;
    showExplanation.value = true;
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5 text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-2" },
});
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center text-sm font-medium space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.__('What does include in preview mean?'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xs text-ink-gray-5 mb-1 leading-5" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
(__VLS_ctx.__('If Include in Preview is enabled for a lesson then the lesson will also be accessible to non logged in users.'));
for (const [item, key] of __VLS_vFor((__VLS_ctx.contentMap))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2" },
        key: (key),
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openHelpDialog(key);
                // @ts-ignore
                [__, __, contentMap, openHelpDialog,];
            } },
        ...{ class: "flex items-center text-sm font-medium space-x-2 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__(item.title));
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Info} */
    Info;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "w-3 h-3 text-ink-gray-7" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "w-3 h-3 text-ink-gray-7" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5 mb-1 leading-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    (__VLS_ctx.__(item.description));
    // @ts-ignore
    [__, __,];
}
const __VLS_5 = ExplanationVideos;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.showExplanation),
    title: (__VLS_ctx.title),
    type: (__VLS_ctx.type),
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.showExplanation),
    title: (__VLS_ctx.title),
    type: (__VLS_ctx.type),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
// @ts-ignore
[showExplanation, title, type,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
