/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Breadcrumbs, Button, call, createDocumentResource, toast, usePageMeta, } from 'frappe-ui';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { Play, Settings } from 'lucide-vue-next';
import { sessionStore } from '@/stores/session';
import { useRouter } from 'vue-router';
import { openSettings } from '@/utils';
import { useSettings } from '@/stores/settings';
import { getLmsRoute } from '@/utils/basePath';
const user = inject('$user');
const code = ref('');
const output = ref(null);
const error = ref(null);
const errorMessage = ref(null);
const testCaseSection = ref(null);
const testCases = ref([]);
const boilerplate = ref('');
const { brand } = sessionStore();
const { settings } = useSettings();
const router = useRouter();
const fromLesson = ref(false);
const falconURL = ref('https://falcon.frappe.io/');
const falconError = ref(null);
const props = withDefaults(defineProps(), {
    submissionID: 'new',
});
onMounted(() => {
    loadFalcon();
    checkIfUserIsPermitted();
    checkIfInLesson();
    fetchSubmission();
});
const checkIfInLesson = () => {
    if (new URLSearchParams(window.location.search).get('fromLesson')) {
        fromLesson.value = true;
    }
};
const fetchSubmission = (name = '') => {
    if (name) {
        submission.name = name;
        submission.reload();
    }
    else if (props.submissionID != 'new') {
        submission.reload();
    }
};
const exercise = createDocumentResource({
    doctype: 'LMS Programming Exercise',
    name: props.exerciseID,
    cache: ['programmingExercise', props.exerciseID],
    auto: true,
});
const submission = createDocumentResource({
    doctype: 'LMS Programming Exercise Submission',
    name: props.submissionID,
    auto: false,
    onError(error) {
        if (error.messages?.[0].includes('not found')) {
            router.push({
                name: 'ProgrammingExerciseSubmission',
                params: { exerciseID: props.exerciseID, submissionID: 'new' },
            });
        }
        else {
            toast.error(__(error.messages?.[0] || error));
        }
    },
});
watch(exercise, () => {
    updateCode();
});
const updateCode = (submissionCode = '') => {
    updateBoilerPlate();
    if (!code.value?.includes(boilerplate.value)) {
        code.value = `${boilerplate.value}${code.value}`;
    }
    if (submissionCode && !code.value?.includes(submissionCode)) {
        code.value = `${code.value}${submissionCode}`;
    }
    else if (!submissionCode && !code.value) {
        code.value = boilerplate.value;
    }
};
const updateBoilerPlate = () => {
    if (exercise.doc?.language == 'Python') {
        boilerplate.value = `with open("stdin", "r") as f:\n    data = f.read()\n\ninputs = data.split() if len(data) else []\n\n# inputs is a list of strings\n# write your code below\n\n`;
    }
    else if (exercise.doc?.language == 'JavaScript') {
        boilerplate.value = `const fs = require('fs');\n\nlet input = fs.readFileSync('/app/stdin', 'utf8').trim();\nconst inputs = input.split("\\n");\n// inputs is an array of strings\n// write your code below\n`;
    }
};
const checkIfUserIsPermitted = (doc = null) => {
    if (!user.data) {
        const redirectPath = getLmsRoute(`programming-exercises/${props.exerciseID}/submission/${props.submissionID}`);
        window.location.href = `/login?redirect-to=${redirectPath}`;
    }
    if (!doc)
        return;
    if (doc.owner != user.data?.name &&
        !user.data?.is_instructor &&
        !user.data?.is_moderator &&
        !user.data.is_evaluator) {
        router.push({
            name: 'Courses',
        });
        return;
    }
};
const updateTestCases = (doc) => {
    if (testCases.value.length === 0) {
        testCases.value = doc.test_cases || [];
    }
};
watch(() => submission.doc, (doc) => {
    if (doc) {
        checkIfUserIsPermitted(doc);
        updateTestCases(doc);
        updateCode(doc.code);
    }
}, { immediate: true });
const loadFalcon = () => {
    if (settings.data) {
        falconURL.value = settings.data.livecode_url;
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${falconURL.value}static/livecode.js`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};
const submitCode = async () => {
    await runCode();
    createSubmission();
};
const runCode = async () => {
    if (!exercise.doc?.test_cases?.length)
        return;
    testCases.value = [];
    if (testCaseSection.value) {
        testCaseSection.value.scrollIntoView({ behavior: 'smooth' });
    }
    for (const test_case of exercise.doc.test_cases) {
        let result = await execute(test_case.input);
        if (error.value) {
            errorMessage.value = result;
            break;
        }
        else {
            output.value = result;
        }
        let status = result.trim() === test_case.expected_output.trim() ? 'Passed' : 'Failed';
        testCases.value.push({
            input: test_case.input,
            output: result,
            expected_output: test_case.expected_output,
            status: status,
        });
    }
};
const createSubmission = () => {
    if (!testCases.value.length)
        return;
    let codeToSave = code.value?.replace(boilerplate.value, '') || '';
    call('lms.lms.api.create_programming_exercise_submission', {
        exercise: props.exerciseID,
        submission: props.submissionID,
        code: codeToSave,
        test_cases: testCases.value,
    })
        .then((data) => {
        if (props.submissionID == 'new') {
            router.push({
                name: 'ProgrammingExerciseSubmission',
                params: { exerciseID: props.exerciseID, submissionID: data },
            });
            fetchSubmission(data);
        }
        else {
            fetchSubmission(props.submissionID);
        }
        toast.success(__('Submission saved!'));
    })
        .catch((error) => {
        console.error('Error creating submission:', error);
        toast.error(__('Failed to submit. Please try again. {0}').format({ error }));
    });
};
const execute = (stdin = '') => {
    return new Promise((resolve, reject) => {
        let outputChunks = [];
        let hasExited = false;
        let hasError = false;
        let session = new LiveCodeSession({
            base_url: falconURL.value,
            runtime: exercise.doc?.language.toLowerCase() || 'python',
            code: code.value,
            files: [{ filename: 'stdin', contents: stdin }],
            onMessage: (msg) => {
                console.log('msg', msg);
                if (msg.msgtype === 'write' && msg.file === 'stdout') {
                    outputChunks.push(msg.data);
                }
                if (msg.msgtype === 'write' && msg.file === 'stderr') {
                    hasError = true;
                    errorMessage.value = msg.data;
                }
                if (msg.msgtype === 'exitstatus') {
                    hasExited = true;
                    if (msg.exitstatus !== 0) {
                        error.value = true;
                    }
                    else {
                        error.value = false;
                    }
                    resolve(outputChunks.join('').trim());
                }
            },
        });
        setTimeout(() => {
            if (!hasExited) {
                error.value = true;
                errorMessage.value = 'Execution timed out.';
                reject('Execution timed out.');
            }
        }, 20000);
    });
};
const breadcrumbs = computed(() => {
    return [
        {
            label: __('Programming Exercise Submissions'),
            route: { name: 'ProgrammingExerciseSubmissions' },
        },
        { label: exercise.doc?.title },
    ];
});
usePageMeta(() => {
    return {
        title: __('Programming Exercise Submission'),
        icon: brand.favicon,
    };
});
const __VLS_defaults = {
    submissionID: 'new',
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
if (!__VLS_ctx.fromLesson) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5" },
    });
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
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
}
if (__VLS_ctx.falconError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between p-3 text-sm bg-surface-amber-1 text-ink-amber-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-amber-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-amber-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.falconError);
    if (__VLS_ctx.user.data?.is_moderator) {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            ...{ 'onClick': {} },
        }));
        const __VLS_7 = __VLS_6({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        let __VLS_10;
        const __VLS_11 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.falconError))
                        return;
                    if (!(__VLS_ctx.user.data?.is_moderator))
                        return;
                    __VLS_ctx.openSettings('General');
                    // @ts-ignore
                    [fromLesson, breadcrumbs, falconError, falconError, user, openSettings,];
                } });
        const { default: __VLS_12 } = __VLS_8.slots;
        {
            const { prefix: __VLS_13 } = __VLS_8.slots;
            let __VLS_14;
            /** @ts-ignore @type { | typeof __VLS_components.Settings} */
            Settings;
            // @ts-ignore
            const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_16 = __VLS_15({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Settings'));
        // @ts-ignore
        [__,];
        var __VLS_8;
        var __VLS_9;
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-2 h-[calc(100vh_-_3rem)]" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[calc(100vh_-_3rem)]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border-r py-5 px-8 h-full" },
});
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "font-semibold mb-2 text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Problem Statement'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.exercise.doc?.problem_statement) }, null, null);
/** @type {__VLS_StyleScopedClasses['ProseMirror']} */ ;
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-table:table-fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-td:p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-td:border']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:border']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-td:border-outline-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:border-outline-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-td:relative']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:relative']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-th:bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
/** @type {__VLS_StyleScopedClasses['!whitespace-normal']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between p-2 bg-surface-gray-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.exercise.doc?.language);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
if (__VLS_ctx.submission.doc?.status) {
    let __VLS_19;
    /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
    Badge;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        theme: (__VLS_ctx.submission.doc.status == 'Passed' ? 'green' : 'red'),
    }));
    const __VLS_21 = __VLS_20({
        theme: (__VLS_ctx.submission.doc.status == 'Passed' ? 'green' : 'red'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const { default: __VLS_24 } = __VLS_22.slots;
    (__VLS_ctx.submission.doc.status);
    // @ts-ignore
    [__, exercise, exercise, submission, submission, submission,];
    var __VLS_22;
}
if (!__VLS_ctx.falconError &&
    (__VLS_ctx.submissionID == 'new' ||
        __VLS_ctx.user.data?.name == __VLS_ctx.submission.doc?.owner)) {
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_27 = __VLS_26({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_30;
    const __VLS_31 = ({ click: {} },
        { onClick: (__VLS_ctx.submitCode) });
    const { default: __VLS_32 } = __VLS_28.slots;
    {
        const { prefix: __VLS_33 } = __VLS_28.slots;
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.Play} */
        Play;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            ...{ class: "size-3" },
        }));
        const __VLS_36 = __VLS_35({
            ...{ class: "size-3" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
        // @ts-ignore
        [falconError, user, submission, submissionID, submitCode,];
    }
    (__VLS_ctx.__('Run'));
    // @ts-ignore
    [__,];
    var __VLS_28;
    var __VLS_29;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col space-y-4 pt-5 border-b" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
let __VLS_39;
/** @ts-ignore @type { | typeof __VLS_components.Code} */
Code;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    modelValue: (__VLS_ctx.code),
    language: (__VLS_ctx.exercise.doc?.language.toLowerCase()),
    height: "400px",
    maxHeight: "1000px",
}));
const __VLS_41 = __VLS_40({
    modelValue: (__VLS_ctx.code),
    language: (__VLS_ctx.exercise.doc?.language.toLowerCase()),
    height: "400px",
    maxHeight: "1000px",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col space-y-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-ink-gray-5 px-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    (__VLS_ctx.__('Compiler Message'));
}
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
        value: (__VLS_ctx.errorMessage),
        ...{ class: "font-mono text-ink-red-3 bg-surface-gray-1 border-none text-sm h-32 leading-6" },
        readonly: true,
    });
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "testCaseSection",
    ...{ class: "p-5" },
});
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-lg font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Test Cases'));
if (__VLS_ctx.testCases.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "divide-y mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    for (const [testCase, index] of __VLS_vFor((__VLS_ctx.testCases))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (testCase.input),
            ...{ class: "py-3" },
        });
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.__('Test {0}').format(index + 1));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-semibold ml-2 mr-1" },
            ...{ class: (testCase.status === 'Passed'
                    ? 'text-ink-green-3'
                    : 'text-ink-red-3') },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
        (testCase.status);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between w-[60%]" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-[60%]']} */ ;
        if (testCase.input) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-xs text-ink-gray-7" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            (__VLS_ctx.__('Input'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-ink-gray-9" },
            });
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            (testCase.input);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.__('Your Output'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (testCase.output);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.__('Expected Output'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (testCase.expected_output);
        // @ts-ignore
        [__, __, __, __, __, __, exercise, code, error, error, errorMessage, testCases, testCases,];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-6 mt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    (__VLS_ctx.__('Please run the code to execute the test cases.'));
}
// @ts-ignore
[__,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
    props: {},
});
export default {};
