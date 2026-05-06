/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import Quiz from '@/components/Quiz.vue';
import { createResource, Breadcrumbs, usePageMeta } from 'frappe-ui';
import { computed, inject, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { sessionStore } from '../stores/session';
const { brand } = sessionStore();
const user = inject('$user');
const router = useRouter();
const fromLesson = ref(false);
onMounted(() => {
    if (!user.data) {
        router.push({ name: 'Courses' });
    }
    if (new URLSearchParams(window.location.search).get('fromLesson')) {
        fromLesson.value = true;
    }
});
const props = defineProps({
    quizID: {
        type: String,
        required: true,
    },
});
const title = createResource({
    url: 'frappe.client.get_value',
    params: {
        doctype: 'LMS Quiz',
        fieldname: 'title',
        filters: {
            name: props.quizID,
        },
    },
    auto: true,
});
const breadcrumbs = computed(() => {
    return [{ label: __('Quiz Submission') }, { label: title.data?.title }];
});
usePageMeta(() => {
    return {
        title: `${title.data?.title}`,
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
    ...{ class: "md:w-7/12 md:mx-auto mx-4 py-10" },
    ...{ class: ({ 'pt-4 md:w-full': __VLS_ctx.fromLesson }) },
});
/** @type {__VLS_StyleScopedClasses['md:w-7/12']} */ ;
/** @type {__VLS_StyleScopedClasses['md:mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:w-full']} */ ;
const __VLS_5 = Quiz;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    quizName: (__VLS_ctx.quizID),
}));
const __VLS_7 = __VLS_6({
    quizName: (__VLS_ctx.quizID),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
// @ts-ignore
[fromLesson, fromLesson, breadcrumbs, quizID,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        quizID: {
            type: String,
            required: true,
        },
    },
});
export default {};
