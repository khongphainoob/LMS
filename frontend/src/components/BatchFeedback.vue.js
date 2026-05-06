/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { convertToTitleCase } from '@/utils';
import { Button, createListResource, FormControl, Rating } from 'frappe-ui';
import FeedbackModal from '@/components/Modals/FeedbackModal.vue';
const user = inject('$user');
const ratingKeys = ['content', 'instructors', 'value'];
const readOnly = ref(false);
const average = reactive({});
const feedback = reactive({});
const showFeedbackForm = ref(true);
const showAllFeedback = ref(false);
const props = defineProps({
    batch: {
        type: String,
        required: true,
    },
});
onMounted(() => {
    let filters = {
        batch: props.batch,
    };
    if (user.data?.is_student) {
        filters['member'] = user.data?.name;
    }
    feedbackList.update({
        filters: filters,
    });
    feedbackList.reload();
});
const feedbackList = createListResource({
    doctype: 'LMS Batch Feedback',
    filters: {
        batch: props.batch,
    },
    fields: [
        'content',
        'instructors',
        'value',
        'feedback',
        'name',
        'member',
        'member_name',
        'member_image',
    ],
    cache: ['feedbackList', props.batch, user.data?.name],
});
watch(() => feedbackList.data, () => {
    if (feedbackList.data.length) {
        let data = feedbackList.data;
        readOnly.value = true;
        showFeedbackForm.value = false;
        ratingKeys.forEach((key) => {
            average[key] = 0;
        });
        data.forEach((row) => {
            Object.keys(row).forEach((key) => {
                if (ratingKeys.includes(key))
                    row[key] = row[key] * 5;
                feedback[key] = row[key];
            });
            ratingKeys.forEach((key) => {
                average[key] += row[key];
            });
        });
        Object.keys(average).forEach((key) => {
            average[key] = average[key] / data.length;
        });
    }
});
const submitFeedback = () => {
    ratingKeys.forEach((key) => {
        feedback[key] = feedback[key] / 5;
    });
    feedbackList.insert.submit({
        member: user.data?.name,
        batch: props.batch,
        ...feedback,
    }, {
        onSuccess: () => {
            feedbackList.reload();
            showFeedbackForm.value = false;
        },
    });
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
if (__VLS_ctx.user.data?.is_student) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "leading-5 mb-4 text-ink-gray-7" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    if (__VLS_ctx.readOnly) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (__VLS_ctx.__('Thank you for providing your feedback.'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.user.data?.is_student))
                        return;
                    if (!(__VLS_ctx.readOnly))
                        return;
                    __VLS_ctx.showFeedbackForm = !__VLS_ctx.showFeedbackForm;
                    // @ts-ignore
                    [user, readOnly, __, showFeedbackForm, showFeedbackForm,];
                } },
            ...{ class: "underline cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['underline']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        (__VLS_ctx.__('Click here'));
        (__VLS_ctx.__('to view your feedback.'));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (__VLS_ctx.__('Help us improve by providing your feedback.'));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
        ...{ class: (__VLS_ctx.showFeedbackForm ? 'block' : 'hidden') },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    for (const [key] of __VLS_vFor((__VLS_ctx.ratingKeys))) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.Rating} */
        Rating;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            modelValue: (__VLS_ctx.feedback[key]),
            label: (__VLS_ctx.__(__VLS_ctx.convertToTitleCase(key))),
            readonly: (__VLS_ctx.readOnly),
        }));
        const __VLS_2 = __VLS_1({
            modelValue: (__VLS_ctx.feedback[key]),
            label: (__VLS_ctx.__(__VLS_ctx.convertToTitleCase(key))),
            readonly: (__VLS_ctx.readOnly),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        // @ts-ignore
        [readOnly, __, __, __, __, showFeedbackForm, ratingKeys, feedback, convertToTitleCase,];
    }
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        modelValue: (__VLS_ctx.feedback.feedback),
        type: "textarea",
        label: (__VLS_ctx.__('Feedback')),
        rows: (9),
        readonly: (__VLS_ctx.readOnly),
    }));
    const __VLS_7 = __VLS_6({
        modelValue: (__VLS_ctx.feedback.feedback),
        type: "textarea",
        label: (__VLS_ctx.__('Feedback')),
        rows: (9),
        readonly: (__VLS_ctx.readOnly),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    if (!__VLS_ctx.readOnly) {
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            ...{ 'onClick': {} },
        }));
        const __VLS_12 = __VLS_11({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        let __VLS_15;
        const __VLS_16 = ({ click: {} },
            { onClick: (__VLS_ctx.submitFeedback) });
        const { default: __VLS_17 } = __VLS_13.slots;
        (__VLS_ctx.__('Submit Feedback'));
        // @ts-ignore
        [readOnly, readOnly, __, __, feedback, submitFeedback,];
        var __VLS_13;
        var __VLS_14;
    }
}
else if (__VLS_ctx.feedbackList.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "leading-5 text-sm mb-2 mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    (__VLS_ctx.__('Average Feedback Received'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    for (const [key] of __VLS_vFor((__VLS_ctx.ratingKeys))) {
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.Rating} */
        Rating;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            modelValue: (__VLS_ctx.average[key]),
            label: (__VLS_ctx.__(__VLS_ctx.convertToTitleCase(key))),
            readonly: (true),
        }));
        const __VLS_20 = __VLS_19({
            modelValue: (__VLS_ctx.average[key]),
            label: (__VLS_ctx.__(__VLS_ctx.convertToTitleCase(key))),
            readonly: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        // @ts-ignore
        [__, __, ratingKeys, convertToTitleCase, feedbackList, average,];
    }
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        ...{ 'onClick': {} },
        variant: "outline",
        ...{ class: "mt-5" },
    }));
    const __VLS_25 = __VLS_24({
        ...{ 'onClick': {} },
        variant: "outline",
        ...{ class: "mt-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_28;
    const __VLS_29 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(__VLS_ctx.user.data?.is_student))
                    return;
                if (!(__VLS_ctx.feedbackList.data?.length))
                    return;
                __VLS_ctx.showAllFeedback = true;
                // @ts-ignore
                [showAllFeedback,];
            } });
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    const { default: __VLS_30 } = __VLS_26.slots;
    (__VLS_ctx.__('View all feedback'));
    // @ts-ignore
    [__,];
    var __VLS_26;
    var __VLS_27;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-7 mt-5 leading-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    (__VLS_ctx.__('No feedback received yet.'));
}
if (__VLS_ctx.feedbackList.data?.length) {
    const __VLS_31 = FeedbackModal;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        modelValue: (__VLS_ctx.showAllFeedback),
        feedbackList: (__VLS_ctx.feedbackList.data),
    }));
    const __VLS_33 = __VLS_32({
        modelValue: (__VLS_ctx.showAllFeedback),
        feedbackList: (__VLS_ctx.feedbackList.data),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
}
// @ts-ignore
[__, feedbackList, feedbackList, showAllFeedback,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batch: {
            type: String,
            required: true,
        },
    },
});
export default {};
