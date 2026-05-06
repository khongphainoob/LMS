/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { sessionStore } from '@/stores/session';
import { Dropdown } from 'frappe-ui';
import { useRouter } from 'vue-router';
import { convertToTitleCase } from '@/utils';
import { usersStore } from '@/stores/user';
import { useSettings } from '@/stores/settings';
import { markRaw, watch, ref, onMounted, computed } from 'vue';
import { createDialog } from '@/utils/dialogs';
import Apps from '@/components/Sidebar/Apps.vue';
import Configuration from '@/components/Sidebar/Configuration.vue';
import FrappeCloudIcon from '@/components/Icons/FrappeCloudIcon.vue';
import LMSLogo from '@/components/Icons/LMSLogo.vue';
import SettingsModal from '@/components/Settings/Settings.vue';
import { ChevronDown, LogIn, LogOut, Moon, User, Settings, Sun, Wrench, Zap, } from 'lucide-vue-next';
const router = useRouter();
const { logout, branding } = sessionStore();
let { userResource } = usersStore();
const settingsStore = useSettings();
let { isLoggedIn } = sessionStore();
const showSettingsModal = ref(false);
const theme = ref('light');
const frappeCloudBaseEndpoint = 'https://frappecloud.com';
const $dialog = createDialog;
const props = defineProps({
    isCollapsed: {
        type: Boolean,
        default: false,
    },
});
onMounted(() => {
    theme.value = localStorage.getItem('theme') || 'light';
    if (['light', 'dark'].includes(theme.value)) {
        document.documentElement.setAttribute('data-theme', theme.value);
    }
});
watch(() => settingsStore.isSettingsOpen, (value) => {
    showSettingsModal.value = value;
});
const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    theme.value = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme.value);
    localStorage.setItem('theme', theme.value);
};
const userDropdownOptions = computed(() => {
    return [
        {
            group: '',
            items: [
                {
                    icon: User,
                    label: __('My Profile'),
                    onClick: () => {
                        router.push(`/user/${userResource.data?.username}`);
                    },
                    condition: () => {
                        return isLoggedIn;
                    },
                },
                {
                    icon: theme.value === 'light' ? Moon : Sun,
                    label: __('Toggle Theme'),
                    onClick: () => {
                        toggleTheme();
                    },
                },
                {
                    component: markRaw(Apps),
                    condition: () => {
                        let cookies = new URLSearchParams(document.cookie.split('; ').join('&'));
                        let system_user = cookies.get('system_user');
                        if (system_user === 'yes')
                            return true;
                        else
                            return false;
                    },
                },
                {
                    icon: Settings,
                    label: __('Settings'),
                    onClick: () => {
                        settingsStore.isSettingsOpen = true;
                    },
                    condition: () => {
                        return userResource.data?.is_moderator;
                    },
                },
                {
                    label: __('Configuration'),
                    icon: Wrench,
                    submenu: [
                        {
                            component: markRaw(Configuration),
                        },
                    ],
                    condition: () => {
                        return userResource.data?.is_moderator;
                    },
                },
                {
                    icon: FrappeCloudIcon,
                    label: __('Login to Frappe Cloud'),
                    onClick: () => {
                        $dialog({
                            title: __('Login to Frappe Cloud?'),
                            message: __('Are you sure you want to login to your Frappe Cloud dashboard?'),
                            actions: [
                                {
                                    label: __('Confirm'),
                                    variant: 'solid',
                                    onClick(close) {
                                        loginToFrappeCloud();
                                        close();
                                    },
                                },
                            ],
                        });
                    },
                    condition: () => {
                        return (userResource.data?.is_system_manager &&
                            userResource.data?.is_fc_site);
                    },
                },
                {
                    icon: LogOut,
                    label: __('Log out'),
                    onClick: () => {
                        logout.submit().then(() => {
                            isLoggedIn = false;
                        });
                    },
                    condition: () => {
                        return isLoggedIn;
                    },
                },
                {
                    icon: LogIn,
                    label: __('Log in'),
                    onClick: () => {
                        window.location.href = '/login';
                    },
                    condition: () => {
                        return !isLoggedIn;
                    },
                },
            ],
        },
    ];
});
const loginToFrappeCloud = () => {
    let redirect_to = '/dashboard/sites/' + userResource.data.sitename;
    window.open(`${frappeCloudBaseEndpoint}${redirect_to}`, '_blank');
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
    ...{ class: "p-2" },
});
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Dropdown | typeof __VLS_components.Dropdown} */
Dropdown;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    options: (__VLS_ctx.userDropdownOptions),
}));
const __VLS_2 = __VLS_1({
    options: (__VLS_ctx.userDropdownOptions),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { default: __VLS_6 } = __VLS_3.slots;
    const [{ open, close }] = __VLS_vSlot(__VLS_6);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "flex h-12 py-2 items-center rounded-md duration-300 ease-in-out" },
        ...{ class: (__VLS_ctx.isCollapsed
                ? 'px-0 w-auto'
                : open
                    ? 'bg-surface-white shadow-sm px-2 w-52'
                    : 'hover:bg-surface-gray-3 px-2 w-52') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
    if (__VLS_ctx.branding.data?.banner_image) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.branding.data?.banner_image.file_url),
            ...{ class: "w-8 h-8 rounded flex-shrink-0" },
        });
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    }
    else {
        const __VLS_7 = LMSLogo;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            ...{ class: "w-8 h-8 rounded flex-shrink-0" },
        }));
        const __VLS_9 = __VLS_8({
            ...{ class: "w-8 h-8 rounded flex-shrink-0" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-1 flex-col text-left duration-300 ease-in-out" },
        ...{ class: (__VLS_ctx.isCollapsed
                ? 'opacity-0 ml-0 w-0 overflow-hidden'
                : 'opacity-100 ml-2 w-auto') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base font-medium text-ink-gray-9 leading-none" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
    if (__VLS_ctx.branding.data?.app_name && __VLS_ctx.branding.data?.app_name != 'Frappe') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.branding.data?.app_name);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Learning'));
    }
    if (__VLS_ctx.userResource.data) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-1 text-sm text-ink-gray-7 leading-none" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
        (__VLS_ctx.convertToTitleCase(__VLS_ctx.userResource.data?.full_name));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "duration-300 ease-in-out" },
        ...{ class: (__VLS_ctx.isCollapsed
                ? 'opacity-0 ml-0 w-0 overflow-hidden'
                : 'opacity-100 ml-2 w-auto') },
    });
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.ChevronDown} */
    ChevronDown;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        ...{ class: "h-4 w-4 text-ink-gray-7" },
    }));
    const __VLS_14 = __VLS_13({
        ...{ class: "h-4 w-4 text-ink-gray-7" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    // @ts-ignore
    [userDropdownOptions, isCollapsed, isCollapsed, isCollapsed, branding, branding, branding, branding, branding, __, userResource, userResource, convertToTitleCase,];
    __VLS_3.slots['' /* empty slot name completion */];
}
// @ts-ignore
[];
var __VLS_3;
if (__VLS_ctx.userResource.data?.is_moderator) {
    const __VLS_17 = SettingsModal;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        modelValue: (__VLS_ctx.showSettingsModal),
    }));
    const __VLS_19 = __VLS_18({
        modelValue: (__VLS_ctx.showSettingsModal),
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
}
// @ts-ignore
[userResource, showSettingsModal,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        isCollapsed: {
            type: Boolean,
            default: false,
        },
    },
});
export default {};
