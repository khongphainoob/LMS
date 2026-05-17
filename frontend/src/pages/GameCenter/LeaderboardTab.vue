<template>
	<div class="space-y-6">
		<!-- Header & Filters -->
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<div>
				<h2 class="text-xl font-bold text-ink-gray-9">{{ __("Leaderboard") }}</h2>
				<p class="text-sm text-ink-gray-5">{{ __("See how you rank among your peers") }}</p>
			</div>
			
			<div class="flex items-center gap-3">
				<!-- Batch Filter -->
				<select
					v-if="batches.length > 0"
					v-model="selectedBatch"
					class="px-3 py-1.5 bg-surface-white border border-outline-gray-2 rounded-lg text-sm text-ink-gray-7 focus:outline-none focus:ring-2 focus:ring-ink-blue-2"
				>
					<option value="">{{ __("Global Ranking") }}</option>
					<option v-for="b in batches" :key="b.name" :value="b.name">
						{{ b.title || b.name }}
					</option>
				</select>
				
				<!-- Period Filter -->
				<div class="flex bg-surface-gray-2 p-1 rounded-lg">
					<button
						v-for="p in periods"
						:key="p.value"
						@click="selectedPeriod = p.value"
						class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
						:class="selectedPeriod === p.value ? 'bg-white shadow-sm text-ink-gray-9' : 'text-ink-gray-5 hover:text-ink-gray-7'"
					>
						{{ p.label }}
					</button>
				</div>
			</div>
		</div>

		<!-- Loading State -->
		<div v-if="leaderboard.loading" class="flex justify-center items-center py-12">
			<Spinner class="size-8 text-ink-gray-4" />
		</div>

		<!-- Podium (Top 3) -->
		<div v-else-if="topThree.length > 0" class="flex items-end justify-center gap-2 sm:gap-6 pt-12 pb-6 px-4">
			<!-- 2nd Place -->
			<div v-if="topThree[1]" class="flex flex-col items-center animate-slide-up" style="animation-delay: 100ms">
				<UserAvatar :user="topThree[1]" class="size-16 sm:size-20 mb-3 ring-4 ring-surface-gray-2 shadow-lg z-10" />
				<div class="w-20 sm:w-28 h-24 sm:h-32 bg-gradient-to-t from-surface-gray-2 to-surface-gray-1 rounded-t-lg border border-outline-gray-2 border-b-0 flex flex-col items-center justify-start pt-3">
					<span class="text-3xl font-bold text-ink-gray-4">2</span>
					<span class="text-xs font-medium text-ink-gray-6 mt-1 text-center truncate w-full px-2">{{ topThree[1].member_name }}</span>
					<span class="text-sm font-bold text-ink-gray-8 mt-1">{{ topThree[1].composite_score }}</span>
				</div>
			</div>

			<!-- 1st Place -->
			<div v-if="topThree[0]" class="flex flex-col items-center animate-slide-up z-20">
				<div class="relative">
					<div class="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl">👑</div>
					<UserAvatar :user="topThree[0]" class="size-20 sm:size-24 mb-3 ring-4 ring-amber-200 shadow-xl" />
				</div>
				<div class="w-24 sm:w-32 h-32 sm:h-40 bg-gradient-to-t from-amber-100 to-amber-50 rounded-t-lg border border-amber-200 border-b-0 flex flex-col items-center justify-start pt-3 shadow-sm">
					<span class="text-4xl font-bold text-amber-500">1</span>
					<span class="text-sm font-bold text-ink-gray-9 mt-1 text-center truncate w-full px-2">{{ topThree[0].member_name }}</span>
					<span class="text-base font-bold text-amber-700 mt-1">{{ topThree[0].composite_score }}</span>
				</div>
			</div>

			<!-- 3rd Place -->
			<div v-if="topThree[2]" class="flex flex-col items-center animate-slide-up" style="animation-delay: 200ms">
				<UserAvatar :user="topThree[2]" class="size-16 sm:size-20 mb-3 ring-4 ring-orange-100 shadow-lg z-10" />
				<div class="w-20 sm:w-28 h-20 sm:h-24 bg-gradient-to-t from-orange-50 to-orange-50/50 rounded-t-lg border border-orange-200 border-b-0 flex flex-col items-center justify-start pt-3">
					<span class="text-3xl font-bold text-orange-400">3</span>
					<span class="text-xs font-medium text-ink-gray-6 mt-1 text-center truncate w-full px-2">{{ topThree[2].member_name }}</span>
					<span class="text-sm font-bold text-orange-700 mt-1">{{ topThree[2].composite_score }}</span>
				</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-else-if="!leaderboard.loading" class="text-center py-12 text-ink-gray-5">
			{{ __("No ranking data available for this period.") }}
		</div>

		<!-- Rankings List -->
		<div v-if="restOfLeaderboard.length > 0" class="bg-surface-white border border-outline-gray-2 rounded-xl overflow-hidden">
			<table class="w-full text-left text-sm">
				<thead class="bg-surface-gray-1 border-b border-outline-gray-2 text-ink-gray-5">
					<tr>
						<th class="px-6 py-3 font-medium w-16">{{ __("Rank") }}</th>
						<th class="px-6 py-3 font-medium">{{ __("Learner") }}</th>
						<th class="px-6 py-3 font-medium text-right">{{ __("Score") }}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-outline-gray-1">
					<tr 
						v-for="entry in restOfLeaderboard" 
						:key="entry.member"
						class="hover:bg-surface-gray-1/50 transition-colors"
						:class="{'bg-blue-50/50': entry.member === currentUser}"
					>
						<td class="px-6 py-4 font-semibold text-ink-gray-5">
							#{{ entry.rank }}
						</td>
						<td class="px-6 py-4 flex items-center gap-3">
							<UserAvatar :user="entry" class="size-8" />
							<span class="font-medium text-ink-gray-9" :class="{'text-ink-blue-5': entry.member === currentUser}">
								{{ entry.member_name }}
								<span v-if="entry.member === currentUser" class="ml-1 text-xs bg-ink-blue-1 text-ink-blue-6 px-1.5 py-0.5 rounded">You</span>
							</span>
						</td>
						<td class="px-6 py-4 text-right font-bold text-ink-gray-7">
							{{ entry.composite_score }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { createResource, Spinner } from 'frappe-ui'
import UserAvatar from '@/components/UserAvatar.vue'
import { sessionStore } from '@/stores/session'

const socket = inject('$socket')

const session = sessionStore()

const currentUser = computed(() => session.user)

const periods = [
	{ label: __('All Time'), value: 'all_time' },
	{ label: __('Monthly'), value: 'monthly' },
	{ label: __('Weekly'), value: 'weekly' }
]

const selectedPeriod = ref('all_time')
const selectedBatch = ref('')

const batchesResource = createResource({
	url: 'lms.lms.gamification.game_api.get_leaderboard_batches',
	auto: true,
})
const batches = computed(() => batchesResource.data || [])

const leaderboard = createResource({
	url: 'lms.lms.gamification.leaderboard_api.get_leaderboard',
	params: () => ({
		batch: selectedBatch.value,
		period: selectedPeriod.value,
		limit: 50
	}),
	auto: true
})

const entries = computed(() => leaderboard.data || [])
const topThree = computed(() => entries.value.slice(0, 3))
const restOfLeaderboard = computed(() => entries.value.slice(3))

// Realtime Updates
function onLeaderboardUpdate(data) {
	// If it's a batch update and matches our current view
	if (data.batch === selectedBatch.value) {
		leaderboard.reload()
	}
}

watch(selectedBatch, (newBatch, oldBatch) => {
	if (oldBatch) socket.emit('leave_room', `batch_${oldBatch}`)
	if (newBatch) socket.emit('join_room', `batch_${newBatch}`)
	leaderboard.reload()
})

watch(selectedPeriod, () => {
	leaderboard.reload()
})

onMounted(() => {
	socket.on('leaderboard_updated', onLeaderboardUpdate)
	if (selectedBatch.value) {
		socket.emit('join_room', `batch_${selectedBatch.value}`)
	}
})

onUnmounted(() => {
	socket.off('leaderboard_updated', onLeaderboardUpdate)
	if (selectedBatch.value) {
		socket.emit('leave_room', `batch_${selectedBatch.value}`)
	}
})
</script>

<style scoped>
@keyframes slideUp {
	from { opacity: 0; transform: translateY(20px); }
	to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
	animation: slideUp 0.5s ease-out forwards;
	opacity: 0;
}
</style>
