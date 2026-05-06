/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, watch } from 'vue';
import { Play, Pause, Volume2, VolumeX } from 'lucide-vue-next';
import { Button } from 'frappe-ui';
const isPlaying = ref(false);
const audio = ref(null);
let isMuted = ref(false);
let currentTime = ref(0);
let duration = ref(0);
const props = defineProps({
    file: {
        type: String,
        required: true,
    },
});
onMounted(() => {
    setTimeout(() => {
        audio.value = document.querySelector('audio');
        audio.value.onloadedmetadata = () => {
            duration.value = audio.value.duration;
        };
        audio.value.ontimeupdate = () => {
            currentTime.value = audio.value.currentTime;
        };
    }, 0);
});
const togglePlay = () => {
    if (audio.value.paused) {
        audio.value.play();
        isPlaying.value = true;
    }
    else {
        audio.value.pause();
        isPlaying.value = false;
    }
};
const toggleMute = () => {
    audio.value.muted = !audio.value.muted;
    isMuted.value = audio.value.muted;
};
const changeCurrentTime = () => {
    audio.value.currentTime = currentTime.value;
};
const handleAudioEnd = () => {
    isPlaying.value = false;
};
const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
watch(isPlaying, (newVal) => {
    if (newVal) {
        audio.value.play();
    }
    else {
        audio.value.pause();
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.audio, __VLS_intrinsics.audio)({
    ...{ onEnded: (__VLS_ctx.handleAudioEnd) },
    controlsList: "nodownload",
    ...{ class: "mb-4" },
});
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.source)({
    src: (encodeURI(__VLS_ctx.file)),
    type: "audio/mp3",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-2 shadow rounded-lg p-1 w-1/2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    variant: "ghost",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    variant: "ghost",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.togglePlay) });
const { default: __VLS_7 } = __VLS_3.slots;
{
    const { icon: __VLS_8 } = __VLS_3.slots;
    if (!__VLS_ctx.isPlaying) {
        let __VLS_9;
        /** @ts-ignore @type { | typeof __VLS_components.Play} */
        Play;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
            ...{ class: "w-4 h-4 text-ink-gray-9" },
        }));
        const __VLS_11 = __VLS_10({
            ...{ class: "w-4 h-4 text-ink-gray-9" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    }
    else {
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Pause} */
        Pause;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ class: "w-4 h-4 text-ink-gray-9" },
        }));
        const __VLS_16 = __VLS_15({
            ...{ class: "w-4 h-4 text-ink-gray-9" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    }
    // @ts-ignore
    [handleAudioEnd, file, togglePlay, isPlaying,];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onInput: (__VLS_ctx.changeCurrentTime) },
    type: "range",
    min: "0",
    max: (__VLS_ctx.duration),
    step: "0.1",
    ...{ class: "duration-slider w-full h-1" },
});
(__VLS_ctx.currentTime);
/** @type {__VLS_StyleScopedClasses['duration-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-xs text-ink-gray-9 font-medium" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.formatTime(__VLS_ctx.currentTime));
(__VLS_ctx.formatTime(__VLS_ctx.duration));
let __VLS_19;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    ...{ 'onClick': {} },
    variant: "ghost",
}));
const __VLS_21 = __VLS_20({
    ...{ 'onClick': {} },
    variant: "ghost",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_24;
const __VLS_25 = ({ click: {} },
    { onClick: (__VLS_ctx.toggleMute) });
const { default: __VLS_26 } = __VLS_22.slots;
{
    const { icon: __VLS_27 } = __VLS_22.slots;
    if (!__VLS_ctx.isMuted) {
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.Volume2} */
        Volume2;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
            ...{ class: "w-4 h-4 text-ink-gray-9" },
        }));
        const __VLS_30 = __VLS_29({
            ...{ class: "w-4 h-4 text-ink-gray-9" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    }
    else {
        let __VLS_33;
        /** @ts-ignore @type { | typeof __VLS_components.VolumeX} */
        VolumeX;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
            ...{ class: "w-4 h-4 text-ink-gray-9" },
        }));
        const __VLS_35 = __VLS_34({
            ...{ class: "w-4 h-4 text-ink-gray-9" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    }
    // @ts-ignore
    [changeCurrentTime, duration, duration, currentTime, currentTime, formatTime, formatTime, toggleMute, isMuted,];
}
// @ts-ignore
[];
var __VLS_22;
var __VLS_23;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        file: {
            type: String,
            required: true,
        },
    },
});
export default {};
