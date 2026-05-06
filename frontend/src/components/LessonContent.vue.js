/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import Quiz from '@/components/QuizBlock.vue';
import MarkdownIt from 'markdown-it';
import { useScreenSize } from '@/utils/composables';
const screenSize = useScreenSize();
const markdown = new MarkdownIt({
    html: true,
    linkify: true,
});
const props = defineProps({
    content: {
        type: String,
        required: true,
    },
    youtube: {
        type: String,
        required: false,
    },
    quizId: {
        type: String,
        required: false,
    },
});
const getYouTubeVideoSource = (block) => {
    if (block.includes('{{')) {
        block = getId(block);
    }
    return `https://www.youtube.com/embed/${block}`;
};
const getPDFSource = (block) => {
    return `${getId(block)}#toolbar=0`;
};
const getId = (block) => {
    return block.match(/\(["']([^"']+?)["']\)/)[1];
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.youtube) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.iframe, __VLS_intrinsics.iframe)({
        ...{ class: "youtube-video" },
        src: (__VLS_ctx.getYouTubeVideoSource(__VLS_ctx.youtube.split('/').pop())),
        width: "100%",
        height: (__VLS_ctx.screenSize.width < 640 ? 200 : 400),
        frameborder: "0",
        allowfullscreen: true,
    });
    /** @type {__VLS_StyleScopedClasses['youtube-video']} */ ;
}
for (const [block] of __VLS_vFor((__VLS_ctx.content?.split('\n\n')))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (block.includes('{{ YouTubeVideo')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.iframe, __VLS_intrinsics.iframe)({
            ...{ class: "youtube-video" },
            src: (__VLS_ctx.getYouTubeVideoSource(block)),
            width: "100%",
            height: (__VLS_ctx.screenSize.width < 640 ? 200 : 400),
            frameborder: "0",
            allowfullscreen: true,
        });
        /** @type {__VLS_StyleScopedClasses['youtube-video']} */ ;
    }
    else if (block.includes('{{ Quiz')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        const __VLS_0 = Quiz;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            quiz: (__VLS_ctx.getId(block)),
        }));
        const __VLS_2 = __VLS_1({
            quiz: (__VLS_ctx.getId(block)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    else if (block.includes('{{ Video')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
            controls: true,
            width: "100%",
            controlsList: "nodownload",
            oncontextmenu: "return false;",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.source)({
            src: (__VLS_ctx.getId(block)),
            type: "video/mp4",
        });
    }
    else if (block.includes('{{ PDF')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.iframe, __VLS_intrinsics.iframe)({
            src: (__VLS_ctx.getPDFSource(block)),
            width: "100%",
            height: "700px",
            frameborder: "0",
            allowfullscreen: true,
        });
    }
    else if (block.includes('{{ Audio')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.audio, __VLS_intrinsics.audio)({
            width: "100%",
            controls: true,
            controlsList: "nodownload",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.source)({
            src: (__VLS_ctx.getId(block)),
            type: "audio/mp3",
        });
    }
    else if (block.includes('{{ Embed')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.iframe, __VLS_intrinsics.iframe)({
            width: "100%",
            height: "400",
            src: (__VLS_ctx.getId(block)),
            frameborder: "0",
            allowfullscreen: true,
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.markdown.render(block)) }, null, null);
    }
    // @ts-ignore
    [youtube, youtube, getYouTubeVideoSource, getYouTubeVideoSource, screenSize, screenSize, content, getId, getId, getId, getId, getPDFSource, markdown,];
}
if (__VLS_ctx.quizId) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    const __VLS_5 = Quiz;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        quiz: (__VLS_ctx.quizId),
    }));
    const __VLS_7 = __VLS_6({
        quiz: (__VLS_ctx.quizId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
}
// @ts-ignore
[quizId, quizId,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        content: {
            type: String,
            required: true,
        },
        youtube: {
            type: String,
            required: false,
        },
        quizId: {
            type: String,
            required: false,
        },
    },
});
export default {};
