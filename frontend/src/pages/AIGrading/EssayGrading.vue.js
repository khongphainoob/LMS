/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Dialog, Input, createResource } from 'frappe-ui';
import EssayImageUploadBlock from '@/components/AIGrading/EssayImageUploadBlock.vue';
import EssayRubricUploadBlock from '@/components/AIGrading/EssayRubricUploadBlock.vue';
const router = useRouter();
const showSessionModal = ref(false);
const sessionForm = ref({
    session_name: '',
    class_name: '',
    course_name: '',
});
const batches = createResource({
    url: 'frappe.client.get_list',
    makeParams() {
        return {
            doctype: 'LMS Batch',
            fields: ['name', 'title'],
            limit_page_length: 0,
        };
    },
    auto: true,
});
const batchOptions = computed(() => {
    const options = batches.data?.map((batch) => ({
        label: batch.title || batch.name,
        value: batch.name,
    })) || [];
    return [{ label: __('Select Class...'), value: '' }, ...options];
});
const courses = createResource({
    url: 'frappe.client.get_list',
    makeParams() {
        return {
            doctype: 'LMS Course',
            fields: ['name', 'title'],
            limit_page_length: 0,
        };
    },
    auto: true,
});
const courseOptions = computed(() => {
    const options = courses.data?.map((course) => ({
        label: course.title || course.name,
        value: course.name,
    })) || [];
    return [{ label: __('Select Subject...'), value: '' }, ...options];
});
function submitSession() {
    console.log('Session Form:', sessionForm.value);
    // You can add API call here to create Essay Grading Session in the database, e.g.:
    // frappe.call('lms.lms.api.create_grading_session', sessionForm.value)
    // Create a random session ID for routing example or use the response from DB
    const genSessionId = sessionForm.value.session_name || 'new-session';
    showSessionModal.value = false;
    router.push({ name: 'EssayGradingSession', params: { sessionId: genSessionId } });
}
const queue = [
    {
        title: __('ENG-302 / Midterm Essay / 24 submissions'),
        subtitle: __('3 responses need manual override.'),
    },
    {
        title: __('BUS-110 / Reflection Paper / 18 submissions'),
        subtitle: __('AI suggestions generated, awaiting approval.'),
    },
    {
        title: __('LAW-208 / Case Analysis / 11 submissions'),
        subtitle: __('Rubric mismatch detected for criterion #4.'),
    },
];
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rounded-xl border border-amber-100 bg-white p-5 shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-amber-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['md:justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700" },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-100']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-700']} */ ;
(__VLS_ctx.__('Essay'));
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "mt-3 text-xl font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Essay Grading Workspace'));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-sm text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
(__VLS_ctx.__('Blend rubric scoring, AI suggestions, and instructor approval in one place.'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    variant: "solid",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    variant: "solid",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.showSessionModal = true;
            // @ts-ignore
            [__, __, __, showSessionModal,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
(__VLS_ctx.__('Create Grading Session'));
// @ts-ignore
[__,];
var __VLS_3;
var __VLS_4;
let __VLS_8;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    variant: "outline",
}));
const __VLS_10 = __VLS_9({
    variant: "outline",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const { default: __VLS_13 } = __VLS_11.slots;
(__VLS_ctx.__('Open Rubric'));
// @ts-ignore
[__,];
var __VLS_11;
let __VLS_14;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_19 } = __VLS_17.slots;
(__VLS_ctx.__('Generate Draft Feedback'));
// @ts-ignore
[__,];
var __VLS_17;
let __VLS_20;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.showSessionModal),
    title: (__VLS_ctx.__('Create Essay Grading Session')),
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.showSessionModal),
    title: (__VLS_ctx.__('Create Essay Grading Session')),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const { default: __VLS_25 } = __VLS_23.slots;
{
    const { 'body-content': __VLS_26 } = __VLS_23.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-sm font-medium text-gray-700" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    (__VLS_ctx.__('Session Name'));
    let __VLS_27;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        type: "text",
        modelValue: (__VLS_ctx.sessionForm.session_name),
        placeholder: (__VLS_ctx.__('Enter grading session name')),
    }));
    const __VLS_29 = __VLS_28({
        type: "text",
        modelValue: (__VLS_ctx.sessionForm.session_name),
        placeholder: (__VLS_ctx.__('Enter grading session name')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-sm font-medium text-gray-700" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    (__VLS_ctx.__('Select Class'));
    let __VLS_32;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        type: "select",
        modelValue: (__VLS_ctx.sessionForm.class_name),
        options: (__VLS_ctx.batchOptions),
    }));
    const __VLS_34 = __VLS_33({
        type: "select",
        modelValue: (__VLS_ctx.sessionForm.class_name),
        options: (__VLS_ctx.batchOptions),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-sm font-medium text-gray-700" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    (__VLS_ctx.__('Select Subject'));
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        type: "select",
        modelValue: (__VLS_ctx.sessionForm.course_name),
        options: (__VLS_ctx.courseOptions),
    }));
    const __VLS_39 = __VLS_38({
        type: "select",
        modelValue: (__VLS_ctx.sessionForm.course_name),
        options: (__VLS_ctx.courseOptions),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-sm font-medium text-gray-700" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    (__VLS_ctx.__('Upload Rubric'));
    const __VLS_42 = EssayRubricUploadBlock;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({}));
    const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
    // @ts-ignore
    [__, __, __, __, __, __, showSessionModal, sessionForm, sessionForm, sessionForm, batchOptions, courseOptions,];
}
{
    const { actions: __VLS_47 } = __VLS_23.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-2 px-4 pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    let __VLS_48;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        ...{ 'onClick': {} },
    }));
    const __VLS_50 = __VLS_49({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_53;
    const __VLS_54 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.showSessionModal = false;
                // @ts-ignore
                [showSessionModal,];
            } });
    const { default: __VLS_55 } = __VLS_51.slots;
    (__VLS_ctx.__('Cancel'));
    // @ts-ignore
    [__,];
    var __VLS_51;
    var __VLS_52;
    let __VLS_56;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_61;
    const __VLS_62 = ({ click: {} },
        { onClick: (__VLS_ctx.submitSession) });
    const { default: __VLS_63 } = __VLS_59.slots;
    (__VLS_ctx.__('Create Session'));
    // @ts-ignore
    [__, submitSession,];
    var __VLS_59;
    var __VLS_60;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_23;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid gap-4 md:grid-cols-2" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rounded-lg border border-amber-100 bg-amber-50/70 p-4" },
});
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-amber-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-50/70']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-sm font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Rubric Coverage'));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-xs text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
(__VLS_ctx.__('Each criterion is scored independently before AI summary generation.'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-3 h-2 rounded-full bg-amber-100" },
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-100']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "h-2 w-[82%] rounded-full bg-amber-400" },
});
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[82%]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-1 text-xs text-amber-700" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-700']} */ ;
(__VLS_ctx.__('mapped criteria'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rounded-lg border border-emerald-100 bg-emerald-50/70 p-4" },
});
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-emerald-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-emerald-50/70']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-sm font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Feedback Quality'));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-xs text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
(__VLS_ctx.__('Tone checks and actionable suggestions are validated before publish.'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-3 h-2 rounded-full bg-emerald-100" },
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-emerald-100']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "h-2 w-[91%] rounded-full bg-emerald-400" },
});
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[91%]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-emerald-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-1 text-xs text-emerald-700" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-emerald-700']} */ ;
(__VLS_ctx.__('quality score'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rounded-xl border border-outline-gray-2 bg-surface-white p-5" },
});
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
    ...{ class: "text-base font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Review Queue'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-3 space-y-3" },
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.queue))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (item.title),
        ...{ class: "flex flex-col gap-2 rounded-lg border border-outline-gray-2 p-4 md:flex-row md:items-center md:justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (item.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-6" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
    (item.subtitle);
    let __VLS_64;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
        ...{ class: "w-full md:w-auto" },
    }));
    const __VLS_66 = __VLS_65({
        ...{ class: "w-full md:w-auto" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:w-auto']} */ ;
    const { default: __VLS_69 } = __VLS_67.slots;
    (__VLS_ctx.__('Open Submission'));
    // @ts-ignore
    [__, __, __, __, __, __, __, __, queue,];
    var __VLS_67;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
