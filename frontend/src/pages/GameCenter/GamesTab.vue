<template>
	<div class="space-y-5">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="font-semibold text-ink-gray-9">{{ __("Mini Games") }}</h3>
				<p class="text-sm text-ink-gray-5">{{ __("Play games to earn XP and level up") }}</p>
			</div>
			<span class="text-xs text-ink-gray-5 bg-surface-gray-2 px-2 py-0.5 rounded-full">
				{{ games.length }} {{ __("games available") }}
			</span>
		</div>

		<div v-if="gamesResource.loading" class="flex justify-center items-center py-12">
			<Spinner class="size-8 text-ink-gray-4" />
		</div>

		<div v-else-if="games.length > 0" class="space-y-4">

			<!-- ===== LIVE GAMES (top section) ===== -->
			<template v-if="liveGames.length > 0">
				<p class="text-xs font-semibold text-green-600 uppercase tracking-widest flex items-center gap-1.5">
					<span class="size-2 rounded-full bg-green-500 animate-ping inline-block"></span>
					{{ __("Live Now") }}
				</p>

				<div
					v-for="game in liveGames"
					:key="'live-' + game.class_game"
					class="rounded-2xl border-2 border-green-400 shadow-lg shadow-green-100 overflow-hidden"
				>
					<div class="flex items-center gap-5 p-5 bg-gradient-to-r from-green-50 to-emerald-50">
						<div class="flex-shrink-0 size-20 rounded-2xl bg-white shadow-md flex items-center justify-center border border-green-200 text-4xl">
							{{ getGameIcon(game.game_type) }}
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<span class="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">● LIVE</span>
								<span class="text-[10px] text-green-700 truncate">{{ game.batch }}</span>
							</div>
							<h3 class="text-base font-bold text-ink-gray-9">{{ game.title }}</h3>
							<p class="text-xs text-ink-gray-5">{{ __("Max Score:") }} {{ game.max_score }}</p>
						</div>

						<!-- INSTRUCTOR: Lobby + Stop + Delete -->
						<div v-if="isInstructor" class="flex flex-col gap-2 flex-shrink-0">
							<button @click="openGame(game)" class="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow" style="color: #000000 !important;">
								🎛 {{ __('Lobby') }}
							</button>
							<button @click="stopGame(game)" class="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow">
								⏹ {{ __('Stop') }}
							</button>
							<button @click="deleteGame(game)" :disabled="deletingId === game.class_game"
								class="flex items-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-500 text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-40">
								🗑 {{ __('Delete') }}
							</button>
						</div>

						<!-- STUDENT: JOIN (only if can still play) -->
						<button
							v-else-if="game.can_play !== false"
							@click="joinLiveGame(game)"
							class="flex-shrink-0 flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-2xl px-6 py-4 transition-all shadow-lg shadow-green-200"
						>
							<span class="text-2xl mb-1">🚀</span>
							<span class="text-sm">{{ __('JOIN') }}</span>
						</button>
						<!-- STUDENT: Attempts exhausted -->
						<div v-else class="flex-shrink-0 flex flex-col items-center justify-center bg-surface-gray-2 text-ink-gray-5 rounded-2xl px-4 py-3 text-center">
							<span class="text-xl mb-0.5">✅</span>
							<span class="text-[10px] font-bold">{{ __('Done') }}</span>
							<span class="text-[9px]">{{ __('Max attempts') }}</span>
						</div>
					</div>
				</div>

				<div v-if="normalGames.length > 0" class="flex items-center gap-3">
					<div class="flex-1 h-px bg-outline-gray-2"></div>
					<span class="text-xs text-ink-gray-4">{{ __("Other Games") }}</span>
					<div class="flex-1 h-px bg-outline-gray-2"></div>
				</div>
			</template>

			<!-- ===== NORMAL GAMES GRID ===== -->
			<div v-if="normalGames.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
				<div
					v-for="game in normalGames"
					:key="game.class_game"
					class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden flex flex-col"
				>
					<!-- Card top: INSTRUCTOR = clickable → Lobby, STUDENT = NOT clickable -->
					<div
						:class="isInstructor
							? 'cursor-pointer group hover:from-blue-100 hover:to-indigo-100'
							: 'cursor-not-allowed opacity-90'"
						class="h-24 w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 relative transition-colors"
						@click="isInstructor ? openGame(game) : null"
					>
						<div class="text-4xl transition-transform duration-300" :class="isInstructor ? 'group-hover:scale-110' : ''">
							{{ getGameIcon(game.game_type) }}
						</div>
						<!-- Lock icon for student -->
						<div v-if="!isInstructor" class="absolute inset-0 flex items-center justify-center bg-black/10 rounded-t-xl">
							<span class="text-2xl">🔒</span>
						</div>
						<span class="absolute top-1.5 right-1.5 text-[9px] font-medium bg-white/80 text-ink-gray-5 px-1.5 py-0.5 rounded-full truncate max-w-[80px]" :title="game.batch">
							{{ game.batch?.split('-').slice(0, 2).join('-') || game.batch }}
						</span>
					</div>

					<div class="p-3 flex-1 flex flex-col">
						<div class="text-sm font-semibold text-ink-gray-9 line-clamp-1" :title="game.title">{{ game.title }}</div>
						<div class="text-xs text-ink-gray-5 mt-0.5">{{ __("Max Score:") }} {{ game.max_score }}</div>

						<!-- STUDENT: Score history & rank -->
						<template v-if="!isInstructor">
							<div class="mt-2 mb-1">
								<div class="w-full h-1.5 bg-surface-gray-2 rounded-full overflow-hidden">
									<div class="h-full bg-ink-blue-4 rounded-full transition-all" :style="{ width: game.progress_pct + '%' }"></div>
								</div>
							</div>
							<div class="flex items-center justify-between text-[10px] text-ink-gray-5 mb-2">
								<span>{{ __("Best:") }} <b class="text-ink-gray-7">{{ game.best_score }}</b></span>
								<span v-if="game.max_attempts">{{ game.attempt_count }}/{{ game.max_attempts }}</span>
							</div>

							<!-- Rank / status badge -->
							<div class="mt-auto">
								<!-- Completed all attempts -->
								<div v-if="game.can_play === false"
									class="bg-surface-gray-1 border border-outline-gray-2 rounded-lg px-2 py-2 text-center">
									<p class="text-[10px] font-bold text-ink-gray-6">✅ {{ __('Completed') }}</p>
									<p class="text-[9px] text-ink-gray-4">{{ game.attempts_used }}/{{ game.max_attempts }} {{ __('attempts') }}</p>
								</div>
								<!-- Has rank -->
								<div v-else-if="game.rank"
									class="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
									<span class="text-base">{{ getRankEmoji(game.rank) }}</span>
									<div>
										<p class="text-[11px] font-bold text-amber-800">#{{ game.rank }} / {{ game.total_players }}</p>
										<p class="text-[9px] text-amber-600">{{ __('Your ranking') }}</p>
									</div>
								</div>
								<!-- Waiting -->
								<div v-else class="bg-surface-gray-1 rounded-lg px-2 py-2 text-center">
									<p class="text-[10px] text-ink-gray-4">{{ __('Waiting for instructor...') }}</p>
									<p v-if="game.max_attempts" class="text-[9px] text-ink-gray-3 mt-0.5">
										{{ game.attempts_used || 0 }}/{{ game.max_attempts }} {{ __('attempts used') }}
									</p>
								</div>
							</div>
						</template>

						<!-- INSTRUCTOR: Start + Delete -->
						<template v-else>
							<div class="mt-auto pt-2 flex gap-1.5">
								<button @click="startGame(game)"
									class="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
									▶ {{ __("Start") }}
								</button>
								<button @click="deleteGame(game)" :disabled="deletingId === game.class_game"
									class="text-[10px] font-bold py-1.5 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-40"
									:title="__('Delete game')">
									🗑
								</button>
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>

		<div v-else-if="apiError" class="text-center py-12 border border-dashed border-red-200 rounded-xl bg-red-50">
			<div class="text-4xl mb-3">⚠️</div>
			<h3 class="text-lg font-medium text-red-700 mb-1">{{ __("API Error") }}</h3>
			<p class="text-sm text-red-500 font-mono">{{ apiError }}</p>
		</div>

		<div v-else class="text-center py-12 border border-dashed border-outline-gray-2 rounded-xl bg-surface-gray-1">
			<div class="text-4xl mb-3">🎮</div>
			<h3 class="text-lg font-medium text-ink-gray-8 mb-1">{{ __("No Games Found") }}</h3>
			<p class="text-sm text-ink-gray-5 mb-4">{{ __("No games are currently assigned to your batches.") }}</p>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { createResource, Spinner, toast, call } from 'frappe-ui'
import { usersStore } from '@/stores/user'

const router = useRouter()
const socket = inject('$socket')
const { userResource } = usersStore()
const apiError = ref(null)
const deletingId = ref(null)

// Track live game class IDs reactively
const liveClassGameIds = ref(new Set())

// isInstructor: moderator / system manager / course creator
const isInstructor = computed(() => {
	const u = userResource.data
	if (!u) return false
	return u.is_moderator || u.is_instructor || u.is_system_manager
})

const gamesResource = createResource({
	url: 'lms.lms.gamification.game_api.get_available_games',
	auto: true,
	onSuccess(data) {
		apiError.value = null
		const live = new Set()
		const list = Array.isArray(data) ? data : (data?.message || [])
		list.forEach(g => { if (g.is_live) live.add(g.class_game) })
		liveClassGameIds.value = live
	},
	onError(err) { apiError.value = err?.message || String(err) }
})

const games = computed(() => {
	const data = gamesResource.data
	if (!data) return []
	return Array.isArray(data) ? data : (data?.message || [])
})

const liveGames = computed(() =>
	games.value.filter(g => liveClassGameIds.value.has(g.class_game) || g.is_live)
)
const normalGames = computed(() =>
	games.value.filter(g => !liveClassGameIds.value.has(g.class_game) && !g.is_live)
)

// Socket listeners
onMounted(() => {
	if (!socket) return
	socket.on('game_live_started', (payload) => {
		const s = new Set(liveClassGameIds.value)
		s.add(payload.class_game)
		liveClassGameIds.value = s
		if (!isInstructor.value) {
			toast.success(`🎮 ${payload.title} — ${__('Game started! Click JOIN to play.')}`)
		}
		gamesResource.reload()
	})
	socket.on('game_live_stopped', (payload) => {
		const s = new Set(liveClassGameIds.value)
		s.delete(payload.class_game)
		liveClassGameIds.value = s
		gamesResource.reload()
	})
	socket.on('game_score_updated', () => { gamesResource.reload() })
})
onUnmounted(() => {
	if (!socket) return
	socket.off('game_live_started')
	socket.off('game_live_stopped')
	socket.off('game_score_updated')
})

// --- Actions ---
function joinLiveGame(game) {
	router.push({ name: 'GameCenterGame', params: { gameId: game.game_type }, query: { classGame: game.class_game } })
}

function openGame(game) {
	// Only instructors can navigate to game lobby
	if (isInstructor.value) {
		router.push({ name: 'GameLobby', query: { classGame: game.class_game } })
	}
	// Students cannot click — card is locked
}

async function startGame(game) {
	try {
		const result = await call('lms.lms.gamification.game_api.broadcast_game_start', { class_game: game.class_game })
		const s = new Set(liveClassGameIds.value)
		s.add(game.class_game)
		liveClassGameIds.value = s
		toast.success(`▶ ${game.title} — ${__('Started!')} (${result.students_notified} ${__('students notified')})`)
		await gamesResource.reload()
	} catch (err) {
		toast.error(err?.message || __('Failed to start game'))
	}
}

async function stopGame(game) {
	try {
		await call('lms.lms.gamification.game_api.broadcast_game_stop', { class_game: game.class_game })
		const s = new Set(liveClassGameIds.value)
		s.delete(game.class_game)
		liveClassGameIds.value = s
		toast.success(`⏹ ${game.title} — ${__('Stopped.')}`)
		await gamesResource.reload()
	} catch (err) {
		toast.error(err?.message || __('Failed to stop game'))
	}
}

async function deleteGame(game) {
	if (!confirm(`${__('Remove')} "${game.title}" ${__('from this batch?')} ${__('This cannot be undone.')}`)) return
	deletingId.value = game.class_game
	try {
		await call('frappe.client.delete', { doctype: 'LMS Class Game', name: game.class_game })
		toast.success(__('Game removed.'))
		gamesResource.reload()
	} catch (err) {
		toast.error(err?.message || __('Failed to delete'))
	} finally {
		deletingId.value = null
	}
}

function reload() { gamesResource.reload() }
defineExpose({ reload })

function getGameIcon(type) {
	return { memory_match: '🧠', timed_quiz: '⚡', spin_wheel: '🎁', word_scramble: '🔤', drag_drop: '↕️' }[type] || '🎮'
}

function getRankEmoji(rank) {
	if (rank === 1) return '🥇'
	if (rank === 2) return '🥈'
	if (rank === 3) return '🥉'
	return `#${rank}`
}
</script>
