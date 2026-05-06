/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, TabButtons, usePageMeta, createResource } from "frappe-ui";
import { ref, computed, inject, markRaw, watch } from "vue";
import { Trophy, Flame, TrendingUp, Clock, Award, Lock, ArrowLeft, Brain, Zap, Gift, Languages, GripVertical, Target, FileCheck, BookOpen, Gamepad2, ChevronRight, } from "lucide-vue-next";
import { sessionStore } from "@/stores/session";
import MemoryMatch from "@/pages/GameCenter/MemoryMatch.vue";
import TimedQuiz from "@/pages/GameCenter/TimedQuiz.vue";
import SpinTheWheel from "@/pages/GameCenter/SpinTheWheel.vue";
import WordScramble from "@/pages/GameCenter/WordScramble.vue";
import DragDropSort from "@/pages/GameCenter/DragDropSort.vue";
import DuckRace from "@/pages/GameCenter/DuckRace.vue";
import FruitNinja from "@/pages/GameCenter/FruitNinja.vue";
const { brand } = sessionStore();
const dayjs = inject("$dayjs");
const activeTab = ref("Overview");
const leaderboardPeriod = ref("all_time");
const activeGame = ref(null);
const badgeFilter = ref("all");
const circumference = 2 * Math.PI * 42;
const profileResource = createResource({
    url: "lms.lms.api.get_user_game_profile",
    auto: true,
});
const badgesResource = createResource({
    url: "lms.lms.api.get_user_badges",
    params: { member: null },
    auto: true,
});
const leaderboardResource = createResource({
    url: "lms.lms.api.get_leaderboard",
    params: { limit: 10, period: leaderboardPeriod.value },
    auto: true,
});
const classGamesResource = createResource({
    url: "lms.lms.api.list_class_games",
    auto: true,
});
const fallbackProfile = {
    member_name: "Nguyen Van A", level: 7, xp: 68, xp_to_next: 100,
    total_score: 668, current_streak: 12, hours_spent: 47,
    avg_quiz_score: 85, avg_assignment_score: 78, completion_pct: 65,
    total_courses: 8, completed_courses: 5, total_badges: 6, total_available: 12,
};
const demoProfile = computed(() => ({ ...fallbackProfile, ...(profileResource.data || {}) }));
const xpPercent = computed(() => (demoProfile.value.xp / demoProfile.value.xp_to_next) * 100);
const statCards = computed(() => [
    { label: __("Quiz Avg"), value: demoProfile.value.avg_quiz_score + "%", icon: Target, bgClass: "bg-blue-50 dark:bg-blue-900/20", iconClass: "text-ink-blue-4" },
    { label: __("Assignment Avg"), value: demoProfile.value.avg_assignment_score + "%", icon: FileCheck, bgClass: "bg-green-50 dark:bg-green-900/20", iconClass: "text-ink-green-5" },
    { label: __("Courses Done"), value: demoProfile.value.completed_courses + "/" + demoProfile.value.total_courses, icon: BookOpen, bgClass: "bg-purple-50 dark:bg-purple-900/20", iconClass: "text-ink-purple-4" },
    { label: __("Total Score"), value: demoProfile.value.total_score, icon: TrendingUp, bgClass: "bg-amber-50 dark:bg-amber-900/20", iconClass: "text-ink-amber-5" },
]);
const performanceBars = computed(() => [
    { label: __("Quiz Score"), value: demoProfile.value.avg_quiz_score, icon: Target, iconClass: "text-ink-blue-4", barClass: "bg-ink-blue-4", textClass: "text-ink-blue-5" },
    { label: __("Assignment Score"), value: demoProfile.value.avg_assignment_score, icon: FileCheck, iconClass: "text-ink-green-5", barClass: "bg-ink-green-5", textClass: "text-ink-green-5" },
    { label: __("Course Completion"), value: demoProfile.value.completion_pct, icon: BookOpen, iconClass: "text-ink-purple-4", barClass: "bg-ink-purple-4", textClass: "text-ink-purple-4" },
    { label: __("Learning Streak"), value: Math.min(demoProfile.value.current_streak / 30 * 100, 100), icon: Flame, iconClass: "text-orange-500", barClass: "bg-orange-400", textClass: "text-orange-500" },
    { label: __("Study Hours"), value: Math.min(demoProfile.value.hours_spent / 100 * 100, 100), icon: Clock, iconClass: "text-ink-cyan-5", barClass: "bg-ink-cyan-5", textClass: "text-ink-cyan-5" },
]);
const badgeEmojiMap = {
    "Bookworm": "📚",
    "7-Day Streak": "🔥",
    "Quiz Master": "🎯",
    "Scholar": "🎓",
    "Speed Demon": "⚡",
    "Top Student": "🏆",
    "Unstoppable": "🔥",
    "Dedicated Learner": "👥",
    "Quiz Champion": "📋",
    "Team Player": "🤝",
    "Night Owl": "🌙",
    "Perfect Week": "⭐",
};
const demoBadges = computed(() => {
    const badges = badgesResource.data || [];
    if (!badges.length) {
        return [
            { emoji: "🏆", title: "Top Student", earned: true },
            { emoji: "🔥", title: "7-Day Streak", earned: true },
        ];
    }
    return badges.map((b) => ({
        emoji: badgeEmojiMap[b.title] || "🏅",
        title: b.title,
        description: b.description,
        earned: b.earned,
        issued_on: b.issued_on,
        progress: b.progress || 0,
    }));
});
const games = computed(() => {
    const apiGames = classGamesResource.data || [];
    if (!apiGames.length) {
        return [
            { id: "memory-match", title: __("Memory Match"), description: __("Flip cards and match pairs to test your memory"), icon: markRaw(Brain), component: markRaw(MemoryMatch), tag: __("Puzzle"), bgClass: "bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20", iconClass: "text-ink-purple-5", tagClass: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
            { id: "timed-quiz", title: __("Timed Quiz"), description: __("Answer questions before time runs out"), icon: markRaw(Zap), component: markRaw(TimedQuiz), tag: __("Speed"), bgClass: "bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20", iconClass: "text-ink-blue-4", tagClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
        ];
    }
    const componentMap = {
        memory_match: markRaw(MemoryMatch),
        timed_quiz: markRaw(TimedQuiz),
        spin_wheel: markRaw(SpinTheWheel),
        word_scramble: markRaw(WordScramble),
        drag_drop: markRaw(DragDropSort),
    };
    return apiGames.map((game) => ({
        id: game.name,
        classGame: game.name,
        title: game.game_details?.title || game.game,
        description: game.game_details?.game_type || game.game,
        icon: markRaw(Gamepad2),
        component: componentMap[game.game_details?.game_type] || markRaw(MemoryMatch),
        tag: game.game_details?.delivery_mode || __("Game"),
        bgClass: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
        iconClass: "text-ink-blue-4",
        tagClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    }));
});
const quickActions = [
    { label: __("Play Games"), tab: "Games", desc: __("7 mini-games available"), icon: Gamepad2, btnClass: "bg-ink-blue-4", cardClass: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100", textHover: "group-hover:text-ink-blue-5" },
    { label: __("Leaderboard"), tab: "Leaderboard", desc: __("See your ranking"), icon: Trophy, btnClass: "bg-amber-400", cardClass: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:from-amber-100 hover:to-orange-100", textHover: "group-hover:text-amber-600" },
    { label: __("All Badges"), tab: "Badges", desc: __("Collect them all!"), icon: Award, btnClass: "bg-purple-500", cardClass: "bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 hover:from-purple-100 hover:to-violet-100", textHover: "group-hover:text-purple-600" },
];
const demoLeaderboard = computed(() => leaderboardResource.data || [
    { rank: 1, member_name: "Tran Thi B", avatar: "\u{1F469}\u{200D}\u{1F393}", composite_score: 520, completion_pct: 92, streak_days: 30 },
    { rank: 2, member_name: "Le Van C", avatar: "\u{1F468}\u{200D}\u{1F4BB}", composite_score: 480, completion_pct: 85, streak_days: 21 },
    { rank: 3, member_name: "Pham Thi D", avatar: "\u{1F469}\u{200D}\u{1F52C}", composite_score: 445, completion_pct: 80, streak_days: 18 },
    { rank: 4, member_name: "Hoang Van E", avatar: "\u{1F468}\u{200D}\u{1F4DA}", composite_score: 420, completion_pct: 75, streak_days: 14 },
    { rank: 5, member_name: "Nguyen Van A", avatar: "\u{1F468}\u{200D}\u{1F393}", composite_score: 668, completion_pct: 65, streak_days: 12, is_you: true },
    { rank: 6, member_name: "Vu Thi F", avatar: "\u{1F469}\u{200D}\u{1F680}", composite_score: 350, completion_pct: 60, streak_days: 10 },
    { rank: 7, member_name: "Bui Van G", avatar: "\u{1F468}\u{200D}\u{1F3AF}", composite_score: 320, completion_pct: 55, streak_days: 7 },
    { rank: 8, member_name: "Dang Thi H", avatar: "\u{1F469}\u{200D}\u{1F4BB}", composite_score: 295, completion_pct: 50, streak_days: 5 },
]);
const podiumPlaces = computed(() => [
    { rank: 1, member_name: "Tran Thi B", avatar: "\u{1F469}\u{200D}\u{1F393}", composite_score: 520, medal: "\u{1F451}",
        circleClass: "w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-400 text-xl ring-amber-400",
        avatarClass: "w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-amber-400",
        scoreClass: "text-base text-amber-500", subClass: "text-[10px] text-amber-600 font-medium", sub: __("Champion"),
        emojiSize: "text-2xl -top-2 -right-1",
        barClass: "h-24 sm:h-28 bg-gradient-to-t from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/10",
    },
    { rank: 2, member_name: "Le Van C", avatar: "\u{1F468}\u{200D}\u{1F4BB}", composite_score: 480, medal: "\u{1F948}",
        circleClass: "w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-lg ring-gray-300 dark:ring-gray-600",
        avatarClass: "w-10 h-10 sm:w-12 sm:h-12",
        scoreClass: "text-sm font-bold text-ink-gray-9", subClass: "text-[10px] text-ink-gray-5", sub: __("pts"),
        emojiSize: "text-lg -top-1 -right-1",
        barClass: "h-16 sm:h-20 bg-gray-100 dark:bg-gray-800",
    },
    { rank: 3, member_name: "Pham Thi D", avatar: "\u{1F469}\u{200D}\u{1F52C}", composite_score: 445, medal: "\u{1F949}",
        circleClass: "w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-lg ring-orange-300 dark:ring-orange-700",
        avatarClass: "w-10 h-10 sm:w-12 sm:h-12",
        scoreClass: "text-sm font-bold text-ink-gray-9", subClass: "text-[10px] text-ink-gray-5", sub: __("pts"),
        emojiSize: "text-lg -top-1 -right-1",
        barClass: "h-12 sm:h-16 bg-orange-50 dark:bg-orange-900/20",
    },
]);
const demoAllBadges = computed(() => demoBadges.value.length ? demoBadges.value : [
    { name: "first-lesson", emoji: "📚", title: "Bookworm", description: __("Complete your first lesson"), earned: true, issued_on: "15 Jan 2026", progress: 0 },
    { name: "streak-7", emoji: "🔥", title: "7-Day Streak", description: __("Maintain a 7-day learning streak"), earned: true, issued_on: "22 Jan 2026", progress: 0 },
    { name: "quiz-100", emoji: "🎯", title: "Quiz Master", description: __("Score 100% on any quiz"), earned: true, issued_on: "01 Feb 2026", progress: 0 },
    { name: "5-courses", emoji: "🎓", title: "Scholar", description: __("Complete 5 courses"), earned: true, issued_on: "10 Feb 2026", progress: 0 },
    { name: "speed-demon", emoji: "⚡", title: "Speed Demon", description: __("Complete a quiz in under 30 seconds"), earned: true, issued_on: "15 Feb 2026", progress: 0 },
    { name: "top-student", emoji: "🏆", title: "Top Student", description: __("Reach top 5 on the leaderboard"), earned: true, issued_on: "20 Mar 2026", progress: 0 },
    { name: "streak-30", emoji: "🔥", title: "Unstoppable", description: __("Maintain a 30-day learning streak"), earned: false, progress: 40 },
    { name: "10-courses", emoji: "👥", title: "Dedicated Learner", description: __("Enroll in 10 courses"), earned: false, progress: 80 },
    { name: "all-quiz", emoji: "📋", title: "Quiz Champion", description: __("Complete all quizzes in a course"), earned: false, progress: 55 },
    { name: "help-others", emoji: "🤝", title: "Team Player", description: __("Help 5 classmates in discussions"), earned: false, progress: 60 },
    { name: "night-owl", emoji: "🌙", title: "Night Owl", description: __("Study past midnight 10 times"), earned: false, progress: 30 },
    { name: "perfect-week", emoji: "⭐", title: "Perfect Week", description: __("Complete all weekly assignments"), earned: false, progress: 70 },
]);
const badgeFilters = [
    { label: __("All"), value: "all" },
    { label: __("Earned"), value: "earned" },
    { label: __("Locked"), value: "locked" },
];
const filteredBadges = computed(() => {
    if (badgeFilter.value === "earned")
        return demoAllBadges.value.filter((b) => b.earned);
    if (badgeFilter.value === "locked")
        return demoAllBadges.value.filter((b) => !b.earned);
    return demoAllBadges.value;
});
const earnedBadgeCount = computed(() => demoAllBadges.value.filter((b) => b.earned).length);
watch(leaderboardPeriod, (period) => {
    leaderboardResource.update({ params: { limit: 10, period } });
    leaderboardResource.reload();
});
function openGame(game) { activeGame.value = game; }
function closeGame() { activeGame.value = null; }
function onGameCompleted() {
    profileResource.reload();
    leaderboardResource.reload();
    badgesResource.reload();
    closeGame();
}
const breadcrumbs = computed(() => [{ label: __("Game Center"), route: { name: "GameCenter" } }]);
usePageMeta(() => ({ title: __("Game Center"), icon: brand.favicon }));
const getRankClass = (rank) => {
    if (rank === 1)
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (rank === 2)
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
    if (rank === 3)
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-surface-gray-2 text-ink-gray-6";
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
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
    ...{ class: "h-7" },
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-7" },
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
if (__VLS_ctx.activeGame) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeGame) },
        ...{ class: "flex items-center gap-1 text-sm text-ink-blue-4 hover:text-ink-blue-5 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-ink-blue-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.ArrowLeft} */
    ArrowLeft;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ class: "size-4" },
    }));
    const __VLS_7 = __VLS_6({
        ...{ class: "size-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    (__VLS_ctx.__("Back"));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-4 sm:p-5" },
});
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:p-5']} */ ;
if (!__VLS_ctx.activeGame) {
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
    TabButtons;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        modelValue: (__VLS_ctx.activeTab),
        buttons: ([
            { label: __VLS_ctx.__('Overview') },
            { label: __VLS_ctx.__('Games') },
            { label: __VLS_ctx.__('Leaderboard') },
            { label: __VLS_ctx.__('Badges') },
        ]),
        ...{ class: "w-fit mb-5" },
    }));
    const __VLS_12 = __VLS_11({
        modelValue: (__VLS_ctx.activeTab),
        buttons: ([
            { label: __VLS_ctx.__('Overview') },
            { label: __VLS_ctx.__('Games') },
            { label: __VLS_ctx.__('Leaderboard') },
            { label: __VLS_ctx.__('Badges') },
        ]),
        ...{ class: "w-fit mb-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
}
if (__VLS_ctx.activeGame) {
    const __VLS_15 = (__VLS_ctx.activeGame.component);
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        ...{ 'onCompleted': {} },
        classGame: (__VLS_ctx.activeGame.classGame),
    }));
    const __VLS_17 = __VLS_16({
        ...{ 'onCompleted': {} },
        classGame: (__VLS_ctx.activeGame.classGame),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    let __VLS_20;
    const __VLS_21 = ({ completed: {} },
        { onCompleted: (__VLS_ctx.onGameCompleted) });
    var __VLS_18;
    var __VLS_19;
}
else if (__VLS_ctx.activeTab === 'Overview') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-gradient-to-br from-surface-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 rounded-2xl shadow-sm p-5 sm:p-6" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-blue-50/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:from-gray-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:to-blue-950/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:p-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative flex-shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "size-24 sm:size-28" },
        viewBox: "0 0 100 100",
    });
    /** @type {__VLS_StyleScopedClasses['size-24']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:size-28']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "50",
        cy: "50",
        r: "42",
        fill: "none",
        'stroke-width': "6",
        ...{ class: "stroke-outline-gray-2" },
    });
    /** @type {__VLS_StyleScopedClasses['stroke-outline-gray-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "50",
        cy: "50",
        r: "42",
        fill: "none",
        'stroke-width': "6",
        'stroke-linecap': "round",
        ...{ class: "transition-all duration-1000" },
        stroke: (__VLS_ctx.xpPercent >= 100 ? '#f59e0b' : '#3b82f6'),
        'stroke-dasharray': (__VLS_ctx.circumference),
        'stroke-dashoffset': (__VLS_ctx.circumference - (Math.min(__VLS_ctx.xpPercent, 100) / 100) * __VLS_ctx.circumference),
        transform: "rotate(-90 50 50)",
    });
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-1000']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 flex flex-col items-center justify-center" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl sm:text-2xl font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.demoProfile.level);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] font-medium uppercase tracking-wider text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__("Level"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 min-w-0" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-lg font-bold text-ink-gray-9 truncate" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    (__VLS_ctx.demoProfile.member_name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs bg-ink-blue-4 text-white px-2 py-0.5 rounded-full font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.demoProfile.xp);
    (__VLS_ctx.demoProfile.xp_to_next);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full h-2.5 bg-surface-gray-2 rounded-full overflow-hidden mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-full rounded-full transition-all duration-700" },
        ...{ style: ({ width: __VLS_ctx.xpPercent + '%', background: __VLS_ctx.xpPercent >= 100 ? '#f59e0b' : '#3b82f6' }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-700']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap gap-x-5 gap-y-1.5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-x-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-y-1.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-1.5 text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    let __VLS_22;
    /** @ts-ignore @type { | typeof __VLS_components.Flame} */
    Flame;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        ...{ class: "size-4 text-orange-500" },
    }));
    const __VLS_24 = __VLS_23({
        ...{ class: "size-4 text-orange-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-orange-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.demoProfile.current_streak);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-gray-5 text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.__("day streak"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-1.5 text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    let __VLS_27;
    /** @ts-ignore @type { | typeof __VLS_components.Clock} */
    Clock;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        ...{ class: "size-4 text-ink-blue-4" },
    }));
    const __VLS_29 = __VLS_28({
        ...{ class: "size-4 text-ink-blue-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.demoProfile.hours_spent);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-gray-5 text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.__("learned"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-1.5 text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    let __VLS_32;
    /** @ts-ignore @type { | typeof __VLS_components.Award} */
    Award;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        ...{ class: "size-4 text-ink-purple-4" },
    }));
    const __VLS_34 = __VLS_33({
        ...{ class: "size-4 text-ink-purple-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-purple-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.demoProfile.total_badges);
    (__VLS_ctx.demoProfile.total_available);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-gray-5 text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.__("badges"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 sm:grid-cols-4 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    for (const [s] of __VLS_vFor((__VLS_ctx.statCards))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (s.label),
            ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "size-9 mx-auto mb-2 rounded-lg flex items-center justify-center" },
            ...{ class: (s.bgClass) },
        });
        /** @type {__VLS_StyleScopedClasses['size-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        const __VLS_37 = (s.icon);
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            ...{ class: "size-4" },
            ...{ class: (s.iconClass) },
        }));
        const __VLS_39 = __VLS_38({
            ...{ class: "size-4" },
            ...{ class: (s.iconClass) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xl font-bold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (s.value);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[11px] text-ink-gray-5 mt-0.5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        (s.label);
        // @ts-ignore
        [breadcrumbs, activeGame, activeGame, activeGame, activeGame, activeGame, closeGame, __, __, __, __, __, __, __, __, __, activeTab, activeTab, onGameCompleted, xpPercent, xpPercent, xpPercent, xpPercent, circumference, circumference, circumference, demoProfile, demoProfile, demoProfile, demoProfile, demoProfile, demoProfile, demoProfile, demoProfile, statCards,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-sm font-semibold text-ink-gray-8 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    (__VLS_ctx.__("Performance Breakdown"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    for (const [bar] of __VLS_vFor((__VLS_ctx.performanceBars))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (bar.label),
            ...{ class: "space-y-1.5" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs text-ink-gray-6 flex items-center gap-1.5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        const __VLS_42 = (bar.icon);
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            ...{ class: "size-3.5" },
            ...{ class: (bar.iconClass) },
        }));
        const __VLS_44 = __VLS_43({
            ...{ class: "size-3.5" },
            ...{ class: (bar.iconClass) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        /** @type {__VLS_StyleScopedClasses['size-3.5']} */ ;
        (bar.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs font-bold" },
            ...{ class: (bar.textClass) },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (bar.value);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-full h-2.5 bg-surface-gray-2 rounded-full overflow-hidden" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-full rounded-full transition-all duration-700" },
            ...{ class: (bar.barClass) },
            ...{ style: ({ width: bar.value + '%' }) },
        });
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-700']} */ ;
        // @ts-ignore
        [__, performanceBars,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-sm font-semibold text-ink-gray-8 mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    (__VLS_ctx.__("Recent Badges"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-3 overflow-x-auto pb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
    for (const [b, idx] of __VLS_vFor((__VLS_ctx.demoBadges))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (idx),
            ...{ class: "flex-shrink-0 w-16 text-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-2xl" },
            ...{ class: (b.earned ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-300' : 'bg-surface-gray-2 opacity-40') },
        });
        /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        (b.emoji);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[9px] text-ink-gray-5 mt-1 truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (b.title);
        // @ts-ignore
        [__, demoBadges,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-sm font-semibold text-ink-gray-8 mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    (__VLS_ctx.__("Quick Actions"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    for (const [a] of __VLS_vFor((__VLS_ctx.quickActions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.activeGame))
                        return;
                    if (!(__VLS_ctx.activeTab === 'Overview'))
                        return;
                    __VLS_ctx.activeTab = a.tab;
                    // @ts-ignore
                    [__, activeTab, quickActions,];
                } },
            key: (a.label),
            ...{ class: "w-full flex items-center gap-3 p-3 rounded-lg transition-colors group" },
            ...{ class: (a.cardClass) },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "size-8 rounded-lg flex items-center justify-center flex-shrink-0" },
            ...{ class: (a.btnClass) },
        });
        /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        const __VLS_47 = (a.icon);
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            ...{ class: "size-4 text-white" },
        }));
        const __VLS_49 = __VLS_48({
            ...{ class: "size-4 text-white" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-left" },
        });
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm font-medium text-ink-gray-9" },
            ...{ class: (a.textHover) },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (a.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[10px] text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (a.desc);
        let __VLS_52;
        /** @ts-ignore @type { | typeof __VLS_components.ChevronRight} */
        ChevronRight;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
            ...{ class: "size-4 text-ink-gray-4 ml-auto" },
        }));
        const __VLS_54 = __VLS_53({
            ...{ class: "size-4 text-ink-gray-4 ml-auto" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        // @ts-ignore
        [];
    }
}
if (!__VLS_ctx.activeGame && __VLS_ctx.activeTab === 'Games') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__("Mini Games"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-ink-gray-5 bg-surface-gray-2 px-2 py-0.5 rounded-full" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    (__VLS_ctx.games.length);
    (__VLS_ctx.__("games available"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    for (const [game] of __VLS_vFor((__VLS_ctx.games))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.activeGame && __VLS_ctx.activeTab === 'Games'))
                        return;
                    __VLS_ctx.openGame(game);
                    // @ts-ignore
                    [activeGame, __, __, activeTab, games, games, openGame,];
                } },
            key: (game.id),
            ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:shadow-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-24 flex items-center justify-center" },
            ...{ class: (game.bgClass) },
        });
        /** @type {__VLS_StyleScopedClasses['h-24']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        const __VLS_57 = (game.icon);
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            ...{ class: "size-10 transition-transform duration-300 group-hover:scale-110" },
            ...{ class: (game.iconClass) },
        }));
        const __VLS_59 = __VLS_58({
            ...{ class: "size-10 transition-transform duration-300 group-hover:scale-110" },
            ...{ class: (game.iconClass) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        /** @type {__VLS_StyleScopedClasses['size-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:scale-110']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-3" },
        });
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (game.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs text-ink-gray-5 mt-0.5 line-clamp-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
        (game.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-2" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded" },
            ...{ class: (game.tagClass) },
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        (game.tag);
        // @ts-ignore
        [];
    }
}
if (!__VLS_ctx.activeGame && __VLS_ctx.activeTab === 'Leaderboard') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between flex-wrap gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__("Leaderboard"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.leaderboardPeriod),
        ...{ class: "text-xs border border-outline-gray-2 rounded-md px-2 py-1 bg-surface-white text-ink-gray-7 focus:outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "all_time",
    });
    (__VLS_ctx.__("All Time"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "weekly",
    });
    (__VLS_ctx.__("This Week"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "monthly",
    });
    (__VLS_ctx.__("This Month"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-2xl shadow-sm p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-end justify-center gap-4 sm:gap-6" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:gap-6']} */ ;
    for (const [p] of __VLS_vFor(([__VLS_ctx.podiumPlaces[1], __VLS_ctx.podiumPlaces[0], __VLS_ctx.podiumPlaces[2]]))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (p.rank),
            ...{ class: "text-center w-1/3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-1/3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative inline-block" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mx-auto rounded-full flex items-center justify-center font-bold ring-3" },
            ...{ class: (p.circleClass) },
        });
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-3']} */ ;
        (p.rank);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute -top-1 -right-1" },
            ...{ class: (p.emojiSize) },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['-top-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['-right-1']} */ ;
        (p.medal);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mx-auto mt-2 rounded-full bg-surface-gray-3 flex items-center justify-center text-lg" },
            ...{ class: (p.avatarClass) },
        });
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        (p.avatar);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs font-semibold text-ink-gray-8 mt-1.5 truncate max-w-[120px] mx-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[120px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        (p.member_name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-bold" },
            ...{ class: (p.scoreClass) },
        });
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (p.composite_score);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[10px]" },
            ...{ class: (p.subClass) },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        (p.sub);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rounded-t-xl mt-2" },
            ...{ class: (p.barClass) },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-t-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        // @ts-ignore
        [activeGame, __, __, __, __, activeTab, leaderboardPeriod, podiumPlaces, podiumPlaces, podiumPlaces,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border-2 border-ink-blue-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3.5 flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blue-50/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-blue-900/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-8 h-8 rounded-full bg-ink-blue-4 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-9 h-9 rounded-full bg-ink-blue-100 dark:bg-ink-blue-900/30 flex items-center justify-center text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-ink-blue-900/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 min-w-0" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm font-bold text-ink-blue-5 truncate" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-normal text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__("You"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[11px] text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__("complete"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-right flex-shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm font-bold text-ink-blue-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[10px] text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__("pts"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    for (const [e] of __VLS_vFor((__VLS_ctx.demoLeaderboard))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (e.rank),
            ...{ class: "flex items-center gap-3 px-4 py-3 hover:bg-surface-gray-1 transition-colors border-b border-outline-gray-1 last:border-b-0" },
            ...{ class: ({ 'bg-blue-50/30': e.is_you }) },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['last:border-b-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-blue-50/30']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" },
            ...{ class: (__VLS_ctx.getRankClass(e.rank)) },
        });
        /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        (e.rank);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-8 h-8 rounded-full bg-surface-gray-3 flex items-center justify-center text-sm flex-shrink-0" },
        });
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        (e.avatar);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1 min-w-0" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-medium text-ink-gray-9 truncate text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (e.member_name);
        if (e.is_you) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] text-ink-blue-4 font-normal ml-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-blue-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
            (__VLS_ctx.__("You"));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[11px] text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (e.completion_pct);
        (__VLS_ctx.__("complete"));
        (e.streak_days);
        (__VLS_ctx.__("streak"));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-right flex-shrink-0" },
        });
        /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-bold text-ink-gray-9 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (e.composite_score);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[10px] text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (__VLS_ctx.__("pts"));
        // @ts-ignore
        [__, __, __, __, __, __, __, demoLeaderboard, getRankClass,];
    }
}
if (!__VLS_ctx.activeGame && __VLS_ctx.activeTab === 'Badges') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between flex-wrap gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__("Badge Gallery"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-ink-gray-5 mt-0.5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    (__VLS_ctx.earnedBadgeCount);
    (__VLS_ctx.demoAllBadges.length);
    (__VLS_ctx.__("earned"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-1.5 bg-surface-gray-1 rounded-lg p-0.5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
    for (const [f] of __VLS_vFor((__VLS_ctx.badgeFilters))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.activeGame && __VLS_ctx.activeTab === 'Badges'))
                        return;
                    __VLS_ctx.badgeFilter = f.value;
                    // @ts-ignore
                    [activeGame, __, __, activeTab, earnedBadgeCount, demoAllBadges, badgeFilters, badgeFilter,];
                } },
            key: (f.value),
            ...{ class: "px-2.5 py-1 rounded-md text-xs font-medium transition-colors" },
            ...{ class: (__VLS_ctx.badgeFilter === f.value ? 'bg-surface-white shadow-sm text-ink-gray-9' : 'text-ink-gray-5 hover:text-ink-gray-7') },
        });
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        (f.label);
        // @ts-ignore
        [badgeFilter,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    for (const [b] of __VLS_vFor((__VLS_ctx.filteredBadges))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (b.name),
            ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300" },
            ...{ class: ({ 'opacity-50': !b.earned }) },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-28 flex items-center justify-center relative" },
            ...{ class: (b.earned ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' : 'bg-surface-gray-1') },
        });
        /** @type {__VLS_StyleScopedClasses['h-28']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-4xl" },
        });
        /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
        (b.emoji);
        if (b.earned) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute top-2 right-2" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-green-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (__VLS_ctx.__("Earned"));
        }
        if (!b.earned) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute top-2 right-2" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] bg-surface-gray-2 text-ink-gray-5 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
            let __VLS_62;
            /** @ts-ignore @type { | typeof __VLS_components.Lock} */
            Lock;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                ...{ class: "size-2.5" },
            }));
            const __VLS_64 = __VLS_63({
                ...{ class: "size-2.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            /** @type {__VLS_StyleScopedClasses['size-2.5']} */ ;
            (__VLS_ctx.__("Locked"));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-3" },
        });
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm font-semibold text-ink-gray-9 truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (b.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[11px] text-ink-gray-5 mt-0.5 line-clamp-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
        (b.description);
        if (b.earned && b.issued_on) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-[10px] text-ink-green-5 mt-2 font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-green-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (b.issued_on);
        }
        if (!b.earned) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mt-2" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center justify-between mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] text-ink-gray-5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            (__VLS_ctx.__("Progress"));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] text-ink-gray-5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            (b.progress);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-full h-1.5 bg-surface-gray-2 rounded-full overflow-hidden" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "h-full bg-ink-gray-4 rounded-full transition-all" },
                ...{ style: ({ width: b.progress + '%' }) },
            });
            /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-ink-gray-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        }
        // @ts-ignore
        [__, __, __, filteredBadges,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
