/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { inject } from 'vue';
import { Button, usePageMeta } from 'frappe-ui';
import { sessionStore } from '../stores/session';
const user = inject('$user');
const { brand } = sessionStore();
const redirectToLogin = () => {
    window.location.href = '/login';
};
usePageMeta(() => {
    return {
        title: __('Not Permitted'),
        icon: brand.favicon,
    };
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-surface-white w-full h-full" },
});
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-fit mx-auto mt-56 text-center p-4" },
});
/** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-56']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-3xl font-semibold text-ink-gray-5 pb-4 mb-2 border-b" },
});
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
(__VLS_ctx.__('Not Permitted'));
if (__VLS_ctx.user.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "px-5 py-3" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('You do not have permission to access this page.'));
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        to: ({
            name: 'Courses',
        }),
    }));
    const __VLS_2 = __VLS_1({
        to: ({
            name: 'Courses',
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_5 } = __VLS_3.slots;
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        variant: "solid",
        ...{ class: "mt-2 w-full" },
    }));
    const __VLS_8 = __VLS_7({
        variant: "solid",
        ...{ class: "mt-2 w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    const { default: __VLS_11 } = __VLS_9.slots;
    (__VLS_ctx.__('Checkout Courses'));
    // @ts-ignore
    [__, __, __, user,];
    var __VLS_9;
    // @ts-ignore
    [];
    var __VLS_3;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-5 py-3" },
});
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-ink-gray-5" },
});
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
(__VLS_ctx.__('You are not permitted to access this page.'));
let __VLS_12;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    ...{ class: "mt-4 w-full" },
    variant: "solid",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    ...{ class: "mt-4 w-full" },
    variant: "solid",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_17;
const __VLS_18 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.redirectToLogin();
            // @ts-ignore
            [__, redirectToLogin,];
        } });
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
const { default: __VLS_19 } = __VLS_15.slots;
(__VLS_ctx.__('Login'));
// @ts-ignore
[__,];
var __VLS_15;
var __VLS_16;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
