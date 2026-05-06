/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, computed, watch } from 'vue';
import { Pause, Maximize, Volume2, VolumeX } from 'lucide-vue-next';
import { Button, Dialog } from 'frappe-ui';
import { formatSeconds, formatTimestamp } from '@/utils';
import { useSettings } from '@/stores/settings';
import Play from '@/components/Icons/Play.vue';
import QuizInVideo from '@/components/Modals/QuizInVideo.vue';
const videoRef = ref(null);
const videoContainer = ref(null);
let playing = ref(false);
let currentTime = ref(0);
let duration = ref(0);
let muted = ref(false);
const showQuizModal = ref(false);
const showQuiz = ref(false);
const showQuizLoader = ref(false);
const quizLoadTimer = ref(0);
const currentQuiz = ref(null);
const nextQuiz = ref({});
const { settings } = useSettings();
const props = defineProps({
    file: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'video/mp4',
    },
    readOnly: {
        type: Boolean,
        default: true,
    },
    quizzes: {
        type: Array,
        default: () => [],
    },
    saveQuizzes: {
        type: Function,
        default: () => { },
    },
});
onMounted(() => {
    updateCurrentTime();
    updateNextQuiz();
});
const updateCurrentTime = () => {
    setTimeout(() => {
        videoRef.value.onloadedmetadata = () => {
            duration.value = videoRef.value.duration;
        };
        videoRef.value.ontimeupdate = () => {
            currentTime.value = videoRef.value?.currentTime || currentTime.value;
            if (currentTime.value >= nextQuiz.value.time) {
                videoRef.value.pause();
                playing.value = false;
                videoRef.value.onTimeupdate = null;
                currentQuiz.value = nextQuiz.value.quiz;
                quizLoadTimer.value = 7;
            }
        };
    }, 0);
};
watch(quizLoadTimer, () => {
    if (quizLoadTimer.value > 0) {
        showQuizLoader.value = true;
        setTimeout(() => {
            quizLoadTimer.value -= 1;
        }, 1000);
    }
    else {
        showQuizLoader.value = false;
        showQuiz.value = true;
    }
});
const resumeVideo = (restart = false) => {
    showQuiz.value = false;
    currentQuiz.value = null;
    updateCurrentTime();
    setTimeout(() => {
        videoRef.value.currentTime = restart ? 0 : currentTime.value;
        videoRef.value.play();
        playing.value = true;
        updateNextQuiz();
    }, 0);
};
const updateNextQuiz = () => {
    if (!props.quizzes.length)
        return;
    props.quizzes.forEach((quiz) => {
        if (typeof quiz.time == 'string' && quiz.time.includes(':')) {
            let time = quiz.time.split(':');
            let timeInSeconds = parseInt(time[0]) * 60 + parseInt(time[1]);
            quiz.time = timeInSeconds;
        }
    });
    props.quizzes.sort((a, b) => a.time - b.time);
    const nextQuizIndex = props.quizzes.findIndex((quiz) => quiz.time > currentTime.value);
    if (nextQuizIndex !== -1) {
        nextQuiz.value = props.quizzes[nextQuizIndex];
    }
    else {
        nextQuiz.value = {};
    }
};
const fileURL = computed(() => {
    return props.file;
});
const playVideo = () => {
    videoRef.value.play();
    playing.value = true;
};
const pauseVideo = () => {
    videoRef.value.pause();
    playing.value = false;
};
const togglePlay = () => {
    if (playing.value) {
        pauseVideo();
    }
    else {
        playVideo();
    }
};
const videoEnded = () => {
    playing.value = false;
};
const toggleMute = () => {
    videoRef.value.muted = !videoRef.value.muted;
    muted.value = videoRef.value.muted;
};
const changeCurrentTime = () => {
    if (settings.data?.prevent_skipping_videos &&
        currentTime.value > videoRef.value.currentTime)
        return;
    videoRef.value.currentTime = currentTime.value;
    updateNextQuiz();
};
const toggleFullscreen = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    else {
        videoContainer.value.requestFullscreen();
    }
};
const getQuizMarkerStyle = (time) => {
    const percentage = ((time - 5) / Math.ceil(duration.value)) * 100;
    return {
        left: `${percentage}%`,
    };
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
/** @type {__VLS_StyleScopedClasses['video-block']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-slider']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
if (__VLS_ctx.quizzes.length && !__VLS_ctx.showQuiz && __VLS_ctx.readOnly) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "leading-6" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    (__VLS_ctx.__('This video contains {0} {1}:').format(__VLS_ctx.quizzes.length, __VLS_ctx.quizzes.length == 1 ? 'quiz' : 'quizzes'));
    for (const [quiz, index] of __VLS_vFor((__VLS_ctx.quizzes))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pl-3 mt-1" },
        });
        /** @type {__VLS_StyleScopedClasses['pl-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (index + 1);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (quiz.quiz);
        (__VLS_ctx.__('at {0} minutes').format(__VLS_ctx.formatTimestamp(quiz.time)));
        // @ts-ignore
        [quizzes, quizzes, quizzes, quizzes, showQuiz, readOnly, __, __, formatTimestamp,];
    }
}
if (!__VLS_ctx.showQuiz) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ref: "videoContainer",
        ...{ class: "video-block relative group" },
    });
    /** @type {__VLS_StyleScopedClasses['video-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
        ...{ onTimeupdate: (__VLS_ctx.updateTime) },
        ...{ onEnded: (__VLS_ctx.videoEnded) },
        ...{ onClick: (__VLS_ctx.togglePlay) },
        oncontextmenu: "return false",
        ...{ class: "rounded-md border border-gray-100 cursor-pointer" },
        ref: "videoRef",
        src: (__VLS_ctx.fileURL),
        type: (__VLS_ctx.type),
    });
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    if (!__VLS_ctx.playing) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (__VLS_ctx.playVideo) },
            ...{ class: "absolute inset-0 flex items-center justify-center cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rounded-full p-4 pl-4.5" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pl-4.5']} */ ;
        const __VLS_0 = Play;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
        const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 py-2 px-1 text-ink-white bg-gradient-to-b from-transparent to-black/75 absolute bottom-0 left-0 right-0 mx-auto rounded-md" },
        ...{ class: ({
                'invisible group-hover:visible': __VLS_ctx.playing,
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-black/75']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:visible']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        variant: "ghost",
        ...{ class: "hover:bg-transparent" },
    }));
    const __VLS_7 = __VLS_6({
        variant: "ghost",
        ...{ class: "hover:bg-transparent" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['hover:bg-transparent']} */ ;
    const { default: __VLS_10 } = __VLS_8.slots;
    {
        const { icon: __VLS_11 } = __VLS_8.slots;
        if (!__VLS_ctx.playing) {
            const __VLS_12 = Play;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
                ...{ 'onClick': {} },
                ...{ class: "size-4 text-ink-gray-9" },
            }));
            const __VLS_14 = __VLS_13({
                ...{ 'onClick': {} },
                ...{ class: "size-4 text-ink-gray-9" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            let __VLS_17;
            const __VLS_18 = ({ click: {} },
                { onClick: (__VLS_ctx.playVideo) });
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            var __VLS_15;
            var __VLS_16;
        }
        else {
            let __VLS_19;
            /** @ts-ignore @type { | typeof __VLS_components.Pause} */
            Pause;
            // @ts-ignore
            const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                ...{ 'onClick': {} },
                ...{ class: "size-5 text-ink-white" },
            }));
            const __VLS_21 = __VLS_20({
                ...{ 'onClick': {} },
                ...{ class: "size-5 text-ink-white" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_20));
            let __VLS_24;
            const __VLS_25 = ({ click: {} },
                { onClick: (__VLS_ctx.pauseVideo) });
            /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-white']} */ ;
            var __VLS_22;
            var __VLS_23;
        }
        // @ts-ignore
        [showQuiz, updateTime, videoEnded, togglePlay, fileURL, type, playing, playing, playing, playVideo, playVideo, pauseVideo,];
    }
    // @ts-ignore
    [];
    var __VLS_8;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative flex items-center w-full flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onInput: (__VLS_ctx.changeCurrentTime) },
        type: "range",
        min: "0",
        max: (__VLS_ctx.duration),
        step: "0.1",
        ...{ class: "duration-slider h-1" },
    });
    (__VLS_ctx.currentTime);
    /** @type {__VLS_StyleScopedClasses['duration-slider']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-0 left-0 w-full h-full pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    for (const [quiz, index] of __VLS_vFor((__VLS_ctx.quizzes))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (index),
            ...{ style: (__VLS_ctx.getQuizMarkerStyle(quiz.time)) },
            ...{ class: "absolute top-0 h-full w-2 bg-surface-amber-3" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-amber-3']} */ ;
        // @ts-ignore
        [quizzes, changeCurrentTime, duration, currentTime, getQuizMarkerStyle,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.formatSeconds(__VLS_ctx.currentTime));
    (__VLS_ctx.formatSeconds(__VLS_ctx.duration));
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        ...{ 'onClick': {} },
        variant: "ghost",
        ...{ class: "hover:bg-transparent" },
    }));
    const __VLS_28 = __VLS_27({
        ...{ 'onClick': {} },
        variant: "ghost",
        ...{ class: "hover:bg-transparent" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_31;
    const __VLS_32 = ({ click: {} },
        { onClick: (__VLS_ctx.toggleMute) });
    /** @type {__VLS_StyleScopedClasses['hover:bg-transparent']} */ ;
    const { default: __VLS_33 } = __VLS_29.slots;
    {
        const { icon: __VLS_34 } = __VLS_29.slots;
        if (!__VLS_ctx.muted) {
            let __VLS_35;
            /** @ts-ignore @type { | typeof __VLS_components.Volume2} */
            Volume2;
            // @ts-ignore
            const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
                ...{ class: "size-5 text-ink-white" },
            }));
            const __VLS_37 = __VLS_36({
                ...{ class: "size-5 text-ink-white" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_36));
            /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-white']} */ ;
        }
        else {
            let __VLS_40;
            /** @ts-ignore @type { | typeof __VLS_components.VolumeX} */
            VolumeX;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                ...{ class: "size-5 text-ink-white" },
            }));
            const __VLS_42 = __VLS_41({
                ...{ class: "size-5 text-ink-white" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-white']} */ ;
        }
        // @ts-ignore
        [duration, currentTime, formatSeconds, formatSeconds, toggleMute, muted,];
    }
    // @ts-ignore
    [];
    var __VLS_29;
    var __VLS_30;
    let __VLS_45;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
        ...{ 'onClick': {} },
        variant: "ghost",
        ...{ class: "hover:bg-transparent" },
    }));
    const __VLS_47 = __VLS_46({
        ...{ 'onClick': {} },
        variant: "ghost",
        ...{ class: "hover:bg-transparent" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    let __VLS_50;
    const __VLS_51 = ({ click: {} },
        { onClick: (__VLS_ctx.toggleFullscreen) });
    /** @type {__VLS_StyleScopedClasses['hover:bg-transparent']} */ ;
    const { default: __VLS_52 } = __VLS_48.slots;
    {
        const { icon: __VLS_53 } = __VLS_48.slots;
        let __VLS_54;
        /** @ts-ignore @type { | typeof __VLS_components.Maximize} */
        Maximize;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
            ...{ class: "size-5 text-ink-white" },
        }));
        const __VLS_56 = __VLS_55({
            ...{ class: "size-5 text-ink-white" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-white']} */ ;
        // @ts-ignore
        [toggleFullscreen,];
    }
    // @ts-ignore
    [];
    var __VLS_48;
    var __VLS_49;
}
if (__VLS_ctx.showQuiz) {
    let __VLS_59;
    /** @ts-ignore @type { | typeof __VLS_components.Quiz} */
    Quiz;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
        quizName: (__VLS_ctx.currentQuiz),
        inVideo: (true),
        backToVideo: (__VLS_ctx.resumeVideo),
    }));
    const __VLS_61 = __VLS_60({
        quizName: (__VLS_ctx.currentQuiz),
        inVideo: (true),
        backToVideo: (__VLS_ctx.resumeVideo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
}
if (!__VLS_ctx.readOnly) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.readOnly))
                    return;
                __VLS_ctx.showQuizModal = true;
                // @ts-ignore
                [showQuiz, readOnly, currentQuiz, resumeVideo, showQuizModal,];
            } },
    });
    let __VLS_64;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({}));
    const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
    const { default: __VLS_69 } = __VLS_67.slots;
    (__VLS_ctx.__('Add Quiz to Video'));
    // @ts-ignore
    [__,];
    var __VLS_67;
}
const __VLS_70 = QuizInVideo;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    modelValue: (__VLS_ctx.showQuizModal),
    quizzes: (__VLS_ctx.quizzes),
    saveQuizzes: (__VLS_ctx.saveQuizzes),
    duration: (__VLS_ctx.duration),
}));
const __VLS_72 = __VLS_71({
    modelValue: (__VLS_ctx.showQuizModal),
    quizzes: (__VLS_ctx.quizzes),
    saveQuizzes: (__VLS_ctx.saveQuizzes),
    duration: (__VLS_ctx.duration),
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
let __VLS_75;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    modelValue: (__VLS_ctx.showQuizLoader),
    options: ({
        size: 'sm',
    }),
}));
const __VLS_77 = __VLS_76({
    modelValue: (__VLS_ctx.showQuizLoader),
    options: ({
        size: 'sm',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
const { default: __VLS_80 } = __VLS_78.slots;
{
    const { body: __VLS_81 } = __VLS_78.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col space-y-2 p-5 text-base leading-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.__('Time for a Quiz'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Complete the upcoming quiz to continue watching the video. The quiz will open in {0} {1}.').format(__VLS_ctx.quizLoadTimer, __VLS_ctx.quizLoadTimer === 1 ? 'second' : 'seconds'));
    // @ts-ignore
    [quizzes, __, __, duration, showQuizModal, saveQuizzes, showQuizLoader, quizLoadTimer, quizLoadTimer,];
}
// @ts-ignore
[];
var __VLS_78;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        file: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: 'video/mp4',
        },
        readOnly: {
            type: Boolean,
            default: true,
        },
        quizzes: {
            type: Array,
            default: () => [],
        },
        saveQuizzes: {
            type: Function,
            default: () => { },
        },
    },
});
export default {};
