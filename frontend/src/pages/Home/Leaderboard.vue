<template>
	<div class="border border-outline-gray-2 rounded-xl p-5 bg-surface-white">
		<!-- Header -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<Trophy class="size-5 text-ink-amber-4" />
				<span class="font-semibold text-lg text-ink-gray-9">
					{{ mode === 'admin' ? __('Batch Leaderboard') : __('Leaderboard') }}
				</span>
			</div>
			<select
				v-if="mode === 'admin' && batches?.length"
				v-model="selectedBatch"
				class="text-sm border border-outline-gray-2 rounded-md px-2 py-1 bg-surface-white text-ink-gray-8 focus:outline-none focus:ring focus-visible:ring-outline-gray-3"
			>
				<option v-for="b in batches" :key="b.name" :value="b.name">
					{{ b.title }}
				</option>
			</select>
		</div>

		<!-- Loading -->
		<div v-if="leaderboard.loading" class="text-center py-8 text-ink-gray-5 text-sm">
			{{ __('Loading...') }}
		</div>

		<!-- Empty State -->
		<div
			v-else-if="!leaderboard.data?.length"
			class="text-center py-8 text-ink-gray-5 text-sm"
		>
			{{ __('No leaderboard data available yet.') }}
		</div>

		<!-- Leaderboard List -->
		<div v-else class="space-y-1.5">
			<div
				v-for="entry in leaderboard.data"
				:key="entry.member"
				class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-gray-1 transition-colors"
			>
				<!-- Rank Badge -->
				<div
					class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
					:class="getRankClass(entry.rank)"
				>
					{{ entry.rank }}
				</div>

				<!-- Avatar -->
				<Avatar
					:label="entry.member_name"
					:image="entry.member_image"
					size="sm"
				/>

				<!-- Name + Details -->
				<div class="flex-1 min-w-0">
					<div class="font-medium text-ink-gray-9 truncate text-sm">
						{{ entry.member_name }}
					</div>
					<div class="text-xs text-ink-gray-5">
						{{ entry.completion_pct }}% {{ __('complete') }} &middot;
						{{ entry.streak_days }} {{ __('day streak') }}
					</div>
				</div>

				<!-- Composite Score -->
				<div class="text-right flex-shrink-0">
					<div class="font-bold text-ink-gray-9 text-sm">
						{{ entry.composite_score }}
					</div>
					<div class="text-xs text-ink-gray-5">
						{{ __('points') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { createResource, Avatar } from 'frappe-ui'
import { ref, watch } from 'vue'
import { Trophy } from 'lucide-vue-next'

const props = withDefaults(
	defineProps<{
		mode: 'student' | 'admin'
		batches?: Array<{ name: string; title: string }>
	}>(),
	{
		mode: 'student',
		batches: () => [],
	},
)

const selectedBatch = ref(props.batches?.[0]?.name || null)

const leaderboard = createResource({
	url: 'lms.lms.api.get_leaderboard',
	params: {
		batch: selectedBatch.value,
		limit: 10,
	},
	auto: true,
})

watch(selectedBatch, (newBatch) => {
	leaderboard.update({
		params: {
			batch: newBatch,
			limit: 10,
		},
	})
	leaderboard.reload()
})

const getRankClass = (rank: number) => {
	if (rank === 1) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
	if (rank === 2) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
	if (rank === 3) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
	return 'bg-surface-gray-2 text-ink-gray-6'
}
</script>
