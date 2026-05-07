<template>
	<div class="space-y-5">
		<div class="border border-outline-gray-2 bg-gradient-to-br from-surface-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 rounded-2xl shadow-sm p-5 sm:p-6">
			<div class="flex items-center gap-5">
				<div class="relative flex-shrink-0">
					<svg class="size-24 sm:size-28" viewBox="0 0 100 100">
						<circle cx="50" cy="50" r="42" fill="none" stroke-width="6" class="stroke-outline-gray-2" />
						<circle cx="50" cy="50" r="42" fill="none" stroke-width="6" stroke-linecap="round"
							class="transition-all duration-1000"
							:stroke="profile.level >= 10 ? '#f59e0b' : '#3b82f6'"
							:stroke-dasharray="circumference"
							:stroke-dashoffset="circumference - (Math.min(xpPercent, 100) / 100) * circumference"
							transform="rotate(-90 50 50)" />
					</svg>
					<div class="absolute inset-0 flex flex-col items-center justify-center">
						<span class="text-xl sm:text-2xl font-bold text-ink-gray-9">{{ profile.level }}</span>
						<span class="text-[9px] font-medium uppercase tracking-wider text-ink-gray-5">{{ __("Level") }}</span>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-1">
						<h2 class="text-lg font-bold text-ink-gray-9 truncate">{{ profile.member_name }}</h2>
						<span class="text-xs bg-ink-blue-4 text-white px-2 py-0.5 rounded-full font-medium">{{ profile.xp }}/{{ profile.xp_to_next }} XP</span>
					</div>
					<div class="w-full h-2.5 bg-surface-gray-2 rounded-full overflow-hidden mb-3">
						<div class="h-full rounded-full transition-all duration-700" :style="{ width: xpPercent + '%', background: xpPercent >= 100 ? '#f59e0b' : '#3b82f6' }"></div>
					</div>
					<div class="flex flex-wrap gap-x-5 gap-y-1.5">
						<div class="flex items-center gap-1.5 text-sm"><span class="font-bold text-ink-gray-9">{{ profile.current_streak }}</span><span class="text-ink-gray-5 text-xs">{{ __("day streak") }}</span></div>
						<div class="flex items-center gap-1.5 text-sm"><span class="font-bold text-ink-gray-9">{{ profile.hours_spent }}h</span><span class="text-ink-gray-5 text-xs">{{ __("learned") }}</span></div>
						<div class="flex items-center gap-1.5 text-sm"><span class="font-bold text-ink-gray-9">{{ profile.total_badges }}/{{ profile.total_available }}</span><span class="text-ink-gray-5 text-xs">{{ __("badges") }}</span></div>
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
			<div v-for="s in statCards" :key="s.label" class="border border-outline-gray-2 bg-surface-white rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
				<div class="size-9 mx-auto mb-2 rounded-lg flex items-center justify-center" :class="s.bgClass"><component :is="s.icon" class="size-4" :class="s.iconClass" /></div>
				<div class="text-xl font-bold text-ink-gray-9">{{ s.value }}</div>
				<div class="text-[11px] text-ink-gray-5 mt-0.5">{{ s.label }}</div>
			</div>
		</div>

		<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5">
			<h3 class="text-sm font-semibold text-ink-gray-8 mb-4">{{ __("Performance Breakdown") }}</h3>
			<div class="space-y-4">
				<div v-for="bar in performanceBars" :key="bar.label" class="space-y-1.5">
					<div class="flex items-center justify-between"><span class="text-xs text-ink-gray-6">{{ bar.label }}</span><span class="text-xs font-bold" :class="bar.textClass">{{ bar.value }}%</span></div>
					<div class="w-full h-2.5 bg-surface-gray-2 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-700" :class="bar.barClass" :style="{ width: bar.value + '%' }"></div></div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5">
				<h3 class="text-sm font-semibold text-ink-gray-8 mb-3">{{ __("Recent Badges") }}</h3>
				<div class="flex gap-3 overflow-x-auto pb-1">
					<div v-for="(b, idx) in recentBadges" :key="idx" class="flex-shrink-0 w-16 text-center">
						<div class="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-2xl" :class="b.earned ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-300' : 'bg-surface-gray-2 opacity-40'">{{ b.emoji }}</div>
						<div class="text-[9px] text-ink-gray-5 mt-1 truncate">{{ b.title }}</div>
					</div>
				</div>
			</div>
			<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5">
				<h3 class="text-sm font-semibold text-ink-gray-8 mb-3">{{ __("Quick Actions") }}</h3>
				<div class="space-y-2">
					<button v-for="a in quickActions" :key="a.label" @click="$emit('switch-tab', a.tab)" class="w-full flex items-center gap-3 p-3 rounded-lg transition-colors group" :class="a.cardClass">
						<div class="size-8 rounded-lg flex items-center justify-center flex-shrink-0" :class="a.btnClass"><component :is="a.icon" class="size-4 text-white" /></div>
						<div class="text-left"><div class="text-sm font-medium text-ink-gray-9" :class="a.textHover">{{ a.label }}</div><div class="text-[10px] text-ink-gray-5">{{ a.desc }}</div></div>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, inject } from "vue"
import { Award, BookOpen, Clock, FileCheck, Gamepad2, Target, TrendingUp, Trophy } from "lucide-vue-next"

const props = defineProps({ profile: { type: Object, required: true }, recentBadges: { type: Array, default: () => [] } })
defineEmits(["switch-tab"])
const dayjs = inject("$dayjs")
const circumference = 2 * Math.PI * 42

const xpPercent = computed(() => (props.profile.xp / props.profile.xp_to_next) * 100)
const statCards = computed(() => ([
	{ label: __("Quiz Avg"), value: props.profile.avg_quiz_score + "%", icon: Target, bgClass: "bg-blue-50 dark:bg-blue-900/20", iconClass: "text-ink-blue-4" },
	{ label: __("Assignment Avg"), value: props.profile.avg_assignment_score + "%", icon: FileCheck, bgClass: "bg-green-50 dark:bg-green-900/20", iconClass: "text-ink-green-5" },
	{ label: __("Courses Done"), value: props.profile.completed_courses + "/" + props.profile.total_courses, icon: BookOpen, bgClass: "bg-purple-50 dark:bg-purple-900/20", iconClass: "text-ink-purple-4" },
	{ label: __("Total Score"), value: props.profile.total_score, icon: TrendingUp, bgClass: "bg-amber-50 dark:bg-amber-900/20", iconClass: "text-ink-amber-5" },
]))
const performanceBars = computed(() => ([
	{ label: __("Quiz Score"), value: props.profile.avg_quiz_score, iconClass: "text-ink-blue-4", barClass: "bg-ink-blue-4", textClass: "text-ink-blue-5" },
	{ label: __("Assignment Score"), value: props.profile.avg_assignment_score, iconClass: "text-ink-green-5", barClass: "bg-ink-green-5", textClass: "text-ink-green-5" },
	{ label: __("Course Completion"), value: props.profile.completion_pct, iconClass: "text-ink-purple-4", barClass: "bg-ink-purple-4", textClass: "text-ink-purple-4" },
	{ label: __("Learning Streak"), value: Math.min(props.profile.current_streak / 30 * 100, 100), iconClass: "text-orange-500", barClass: "bg-orange-400", textClass: "text-orange-500" },
	{ label: __("Study Hours"), value: Math.min(props.profile.hours_spent / 100 * 100, 100), iconClass: "text-ink-cyan-5", barClass: "bg-ink-cyan-5", textClass: "text-ink-cyan-5" },
]))
const quickActions = [
	{ label: __("Play Games"), tab: "Games", desc: __("Mini-games available"), icon: Gamepad2, btnClass: "bg-ink-blue-4", cardClass: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20", textHover: "group-hover:text-ink-blue-5" },
	{ label: __("Leaderboard"), tab: "Leaderboard", desc: __("See your ranking"), icon: Trophy, btnClass: "bg-amber-400", cardClass: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20", textHover: "group-hover:text-amber-600" },
	{ label: __("All Badges"), tab: "Badges", desc: __("Collect them all!"), icon: Award, btnClass: "bg-purple-500", cardClass: "bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20", textHover: "group-hover:text-purple-600" },
]
</script>
