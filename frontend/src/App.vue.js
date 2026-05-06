/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { FrappeUIProvider } from 'frappe-ui';
import { Dialogs } from '@/utils/dialogs';
import { computed, onUnmounted, ref } from 'vue';
import { useScreenSize } from './utils/composables';
import { useSettings } from '@/stores/settings';
import { useRouter } from 'vue-router';
import DesktopLayout from './components/DesktopLayout.vue';
import MobileLayout from './components/MobileLayout.vue';
import NoSidebarLayout from './components/NoSidebarLayout.vue';
import InstallPrompt from './components/InstallPrompt.vue';
const { isMobile } = useScreenSize();
const router = useRouter();
const noSidebar = ref(false);
const { settings } = useSettings();
router.beforeEach((to, from, next) => {
    if (to.query.fromLesson || to.path === '/persona') {
        noSidebar.value = true;
    }
    else {
        noSidebar.value = false;
    }
    next();
});
const Layout = computed(() => {
    if (noSidebar.value) {
        return NoSidebarLayout;
    }
    if (isMobile.value) {
        return MobileLayout;
    }
    return DesktopLayout;
});
onUnmounted(() => {
    noSidebar.value = false;
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.FrappeUIProvider | typeof __VLS_components.FrappeUIProvider} */
FrappeUIProvider;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.Layout | typeof __VLS_components.Layout} */
Layout;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ class: "isolate text-base" },
}));
const __VLS_9 = __VLS_8({
    ...{ class: "isolate text-base" },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
/** @type {__VLS_StyleScopedClasses['isolate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
const { default: __VLS_12 } = __VLS_10.slots;
let __VLS_13;
/** @ts-ignore @type { | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view']} */
routerView;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({}));
const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
var __VLS_10;
if (__VLS_ctx.isMobile && !__VLS_ctx.settings.data?.disable_pwa) {
    const __VLS_18 = InstallPrompt;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
    const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
}
let __VLS_23;
/** @ts-ignore @type { | typeof __VLS_components.Dialogs} */
Dialogs;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
const __VLS_25 = __VLS_24({}, ...__VLS_functionalComponentArgsRest(__VLS_24));
// @ts-ignore
[isMobile, settings,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
