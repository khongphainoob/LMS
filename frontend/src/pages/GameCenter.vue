<template>
	<div>
		<header
			class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5"
		>
			<Breadcrumbs class="h-7" :items="breadcrumbs" />
			<button
				v-if="activeGame"
				@click="closeGame"
				class="flex items-center gap-1 text-sm text-ink-blue-4 hover:text-ink-blue-5 transition-colors"
			>
				<ArrowLeft class="size-4" />
				{{ __("Back") }}
			</button>
		</header>

		<div class="p-4 sm:p-5">
			<TabButtons
				v-if="!activeGame"
				v-model="activeTab"
				:buttons="[
					{ label: __('Overview'), value: 'overview' },
					{ label: __('Games'), value: 'games' },
					{ label: __('Leaderboard'), value: 'leaderboard' },
					{ label: __('Badges'), value: 'badges' },
				]"
				class="w-fit mb-5"
			/>

			<template v-if="activeGame">
				<component :is="activeGame.component" />
			</template>

			<!-- ========== OVERVIEW ========== -->
			<div v-else-if="activeTab === 'overview'" class="space-y-5">
				<!-- Hero Card -->
				<div class="border border-outline-gray-2 bg-gradient-to-br from-surface-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 rounded-2xl shadow-sm p-5 sm:p-6">
					<div class="flex items-center gap-5">
						<div class="relative flex-shrink-0">
							<svg class="size-24 sm:size-28" viewBox="0 0 100 100">
								<circle cx="50" cy="50" r="42" fill="none" stroke-width="6" class="stroke-outline-gray-2" />
								<circle cx="50" cy="50" r="42" fill="none" stroke-width="6" stroke-linecap="round"
									class="transition-all duration-1000"
									:stroke="xpPercent >= 100 ? '#f59e0b' : '#3b82f6'"
									:stroke-dasharray="circumference"
									:stroke-dashoffset="circumference - (Math.min(xpPercent, 100) / 100) * circumference"
									transform="rotate(-90 50 50)" />
							</svg>
							<div class="absolute inset-0 flex flex-col items-center justify-center">
								<span class="text-xl sm:text-2xl font-bold text-ink-gray-9">{{ demoProfile.level }}</span>
								<span class="text-[9px] font-medium uppercase tracking-wider text-ink-gray-5">{{ __("Level") }}</span>
							</div>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<h2 class="text-lg font-bold text-ink-gray-9 truncate">{{ demoProfile.member_name }}</h2>
								<span class="text-xs bg-ink-blue-4 text-white px-2 py-0.5 rounded-full font-medium">
									{{ demoProfile.xp }}/{{ demoProfile.xp_to_next }} XP
								</span>
							</div>
							<div class="w-full h-2.5 bg-surface-gray-2 rounded-full overflow-hidden mb-3">
								<div class="h-full rounded-full transition-all duration-700"
									:style="{ width: xpPercent + '%', background: xpPercent >= 100 ? '#f59e0b' : '#3b82f6' }"></div>
							</div>
							<div class="flex flex-wrap gap-x-5 gap-y-1.5">
								<div class="flex items-center gap-1.5 text-sm">
									<Flame class="size-4 text-orange-500" />
									<span class="font-bold text-ink-gray-9">{{ demoProfile.current_streak }}</span>
									<span class="text-ink-gray-5 text-xs">{{ __("day streak") }}</span>
								</div>
								<div class="flex items-center gap-1.5 text-sm">
									<Clock class="size-4 text-ink-blue-4" />
									<span class="font-bold text-ink-gray-9">{{ demoProfile.hours_spent }}h</span>
									<span class="text-ink-gray-5 text-xs">{{ __("learned") }}</span>
								</div>
								<div class="flex items-center gap-1.5 text-sm">
									<Award class="size-4 text-ink-purple-4" />
									<span class="font-bold text-ink-gray-9">{{ demoProfile.total_badges }}/{{ demoProfile.total_available }}</span>
									<span class="text-ink-gray-5 text-xs">{{ __("badges") }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Stat Cards -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div v-for="s in statCards" :key="s.label"
						class="border border-outline-gray-2 bg-surface-white rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
						<div class="size-9 mx-auto mb-2 rounded-lg flex items-center justify-center" :class="s.bgClass">
							<component :is="s.icon" class="size-4" :class="s.iconClass" />
						</div>
						<div class="text-xl font-bold text-ink-gray-9">{{ s.value }}</div>
						<div class="text-[11px] text-ink-gray-5 mt-0.5">{{ s.label }}</div>
					</div>
				</div>

				<!-- Performance Breakdown -->
				<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5">
					<h3 class="text-sm font-semibold text-ink-gray-8 mb-4">{{ __("Performance Breakdown") }}</h3>
					<div class="space-y-4">
						<div v-for="bar in performanceBars" :key="bar.label" class="space-y-1.5">
							<div class="flex items-center justify-between">
								<span class="text-xs text-ink-gray-6 flex items-center gap-1.5">
									<component :is="bar.icon" class="size-3.5" :class="bar.iconClass" />
									{{ bar.label }}
								</span>
								<span class="text-xs font-bold" :class="bar.textClass">{{ bar.value }}%</span>
							</div>
							<div class="w-full h-2.5 bg-surface-gray-2 rounded-full overflow-hidden">
								<div class="h-full rounded-full transition-all duration-700" :class="bar.barClass"
									:style="{ width: bar.value + '%' }"></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Recent Badges + Quick Actions -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5">
						<h3 class="text-sm font-semibold text-ink-gray-8 mb-3">{{ __("Recent Badges") }}</h3>
						<div class="flex gap-3 overflow-x-auto pb-1">
							<div v-for="(b, idx) in demoBadges" :key="idx" class="flex-shrink-0 w-16 text-center">
								<div class="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-2xl"
									:class="b.earned ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-300' : 'bg-surface-gray-2 opacity-40'">
									{{ b.emoji }}
								</div>
								<div class="text-[9px] text-ink-gray-5 mt-1 truncate">{{ b.title }}</div>
							</div>
						</div>
					</div>
					<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5">
						<h3 class="text-sm font-semibold text-ink-gray-8 mb-3">{{ __("Quick Actions") }}</h3>
						<div class="space-y-2">
							<button v-for="a in quickActions" :key="a.label" @click="activeTab = a.tab"
								class="w-full flex items-center gap-3 p-3 rounded-lg transition-colors group"
								:class="a.cardClass">
								<div class="size-8 rounded-lg flex items-center justify-center flex-shrink-0" :class="a.btnClass">
									<component :is="a.icon" class="size-4 text-white" />
								</div>
								<div class="text-left">
									<div class="text-sm font-medium text-ink-gray-9" :class="a.textHover">{{ a.label }}</div>
									<div class="text-[10px] text-ink-gray-5">{{ a.desc }}</div>
								</div>
								<ChevronRight class="size-4 text-ink-gray-4 ml-auto" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- ========== GAMES ========== -->
			<div v-if="!activeGame && activeTab === 'games'" class="space-y-5">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-ink-gray-9">{{ __("Mini Games") }}</h3>
					<span class="text-xs text-ink-gray-5 bg-surface-gray-2 px-2 py-0.5 rounded-full">
						{{ games.length }} {{ __("games available") }}
					</span>
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
					<button v-for="game in games" :key="game.id" @click="openGame(game)"
						class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group">
						<div class="h-24 flex items-center justify-center" :class="game.bgClass">
							<component :is="game.icon" class="size-10 transition-transform duration-300 group-hover:scale-110" :class="game.iconClass" />
						</div>
						<div class="p-3">
							<div class="text-sm font-semibold text-ink-gray-9">{{ game.title }}</div>
							<div class="text-xs text-ink-gray-5 mt-0.5 line-clamp-2">{{ game.description }}</div>
							<div class="mt-2">
								<span class="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded" :class="game.tagClass">{{ game.tag }}</span>
							</div>
						</div>
					</button>
				</div>
			</div>

			<!-- ========== LEADERBOARD ========== -->
			<div v-if="!activeGame && activeTab === 'leaderboard'" class="space-y-4">
				<div class="flex items-center justify-between flex-wrap gap-2">
					<h3 class="font-semibold text-ink-gray-9">{{ __("Leaderboard") }}</h3>
					<select v-model="leaderboardPeriod"
						class="text-xs border border-outline-gray-2 rounded-md px-2 py-1 bg-surface-white text-ink-gray-7 focus:outline-none">
						<option value="all_time">{{ __("All Time") }}</option>
						<option value="weekly">{{ __("This Week") }}</option>
						<option value="monthly">{{ __("This Month") }}</option>
					</select>
				</div>

				<!-- Podium -->
				<div class="border border-outline-gray-2 bg-surface-white rounded-2xl shadow-sm p-5">
					<div class="flex items-end justify-center gap-4 sm:gap-6">
						<div v-for="p in [podiumPlaces[1], podiumPlaces[0], podiumPlaces[2]]" :key="p.rank"
							class="text-center w-1/3">
							<div class="relative inline-block">
								<div class="mx-auto rounded-full flex items-center justify-center font-bold ring-3"
									:class="p.circleClass">
									{{ p.rank }}
								</div>
								<div class="absolute -top-1 -right-1" :class="p.emojiSize">{{ p.medal }}</div>
							</div>
							<div class="mx-auto mt-2 rounded-full bg-surface-gray-3 flex items-center justify-center text-lg"
								:class="p.avatarClass">
								{{ p.avatar }}
							</div>
							<div class="text-xs font-semibold text-ink-gray-8 mt-1.5 truncate max-w-[120px] mx-auto">{{ p.member_name }}</div>
							<div class="font-bold" :class="p.scoreClass">{{ p.composite_score }}</div>
							<div class="text-[10px]" :class="p.subClass">{{ p.sub }}</div>
							<div class="rounded-t-xl mt-2" :class="p.barClass"></div>
						</div>
					</div>
				</div>

				<!-- Your Rank -->
				<div class="border-2 border-ink-blue-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3.5 flex items-center gap-3">
					<div class="w-8 h-8 rounded-full bg-ink-blue-4 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">5</div>
					<div class="w-9 h-9 rounded-full bg-ink-blue-100 dark:bg-ink-blue-900/30 flex items-center justify-center text-sm">&#128105;&#8205;&#127891;</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-bold text-ink-blue-5 truncate">Nguyen Van A <span class="text-[10px] font-normal text-ink-gray-5">{{ __("You") }}</span></div>
						<div class="text-[11px] text-ink-gray-5">65% {{ __("complete") }}</div>
					</div>
					<div class="text-right flex-shrink-0">
						<div class="text-sm font-bold text-ink-blue-5">668</div>
						<div class="text-[10px] text-ink-gray-5">{{ __("pts") }}</div>
					</div>
				</div>

				<!-- Full List -->
				<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden">
					<div v-for="e in demoLeaderboard" :key="e.rank"
						class="flex items-center gap-3 px-4 py-3 hover:bg-surface-gray-1 transition-colors border-b border-outline-gray-1 last:border-b-0"
						:class="{ 'bg-blue-50/30': e.is_you }">
						<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
							:class="getRankClass(e.rank)">{{ e.rank }}</div>
						<div class="w-8 h-8 rounded-full bg-surface-gray-3 flex items-center justify-center text-sm flex-shrink-0">{{ e.avatar }}</div>
						<div class="flex-1 min-w-0">
							<div class="font-medium text-ink-gray-9 truncate text-sm">
								{{ e.member_name }}
								<span v-if="e.is_you" class="text-[10px] text-ink-blue-4 font-normal ml-1">({{ __("You") }})</span>
							</div>
							<div class="text-[11px] text-ink-gray-5">{{ e.completion_pct }}% {{ __("complete") }} &middot; {{ e.streak_days }}d {{ __("streak") }}</div>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="font-bold text-ink-gray-9 text-sm">{{ e.composite_score }}</div>
							<div class="text-[10px] text-ink-gray-5">{{ __("pts") }}</div>
						</div>
					</div>
				</div>
			</div>

			<!-- ========== BADGES ========== -->
			<div v-if="!activeGame && activeTab === 'badges'" class="space-y-4">
				<div class="flex items-center justify-between flex-wrap gap-2">
					<div>
						<h3 class="font-semibold text-ink-gray-9">{{ __("Badge Gallery") }}</h3>
						<p class="text-xs text-ink-gray-5 mt-0.5">{{ earnedBadgeCount }}/{{ demoAllBadges.length }} {{ __("earned") }}</p>
					</div>
					<div class="flex items-center gap-1.5 bg-surface-gray-1 rounded-lg p-0.5">
						<button v-for="f in badgeFilters" :key="f.value" @click="badgeFilter = f.value"
							class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
							:class="badgeFilter === f.value ? 'bg-surface-white shadow-sm text-ink-gray-9' : 'text-ink-gray-5 hover:text-ink-gray-7'">
							{{ f.label }}
						</button>
					</div>
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
					<div v-for="b in filteredBadges" :key="b.name"
						class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
						:class="{ 'opacity-50': !b.earned }">
						<div class="h-28 flex items-center justify-center relative"
							:class="b.earned ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' : 'bg-surface-gray-1'">
							<div class="text-4xl">{{ b.emoji }}</div>
							<div v-if="b.earned" class="absolute top-2 right-2">
								<span class="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium">{{ __("Earned") }}</span>
							</div>
							<div v-if="!b.earned" class="absolute top-2 right-2">
								<span class="text-[10px] bg-surface-gray-2 text-ink-gray-5 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
									<Lock class="size-2.5" /> {{ __("Locked") }}
								</span>
							</div>
						</div>
						<div class="p-3">
							<div class="text-sm font-semibold text-ink-gray-9 truncate">{{ b.title }}</div>
							<div class="text-[11px] text-ink-gray-5 mt-0.5 line-clamp-2">{{ b.description }}</div>
							<div v-if="b.earned && b.issued_on" class="text-[10px] text-ink-green-5 mt-2 font-medium">{{ b.issued_on }}</div>
							<div v-if="!b.earned" class="mt-2">
								<div class="flex items-center justify-between mb-1">
									<span class="text-[10px] text-ink-gray-5">{{ __("Progress") }}</span>
									<span class="text-[10px] text-ink-gray-5">{{ b.progress }}%</span>
								</div>
								<div class="w-full h-1.5 bg-surface-gray-2 rounded-full overflow-hidden">
									<div class="h-full bg-ink-gray-4 rounded-full transition-all" :style="{ width: b.progress + '%' }"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Breadcrumbs, TabButtons, usePageMeta } from "frappe-ui"
import { ref, computed, inject, markRaw } from "vue"
import {
	Trophy, Flame, TrendingUp, Clock, Award, Lock, ArrowLeft,
	Brain, Zap, Gift, Languages, GripVertical,
	Target, FileCheck, BookOpen, Gamepad2, ChevronRight,
} from "lucide-vue-next"
import { sessionStore } from "@/stores/session"
import MemoryMatch from "@/pages/GameCenter/MemoryMatch.vue"
import TimedQuiz from "@/pages/GameCenter/TimedQuiz.vue"
import SpinTheWheel from "@/pages/GameCenter/SpinTheWheel.vue"
import WordScramble from "@/pages/GameCenter/WordScramble.vue"
import DragDropSort from "@/pages/GameCenter/DragDropSort.vue"

import { useRoute, useRouter } from "vue-router"

const { brand } = sessionStore()
const dayjs = inject("$dayjs")
const route = useRoute()
const router = useRouter()

const leaderboardPeriod = ref("all_time")
const badgeFilter = ref("all")
const circumference = 2 * Math.PI * 42

const activeTab = computed({
	get() {
		return route.params.tab || "overview"
	},
	set(val) {
		router.push({ name: "GameCenterTab", params: { tab: val } })
	}
})

const activeGame = computed(() => {
	if (route.name === "GameCenterGame" && route.params.gameId) {
		return games.find((g) => g.id === route.params.gameId) || null
	}
	return null
})

const demoProfile = {
	member_name: "Nguyen Van A", level: 7, xp: 68, xp_to_next: 100,
	total_score: 668, current_streak: 12, hours_spent: 47,
	avg_quiz_score: 85, avg_assignment_score: 78, completion_pct: 65,
	total_courses: 8, completed_courses: 5, total_badges: 6, total_available: 12,
}

const xpPercent = computed(() => (demoProfile.xp / demoProfile.xp_to_next) * 100)

const statCards = [
	{ label: __("Quiz Avg"), value: demoProfile.avg_quiz_score + "%", icon: Target, bgClass: "bg-blue-50 dark:bg-blue-900/20", iconClass: "text-ink-blue-4" },
	{ label: __("Assignment Avg"), value: demoProfile.avg_assignment_score + "%", icon: FileCheck, bgClass: "bg-green-50 dark:bg-green-900/20", iconClass: "text-ink-green-5" },
	{ label: __("Courses Done"), value: demoProfile.completed_courses + "/" + demoProfile.total_courses, icon: BookOpen, bgClass: "bg-purple-50 dark:bg-purple-900/20", iconClass: "text-ink-purple-4" },
	{ label: __("Total Score"), value: demoProfile.total_score, icon: TrendingUp, bgClass: "bg-amber-50 dark:bg-amber-900/20", iconClass: "text-ink-amber-5" },
]

const performanceBars = [
	{ label: __("Quiz Score"), value: demoProfile.avg_quiz_score, icon: Target, iconClass: "text-ink-blue-4", barClass: "bg-ink-blue-4", textClass: "text-ink-blue-5" },
	{ label: __("Assignment Score"), value: demoProfile.avg_assignment_score, icon: FileCheck, iconClass: "text-ink-green-5", barClass: "bg-ink-green-5", textClass: "text-ink-green-5" },
	{ label: __("Course Completion"), value: demoProfile.completion_pct, icon: BookOpen, iconClass: "text-ink-purple-4", barClass: "bg-ink-purple-4", textClass: "text-ink-purple-4" },
	{ label: __("Learning Streak"), value: Math.min(demoProfile.current_streak / 30 * 100, 100), icon: Flame, iconClass: "text-orange-500", barClass: "bg-orange-400", textClass: "text-orange-500" },
	{ label: __("Study Hours"), value: Math.min(demoProfile.hours_spent / 100 * 100, 100), icon: Clock, iconClass: "text-ink-cyan-5", barClass: "bg-ink-cyan-5", textClass: "text-ink-cyan-5" },
]

const demoBadges = [
	{ emoji: "\u{1F3C6}", title: "Top Student", earned: true },
	{ emoji: "\u{1F525}", title: "7-Day Streak", earned: true },
	{ emoji: "\u{1F4DA}", title: "Bookworm", earned: true },
	{ emoji: "\u{26A1}", title: "Speed Demon", earned: true },
	{ emoji: "\u{1F3AF}", title: "Quiz Master", earned: false },
	{ emoji: "\u{1F48E}", title: "Perfect Score", earned: false },
]

const quickActions = [
	{ label: __("Play Games"), tab: "games", desc: __("5 mini-games available"), icon: Gamepad2, btnClass: "bg-ink-blue-4", cardClass: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100", textHover: "group-hover:text-ink-blue-5" },
	{ label: __("Leaderboard"), tab: "leaderboard", desc: __("See your ranking"), icon: Trophy, btnClass: "bg-amber-400", cardClass: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:from-amber-100 hover:to-orange-100", textHover: "group-hover:text-amber-600" },
	{ label: __("All Badges"), tab: "badges", desc: __("Collect them all!"), icon: Award, btnClass: "bg-purple-500", cardClass: "bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 hover:from-purple-100 hover:to-violet-100", textHover: "group-hover:text-purple-600" },
]

const demoLeaderboard = [
	{ rank: 1, member_name: "Tran Thi B", avatar: "\u{1F469}\u{200D}\u{1F393}", composite_score: 520, completion_pct: 92, streak_days: 30 },
	{ rank: 2, member_name: "Le Van C", avatar: "\u{1F468}\u{200D}\u{1F4BB}", composite_score: 480, completion_pct: 85, streak_days: 21 },
	{ rank: 3, member_name: "Pham Thi D", avatar: "\u{1F469}\u{200D}\u{1F52C}", composite_score: 445, completion_pct: 80, streak_days: 18 },
	{ rank: 4, member_name: "Hoang Van E", avatar: "\u{1F468}\u{200D}\u{1F4DA}", composite_score: 420, completion_pct: 75, streak_days: 14 },
	{ rank: 5, member_name: "Nguyen Van A", avatar: "\u{1F468}\u{200D}\u{1F393}", composite_score: 668, completion_pct: 65, streak_days: 12, is_you: true },
	{ rank: 6, member_name: "Vu Thi F", avatar: "\u{1F469}\u{200D}\u{1F680}", composite_score: 350, completion_pct: 60, streak_days: 10 },
	{ rank: 7, member_name: "Bui Van G", avatar: "\u{1F468}\u{200D}\u{1F3AF}", composite_score: 320, completion_pct: 55, streak_days: 7 },
	{ rank: 8, member_name: "Dang Thi H", avatar: "\u{1F469}\u{200D}\u{1F4BB}", composite_score: 295, completion_pct: 50, streak_days: 5 },
]

const podiumPlaces = [
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
]

const demoAllBadges = [
	{ name: "first-lesson", emoji: "\u{1F4DA}", title: "Bookworm", description: __("Complete your first lesson"), earned: true, issued_on: "15 Jan 2026", progress: 0 },
	{ name: "streak-7", emoji: "\u{1F525}", title: "7-Day Streak", description: __("Maintain a 7-day learning streak"), earned: true, issued_on: "22 Jan 2026", progress: 0 },
	{ name: "quiz-100", emoji: "\u{1F3AF}", title: "Quiz Master", description: __("Score 100% on any quiz"), earned: true, issued_on: "01 Feb 2026", progress: 0 },
	{ name: "5-courses", emoji: "\u{1F393}", title: "Scholar", description: __("Complete 5 courses"), earned: true, issued_on: "10 Feb 2026", progress: 0 },
	{ name: "speed-demon", emoji: "\u{26A1}", title: "Speed Demon", description: __("Complete a quiz in under 30 seconds"), earned: true, issued_on: "15 Feb 2026", progress: 0 },
	{ name: "top-student", emoji: "\u{1F3C6}", title: "Top Student", description: __("Reach top 5 on the leaderboard"), earned: true, issued_on: "20 Mar 2026", progress: 0 },
	{ name: "streak-30", emoji: "\u{1F525}", title: "Unstoppable", description: __("Maintain a 30-day learning streak"), earned: false, progress: 40 },
	{ name: "10-courses", emoji: "\u{1F465}", title: "Dedicated Learner", description: __("Enroll in 10 courses"), earned: false, progress: 80 },
	{ name: "all-quiz", emoji: "\u{1F4AA}", title: "Quiz Champion", description: __("Complete all quizzes in a course"), earned: false, progress: 55 },
	{ name: "help-others", emoji: "\u{1F91D}", title: "Team Player", description: __("Help 5 classmates in discussions"), earned: false, progress: 60 },
	{ name: "night-owl", emoji: "\u{1F319}", title: "Night Owl", description: __("Study past midnight 10 times"), earned: false, progress: 30 },
	{ name: "perfect-week", emoji: "\u{2B50}", title: "Perfect Week", description: __("Complete all weekly assignments"), earned: false, progress: 70 },
]

const games = [
	{ id: "memory-match", title: __("Memory Match"), description: __("Flip cards and match pairs to test your memory"), icon: markRaw(Brain), component: markRaw(MemoryMatch), tag: __("Puzzle"), bgClass: "bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20", iconClass: "text-ink-purple-5", tagClass: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
	{ id: "timed-quiz", title: __("Timed Quiz"), description: __("Answer questions before time runs out"), icon: markRaw(Zap), component: markRaw(TimedQuiz), tag: __("Speed"), bgClass: "bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20", iconClass: "text-ink-blue-4", tagClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
	{ id: "spin-wheel", title: __("Spin the Wheel"), description: __("Spin and collect points with luck"), icon: markRaw(Gift), component: markRaw(SpinTheWheel), tag: __("Luck"), bgClass: "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20", iconClass: "text-ink-amber-5", tagClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
	{ id: "word-scramble", title: __("Word Scramble"), description: __("Unscramble letters to find the hidden word"), icon: markRaw(Languages), component: markRaw(WordScramble), tag: __("Word"), bgClass: "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20", iconClass: "text-ink-green-5", tagClass: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
	{ id: "drag-drop", title: __("Drag & Drop"), description: __("Sort items in the correct order"), icon: markRaw(GripVertical), component: markRaw(DragDropSort), tag: __("Sort"), bgClass: "bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20", iconClass: "text-ink-red-4", tagClass: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" },
]

const badgeFilters = [
	{ label: __("All"), value: "all" },
	{ label: __("Earned"), value: "earned" },
	{ label: __("Locked"), value: "locked" },
]

const filteredBadges = computed(() => {
	if (badgeFilter.value === "earned") return demoAllBadges.filter((b) => b.earned)
	if (badgeFilter.value === "locked") return demoAllBadges.filter((b) => !b.earned)
	return demoAllBadges
})

const earnedBadgeCount = computed(() => demoAllBadges.filter((b) => b.earned).length)

function openGame(game) { router.push({ name: 'GameCenterGame', params: { gameId: game.id } }) }
function closeGame() { router.push({ name: 'GameCenterTab', params: { tab: 'overview' } }) }

const breadcrumbs = computed(() => [{ label: __("Game Center"), route: { name: "GameCenter" } }])
usePageMeta(() => ({ title: __("Game Center"), icon: brand.favicon }))

const getRankClass = (rank) => {
	if (rank === 1) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
	if (rank === 2) return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
	if (rank === 3) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
	return "bg-surface-gray-2 text-ink-gray-6"
}
</script>
