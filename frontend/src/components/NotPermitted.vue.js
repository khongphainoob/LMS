/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button } from 'frappe-ui';
const props = defineProps({
    title: {
        type: String,
        default: 'Not Permitted',
    },
    text: {
        type: String,
        default: 'You are not permitted to access this page.',
    },
    buttonLabel: {
        type: String,
        default: 'Login',
    },
    buttonLink: {
        type: String,
        default: '/login',
    },
});
const redirect = () => {
    window.location.href = props.buttonLink;
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
    ...{ class: "text-base border rounded-md w-1/3 mx-auto my-32" },
});
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1/3']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['my-32']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border-b px-5 py-3 font-medium text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "inline-flex items-center before:bg-surface-red-5 before:w-2 before:h-2 before:rounded-md before:mr-2" },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['before:bg-surface-red-5']} */ ;
/** @type {__VLS_StyleScopedClasses['before:w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['before:h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['before:rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['before:mr-2']} */ ;
(__VLS_ctx.__(__VLS_ctx.title));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-5 py-3" },
});
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-4 leading-6 text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
(__VLS_ctx.__(__VLS_ctx.text));
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    variant: "solid",
    ...{ class: "w-full" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    variant: "solid",
    ...{ class: "w-full" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.redirect();
            // @ts-ignore
            [__, __, title, text, redirect,];
        } });
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
const { default: __VLS_7 } = __VLS_3.slots;
(__VLS_ctx.__(__VLS_ctx.buttonLabel));
// @ts-ignore
[__, buttonLabel,];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        title: {
            type: String,
            default: 'Not Permitted',
        },
        text: {
            type: String,
            default: 'You are not permitted to access this page.',
        },
        buttonLabel: {
            type: String,
            default: 'Login',
        },
        buttonLink: {
            type: String,
            default: '/login',
        },
    },
});
export default {};
