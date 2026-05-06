/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, FormControl, createResource, toast, Rating } from 'frappe-ui';
import { reactive } from 'vue';
const show = defineModel();
const reviews = defineModel('reloadReviews');
const hasReviewed = defineModel('hasReviewed');
let review = reactive({
    review: '',
    rating: 0,
});
const props = defineProps({
    courseName: {
        type: String,
        required: true,
    },
});
const createReview = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'LMS Course Review',
                course: props.courseName,
                ...values,
            },
        };
    },
});
function submitReview(close) {
    review.rating = review.rating / 5;
    createReview.submit(review, {
        validate() {
            if (!review.rating) {
                return 'Please enter a rating.';
            }
        },
        onSuccess() {
            reviews.value.reload();
            hasReviewed.value.reload();
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
    close();
}
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
        title: __VLS_ctx.__('Write a Review'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.submitReview(close),
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Write a Review'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.submitReview(close),
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.Rating} */
    Rating;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.review.rating),
        label: (__VLS_ctx.__('Rating')),
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.review.rating),
        label: (__VLS_ctx.__('Rating')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        label: (__VLS_ctx.__('Review')),
        type: "textarea",
        modelValue: (__VLS_ctx.review.review),
        rows: (5),
    }));
    const __VLS_15 = __VLS_14({
        label: (__VLS_ctx.__('Review')),
        type: "textarea",
        modelValue: (__VLS_ctx.review.review),
        rows: (5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    // @ts-ignore
    [show, __, __, __, __, submitReview, review, review,];
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
            courseName: {
                type: String,
                required: true,
            },
        },
    },
});
export default {};
