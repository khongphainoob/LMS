<template>
	<div class="min-h-screen bg-surface-gray-1 p-4 sm:p-8">
		<!-- Header -->
		<div class="flex items-center gap-3 mb-6">
			<button @click="router.back()" class="flex items-center gap-1.5 text-sm text-ink-gray-5 hover:text-ink-gray-9 transition-colors">
				<ArrowLeft class="size-4" />
				{{ __('Back') }}
			</button>
			<span class="text-ink-gray-3">/</span>
			<span class="text-sm font-medium text-ink-gray-8">{{ game?.title }}</span>
		</div>

		<div v-if="!game" class="flex justify-center py-20">
			<Spinner class="size-8 text-ink-gray-4" />
		</div>

		<div v-else class="max-w-4xl mx-auto space-y-6">

			<!-- Game Info Card -->
			<div class="bg-surface-white border border-outline-gray-2 rounded-2xl overflow-hidden shadow-sm">
				<div class="h-36 flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
					<span class="text-7xl">{{ getGameIcon(game.game_type) }}</span>
				</div>
				<div class="p-6">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h1 class="text-xl font-bold text-ink-gray-9">{{ game.title }}</h1>
							<p class="text-sm text-ink-gray-5 mt-1">
								{{ __("Batch:") }} <span class="font-medium text-ink-gray-7">{{ game.batch }}</span>
								&nbsp;·&nbsp;
								{{ __("Max Score:") }} <span class="font-medium text-ink-gray-7">{{ game.max_score }}</span>
								&nbsp;·&nbsp;
								{{ __("Max Attempts:") }} <span class="font-medium text-ink-gray-7">{{ game.max_attempts || '∞' }}</span>
							</p>
						</div>

						<!-- Live Status Badge -->
						<div v-if="isLive" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
							<span class="size-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
							<span class="text-sm font-bold text-green-700">{{ __("Game is LIVE") }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Instructor Control Panel -->
			<div class="bg-surface-white border border-outline-gray-2 rounded-2xl p-6 shadow-sm">
				<h2 class="text-base font-semibold text-ink-gray-8 mb-4">🎛️ {{ __("Game Control") }}</h2>

				<div class="flex flex-col sm:flex-row gap-3">
					<!-- START button -->
					<button
						v-if="!isLive"
						@click="startGame"
						:disabled="starting"
						class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors disabled:opacity-60 shadow-md"
					>
						<span class="text-lg">▶</span>
						{{ starting ? __('Starting...') : __('Start Game for Students') }}
					</button>

					<!-- STOP button -->
					<button
						v-else
						@click="stopGame"
						:disabled="stopping"
						class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors disabled:opacity-60 shadow-md"
					>
						<span class="text-lg">■</span>
						{{ stopping ? __('Stopping...') : __('Stop Game') }}
					</button>

					<!-- Preview button -->
					<button
						@click="previewGame"
						class="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-outline-gray-2 bg-surface-gray-1 hover:bg-surface-gray-2 text-ink-gray-7 text-sm font-medium transition-colors"
					>
						👁 {{ __("Preview Game") }}
					</button>

					<!-- Edit Settings button -->
					<button
						@click="openEditModal"
						class="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-outline-gray-2 bg-surface-gray-1 hover:bg-surface-gray-2 text-ink-gray-7 text-sm font-medium transition-colors"
					>
						⚙️ {{ __("Edit Settings") }}
					</button>
				</div>

				<p v-if="!isLive" class="text-xs text-ink-gray-4 mt-3">
					{{ __("Clicking Start will broadcast a notification to all students in this batch via Socket.IO.") }}
				</p>
				<p v-else class="text-xs text-green-600 mt-3 font-medium">
					✅ {{ studentsNotified }} {{ __("students have been notified. Game is in progress.") }}
				</p>
			</div>

			<!-- Leaderboard (always visible to instructor) -->
			<div class="bg-surface-white border border-outline-gray-2 rounded-2xl p-6 shadow-sm">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-base font-semibold text-ink-gray-8">
						{{ isLive ? '📊 ' + __('Live Scores') : '🏆 ' + __('Leaderboard') }}
					</h2>
					<div class="flex items-center gap-2">
						<span v-if="isLive" class="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>
						<button @click="lobbyInfoResource.reload()" class="text-xs text-ink-blue-4 hover:underline">{{ __('Refresh') }}</button>
					</div>
				</div>

				<div v-if="lobbyInfoResource.loading" class="text-center py-8 text-ink-gray-4 text-sm">{{ __('Loading...') }}</div>
				<div v-else-if="liveScores.length === 0" class="text-center py-8 text-ink-gray-4 text-sm">
					{{ __('No scores yet. Students have not played this game.') }}
				</div>
				<div v-else class="space-y-2">
					<div
						v-for="(entry, idx) in liveScores"
						:key="entry.member"
						class="flex items-center gap-3 p-3 rounded-xl transition-colors"
						:class="idx === 0 ? 'bg-amber-50 border border-amber-200' : idx === 1 ? 'bg-slate-50 border border-slate-200' : idx === 2 ? 'bg-orange-50 border border-orange-100' : 'bg-surface-gray-1'"
					>
						<span class="text-xl font-bold w-8 text-center">
							{{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}` }}
						</span>
						<span class="flex-1 text-sm font-medium text-ink-gray-8 truncate">{{ entry.member_name || entry.member }}</span>
						<div class="text-right">
							<div class="text-sm font-bold text-ink-gray-9">{{ entry.best_score }} <span class="text-xs font-normal text-ink-gray-4">pts</span></div>
							<div class="text-[10px] text-ink-gray-4">{{ entry.attempt_count }} {{ __('tries') }}</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Edit Settings Dialog -->
		<Dialog v-slot:body-content v-model="showEditModal" :options="{ title: __('Edit Game Settings'), size: 'md' }">
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Max Attempts") }}</label>
					<input
						type="number"
						v-model="editForm.max_attempts"
						placeholder="Leave empty for unlimited attempts"
						class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3 text-sm"
					/>
					<p class="text-xs text-ink-gray-4 mt-1">{{ __("Number of attempts allowed for each student.") }}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Max Score") }}</label>
					<input
						type="number"
						v-model="editForm.max_score"
						class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3 text-sm"
					/>
					<p class="text-xs text-ink-gray-4 mt-1">{{ __("Maximum base score for this game.") }}</p>
				</div>

				<div class="flex justify-end gap-2 pt-2 border-t border-outline-gray-1">
					<Button variant="ghost" class="text-xs" @click="showEditModal = false">{{ __('Cancel') }}</Button>
					<Button variant="solid" class="text-xs" :loading="savingSettings" @click="saveSettings">{{ __('Save Changes') }}</Button>
				</div>
			</div>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Spinner, toast, createResource, call, Dialog, Button } from 'frappe-ui'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const socket = inject('$socket')

const classGameId = computed(() => route.query.classGame)
const isLive = ref(false)
const starting = ref(false)
const stopping = ref(false)
const studentsNotified = ref(0)

// Fetch game details
const gameResource = createResource({
	url: 'frappe.client.get',
	params: {
		doctype: 'LMS Class Game',
		name: classGameId.value,
	},
	auto: !!classGameId.value,
	transform(data) {
		// Also fetch LMS Game details
		return data
	}
})

// We need both the class game AND the LMS Game template details
const classGameDetails = computed(() => gameResource.data)

// Fetch LMS Game info for title, game_type, max_score
const lmsGameResource = createResource({
	url: 'frappe.client.get',
	auto: false,
})

const game = ref(null)
const emit = defineEmits(['back'])

onMounted(async () => {
	if (!classGameId.value) {
		router.back()
		return
	}

	// Load class game
	await gameResource.promise
	const cg = gameResource.data
	if (!cg) return

	// Load game template details
	const lmsGame = await call('frappe.client.get', {
		doctype: 'LMS Game',
		name: cg.game,
	})

	game.value = {
		class_game: classGameId.value,
		game_type: lmsGame.game_type,
		title: lmsGame.title,
		max_score: lmsGame.max_score,
		max_attempts: cg.max_attempts,
		batch: cg.batch,
	}

	// Fetch the full lobby info (live status + scores) in a single fast call
	lobbyInfoResource.reload()

	// Socket listeners
	if (socket) {
		socket.on('game_live_started', (payload) => {
			console.log('[GameLobby] Received game_live_started:', payload)
			if (!payload || payload.class_game == classGameId.value) {
				isLive.value = true
				lobbyInfoResource.reload()
			}
		})
		socket.on('game_live_stopped', (payload) => {
			console.log('[GameLobby] Received game_live_stopped:', payload)
			if (!payload || payload.class_game == classGameId.value) {
				isLive.value = false
				lobbyInfoResource.reload()
			}
		})
		socket.on('game_score_updated', (payload) => {
			console.log('[GameLobby] Received game_score_updated:', payload)
			if (!payload || !payload.class_game || payload.class_game == classGameId.value) {
				lobbyInfoResource.reload()
			}
		})
	}
})

onUnmounted(() => {
	if (socket) {
		socket.off('game_live_started')
		socket.off('game_live_stopped')
		socket.off('game_score_updated')
	}
})

const lobbyInfoResource = createResource({
	url: 'lms.lms.gamification.game_api.get_game_lobby_info',
	params: {
		class_game: classGameId.value,
	},
	auto: true,
	onSuccess(data) {
		if (data) {
			isLive.value = !!data.is_live
		}
	}
})
const liveScores = computed(() => lobbyInfoResource.data?.leaderboard || [])

async function startGame() {
	if (!classGameId.value) return
	starting.value = true
	try {
		const result = await call('lms.lms.gamification.game_api.broadcast_game_start', {
			class_game: classGameId.value
		})
		isLive.value = true
		studentsNotified.value = result?.students_notified || 0
		toast.success(`▶ ${game.value?.title} — ${__('Game started!')} (${studentsNotified.value} ${__('students notified')})`)
		lobbyInfoResource.reload()
	} catch (err) {
		toast.error(err?.message || __('Failed to start game'))
	} finally {
		starting.value = false
	}
}

async function stopGame() {
	stopping.value = true
	try {
		await call('lms.lms.gamification.game_api.broadcast_game_stop', {
			class_game: classGameId.value
		})
		isLive.value = false
		toast.success(`■ ${game.value?.title} — ${__('Game stopped.')}`)
		lobbyInfoResource.reload()
	} catch (err) {
		toast.error(err?.message || __('Failed to stop game'))
	} finally {
		stopping.value = false
	}
}

function previewGame() {
	if (!game.value) return
	router.push({
		name: 'GameCenterGame',
		params: { gameId: game.value.game_type },
		query: { classGame: classGameId.value }
	})
}

function getGameIcon(type) {
	const icons = {
		'memory_match': '🧠',
		'timed_quiz': '⚡',
		'spin_wheel': '🎁',
		'word_scramble': '🔤',
		'drag_drop': '↕️'
	}
	return icons[type] || '🎮'
}

// Edit settings state and actions
const showEditModal = ref(false)
const savingSettings = ref(false)
const editForm = ref({
	max_attempts: '',
	max_score: 1000,
})

function openEditModal() {
	editForm.value = {
		max_attempts: game.value?.max_attempts || '',
		max_score: game.value?.max_score || 1000,
	}
	showEditModal.value = true
}

async function saveSettings() {
	savingSettings.value = true
	try {
		// Call unified save_game_settings API (which also broadcasts reload event to students)
		await call('lms.lms.gamification.game_api.save_game_settings', {
			class_game: classGameId.value,
			max_attempts: editForm.value.max_attempts ? parseInt(editForm.value.max_attempts) : null,
			max_score: parseInt(editForm.value.max_score) || 1000,
		})

		// Reload resource and state
		await gameResource.reload()
		
		const updatedCg = gameResource.data
		const lmsGame = await call('frappe.client.get', {
			doctype: 'LMS Game',
			name: updatedCg.game,
		})

		game.value = {
			class_game: classGameId.value,
			game_type: lmsGame.game_type,
			title: lmsGame.title,
			max_score: lmsGame.max_score,
			max_attempts: updatedCg.max_attempts,
			batch: updatedCg.batch,
		}

		toast.success(__('Settings updated successfully!'))
		showEditModal.value = false
	} catch (e) {
		console.error(e)
		toast.error(e?.message || __('Failed to update settings.'))
	} finally {
		savingSettings.value = false
	}
}
</script>
