/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { getSidebarLinks } from '@/utils';
import { usersStore } from '@/stores/user';
import { sessionStore } from '@/stores/session';
import { useSidebar } from '@/stores/sidebar';
import { useSettings } from '@/stores/settings';
import { Button, call, createResource, Tooltip, toast } from 'frappe-ui';
import PageModal from '@/components/Modals/PageModal.vue';
import LMSLogo from '@/components/Icons/LMSLogo.vue';
import { useRouter } from 'vue-router';
import { ref, onMounted, inject, watch, computed, reactive, markRaw, h, onUnmounted, } from 'vue';
import { BookOpen, CircleAlert, ChevronRight, Plus, CircleHelp, FolderTree, FileText, UserPlus, Users, BookText, Zap, } from 'lucide-vue-next';
import { TrialBanner, HelpModal, GettingStartedBanner, useOnboarding, showHelpModal, minimize, IntermediateStepModal, useTelemetry, } from 'frappe-ui/frappe';
import InviteIcon from '@/components/Icons/InviteIcon.vue';
import UserDropdown from '@/components/Sidebar/UserDropdown.vue';
import CollapseSidebar from '@/components/Icons/CollapseSidebar.vue';
import SidebarLink from '@/components/Sidebar/SidebarLink.vue';
import CommandPalette from '@/components/CommandPalette/CommandPalette.vue';
const { user } = sessionStore();
const { userResource } = usersStore();
let sidebarStore = useSidebar();
const socket = inject('$socket');
const unreadCount = ref(0);
const sidebarLinks = ref(null);
const { capture } = useTelemetry();
const showPageModal = ref(false);
const isModerator = ref(false);
const isInstructor = ref(false);
const pageToEdit = ref(null);
const { sidebarSettings, activeTab, isSettingsOpen, programs } = useSettings();
const settingsStore = useSettings();
const showOnboarding = ref(false);
const showIntermediateModal = ref(false);
const currentStep = ref({});
const router = useRouter();
let onboardingDetails;
let isOnboardingStepsCompleted = false;
const readOnlyMode = window.read_only_mode;
const iconProps = {
    strokeWidth: 1.5,
    width: 16,
    height: 16,
};
onMounted(() => {
    setUpOnboarding();
    addKeyboardShortcut();
    updateSidebarLinks();
    socket.on('publish_lms_notifications', (data) => {
        unreadNotifications.reload();
    });
});
const updateSidebarLinksVisibility = () => {
    sidebarSettings.reload({}, {
        onSuccess(data) {
            Object.keys(data).forEach((key) => {
                if (!parseInt(data[key])) {
                    sidebarLinks.value.forEach((link) => {
                        link.items = link.items.filter((item) => item.label.toLowerCase().split(' ').join('_') !== key);
                    });
                }
            });
        },
    });
};
const addKeyboardShortcut = () => {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'k' &&
            (e.ctrlKey || e.metaKey) &&
            !e.target.classList.contains('ProseMirror')) {
            toggleCommandPalette();
            e.preventDefault();
        }
    });
};
const toggleCommandPalette = () => {
    settingsStore.isCommandPaletteOpen = !settingsStore.isCommandPaletteOpen;
};
const unreadNotifications = createResource({
    cache: 'Unread Notifications Count',
    url: 'frappe.client.get_count',
    makeParams(values) {
        return {
            doctype: 'Notification Log',
            filters: {
                for_user: user,
                read: 0,
            },
        };
    },
    onSuccess(data) {
        unreadCount.value = data;
        updateUnreadCount();
    },
    auto: user ? true : false,
});
const updateUnreadCount = () => {
    sidebarLinks.value?.forEach((link) => {
        link.items.forEach((item) => {
            if (item.label === 'Notifications') {
                item.count = unreadCount.value || 0;
            }
        });
    });
};
const openPageModal = (link) => {
    showPageModal.value = true;
    pageToEdit.value = link;
};
const deletePage = (link) => {
    call('lms.lms.api.delete_documents', {
        doctype: 'LMS Sidebar Item',
        documents: [link.name],
    }).then(() => {
        sidebarSettings.reload();
        toast.success(__('Page deleted successfully'));
    });
};
const toggleSidebar = () => {
    sidebarStore.isSidebarCollapsed = !sidebarStore.isSidebarCollapsed;
    localStorage.setItem('isSidebarCollapsed', JSON.stringify(sidebarStore.isSidebarCollapsed));
};
const toggleWebPages = () => {
    sidebarStore.isWebpagesCollapsed = !sidebarStore.isWebpagesCollapsed;
    localStorage.setItem('isWebpagesCollapsed', JSON.stringify(sidebarStore.isWebpagesCollapsed));
};
const getFirstCourse = async () => {
    let firstCourse = localStorage.getItem('firstCourse');
    if (firstCourse)
        return firstCourse;
    return await call('lms.lms.onboarding.get_first_course');
};
const getFirstBatch = async () => {
    let firstBatch = localStorage.getItem('firstBatch');
    if (firstBatch)
        return firstBatch;
    return await call('lms.lms.onboarding.get_first_batch');
};
const steps = reactive([
    {
        name: 'create_first_course',
        title: __('Create your first course'),
        icon: markRaw(h(BookOpen, iconProps)),
        completed: false,
        onClick: () => {
            minimize.value = true;
            router.push({
                name: 'Courses',
            });
        },
    },
    {
        name: 'create_first_chapter',
        title: __('Add your first chapter'),
        icon: markRaw(h(FolderTree, iconProps)),
        completed: false,
        dependsOn: 'create_first_course',
        onClick: async () => {
            minimize.value = true;
            let course = await getFirstCourse();
            if (course) {
                router.push({
                    name: 'CourseDetail',
                    params: { courseName: course },
                    hash: '#settings',
                });
            }
            else {
                router.push({ name: 'Courses', query: { newCourse: '1' } });
            }
        },
    },
    {
        name: 'create_first_lesson',
        title: __('Add your first lesson'),
        icon: markRaw(h(FileText, iconProps)),
        completed: false,
        dependsOn: 'create_first_chapter',
        onClick: async () => {
            minimize.value = true;
            let course = await getFirstCourse();
            if (course) {
                router.push({
                    name: 'CourseDetail',
                    params: { courseName: course },
                    hash: '#settings',
                });
            }
            else {
                router.push({ name: 'Courses', query: { newCourse: '1' } });
            }
        },
    },
    {
        name: 'create_first_quiz',
        title: __('Create your first quiz'),
        icon: markRaw(h(CircleHelp, iconProps)),
        completed: false,
        dependsOn: 'create_first_course',
        onClick: () => {
            minimize.value = true;
            router.push({ name: 'Quizzes' });
        },
    },
    {
        name: 'invite_students',
        title: __('Invite your team and students'),
        icon: markRaw(h(InviteIcon, iconProps)),
        completed: false,
        onClick: () => {
            minimize.value = true;
            activeTab.value = 'Members';
            isSettingsOpen.value = true;
        },
    },
    {
        name: 'create_first_batch',
        title: __('Create your first batch'),
        icon: markRaw(h(Users, iconProps)),
        completed: false,
        onClick: () => {
            minimize.value = true;
            router.push({ name: 'Batches' });
        },
    },
    {
        name: 'add_batch_student',
        title: __('Add students to your batch'),
        icon: markRaw(h(UserPlus, iconProps)),
        completed: false,
        dependsOn: 'create_first_batch',
        onClick: async () => {
            minimize.value = true;
            let batch = await getFirstBatch();
            if (batch) {
                router.push({
                    name: 'Batch',
                    params: {
                        batchName: batch,
                    },
                });
            }
            else {
                router.push({ name: 'Batch' });
            }
        },
    },
    {
        name: 'add_batch_course',
        title: __('Add courses to your batch'),
        icon: markRaw(h(BookText, iconProps)),
        completed: false,
        dependsOn: 'create_first_batch',
        onClick: async () => {
            minimize.value = true;
            let batch = await getFirstBatch();
            if (batch) {
                router.push({
                    name: 'Batch',
                    params: {
                        batchName: batch,
                    },
                    hash: '#courses',
                });
            }
            else {
                router.push({ name: 'Batch' });
            }
        },
    },
]);
const articles = ref([
    {
        title: __('Introduction'),
        opened: false,
        subArticles: [
            { name: 'introduction', title: __('Introduction') },
            { name: 'setting-up', title: __('Setting up') },
        ],
    },
    {
        title: __('Creating a course'),
        opened: false,
        subArticles: [
            { name: 'create-a-course', title: __('Create a course') },
            { name: 'add-a-chapter', title: __('Add a chapter') },
            { name: 'add-a-lesson', title: __('Add a lesson') },
        ],
    },
    {
        title: __('Creating a batch'),
        opened: false,
        subArticles: [
            { name: 'create-a-batch', title: __('Create a batch') },
            { name: 'create-a-live-class', title: __('Create a live class') },
        ],
    },
    {
        title: __('Learning Paths'),
        opened: false,
        subArticles: [{ name: 'add-a-program', title: __('Add a program') }],
    },
    {
        title: __('Assessments'),
        opened: false,
        subArticles: [
            { name: 'quizzes', title: __('Quizzes') },
            { name: 'assignments', title: __('Assignments') },
        ],
    },
    {
        title: __('Certification'),
        opened: false,
        subArticles: [
            { name: 'issue-a-certificate', title: __('Issue a Certificate') },
            {
                name: 'custom-certificate-templates',
                title: __('Custom Certificate Templates'),
            },
        ],
    },
    {
        title: __('Monetization'),
        opened: false,
        subArticles: [
            {
                name: 'setting-up-payment-gateway',
                title: __('Setting up payment gateway'),
            },
        ],
    },
    {
        title: __('Settings'),
        opened: false,
        subArticles: [{ name: 'roles', title: __('Roles') }],
    },
]);
const setUpOnboarding = () => {
    if (userResource.data?.is_system_manager) {
        onboardingDetails = useOnboarding('learning');
        onboardingDetails.setUp(steps);
        isOnboardingStepsCompleted = onboardingDetails.isOnboardingStepsCompleted;
        showOnboarding.value = true;
    }
};
watch(userResource, async () => {
    await userResource.promise;
    if (userResource.data) {
        isModerator.value = userResource.data.is_moderator;
        isInstructor.value = userResource.data.is_instructor;
        await programs.reload();
        setUpOnboarding();
    }
    updateSidebarLinks();
});
watch(settingsStore.settings, () => {
    updateSidebarLinks();
});
const updateSidebarLinks = () => {
    sidebarLinks.value = getSidebarLinks();
    updateSidebarLinksVisibility();
};
const redirectToWebsite = () => {
    window.open('https://frappe.io/learning', '_blank');
};
onUnmounted(() => {
    socket.off('publish_lms_notifications');
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex h-full flex-col justify-between transition-all duration-300 ease-in-out border-r border-border bg-surface-menu-bar shadow-[2px_0_12px_rgba(0,0,0,0.03)] z-20" },
    ...{ class: (__VLS_ctx.sidebarStore.isSidebarCollapsed ? 'w-[60px]' : 'w-64') },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-menu-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-[2px_0_12px_rgba(0,0,0,0.03)]']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col overflow-hidden" },
    ...{ class: (__VLS_ctx.sidebarStore.isSidebarCollapsed ? 'items-center' : '') },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
const __VLS_0 = UserDropdown;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    isCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
}));
const __VLS_2 = __VLS_1({
    isCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (__VLS_ctx.sidebarSettings.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    for (const [link] of __VLS_vFor((__VLS_ctx.sidebarLinks))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mx-2 my-2.5" },
        });
        /** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['my-2.5']} */ ;
        if (!link.hideLabel) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mb-2 mt-3 flex cursor-pointer gap-1.5 px-1 text-base font-medium text-ink-gray-5 transition-all duration-300 ease-in-out" },
            });
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__(link.label));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        for (const [item] of __VLS_vFor((link.items))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            const __VLS_5 = SidebarLink;
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                link: (item),
                isCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
            }));
            const __VLS_7 = __VLS_6({
                link: (item),
                isCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            // @ts-ignore
            [sidebarStore, sidebarStore, sidebarStore, sidebarStore, sidebarSettings, sidebarLinks, __,];
        }
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.sidebarSettings.data?.web_pages?.length || __VLS_ctx.isModerator) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.toggleWebPages) },
        ...{ class: "flex items-center justify-between pr-2 cursor-pointer" },
        ...{ class: (__VLS_ctx.sidebarStore.isSidebarCollapsed ? 'pl-3' : 'pl-4') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    if (!__VLS_ctx.sidebarStore.isSidebarCollapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center text-sm text-ink-gray-5 my-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "grid h-5 w-6 flex-shrink-0 place-items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['place-items-center']} */ ;
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.ChevronRight} */
        ChevronRight;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            ...{ class: "h-4 w-4 stroke-1.5 text-ink-gray-9 transition-all duration-300 ease-in-out" },
            ...{ class: ({ 'rotate-90': !__VLS_ctx.sidebarStore.isWebpagesCollapsed }) },
        }));
        const __VLS_12 = __VLS_11({
            ...{ class: "h-4 w-4 stroke-1.5 text-ink-gray-9 transition-all duration-300 ease-in-out" },
            ...{ class: ({ 'rotate-90': !__VLS_ctx.sidebarStore.isWebpagesCollapsed }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
        /** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "ml-2" },
        });
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        (__VLS_ctx.__('More'));
    }
    if (__VLS_ctx.isModerator && !__VLS_ctx.readOnlyMode) {
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_17 = __VLS_16({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        let __VLS_20;
        const __VLS_21 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.sidebarSettings.data?.web_pages?.length || __VLS_ctx.isModerator))
                        return;
                    if (!(__VLS_ctx.isModerator && !__VLS_ctx.readOnlyMode))
                        return;
                    __VLS_ctx.openPageModal();
                    // @ts-ignore
                    [sidebarStore, sidebarStore, sidebarStore, sidebarSettings, __, isModerator, isModerator, toggleWebPages, readOnlyMode, openPageModal,];
                } });
        const { default: __VLS_22 } = __VLS_18.slots;
        {
            const { icon: __VLS_23 } = __VLS_18.slots;
            let __VLS_24;
            /** @ts-ignore @type { | typeof __VLS_components.Plus} */
            Plus;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
                ...{ class: "h-4 w-4 text-ink-gray-7 stroke-1.5" },
            }));
            const __VLS_26 = __VLS_25({
                ...{ class: "h-4 w-4 text-ink-gray-7 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_18;
        var __VLS_19;
    }
    if (__VLS_ctx.sidebarSettings.data?.web_pages?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col transition-all duration-300 ease-in-out" },
            ...{ class: (!__VLS_ctx.sidebarStore.isWebpagesCollapsed ? 'block' : 'hidden') },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
        for (const [link] of __VLS_vFor((__VLS_ctx.sidebarSettings.data.web_pages))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mx-2 my-0.5" },
            });
            /** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['my-0.5']} */ ;
            const __VLS_29 = SidebarLink;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                ...{ 'onOpenModal': {} },
                ...{ 'onDeletePage': {} },
                link: (link),
                isCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
                showControls: (__VLS_ctx.isModerator ? true : false),
            }));
            const __VLS_31 = __VLS_30({
                ...{ 'onOpenModal': {} },
                ...{ 'onDeletePage': {} },
                link: (link),
                isCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
                showControls: (__VLS_ctx.isModerator ? true : false),
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
            let __VLS_34;
            const __VLS_35 = ({ openModal: {} },
                { onOpenModal: (__VLS_ctx.openPageModal) });
            const __VLS_36 = ({ deletePage: {} },
                { onDeletePage: (__VLS_ctx.deletePage) });
            var __VLS_32;
            var __VLS_33;
            // @ts-ignore
            [sidebarStore, sidebarStore, sidebarSettings, sidebarSettings, isModerator, openPageModal, deletePage,];
        }
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "m-2 flex flex-col gap-1" },
});
/** @type {__VLS_StyleScopedClasses['m-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
if (__VLS_ctx.readOnlyMode && !__VLS_ctx.sidebarStore.isSidebarCollapsed) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "z-10 m-2 bg-surface-modal py-2.5 px-3 text-xs text-ink-gray-7 leading-5 rounded-md" },
    });
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['m-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    (__VLS_ctx.__('This site is being updated. You will not be able to make any changes. Full access will be restored shortly.'));
}
if (__VLS_ctx.userResource.data?.is_system_manager && __VLS_ctx.userResource.data?.is_fc_site) {
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.TrialBanner} */
    TrialBanner;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        isSidebarCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
    }));
    const __VLS_39 = __VLS_38({
        isSidebarCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
}
if (__VLS_ctx.showOnboarding && !__VLS_ctx.isOnboardingStepsCompleted) {
    let __VLS_42;
    /** @ts-ignore @type { | typeof __VLS_components.GettingStartedBanner} */
    GettingStartedBanner;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        isSidebarCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
        appName: "learning",
    }));
    const __VLS_44 = __VLS_43({
        isSidebarCollapsed: (__VLS_ctx.sidebarStore.isSidebarCollapsed),
        appName: "learning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center mt-4" },
    ...{ class: (__VLS_ctx.sidebarStore.isSidebarCollapsed ? 'flex-col space-y-3' : 'flex-row') },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center flex-1" },
    ...{ class: (__VLS_ctx.sidebarStore.isSidebarCollapsed
            ? 'flex-col space-y-3'
            : 'flex-row space-x-3') },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
if (__VLS_ctx.readOnlyMode && __VLS_ctx.sidebarStore.isSidebarCollapsed) {
    let __VLS_47;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({}));
    const __VLS_49 = __VLS_48({}, ...__VLS_functionalComponentArgsRest(__VLS_48));
    const { default: __VLS_52 } = __VLS_50.slots;
    let __VLS_53;
    /** @ts-ignore @type { | typeof __VLS_components.CircleAlert} */
    CircleAlert;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        ...{ class: "size-4 stroke-1.5 text-ink-gray-7 cursor-pointer" },
    }));
    const __VLS_55 = __VLS_54({
        ...{ class: "size-4 stroke-1.5 text-ink-gray-7 cursor-pointer" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    {
        const { body: __VLS_58 } = __VLS_50.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "max-w-[30ch] rounded bg-surface-gray-7 px-2 py-1 text-center text-p-xs text-ink-white shadow-xl" },
        });
        /** @type {__VLS_StyleScopedClasses['max-w-[30ch]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-p-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
        (__VLS_ctx.__('This site is being updated. You will not be able to make any changes. Full access will be restored shortly.'));
        // @ts-ignore
        [sidebarStore, sidebarStore, sidebarStore, sidebarStore, sidebarStore, sidebarStore, __, __, readOnlyMode, readOnlyMode, userResource, userResource, showOnboarding, isOnboardingStepsCompleted,];
    }
    // @ts-ignore
    [];
    var __VLS_50;
}
let __VLS_59;
/** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
Tooltip;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    text: (__VLS_ctx.__('Powered by Learning')),
}));
const __VLS_61 = __VLS_60({
    text: (__VLS_ctx.__('Powered by Learning')),
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
const { default: __VLS_64 } = __VLS_62.slots;
let __VLS_65;
/** @ts-ignore @type { | typeof __VLS_components.Zap} */
Zap;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    ...{ 'onClick': {} },
    ...{ class: "size-4 stroke-1.5 text-ink-gray-7 cursor-pointer" },
}));
const __VLS_67 = __VLS_66({
    ...{ 'onClick': {} },
    ...{ class: "size-4 stroke-1.5 text-ink-gray-7 cursor-pointer" },
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
let __VLS_70;
const __VLS_71 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.redirectToWebsite();
            // @ts-ignore
            [__, redirectToWebsite,];
        } });
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
var __VLS_68;
var __VLS_69;
// @ts-ignore
[];
var __VLS_62;
if (__VLS_ctx.showOnboarding) {
    let __VLS_72;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        text: (__VLS_ctx.__('Help')),
    }));
    const __VLS_74 = __VLS_73({
        text: (__VLS_ctx.__('Help')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    const { default: __VLS_77 } = __VLS_75.slots;
    let __VLS_78;
    /** @ts-ignore @type { | typeof __VLS_components.CircleHelp} */
    CircleHelp;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
        ...{ 'onClick': {} },
        ...{ class: "size-4 stroke-1.5 text-ink-gray-7 cursor-pointer" },
    }));
    const __VLS_80 = __VLS_79({
        ...{ 'onClick': {} },
        ...{ class: "size-4 stroke-1.5 text-ink-gray-7 cursor-pointer" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    let __VLS_83;
    const __VLS_84 = ({ click: {} },
        { onClick: (() => {
                __VLS_ctx.showHelpModal = __VLS_ctx.minimize ? true : !__VLS_ctx.showHelpModal;
                __VLS_ctx.minimize = !__VLS_ctx.showHelpModal;
            }) });
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    var __VLS_81;
    var __VLS_82;
    // @ts-ignore
    [__, showOnboarding, showHelpModal, showHelpModal, showHelpModal, minimize, minimize,];
    var __VLS_75;
}
let __VLS_85;
/** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
Tooltip;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    text: (__VLS_ctx.sidebarStore.isSidebarCollapsed ? __VLS_ctx.__('Expand') : __VLS_ctx.__('Collapse')),
}));
const __VLS_87 = __VLS_86({
    text: (__VLS_ctx.sidebarStore.isSidebarCollapsed ? __VLS_ctx.__('Expand') : __VLS_ctx.__('Collapse')),
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
const { default: __VLS_90 } = __VLS_88.slots;
const __VLS_91 = CollapseSidebar;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
    ...{ 'onClick': {} },
    ...{ class: "size-4 text-ink-gray-7 duration-300 stroke-1.5 ease-in-out cursor-pointer" },
    ...{ class: ({
            '[transform:rotateY(180deg)]': __VLS_ctx.sidebarStore.isSidebarCollapsed,
        }) },
}));
const __VLS_93 = __VLS_92({
    ...{ 'onClick': {} },
    ...{ class: "size-4 text-ink-gray-7 duration-300 stroke-1.5 ease-in-out cursor-pointer" },
    ...{ class: ({
            '[transform:rotateY(180deg)]': __VLS_ctx.sidebarStore.isSidebarCollapsed,
        }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
let __VLS_96;
const __VLS_97 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.toggleSidebar();
            // @ts-ignore
            [sidebarStore, sidebarStore, __, __, toggleSidebar,];
        } });
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['[transform:rotateY(180deg)]']} */ ;
var __VLS_94;
var __VLS_95;
// @ts-ignore
[];
var __VLS_88;
if (__VLS_ctx.showOnboarding && __VLS_ctx.showHelpModal) {
    let __VLS_98;
    /** @ts-ignore @type { | typeof __VLS_components.HelpModal} */
    HelpModal;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
        modelValue: (__VLS_ctx.showHelpModal),
        articles: (__VLS_ctx.articles),
        appName: "learning",
        title: "Frappe Learning",
        logo: (LMSLogo),
        afterSkip: ((step) => __VLS_ctx.capture('onboarding_step_skipped_' + step)),
        afterSkipAll: (() => __VLS_ctx.capture('onboarding_steps_skipped')),
        afterReset: ((step) => __VLS_ctx.capture('onboarding_step_reset_' + step)),
        afterResetAll: (() => __VLS_ctx.capture('onboarding_steps_reset')),
        docsLink: "https://docs.frappe.io/learning",
    }));
    const __VLS_100 = __VLS_99({
        modelValue: (__VLS_ctx.showHelpModal),
        articles: (__VLS_ctx.articles),
        appName: "learning",
        title: "Frappe Learning",
        logo: (LMSLogo),
        afterSkip: ((step) => __VLS_ctx.capture('onboarding_step_skipped_' + step)),
        afterSkipAll: (() => __VLS_ctx.capture('onboarding_steps_skipped')),
        afterReset: ((step) => __VLS_ctx.capture('onboarding_step_reset_' + step)),
        afterResetAll: (() => __VLS_ctx.capture('onboarding_steps_reset')),
        docsLink: "https://docs.frappe.io/learning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
}
let __VLS_103;
/** @ts-ignore @type { | typeof __VLS_components.IntermediateStepModal} */
IntermediateStepModal;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
    modelValue: (__VLS_ctx.showIntermediateModal),
    currentStep: (__VLS_ctx.currentStep),
}));
const __VLS_105 = __VLS_104({
    modelValue: (__VLS_ctx.showIntermediateModal),
    currentStep: (__VLS_ctx.currentStep),
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
const __VLS_108 = CommandPalette;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.settingsStore.isCommandPaletteOpen),
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.settingsStore.isCommandPaletteOpen),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
const __VLS_113 = PageModal;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    modelValue: (__VLS_ctx.showPageModal),
    reloadSidebar: (__VLS_ctx.sidebarSettings),
    page: (__VLS_ctx.pageToEdit),
}));
const __VLS_115 = __VLS_114({
    modelValue: (__VLS_ctx.showPageModal),
    reloadSidebar: (__VLS_ctx.sidebarSettings),
    page: (__VLS_ctx.pageToEdit),
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
// @ts-ignore
[sidebarSettings, showOnboarding, showHelpModal, showHelpModal, articles, capture, capture, capture, capture, showIntermediateModal, currentStep, settingsStore, showPageModal, pageToEdit,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
