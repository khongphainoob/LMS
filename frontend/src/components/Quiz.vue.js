/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Button, call, createResource, ListView, TextEditor, FormControl, toast, } from 'frappe-ui';
import { ref, watch, reactive, inject, computed } from 'vue';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-vue-next';
import { timeAgo } from '@/utils';
import { useRouter } from 'vue-router';
import ProgressBar from '@/components/ProgressBar.vue';
const user = inject('$user');
const activeQuestion = ref(0);
const currentQuestion = ref('');
const selectedOptions = reactive([0, 0, 0, 0]);
const showAnswers = reactive([]);
let questions = reactive([]);
const possibleAnswer = ref(null);
const timer = ref(0);
let timerInterval = null;
const props = defineProps({
    quizName: {
        type: String,
        required: true,
    },
    inVideo: {
        type: Boolean,
        default: false,
    },
    backToVideo: {
        type: Function,
        default: () => { },
    },
});
const quiz = createResource({
    url: 'frappe.client.get',
    makeParams(values) {
        return {
            doctype: 'LMS Quiz',
            name: props.quizName,
        };
    },
    cache: ['quiz', props.quizName],
    auto: true,
    transform(data) {
        data.duration = parseInt(data.duration);
    },
    onSuccess(data) {
        populateQuestions();
        setupTimer();
    },
});
const populateQuestions = () => {
    let data = quiz.data;
    if (data.shuffle_questions) {
        questions = shuffleArray(data.questions);
        if (data.limit_questions_to) {
            questions = questions.slice(0, data.limit_questions_to);
        }
    }
    else {
        questions = data.questions;
    }
};
const setupTimer = () => {
    if (quiz.data.duration) {
        timer.value = quiz.data.duration * 60;
    }
};
const startTimer = () => {
    timerInterval = setInterval(() => {
        timer.value--;
        if (timer.value == 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
};
const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return hrs != '00' ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;
};
const timerProgress = computed(() => {
    return (timer.value / (quiz.data.duration * 60)) * 100;
});
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
const attempts = createResource({
    url: 'frappe.client.get_list',
    makeParams(values) {
        return {
            doctype: 'LMS Quiz Submission',
            filters: {
                member: user.data?.name,
                quiz: quiz.data?.name,
            },
            fields: [
                'name',
                'creation',
                'score',
                'score_out_of',
                'percentage',
                'passing_percentage',
            ],
            order_by: 'creation desc',
        };
    },
    transform(data) {
        data.forEach((submission, index) => {
            submission.creation = timeAgo(submission.creation);
            submission.idx = index + 1;
        });
    },
});
watch(() => quiz.data, () => {
    if (quiz.data) {
        populateQuestions();
    }
    if (quiz.data && quiz.data.max_attempts) {
        attempts.reload();
        resetQuiz();
    }
});
const quizSubmission = createResource({
    url: 'lms.lms.doctype.lms_quiz.lms_quiz.quiz_summary',
    makeParams(values) {
        return {
            quiz: quiz.data.name,
            results: localStorage.getItem(quiz.data.title),
        };
    },
});
const questionDetails = createResource({
    url: 'lms.lms.utils.get_question_details',
    makeParams(values) {
        return {
            question: currentQuestion.value,
        };
    },
});
watch(activeQuestion, (value) => {
    if (value > 0) {
        currentQuestion.value = quiz.data.questions[value - 1].question;
        questionDetails.reload();
    }
});
watch(() => props.quizName, (newName) => {
    if (newName) {
        quiz.reload();
    }
});
const startQuiz = () => {
    activeQuestion.value = 1;
    localStorage.removeItem(quiz.data.title);
    if (quiz.data.duration)
        startTimer();
};
const markAnswer = (index) => {
    if (!questionDetails.data.multiple)
        selectedOptions.splice(0, selectedOptions.length, ...[0, 0, 0, 0]);
    selectedOptions[index - 1] = selectedOptions[index - 1] ? 0 : 1;
};
const getAnswers = () => {
    let answers = [];
    const type = questionDetails.data.type;
    if (type == 'Choices') {
        selectedOptions.forEach((value, index) => {
            if (selectedOptions[index])
                answers.push(questionDetails.data[`option_${index + 1}`]);
        });
    }
    else {
        answers.push(possibleAnswer.value);
    }
    return answers;
};
const checkAnswer = () => {
    let answers = getAnswers();
    if (!answers.length) {
        toast.warning(__('Please select an option'));
        return;
    }
    createResource({
        url: 'lms.lms.doctype.lms_quiz.lms_quiz.check_answer',
        params: {
            question: currentQuestion.value,
            type: questionDetails.data.type,
            answers: JSON.stringify(answers),
        },
        auto: true,
        onSuccess(data) {
            let type = questionDetails.data.type;
            if (type == 'Choices') {
                selectedOptions.forEach((option, index) => {
                    if (option) {
                        showAnswers[index] = option && data[index];
                    }
                    else if (data[index] == 2) {
                        showAnswers[index] = 2;
                    }
                    else {
                        showAnswers[index] = undefined;
                    }
                });
            }
            else {
                showAnswers.push(data);
            }
            addToLocalStorage();
            if (!quiz.data.show_answers) {
                resetQuestion();
            }
        },
    });
};
const addToLocalStorage = () => {
    let quizData = JSON.parse(localStorage.getItem(quiz.data.title));
    let questionData = {
        question_name: currentQuestion.value,
        answer: getAnswers().join(),
        is_correct: showAnswers.filter((answer) => {
            return answer != undefined;
        }),
    };
    if (quizData) {
        let existingQuestion = quizData.find((q) => q.question_name == questionData.question_name);
        if (!existingQuestion) {
            quizData.push(questionData);
        }
    }
    else {
        quizData = [questionData];
    }
    localStorage.setItem(quiz.data.title, JSON.stringify(quizData));
};
const nextQuestion = () => {
    if (!quiz.data.show_answers && questionDetails.data?.type != 'Open Ended') {
        checkAnswer();
    }
    else {
        if (questionDetails.data?.type == 'Open Ended')
            addToLocalStorage();
        resetQuestion();
    }
};
const resetQuestion = () => {
    if (activeQuestion.value == quiz.data.questions.length)
        return;
    activeQuestion.value = activeQuestion.value + 1;
    selectedOptions.splice(0, selectedOptions.length, ...[0, 0, 0, 0]);
    showAnswers.length = 0;
    possibleAnswer.value = null;
};
const submitQuiz = () => {
    if (!quiz.data.show_answers) {
        if (questionDetails.data.type == 'Open Ended')
            addToLocalStorage();
        else
            checkAnswer();
        setTimeout(() => {
            createSubmission();
        }, 500);
        return;
    }
    createSubmission();
};
const createSubmission = () => {
    quizSubmission.submit({}, {
        onSuccess(data) {
            markLessonProgress();
            if (quiz.data && quiz.data.max_attempts)
                attempts.reload();
            if (quiz.data.duration)
                clearInterval(timerInterval);
        },
        onError(err) {
            const errorTitle = err?.message || '';
            if (errorTitle.includes('MaximumAttemptsExceededError')) {
                const errorMessage = err.messages?.[0] || err;
                toast.error(__(errorMessage));
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
        },
    });
};
const resetQuiz = () => {
    activeQuestion.value = 0;
    selectedOptions.splice(0, selectedOptions.length, ...[0, 0, 0, 0]);
    showAnswers.length = 0;
    quizSubmission.reset();
    populateQuestions();
    setupTimer();
};
const getInstructions = (question) => {
    if (question.type == 'Choices')
        if (question.multiple)
            return __('Choose all answers that apply');
        else
            return __('Choose one answer');
    else
        return __('Type your answer');
};
const markLessonProgress = () => {
    let pathname = window.location.pathname.split('/');
    if (!pathname.includes('courses'))
        pathname = window.parent.location.pathname.split('/');
    if (pathname[2] != 'courses')
        return;
    let lessonIndex = pathname.pop().split('-');
    if (lessonIndex.length == 2) {
        call('lms.lms.api.mark_lesson_progress', {
            course: pathname[3],
            chapter_number: lessonIndex[0],
            lesson_number: lessonIndex[1],
        });
    }
};
const getSubmissionColumns = () => {
    return [
        {
            label: __('No.'),
            key: 'idx',
        },
        {
            label: __('Date'),
            key: 'creation',
        },
        {
            label: __('Score'),
            key: 'score',
            align: 'center',
        },
        {
            label: __('Score out of'),
            key: 'score_out_of',
            align: 'center',
        },
        {
            label: __('Percentage'),
            key: 'percentage',
            align: 'center',
        },
    ];
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
if (__VLS_ctx.quiz.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-surface-blue-2 space-y-2 py-2 px-3 mb-4 rounded-md text-sm text-ink-blue-2 leading-5" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-blue-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    if (__VLS_ctx.inVideo) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (__VLS_ctx.__('You will have to complete the quiz to continue the video'));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "leading-5" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    (__VLS_ctx.__('This quiz consists of {0} questions.').format(__VLS_ctx.questions.length));
    if (__VLS_ctx.quiz.data?.duration) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "leading-5" },
        });
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        (__VLS_ctx.__('Please ensure that you complete all the questions in {0} minutes.').format(__VLS_ctx.quiz.data.duration));
    }
    if (__VLS_ctx.quiz.data?.duration) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "leading-5" },
        });
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        (__VLS_ctx.__('If you fail to do so, the quiz will be automatically submitted when the timer ends.'));
    }
    if (__VLS_ctx.quiz.data.passing_percentage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "leading-relaxed" },
        });
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        (__VLS_ctx.__('You will have to get {0}% correct answers in order to pass the quiz.').format(__VLS_ctx.quiz.data.passing_percentage));
    }
    if (__VLS_ctx.quiz.data.max_attempts) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "leading-5" },
        });
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        (__VLS_ctx.__('You can attempt this quiz {0}.').format(__VLS_ctx.quiz.data.max_attempts == 1
            ? '1 time'
            : `${__VLS_ctx.quiz.data.max_attempts} times`));
    }
    if (__VLS_ctx.quiz.data.enable_negative_marking) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "leading-5" },
        });
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        (__VLS_ctx.__('If you answer incorrectly, {0} {1} will be deducted from your score for each incorrect answer.').format(__VLS_ctx.quiz.data.marks_to_cut, __VLS_ctx.quiz.data.marks_to_cut == 1 ? 'mark' : 'marks'));
    }
    if (__VLS_ctx.quiz.data.duration) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col space-x-1 my-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['my-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.__('Time'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.formatTimer(__VLS_ctx.timer));
        const __VLS_0 = ProgressBar;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            progress: (__VLS_ctx.timerProgress),
        }));
        const __VLS_2 = __VLS_1({
            progress: (__VLS_ctx.timerProgress),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    if (__VLS_ctx.activeQuestion == 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border text-center p-20 rounded-md" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-20']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-semibold text-lg text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.quiz.data.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-center space-x-2 mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        if (!__VLS_ctx.quiz.data.max_attempts ||
            __VLS_ctx.attempts.data?.length < __VLS_ctx.quiz.data.max_attempts) {
            let __VLS_5;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                ...{ 'onClick': {} },
                variant: "solid",
            }));
            const __VLS_7 = __VLS_6({
                ...{ 'onClick': {} },
                variant: "solid",
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            let __VLS_10;
            const __VLS_11 = ({ click: {} },
                { onClick: (__VLS_ctx.startQuiz) });
            const { default: __VLS_12 } = __VLS_8.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.inVideo ? __VLS_ctx.__('Start the Quiz') : __VLS_ctx.__('Start'));
            // @ts-ignore
            [quiz, quiz, quiz, quiz, quiz, quiz, quiz, quiz, quiz, quiz, quiz, quiz, quiz, quiz, quiz, quiz, inVideo, inVideo, __, __, __, __, __, __, __, __, __, __, questions, formatTimer, timer, timerProgress, activeQuestion, attempts, startQuiz,];
            var __VLS_8;
            var __VLS_9;
        }
        if (__VLS_ctx.inVideo) {
            let __VLS_13;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                ...{ 'onClick': {} },
            }));
            const __VLS_15 = __VLS_14({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            let __VLS_18;
            const __VLS_19 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.quiz.data))
                            return;
                        if (!(__VLS_ctx.activeQuestion == 0))
                            return;
                        if (!(__VLS_ctx.inVideo))
                            return;
                        props.backToVideo();
                        // @ts-ignore
                        [inVideo,];
                    } });
            const { default: __VLS_20 } = __VLS_16.slots;
            (__VLS_ctx.__('Resume Video'));
            // @ts-ignore
            [__,];
            var __VLS_16;
            var __VLS_17;
        }
        if (__VLS_ctx.quiz.data.max_attempts &&
            __VLS_ctx.attempts.data?.length >= __VLS_ctx.quiz.data.max_attempts) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "leading-5 text-ink-gray-7" },
            });
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            (__VLS_ctx.__('You have already exceeded the maximum number of attempts allowed for this quiz.'));
        }
    }
    else if (!__VLS_ctx.quizSubmission.data) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        for (const [question, qtidx] of __VLS_vFor((__VLS_ctx.questions))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            if (qtidx == __VLS_ctx.activeQuestion - 1 && __VLS_ctx.questionDetails.data) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "border rounded-md p-5" },
                });
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-sm text-ink-gray-5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mr-2" },
                });
                /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
                (__VLS_ctx.__('Question {0}').format(__VLS_ctx.activeQuestion));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.getInstructions(__VLS_ctx.questionDetails.data));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-ink-gray-9 text-sm font-semibold item-left" },
                });
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['item-left']} */ ;
                (question.marks);
                (question.marks == 1 ? __VLS_ctx.__('Mark') : __VLS_ctx.__('Marks'));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-ink-gray-9 font-semibold mt-2 leading-5" },
                });
                __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.questionDetails.data.question) }, null, null);
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                if (__VLS_ctx.questionDetails.data.type == 'Choices') {
                    for (const [index] of __VLS_vFor((4))) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                        if (__VLS_ctx.questionDetails.data[`option_${index}`]) {
                            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
                                ...{ class: "flex items-center bg-surface-gray-3 rounded-md p-3 mt-4 w-full cursor-pointer focus:border-blue-600" },
                            });
                            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-3']} */ ;
                            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
                            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
                            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                            /** @type {__VLS_StyleScopedClasses['focus:border-blue-600']} */ ;
                            if (!__VLS_ctx.showAnswers.length && !__VLS_ctx.questionDetails.data.multiple) {
                                __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                                    ...{ onChange: (...[$event]) => {
                                            if (!(__VLS_ctx.quiz.data))
                                                return;
                                            if (!!(__VLS_ctx.activeQuestion == 0))
                                                return;
                                            if (!(!__VLS_ctx.quizSubmission.data))
                                                return;
                                            if (!(qtidx == __VLS_ctx.activeQuestion - 1 && __VLS_ctx.questionDetails.data))
                                                return;
                                            if (!(__VLS_ctx.questionDetails.data.type == 'Choices'))
                                                return;
                                            if (!(__VLS_ctx.questionDetails.data[`option_${index}`]))
                                                return;
                                            if (!(!__VLS_ctx.showAnswers.length && !__VLS_ctx.questionDetails.data.multiple))
                                                return;
                                            __VLS_ctx.markAnswer(index);
                                            // @ts-ignore
                                            [quiz, quiz, __, __, __, __, questions, activeQuestion, activeQuestion, attempts, quizSubmission, questionDetails, questionDetails, questionDetails, questionDetails, questionDetails, questionDetails, getInstructions, showAnswers, markAnswer,];
                                        } },
                                    type: "radio",
                                    name: (encodeURIComponent(__VLS_ctx.questionDetails.data.question)),
                                    ...{ class: "w-3.5 h-3.5 text-ink-gray-9 focus:ring-outline-gray-modals" },
                                });
                                /** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
                                /** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
                                /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                                /** @type {__VLS_StyleScopedClasses['focus:ring-outline-gray-modals']} */ ;
                            }
                            else if (!__VLS_ctx.showAnswers.length && __VLS_ctx.questionDetails.data.multiple) {
                                __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                                    ...{ onChange: (...[$event]) => {
                                            if (!(__VLS_ctx.quiz.data))
                                                return;
                                            if (!!(__VLS_ctx.activeQuestion == 0))
                                                return;
                                            if (!(!__VLS_ctx.quizSubmission.data))
                                                return;
                                            if (!(qtidx == __VLS_ctx.activeQuestion - 1 && __VLS_ctx.questionDetails.data))
                                                return;
                                            if (!(__VLS_ctx.questionDetails.data.type == 'Choices'))
                                                return;
                                            if (!(__VLS_ctx.questionDetails.data[`option_${index}`]))
                                                return;
                                            if (!!(!__VLS_ctx.showAnswers.length && !__VLS_ctx.questionDetails.data.multiple))
                                                return;
                                            if (!(!__VLS_ctx.showAnswers.length && __VLS_ctx.questionDetails.data.multiple))
                                                return;
                                            __VLS_ctx.markAnswer(index);
                                            // @ts-ignore
                                            [questionDetails, questionDetails, showAnswers, markAnswer,];
                                        } },
                                    type: "checkbox",
                                    name: (encodeURIComponent(__VLS_ctx.questionDetails.data.question)),
                                    ...{ class: "w-3.5 h-3.5 text-ink-gray-9 rounded-sm focus:ring-outline-gray-modals" },
                                });
                                /** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
                                /** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
                                /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                                /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
                                /** @type {__VLS_StyleScopedClasses['focus:ring-outline-gray-modals']} */ ;
                            }
                            else if (__VLS_ctx.quiz.data.show_answers) {
                                for (const [answer, idx] of __VLS_vFor((__VLS_ctx.showAnswers))) {
                                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                                    if (index - 1 == idx) {
                                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                                        if (answer == 1) {
                                            let __VLS_21;
                                            /** @ts-ignore @type { | typeof __VLS_components.CheckCircle} */
                                            CheckCircle;
                                            // @ts-ignore
                                            const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
                                                ...{ class: "w-4 h-4 text-ink-green-2" },
                                            }));
                                            const __VLS_23 = __VLS_22({
                                                ...{ class: "w-4 h-4 text-ink-green-2" },
                                            }, ...__VLS_functionalComponentArgsRest(__VLS_22));
                                            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                                            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                                            /** @type {__VLS_StyleScopedClasses['text-ink-green-2']} */ ;
                                        }
                                        else if (answer == 2) {
                                            let __VLS_26;
                                            /** @ts-ignore @type { | typeof __VLS_components.MinusCircle} */
                                            MinusCircle;
                                            // @ts-ignore
                                            const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
                                                ...{ class: "w-4 h-4 text-ink-green-2" },
                                            }));
                                            const __VLS_28 = __VLS_27({
                                                ...{ class: "w-4 h-4 text-ink-green-2" },
                                            }, ...__VLS_functionalComponentArgsRest(__VLS_27));
                                            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                                            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                                            /** @type {__VLS_StyleScopedClasses['text-ink-green-2']} */ ;
                                        }
                                        else if (answer == 0) {
                                            let __VLS_31;
                                            /** @ts-ignore @type { | typeof __VLS_components.XCircle} */
                                            XCircle;
                                            // @ts-ignore
                                            const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
                                                ...{ class: "w-4 h-4 text-ink-red-3" },
                                            }));
                                            const __VLS_33 = __VLS_32({
                                                ...{ class: "w-4 h-4 text-ink-red-3" },
                                            }, ...__VLS_functionalComponentArgsRest(__VLS_32));
                                            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                                            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                                            /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
                                        }
                                        else {
                                            let __VLS_36;
                                            /** @ts-ignore @type { | typeof __VLS_components.MinusCircle} */
                                            MinusCircle;
                                            // @ts-ignore
                                            const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
                                                ...{ class: "w-4 h-4" },
                                            }));
                                            const __VLS_38 = __VLS_37({
                                                ...{ class: "w-4 h-4" },
                                            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
                                            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                                            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                                        }
                                    }
                                    // @ts-ignore
                                    [quiz, questionDetails, showAnswers,];
                                }
                            }
                            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                                ...{ class: "ml-2 text-ink-gray-9" },
                            });
                            __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.questionDetails.data[`option_${index}`]) }, null, null);
                            /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
                            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                        }
                        if (__VLS_ctx.questionDetails.data[`explanation_${index}`]) {
                            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                                ...{ class: "mt-2 text-xs text-ink-gray-7" },
                            });
                            __VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.showAnswers.length) }, null, null);
                            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
                            (__VLS_ctx.questionDetails.data[`explanation_${index}`]);
                        }
                        // @ts-ignore
                        [questionDetails, questionDetails, questionDetails, showAnswers,];
                    }
                }
                else if (__VLS_ctx.questionDetails.data.type == 'User Input') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    let __VLS_41;
                    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
                    FormControl;
                    // @ts-ignore
                    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
                        modelValue: (__VLS_ctx.possibleAnswer),
                        type: "textarea",
                        disabled: (__VLS_ctx.showAnswers.length ? true : false),
                        ...{ class: "my-2" },
                    }));
                    const __VLS_43 = __VLS_42({
                        modelValue: (__VLS_ctx.possibleAnswer),
                        type: "textarea",
                        disabled: (__VLS_ctx.showAnswers.length ? true : false),
                        ...{ class: "my-2" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
                    /** @type {__VLS_StyleScopedClasses['my-2']} */ ;
                    if (__VLS_ctx.showAnswers.length) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                        if (__VLS_ctx.showAnswers[0]) {
                            let __VLS_46;
                            /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                            Badge;
                            // @ts-ignore
                            const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                                label: (__VLS_ctx.__('Correct')),
                                theme: "green",
                            }));
                            const __VLS_48 = __VLS_47({
                                label: (__VLS_ctx.__('Correct')),
                                theme: "green",
                            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
                            const { default: __VLS_51 } = __VLS_49.slots;
                            {
                                const { prefix: __VLS_52 } = __VLS_49.slots;
                                let __VLS_53;
                                /** @ts-ignore @type { | typeof __VLS_components.CheckCircle} */
                                CheckCircle;
                                // @ts-ignore
                                const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
                                    ...{ class: "w-4 h-4 text-ink-green-2 mr-1" },
                                }));
                                const __VLS_55 = __VLS_54({
                                    ...{ class: "w-4 h-4 text-ink-green-2 mr-1" },
                                }, ...__VLS_functionalComponentArgsRest(__VLS_54));
                                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                                /** @type {__VLS_StyleScopedClasses['text-ink-green-2']} */ ;
                                /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
                                // @ts-ignore
                                [__, questionDetails, showAnswers, showAnswers, showAnswers, possibleAnswer,];
                            }
                            // @ts-ignore
                            [];
                            var __VLS_49;
                        }
                        else {
                            let __VLS_58;
                            /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                            Badge;
                            // @ts-ignore
                            const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                                theme: "red",
                                label: (__VLS_ctx.__('Incorrect')),
                            }));
                            const __VLS_60 = __VLS_59({
                                theme: "red",
                                label: (__VLS_ctx.__('Incorrect')),
                            }, ...__VLS_functionalComponentArgsRest(__VLS_59));
                            const { default: __VLS_63 } = __VLS_61.slots;
                            {
                                const { prefix: __VLS_64 } = __VLS_61.slots;
                                let __VLS_65;
                                /** @ts-ignore @type { | typeof __VLS_components.XCircle} */
                                XCircle;
                                // @ts-ignore
                                const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
                                    ...{ class: "w-4 h-4 text-ink-red-3 mr-1" },
                                }));
                                const __VLS_67 = __VLS_66({
                                    ...{ class: "w-4 h-4 text-ink-red-3 mr-1" },
                                }, ...__VLS_functionalComponentArgsRest(__VLS_66));
                                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                                /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
                                /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
                                // @ts-ignore
                                [__,];
                            }
                            // @ts-ignore
                            [];
                            var __VLS_61;
                        }
                    }
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    let __VLS_70;
                    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
                    TextEditor;
                    // @ts-ignore
                    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                        ...{ 'onChange': {} },
                        ...{ class: "mt-4" },
                        content: (__VLS_ctx.possibleAnswer),
                        editable: (true),
                        fixedMenu: (true),
                        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
                    }));
                    const __VLS_72 = __VLS_71({
                        ...{ 'onChange': {} },
                        ...{ class: "mt-4" },
                        content: (__VLS_ctx.possibleAnswer),
                        editable: (true),
                        fixedMenu: (true),
                        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
                    let __VLS_75;
                    const __VLS_76 = ({ change: {} },
                        { onChange: ((val) => (__VLS_ctx.possibleAnswer = val)) });
                    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
                    var __VLS_73;
                    var __VLS_74;
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center justify-between mt-4" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-sm text-ink-gray-5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
                (__VLS_ctx.__('Question {0} of {1}').format(__VLS_ctx.activeQuestion, __VLS_ctx.questions.length));
                if (__VLS_ctx.quiz.data.show_answers &&
                    !__VLS_ctx.showAnswers.length &&
                    __VLS_ctx.questionDetails.data.type != 'Open Ended') {
                    let __VLS_77;
                    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                    Button;
                    // @ts-ignore
                    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
                        ...{ 'onClick': {} },
                    }));
                    const __VLS_79 = __VLS_78({
                        ...{ 'onClick': {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
                    let __VLS_82;
                    const __VLS_83 = ({ click: {} },
                        { onClick: (...[$event]) => {
                                if (!(__VLS_ctx.quiz.data))
                                    return;
                                if (!!(__VLS_ctx.activeQuestion == 0))
                                    return;
                                if (!(!__VLS_ctx.quizSubmission.data))
                                    return;
                                if (!(qtidx == __VLS_ctx.activeQuestion - 1 && __VLS_ctx.questionDetails.data))
                                    return;
                                if (!(__VLS_ctx.quiz.data.show_answers &&
                                    !__VLS_ctx.showAnswers.length &&
                                    __VLS_ctx.questionDetails.data.type != 'Open Ended'))
                                    return;
                                __VLS_ctx.checkAnswer();
                                // @ts-ignore
                                [quiz, __, questions, activeQuestion, questionDetails, showAnswers, possibleAnswer, possibleAnswer, checkAnswer,];
                            } });
                    const { default: __VLS_84 } = __VLS_80.slots;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                    (__VLS_ctx.__('Check'));
                    // @ts-ignore
                    [__,];
                    var __VLS_80;
                    var __VLS_81;
                }
                else if (__VLS_ctx.activeQuestion != __VLS_ctx.questions.length) {
                    let __VLS_85;
                    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                    Button;
                    // @ts-ignore
                    const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
                        ...{ 'onClick': {} },
                    }));
                    const __VLS_87 = __VLS_86({
                        ...{ 'onClick': {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
                    let __VLS_90;
                    const __VLS_91 = ({ click: {} },
                        { onClick: (...[$event]) => {
                                if (!(__VLS_ctx.quiz.data))
                                    return;
                                if (!!(__VLS_ctx.activeQuestion == 0))
                                    return;
                                if (!(!__VLS_ctx.quizSubmission.data))
                                    return;
                                if (!(qtidx == __VLS_ctx.activeQuestion - 1 && __VLS_ctx.questionDetails.data))
                                    return;
                                if (!!(__VLS_ctx.quiz.data.show_answers &&
                                    !__VLS_ctx.showAnswers.length &&
                                    __VLS_ctx.questionDetails.data.type != 'Open Ended'))
                                    return;
                                if (!(__VLS_ctx.activeQuestion != __VLS_ctx.questions.length))
                                    return;
                                __VLS_ctx.nextQuestion();
                                // @ts-ignore
                                [questions, activeQuestion, nextQuestion,];
                            } });
                    const { default: __VLS_92 } = __VLS_88.slots;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                    (__VLS_ctx.__('Next'));
                    // @ts-ignore
                    [__,];
                    var __VLS_88;
                    var __VLS_89;
                }
                else {
                    let __VLS_93;
                    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                    Button;
                    // @ts-ignore
                    const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
                        ...{ 'onClick': {} },
                    }));
                    const __VLS_95 = __VLS_94({
                        ...{ 'onClick': {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
                    let __VLS_98;
                    const __VLS_99 = ({ click: {} },
                        { onClick: (...[$event]) => {
                                if (!(__VLS_ctx.quiz.data))
                                    return;
                                if (!!(__VLS_ctx.activeQuestion == 0))
                                    return;
                                if (!(!__VLS_ctx.quizSubmission.data))
                                    return;
                                if (!(qtidx == __VLS_ctx.activeQuestion - 1 && __VLS_ctx.questionDetails.data))
                                    return;
                                if (!!(__VLS_ctx.quiz.data.show_answers &&
                                    !__VLS_ctx.showAnswers.length &&
                                    __VLS_ctx.questionDetails.data.type != 'Open Ended'))
                                    return;
                                if (!!(__VLS_ctx.activeQuestion != __VLS_ctx.questions.length))
                                    return;
                                __VLS_ctx.submitQuiz();
                                // @ts-ignore
                                [submitQuiz,];
                            } });
                    const { default: __VLS_100 } = __VLS_96.slots;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                    (__VLS_ctx.__('Submit'));
                    // @ts-ignore
                    [__,];
                    var __VLS_96;
                    var __VLS_97;
                }
            }
            // @ts-ignore
            [];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border rounded-md p-20 text-center space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-20']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-lg font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.__('Quiz Summary'));
        if (__VLS_ctx.quizSubmission.data.is_open_ended) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "leading-5 text-ink-gray-7" },
            });
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            (__VLS_ctx.__("Your submission has been successfully saved. The instructor will review and grade it shortly, and you'll be notified of your final result."));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-ink-gray-7" },
            });
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            (__VLS_ctx.__('You got {0}% correct answers with a score of {1} out of {2}').format(Math.ceil(__VLS_ctx.quizSubmission.data.percentage), __VLS_ctx.quizSubmission.data.score, __VLS_ctx.quizSubmission.data.score_out_of));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        if (!__VLS_ctx.quiz.data.max_attempts ||
            __VLS_ctx.attempts?.data.length < __VLS_ctx.quiz.data.max_attempts) {
            let __VLS_101;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
                ...{ 'onClick': {} },
                ...{ class: "mt-2" },
            }));
            const __VLS_103 = __VLS_102({
                ...{ 'onClick': {} },
                ...{ class: "mt-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_102));
            let __VLS_106;
            const __VLS_107 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.quiz.data))
                            return;
                        if (!!(__VLS_ctx.activeQuestion == 0))
                            return;
                        if (!!(!__VLS_ctx.quizSubmission.data))
                            return;
                        if (!(!__VLS_ctx.quiz.data.max_attempts ||
                            __VLS_ctx.attempts?.data.length < __VLS_ctx.quiz.data.max_attempts))
                            return;
                        __VLS_ctx.resetQuiz();
                        // @ts-ignore
                        [quiz, quiz, __, __, __, attempts, quizSubmission, quizSubmission, quizSubmission, quizSubmission, resetQuiz,];
                    } });
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            const { default: __VLS_108 } = __VLS_104.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__('Try Again'));
            // @ts-ignore
            [__,];
            var __VLS_104;
            var __VLS_105;
        }
        if (__VLS_ctx.inVideo) {
            let __VLS_109;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
                ...{ 'onClick': {} },
            }));
            const __VLS_111 = __VLS_110({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_110));
            let __VLS_114;
            const __VLS_115 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.quiz.data))
                            return;
                        if (!!(__VLS_ctx.activeQuestion == 0))
                            return;
                        if (!!(!__VLS_ctx.quizSubmission.data))
                            return;
                        if (!(__VLS_ctx.inVideo))
                            return;
                        props.backToVideo();
                        // @ts-ignore
                        [inVideo,];
                    } });
            const { default: __VLS_116 } = __VLS_112.slots;
            (__VLS_ctx.__('Resume Video'));
            // @ts-ignore
            [__,];
            var __VLS_112;
            var __VLS_113;
        }
    }
    if (__VLS_ctx.quiz.data.show_submission_history &&
        __VLS_ctx.attempts?.data &&
        __VLS_ctx.attempts.data.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-10" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
        let __VLS_117;
        /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
        ListView;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
            columns: (__VLS_ctx.getSubmissionColumns()),
            rows: (__VLS_ctx.attempts?.data),
            rowKey: "name",
            options: ({
                selectable: false,
                showTooltip: false,
                emptyState: { title: __VLS_ctx.__('No Quiz submissions found') },
            }),
        }));
        const __VLS_119 = __VLS_118({
            columns: (__VLS_ctx.getSubmissionColumns()),
            rows: (__VLS_ctx.attempts?.data),
            rowKey: "name",
            options: ({
                selectable: false,
                showTooltip: false,
                emptyState: { title: __VLS_ctx.__('No Quiz submissions found') },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    }
}
// @ts-ignore
[quiz, __, attempts, attempts, attempts, getSubmissionColumns,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        quizName: {
            type: String,
            required: true,
        },
        inVideo: {
            type: Boolean,
            default: false,
        },
        backToVideo: {
            type: Function,
            default: () => { },
        },
    },
});
export default {};
