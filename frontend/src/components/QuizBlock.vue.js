/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { inject } from 'vue';
import { Button } from 'frappe-ui';
import Quiz from '@/components/Quiz.vue';
const user = inject('$user');
const props = defineProps({
    quiz: {
        type: String,
        required: true,
    },
});
const redirectToLogin = () => {
    window.location.href = `/login`;
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
if (__VLS_ctx.user.data) {
    const __VLS_0 = Quiz || Quiz;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        quizName: (__VLS_ctx.quiz),
    }));
    const __VLS_2 = __VLS_1({
        quizName: (__VLS_ctx.quiz),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_5 = {};
    var __VLS_3;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border rounded-md text-center py-20" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    (__VLS_ctx.__('Please login to access the quiz.'));
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        ...{ 'onClick': {} },
        ...{ class: "mt-2" },
    }));
    const __VLS_8 = __VLS_7({
        ...{ 'onClick': {} },
        ...{ class: "mt-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_11;
    const __VLS_12 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(__VLS_ctx.user.data))
                    return;
                __VLS_ctx.redirectToLogin();
                // @ts-ignore
                [user, quiz, __, redirectToLogin,];
            } });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    const { default: __VLS_13 } = __VLS_9.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Login'));
    // @ts-ignore
    [__,];
    var __VLS_9;
    var __VLS_10;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        quiz: {
            type: String,
            required: true,
        },
    },
});
export default {};
