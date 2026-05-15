<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Memory Match") }}</h3>
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Trophy class="size-4 text-ink-amber-5" />
					<span>{{ score }} {{ __("points") }}</span>
				</div>
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Timer class="size-4" />
					<span>{{ formatTime(elapsedTime) }}</span>
				</div>
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<MousePointerClick class="size-4" />
					<span>{{ moves }} {{ __("moves") }}</span>
				</div>
				<button
					@click="resetGame"
					class="text-xs px-3 py-1.5 rounded-md bg-surface-gray-2 hover:bg-surface-gray-3 text-ink-gray-7 transition-colors"
				>
					{{ __("Reset") }}
				</button>
			</div>
		</div>

		<div v-if="gameWon" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center">
			<div class="text-4xl mb-3">&#127942;</div>
			<h4 class="text-lg font-bold text-ink-gray-9 mb-1">{{ __("Congratulations!") }}</h4>
			<p class="text-sm text-ink-gray-5 mb-3">
				{{ __("Completed in {0} moves, {1}, and {2} points").format(moves, formatTime(elapsedTime), score) }}
			</p>
			<button
				@click="resetGame"
				class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors"
			>
				{{ __("Play Again") }}
			</button>
		</div>

		<div
			class="grid gap-2.5"
			:style="{
				'grid-template-columns': `repeat(${gridSize}, minmax(0, 1fr))`,
			}"
		>
			<button
				v-for="(card, index) in cards"
				:key="index"
				:disabled="isChecking || card.matched"
				@click="flipCard(index)"
				class="aspect-square rounded-xl text-2xl font-bold transition-all duration-500 cursor-pointer select-none"
				:class="getCardClass(card)"
			>
				<div v-if="card.flipped || card.matched" class="flex flex-col items-center justify-center h-full px-1 text-center">
					<span class="text-[10px] leading-tight">{{ card.text }}</span>
				</div>
				<div v-else class="flex items-center justify-center h-full">
					<HelpCircle class="size-6 text-ink-gray-4" />
				</div>
			</button>
		</div>

		<div class="flex items-center justify-center gap-2">
			<button
				v-for="size in [4, 6, 8]"
				:key="size"
				@click="changeGridSize(size)"
				class="px-3 py-1 rounded text-xs font-medium transition-colors"
				:class="gridSize === size ? 'bg-ink-blue-4 text-white' : 'bg-surface-gray-2 text-ink-gray-6 hover:bg-surface-gray-3'"
			>
				{{ size }}x{{ size }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { call } from "frappe-ui"
import { Timer, MousePointerClick, HelpCircle, Trophy } from "lucide-vue-next"

const props = defineProps({ classGame: { type: String, default: null }, gameSettings: { type: Object, default: () => ({}) } })
const gridSize = ref(4)
const cards = ref([])
const flippedIndices = ref([])
const isChecking = ref(false)
const moves = ref(0)
const elapsedTime = ref(0)
const gameWon = ref(false)
const score = ref(0)
const matchedPairs = ref(0)
const loading = ref(false)
const completionSent = ref(false)
const sessionId = ref(null)
let timerInterval = null

const fallbackPairs = [
	{ question: "What does HTML stand for?", answer: "Hyper Text Markup Language" },
	{ question: "What is 2 + 2?", answer: "4" },
	{ question: "Which planet is called the Blue Planet?", answer: "Earth" },
	{ question: "What color is the sky?", answer: "Blue" },
	{ question: "Which animal barks?", answer: "Dog" },
	{ question: "What do bees make?", answer: "Honey" },
	{ question: "Which season is coldest?", answer: "Winter" },
	{ question: "What is the first letter of the alphabet?", answer: "A" },
]

const questionPairs = ref([])

function shuffleArray(arr) {
	const a = [...arr]
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[a[i], a[j]] = [a[j], a[i]]
	}
	return a
}

function normalizeText(value) {
	return String(value || "").trim()
}

function normalizeQuestion(q) {
	const options = Array.isArray(q?.options)
		? q.options.map((option) => {
			if (typeof option === "string") {
				return { label: option, is_correct: false }
			}
			return {
				label: option?.label || option?.option_value || option?.value || "",
				is_correct: Boolean(option?.is_correct),
			}
		})
		: []
	const correct = options.find((o) => o.is_correct)
	return {
		question: normalizeText(q?.question || q?.question_text),
		answer: normalizeText(correct?.label || q?.correct_answer || q?.correct_option),
	}
}

function initGame() {
	const pairCount = Math.min(Math.floor((gridSize.value * gridSize.value) / 2), questionPairs.value.length)
	const selected = shuffleArray(questionPairs.value).slice(0, pairCount)
	const paired = shuffleArray(
		selected.flatMap((pair, idx) => [
			{ id: `${idx}-q`, pairId: idx, kind: "question", text: pair.question },
			{ id: `${idx}-a`, pairId: idx, kind: "answer", text: pair.answer },
		]),
	)
	cards.value = paired.map((item) => ({ ...item, flipped: false, matched: false }))
	flippedIndices.value = []
	isChecking.value = false
	moves.value = 0
	elapsedTime.value = 0
	gameWon.value = false
	score.value = 0
	matchedPairs.value = 0
	completionSent.value = false
	clearInterval(timerInterval)
	timerInterval = null
}

function resolveGridSize() {
	const value = Number(props.gameSettings?.grid_size || props.gameSettings?.board_size)
	return Number.isFinite(value) && value >= 4 ? value : 4
}

async function startSession() {
	if (!props.classGame) return
	const res = await call("lms.lms.api.start_game_session", { class_game: props.classGame })
	sessionId.value = res.session_id
}

async function submitScore() {
	if (!sessionId.value) {
		emit("completed")
		return
	}
	const timeBonus = Math.max(0, 300 - elapsedTime.value * 3)
	const rawScore = Math.max(0, score.value + timeBonus)
	await call("lms.lms.api.submit_game_session", {
		session_id: sessionId.value,
		raw_score: rawScore,
		metadata: { moves: moves.value, elapsed_time: elapsedTime.value, matched_pairs: matchedPairs.value },
	})
	emit("completed")
}

async function loadPairs(limitOverride) {
	loading.value = true
	try {
		const limit = limitOverride || Math.max(8, Math.floor((gridSize.value * gridSize.value) / 2))
		const res = await call("lms.lms.api.get_gamification_questions", { question_type: "mcq", limit })
		const loaded = (res || [])
			.map(normalizeQuestion)
			.filter((pair) => pair.question && pair.answer)
		questionPairs.value = loaded.length ? loaded : fallbackPairs
	} finally {
		loading.value = false
	}
}

function startTimer() {
	if (timerInterval) return
	timerInterval = setInterval(() => {
		elapsedTime.value++
	}, 1000)
}

function flipCard(index) {
	if (
		isChecking.value ||
		cards.value[index].flipped ||
		cards.value[index].matched ||
		flippedIndices.value.length >= 2
	)
		return

	startTimer()
	cards.value[index].flipped = true
	flippedIndices.value.push(index)

	if (flippedIndices.value.length === 2) {
		moves.value++
		isChecking.value = true
		const [i1, i2] = flippedIndices.value
		if (cards.value[i1].pairId === cards.value[i2].pairId && cards.value[i1].kind !== cards.value[i2].kind) {
			cards.value[i1].matched = true
			cards.value[i2].matched = true
			score.value += 100
			matchedPairs.value += 1
			flippedIndices.value = []
			isChecking.value = false
			if (cards.value.every((c) => c.matched)) {
				gameWon.value = true
				clearInterval(timerInterval)
				if (!completionSent.value) {
					completionSent.value = true
					setTimeout(submitScore, 700)
				}
			}
		} else {
			setTimeout(() => {
				cards.value[i1].flipped = false
				cards.value[i2].flipped = false
				flippedIndices.value = []
				isChecking.value = false
			}, 800)
		}
	}
}

function getCardClass(card) {
	if (card.matched) {
		return "bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 shadow-sm"
	}
	if (card.flipped) {
		return "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-md scale-105"
	}
	return "bg-surface-white border-2 border-outline-gray-2 hover:border-outline-gray-3 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
}

function formatTime(seconds) {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${s.toString().padStart(2, "0")}`
}

function resetGame() {
	initGame()
}

function changeGridSize(size) {
	gridSize.value = size
	const requiredPairs = Math.floor((size * size) / 2)
	if (questionPairs.value.length < requiredPairs) {
		loadPairs(requiredPairs).then(initGame)
		return
	}
	initGame()
}

onMounted(async () => {
	gridSize.value = resolveGridSize()
	await loadPairs()
	initGame()
	await startSession()
})

onUnmounted(() => {
	clearInterval(timerInterval)
})

</script>
