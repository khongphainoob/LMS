/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, Dialog, FormControl, TextEditor, toast } from 'frappe-ui';
import { computed, reactive, watch } from 'vue';
import { escapeHTML, sanitizeHTML } from '@/utils';
import { Link } from 'frappe-ui/frappe';
const show = defineModel();
const assignments = defineModel('assignments');
const assignment = reactive({
    title: '',
    type: '',
    question: '',
    course: '',
});
const props = defineProps({
    assignmentID: {
        type: String,
        default: 'new',
    },
});
watch(() => props.assignmentID, (val) => {
    if (val !== 'new') {
        assignments.value?.data.forEach((row) => {
            if (row.name === val) {
                assignment.title = row.title;
                assignment.type = row.type;
                assignment.question = row.question;
                assignment.course = row.course || '';
            }
        });
    }
}, { flush: 'post' });
watch(show, (newVal) => {
    if (newVal && props.assignmentID === 'new') {
        assignment.title = '';
        assignment.type = '';
        assignment.question = '';
    }
});
const validateFields = () => {
    assignment.title = escapeHTML(assignment.title.trim());
    assignment.question = sanitizeHTML(assignment.question);
};
const saveAssignment = () => {
    validateFields();
    if (props.assignmentID == 'new') {
        createAssignment();
    }
    else {
        updateAssignment();
    }
};
const createAssignment = () => {
    assignments.value.insert.submit({
        ...assignment,
    }, {
        onSuccess() {
            show.value = false;
            toast.success(__('Assignment created successfully'));
        },
    });
};
const updateAssignment = () => {
    assignments.value.setValue.submit({
        ...assignment,
        name: props.assignmentID,
    }, {
        onSuccess() {
            show.value = false;
            toast.success(__('Assignment updated successfully'));
        },
    });
};
const assignmentOptions = computed(() => {
    return [
        { label: __('PDF'), value: 'PDF' },
        { label: __('Image'), value: 'Image' },
        { label: __('Document'), value: 'Document' },
        { label: __('Text'), value: 'Text' },
        { label: __('URL'), value: 'URL' },
    ];
});
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
        size: 'lg',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: 'lg',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { body: __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-5 text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg text-ink-gray-9 font-semibold mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    (__VLS_ctx.assignmentID === 'new'
        ? __VLS_ctx.__('Create an Assignment')
        : __VLS_ctx.__('Edit Assignment'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 max-h-[75vh] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[75vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.assignment.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.assignment.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        modelValue: (__VLS_ctx.assignment.type),
        type: "select",
        options: (__VLS_ctx.assignmentOptions),
        label: (__VLS_ctx.__('Submission Type')),
        required: (true),
    }));
    const __VLS_15 = __VLS_14({
        modelValue: (__VLS_ctx.assignment.type),
        type: "select",
        options: (__VLS_ctx.assignmentOptions),
        label: (__VLS_ctx.__('Submission Type')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.Link} */
    Link;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        modelValue: (__VLS_ctx.assignment.course),
        label: (__VLS_ctx.__('Course')),
        doctype: "LMS Course",
        placeholder: " ",
    }));
    const __VLS_20 = __VLS_19({
        modelValue: (__VLS_ctx.assignment.course),
        label: (__VLS_ctx.__('Course')),
        doctype: "LMS Course",
        placeholder: " ",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5 mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    (__VLS_ctx.__('Question'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.assignment.question),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] max-h-[18rem] overflow-y-auto",
    }));
    const __VLS_25 = __VLS_24({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.assignment.question),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem] max-h-[18rem] overflow-y-auto",
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_28;
    const __VLS_29 = ({ change: {} },
        { onChange: ((val) => (__VLS_ctx.assignment.question = val)) });
    var __VLS_26;
    var __VLS_27;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end space-x-2 mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        to: ({
            name: 'AssignmentSubmissionList',
            query: {
                assignmentID: __VLS_ctx.assignmentID,
            },
        }),
    }));
    const __VLS_32 = __VLS_31({
        to: ({
            name: 'AssignmentSubmissionList',
            query: {
                assignmentID: __VLS_ctx.assignmentID,
            },
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    const { default: __VLS_35 } = __VLS_33.slots;
    if (__VLS_ctx.assignmentID !== 'new') {
        let __VLS_36;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
            variant: "subtle",
        }));
        const __VLS_38 = __VLS_37({
            variant: "subtle",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        const { default: __VLS_41 } = __VLS_39.slots;
        (__VLS_ctx.__('Check Submissions'));
        // @ts-ignore
        [show, assignmentID, assignmentID, assignmentID, __, __, __, __, __, __, __, assignment, assignment, assignment, assignment, assignment, assignmentOptions,];
        var __VLS_39;
    }
    // @ts-ignore
    [];
    var __VLS_33;
    let __VLS_42;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_44 = __VLS_43({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_47;
    const __VLS_48 = ({ click: {} },
        { onClick: (__VLS_ctx.saveAssignment) });
    const { default: __VLS_49 } = __VLS_45.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__, saveAssignment,];
    var __VLS_45;
    var __VLS_46;
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
            assignmentID: {
                type: String,
                default: 'new',
            },
        },
    },
});
export default {};
