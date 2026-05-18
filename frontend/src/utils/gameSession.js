import { ref } from 'vue'
import { createResource } from 'frappe-ui'

/**
 * Game Registry — dynamic import map for game components.
 * Used by GameCenter.vue to lazy-load the correct game component.
 */
export const GAME_COMPONENTS = {
	memory_match: () => import('@/pages/GameCenter/MemoryMatch.vue'),
	timed_quiz: () => import('@/pages/GameCenter/TimedQuiz.vue'),
	spin_wheel: () => import('@/pages/GameCenter/SpinTheWheel.vue'),
	word_scramble: () => import('@/pages/GameCenter/WordScramble.vue'),
	drag_drop: () => import('@/pages/GameCenter/DragDropSort.vue'),
}

export function resolveGameComponent(gameType) {
	return GAME_COMPONENTS[gameType] || null
}

/**
 * Composable: useGameSession
 *
 * Manages the full game session lifecycle via server API:
 *   start_game_session → [gameplay on client] → submit_game_session
 *
 * Usage:
 *   const { startGame, submitScore, sessionId, isStarting } = useGameSession(classGame)
 */
export function useGameSession(classGame) {
	const sessionId = ref(null)
	const isStarting = ref(false)
	const isSubmitting = ref(false)
	const startError = ref(null)
	const submitResult = ref(null)
	const gameConfig = ref(null)

	const startResource = createResource({
		url: 'lms.lms.gamification.game_api.start_game_session',
	})

	const submitResource = createResource({
		url: 'lms.lms.gamification.game_api.submit_game_session',
	})

	async function startGame() {
		if (!classGame) return
		isStarting.value = true
		startError.value = null
		try {
			const res = await startResource.submit({ class_game: classGame })
			if (startResource.error) {
				const err = startResource.error
				startError.value = err.messages?.[0] || err.message || 'Failed to start game session'
			} else if (res && res.session_id) {
				sessionId.value = res.session_id
				gameConfig.value = res.configuration
			} else {
				startError.value = 'Failed to start game session'
			}
		} catch (e) {
			console.error('Failed to start game session:', e)
			startError.value = startResource.error?.messages?.[0] || startResource.error?.message || e.message || 'Failed to start game session'
		} finally {
			isStarting.value = false
		}
	}

	async function submitScore(rawScore, metadata = null) {
		if (!sessionId.value) return null
		isSubmitting.value = true
		try {
			const res = await submitResource.submit({
				session_id: sessionId.value,
				raw_score: rawScore,
				metadata,
			})
			submitResult.value = res
			return res
		} catch (e) {
			console.error('Failed to submit score:', e)
			return null
		} finally {
			isSubmitting.value = false
		}
	}

	function reset() {
		sessionId.value = null
		startError.value = null
		submitResult.value = null
		gameConfig.value = null
	}

	return {
		sessionId,
		isStarting,
		isSubmitting,
		startError,
		submitResult,
		gameConfig,
		startGame,
		submitScore,
		reset,
	}
}
