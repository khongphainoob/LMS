/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { getSidebarLinks } from '@/utils';
import { useRouter } from 'vue-router';
import { call } from 'frappe-ui';
import { watch, ref, onMounted, computed } from 'vue';
import { sessionStore } from '@/stores/session';
import { useSettings } from '@/stores/settings';
import { usersStore } from '@/stores/user';
import * as icons from 'lucide-vue-next';
const { logout, user } = sessionStore();
let { isLoggedIn } = sessionStore();
const { sidebarSettings } = useSettings();
const router = useRouter();
let { userResource } = usersStore();
const sidebarLinks = ref(getSidebarLinks());
const otherLinks = ref([]);
const showMenu = ref(false);
const menu = ref(null);
const isModerator = ref(false);
const isInstructor = ref(false);
onMounted(() => {
    sidebarSettings.reload({}, {
        onSuccess(data) {
            destructureSidebarLinks();
            filterLinksToShow(data);
            addOtherLinks();
        },
    });
});
const handleOutsideClick = (e) => {
    if (menu.value && !menu.value.contains(e.target)) {
        showMenu.value = false;
    }
};
watch(showMenu, (val) => {
    if (val) {
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 0);
    }
    else {
        document.removeEventListener('click', handleOutsideClick);
    }
});
const destructureSidebarLinks = () => {
    let links = [];
    sidebarLinks.value.forEach((link) => {
        link.items?.forEach((item) => {
            links.push(item);
        });
    });
    sidebarLinks.value = links;
};
const filterLinksToShow = (data) => {
    Object.keys(data).forEach((key) => {
        if (!parseInt(data[key])) {
            sidebarLinks.value = sidebarLinks.value.filter((link) => link.label.toLowerCase().split(' ').join('_') !== key);
        }
    });
};
const addOtherLinks = () => {
    if (user) {
        otherLinks.value.push({
            action: 'notifications',
            label: __('Notifications'),
            icon: 'Bell',
            to: 'Notifications',
        });
        otherLinks.value.push({
            action: 'profile',
            label: __('Profile'),
            icon: 'UserRound',
        });
        otherLinks.value.push({
            action: 'logout',
            label: __('Log out'),
            icon: 'LogOut',
        });
    }
    else {
        otherLinks.value.push({
            action: 'login',
            label: __('Log in'),
            icon: 'LogIn',
        });
    }
};
watch(userResource, () => {
    if (userResource.data) {
        isModerator.value = userResource.data.is_moderator;
        isInstructor.value = userResource.data.is_instructor;
        addPrograms();
        if (isModerator.value || isInstructor.value) {
            addProgrammingExercises();
            addQuizzes();
            addAssignments();
        }
    }
});
const addQuizzes = () => {
    otherLinks.value.push({
        label: __('Quizzes'),
        icon: 'CircleHelp',
        to: 'Quizzes',
    });
};
const addAssignments = () => {
    otherLinks.value.push({
        label: __('Assignments'),
        icon: 'Pencil',
        to: 'Assignments',
    });
};
const addProgrammingExercises = () => {
    otherLinks.value.push({
        label: __('Programming Exercises'),
        icon: 'Code',
        to: 'ProgrammingExercises',
    });
};
const addPrograms = async () => {
    let canAddProgram = await checkIfCanAddProgram();
    if (!canAddProgram)
        return;
    let activeFor = ['Programs', 'ProgramDetail'];
    let index = 1;
    sidebarLinks.value.splice(index, 0, {
        label: __('Programs'),
        icon: 'Route',
        to: 'Programs',
        activeFor: activeFor,
    });
};
const checkIfCanAddProgram = async () => {
    if (isModerator.value || isInstructor.value) {
        return true;
    }
    const programs = await call('lms.lms.utils.get_programs');
    return programs.enrolled.length > 0 || programs.published.length > 0;
};
let isActive = (tab) => {
    return tab.activeFor?.includes(router.currentRoute.value.name);
};
const handleClick = (tab) => {
    if (tab.action == 'login')
        window.location.href = '/login';
    else if (tab.action == 'logout')
        logout.submit().then(() => {
            isLoggedIn = false;
        });
    else if (tab.action == 'profile')
        router.push({
            name: 'Profile',
            params: {
                username: userResource.data?.username,
            },
        });
    else
        router.push({ name: tab.to });
};
const isVisible = (tab) => {
    if (tab.action == 'login')
        return !isLoggedIn;
    else if (tab.action == 'logout')
        return isLoggedIn;
    else
        return true;
};
const toggleMenu = () => {
    showMenu.value = !showMenu.value;
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex h-full flex-col relative bg-surface-white" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fixed top-0 left-0 w-full flex items-center justify-between px-4 py-3 border-b border-outline-gray-2 bg-surface-white z-20 shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg font-semibold text-ink-gray-9 tracking-tight" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleMenu) },
    ...{ class: "p-1 transition active:scale-95" },
});
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
const __VLS_0 = (__VLS_ctx.icons['Menu']);
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "h-6 w-6 stroke-1.5 text-ink-gray-9" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-6 w-6 stroke-1.5 text-ink-gray-9" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "h-full pt-[60px]" },
    id: "scrollContainer",
});
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-[60px]']} */ ;
var __VLS_5 = {};
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative z-50" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
if (__VLS_ctx.showMenu) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showMenu))
                    return;
                __VLS_ctx.showMenu = false;
                // @ts-ignore
                [toggleMenu, icons, showMenu, showMenu,];
            } },
        ...{ class: "fixed inset-0 bg-ink-gray-9/30 backdrop-blur-sm transition-opacity" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-gray-9/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fixed top-0 right-0 h-full w-[280px] bg-surface-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col" },
    ...{ class: (__VLS_ctx.showMenu ? 'translate-x-0' : 'translate-x-full') },
    ref: "menu",
});
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[280px]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between p-4 border-b border-outline-gray-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "font-medium text-lg text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showMenu = false;
            // @ts-ignore
            [showMenu, showMenu,];
        } },
    ...{ class: "p-1 transition active:scale-95" },
});
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
const __VLS_7 = (__VLS_ctx.icons['X']);
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ class: "h-6 w-6 stroke-1.5 text-ink-gray-7" },
}));
const __VLS_9 = __VLS_8({
    ...{ class: "h-6 w-6 stroke-1.5 text-ink-gray-7" },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 overflow-y-auto px-4 py-4 space-y-1" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
for (const [tab] of __VLS_vFor((__VLS_ctx.sidebarLinks))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleClick(tab);
                __VLS_ctx.showMenu = false;
                ;
                // @ts-ignore
                [icons, showMenu, sidebarLinks, handleClick,];
            } },
        key: (tab.label),
        ...{ class: "flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer transition-colors" },
        ...{ class: (__VLS_ctx.isActive(tab) ? 'bg-surface-gray-2 text-ink-gray-9 font-medium' : 'text-ink-gray-7 hover:bg-surface-gray-1') },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.isVisible(tab)) }, null, null);
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    const __VLS_12 = (__VLS_ctx.icons[tab.icon]);
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        ...{ class: "h-5 w-5 stroke-1.5" },
        ...{ class: (__VLS_ctx.isActive(tab) ? 'text-ink-gray-9' : 'text-ink-gray-5') },
    }));
    const __VLS_14 = __VLS_13({
        ...{ class: "h-5 w-5 stroke-1.5" },
        ...{ class: (__VLS_ctx.isActive(tab) ? 'text-ink-gray-9' : 'text-ink-gray-5') },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (tab.label);
    // @ts-ignore
    [icons, isActive, isActive, isVisible,];
}
if (__VLS_ctx.otherLinks.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-px bg-outline-gray-2 my-4" },
    });
    /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-4']} */ ;
}
for (const [link] of __VLS_vFor((__VLS_ctx.otherLinks))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleClick(link);
                __VLS_ctx.showMenu = false;
                ;
                // @ts-ignore
                [showMenu, handleClick, otherLinks, otherLinks,];
            } },
        key: (link.label),
        ...{ class: "flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer text-ink-gray-7 hover:bg-surface-gray-1 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    const __VLS_17 = (__VLS_ctx.icons[link.icon]);
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        ...{ class: "h-5 w-5 stroke-1.5 text-ink-gray-5" },
    }));
    const __VLS_19 = __VLS_18({
        ...{ class: "h-5 w-5 stroke-1.5 text-ink-gray-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (link.label);
    // @ts-ignore
    [icons,];
}
// @ts-ignore
var __VLS_6 = __VLS_5;
// @ts-ignore
[];
const __VLS_base = (await import('vue')).defineComponent({});
const __VLS_export = {};
export default {};
