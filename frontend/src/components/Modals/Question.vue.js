/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, FormControl, TextEditor, createResource, Switch, Button, toast, } from 'frappe-ui';
import { watch, reactive, ref, inject } from 'vue';
import Link from '@/components/Controls/Link.vue';
import { useOnboarding } from 'frappe-ui/frappe';
const show = defineModel();
const quiz = defineModel('quiz');
const chooseFromExisting = ref(false);
const editMode = ref(false);
const user = inject('$user');
const { updateOnboardingStep } = useOnboarding('learning');
const existingQuestion = reactive({
    question: '',
    marks: 1,
});
const question = reactive({
    question: '',
    type: 'Choices',
    marks: 1,
});
const populateFields = () => {
    let fields = ['option', 'is_correct', 'explanation', 'possibility'];
    let counter = 1;
    fields.forEach((field) => {
        while (counter <= 4) {
            question[`${field}_${counter}`] = field === 'is_correct' ? false : null;
            counter++;
        }
    });
};
populateFields();
const props = defineProps({
    title: {
        type: String,
        default: __('Add a new question'),
    },
    questionDetail: {
        type: [Object, null],
        required: true,
    },
});
const questionData = createResource({
    url: 'frappe.client.get',
    makeParams() {
        return {
            doctype: 'LMS Question',
            name: props.questionDetail.question,
        };
    },
    auto: false,
    onSuccess(data) {
        let counter = 1;
        editMode.value = true;
        Object.keys(data).forEach((key) => {
            if (Object.hasOwn(question, key))
                question[key] = data[key];
        });
        while (counter <= 4) {
            question[`is_correct_${counter}`] = data[`is_correct_${counter}`]
                ? true
                : false;
            counter++;
        }
        question.marks = props.questionDetail.marks;
    },
});
watch(show, () => {
    if (show.value) {
        editMode.value = false;
        if (props.questionDetail.question)
            questionData.fetch();
        else {
            question.question = '';
            question.marks = 1;
            question.type = 'Choices';
            existingQuestion.question = '';
            existingQuestion.marks = 1;
            chooseFromExisting.value = false;
            populateFields();
        }
        if (props.questionDetail.marks)
            question.marks = props.questionDetail.marks;
    }
});
const questionRow = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'LMS Quiz Question',
                parent: quiz.value.doc.name,
                parentfield: 'questions',
                parenttype: 'LMS Quiz',
                ...values,
            },
        };
    },
});
const questionCreation = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'LMS Question',
                ...question,
            },
        };
    },
});
const submitQuestion = () => {
    if (props.questionDetail?.question)
        updateQuestion();
    else
        addQuestion();
};
const addQuestion = () => {
    if (chooseFromExisting.value) {
        addQuestionRow({
            question: existingQuestion.question,
            marks: existingQuestion.marks,
        });
    }
    else {
        questionCreation.submit({}, {
            onSuccess(data) {
                addQuestionRow({
                    question: data.name,
                    marks: question.marks,
                });
            },
            onError(err) {
                toast.error(err.messages?.[0] || err);
            },
        });
    }
};
const addQuestionRow = (question) => {
    questionRow.submit({
        ...question,
    }, {
        onSuccess() {
            if (user.data?.is_system_manager)
                updateOnboardingStep('create_first_quiz');
            show.value = false;
            toast.success(__('Question added successfully'));
            quiz.value.reload();
            show.value = false;
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
            show.value = false;
        },
    });
};
const questionUpdate = createResource({
    url: 'frappe.client.set_value',
    auto: false,
    makeParams(values) {
        return {
            doctype: 'LMS Question',
            name: questionData.data?.name,
            fieldname: {
                ...question,
            },
        };
    },
});
const marksUpdate = createResource({
    url: 'frappe.client.set_value',
    auto: false,
    makeParams(values) {
        return {
            doctype: 'LMS Quiz Question',
            name: props.questionDetail.name,
            fieldname: {
                marks: question.marks,
            },
        };
    },
});
const updateQuestion = () => {
    questionUpdate.submit({}, {
        onSuccess() {
            marksUpdate.submit({}, {
                onSuccess() {
                    show.value = false;
                    toast.success(__('Question updated successfully'));
                    quiz.value.reload();
                },
            });
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
let __VLS_modelEmit;
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
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '5xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '5xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { body: __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-5 space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9 mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    (__VLS_ctx.__(props.title));
    if (!__VLS_ctx.editMode) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center text-xs text-ink-gray-7 space-x-5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-5']} */ ;
        let __VLS_8;
        /** @ts-ignore @type { | typeof __VLS_components.Switch} */
        Switch;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            size: "sm",
            label: (__VLS_ctx.__('Choose an existing question')),
            modelValue: (__VLS_ctx.chooseFromExisting),
            ...{ class: "!p-0" },
        }));
        const __VLS_10 = __VLS_9({
            size: "sm",
            label: (__VLS_ctx.__('Choose an existing question')),
            modelValue: (__VLS_ctx.chooseFromExisting),
            ...{ class: "!p-0" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        /** @type {__VLS_StyleScopedClasses['!p-0']} */ ;
    }
    if (!__VLS_ctx.chooseFromExisting || __VLS_ctx.editMode) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-xs text-ink-gray-5 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (__VLS_ctx.__('Question'));
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
        TextEditor;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            ...{ 'onChange': {} },
            content: (__VLS_ctx.question.question),
            editable: (true),
            fixedMenu: (true),
            editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
        }));
        const __VLS_15 = __VLS_14({
            ...{ 'onChange': {} },
            content: (__VLS_ctx.question.question),
            editable: (true),
            fixedMenu: (true),
            editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_18;
        const __VLS_19 = ({ change: {} },
            { onChange: ((val) => (__VLS_ctx.question.question = val)) });
        var __VLS_16;
        var __VLS_17;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-8 mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        let __VLS_20;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            modelValue: (__VLS_ctx.question.marks),
            label: (__VLS_ctx.__('Marks')),
            type: "number",
        }));
        const __VLS_22 = __VLS_21({
            modelValue: (__VLS_ctx.question.marks),
            label: (__VLS_ctx.__('Marks')),
            type: "number",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_25;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
            label: (__VLS_ctx.__('Type')),
            modelValue: (__VLS_ctx.question.type),
            type: "select",
            options: (['Choices', 'User Input', 'Open Ended']),
            ...{ class: "pb-2" },
            required: (true),
        }));
        const __VLS_27 = __VLS_26({
            label: (__VLS_ctx.__('Type')),
            modelValue: (__VLS_ctx.question.type),
            type: "select",
            options: (['Choices', 'User Input', 'Open Ended']),
            ...{ class: "pb-2" },
            required: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
        if (__VLS_ctx.question.type == 'Choices') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-base font-semibold text-ink-gray-9 mb-5 mt-10" },
            });
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
            (__VLS_ctx.__('Options'));
        }
        else if (__VLS_ctx.question.type == 'User Input') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-base font-semibold text-ink-gray-9 mb-5 mt-5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
            (__VLS_ctx.__('Possibilities'));
        }
        if (__VLS_ctx.question.type == 'Choices') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-2 gap-x-8 gap-y-4" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-x-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-y-4']} */ ;
            for (const [n] of __VLS_vFor((4))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "space-y-4 py-2" },
                });
                /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                let __VLS_30;
                /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
                FormControl;
                // @ts-ignore
                const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
                    label: (__VLS_ctx.__('Option') + ' ' + n),
                    modelValue: (__VLS_ctx.question[`option_${n}`]),
                    required: (n <= 2 ? true : false),
                }));
                const __VLS_32 = __VLS_31({
                    label: (__VLS_ctx.__('Option') + ' ' + n),
                    modelValue: (__VLS_ctx.question[`option_${n}`]),
                    required: (n <= 2 ? true : false),
                }, ...__VLS_functionalComponentArgsRest(__VLS_31));
                let __VLS_35;
                /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
                FormControl;
                // @ts-ignore
                const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
                    label: (__VLS_ctx.__('Explanation')),
                    modelValue: (__VLS_ctx.question[`explanation_${n}`]),
                }));
                const __VLS_37 = __VLS_36({
                    label: (__VLS_ctx.__('Explanation')),
                    modelValue: (__VLS_ctx.question[`explanation_${n}`]),
                }, ...__VLS_functionalComponentArgsRest(__VLS_36));
                let __VLS_40;
                /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
                FormControl;
                // @ts-ignore
                const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                    label: (__VLS_ctx.__('Correct Answer')),
                    modelValue: (__VLS_ctx.question[`is_correct_${n}`]),
                    type: "checkbox",
                }));
                const __VLS_42 = __VLS_41({
                    label: (__VLS_ctx.__('Correct Answer')),
                    modelValue: (__VLS_ctx.question[`is_correct_${n}`]),
                    type: "checkbox",
                }, ...__VLS_functionalComponentArgsRest(__VLS_41));
                // @ts-ignore
                [show, __, __, __, __, __, __, __, __, __, __, editMode, editMode, chooseFromExisting, chooseFromExisting, question, question, question, question, question, question, question, question, question, question,];
            }
        }
        else if (__VLS_ctx.question.type == 'User Input') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-2 gap-x-8 gap-y-4 py-2" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-x-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-y-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            for (const [n] of __VLS_vFor((4))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                let __VLS_45;
                /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
                FormControl;
                // @ts-ignore
                const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
                    label: (__VLS_ctx.__('Possibility') + ' ' + n),
                    modelValue: (__VLS_ctx.question[`possibility_${n}`]),
                    required: (n == 1 ? true : false),
                }));
                const __VLS_47 = __VLS_46({
                    label: (__VLS_ctx.__('Possibility') + ' ' + n),
                    modelValue: (__VLS_ctx.question[`possibility_${n}`]),
                    required: (n == 1 ? true : false),
                }, ...__VLS_functionalComponentArgsRest(__VLS_46));
                // @ts-ignore
                [__, question, question,];
            }
        }
    }
    else if (__VLS_ctx.chooseFromExisting) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_50 = Link;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
            modelValue: (__VLS_ctx.existingQuestion.question),
            label: (__VLS_ctx.__('Select a question')),
            doctype: "LMS Question",
        }));
        const __VLS_52 = __VLS_51({
            modelValue: (__VLS_ctx.existingQuestion.question),
            label: (__VLS_ctx.__('Select a question')),
            doctype: "LMS Question",
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        let __VLS_55;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
            modelValue: (__VLS_ctx.existingQuestion.marks),
            label: (__VLS_ctx.__('Marks')),
            type: "number",
        }));
        const __VLS_57 = __VLS_56({
            modelValue: (__VLS_ctx.existingQuestion.marks),
            label: (__VLS_ctx.__('Marks')),
            type: "number",
        }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-end space-x-2 mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    let __VLS_60;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_65;
    const __VLS_66 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.submitQuestion();
                // @ts-ignore
                [__, __, chooseFromExisting, existingQuestion, existingQuestion, submitQuestion,];
            } });
    const { default: __VLS_67 } = __VLS_63.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_63;
    var __VLS_64;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        ...{},
        ...{
            title: {
                type: String,
                default: __('Add a new question'),
            },
            questionDetail: {
                type: [Object, null],
                required: true,
            },
        },
    },
});
export default {};
