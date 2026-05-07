const GAME_COMPONENTS = {
	memory_match: () => import("./MemoryMatch.vue"),
	timed_quiz: () => import("./TimedQuiz.vue"),
	spin_wheel: () => import("./SpinTheWheel.vue"),
	word_scramble: () => import("./WordScramble.vue"),
	drag_drop: () => import("./DragDropSort.vue"),
}

export function resolveGameComponent(gameType) {
	return GAME_COMPONENTS[gameType] || null
}
