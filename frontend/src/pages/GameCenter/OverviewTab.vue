<template>
	<div class="space-y-5">
		<div v-if="profileResource.loading" class="flex justify-center items-center py-12">
			<Spinner class="size-8 text-ink-gray-4" />
		</div>
		
		<template v-else-if="profile">
			<!-- Hero Card -->
			<div class="border border-outline-gray-2 bg-gradient-to-br from-surface-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 rounded-2xl shadow-sm p-5 sm:p-6">
				<div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
					<div class="relative flex-shrink-0">
						<svg class="size-24 sm:size-28" viewBox="0 0 100 100">
							<circle cx="50" cy="50" r="42" fill="none" stroke-width="6" class="stroke-outline-gray-2" />
							<circle cx="50" cy="50" r="42" fill="none" stroke-width="6" stroke-linecap="round"
								class="transition-all duration-1000"
								:stroke="profile.xp_percent >= 100 ? '#f59e0b' : '#3b82f6'"
								:stroke-dasharray="circumference"
								:stroke-dashoffset="circumference - (Math.min(profile.xp_percent, 100) / 100) * circumference"
								transform="rotate(-90 50 50)" />
						</svg>
						<div class="absolute inset-0 flex flex-col items-center justify-center">
							<span class="text-xl sm:text-2xl font-bold text-ink-gray-9">{{ profile.level }}</span>
							<span class="text-[9px] font-medium uppercase tracking-wider text-ink-gray-5">{{ __("Level") }}</span>
						</div>
					</div>
					
					<div class="flex-1 min-w-0 w-full text-center sm:text-left mt-2 sm:mt-0">
						<div class="flex flex-col sm:flex-row items-center gap-2 mb-2">
							<h2 class="text-lg font-bold text-ink-gray-9 truncate">{{ profile.member_name }}</h2>
							<span class="text-xs bg-ink-blue-4 text-white px-2 py-0.5 rounded-full font-medium">
								{{ profile.xp }}/{{ profile.xp_to_next }} XP
							</span>
						</div>
						
						<div class="w-full h-2.5 bg-surface-gray-2 rounded-full overflow-hidden mb-4">
							<div class="h-full rounded-full transition-all duration-700"
								:style="{ width: profile.xp_percent + '%', background: profile.xp_percent >= 100 ? '#f59e0b' : '#3b82f6' }"></div>
						</div>
						
						<div class="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2">
							<div class="flex items-center gap-1.5 text-sm">
								<Flame class="size-4 text-orange-500" />
								<span class="font-bold text-ink-gray-9">{{ profile.current_streak }}</span>
								<span class="text-ink-gray-5 text-xs">{{ __("day streak") }}</span>
							</div>
							<div class="flex items-center gap-1.5 text-sm">
								<Clock class="size-4 text-ink-blue-4" />
								<span class="font-bold text-ink-gray-9">{{ profile.hours_spent }}h</span>
								<span class="text-ink-gray-5 text-xs">{{ __("learned") }}</span>
							</div>
							<div class="flex items-center gap-1.5 text-sm">
								<Award class="size-4 text-ink-purple-4" />
								<span class="font-bold text-ink-gray-9">{{ earnedBadges.length }}</span>
								<span class="text-ink-gray-5 text-xs">{{ __("badges") }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Stat Cards -->
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<div class="border border-outline-gray-2 bg-surface-white rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
					<div class="size-9 mx-auto mb-2 rounded-lg flex items-center justify-center bg-blue-50 text-ink-blue-5">
						<Target class="size-4" />
					</div>
					<div class="text-xl font-bold text-ink-gray-9">{{ profile.avg_quiz_score }}%</div>
					<div class="text-[11px] text-ink-gray-5 mt-0.5">{{ __("Quiz Avg") }}</div>
				</div>
				<div class="border border-outline-gray-2 bg-surface-white rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
					<div class="size-9 mx-auto mb-2 rounded-lg flex items-center justify-center bg-green-50 text-ink-green-5">
						<FileCheck class="size-4" />
					</div>
					<div class="text-xl font-bold text-ink-gray-9">{{ profile.avg_assignment_score }}%</div>
					<div class="text-[11px] text-ink-gray-5 mt-0.5">{{ __("Assignment Avg") }}</div>
				</div>
				<div class="border border-outline-gray-2 bg-surface-white rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
					<div class="size-9 mx-auto mb-2 rounded-lg flex items-center justify-center bg-purple-50 text-ink-purple-5">
						<BookOpen class="size-4" />
					</div>
					<div class="text-xl font-bold text-ink-gray-9">{{ profile.completion_pct }}%</div>
					<div class="text-[11px] text-ink-gray-5 mt-0.5">{{ __("Course Progress") }}</div>
				</div>
				<div class="border border-outline-gray-2 bg-surface-white rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
					<div class="size-9 mx-auto mb-2 rounded-lg flex items-center justify-center bg-amber-50 text-ink-amber-5">
						<TrendingUp class="size-4" />
					</div>
					<div class="text-xl font-bold text-ink-gray-9">{{ profile.total_score }}</div>
					<div class="text-[11px] text-ink-gray-5 mt-0.5">{{ __("Total Score") }}</div>
				</div>
			</div>

			<!-- Recent Badges & Quick Actions -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-sm font-semibold text-ink-gray-8">{{ __("Recent Badges") }}</h3>
						<button @click="$emit('switch-tab', 'badges')" class="text-xs text-ink-blue-4 hover:underline">{{ __("View All") }}</button>
					</div>
					
					<div v-if="earnedBadges.length" class="flex gap-3 overflow-x-auto pb-1">
						<div v-for="b in earnedBadges.slice(0, 5)" :key="b.name" class="flex-shrink-0 w-16 text-center">
							<div class="w-12 h-12 mx-auto rounded-lg flex items-center justify-center bg-surface-gray-2 mb-1 border overflow-hidden">
								<img v-if="b.image" :src="b.image" :alt="b.title" class="w-full h-full object-cover" />
								<div v-else class="text-2xl">{{ getFallbackEmoji(b.title) }}</div>
							</div>
							<div class="text-[9px] text-ink-gray-5 truncate" :title="b.title">{{ b.title }}</div>
						</div>
					</div>
					<div v-else class="text-center text-ink-gray-5 py-4 text-sm">
						{{ __("No badges earned yet. Keep learning!") }}
					</div>
				</div>
				
				<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm p-5">
					<h3 class="text-sm font-semibold text-ink-gray-8 mb-3">{{ __("Quick Actions") }}</h3>
					<div class="space-y-2">
						<button @click="$emit('switch-tab', 'games')" class="w-full flex items-center gap-3 p-3 rounded-lg transition-colors group bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
							<div class="size-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-ink-blue-4">
								<Gamepad2 class="size-4 text-white" />
							</div>
							<div class="text-left">
								<div class="text-sm font-medium text-ink-gray-9 group-hover:text-ink-blue-5">{{ __("Play Games") }}</div>
								<div class="text-[10px] text-ink-gray-5">{{ __("Earn XP & level up") }}</div>
							</div>
							<ChevronRight class="size-4 text-ink-gray-4 ml-auto" />
						</button>
						<button @click="$emit('switch-tab', 'leaderboard')" class="w-full flex items-center gap-3 p-3 rounded-lg transition-colors group bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100">
							<div class="size-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-400">
								<Trophy class="size-4 text-white" />
							</div>
							<div class="text-left">
								<div class="text-sm font-medium text-ink-gray-9 group-hover:text-amber-600">{{ __("Leaderboard") }}</div>
								<div class="text-[10px] text-ink-gray-5">{{ __("Check your ranking") }}</div>
							</div>
							<ChevronRight class="size-4 text-ink-gray-4 ml-auto" />
						</button>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { createResource, Spinner } from 'frappe-ui'
import { 
	Flame, Clock, Award, Target, FileCheck, BookOpen, 
	TrendingUp, Gamepad2, Trophy, ChevronRight 
} from 'lucide-vue-next'

const emit = defineEmits(['switch-tab'])

const circumference = 2 * Math.PI * 42

const profileResource = createResource({
	url: 'lms.lms.gamification.profile_api.get_game_profile',
	auto: true
})
const profile = computed(() => profileResource.data)

const badgesResource = createResource({
	url: 'lms.lms.gamification.badge_api.get_user_badges',
	auto: true
})
const earnedBadges = computed(() => (badgesResource.data || []).filter(b => b.earned))

function getFallbackEmoji(title) {
	title = title.toLowerCase()
	if (title.includes('streak')) return '🔥'
	if (title.includes('champion') || title.includes('first')) return '🏆'
	if (title.includes('scholar') || title.includes('learn')) return '🎓'
	if (title.includes('top')) return '⭐'
	if (title.includes('speed')) return '⚡'
	return '🏅'
}
</script>
