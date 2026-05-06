/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref, watch } from 'vue';
import { escapeHTML } from '@/utils';
import { Badge, Button, createListResource, Dialog, FormControl, TextEditor, toast, } from 'frappe-ui';
import { ClipboardList, Play, Trash2 } from 'lucide-vue-next';
import ChildTable from '@/components/Controls/ChildTable.vue';
const show = defineModel();
const exercises = defineModel('exercises');
const isDirty = ref(false);
const originalTestCaseCount = ref(0);
const exercise = ref({
    title: '',
    language: 'Python',
    problem_statement: '',
    test_cases: [],
});
const languageOptions = [
    { label: __('Python'), value: 'Python' },
    { label: __('JavaScript'), value: 'JavaScript' },
];
const props = withDefaults(defineProps(), {
    exerciseID: 'new',
});
watch(() => props.exerciseID, () => {
    setExerciseData();
    fetchTestCases();
});
const setExerciseData = () => {
    let isNew = true;
    exercises.value?.data.forEach((ex) => {
        if (ex.name === props.exerciseID) {
            isNew = false;
            exercise.value = { ...ex };
        }
    });
    if (isNew) {
        exercise.value = {
            title: '',
            language: 'Python',
            problem_statement: '',
            test_cases: [],
        };
    }
    isDirty.value = false;
};
const testCases = createListResource({
    doctype: 'LMS Test Case',
    fields: ['input', 'expected_output', 'name'],
    cache: ['testCases', props.exerciseID],
    parent: 'LMS Programming Exercise',
    orderBy: 'idx',
    onSuccess(data) {
        isDirty.value = false;
        originalTestCaseCount.value = data.length;
    },
    onError(err) {
        toast.error(__(err.messages?.[0] || err));
        console.error('Error loading testCases:', err);
    },
});
const fetchTestCases = () => {
    testCases.update({
        filters: {
            parent: props.exerciseID,
            parenttype: 'LMS Programming Exercise',
            parentfield: 'test_cases',
        },
    });
    testCases.reload();
    originalTestCaseCount.value = testCases.data.length;
};
const validateTitle = () => {
    exercise.value.title = escapeHTML(exercise.value.title.trim());
};
watch(exercise, () => {
    isDirty.value = true;
}, { deep: true });
watch(testCases, () => {
    if (testCases.data.length !== originalTestCaseCount.value) {
        isDirty.value = true;
    }
});
const updateTestCasesInExercise = () => {
    exercise.value.test_cases = testCases.data.map((tc, index) => ({
        input: tc.input,
        expected_output: tc.expected_output,
        idx: index + 1,
    }));
};
const saveExercise = (close) => {
    validateTitle();
    updateTestCasesInExercise();
    if (props.exerciseID == 'new')
        createNewExercise(close);
    else
        updateExercise(close);
};
const createNewExercise = (close) => {
    exercises.value?.insert.submit({
        ...exercise.value,
    }, {
        onSuccess() {
            close();
            isDirty.value = false;
            exercises.value?.reload();
            toast.success(__('Programming Exercise created successfully'));
        },
        onError(err) {
            toast.warning(__(err.messages?.[0] || err));
        },
    });
};
const updateExercise = (close) => {
    exercises.value?.setValue.submit({
        name: props.exerciseID,
        ...exercise.value,
    }, {
        onSuccess() {
            close();
            isDirty.value = false;
            exercises.value?.reload();
            toast.success(__('Programming Exercise updated successfully'));
        },
        onError(err) {
            toast.warning(__(err.messages?.[0] || err));
        },
    });
};
const testCaseColumns = computed(() => {
    return ['Input', 'Expected Output'];
});
const deleteExercise = (close) => {
    if (props.exerciseID == 'new')
        return;
    exercises.value?.delete.submit(props.exerciseID, {
        onSuccess() {
            toast.success(__('Programming Exercise deleted successfully'));
            close();
        },
        onError(err) {
            toast.warning(__(err.messages?.[0] || err));
        },
    });
};
let __VLS_modelEmit;
const __VLS_defaults = {
    exerciseID: 'new',
};
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
    options: ({ size: '4xl' }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({ size: '4xl' }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-title': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xl font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (props.exerciseID === 'new'
        ? __VLS_ctx.__('Create Programming Exercise')
        : __VLS_ctx.__('Edit Programming Exercise'));
    if (__VLS_ctx.isDirty) {
        let __VLS_8;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            theme: "orange",
        }));
        const __VLS_10 = __VLS_9({
            theme: "orange",
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        const { default: __VLS_13 } = __VLS_11.slots;
        (__VLS_ctx.__('Not Saved'));
        // @ts-ignore
        [show, __, __, __, isDirty,];
        var __VLS_11;
    }
    // @ts-ignore
    [];
}
{
    const { 'body-content': __VLS_14 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-10" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_15;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        modelValue: (__VLS_ctx.exercise.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }));
    const __VLS_17 = __VLS_16({
        modelValue: (__VLS_ctx.exercise.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        modelValue: (__VLS_ctx.exercise.language),
        label: (__VLS_ctx.__('Language')),
        type: "select",
        options: (__VLS_ctx.languageOptions),
        required: (true),
    }));
    const __VLS_22 = __VLS_21({
        modelValue: (__VLS_ctx.exercise.language),
        label: (__VLS_ctx.__('Language')),
        type: "select",
        options: (__VLS_ctx.languageOptions),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_25 = ChildTable;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        modelValue: (__VLS_ctx.testCases.data),
        label: (__VLS_ctx.__('Test Cases')),
        columns: (__VLS_ctx.testCaseColumns),
        required: (true),
        addable: (true),
        deletable: (true),
        editable: (true),
        placeholder: (__VLS_ctx.__('Add Test Case')),
    }));
    const __VLS_27 = __VLS_26({
        modelValue: (__VLS_ctx.testCases.data),
        label: (__VLS_ctx.__('Test Cases')),
        columns: (__VLS_ctx.testCaseColumns),
        required: (true),
        addable: (true),
        deletable: (true),
        editable: (true),
        placeholder: (__VLS_ctx.__('Add Test Case')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5 mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    (__VLS_ctx.__('Problem Statement'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.exercise.problem_statement),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] max-h-[21rem] overflow-y-auto",
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.exercise.problem_statement),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] max-h-[21rem] overflow-y-auto",
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ change: {} },
        { onChange: ((val) => (__VLS_ctx.exercise.problem_statement = val)) });
    var __VLS_33;
    var __VLS_34;
    // @ts-ignore
    [__, __, __, __, __, exercise, exercise, exercise, exercise, languageOptions, testCases, testCaseColumns,];
}
{
    const { actions: __VLS_37 } = __VLS_3.slots;
    const [{ close }] = __VLS_vSlot(__VLS_37);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end space-x-2 group" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    if (__VLS_ctx.exerciseID != 'new') {
        let __VLS_38;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
            ...{ 'onClick': {} },
            variant: "outline",
            theme: "red",
        }));
        const __VLS_40 = __VLS_39({
            ...{ 'onClick': {} },
            variant: "outline",
            theme: "red",
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        let __VLS_43;
        const __VLS_44 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.exerciseID != 'new'))
                        return;
                    __VLS_ctx.deleteExercise(close);
                    // @ts-ignore
                    [exerciseID, deleteExercise,];
                } });
        const { default: __VLS_45 } = __VLS_41.slots;
        {
            const { prefix: __VLS_46 } = __VLS_41.slots;
            let __VLS_47;
            /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
            Trash2;
            // @ts-ignore
            const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_49 = __VLS_48({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_48));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Delete'));
        // @ts-ignore
        [__,];
        var __VLS_41;
        var __VLS_42;
    }
    let __VLS_52;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        to: ({
            name: 'ProgrammingExerciseSubmission',
            params: {
                exerciseID: props.exerciseID,
                submissionID: 'new',
            },
        }),
    }));
    const __VLS_54 = __VLS_53({
        to: ({
            name: 'ProgrammingExerciseSubmission',
            params: {
                exerciseID: props.exerciseID,
                submissionID: 'new',
            },
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const { default: __VLS_57 } = __VLS_55.slots;
    let __VLS_58;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({}));
    const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const { default: __VLS_63 } = __VLS_61.slots;
    {
        const { prefix: __VLS_64 } = __VLS_61.slots;
        let __VLS_65;
        /** @ts-ignore @type { | typeof __VLS_components.Play} */
        Play;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
            ...{ class: "size-4 stroke-1.5" },
        }));
        const __VLS_67 = __VLS_66({
            ...{ class: "size-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Test this Exercise'));
    // @ts-ignore
    [__,];
    var __VLS_61;
    // @ts-ignore
    [];
    var __VLS_55;
    let __VLS_70;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
        to: ({
            name: 'ProgrammingExerciseSubmissions',
            query: {
                exercise: props.exerciseID,
            },
        }),
    }));
    const __VLS_72 = __VLS_71({
        to: ({
            name: 'ProgrammingExerciseSubmissions',
            query: {
                exercise: props.exerciseID,
            },
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const { default: __VLS_75 } = __VLS_73.slots;
    let __VLS_76;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({}));
    const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
    const { default: __VLS_81 } = __VLS_79.slots;
    {
        const { prefix: __VLS_82 } = __VLS_79.slots;
        let __VLS_83;
        /** @ts-ignore @type { | typeof __VLS_components.ClipboardList} */
        ClipboardList;
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
            ...{ class: "size-4 stroke-1.5" },
        }));
        const __VLS_85 = __VLS_84({
            ...{ class: "size-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Check Submission'));
    // @ts-ignore
    [__,];
    var __VLS_79;
    // @ts-ignore
    [];
    var __VLS_73;
    let __VLS_88;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_93;
    const __VLS_94 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.saveExercise(close);
                // @ts-ignore
                [saveExercise,];
            } });
    const { default: __VLS_95 } = __VLS_91.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_91;
    var __VLS_92;
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
    __typeProps: {},
    props: {},
});
export default {};
