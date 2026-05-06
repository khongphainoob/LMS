/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Button, call, createResource, createDocumentResource, FileUploader, FormControl, TextEditor, toast, } from 'frappe-ui';
import { computed, inject, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { FileText, X } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
const answer = ref(null);
const comments = ref(null);
const router = useRouter();
const user = inject('$user');
const isDirty = ref(false);
const props = defineProps({
    assignmentID: {
        type: String,
        required: true,
    },
    submissionName: {
        type: String,
        default: 'new',
    },
    showTitle: {
        type: Boolean,
        default: true,
    },
});
onMounted(() => {
    window.addEventListener('keydown', keyboardShortcut);
});
const keyboardShortcut = (e) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        submitAssignment();
        e.preventDefault();
    }
};
onBeforeUnmount(() => {
    window.removeEventListener('keydown', keyboardShortcut);
});
const assignment = createResource({
    url: 'frappe.client.get',
    params: {
        doctype: 'LMS Assignment',
        name: props.assignmentID,
    },
    auto: true,
    onSuccess(data) {
        if (props.submissionName != 'new') {
            submissionResource.reload();
        }
    },
});
const newSubmission = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        let doc = {
            doctype: 'LMS Assignment Submission',
            assignment: props.assignmentID,
            member: user.data?.name,
        };
        if (!showUploader()) {
            doc.answer = answer.value;
        }
        return {
            doc: doc,
        };
    },
});
const submissionResource = createDocumentResource({
    doctype: 'LMS Assignment Submission',
    name: props.submissionName,
    onError(err) {
        toast.error(err.messages?.[0] || err);
    },
    auto: false,
    cache: [user.data?.name, props.assignmentID],
});
watch(submissionResource, () => {
    if (submissionResource.doc) {
        if (submissionResource.doc.answer) {
            answer.value = submissionResource.doc.answer;
        }
        if (submissionResource.doc.comments) {
            comments.value = submissionResource.doc.comments;
        }
        if (submissionResource.isDirty) {
            isDirty.value = true;
        }
        else if (showUploader() &&
            !submissionResource.doc.assignment_attachment) {
            isDirty.value = true;
        }
        else if (!showUploader() && !answer.value) {
            isDirty.value = true;
        }
        else {
            isDirty.value = false;
        }
    }
});
watch(() => submissionResource.doc, () => {
    if (props.submissionName == 'new' &&
        submissionResource.doc?.assignment_attachment) {
        isDirty.value = true;
    }
});
const submitAssignment = () => {
    if (props.submissionName != 'new') {
        let evaluator = submissionResource.doc && submissionResource.doc.owner != user.data?.name
            ? user.data?.name
            : null;
        submissionResource.setValue.submit({
            ...submissionResource.doc,
            evaluator: evaluator,
            comments: comments.value,
            answer: answer.value,
        }, {
            onSuccess(data) {
                isDirty.value = false;
                toast.success(__('Changes saved successfully'));
            },
        });
    }
    else {
        addNewSubmission();
    }
};
const addNewSubmission = () => {
    newSubmission.submit({}, {
        onSuccess(data) {
            toast.success(__('Assignment submitted successfully'));
            if (router.currentRoute.value.name == 'AssignmentSubmission') {
                router.push({
                    name: 'AssignmentSubmission',
                    params: {
                        assignmentID: props.assignmentID,
                        submissionName: data.name,
                    },
                    query: { fromLesson: router.currentRoute.value.query.fromLesson },
                });
            }
            else {
                markLessonProgress();
                router.go();
            }
            submissionResource.name = data.name;
            submissionResource.reload();
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const saveSubmission = (file) => {
    isDirty.value = true;
    submissionResource.doc.assignment_attachment = file.file_url;
};
const markLessonProgress = () => {
    if (router.currentRoute.value.name == 'Lesson') {
        let courseName = router.currentRoute.value.params.courseName;
        let chapterNumber = router.currentRoute.value.params.chapterNumber;
        let lessonNumber = router.currentRoute.value.params.lessonNumber;
        call('lms.lms.api.mark_lesson_progress', {
            course: courseName,
            chapter_number: chapterNumber,
            lesson_number: lessonNumber,
        });
    }
};
const getType = () => {
    const type = assignment.data?.type;
    if (type == 'Image') {
        return ['image/*'];
    }
    else if (type == 'Document') {
        return [
            '.doc',
            '.docx',
            '.xml',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
    }
    else if (type == 'PDF') {
        return ['.pdf'];
    }
};
const validateFile = (file) => {
    let type = assignment.data?.type;
    let extension = file.name.split('.').pop().toLowerCase();
    if (type == 'Image' && !['jpg', 'jpeg', 'png'].includes(extension)) {
        return 'Only image file is allowed.';
    }
    else if (type == 'Document' &&
        !['doc', 'docx', 'xml'].includes(extension)) {
        return 'Only document file is allowed.';
    }
    else if (type == 'PDF' && !['pdf'].includes(extension)) {
        return 'Only PDF file is allowed.';
    }
};
const removeSubmission = () => {
    isDirty.value = true;
    submissionResource.doc.assignment_attachment = '';
};
const canGradeSubmission = computed(() => {
    return ((user.data?.is_moderator ||
        user.data?.is_evaluator ||
        user.data?.is_instructor) &&
        props.submissionName != 'new' &&
        router.currentRoute.value.name == 'AssignmentSubmission');
});
const canModifyAssignment = computed(() => {
    return (!submissionResource.doc ||
        (submissionResource.doc?.owner == user.data?.name &&
            submissionResource.doc?.status == 'Not Graded'));
});
const submissionStatusOptions = computed(() => {
    return [
        { label: __('Not Graded'), value: 'Not Graded' },
        { label: __('Pass'), value: 'Pass' },
        { label: __('Fail'), value: 'Fail' },
    ];
});
const statusTheme = computed(() => {
    if (!submissionResource.doc) {
        return 'orange';
    }
    else if (submissionResource.doc.status == 'Pass') {
        return 'green';
    }
    else if (submissionResource.doc.status == 'Not Graded') {
        return 'blue';
    }
    else {
        return 'red';
    }
});
const showUploader = () => {
    return ['PDF', 'Image', 'Document'].includes(assignment.data?.type);
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
if (__VLS_ctx.assignment.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 h-full" },
        ...{ class: ({ 'border rounded-lg overflow-auto': !__VLS_ctx.showTitle }) },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border-r p-5 overflow-y-auto h-[calc(100vh-3.2rem)]" },
        ...{ class: ({ 'h-full': !__VLS_ctx.showTitle }) },
    });
    /** @type {__VLS_StyleScopedClasses['border-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[calc(100vh-3.2rem)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    if (__VLS_ctx.showTitle) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-lg font-semibold mb-5 text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        if (__VLS_ctx.submissionName === 'new') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            (__VLS_ctx.__('Submission by'));
            (__VLS_ctx.user.data?.full_name);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            (__VLS_ctx.__('Submission by'));
            (__VLS_ctx.submissionResource.doc?.member_name);
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-7 font-medium mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    (__VLS_ctx.__('Question'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.assignment.data.question) }, null, null);
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-5 space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Submission'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    if (__VLS_ctx.isDirty) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            theme: "orange",
        }));
        const __VLS_2 = __VLS_1({
            theme: "orange",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const { default: __VLS_5 } = __VLS_3.slots;
        (__VLS_ctx.__('Not Saved'));
        // @ts-ignore
        [assignment, assignment, showTitle, showTitle, showTitle, submissionName, __, __, __, __, __, user, submissionResource, isDirty,];
        var __VLS_3;
    }
    else if (__VLS_ctx.submissionResource.doc?.status) {
        let __VLS_6;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            theme: (__VLS_ctx.statusTheme),
            size: "lg",
        }));
        const __VLS_8 = __VLS_7({
            theme: (__VLS_ctx.statusTheme),
            size: "lg",
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        const { default: __VLS_11 } = __VLS_9.slots;
        (__VLS_ctx.submissionResource.doc?.status);
        // @ts-ignore
        [submissionResource, submissionResource, statusTheme,];
        var __VLS_9;
    }
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_17;
    const __VLS_18 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.assignment.data))
                    return;
                __VLS_ctx.submitAssignment();
                // @ts-ignore
                [submitAssignment,];
            } });
    const { default: __VLS_19 } = __VLS_15.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_15;
    var __VLS_16;
    if (__VLS_ctx.submissionName != 'new' &&
        !['Pass', 'Fail'].includes(__VLS_ctx.submissionResource.doc?.status) &&
        __VLS_ctx.submissionResource.doc?.owner == __VLS_ctx.user.data?.name) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-surface-blue-2 text-ink-blue-2 p-3 rounded-md leading-5 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-surface-blue-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-blue-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (__VLS_ctx.__("You've successfully submitted the assignment."));
        (__VLS_ctx.__("Once the moderator grades your submission, you'll find the details here."));
        (__VLS_ctx.__('Feel free to make edits to your submission if needed.'));
    }
    if (__VLS_ctx.showUploader()) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border rounded-lg p-3" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-semibold mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        (__VLS_ctx.__('Upload Assignment'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5 text-sm mt-1 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        (__VLS_ctx.__('You can only upload {0} files').format(__VLS_ctx.assignment.data.type));
        if (!__VLS_ctx.submissionResource.doc?.assignment_attachment) {
            let __VLS_20;
            /** @ts-ignore @type { | typeof __VLS_components.FileUploader | typeof __VLS_components.FileUploader} */
            FileUploader;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                ...{ 'onSuccess': {} },
                fileTypes: (__VLS_ctx.getType()),
                uploadArgs: ({
                    private: true,
                }),
                validateFile: (__VLS_ctx.validateFile),
            }));
            const __VLS_22 = __VLS_21({
                ...{ 'onSuccess': {} },
                fileTypes: (__VLS_ctx.getType()),
                uploadArgs: ({
                    private: true,
                }),
                validateFile: (__VLS_ctx.validateFile),
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            let __VLS_25;
            const __VLS_26 = ({ success: {} },
                { onSuccess: ((file) => __VLS_ctx.saveSubmission(file)) });
            const { default: __VLS_27 } = __VLS_23.slots;
            {
                const { default: __VLS_28 } = __VLS_23.slots;
                const [{ uploading, progress, openFileSelector }] = __VLS_vSlot(__VLS_28);
                let __VLS_29;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                    ...{ 'onClick': {} },
                    loading: (uploading),
                }));
                const __VLS_31 = __VLS_30({
                    ...{ 'onClick': {} },
                    loading: (uploading),
                }, ...__VLS_functionalComponentArgsRest(__VLS_30));
                let __VLS_34;
                const __VLS_35 = ({ click: {} },
                    { onClick: (openFileSelector) });
                const { default: __VLS_36 } = __VLS_32.slots;
                (uploading
                    ? __VLS_ctx.__('Uploading {0}%').format(progress)
                    : __VLS_ctx.__('Upload File'));
                // @ts-ignore
                [assignment, submissionName, __, __, __, __, __, __, __, user, submissionResource, submissionResource, submissionResource, showUploader, getType, validateFile, saveSubmission,];
                var __VLS_32;
                var __VLS_33;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_23;
            var __VLS_24;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center text-ink-gray-7" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.submissionResource.doc.assignment_attachment),
                target: "_blank",
                ...{ class: "cursor-pointer !no-underline text-sm leading-5" },
            });
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['!no-underline']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "border rounded-md p-2 mr-2" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
            let __VLS_37;
            /** @ts-ignore @type { | typeof __VLS_components.FileText} */
            FileText;
            // @ts-ignore
            const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
                ...{ class: "h-5 w-5 stroke-1.5" },
            }));
            const __VLS_39 = __VLS_38({
                ...{ class: "h-5 w-5 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_38));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.submissionResource.doc.assignment_attachment
                .split('/')
                .pop());
            if (__VLS_ctx.canModifyAssignment) {
                let __VLS_42;
                /** @ts-ignore @type { | typeof __VLS_components.X} */
                X;
                // @ts-ignore
                const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
                    ...{ 'onClick': {} },
                    ...{ class: "bg-surface-gray-3 rounded-md cursor-pointer stroke-1.5 w-5 h-5 p-1 ml-4" },
                }));
                const __VLS_44 = __VLS_43({
                    ...{ 'onClick': {} },
                    ...{ class: "bg-surface-gray-3 rounded-md cursor-pointer stroke-1.5 w-5 h-5 p-1 ml-4" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_43));
                let __VLS_47;
                const __VLS_48 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!(__VLS_ctx.assignment.data))
                                return;
                            if (!(__VLS_ctx.showUploader()))
                                return;
                            if (!!(!__VLS_ctx.submissionResource.doc?.assignment_attachment))
                                return;
                            if (!(__VLS_ctx.canModifyAssignment))
                                return;
                            __VLS_ctx.removeSubmission();
                            // @ts-ignore
                            [submissionResource, submissionResource, canModifyAssignment, removeSubmission,];
                        } });
                /** @type {__VLS_StyleScopedClasses['bg-surface-gray-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
                var __VLS_45;
                var __VLS_46;
            }
        }
    }
    else if (__VLS_ctx.assignment.data.type == 'URL') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs text-ink-gray-5 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (__VLS_ctx.__('Enter a URL'));
        let __VLS_49;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            modelValue: (__VLS_ctx.answer),
            type: "text",
            readonly: (!__VLS_ctx.canModifyAssignment),
        }));
        const __VLS_51 = __VLS_50({
            modelValue: (__VLS_ctx.answer),
            type: "text",
            readonly: (!__VLS_ctx.canModifyAssignment),
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm mb-2 text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.__('Write your answer here'));
        let __VLS_54;
        /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
        TextEditor;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
            ...{ 'onChange': {} },
            content: (__VLS_ctx.answer),
            editable: (true),
            fixedMenu: (true),
            uploadArgs: ({
                private: true,
            }),
            editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
        }));
        const __VLS_56 = __VLS_55({
            ...{ 'onChange': {} },
            content: (__VLS_ctx.answer),
            editable: (true),
            fixedMenu: (true),
            uploadArgs: ({
                private: true,
            }),
            editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
        }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        let __VLS_59;
        const __VLS_60 = ({ change: {} },
            { onChange: ((val) => (__VLS_ctx.answer = val)) });
        var __VLS_57;
        var __VLS_58;
    }
    if (__VLS_ctx.user.data?.name == __VLS_ctx.submissionResource.doc?.owner &&
        __VLS_ctx.submissionResource.doc?.comments) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-8 p-3 border rounded-lg" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        (__VLS_ctx.__('Comments by Evaluator'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "leading-6 text-ink-gray-9" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.submissionResource.doc.comments) }, null, null);
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    }
    if (__VLS_ctx.canGradeSubmission) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-8 space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-semibold mb-2 text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.__('AI Grading'));
        if (__VLS_ctx.submissionResource.doc) {
            let __VLS_61;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
                modelValue: (__VLS_ctx.submissionResource.doc.status),
                label: (__VLS_ctx.__('Grade')),
                type: "select",
                options: (__VLS_ctx.submissionStatusOptions),
            }));
            const __VLS_63 = __VLS_62({
                modelValue: (__VLS_ctx.submissionResource.doc.status),
                label: (__VLS_ctx.__('Grade')),
                type: "select",
                options: (__VLS_ctx.submissionStatusOptions),
            }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm text-ink-gray-5 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (__VLS_ctx.__('Comments'));
        let __VLS_66;
        /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
        TextEditor;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
            ...{ 'onChange': {} },
            content: (__VLS_ctx.comments),
            editable: (true),
            fixedMenu: (true),
            uploadArgs: ({
                private: true,
            }),
            editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
        }));
        const __VLS_68 = __VLS_67({
            ...{ 'onChange': {} },
            content: (__VLS_ctx.comments),
            editable: (true),
            fixedMenu: (true),
            uploadArgs: ({
                private: true,
            }),
            editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
        }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        let __VLS_71;
        const __VLS_72 = ({ change: {} },
            { onChange: ((val) => {
                    __VLS_ctx.comments = val;
                    __VLS_ctx.isDirty = true;
                }) });
        var __VLS_69;
        var __VLS_70;
    }
}
// @ts-ignore
[assignment, __, __, __, __, __, __, user, submissionResource, submissionResource, submissionResource, submissionResource, submissionResource, isDirty, canModifyAssignment, answer, answer, answer, canGradeSubmission, submissionStatusOptions, comments, comments,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        assignmentID: {
            type: String,
            required: true,
        },
        submissionName: {
            type: String,
            default: 'new',
        },
        showTitle: {
            type: Boolean,
            default: true,
        },
    },
});
export default {};
