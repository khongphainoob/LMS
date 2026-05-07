<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __('Duck Race') }}</h3>
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Timer class="size-4" />
					<span>{{ timeLeft }}s</span>
				</div>
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Trophy class="size-4 text-ink-amber-5" />
					<span>{{ score }} pts</span>
				</div>
				<button
					@click="resetGame"
					class="text-xs px-3 py-1.5 rounded-md bg-surface-gray-2 hover:bg-surface-gray-3 text-ink-gray-7 transition-colors"
				>
					{{ __('Reset') }}
				</button>
			</div>
		</div>

		<div v-if="gameState === 'start'" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-3">
			<div class="text-4xl">🦆</div>
			<h4 class="text-lg font-bold text-ink-gray-9">{{ __('Duck Dash Quiz') }}</h4>
			<p class="text-sm text-ink-gray-5">{{ __('Answer correctly to move your duck forward and smash the counters.') }}</p>
			<button @click="startGame" class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors">
				{{ __('Start Race') }}
			</button>
		</div>

		<div v-else class="border border-outline-gray-2 bg-surface-white rounded-xl p-5 space-y-4">
			<div class="flex items-center justify-between text-xs text-ink-gray-5">
				<span>{{ __('Round {0} of {1}').format(currentRound, questions.length) }}</span>
				<span>{{ statusText }}</span>
			</div>

			<div class="w-full h-1.5 bg-surface-gray-2 rounded-full overflow-hidden">
				<div class="h-full rounded-full bg-ink-blue-4 transition-all duration-300" :style="{ width: progress + '%' }"></div>
			</div>

			<div class="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 p-4 overflow-hidden min-h-[280px]">
				<div class="absolute inset-x-4 top-12 border-t border-dashed border-white/15"></div>
				<div
					v-for="counter in counters"
					:key="counter.id"
					class="absolute top-1/2 -translate-y-1/2 text-center transition-all duration-300"
					:style="{ left: counter.left + '%' }"
				>
					<div class="text-xs font-semibold text-white/90 mb-1">{{ counter.label }}</div>
					<div class="w-3.5 h-16 mx-auto rounded-full bg-gradient-to-b from-amber-400 to-orange-500 shadow-lg" :class="smashedCounters.includes(counter.id) ? 'opacity-40 grayscale' : ''"></div>
				</div>

				<div class="absolute bottom-6 left-6 right-6">
					<div class="rounded-2xl border border-white/10 bg-white/10 backdrop-blur px-4 py-4 text-white shadow-xl">
						<p class="text-sm font-medium text-white/90 mb-3">{{ currentQuestion.prompt }}</p>
						<div v-if="currentQuestion.type === 'choice'" class="grid gap-2 sm:grid-cols-2">
							<button v-for="choice in currentQuestion.choices" :key="choice" @click="submit(choice)" class="rounded-lg px-3 py-2 text-sm text-left bg-white/10 hover:bg-white/20 transition-colors">
								{{ choice }}
							</button>
						</div>
						<div v-else class="flex gap-2">
							<input v-model="typedAnswer" @keyup.enter="submit(typedAnswer)" class="flex-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none" :placeholder="currentQuestion.placeholder" />
							<button @click="submit(typedAnswer)" class="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-slate-900">
								{{ __('Answer') }}
							</button>
						</div>
					</div>
				</div>

				<div class="absolute top-4 right-4 text-right text-white">
					<div class="text-xs uppercase tracking-[0.2em] text-white/60">{{ __('Duck') }}</div>
					<div class="text-lg font-semibold">{{ duckName }}</div>
				</div>
			</div>

			<div class="flex items-center justify-between text-xs text-ink-gray-5">
				<span>{{ __('Counters smashed: {0}').format(smashedCounters.length) }}</span>
				<span>{{ __('Progress boosts are random') }}</span>
			</div>
		</div>

		<div v-if="gameState === 'finished'" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4">
			<div class="text-4xl">{{ progress >= 100 ? '🏆' : '🦆' }}</div>
			<h4 class="text-lg font-bold text-ink-gray-9">{{ finishTitle }}</h4>
			<p class="text-sm text-ink-gray-5">{{ __('Final score: {0}').format(score) }}</p>
			<p class="text-sm text-ink-gray-5">{{ __('Counters smashed: {0} / {1}').format(smashedCounters.length, counters.length) }}</p>
			<button @click="startGame" class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors">
				{{ __('Race Again') }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { call } from 'frappe-ui'
import { Timer, Trophy } from 'lucide-vue-next'

const props = defineProps({
	classGame: { type: String, default: null },
})

const emit = defineEmits(["completed"])

const duckName = 'Blue Duck'
const gameState = ref('start')
const score = ref(0)
const currentRound = ref(1)
const progress = ref(0)
const timeLeft = ref(45)
const statusText = ref('Ready to race')
const typedAnswer = ref('')
const smashedCounters = ref([])
const sessionId = ref(null)
let timer = null

const questions = [
	{ type: 'choice', prompt: '2 + 3 = ?', choices: ['4', '5', '6', '8'], answer: '5' },
	{ type: 'short', prompt: 'Spell the first month of the year', placeholder: 'Type your answer', answer: 'january' },
	{ type: 'choice', prompt: 'Which is a prime number?', choices: ['9', '12', '13', '15'], answer: '13' },
	{ type: 'short', prompt: 'What is 10 - 4?', placeholder: 'Type a number', answer: '6' },
	{ type: 'choice', prompt: 'Which animal says meow?', choices: ['Dog', 'Cow', 'Cat', 'Duck'], answer: 'Cat' },
]

const counters = [
	{ id: 1, left: 18, label: '1' },
	{ id: 2, left: 36, label: '2' },
	{ id: 3, left: 54, label: '3' },
	{ id: 4, left: 72, label: '4' },
	{ id: 5, left: 88, label: 'Finish' },
]

const currentQuestion = computed(() => questions[currentRound.value - 1] || questions[questions.length - 1])
const finishTitle = computed(() => (progress.value >= 100 ? 'Victory!' : 'Race Complete'))

function resetGame() {
	score.value = 0
	currentRound.value = 1
	progress.value = 0
	timeLeft.value = 45
	statusText.value = 'The race is on'
	typedAnswer.value = ''
	smashedCounters.value = []
	clearInterval(timer)
	timer = null
}

async function startGame() {
	resetGame()
	await startSession()
	gameState.value = 'playing'
	timer = setInterval(() => {
		timeLeft.value -= 1
		if (timeLeft.value <= 0) endGame('Time is up')
	}, 1000)
}

function endGame(status) {
	statusText.value = status
	gameState.value = 'finished'
	recordSession(status)
	clearInterval(timer)
	timer = null
}

async function startSession() {
	if (!props.classGame) return
	const res = await call('lms.lms.api.start_game_session', { class_game: props.classGame })
	sessionId.value = res.session_id
}

async function recordSession(result) {
	if (!sessionId.value) {
		emit('completed')
		return
	}
	await call('lms.lms.api.submit_game_session', {
		session_id: sessionId.value,
		raw_score: score.value,
		metadata: {
			result,
			progress: progress.value,
			counters_smashed: smashedCounters.value.length,
		},
	})
	emit('completed')
}

function boostDuck(correct) {
	if (correct) {
		const boost = 12 + Math.floor(Math.random() * 16)
		progress.value = Math.min(100, progress.value + boost)
		score.value += 10 + boost
		smashedCounters.value.push(counters[Math.min(smashedCounters.value.length, counters.length - 1)].id)
		statusText.value = 'Nice boost!'
	} else {
		progress.value = Math.max(0, progress.value - 8)
		score.value = Math.max(0, score.value - 2)
		statusText.value = 'Penalty!'
	}
}

function submit(answer) {
	if (gameState.value !== 'playing') return
	const expected = currentQuestion.value.answer.toLowerCase().trim()
	const actual = String(answer || '').toLowerCase().trim()
	boostDuck(actual === expected)
	if (progress.value >= 100 || currentRound.value >= questions.length) {
		endGame(progress.value >= 100 ? 'Victory!' : 'Race Complete')
		return
	}
	currentRound.value += 1
	typedAnswer.value = ''
}

onUnmounted(() => {
	clearInterval(timer)
})
</script>
