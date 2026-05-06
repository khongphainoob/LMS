/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createListResource } from 'frappe-ui';
import { inject, onMounted } from 'vue';
const dayjs = inject('$dayjs');
const props = defineProps({
    profile: {
        type: Object,
        required: true,
    },
});
onMounted(() => {
    if (props.profile.data?.name) {
        certificates.reload();
    }
});
const certificates = createListResource({
    doctype: 'LMS Certificate',
    filters: {
        member: props.profile.data?.name,
    },
    fields: ['name', 'course_title', 'batch_title', 'issue_date', 'template'],
    cache: ['certificates', props.profile.data?.name],
});
const openCertificate = (certificate) => {
    window.open(`/api/method/frappe.utils.print_format.download_pdf?doctype=LMS+Certificate&name=${certificate.name}&format=${encodeURIComponent(certificate.template)}`);
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-7 mb-10" },
});
/** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "mb-3 text-lg font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Certificates'));
if (__VLS_ctx.certificates.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    for (const [certificate] of __VLS_vFor((__VLS_ctx.certificates.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.certificates.data?.length))
                        return;
                    __VLS_ctx.openCertificate(certificate);
                    // @ts-ignore
                    [__, certificates, certificates, openCertificate,];
                } },
            key: (certificate.name),
            ...{ class: "flex flex-col bg-surface-white border rounded-lg p-3 cursor-pointer hover:bg-surface-menu-bar" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-surface-menu-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-medium leading-5 mb-2 text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (certificate.course_title || certificate.batch_title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm text-ink-gray-7 font-medium mt-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Issued on'));
        (__VLS_ctx.dayjs(certificate.issue_date).format('DD MMM YYYY'));
        // @ts-ignore
        [__, dayjs,];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm italic text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['italic']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('You have not received any certificates yet.'));
}
// @ts-ignore
[__,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        profile: {
            type: Object,
            required: true,
        },
    },
});
export default {};
