/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createDocumentResource, Breadcrumbs, FormControl, Button, Badge, usePageMeta, toast, } from 'frappe-ui';
import { computed, onBeforeUnmount, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { sessionStore } from '@/stores/session';
const { brand } = sessionStore();
const router = useRouter();
const user = inject('$user');
onMounted(() => {
    if (!user.data?.is_instructor && !user.data?.is_moderator)
        router.push({ name: 'Courses' });
    window.addEventListener('keydown', keyboardShortcut);
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', keyboardShortcut);
});
const keyboardShortcut = (e) => {
    if (e.key === 's' &&
        (e.ctrlKey || e.metaKey) &&
        !e.target.classList.contains('ProseMirror')) {
        saveSubmission();
        e.preventDefault();
    }
};
const props = defineProps({
    submission: {
        type: String,
        required: true,
    },
});
const submissionDetails = createDocumentResource({
    doctype: 'LMS Quiz Submission',
    name: props.submission,
    auto: true,
});
const breadcrumbs = computed(() => {
    return [
        {
            label: __('Quiz Submissions'),
            route: {
                name: 'QuizSubmissionList',
                params: {
                    quizID: submissionDetails.doc.quiz,
                },
            },
        },
        {
            label: submissionDetails.doc.quiz_title,
        },
    ];
});
const saveSubmission = () => {
    submissionDetails.save.submit({}, {
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
usePageMeta(() => {
    return {
        title: `${submissionDetails.doc?.quiz_title}`,
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
if (__VLS_ctx.submissionDetails.doc) {
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
if (__VLS_ctx.submissionDetails.isDirty) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Badge} */
    Badge;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        label: (__VLS_ctx.__('Not Saved')),
        variant: "subtle",
        theme: "orange",
    }));
    const __VLS_7 = __VLS_6({
        label: (__VLS_ctx.__('Not Saved')),
        variant: "subtle",
        theme: "orange",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
}
let __VLS_10;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    ...{ 'onClick': {} },
    variant: "solid",
}));
const __VLS_12 = __VLS_11({
    ...{ 'onClick': {} },
    variant: "solid",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
let __VLS_15;
const __VLS_16 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.saveSubmission();
            // @ts-ignore
            [submissionDetails, submissionDetails, breadcrumbs, __, saveSubmission,];
        } });
const { default: __VLS_17 } = __VLS_13.slots;
(__VLS_ctx.__('Save'));
// @ts-ignore
[__,];
var __VLS_13;
var __VLS_14;
if (__VLS_ctx.submissionDetails.doc) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-2/3 border-x mx-auto py-5" },
    });
    /** @type {__VLS_StyleScopedClasses['w-2/3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-x']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xl px-10 font-semibold text-ink-gray-9 mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    (__VLS_ctx.submissionDetails.doc.member_name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 border-b pb-5 px-10" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        modelValue: (__VLS_ctx.submissionDetails.doc.quiz_title),
        label: (__VLS_ctx.__('Quiz')),
        disabled: (true),
    }));
    const __VLS_20 = __VLS_19({
        modelValue: (__VLS_ctx.submissionDetails.doc.quiz_title),
        label: (__VLS_ctx.__('Quiz')),
        disabled: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        modelValue: (__VLS_ctx.submissionDetails.doc.member_name),
        label: (__VLS_ctx.__('Member')),
        disabled: (true),
    }));
    const __VLS_25 = __VLS_24({
        modelValue: (__VLS_ctx.submissionDetails.doc.member_name),
        label: (__VLS_ctx.__('Member')),
        disabled: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    let __VLS_28;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        modelValue: (__VLS_ctx.submissionDetails.doc.score),
        label: (__VLS_ctx.__('Score')),
        disabled: (true),
    }));
    const __VLS_30 = __VLS_29({
        modelValue: (__VLS_ctx.submissionDetails.doc.score),
        label: (__VLS_ctx.__('Score')),
        disabled: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        modelValue: (__VLS_ctx.submissionDetails.doc.percentage),
        label: (__VLS_ctx.__('Percentage')),
        disabled: (true),
    }));
    const __VLS_35 = __VLS_34({
        modelValue: (__VLS_ctx.submissionDetails.doc.percentage),
        label: (__VLS_ctx.__('Percentage')),
        disabled: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "divide-y" },
    });
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    for (const [row, index] of __VLS_vFor((__VLS_ctx.submissionDetails.doc.result))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "py-5 px-10 space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (__VLS_ctx.__('Question'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "leading-5" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (row.question) }, null, null);
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (__VLS_ctx.__('Answer'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "leading-5" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (row.answer) }, null, null);
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-5" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
        let __VLS_38;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
            modelValue: (row.marks),
            label: (__VLS_ctx.__('Marks')),
        }));
        const __VLS_40 = __VLS_39({
            modelValue: (row.marks),
            label: (__VLS_ctx.__('Marks')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        let __VLS_43;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
            modelValue: (row.marks_out_of),
            label: (__VLS_ctx.__('Marks out of')),
            disabled: (true),
        }));
        const __VLS_45 = __VLS_44({
            modelValue: (row.marks_out_of),
            label: (__VLS_ctx.__('Marks out of')),
            disabled: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        // @ts-ignore
        [submissionDetails, submissionDetails, submissionDetails, submissionDetails, submissionDetails, submissionDetails, submissionDetails, __, __, __, __, __, __, __, __,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        submission: {
            type: String,
            required: true,
        },
    },
});
export default {};
