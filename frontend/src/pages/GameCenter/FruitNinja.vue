<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __('Fruit Ninja') }}</h3>
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Clock class="size-4" />
					<span>{{ timeLeft }}s</span>
				</div>
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Star class="size-4 text-ink-amber-5" />
					<span>{{ score }} pts</span>
				</div>
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Heart class="size-4 text-red-500" />
					<span>{{ lives }}</span>
				</div>
				<button @click="resetGame" class="text-xs px-3 py-1.5 rounded-md bg-surface-gray-2 hover:bg-surface-gray-3 text-ink-gray-7 transition-colors">
					{{ __('Reset') }}
				</button>
			</div>
		</div>

		<div v-if="gameState === 'start'" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-3">
			<div class="text-4xl">🍉</div>
			<h4 class="text-lg font-bold text-ink-gray-9">{{ __('Fruit Ninja Quiz') }}</h4>
			<p class="text-sm text-ink-gray-5">{{ __('Slice the fruit that matches the prompt before it disappears.') }}</p>
			<button @click="startGame" class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors">
				{{ __('Start Game') }}
			</button>
		</div>

		<div v-else class="border border-outline-gray-2 bg-surface-white rounded-xl p-5 space-y-4">
			<div class="flex items-center justify-between text-xs text-ink-gray-5">
				<span>{{ __('Combo: {0}').format(combo) }}</span>
				<span>{{ statusText }}</span>
			</div>
			<div class="w-full h-1.5 rounded-full bg-surface-gray-2 overflow-hidden">
				<div class="h-full rounded-full bg-ink-blue-4 transition-all duration-300" :style="{ width: timePercent + '%' }"></div>
			</div>

			<div class="relative min-h-[360px] overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-900 via-green-900 to-slate-900 p-4">
				<div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_white,_transparent_40%)]"></div>
				<div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"></div>

				<div v-if="gameState === 'playing'" class="absolute inset-0">
					<button v-for="fruit in visibleFruits" :key="fruit.id" @click="sliceFruit(fruit)" class="absolute flex h-16 w-16 select-none items-center justify-center rounded-full text-3xl shadow-2xl transition-transform duration-150 hover:scale-110 active:scale-95" :style="{ left: fruit.x + '%', top: fruit.y + '%', transform: `rotate(${fruit.spin}deg)` }">
						{{ fruit.emoji }}
					</button>
				</div>

				<div class="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
					<div class="text-xs uppercase tracking-[0.18em] text-white/60">{{ __('Slices') }}</div>
					<div class="text-sm font-medium">{{ score }} / {{ targetScore }}</div>
				</div>
			</div>

			<div class="text-xs text-ink-gray-5 flex items-center justify-between">
				<span>{{ __('Hit fruit before it falls away') }}</span>
				<span>{{ __('Lives lose on misses') }}</span>
			</div>
		</div>

		<div v-if="gameState === 'finished'" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4">
			<div class="text-4xl">{{ score >= targetScore ? '🏆' : '🍉' }}</div>
			<h4 class="text-lg font-bold text-ink-gray-9">{{ finishTitle }}</h4>
			<p class="text-sm text-ink-gray-5">{{ __('Final score: {0}').format(score) }}</p>
			<p class="text-sm text-ink-gray-5">{{ __('Fruits sliced: {0}').format(slicedCount) }}</p>
			<button @click="startGame" class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors">
				{{ __('Play Again') }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { call } from 'frappe-ui'
import { Clock, Heart, Star } from 'lucide-vue-next'

const props = defineProps({
	classGame: { type: String, default: null },
})

const emit = defineEmits(["completed"])

const gameState = ref('start')
const score = ref(0)
const lives = ref(3)
const combo = ref(0)
const slicedCount = ref(0)
const timeLeft = ref(40)
const statusText = ref('Ready to slice')
const visibleFruits = ref([])
const targetScore = 250
const sessionId = ref(null)
const questions = ref([])
const loading = ref(false)
const currentQuestionIndex = ref(0)
let spawnTimer = null
let countdownTimer = null
let fruitId = 0

const fruitEmojiMap = {
	apple: '🍎',
	banana: '🍌',
	grapes: '🍇',
	orange: '🍊',
	watermelon: '🍉',
	mango: '🥭',
	pear: '🍐',
	plum: '🍑',
	peach: '🍑',
	berry: '🍓',
}

const finishTitle = computed(() => (score.value >= targetScore ? 'Perfect Slice!' : 'Game Over'))
const timePercent = computed(() => Math.max((timeLeft.value / 40) * 100, 0))
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null)

const fallbackQuestions = [
	{ prompt: 'Select the fruit that is red', options: ['Apple', 'Banana', 'Grapes', 'Orange'], answer: 'Apple' },
	{ prompt: 'Select the fruit that is yellow', options: ['Apple', 'Banana', 'Grapes', 'Watermelon'], answer: 'Banana' },
	{ prompt: 'Select the fruit that grows in bunches', options: ['Apple', 'Banana', 'Grapes', 'Peach'], answer: 'Grapes' },
	{ prompt: 'Select the big green fruit', options: ['Apple', 'Orange', 'Watermelon', 'Mango'], answer: 'Watermelon' },
	{ prompt: 'Select the tropical fruit', options: ['Banana', 'Mango', 'Pear', 'Plum'], answer: 'Mango' },
]

function resetGame() {
	score.value = 0
	lives.value = 3
	combo.value = 0
	slicedCount.value = 0
	timeLeft.value = 40
	statusText.value = 'The orchard is open'
	visibleFruits.value = []
	currentQuestionIndex.value = 0
	clearInterval(spawnTimer)
	clearInterval(countdownTimer)
	spawnTimer = null
	countdownTimer = null
}

function normalizeLabel(label) {
	return String(label || '').toLowerCase().replace(/[^a-z]/g, '')
}

function fruitForLabel(label, isCorrect) {
	const key = normalizeLabel(label)
	const emoji = fruitEmojiMap[key] || '🍓'
	return {
		id: ++fruitId,
		label,
		emoji,
		points: isCorrect ? 18 : 8,
		x: 10 + Math.random() * 75,
		y: 12 + Math.random() * 55,
		spin: Math.floor(Math.random() * 360),
		expiresAt: Date.now() + 1100,
	}
}

function buildFruitsForQuestion() {
	const question = currentQuestion.value
	if (!question) return []
	const correct = question.answer
	const options = question.options.length ? question.options : [correct]
	return options.map((option) => fruitForLabel(option, option === correct))
}

function loadRound() {
	visibleFruits.value = buildFruitsForQuestion()
	statusText.value = currentQuestion.value?.prompt || 'Slice the correct fruit'
}

function spawnFruit() {
	if (gameState.value !== 'playing') return
	visibleFruits.value = visibleFruits.value.filter((fruit) => {
		if (fruit.expiresAt <= Date.now()) {
			lives.value -= 1
			combo.value = 0
			statusText.value = 'Missed!'
			return false
		}
		return true
	})
	if (visibleFruits.value.length === 0) {
		loadRound()
	}
	if (lives.value <= 0) endGame('Out of lives')
}

async function startGame() {
	resetGame()
	if (!questions.value.length) await loadQuestions()
	if (!questions.value.length) questions.value = fallbackQuestions
	await startSession()
	gameState.value = 'playing'
	loadRound()
	spawnTimer = setInterval(spawnFruit, 350)
	countdownTimer = setInterval(() => {
		timeLeft.value -= 1
		if (timeLeft.value <= 0) endGame('Time is up')
	}, 1000)
}

function endGame(status) {
	statusText.value = status
	gameState.value = 'finished'
	recordSession(status)
	clearInterval(spawnTimer)
	clearInterval(countdownTimer)
	spawnTimer = null
	countdownTimer = null
}

async function startSession() {
	if (!props.classGame) return
	const res = await call('lms.lms.api.start_game_session', { class_game: props.classGame })
	sessionId.value = res.session_id
}

async function loadQuestions() {
	loading.value = true
	try {
		const res = await call('lms.lms.api.get_gamification_questions', { question_type: 'mcq', limit: 5 })
		const loaded = (res || [])
			.map((q) => {
				const options = Array.isArray(q.options) ? q.options.map((o) => o.label).filter(Boolean) : []
				const correctIndex = Array.isArray(q.options) ? Math.max(0, q.options.findIndex((o) => o.is_correct)) : 0
				return {
					prompt: q.question_text,
					options,
					answer: options[correctIndex] || options[0] || '',
				}
			})
			.filter((q) => q.prompt && q.answer)
		questions.value = loaded.length ? loaded : fallbackQuestions
	} finally {
		loading.value = false
	}
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
			combo: combo.value,
			sliced_count: slicedCount.value,
		},
	})
	emit('completed')
}

function sliceFruit(fruit) {
	if (gameState.value !== 'playing') return
	visibleFruits.value = visibleFruits.value.filter((item) => item.id !== fruit.id)
	const correct = currentQuestion.value?.answer || ''
	const isCorrect = String(fruit.label || '').toLowerCase() === String(correct).toLowerCase()
	if (isCorrect) {
		combo.value += 1
		slicedCount.value += 1
		const points = fruit.points + combo.value * 2
		score.value += points
		statusText.value = '+' + points + ' pts'
		currentQuestionIndex.value += 1
		if (currentQuestionIndex.value >= questions.value.length) {
			endGame(score.value >= targetScore ? 'Perfect Slice!' : 'Game Over')
			return
		}
		loadRound()
		return
	}
	lives.value -= 1
	combo.value = 0
	statusText.value = 'Missed!'
	if (lives.value <= 0) endGame('Out of lives')
}

onMounted(async () => {
	await loadQuestions()
	if (!questions.value.length) questions.value = fallbackQuestions
	startSession()
})

onUnmounted(() => {
	clearInterval(spawnTimer)
	clearInterval(countdownTimer)
})
</script>
