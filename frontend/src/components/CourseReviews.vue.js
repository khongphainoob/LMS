/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Star } from 'lucide-vue-next';
import { createResource, Button } from 'frappe-ui';
import { watch, ref, inject } from 'vue';
import UserAvatar from '@/components/UserAvatar.vue';
import ReviewModal from '@/components/Modals/ReviewModal.vue';
const user = inject('$user');
const props = defineProps({
    courseName: {
        type: String,
        required: true,
    },
    avg_rating: {
        type: String,
        required: true,
    },
    membership: {
        type: Object,
        required: false,
    },
});
const hasReviewed = createResource({
    url: 'frappe.client.get_count',
    cache: ['eligible_to_review', props.courseName, props.membership?.member],
    params: {
        doctype: 'LMS Course Review',
        filters: {
            course: props.courseName,
            owner: props.membership?.member,
        },
    },
    auto: user.data?.name ? true : false,
});
const reviews = createResource({
    url: 'lms.lms.utils.get_reviews',
    cache: ['course_reviews', props.courseName],
    makeParams() {
        return {
            course: props.courseName,
        };
    },
    auto: true,
});
watch(() => props.courseName, () => {
    reviews.reload();
});
const showReviewModal = ref(false);
function openReviewModal() {
    showReviewModal.value = true;
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.reviews.data?.length || __VLS_ctx.membership) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-20 mb-10" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-10']} */ ;
    if (__VLS_ctx.membership && !__VLS_ctx.hasReviewed.data) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            ...{ 'onClick': {} },
            ...{ class: "float-right" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onClick': {} },
            ...{ class: "float-right" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_5;
        const __VLS_6 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.reviews.data?.length || __VLS_ctx.membership))
                        return;
                    if (!(__VLS_ctx.membership && !__VLS_ctx.hasReviewed.data))
                        return;
                    __VLS_ctx.openReviewModal();
                    // @ts-ignore
                    [reviews, membership, membership, hasReviewed, openReviewModal,];
                } });
        /** @type {__VLS_StyleScopedClasses['float-right']} */ ;
        const { default: __VLS_7 } = __VLS_3.slots;
        (__VLS_ctx.__('Write a Review'));
        // @ts-ignore
        [__,];
        var __VLS_3;
        var __VLS_4;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center font-semibold text-2xl text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Student Reviews'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-8 mt-10" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    for (const [review, index] of __VLS_vFor((__VLS_ctx.reviews.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        let __VLS_8;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            to: ({
                name: 'Profile',
                params: { username: review.owner_details.username },
            }),
        }));
        const __VLS_10 = __VLS_9({
            to: ({
                name: 'Profile',
                params: { username: review.owner_details.username },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        const { default: __VLS_13 } = __VLS_11.slots;
        const __VLS_14 = UserAvatar;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            user: (review.owner_details),
            size: ('2xl'),
        }));
        const __VLS_16 = __VLS_15({
            user: (review.owner_details),
            size: ('2xl'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        // @ts-ignore
        [reviews, __,];
        var __VLS_11;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mx-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            to: ({
                name: 'Profile',
                params: { username: review.owner_details.username },
            }),
        }));
        const __VLS_21 = __VLS_20({
            to: ({
                name: 'Profile',
                params: { username: review.owner_details.username },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        const { default: __VLS_24 } = __VLS_22.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-lg font-medium mr-4 text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (review.owner_details.full_name);
        // @ts-ignore
        [];
        var __VLS_22;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (review.creation);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex mt-2 space-x-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
        for (const [index] of __VLS_vFor((5))) {
            let __VLS_25;
            /** @ts-ignore @type { | typeof __VLS_components.Star} */
            Star;
            // @ts-ignore
            const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
                ...{ class: "size-4 text-transparent rounded-sm" },
                ...{ class: (index <= Math.ceil(review.rating)
                        ? 'fill-yellow-500'
                        : 'fill-gray-300') },
            }));
            const __VLS_27 = __VLS_26({
                ...{ class: "size-4 text-transparent rounded-sm" },
                ...{ class: (index <= Math.ceil(review.rating)
                        ? 'fill-yellow-500'
                        : 'fill-gray-300') },
            }, ...__VLS_functionalComponentArgsRest(__VLS_26));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
            // @ts-ignore
            [];
        }
        if (review.review) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mt-4 leading-5 text-ink-gray-7" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            (review.review);
        }
        // @ts-ignore
        [];
    }
}
const __VLS_30 = ReviewModal;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.showReviewModal),
    reloadReviews: (__VLS_ctx.reviews),
    hasReviewed: (__VLS_ctx.hasReviewed),
    courseName: (__VLS_ctx.courseName),
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.showReviewModal),
    reloadReviews: (__VLS_ctx.reviews),
    hasReviewed: (__VLS_ctx.hasReviewed),
    courseName: (__VLS_ctx.courseName),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
// @ts-ignore
[reviews, hasReviewed, showReviewModal, courseName,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        courseName: {
            type: String,
            required: true,
        },
        avg_rating: {
            type: String,
            required: true,
        },
        membership: {
            type: Object,
            required: false,
        },
    },
});
export default {};
