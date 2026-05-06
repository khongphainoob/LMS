/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource, usePageMeta } from 'frappe-ui';
import { computed, inject } from 'vue';
import { sessionStore } from '../stores/session';
const dayjs = inject('$dayjs');
const { brand } = sessionStore();
const props = defineProps({
    badgeName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
});
const badge = createResource({
    url: 'frappe.client.get',
    makeParams(values) {
        return {
            doctype: 'LMS Badge Assignment',
            filters: {
                badge: props.badgeName,
                member: props.email,
            },
        };
    },
    auto: true,
});
const breadcrumbs = computed(() => {
    return [
        {
            label: __('Badges'),
        },
        {
            label: badge.data.badge,
            route: {
                name: 'Badge',
                params: {
                    badge: badge.data.badge,
                },
            },
        },
    ];
});
usePageMeta(() => {
    return {
        title: badge.data.badge,
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
if (__VLS_ctx.badge.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-5 flex flex-col items-center mt-40" },
    });
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-40']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-3xl font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.badge.data.badge);
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.badge.data.badge_image),
        alt: (__VLS_ctx.badge.data.badge),
        ...{ class: "h-60 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['h-60']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    (__VLS_ctx.__('This badge has been awarded to {0} on {1}.').format(__VLS_ctx.badge.data.member_name, __VLS_ctx.dayjs(__VLS_ctx.badge.data.issued_on).format('DD MMM YYYY')));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.badge.data.badge_description);
}
// @ts-ignore
[badge, badge, badge, badge, badge, badge, badge, __, dayjs,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        badgeName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    },
});
export default {};
