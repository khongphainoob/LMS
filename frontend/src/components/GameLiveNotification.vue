<template>
	<!-- Game Live Notification - appears on any page when instructor starts a game -->
	<Teleport to="body">
		<Transition
			enter-active-class="transition-all duration-500 ease-out"
			enter-from-class="translate-y-full opacity-0"
			enter-to-class="translate-y-0 opacity-100"
			leave-active-class="transition-all duration-300 ease-in"
			leave-from-class="translate-y-0 opacity-100"
			leave-to-class="translate-y-full opacity-0"
		>
			<div
				v-if="liveGame"
				class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4"
			>
				<div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-4">
					<!-- Pulsing icon -->
					<div class="relative flex-shrink-0">
						<span class="text-3xl">🎮</span>
						<span class="absolute -top-1 -right-1 size-3 rounded-full bg-white animate-ping"></span>
						<span class="absolute -top-1 -right-1 size-3 rounded-full bg-green-200"></span>
					</div>

					<!-- Text -->
					<div class="flex-1 min-w-0">
						<p class="font-bold text-sm leading-tight">{{ __("Game is Live!") }}</p>
						<p class="text-xs text-green-100 truncate">{{ liveGame.title }}</p>
					</div>

					<!-- Action buttons -->
					<div class="flex flex-col gap-1.5 flex-shrink-0">
						<button
							@click="joinGame"
							class="bg-white text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
						>
							{{ __("Join Now!") }} →
						</button>
						<button
							@click="dismiss"
							class="text-green-200 text-[10px] hover:text-white transition-colors text-center"
						>
							{{ __("Dismiss") }}
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const socket = inject('$socket')
const liveGame = ref(null)

onMounted(() => {
	if (!socket) return

	socket.on('game_live_started', (payload) => {
		console.log('[GameNotification] game_live_started received', payload)
		liveGame.value = payload
		// Auto-dismiss after 30 seconds if not acted on
		setTimeout(() => {
			if (liveGame.value?.class_game === payload.class_game) {
				liveGame.value = null
			}
		}, 30000)
	})

	socket.on('game_live_stopped', (payload) => {
		if (liveGame.value?.class_game === payload.class_game) {
			liveGame.value = null
		}
	})
})

onUnmounted(() => {
	if (!socket) return
	socket.off('game_live_started')
	socket.off('game_live_stopped')
})

function joinGame() {
	if (!liveGame.value) return
	router.push({
		name: 'GameCenterGame',
		params: { gameId: liveGame.value.game_type },
		query: { classGame: liveGame.value.class_game }
	})
	liveGame.value = null
}

function dismiss() {
	liveGame.value = null
}
</script>
