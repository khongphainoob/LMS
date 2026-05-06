/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { Button, Dialog, FeatherIcon, Popover } from 'frappe-ui';
const deferredPrompt = ref(null);
const showDialog = ref(false);
const iosInstallMessage = ref(false);
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
};
const isInStandaloneMode = () => 'standalone' in window.navigator && window.navigator.standalone;
if (isIos() &&
    !isInStandaloneMode() &&
    localStorage.getItem('learningIosInstallPromptShown') !== 'true') {
    iosInstallMessage.value = true;
    localStorage.setItem('learningIosInstallPromptShown', 'true');
}
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    if (isIos() && !isInStandaloneMode())
        iosInstallMessage.value = true;
    else
        showDialog.value = true;
});
window.addEventListener('appinstalled', () => {
    showDialog.value = false;
    deferredPrompt.value = null;
});
const install = () => {
    deferredPrompt.value.prompt();
    showDialog.value = false;
};
const __VLS_ctx = {
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
    modelValue: (__VLS_ctx.showDialog),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.showDialog),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { 'body-title': __VLS_6 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-lg font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.__('Install Frappe Learning'));
    // @ts-ignore
    [showDialog, __,];
}
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.__('Get the app on your device for easy access & a better experience!'));
    // @ts-ignore
    [__,];
}
{
    const { actions: __VLS_8 } = __VLS_3.slots;
    let __VLS_9;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
        ...{ 'onClick': {} },
        variant: "solid",
        ...{ class: "w-full py-5" },
    }));
    const __VLS_11 = __VLS_10({
        ...{ 'onClick': {} },
        variant: "solid",
        ...{ class: "w-full py-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    let __VLS_14;
    const __VLS_15 = ({ click: {} },
        { onClick: (__VLS_ctx.install) });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    const { default: __VLS_16 } = __VLS_12.slots;
    {
        const { prefix: __VLS_17 } = __VLS_12.slots;
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
        FeatherIcon;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            name: "download",
            ...{ class: "w-4" },
        }));
        const __VLS_20 = __VLS_19({
            name: "download",
            ...{ class: "w-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        // @ts-ignore
        [install,];
    }
    (__VLS_ctx.__('Install'));
    // @ts-ignore
    [__,];
    var __VLS_12;
    var __VLS_13;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
let __VLS_23;
/** @ts-ignore @type { | typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
Popover;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    show: (__VLS_ctx.iosInstallMessage),
    placement: "top-start",
}));
const __VLS_25 = __VLS_24({
    show: (__VLS_ctx.iosInstallMessage),
    placement: "top-start",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
const { default: __VLS_28 } = __VLS_26.slots;
{
    const { body: __VLS_29 } = __VLS_26.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed top-[20rem] translate-x-1/3 z-20 flex flex-col gap-3 rounded bg-surface-white py-5 drop-shadow-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[20rem]']} */ ;
    /** @type {__VLS_StyleScopedClasses['translate-x-1/3']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1 flex flex-row items-center justify-between px-3 text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-base font-bold text-gray-900" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
    (__VLS_ctx.__('Install Frappe Learning'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-flex items-baseline" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-baseline']} */ ;
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
    FeatherIcon;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onClick': {} },
        name: "x",
        ...{ class: "ml-auto h-4 w-4 text-gray-700" },
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onClick': {} },
        name: "x",
        ...{ class: "ml-auto h-4 w-4 text-gray-700" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.iosInstallMessage = false;
                // @ts-ignore
                [__, iosInstallMessage, iosInstallMessage,];
            } });
    /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    var __VLS_33;
    var __VLS_34;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "px-3 text-xs text-gray-800" },
    });
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex flex-col gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "leading-5" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    (__VLS_ctx.__('Get the app on your iPhone for easy access & a better experience'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-flex items-start whitespace-nowrap" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Tap'));
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
    FeatherIcon;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        name: "share",
        ...{ class: "h-4 w-4 text-blue-600" },
    }));
    const __VLS_39 = __VLS_38({
        name: "share",
        ...{ class: "h-4 w-4 text-blue-600" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__("and then 'Add to Home Screen'"));
    // @ts-ignore
    [__, __, __,];
}
// @ts-ignore
[];
var __VLS_26;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
