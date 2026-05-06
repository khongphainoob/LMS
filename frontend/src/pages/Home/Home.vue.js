/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, inject, onMounted, ref } from 'vue';
import { call, createResource, TabButtons, usePageMeta, } from 'frappe-ui';
import { sessionStore } from '@/stores/session';
import { useSettings } from '@/stores/settings';
import StudentHome from '@/pages/Home/StudentHome.vue';
import AdminHome from '@/pages/Home/AdminHome.vue';
import Streak from '@/pages/Home/Streak.vue';
import MiniCalendar from '@/components/MiniCalendar.vue';
import UpcomingEvents from '@/components/UpcomingEvents.vue';
import { Search } from 'lucide-vue-next';
const user = inject('$user');
const { brand } = sessionStore();
const settingsStore = useSettings();
const evalCount = ref(0);
const currentTab = ref('instructor');
const showStreakModal = ref(false);
const openSearch = () => {
    settingsStore.isCommandPaletteOpen = true;
};
onMounted(() => {
    call('frappe.client.get_count', {
        doctype: 'LMS Certificate Request',
        filters: {
            member: user?.data?.name,
            status: 'Upcoming',
            date: ['>=', inject('$dayjs')().format('YYYY-MM-DD')],
        },
    }).then((data) => {
        evalCount.value = data;
    });
});
const isAdmin = computed(() => {
    return (user.data?.is_moderator ||
        user.data?.is_instructor ||
        user.data?.is_evaluator);
});
const myLiveClasses = createResource({
    url: 'lms.lms.api.get_my_live_classes',
    auto: !isAdmin.value ? true : false,
});
const adminLiveClasses = createResource({
    url: 'lms.lms.api.get_admin_live_classes',
    auto: isAdmin.value ? true : false,
});
const adminEvals = createResource({
    url: 'lms.lms.api.get_admin_evals',
    auto: isAdmin.value ? true : false,
});
const streakInfo = createResource({
    url: 'lms.lms.api.get_streak_info',
    auto: true,
});
// Events for right sidebar - picks the correct data based on role/tab
const currentEvents = computed(() => {
    if (isAdmin.value && currentTab.value === 'instructor') {
        return adminEvals.data || [];
    }
    return [];
});
const currentLiveClasses = computed(() => {
    if (isAdmin.value && currentTab.value === 'instructor') {
        return adminLiveClasses.data || [];
    }
    return myLiveClasses.data || [];
});
const subtitle = computed(() => {
    if (isAdmin.value) {
        let liveClassSuffix = adminLiveClasses.data?.length > 1 ? __('live classes') : __('live class');
        let evalSuffix = adminEvals.data?.length > 1 ? __('evaluations') : __('evaluation');
        if (adminLiveClasses.data?.length > 0 && adminEvals.data?.length > 0) {
            return __('You have {0} upcoming {1} and {2} {3} scheduled.').format(adminLiveClasses.data.length, liveClassSuffix, adminEvals.data.length, evalSuffix);
        }
        else if (adminLiveClasses.data?.length > 0) {
            return __('You have {0} upcoming {1}.').format(adminLiveClasses.data.length, liveClassSuffix);
        }
        else if (adminEvals.data?.length > 0) {
            return __('You have {0} {1} scheduled.').format(adminEvals.data.length, evalSuffix);
        }
        return __('Manage your courses and batches at a glance');
    }
    else {
        let liveClassSuffix = myLiveClasses.data?.length > 1 ? __('live classes') : __('live class');
        let evalSuffix = evalCount.value > 1 ? __('evaluations') : __('evaluation');
        if (myLiveClasses.data?.length > 0 && evalCount.value > 0) {
            return __('You have {0} upcoming {1} and {2} {3} scheduled.').format(myLiveClasses.data.length, liveClassSuffix, evalCount.value, evalSuffix);
        }
        else if (myLiveClasses.data?.length > 0) {
            return __('You have {0} upcoming {1}.').format(myLiveClasses.data.length, liveClassSuffix);
        }
        else if (evalCount.value > 0) {
            return __('You have {0} {1} scheduled.').format(evalCount.value, evalSuffix);
        }
        return __('Resume where you left off');
    }
});
const tabs = [
    { label: __('Student'), value: 'student' },
    { label: __('Instructor'), value: 'instructor' },
];
usePageMeta(() => {
    return {
        title: __('Home'),
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
    ...{ class: "flex flex-col h-full" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-5 py-3 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-xl font-bold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Dashboard'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.openSearch();
            // @ts-ignore
            [__, openSearch,];
        } },
    ...{ class: "flex items-center gap-2 bg-surface-gray-1 rounded-lg px-3 py-1.5 text-sm text-ink-gray-5 cursor-pointer hover:bg-surface-gray-2 transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-gray-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Search} */
Search;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-4 stroke-1.5" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-4 stroke-1.5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "hidden sm:inline" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
(__VLS_ctx.__('Search'));
if (typeof __VLS_ctx.navigator !== 'undefined') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.kbd, __VLS_intrinsics.kbd)({
        ...{ class: "hidden sm:inline-flex items-center gap-0.5 rounded border border-outline-gray-2 bg-surface-white px-1.5 py-0.5 text-[10px] font-medium text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.navigator.platform?.includes('Mac') ? '&#8984;' : 'Ctrl');
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-1 min-h-0" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 px-5 pt-5 pb-10 min-w-0" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-2 mb-6" },
});
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-bold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Hey'));
(__VLS_ctx.user.data?.full_name);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
if (__VLS_ctx.isAdmin) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
    TabButtons;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        modelValue: (__VLS_ctx.currentTab),
        buttons: (__VLS_ctx.tabs),
    }));
    const __VLS_7 = __VLS_6({
        modelValue: (__VLS_ctx.currentTab),
        buttons: (__VLS_ctx.tabs),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isAdmin))
                    return;
                __VLS_ctx.showStreakModal = true;
                // @ts-ignore
                [__, __, navigator, navigator, user, isAdmin, currentTab, tabs, showStreakModal,];
            } },
        ...{ class: "bg-surface-amber-2 px-2 py-1 rounded-md cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-amber-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.streakInfo.data?.current_streak);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg text-ink-gray-6 leading-6" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
(__VLS_ctx.subtitle);
if (__VLS_ctx.isAdmin && __VLS_ctx.currentTab === 'instructor') {
    const __VLS_10 = AdminHome;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        liveClasses: (__VLS_ctx.adminLiveClasses),
        evals: (__VLS_ctx.adminEvals),
    }));
    const __VLS_12 = __VLS_11({
        liveClasses: (__VLS_ctx.adminLiveClasses),
        evals: (__VLS_ctx.adminEvals),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
}
else {
    const __VLS_15 = StudentHome;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        myLiveClasses: (__VLS_ctx.myLiveClasses),
    }));
    const __VLS_17 = __VLS_16({
        myLiveClasses: (__VLS_ctx.myLiveClasses),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hidden lg:flex flex-col w-72 xl:w-80 border-l border-outline-gray-1 p-4 gap-5 flex-shrink-0 overflow-y-auto" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['w-72']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:w-80']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['border-outline-gray-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
const __VLS_20 = MiniCalendar;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_25 = UpcomingEvents;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    evaluations: (__VLS_ctx.currentEvents),
    liveClasses: (__VLS_ctx.currentLiveClasses),
}));
const __VLS_27 = __VLS_26({
    evaluations: (__VLS_ctx.currentEvents),
    liveClasses: (__VLS_ctx.currentLiveClasses),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const __VLS_30 = Streak;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.showStreakModal),
    streakInfo: (__VLS_ctx.streakInfo),
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.showStreakModal),
    streakInfo: (__VLS_ctx.streakInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
// @ts-ignore
[isAdmin, currentTab, showStreakModal, streakInfo, streakInfo, subtitle, adminLiveClasses, adminEvals, myLiveClasses, currentEvents, currentLiveClasses,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
