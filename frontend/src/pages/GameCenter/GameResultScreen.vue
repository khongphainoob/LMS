<template>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);">
		<div class="rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden" style="background: #ffffff; color: #111827;">

			<!-- Gradient header -->
			<div class="p-7 text-center" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: #fff;">
				<div class="text-6xl mb-2">{{ rankEmoji }}</div>
				<h2 class="text-2xl font-bold">{{ __("Game Over!") }}</h2>
				<p class="text-sm mt-1" style="color: rgba(255,255,255,0.8)">{{ gameTitle }}</p>
			</div>

			<!-- Body -->
			<div class="p-5 space-y-4" style="background: #fff; color: #111827;">

				<!-- Score / Max / Rank row -->
				<div class="flex rounded-2xl overflow-hidden" style="background: #f3f4f6;">
					<div class="flex-1 text-center py-4">
						<div class="text-3xl font-black" style="color: #4f46e5;">{{ result?.score ?? 0 }}</div>
						<div class="text-xs mt-1" style="color: #6b7280;">{{ __("Score") }}</div>
					</div>
					<div style="width: 1px; background: #e5e7eb;"></div>
					<div class="flex-1 text-center py-4">
						<div class="text-3xl font-black" style="color: #374151;">{{ result?.max_score ?? '—' }}</div>
						<div class="text-xs mt-1" style="color: #6b7280;">{{ __("Max") }}</div>
					</div>
					<div style="width: 1px; background: #e5e7eb;"></div>
					<div class="flex-1 text-center py-4">
						<div class="text-2xl font-black" :style="{ color: rankHexColor }">
							<span v-if="rankLoading" style="color: #d1d5db;">…</span>
							<span v-else-if="rankData?.rank">
								{{ rankData.rank === 1 ? '🥇' : rankData.rank === 2 ? '🥈' : rankData.rank === 3 ? '🥉' : `#${rankData.rank}` }}
							</span>
							<span v-else style="color: #9ca3af;">—</span>
						</div>
						<div class="text-xs mt-1" style="color: #6b7280;">
							{{ rankData?.total_players ? `${rankData.rank ?? '?'}/${rankData.total_players}` : __("Rank") }}
						</div>
					</div>
				</div>

				<!-- Correct / Wrong counts (quiz games only) -->
				<div v-if="result?.total_questions" class="flex gap-2">
					<div class="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style="background: #f0fdf4; border: 1px solid #bbf7d0;">
						<span class="text-lg">✅</span>
						<div>
							<div class="text-base font-bold" style="color: #15803d;">{{ result.correct_answers ?? 0 }}</div>
							<div class="text-[10px]" style="color: #16a34a;">{{ __("Correct") }}</div>
						</div>
					</div>
					<div class="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style="background: #fef2f2; border: 1px solid #fecaca;">
						<span class="text-lg">❌</span>
						<div>
							<div class="text-base font-bold" style="color: #dc2626;">{{ result.wrong_answers ?? 0 }}</div>
							<div class="text-[10px]" style="color: #ef4444;">{{ __("Wrong") }}</div>
						</div>
					</div>
					<div class="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style="background: #f5f3ff; border: 1px solid #ddd6fe;">
						<span class="text-lg">📋</span>
						<div>
							<div class="text-base font-bold" style="color: #7c3aed;">{{ result.total_questions }}</div>
							<div class="text-[10px]" style="color: #8b5cf6;">{{ __("Total") }}</div>
						</div>
					</div>
				</div>

				<!-- Accuracy bar -->
				<div>
					<div class="flex justify-between text-xs mb-1.5">
						<span style="color: #6b7280;">{{ __("Accuracy") }}</span>
						<span class="font-bold" :style="{ color: accuracyHexColor }">{{ accuracyPct }}%</span>
					</div>
					<div class="w-full rounded-full overflow-hidden" style="height: 10px; background: #f3f4f6;">
						<div
							class="h-full rounded-full"
							style="transition: width 0.8s ease;"
							:style="{ width: accuracyPct + '%', background: accuracyBarHex }"
						></div>
					</div>
				</div>

				<!-- Best score chip (if this attempt < best) -->
				<div v-if="result?.best_score && result.best_score > (result.score ?? 0)"
					class="flex items-center justify-between rounded-xl px-3 py-2 text-xs"
					style="background: #f9fafb; border: 1px solid #e5e7eb; color: #6b7280;"
				>
					<span>{{ __("Personal Best") }}</span>
					<b style="color: #111827;">{{ result.best_score }} pts</b>
				</div>

				<!-- XP earned -->
				<div v-if="result?.xp_earned"
					class="flex items-center justify-center gap-2 rounded-xl py-3"
					style="background: #fffbeb; border: 1px solid #fcd34d;"
				>
					<span class="text-xl">⭐</span>
					<span class="text-sm font-bold" style="color: #92400e;">+{{ result.xp_earned }} XP earned!</span>
				</div>

				<!-- Done button -->
				<button
					@click="$emit('done')"
					class="w-full py-3 rounded-2xl font-bold text-sm"
					style="background: #4f46e5; color: #fff; border: none; cursor: pointer; transition: opacity 0.2s;"
					@mouseover="e => e.target.style.opacity = '0.9'"
					@mouseleave="e => e.target.style.opacity = '1'"
				>
					✅ {{ __("Done") }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { call } from 'frappe-ui'

const props = defineProps({
	result: { type: Object, default: null },
	gameTitle: { type: String, default: '' },
	classGame: { type: [String, Number], default: null },
})

defineEmits(['done'])

const rankData = ref(null)
const rankLoading = ref(false)

onMounted(async () => {
	if (!props.classGame) return
	rankLoading.value = true
	try {
		rankData.value = await call('lms.lms.gamification.game_api.get_my_game_rank', {
			class_game: props.classGame
		})
	} catch (e) {
		console.error('Rank fetch failed:', e)
	} finally {
		rankLoading.value = false
	}
})

const accuracyPct = computed(() => {
	// For quiz games: use correct/total
	if (props.result?.total_questions) {
		return Math.round(((props.result.correct_answers ?? 0) / props.result.total_questions) * 100)
	}
	// Fallback: score/max_score
	const score = props.result?.score ?? 0
	const max = props.result?.max_score ?? 0
	if (!max) return 0
	return Math.min(100, Math.round((score / max) * 100))
})

const accuracyHexColor = computed(() => {
	if (accuracyPct.value >= 80) return '#16a34a'
	if (accuracyPct.value >= 50) return '#d97706'
	return '#dc2626'
})

const accuracyBarHex = computed(() => {
	if (accuracyPct.value >= 80) return '#22c55e'
	if (accuracyPct.value >= 50) return '#f59e0b'
	return '#ef4444'
})

const rankHexColor = computed(() => {
	const r = rankData.value?.rank
	if (!r) return '#9ca3af'
	if (r === 1) return '#f59e0b'
	if (r === 2) return '#94a3b8'
	if (r === 3) return '#b45309'
	return '#374151'
})

const rankEmoji = computed(() => {
	if (rankLoading.value) return '⏳'
	const r = rankData.value?.rank
	if (r === 1) return '🥇'
	if (r === 2) return '🥈'
	if (r === 3) return '🥉'
	if (accuracyPct.value >= 80) return '🎉'
	if (accuracyPct.value >= 50) return '👍'
	return '💪'
})
</script>
