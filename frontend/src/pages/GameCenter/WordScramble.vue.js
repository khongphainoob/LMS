/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, nextTick } from "vue";
import { call } from "frappe-ui";
import { Star, Heart } from "lucide-vue-next";
const props = defineProps({
    classGame: { type: String, default: null },
});
const emit = defineEmits(["completed"]);
const score = ref(0);
const lives = ref(3);
const maxLives = 3;
const currentIndex = ref(0);
const scrambledLetters = ref([]);
const answerSlots = ref([]);
const isWrong = ref(false);
const feedback = ref(null);
const gameOver = ref(false);
const hintsLeft = ref(3);
const wordResults = ref([]);
const sessionId = ref(null);
const words = [
    { answer: "ALGORITHM", hint: "A step-by-step procedure", category: "tech" },
    { answer: "BACTERIA", hint: "Microscopic organisms", category: "science" },
    { answer: "CALCULUS", hint: "Branch of mathematics", category: "math" },
    { answer: "DEMOCRACY", hint: "System of government", category: "history" },
    { answer: "ELEPHANT", hint: "Largest land animal", category: "nature" },
    { answer: "FRICTION", hint: "Force that opposes motion", category: "science" },
    { answer: "GEOMETRY", hint: "Study of shapes", category: "math" },
    { answer: "HYDROGEN", hint: "Lightest element", category: "science" },
    { answer: "INTERNET", hint: "Global network", category: "tech" },
    { answer: "JUPITER", hint: "Largest planet", category: "science" },
];
const correctCount = computed(() => wordResults.value.filter(Boolean).length);
function getCategoryLabel(cat) {
    const labels = {
        tech: "\u{1F4BB} Tech",
        science: "\u{1F52C} Science",
        math: "\u{1F522} Math",
        history: "\u{1F4DC} History",
        nature: "\u{1F33F} Nature",
    };
    return labels[cat] || cat;
}
function scrambleWord(word) {
    const letters = word.split("").map((char) => ({ char, picked: false }));
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    if (letters.map((l) => l.char).join("") === word && word.length > 1) {
        ;
        [letters[0], letters[1]] = [letters[1], letters[0]];
    }
    return letters;
}
function loadWord() {
    const word = words[currentIndex.value];
    scrambledLetters.value = scrambleWord(word.answer);
    answerSlots.value = new Array(word.answer.length).fill(null);
    isWrong.value = false;
    feedback.value = null;
}
function pickLetter(idx) {
    if (scrambledLetters.value[idx].picked)
        return;
    scrambledLetters.value[idx].picked = true;
    const slotIdx = answerSlots.value.indexOf(null);
    if (slotIdx !== -1) {
        answerSlots.value[slotIdx] = scrambledLetters.value[idx].char;
    }
}
function clearAnswer() {
    scrambledLetters.value.forEach((l) => (l.picked = false));
    answerSlots.value = new Array(words[currentIndex.value].answer.length).fill(null);
    isWrong.value = false;
    feedback.value = null;
}
function useHint() {
    if (hintsLeft.value <= 0)
        return;
    hintsLeft.value--;
    const correct = words[currentIndex.value].answer;
    for (let i = 0; i < correct.length; i++) {
        if (answerSlots.value[i] !== correct[i]) {
            answerSlots.value[i] = correct[i];
            const letterIdx = scrambledLetters.value.findIndex((l) => l.char === correct[i] && !l.picked);
            if (letterIdx !== -1)
                scrambledLetters.value[letterIdx].picked = true;
            break;
        }
    }
}
function checkAnswer() {
    const answer = answerSlots.value.join("");
    const correct = words[currentIndex.value].answer;
    if (answer === correct) {
        const timeBonus = hintsLeft.value > 0 ? 5 : 0;
        const baseScore = correct.length * 3;
        score.value += baseScore + timeBonus;
        wordResults.value.push(true);
        feedback.value = { correct: true, message: __("Correct! +" + (baseScore + timeBonus) + " pts \u{2728}") };
        setTimeout(() => {
            if (currentIndex.value < words.length - 1) {
                currentIndex.value++;
                loadWord();
            }
            else {
                gameOver.value = true;
            }
        }, 1000);
    }
    else {
        lives.value--;
        isWrong.value = true;
        score.value = Math.max(0, score.value - 2);
        feedback.value = { correct: false, message: __("Wrong! The answer was: " + correct) };
        wordResults.value.push(false);
        setTimeout(() => {
            if (lives.value <= 0) {
                gameOver.value = true;
                submitScore();
            }
            else if (currentIndex.value < words.length - 1) {
                currentIndex.value++;
                loadWord();
            }
            else {
                gameOver.value = true;
                submitScore();
            }
        }, 1500);
    }
    async function startSession() {
        if (!props.classGame)
            return;
        const res = await call("lms.lms.api.start_game_session", { class_game: props.classGame });
        sessionId.value = res.session_id;
    }
    async function submitScore() {
        if (!sessionId.value)
            return;
        await call("lms.lms.api.submit_game_session", {
            session_id: sessionId.value,
            raw_score: score.value,
            metadata: { word_results: wordResults.value },
        });
        emit("completed");
    }
}
function resetGame() {
    score.value = 0;
    lives.value = maxLives;
    currentIndex.value = 0;
    hintsLeft.value = 3;
    wordResults.value = [];
    gameOver.value = false;
    loadWord();
    startSession();
}
loadWord();
startSession();
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
(__VLS_ctx.__("Word Scramble"));
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
/** @ts-ignore @type { | typeof __VLS_components.Star} */
Star;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-4 text-ink-amber-4" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-4 text-ink-amber-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-amber-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.score);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Heart} */
Heart;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ class: "size-4 text-red-500" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "size-4 text-red-500" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.lives);
(__VLS_ctx.maxLives);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-center gap-1.5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
for (const [w, idx] of __VLS_vFor((__VLS_ctx.words))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (idx),
        ...{ class: "w-2.5 h-2.5 rounded-full transition-colors" },
        ...{ class: (idx < __VLS_ctx.currentIndex ? (__VLS_ctx.wordResults[idx] ? 'bg-green-400' : 'bg-red-400') : idx === __VLS_ctx.currentIndex ? 'bg-ink-blue-4' : 'bg-surface-gray-3') },
    });
    /** @type {__VLS_StyleScopedClasses['w-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    // @ts-ignore
    [__, score, lives, maxLives, words, currentIndex, currentIndex, wordResults,];
}
if (!__VLS_ctx.gameOver && __VLS_ctx.currentIndex < __VLS_ctx.words.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-ink-gray-5 bg-surface-gray-1 px-2 py-0.5 rounded-full" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    (__VLS_ctx.words[__VLS_ctx.currentIndex].hint);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-medium text-ink-blue-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-4']} */ ;
    (__VLS_ctx.getCategoryLabel(__VLS_ctx.words[__VLS_ctx.currentIndex].category));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center gap-2 mb-6 flex-wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    for (const [letter, idx] of __VLS_vFor((__VLS_ctx.scrambledLetters))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.gameOver && __VLS_ctx.currentIndex < __VLS_ctx.words.length))
                        return;
                    __VLS_ctx.pickLetter(idx);
                    // @ts-ignore
                    [words, words, words, currentIndex, currentIndex, currentIndex, gameOver, getCategoryLabel, scrambledLetters, pickLetter,];
                } },
            key: (idx),
            disabled: (letter.picked),
            ...{ class: "w-11 h-11 rounded-lg text-lg font-bold transition-all duration-200 flex items-center justify-center" },
            ...{ class: (letter.picked
                    ? 'bg-surface-gray-2 text-ink-gray-3 scale-90'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-ink-blue-5 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer') },
        });
        /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        (letter.char);
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center gap-2 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    for (const [_, idx] of __VLS_vFor((__VLS_ctx.words[__VLS_ctx.currentIndex].answer))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (idx),
            ...{ class: "w-11 h-11 rounded-lg border-2 border-dashed flex items-center justify-center text-lg font-bold transition-all duration-200" },
            ...{ class: (__VLS_ctx.answerSlots[idx]
                    ? (__VLS_ctx.isWrong ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-ink-blue-4 bg-blue-50 dark:bg-blue-900/20 text-ink-blue-5')
                    : 'border-outline-gray-2 bg-surface-gray-1') },
        });
        /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        (__VLS_ctx.answerSlots[idx]);
        // @ts-ignore
        [words, currentIndex, answerSlots, answerSlots, isWrong,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.clearAnswer) },
        ...{ class: "px-4 py-2 rounded-lg bg-surface-gray-2 text-ink-gray-6 text-sm hover:bg-surface-gray-3 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (__VLS_ctx.__("Clear"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.checkAnswer) },
        disabled: (__VLS_ctx.answerSlots.filter(Boolean).length < __VLS_ctx.words[__VLS_ctx.currentIndex].answer.length),
        ...{ class: "px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" },
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
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    (__VLS_ctx.__("Check"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.useHint) },
        disabled: (__VLS_ctx.hintsLeft <= 0),
        ...{ class: "px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-amber-900/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:text-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-amber-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:hover:bg-amber-900/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    (__VLS_ctx.__("Hint ({0})").format(__VLS_ctx.hintsLeft));
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
    transition;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        enterActiveClass: "transition-all duration-300",
        enterFromClass: "opacity-0 -translate-y-2",
        leaveActiveClass: "transition-all duration-200",
        leaveToClass: "opacity-0",
    }));
    const __VLS_12 = __VLS_11({
        enterActiveClass: "transition-all duration-300",
        enterFromClass: "opacity-0 -translate-y-2",
        leaveActiveClass: "transition-all duration-200",
        leaveToClass: "opacity-0",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const { default: __VLS_15 } = __VLS_13.slots;
    if (__VLS_ctx.feedback) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm font-medium" },
            ...{ class: (__VLS_ctx.feedback.correct ? 'text-green-600' : 'text-red-500') },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.feedback.message);
    }
    // @ts-ignore
    [__, __, __, words, currentIndex, answerSlots, clearAnswer, checkAnswer, useHint, hintsLeft, hintsLeft, feedback, feedback, feedback,];
    var __VLS_13;
}
if (__VLS_ctx.gameOver) {
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
    (__VLS_ctx.score >= 40 ? "\u{1F3C6}" : __VLS_ctx.score >= 20 ? "\u{1F31F}" : "\u{1F4DA}");
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-lg font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__("Game Over!"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-3xl font-bold text-ink-blue-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-4']} */ ;
    (__VLS_ctx.score);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__("Solved {0} out of {1} words").format(__VLS_ctx.correctCount, __VLS_ctx.words.length));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.resetGame) },
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
    (__VLS_ctx.__("Play Again"));
}
// @ts-ignore
[__, __, __, score, score, score, words, gameOver, correctCount, resetGame,];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    props: {
        classGame: { type: String, default: null },
    },
});
export default {};
