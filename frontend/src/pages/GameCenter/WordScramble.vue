<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Word Scramble") }}</h3>
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Star class="size-4 text-ink-amber-4" />
					<span>{{ score }} pts</span>
				</div>
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Heart class="size-4 text-red-500" />
					<span>{{ lives }}/{{ maxLives }}</span>
				</div>
			</div>
		</div>

		<!-- Progress -->
		<div class="flex justify-center gap-1.5">
			<div
				v-for="(w, idx) in words"
				:key="idx"
				class="w-2.5 h-2.5 rounded-full transition-colors"
				:class="idx < currentIndex ? (wordResults[idx] ? 'bg-green-400' : 'bg-red-400') : idx === currentIndex ? 'bg-ink-blue-4' : 'bg-surface-gray-3'"
			></div>
		</div>

		<!-- Game Content -->
		<div v-if="!gameOver && currentIndex < words.length" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5">
			<!-- Hint -->
			<div class="text-center mb-2">
				<span class="text-xs text-ink-gray-5 bg-surface-gray-1 px-2 py-0.5 rounded-full">
					{{ words[currentIndex].hint }}
				</span>
			</div>

			<!-- Category -->
			<div class="text-center mb-4">
				<span class="text-xs font-medium text-ink-blue-4">{{ getCategoryLabel(words[currentIndex].category) }}</span>
			</div>

			<!-- Scrambled Letters -->
			<div class="flex justify-center gap-2 mb-6 flex-wrap">
				<button
					v-for="(letter, idx) in scrambledLetters"
					:key="idx"
					@click="pickLetter(idx)"
					:disabled="letter.picked"
					class="w-11 h-11 rounded-lg text-lg font-bold transition-all duration-200 flex items-center justify-center"
					:class="letter.picked
						? 'bg-surface-gray-2 text-ink-gray-3 scale-90'
						: 'bg-blue-50 dark:bg-blue-900/20 text-ink-blue-5 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer'"
				>
					{{ letter.char }}
				</button>
			</div>

			<!-- Answer Slots -->
			<div class="flex justify-center gap-2 mb-4">
				<div
					v-for="(_, idx) in words[currentIndex].answer"
					:key="idx"
					class="w-11 h-11 rounded-lg border-2 border-dashed flex items-center justify-center text-lg font-bold transition-all duration-200"
					:class="answerSlots[idx]
						? (isWrong ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-ink-blue-4 bg-blue-50 dark:bg-blue-900/20 text-ink-blue-5')
						: 'border-outline-gray-2 bg-surface-gray-1'"
				>
					{{ answerSlots[idx] }}
				</div>
			</div>

			<!-- Actions -->
			<div class="flex justify-center gap-3">
				<button
					@click="clearAnswer"
					class="px-4 py-2 rounded-lg bg-surface-gray-2 text-ink-gray-6 text-sm hover:bg-surface-gray-3 transition-colors"
				>
					{{ __("Clear") }}
				</button>
				<button
					@click="checkAnswer"
					:disabled="answerSlots.filter(Boolean).length < words[currentIndex].answer.length"
					class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				>
					{{ __("Check") }}
				</button>
				<button
					@click="useHint"
					:disabled="hintsLeft <= 0"
					class="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				>
					{{ __("Hint ({0})").format(hintsLeft) }}
				</button>
			</div>

			<!-- Feedback -->
			<transition
				enter-active-class="transition-all duration-300"
				enter-from-class="opacity-0 -translate-y-2"
				leave-active-class="transition-all duration-200"
				leave-to-class="opacity-0"
			>
				<div v-if="feedback" class="text-center mt-4">
					<div class="text-sm font-medium" :class="feedback.correct ? 'text-green-600' : 'text-red-500'">
						{{ feedback.message }}
					</div>
				</div>
			</transition>
		</div>

		<!-- Game Over -->
		<div v-if="gameOver" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4">
			<div class="text-4xl">{{ score >= 40 ? "\u{1F3C6}" : score >= 20 ? "\u{1F31F}" : "\u{1F4DA}" }}</div>
			<h4 class="text-lg font-bold text-ink-gray-9">{{ __("Game Over!") }}</h4>
			<div class="text-3xl font-bold text-ink-blue-4">{{ score }} pts</div>
			<p class="text-sm text-ink-gray-5">
				{{ __("Solved {0} out of {1} words").format(correctCount, words.length) }}
			</p>
			<button
				@click="resetGame"
				class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors"
			>
				{{ __("Play Again") }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue"
import { Star, Heart } from "lucide-vue-next"
import { useGameSession } from '@/utils/gameSession'

const props = defineProps({
	classGame: { type: [String, Number], default: null }
})
const emit = defineEmits(['finished'])

const { startGame: _startGame, submitScore, submitResult, startError, gameConfig } = useGameSession(props.classGame)

const score = ref(0)
const lives = ref(3)
const maxLives = 3
const currentIndex = ref(0)
const scrambledLetters = ref([])
const answerSlots = ref([])
const isWrong = ref(false)
const feedback = ref(null)
const gameOver = ref(false)
const hintsLeft = ref(3)
const wordResults = ref([])

const words = ref([
	{ answer: "ALGORITHM", hint: "A step-by-step procedure", category: "tech" },
	{ answer: "BACTERIA", hint: "Microscopic organisms", category: "science" },
	{ answer: "CALCULUS", hint: "Branch of mathematics", category: "math" },
	{ answer: "DEMOCRACY", hint: "System of government", category: "history" },
	{ answer: "ELEPHANT", hint: "Largest land animal", category: "nature" },
	{ answer: "FRICTION", hint: "Force that opposes motion", category: "science" },
	{ answer: "GEOMETRY", hint: "Study of shapes", category: "math" },
	{ answer: "HYDROGEN", hint: "Lightest element", category: "science" },
	{ answer: "INTERNET", hint: "Global network", category: "tech" },
	{ answer: "JUPITER", hint: "Largest planet", category: "science" },
])

const correctCount = computed(() => wordResults.value.filter(Boolean).length)

function getCategoryLabel(cat) {
	const labels = {
		tech: "\u{1F4BB} Tech",
		science: "\u{1F52C} Science",
		math: "\u{1F522} Math",
		history: "\u{1F4DC} History",
		nature: "\u{1F33F} Nature",
	}
	return labels[cat] || cat
}

function scrambleWord(word) {
	const letters = word.split("").map((char) => ({ char, picked: false }))
	for (let i = letters.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[letters[i], letters[j]] = [letters[j], letters[i]]
	}
	if (letters.map((l) => l.char).join("") === word && word.length > 1) {
		;[letters[0], letters[1]] = [letters[1], letters[0]]
	}
	return letters
}

function loadWord() {
	if (!words.value || words.value.length === 0) return
	const word = words.value[currentIndex.value]
	scrambledLetters.value = scrambleWord(word.answer)
	answerSlots.value = new Array(word.answer.length).fill(null)
	isWrong.value = false
	feedback.value = null
}

function pickLetter(idx) {
	if (scrambledLetters.value[idx].picked) return
	scrambledLetters.value[idx].picked = true
	const slotIdx = answerSlots.value.indexOf(null)
	if (slotIdx !== -1) {
		answerSlots.value[slotIdx] = scrambledLetters.value[idx].char
	}
}

function clearAnswer() {
	scrambledLetters.value.forEach((l) => (l.picked = false))
	answerSlots.value = new Array(words.value[currentIndex.value].answer.length).fill(null)
	isWrong.value = false
	feedback.value = null
}

function useHint() {
	if (hintsLeft.value <= 0) return
	hintsLeft.value--
	const correct = words.value[currentIndex.value].answer
	for (let i = 0; i < correct.length; i++) {
		if (answerSlots.value[i] !== correct[i]) {
			answerSlots.value[i] = correct[i]
			const letterIdx = scrambledLetters.value.findIndex(
				(l) => l.char === correct[i] && !l.picked
			)
			if (letterIdx !== -1) scrambledLetters.value[letterIdx].picked = true
			break
		}
	}
}

function checkAnswer() {
	const answer = answerSlots.value.join("")
	const correct = words.value[currentIndex.value].answer
	if (answer === correct) {
		const timeBonus = hintsLeft.value > 0 ? 5 : 0
		const baseScore = correct.length * 3
		score.value += baseScore + timeBonus
		wordResults.value.push(true)
		feedback.value = { correct: true, message: __("Correct! +" + (baseScore + timeBonus) + " pts \u{2728}") }
		setTimeout(() => {
			if (currentIndex.value < words.value.length - 1) {
				currentIndex.value++
				loadWord()
			} else {
				gameOver.value = true
				_submitAndFinish()
			}
		}, 1000)
	} else {
		lives.value--
		isWrong.value = true
		score.value = Math.max(0, score.value - 2)
		feedback.value = { correct: false, message: __("Wrong! The answer was: " + correct) }
		wordResults.value.push(false)
		setTimeout(() => {
			if (lives.value <= 0) {
				gameOver.value = true
				_submitAndFinish()
			} else if (currentIndex.value < words.value.length - 1) {
				currentIndex.value++
				loadWord()
			} else {
				gameOver.value = true
				_submitAndFinish()
			}
		}, 1500)
	}
}

function applyCustomQuestions() {
	if (gameConfig.value) {
		try {
			const parsed = typeof gameConfig.value === 'string' ? JSON.parse(gameConfig.value) : gameConfig.value
			if (Array.isArray(parsed) && parsed.length > 0) {
				words.value = parsed.map(w => ({
					answer: String(w.answer).toUpperCase(),
					hint: w.hint || '',
					category: w.category || 'general'
				}))
			}
		} catch (e) {
			console.error("Failed to parse custom scrambled words:", e)
		}
	}
}

async function _submitAndFinish() {
	if (!props.classGame) return
	const rawScore = Math.round(score.value)
	await submitScore(rawScore, {})
	emit('finished', submitResult.value || { score: rawScore, max_score: 300 })
}

async function resetGame() {
	score.value = 0
	lives.value = maxLives
	currentIndex.value = 0
	hintsLeft.value = 3
	wordResults.value = []
	gameOver.value = false
	if (props.classGame) {
		await _startGame()
		applyCustomQuestions()
	}
	loadWord()
}

// Auto-start session when classGame is provided
if (props.classGame) {
	_startGame().then(() => {
		applyCustomQuestions()
		loadWord()
	})
} else {
	loadWord()
}
</script>
