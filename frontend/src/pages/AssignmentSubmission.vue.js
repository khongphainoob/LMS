/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, createResource, usePageMeta } from 'frappe-ui';
import { computed, inject, onMounted, ref } from 'vue';
import { sessionStore } from '../stores/session';
import Assignment from '@/components/Assignment.vue';
const user = inject('$user');
const fromLesson = ref(false);
const { brand } = sessionStore();
const props = defineProps({
    assignmentID: {
        type: String,
        required: true,
    },
    submissionName: {
        type: String,
        default: 'new',
    },
});
const title = createResource({
    url: 'frappe.client.get_value',
    params: {
        doctype: 'LMS Assignment',
        fieldname: 'title',
        filters: {
            name: props.assignmentID,
        },
    },
    auto: true,
});
onMounted(() => {
    if (!user.data) {
        window.location.href = '/login';
    }
    if (new URLSearchParams(window.location.search).get('fromLesson')) {
        fromLesson.value = true;
    }
});
const breadcrumbs = computed(() => {
    let crumbs = [
        {
            label: __('Submissions'),
            route: { name: 'AssignmentSubmissionList' },
        },
        {
            label: title.data?.title,
            route: {
                name: 'AssignmentSubmission',
                params: {
                    assignmentID: props.assignmentID,
                },
            },
        },
    ];
    return crumbs;
});
usePageMeta(() => {
    return {
        title: title.data?.title,
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
if (!__VLS_ctx.fromLesson) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "flex justify-between sticky top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:px-5']} */ ;
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
    ...{ class: "overflow-hidden h-[calc(100vh-3.2rem)]" },
});
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[calc(100vh-3.2rem)]']} */ ;
const __VLS_5 = Assignment;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    assignmentID: (__VLS_ctx.assignmentID),
    submissionName: (__VLS_ctx.submissionName),
    showTitle: (!__VLS_ctx.fromLesson),
}));
const __VLS_7 = __VLS_6({
    assignmentID: (__VLS_ctx.assignmentID),
    submissionName: (__VLS_ctx.submissionName),
    showTitle: (!__VLS_ctx.fromLesson),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
// @ts-ignore
[fromLesson, fromLesson, breadcrumbs, assignmentID, submissionName,];
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
    },
});
export default {};
