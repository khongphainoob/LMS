<template>
	<div class="space-y-6">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<div>
				<h2 class="text-xl font-bold text-ink-gray-9">{{ __("Your Badges") }}</h2>
				<p class="text-sm text-ink-gray-5">{{ __("Collect badges by completing achievements") }}</p>
			</div>
			
			<div class="flex bg-surface-gray-2 p-1 rounded-lg">
				<button
					v-for="f in filterOptions"
					:key="f.value"
					@click="filter = f.value"
					class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
					:class="filter === f.value ? 'bg-white shadow-sm text-ink-gray-9' : 'text-ink-gray-5 hover:text-ink-gray-7'"
				>
					{{ f.label }}
				</button>
			</div>
		</div>

		<div v-if="badgesResource.loading" class="flex justify-center items-center py-12">
			<Spinner class="size-8 text-ink-gray-4" />
		</div>
		
		<div v-else-if="filteredBadges.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
			<div
				v-for="badge in filteredBadges"
				:key="badge.name"
				class="relative flex flex-col items-center p-4 border rounded-xl transition-all duration-300"
				:class="[
					badge.earned 
						? 'bg-surface-white border-outline-gray-2 shadow-sm hover:shadow-md' 
						: 'bg-surface-gray-1 border-outline-gray-2/50 opacity-70 grayscale hover:grayscale-0 hover:opacity-100'
				]"
			>
				<!-- Badge Image -->
				<div class="w-20 h-20 mb-3 rounded-full overflow-hidden border-2 flex items-center justify-center bg-surface-gray-2"
					 :class="badge.earned ? 'border-ink-blue-3 shadow-sm' : 'border-outline-gray-3'">
					<img v-if="badge.image && !badge.image.includes('badge.png')" :src="badge.image" :alt="badge.title" class="w-full h-full object-cover" />
					<PremiumBadgeIcon v-else :badgeName="badge.title" class="w-20 h-20" />
				</div>

				<h3 class="text-sm font-bold text-center text-ink-gray-9 line-clamp-1" :title="badge.title">
					{{ badge.title }}
				</h3>
				<p class="text-xs text-center text-ink-gray-5 mt-1 line-clamp-2 min-h-[2rem]" :title="badge.description">
					{{ badge.description }}
				</p>

				<!-- Earned Badge overlay/badge -->
				<div v-if="badge.earned" class="absolute top-2 right-2">
					<Badge theme="green" size="sm" class="shadow-sm">
						<div class="flex items-center gap-1">
							<Check class="w-3 h-3" stroke-width="3" />
							<span>{{ __('Received') }}</span>
						</div>
					</Badge>
				</div>
				
				<div v-if="badge.earned && badge.issued_on" class="mt-3 text-[10px] text-ink-gray-5 bg-surface-gray-2 px-2 py-0.5 rounded-full">
					{{ formatDate(badge.issued_on) }}
				</div>
			</div>
		</div>

		<div v-else class="text-center py-12 border border-dashed border-outline-gray-2 rounded-xl bg-surface-gray-1">
			<div class="text-4xl mb-3">🏅</div>
			<h3 class="text-lg font-medium text-ink-gray-8 mb-1">{{ __("No badges found") }}</h3>
			<p class="text-sm text-ink-gray-5">{{ filter === 'earned' ? __("You haven't earned any badges yet. Keep playing!") : __("No badges available in this category.") }}</p>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { createResource, Spinner, Badge } from 'frappe-ui'
import { Check } from 'lucide-vue-next'
import dayjs from '@/utils/dayjs'
import PremiumBadgeIcon from '@/components/Settings/PremiumBadgeIcon.vue'

const socket = inject('$socket')

const filter = ref('all')
const filterOptions = [
	{ label: __('All Badges'), value: 'all' },
	{ label: __('Earned'), value: 'earned' },
	{ label: __('Locked'), value: 'locked' }
]

const badgesResource = createResource({
	url: 'lms.lms.gamification.badge_api.get_user_badges',
	auto: true
})

const filteredBadges = computed(() => {
	if (!badgesResource.data) return []
	const all = badgesResource.data
	if (filter.value === 'earned') return all.filter(b => b.earned)
	if (filter.value === 'locked') return all.filter(b => !b.earned)
	return all
})

function formatDate(dateStr) {
	return dayjs(dateStr).format('MMM D, YYYY')
}

function getFallbackEmoji(title) {
	title = title.toLowerCase()
	if (title.includes('streak')) return '🔥'
	if (title.includes('champion') || title.includes('first')) return '🏆'
	if (title.includes('scholar') || title.includes('learn')) return '🎓'
	if (title.includes('top')) return '⭐'
	if (title.includes('speed')) return '⚡'
	return '🏅'
}

onMounted(() => {
	socket.on('badge_awarded', () => {
		badgesResource.reload()
	})
})
</script>
