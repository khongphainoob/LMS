/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onUnmounted } from "vue";
import { call } from "frappe-ui";
import { Clock, CheckCircle2, XCircle } from "lucide-vue-next";
const props = defineProps({
    classGame: { type: String, default: null },
});
const emit = defineEmits(["completed"]);
const timePerQuestion = 15;
const timeLeft = ref(timePerQuestion);
const currentQuestionIndex = ref(0);
const selectedAnswer = ref(null);
const hasAnswered = ref(false);
const score = ref(0);
const quizFinished = ref(false);
const questionTimes = ref([]);
const questionStartTime = ref(null);
const sessionId = ref(null);
let timerInterval = null;
const questions = [
    {
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
        correct: 0,
        category: "tech",
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1,
        category: "science",
    },
    {
        question: "What is 15% of 200?",
        options: ["20", "25", "30", "35"],
        correct: 2,
        category: "math",
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"],
        correct: 2,
        category: "art",
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2,
        category: "science",
    },
    {
        question: "Which language has the most native speakers?",
        options: ["English", "Spanish", "Hindi", "Mandarin Chinese"],
        correct: 3,
        category: "general",
    },
    {
        question: "What is the speed of light approximately?",
        options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"],
        correct: 0,
        category: "science",
    },
    {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct: 2,
        category: "history",
    },
];
const avgTime = computed(() => {
    if (!questionTimes.value.length)
        return 0;
    return (questionTimes.value.reduce((a, b) => a + b, 0) / questionTimes.value.length).toFixed(1);
});
function getCategoryLabel(cat) {
    const labels = {
        tech: "\u{1F4BB} Technology",
        science: "\u{1F52C} Science",
        math: "\u{1F522} Mathematics",
        art: "\u{1F3A8} Art",
        general: "\u{1F30D} General",
        history: "\u{1F4DC} History",
    };
    return labels[cat] || cat;
}
function startTimer() {
    questionStartTime.value = Date.now();
    timeLeft.value = timePerQuestion;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft.value--;
        if (timeLeft.value <= 0) {
            clearInterval(timerInterval);
            if (!hasAnswered.value) {
                hasAnswered.value = true;
                questionTimes.value.push(timePerQuestion);
                setTimeout(nextQuestion, 1200);
            }
        }
    }, 1000);
}
function selectAnswer(idx) {
    if (hasAnswered.value)
        return;
    hasAnswered.value = true;
    selectedAnswer.value = idx;
    clearInterval(timerInterval);
    const elapsed = (Date.now() - questionStartTime.value) / 1000;
    questionTimes.value.push(Math.round(elapsed));
    if (idx === questions[currentQuestionIndex.value].correct) {
        score.value++;
    }
    setTimeout(nextQuestion, 1200);
}
function nextQuestion() {
    if (currentQuestionIndex.value < questions.length - 1) {
        currentQuestionIndex.value++;
        selectedAnswer.value = null;
        hasAnswered.value = false;
        startTimer();
    }
    else {
        quizFinished.value = true;
        clearInterval(timerInterval);
        submitScore();
    }
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
        raw_score: score.value * 100,
        metadata: { question_times: questionTimes.value },
    });
    emit("completed");
}
function getOptionClass(idx) {
    if (!hasAnswered.value) {
        return selectedAnswer.value === idx
            ? "border-ink-blue-4 bg-blue-50 dark:bg-blue-900/20"
            : "border-outline-gray-2 hover:border-outline-gray-3 hover:bg-surface-gray-1";
    }
    if (idx === questions[currentQuestionIndex.value].correct) {
        return "border-green-400 bg-green-50 dark:bg-green-900/20";
    }
    if (selectedAnswer.value === idx) {
        return "border-red-400 bg-red-50 dark:bg-red-900/20";
    }
    return "border-outline-gray-2 opacity-50";
}
function getOptionLetterClass(idx) {
    if (!hasAnswered.value) {
        return "bg-surface-gray-2 text-ink-gray-6";
    }
    if (idx === questions[currentQuestionIndex.value].correct) {
        return "bg-green-500 text-white";
    }
    if (selectedAnswer.value === idx) {
        return "bg-red-500 text-white";
    }
    return "bg-surface-gray-2 text-ink-gray-4";
}
function getDotClass(idx) {
    if (idx === currentQuestionIndex.value && !quizFinished.value)
        return "bg-ink-blue-4";
    if (idx < currentQuestionIndex.value || quizFinished.value) {
        return answeredCorrectly(idx) ? "bg-green-400" : "bg-red-400";
    }
    return "bg-surface-gray-3";
}
function answeredCorrectly(idx) {
    return idx < questionTimes.value.length && score.value > 0;
}
function getResultMessage() {
    const pct = (score.value / questions.length) * 100;
    if (pct >= 80)
        return __("Outstanding! You're a quiz master! \u{1F3C6}");
    if (pct >= 60)
        return __("Great job! Keep up the good work! \u{1F31F}");
    if (pct >= 40)
        return __("Not bad! Room for improvement. \u{1F4AA}");
    return __("Keep practicing! You'll get better! \u{1F4DA}");
}
function resetQuiz() {
    currentQuestionIndex.value = 0;
    selectedAnswer.value = null;
    hasAnswered.value = false;
    score.value = 0;
    quizFinished.value = false;
    questionTimes.value = [];
    startTimer();
    startSession();
}
onUnmounted(() => {
    clearInterval(timerInterval);
});
startTimer();
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
(__VLS_ctx.__("Timed Quiz Challenge"));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 text-sm font-medium" },
    ...{ class: (__VLS_ctx.timeLeft <= 5 ? 'text-red-500' : 'text-ink-gray-6') },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Clock} */
Clock;
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
    ...{ class: "text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
(__VLS_ctx.currentQuestionIndex + 1);
(__VLS_ctx.questions.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-full h-1.5 bg-surface-gray-2 rounded-full overflow-hidden" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "h-full rounded-full transition-all duration-500" },
    ...{ class: (__VLS_ctx.timeLeft <= 5 ? 'bg-red-400' : 'bg-ink-blue-4') },
    ...{ style: ({ width: ((__VLS_ctx.timeLeft / __VLS_ctx.timePerQuestion) * 100) + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
if (!__VLS_ctx.quizFinished) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1 text-xs text-ink-gray-5 font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.getCategoryLabel(__VLS_ctx.questions[__VLS_ctx.currentQuestionIndex].category));
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-lg font-semibold text-ink-gray-9 mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    (__VLS_ctx.questions[__VLS_ctx.currentQuestionIndex].question);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2.5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2.5']} */ ;
    for (const [option, idx] of __VLS_vFor((__VLS_ctx.questions[__VLS_ctx.currentQuestionIndex].options))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.quizFinished))
                        return;
                    __VLS_ctx.selectAnswer(idx);
                    // @ts-ignore
                    [__, timeLeft, timeLeft, timeLeft, timeLeft, currentQuestionIndex, currentQuestionIndex, currentQuestionIndex, currentQuestionIndex, questions, questions, questions, questions, timePerQuestion, quizFinished, getCategoryLabel, selectAnswer,];
                } },
            key: (idx),
            disabled: (__VLS_ctx.hasAnswered),
            ...{ class: "w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all duration-200 flex items-center gap-3" },
            ...{ class: (__VLS_ctx.getOptionClass(idx)) },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" },
            ...{ class: (__VLS_ctx.getOptionLetterClass(idx)) },
        });
        /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        (String.fromCharCode(65 + idx));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (option);
        if (__VLS_ctx.hasAnswered && idx === __VLS_ctx.questions[__VLS_ctx.currentQuestionIndex].correct) {
            let __VLS_5;
            /** @ts-ignore @type { | typeof __VLS_components.CheckCircle2} */
            CheckCircle2;
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                ...{ class: "size-5 text-green-500 ml-auto" },
            }));
            const __VLS_7 = __VLS_6({
                ...{ class: "size-5 text-green-500 ml-auto" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        }
        if (__VLS_ctx.hasAnswered && __VLS_ctx.selectedAnswer === idx && idx !== __VLS_ctx.questions[__VLS_ctx.currentQuestionIndex].correct) {
            let __VLS_10;
            /** @ts-ignore @type { | typeof __VLS_components.XCircle} */
            XCircle;
            // @ts-ignore
            const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
                ...{ class: "size-5 text-red-500 ml-auto" },
            }));
            const __VLS_12 = __VLS_11({
                ...{ class: "size-5 text-red-500 ml-auto" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_11));
            /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        }
        // @ts-ignore
        [currentQuestionIndex, currentQuestionIndex, questions, questions, hasAnswered, hasAnswered, hasAnswered, getOptionClass, getOptionLetterClass, selectedAnswer,];
    }
}
if (__VLS_ctx.quizFinished) {
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
    (__VLS_ctx.score >= 4 ? "\u{1F389}" : __VLS_ctx.score >= 2 ? "\u{1F44D}" : "\u{1F4AA}");
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-lg font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__("Quiz Complete!"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center gap-6" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-3xl font-bold text-ink-blue-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-4']} */ ;
    (__VLS_ctx.score);
    (__VLS_ctx.questions.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__("Correct"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-3xl font-bold text-ink-amber-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-amber-5']} */ ;
    (__VLS_ctx.avgTime);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__("Avg Time"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-6" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
    (__VLS_ctx.getResultMessage());
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.resetQuiz) },
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-center gap-1.5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
for (const [q, idx] of __VLS_vFor((__VLS_ctx.questions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (idx),
        ...{ class: "w-3 h-3 rounded-full transition-colors" },
        ...{ class: (__VLS_ctx.getDotClass(idx)) },
    });
    /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    // @ts-ignore
    [__, __, __, __, questions, questions, quizFinished, score, score, score, avgTime, getResultMessage, resetQuiz, getDotClass,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    props: {
        classGame: { type: String, default: null },
    },
});
export default {};
