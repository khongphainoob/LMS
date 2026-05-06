/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onUnmounted } from 'vue';
import { call } from 'frappe-ui';
import { Timer, Trophy } from 'lucide-vue-next';
const duckName = 'Blue Duck';
const gameState = ref('start');
const score = ref(0);
const currentRound = ref(1);
const progress = ref(0);
const timeLeft = ref(45);
const statusText = ref('Ready to race');
const typedAnswer = ref('');
const smashedCounters = ref([]);
let timer = null;
const questions = [
    { type: 'choice', prompt: '2 + 3 = ?', choices: ['4', '5', '6', '8'], answer: '5' },
    { type: 'short', prompt: 'Spell the first month of the year', placeholder: 'Type your answer', answer: 'january' },
    { type: 'choice', prompt: 'Which is a prime number?', choices: ['9', '12', '13', '15'], answer: '13' },
    { type: 'short', prompt: 'What is 10 - 4?', placeholder: 'Type a number', answer: '6' },
    { type: 'choice', prompt: 'Which animal says meow?', choices: ['Dog', 'Cow', 'Cat', 'Duck'], answer: 'Cat' },
];
const counters = [
    { id: 1, left: 18, label: '1' },
    { id: 2, left: 36, label: '2' },
    { id: 3, left: 54, label: '3' },
    { id: 4, left: 72, label: '4' },
    { id: 5, left: 88, label: 'Finish' },
];
const currentQuestion = computed(() => questions[currentRound.value - 1] || questions[questions.length - 1]);
const finishTitle = computed(() => (progress.value >= 100 ? 'Victory!' : 'Race Complete'));
function resetGame() {
    score.value = 0;
    currentRound.value = 1;
    progress.value = 0;
    timeLeft.value = 45;
    statusText.value = 'The race is on';
    typedAnswer.value = '';
    smashedCounters.value = [];
    clearInterval(timer);
    timer = null;
}
function startGame() {
    resetGame();
    gameState.value = 'playing';
    timer = setInterval(() => {
        timeLeft.value -= 1;
        if (timeLeft.value <= 0)
            endGame('Time is up');
    }, 1000);
}
function endGame(status) {
    statusText.value = status;
    gameState.value = 'finished';
    recordSession(status);
    clearInterval(timer);
    timer = null;
}
function recordSession(result) {
    call('lms.lms.api.record_game_session', {
        game: 'Duck Race',
        score: score.value,
        max_score: 100,
        result,
        metadata: {
            progress: progress.value,
            counters_smashed: smashedCounters.value.length,
        },
    });
}
function boostDuck(correct) {
    if (correct) {
        const boost = 12 + Math.floor(Math.random() * 16);
        progress.value = Math.min(100, progress.value + boost);
        score.value += 10 + boost;
        smashedCounters.value.push(counters[Math.min(smashedCounters.value.length, counters.length - 1)].id);
        statusText.value = 'Nice boost!';
    }
    else {
        progress.value = Math.max(0, progress.value - 8);
        score.value = Math.max(0, score.value - 2);
        statusText.value = 'Penalty!';
    }
}
function submit(answer) {
    if (gameState.value !== 'playing')
        return;
    const expected = currentQuestion.value.answer.toLowerCase().trim();
    const actual = String(answer || '').toLowerCase().trim();
    boostDuck(actual === expected);
    if (progress.value >= 100 || currentRound.value >= questions.length) {
        endGame(progress.value >= 100 ? 'Victory!' : 'Race Complete');
        return;
    }
    currentRound.value += 1;
    typedAnswer.value = '';
}
onUnmounted(() => {
    clearInterval(timer);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-4" },
});
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Duck Race'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Timer} */
Timer;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-4" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.timeLeft);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Trophy} */
Trophy;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ class: "size-4 text-ink-amber-5" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "size-4 text-ink-amber-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-amber-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.score);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.resetGame) },
    ...{ class: "text-xs px-3 py-1.5 rounded-md bg-surface-gray-2 hover:bg-surface-gray-3 text-ink-gray-7 transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
(__VLS_ctx.__('Reset'));
if (__VLS_ctx.gameState === 'start') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-4xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-lg font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Duck Dash Quiz'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Answer correctly to move your duck forward and smash the counters.'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.startGame) },
        ...{ class: "px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-ink-blue-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (__VLS_ctx.__('Start Race'));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-5 space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Round {0} of {1}').format(__VLS_ctx.currentRound, __VLS_ctx.questions.length));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.statusText);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full h-1.5 bg-surface-gray-2 rounded-full overflow-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-full rounded-full bg-ink-blue-4 transition-all duration-300" },
        ...{ style: ({ width: __VLS_ctx.progress + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 p-4 overflow-hidden min-h-[280px]" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-slate-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[280px]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-x-4 top-12 border-t border-dashed border-white/15" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/15']} */ ;
    for (const [counter] of __VLS_vFor((__VLS_ctx.counters))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (counter.id),
            ...{ class: "absolute top-1/2 -translate-y-1/2 text-center transition-all duration-300" },
            ...{ style: ({ left: counter.left + '%' }) },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs font-semibold text-white/90 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/90']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (counter.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-3.5 h-16 mx-auto rounded-full bg-gradient-to-b from-amber-400 to-orange-500 shadow-lg" },
            ...{ class: (__VLS_ctx.smashedCounters.includes(counter.id) ? 'opacity-40 grayscale' : '') },
        });
        /** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-amber-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-orange-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
        // @ts-ignore
        [__, __, __, __, __, __, timeLeft, score, resetGame, gameState, startGame, currentRound, questions, statusText, progress, counters, smashedCounters,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-6 left-6 right-6" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rounded-2xl border border-white/10 bg-white/10 backdrop-blur px-4 py-4 text-white shadow-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm font-medium text-white/90 mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    (__VLS_ctx.currentQuestion.prompt);
    if (__VLS_ctx.currentQuestion.type === 'choice') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid gap-2 sm:grid-cols-2" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
        for (const [choice] of __VLS_vFor((__VLS_ctx.currentQuestion.choices))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.gameState === 'start'))
                            return;
                        if (!(__VLS_ctx.currentQuestion.type === 'choice'))
                            return;
                        __VLS_ctx.submit(choice);
                        // @ts-ignore
                        [currentQuestion, currentQuestion, currentQuestion, submit,];
                    } },
                key: (choice),
                ...{ class: "rounded-lg px-3 py-2 text-sm text-left bg-white/10 hover:bg-white/20 transition-colors" },
            });
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-white/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            (choice);
            // @ts-ignore
            [];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onKeyup: (...[$event]) => {
                    if (!!(__VLS_ctx.gameState === 'start'))
                        return;
                    if (!!(__VLS_ctx.currentQuestion.type === 'choice'))
                        return;
                    __VLS_ctx.submit(__VLS_ctx.typedAnswer);
                    // @ts-ignore
                    [submit, typedAnswer,];
                } },
            ...{ class: "flex-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none" },
            placeholder: (__VLS_ctx.currentQuestion.placeholder),
        });
        (__VLS_ctx.typedAnswer);
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/15']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder:text-white/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.gameState === 'start'))
                        return;
                    if (!!(__VLS_ctx.currentQuestion.type === 'choice'))
                        return;
                    __VLS_ctx.submit(__VLS_ctx.typedAnswer);
                    // @ts-ignore
                    [currentQuestion, submit, typedAnswer, typedAnswer,];
                } },
            ...{ class: "rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-slate-900" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-amber-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
        (__VLS_ctx.__('Answer'));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-4 right-4 text-right text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs uppercase tracking-[0.2em] text-white/60" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-[0.2em]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white/60']} */ ;
    (__VLS_ctx.__('Duck'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.duckName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Counters smashed: {0}').format(__VLS_ctx.smashedCounters.length));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Progress boosts are random'));
}
if (__VLS_ctx.gameState === 'finished') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-4xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    (__VLS_ctx.progress >= 100 ? '🏆' : '🦆');
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-lg font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.finishTitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Final score: {0}').format(__VLS_ctx.score));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Counters smashed: {0} / {1}').format(__VLS_ctx.smashedCounters.length, __VLS_ctx.counters.length));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.startGame) },
        ...{ class: "px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-ink-blue-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (__VLS_ctx.__('Race Again'));
}
// @ts-ignore
[__, __, __, __, __, __, __, score, gameState, startGame, progress, counters, smashedCounters, smashedCounters, duckName, finishTitle,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
