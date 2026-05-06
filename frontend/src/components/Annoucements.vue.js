/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource, Avatar } from 'frappe-ui';
import { timeAgo } from '@/utils';
const props = defineProps({
    batch: {
        type: String,
        required: true,
    },
});
const communications = createResource({
    url: 'lms.lms.api.get_announcements',
    makeParams(value) {
        return {
            batch: props.batch,
        };
    },
    auto: true,
    cache: ['announcement', props.batch],
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
if (__VLS_ctx.communications.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    for (const [comm] of __VLS_vFor((__VLS_ctx.communications.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-8" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
        Avatar;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            label: (comm.sender_full_name),
            size: "lg",
        }));
        const __VLS_2 = __VLS_1({
            label: (comm.sender_full_name),
            size: "lg",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ml-2 text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (comm.sender_full_name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (__VLS_ctx.timeAgo(comm.communication_date));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "prose prose-sm bg-surface-menu-bar !min-w-full px-4 py-2 rounded-md" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (comm.content) }, null, null);
        /** @type {__VLS_StyleScopedClasses['prose']} */ ;
        /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-menu-bar']} */ ;
        /** @type {__VLS_StyleScopedClasses['!min-w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        // @ts-ignore
        [communications, communications, timeAgo,];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm italic text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['italic']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('No announcements'));
}
// @ts-ignore
[__,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batch: {
            type: String,
            required: true,
        },
    },
});
export default {};
