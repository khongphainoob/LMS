/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, createResource, FormControl, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, ListRowItem, ListSelectBanner, Button, usePageMeta, toast, createDocumentResource, Badge, } from 'frappe-ui';
import { computed, reactive, ref, onMounted, inject, onBeforeUnmount, } from 'vue';
import { sessionStore } from '../stores/session';
import { ClipboardList, ListChecks, Plus, Trash2 } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { escapeHTML } from '@/utils';
import Question from '@/components/Modals/Question.vue';
const { brand } = sessionStore();
const showQuestionModal = ref(false);
const currentQuestion = reactive({
    question: '',
    marks: 0,
    name: '',
});
const user = inject('$user');
const router = useRouter();
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    quizID: {
        type: String,
        required: true,
    },
});
const questions = computed(() => {
    return quizDetails.doc?.questions || [];
});
onMounted(() => {
    if (!user.data?.is_moderator && !user.data?.is_instructor) {
        router.push({ name: 'Courses' });
    }
    quizDetails.reload();
    window.addEventListener('keydown', keyboardShortcut);
});
const keyboardShortcut = (e) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        submitQuiz();
        e.preventDefault();
    }
};
onBeforeUnmount(() => {
    window.removeEventListener('keydown', keyboardShortcut);
});
const quizDetails = createDocumentResource({
    doctype: 'LMS Quiz',
    name: props.quizID,
    auto: false,
});
const validateTitle = () => {
    quizDetails.doc.title = escapeHTML(quizDetails.doc.title.trim());
};
const submitQuiz = () => {
    validateTitle();
    quizDetails.setValue.submit({
        ...quizDetails.doc,
        total_marks: calculateTotalMarks(),
    }, {
        onSuccess(data) {
            quizDetails.doc.total_marks = data.total_marks;
            toast.success(__('Quiz updated successfully'));
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const calculateTotalMarks = () => {
    let totalMarks = 0;
    if (quizDetails.doc?.limit_questions_to &&
        quizDetails.doc?.questions.length > 0)
        return (quizDetails.doc.questions[0].marks * quizDetails.doc.limit_questions_to);
    quizDetails.doc?.questions.forEach((question) => {
        totalMarks += question.marks;
    });
    return totalMarks;
};
const questionColumns = computed(() => {
    return [
        {
            label: __('ID'),
            key: 'question',
            width: '10rem',
        },
        {
            label: __('Question'),
            key: __('question_detail'),
            width: '40rem',
        },
        {
            label: __('Marks'),
            key: 'marks',
            width: '5rem',
        },
    ];
});
const openQuestionModal = (question = null) => {
    if (question) {
        currentQuestion.question = question.question;
        currentQuestion.marks = question.marks;
        currentQuestion.name = question.name;
    }
    else {
        currentQuestion.question = '';
        currentQuestion.marks = 0;
        currentQuestion.name = '';
    }
    showQuestionModal.value = true;
};
const deleteQuestionResource = createResource({
    url: 'lms.lms.api.delete_documents',
    makeParams(values) {
        return {
            doctype: 'LMS Quiz Question',
            documents: values.questions,
        };
    },
});
const deleteQuestions = (selections, unselectAll) => {
    deleteQuestionResource.submit({
        questions: Array.from(selections),
    }, {
        onSuccess() {
            toast.success(__('Questions deleted successfully'));
            quizDetails.reload();
            unselectAll();
        },
    });
};
const breadcrumbs = computed(() => {
    let crumbs = [
        {
            label: __('Quizzes'),
            route: {
                name: 'Quizzes',
            },
        },
    ];
    crumbs.push({
        label: quizDetails.doc?.title,
        route: { name: 'QuizForm', params: { quizID: props.quizID } },
    });
    return crumbs;
});
usePageMeta(() => {
    return {
        title: quizDetails.doc?.title,
        icon: brand.favicon,
    };
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
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-5']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Breadcrumbs} */
Breadcrumbs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (!__VLS_ctx.readOnlyMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    if (__VLS_ctx.quizDetails.isDirty) {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            theme: "orange",
        }));
        const __VLS_7 = __VLS_6({
            theme: "orange",
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        const { default: __VLS_10 } = __VLS_8.slots;
        (__VLS_ctx.__('Not Saved'));
        // @ts-ignore
        [breadcrumbs, readOnlyMode, quizDetails, __,];
        var __VLS_8;
    }
    if (__VLS_ctx.quizDetails.doc?.name) {
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            to: ({
                name: 'QuizPage',
                params: {
                    quizID: __VLS_ctx.quizDetails.doc.name,
                },
            }),
        }));
        const __VLS_13 = __VLS_12({
            to: ({
                name: 'QuizPage',
                params: {
                    quizID: __VLS_ctx.quizDetails.doc.name,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        const { default: __VLS_16 } = __VLS_14.slots;
        let __VLS_17;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({}));
        const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
        const { default: __VLS_22 } = __VLS_20.slots;
        {
            const { prefix: __VLS_23 } = __VLS_20.slots;
            let __VLS_24;
            /** @ts-ignore @type { | typeof __VLS_components.ListChecks} */
            ListChecks;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_26 = __VLS_25({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [quizDetails, quizDetails,];
        }
        (__VLS_ctx.__('Test Quiz'));
        // @ts-ignore
        [__,];
        var __VLS_20;
        // @ts-ignore
        [];
        var __VLS_14;
    }
    if (__VLS_ctx.quizDetails.doc?.name) {
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            to: ({
                name: 'QuizSubmissionList',
                params: {
                    quizID: __VLS_ctx.quizDetails.doc.name,
                },
            }),
        }));
        const __VLS_31 = __VLS_30({
            to: ({
                name: 'QuizSubmissionList',
                params: {
                    quizID: __VLS_ctx.quizDetails.doc.name,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        const { default: __VLS_34 } = __VLS_32.slots;
        let __VLS_35;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({}));
        const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
        const { default: __VLS_40 } = __VLS_38.slots;
        {
            const { prefix: __VLS_41 } = __VLS_38.slots;
            let __VLS_42;
            /** @ts-ignore @type { | typeof __VLS_components.ClipboardList} */
            ClipboardList;
            // @ts-ignore
            const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_44 = __VLS_43({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_43));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [quizDetails, quizDetails,];
        }
        (__VLS_ctx.__('Check Submissions'));
        // @ts-ignore
        [__,];
        var __VLS_38;
        // @ts-ignore
        [];
        var __VLS_32;
    }
    let __VLS_47;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_49 = __VLS_48({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_52;
    const __VLS_53 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.submitQuiz();
                // @ts-ignore
                [submitQuiz,];
            } });
    const { default: __VLS_54 } = __VLS_50.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_50;
    var __VLS_51;
}
if (__VLS_ctx.quizDetails.doc) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "py-5" },
    });
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "px-20 pb-5 space-y-5 border-b mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['px-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg text-ink-gray-9 font-semibold mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    (__VLS_ctx.__('Details'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    let __VLS_55;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        modelValue: (__VLS_ctx.quizDetails.doc.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }));
    const __VLS_57 = __VLS_56({
        modelValue: (__VLS_ctx.quizDetails.doc.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    let __VLS_60;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
        type: "number",
        modelValue: (__VLS_ctx.quizDetails.doc.max_attempts),
        label: (__VLS_ctx.__('Maximum Attempts')),
    }));
    const __VLS_62 = __VLS_61({
        type: "number",
        modelValue: (__VLS_ctx.quizDetails.doc.max_attempts),
        label: (__VLS_ctx.__('Maximum Attempts')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_65;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
        type: "number",
        modelValue: (__VLS_ctx.quizDetails.doc.duration),
        label: (__VLS_ctx.__('Duration (in minutes)')),
    }));
    const __VLS_67 = __VLS_66({
        type: "number",
        modelValue: (__VLS_ctx.quizDetails.doc.duration),
        label: (__VLS_ctx.__('Duration (in minutes)')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    let __VLS_70;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
        modelValue: (__VLS_ctx.quizDetails.doc.total_marks),
        label: (__VLS_ctx.__('Total Marks')),
        disabled: true,
    }));
    const __VLS_72 = __VLS_71({
        modelValue: (__VLS_ctx.quizDetails.doc.total_marks),
        label: (__VLS_ctx.__('Total Marks')),
        disabled: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    let __VLS_75;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
        modelValue: (__VLS_ctx.quizDetails.doc.passing_percentage),
        label: (__VLS_ctx.__('Passing Percentage')),
        required: (true),
    }));
    const __VLS_77 = __VLS_76({
        modelValue: (__VLS_ctx.quizDetails.doc.passing_percentage),
        label: (__VLS_ctx.__('Passing Percentage')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "px-20 pb-5 space-y-5 border-b mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['px-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg text-ink-gray-9 font-semibold mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    (__VLS_ctx.__('Settings'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col space-y-10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-10']} */ ;
    let __VLS_80;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
        modelValue: (__VLS_ctx.quizDetails.doc.show_answers),
        type: "checkbox",
        label: (__VLS_ctx.__('Show Answers')),
    }));
    const __VLS_82 = __VLS_81({
        modelValue: (__VLS_ctx.quizDetails.doc.show_answers),
        type: "checkbox",
        label: (__VLS_ctx.__('Show Answers')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_85;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
        modelValue: (__VLS_ctx.quizDetails.doc.show_submission_history),
        type: "checkbox",
        label: (__VLS_ctx.__('Show Submission History')),
    }));
    const __VLS_87 = __VLS_86({
        modelValue: (__VLS_ctx.quizDetails.doc.show_submission_history),
        type: "checkbox",
        label: (__VLS_ctx.__('Show Submission History')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    let __VLS_90;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        modelValue: (__VLS_ctx.quizDetails.doc.shuffle_questions),
        type: "checkbox",
        label: (__VLS_ctx.__('Shuffle Questions')),
    }));
    const __VLS_92 = __VLS_91({
        modelValue: (__VLS_ctx.quizDetails.doc.shuffle_questions),
        type: "checkbox",
        label: (__VLS_ctx.__('Shuffle Questions')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    if (__VLS_ctx.quizDetails.doc.shuffle_questions) {
        let __VLS_95;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
            modelValue: (__VLS_ctx.quizDetails.doc.limit_questions_to),
            label: (__VLS_ctx.__('Limit Questions To')),
        }));
        const __VLS_97 = __VLS_96({
            modelValue: (__VLS_ctx.quizDetails.doc.limit_questions_to),
            label: (__VLS_ctx.__('Limit Questions To')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    let __VLS_100;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
        modelValue: (__VLS_ctx.quizDetails.doc.enable_negative_marking),
        type: "checkbox",
        label: (__VLS_ctx.__('Enable Negative Marking')),
    }));
    const __VLS_102 = __VLS_101({
        modelValue: (__VLS_ctx.quizDetails.doc.enable_negative_marking),
        type: "checkbox",
        label: (__VLS_ctx.__('Enable Negative Marking')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    if (__VLS_ctx.quizDetails.doc.enable_negative_marking) {
        let __VLS_105;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
            modelValue: (__VLS_ctx.quizDetails.doc.marks_to_cut),
            label: (__VLS_ctx.__('Marks to Deduct')),
        }));
        const __VLS_107 = __VLS_106({
            modelValue: (__VLS_ctx.quizDetails.doc.marks_to_cut),
            label: (__VLS_ctx.__('Marks to Deduct')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "px-20 pb-5 space-y-5 mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['px-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Questions'));
    if (!__VLS_ctx.readOnlyMode) {
        let __VLS_110;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
            ...{ 'onClick': {} },
        }));
        const __VLS_112 = __VLS_111({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_111));
        let __VLS_115;
        const __VLS_116 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.quizDetails.doc))
                        return;
                    if (!(!__VLS_ctx.readOnlyMode))
                        return;
                    __VLS_ctx.openQuestionModal();
                    // @ts-ignore
                    [readOnlyMode, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, quizDetails, __, __, __, __, __, __, __, __, __, __, __, __, __, __, openQuestionModal,];
                } });
        const { default: __VLS_117 } = __VLS_113.slots;
        {
            const { prefix: __VLS_118 } = __VLS_113.slots;
            let __VLS_119;
            /** @ts-ignore @type { | typeof __VLS_components.Plus} */
            Plus;
            // @ts-ignore
            const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
                ...{ class: "w-4 h-4" },
            }));
            const __VLS_121 = __VLS_120({
                ...{ class: "w-4 h-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_120));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('New Question'));
        // @ts-ignore
        [__,];
        var __VLS_113;
        var __VLS_114;
    }
    if (__VLS_ctx.questions.length) {
        let __VLS_124;
        /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
        ListView;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
            columns: (__VLS_ctx.questionColumns),
            rows: (__VLS_ctx.questions),
            rowKey: "name",
            options: ({
                showTooltip: false,
            }),
        }));
        const __VLS_126 = __VLS_125({
            columns: (__VLS_ctx.questionColumns),
            rows: (__VLS_ctx.questions),
            rowKey: "name",
            options: ({
                showTooltip: false,
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        const { default: __VLS_129 } = __VLS_127.slots;
        let __VLS_130;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
        ListHeader;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }));
        const __VLS_132 = __VLS_131({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        const { default: __VLS_135 } = __VLS_133.slots;
        for (const [item] of __VLS_vFor((__VLS_ctx.questionColumns))) {
            let __VLS_136;
            /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem} */
            ListHeaderItem;
            // @ts-ignore
            const __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({
                item: (item),
            }));
            const __VLS_138 = __VLS_137({
                item: (item),
            }, ...__VLS_functionalComponentArgsRest(__VLS_137));
            // @ts-ignore
            [questions, questions, questionColumns, questionColumns,];
        }
        // @ts-ignore
        [];
        var __VLS_133;
        let __VLS_141;
        /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
        ListRows;
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({}));
        const __VLS_143 = __VLS_142({}, ...__VLS_functionalComponentArgsRest(__VLS_142));
        const { default: __VLS_146 } = __VLS_144.slots;
        for (const [row] of __VLS_vFor((__VLS_ctx.questions))) {
            let __VLS_147;
            /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
            ListRow;
            // @ts-ignore
            const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
                ...{ 'onClick': {} },
                row: (row),
                ...{ class: "cursor-pointer" },
            }));
            const __VLS_149 = __VLS_148({
                ...{ 'onClick': {} },
                row: (row),
                ...{ class: "cursor-pointer" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_148));
            let __VLS_152;
            const __VLS_153 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.quizDetails.doc))
                            return;
                        if (!(__VLS_ctx.questions.length))
                            return;
                        __VLS_ctx.openQuestionModal(row);
                        // @ts-ignore
                        [openQuestionModal, questions,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            {
                const { default: __VLS_154 } = __VLS_150.slots;
                const [{ idx, column, item }] = __VLS_vSlot(__VLS_154);
                let __VLS_155;
                /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
                ListRowItem;
                // @ts-ignore
                const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
                    item: (item),
                }));
                const __VLS_157 = __VLS_156({
                    item: (item),
                }, ...__VLS_functionalComponentArgsRest(__VLS_156));
                const { default: __VLS_160 } = __VLS_158.slots;
                if (column.key == 'question_detail') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "text-xs truncate h-4" },
                    });
                    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (item) }, null, null);
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "text-xs" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    (item);
                }
                // @ts-ignore
                [];
                var __VLS_158;
                // @ts-ignore
                [];
                __VLS_150.slots['' /* empty slot name completion */];
            }
            var __VLS_150;
            var __VLS_151;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_144;
        let __VLS_161;
        /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
        ListSelectBanner;
        // @ts-ignore
        const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({}));
        const __VLS_163 = __VLS_162({}, ...__VLS_functionalComponentArgsRest(__VLS_162));
        const { default: __VLS_166 } = __VLS_164.slots;
        {
            const { actions: __VLS_167 } = __VLS_164.slots;
            const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_167);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            let __VLS_168;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
                ...{ 'onClick': {} },
                variant: "ghost",
            }));
            const __VLS_170 = __VLS_169({
                ...{ 'onClick': {} },
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_169));
            let __VLS_173;
            const __VLS_174 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.quizDetails.doc))
                            return;
                        if (!(__VLS_ctx.questions.length))
                            return;
                        __VLS_ctx.deleteQuestions(selections, unselectAll);
                        // @ts-ignore
                        [deleteQuestions,];
                    } });
            const { default: __VLS_175 } = __VLS_171.slots;
            let __VLS_176;
            /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
            Trash2;
            // @ts-ignore
            const __VLS_177 = __VLS_asFunctionalComponent1(__VLS_176, new __VLS_176({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_178 = __VLS_177({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_177));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
            var __VLS_171;
            var __VLS_172;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_164;
        // @ts-ignore
        [];
        var __VLS_127;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-6 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (__VLS_ctx.__('No questions added yet'));
    }
}
const __VLS_181 = Question;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
    modelValue: (__VLS_ctx.showQuestionModal),
    questionDetail: (__VLS_ctx.currentQuestion),
    quiz: (__VLS_ctx.quizDetails),
    title: (__VLS_ctx.currentQuestion.question
        ? __VLS_ctx.__('Edit the question')
        : __VLS_ctx.__('Add a new question')),
}));
const __VLS_183 = __VLS_182({
    modelValue: (__VLS_ctx.showQuestionModal),
    questionDetail: (__VLS_ctx.currentQuestion),
    quiz: (__VLS_ctx.quizDetails),
    title: (__VLS_ctx.currentQuestion.question
        ? __VLS_ctx.__('Edit the question')
        : __VLS_ctx.__('Add a new question')),
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
// @ts-ignore
[quizDetails, __, __, __, showQuestionModal, currentQuestion, currentQuestion,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        quizID: {
            type: String,
            required: true,
        },
    },
});
export default {};
