<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Word Scramble") }}</h3>
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6"><Star class="size-4 text-ink-amber-4" /><span>{{ score }} pts</span></div>
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6"><Heart class="size-4 text-red-500" /><span>{{ lives }}/{{ maxLives }}</span></div>
			</div>
		</div>

		<div v-if="loading" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5 text-sm text-ink-gray-5">{{ __("Loading words...") }}</div>
		<div v-else-if="!words.length" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5 text-sm text-ink-gray-5">{{ __("No words available.") }}</div>
		<template v-else>
			<div class="flex justify-center gap-1.5"><div v-for="(w, idx) in words" :key="idx" class="w-2.5 h-2.5 rounded-full transition-colors" :class="idx < currentIndex ? (wordResults[idx] ? 'bg-green-400' : 'bg-red-400') : idx === currentIndex ? 'bg-ink-blue-4' : 'bg-surface-gray-3'"></div></div>
			<div v-if="!gameOver && currentIndex < words.length" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5">
				<div class="text-center mb-2"><span class="text-xs text-ink-gray-5 bg-surface-gray-1 px-2 py-0.5 rounded-full">{{ words[currentIndex].hint || __("No hint") }}</span></div>
				<div class="text-center mb-4"><span class="text-xs font-medium text-ink-blue-4">{{ getCategoryLabel(words[currentIndex].category) }}</span></div>
				<div class="flex justify-center gap-2 mb-6 flex-wrap">
					<button v-for="(letter, idx) in scrambledLetters" :key="idx" @click="pickLetter(idx)" :disabled="letter.picked" class="w-11 h-11 rounded-lg text-lg font-bold transition-all duration-200 flex items-center justify-center" :class="letter.picked ? 'bg-surface-gray-2 text-ink-gray-3 scale-90' : 'bg-blue-50 dark:bg-blue-900/20 text-ink-blue-5 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer'">{{ letter.char }}</button>
				</div>
				<div class="flex justify-center gap-2 mb-4"><div v-for="(_, idx) in words[currentIndex].answer" :key="idx" class="w-11 h-11 rounded-lg border-2 border-dashed flex items-center justify-center text-lg font-bold transition-all duration-200" :class="answerSlots[idx] ? (isWrong ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-ink-blue-4 bg-blue-50 dark:bg-blue-900/20 text-ink-blue-5') : 'border-outline-gray-2 bg-surface-gray-1'">{{ answerSlots[idx] }}</div></div>
				<div class="flex justify-center gap-3"><button @click="clearAnswer" class="px-4 py-2 rounded-lg bg-surface-gray-2 text-ink-gray-6 text-sm hover:bg-surface-gray-3 transition-colors">{{ __("Clear") }}</button><button @click="checkAnswer" :disabled="answerSlots.filter(Boolean).length < words[currentIndex].answer.length" class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{{ __("Check") }}</button></div>
			</div>
			<div v-else class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4"><div class="text-4xl">{{ score >= 40 ? '🏆' : score >= 20 ? '🌟' : '📚' }}</div><h4 class="text-lg font-bold text-ink-gray-9">{{ __("Game Over!") }}</h4><div class="text-3xl font-bold text-ink-blue-4">{{ score }} pts</div><p class="text-sm text-ink-gray-5">{{ __("Solved {0} out of {1} words").format(correctCount, words.length) }}</p><button @click="resetGame" class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors">{{ __("Play Again") }}</button></div>
		</template>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { call } from "frappe-ui"
import { Star, Heart } from "lucide-vue-next"

const props = defineProps({ classGame: { type: String, default: null } })
const emit = defineEmits(["completed"])
const score = ref(0)
const lives = ref(3)
const maxLives = 3
const currentIndex = ref(0)
const scrambledLetters = ref([])
const answerSlots = ref([])
const isWrong = ref(false)
const gameOver = ref(false)
const wordResults = ref([])
const sessionId = ref(null)
const words = ref([])
const loading = ref(false)

const correctCount = computed(() => wordResults.value.filter(Boolean).length)

function getCategoryLabel(cat) {
	return ({ tech: "💻 Tech", science: "🔬 Science", math: "🔢 Math", history: "📜 History", nature: "🌿 Nature" })[String(cat || "").toLowerCase()] || cat
}

function scrambleWord(word) {
	const letters = word.split("").map((char) => ({ char, picked: false }))
	for (let i = letters.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[letters[i], letters[j]] = [letters[j], letters[i]]
	}
	return letters
}

function loadWord() {
	const word = words.value[currentIndex.value]
	scrambledLetters.value = scrambleWord(word.answer)
	answerSlots.value = new Array(word.answer.length).fill(null)
	isWrong.value = false
}

function pickLetter(idx) {
	if (scrambledLetters.value[idx].picked) return
	scrambledLetters.value[idx].picked = true
	const slotIdx = answerSlots.value.indexOf(null)
	if (slotIdx !== -1) answerSlots.value[slotIdx] = scrambledLetters.value[idx].char
}

function clearAnswer() {
	scrambledLetters.value.forEach((l) => (l.picked = false))
	answerSlots.value = new Array(words.value[currentIndex.value].answer.length).fill(null)
	isWrong.value = false
}

function checkAnswer() {
	const answer = answerSlots.value.join("")
	const correct = words.value[currentIndex.value].answer
	if (answer === correct) {
		score.value += correct.length * 3
		wordResults.value.push(true)
		setTimeout(() => {
			if (currentIndex.value < words.value.length - 1) {
				currentIndex.value++
				loadWord()
			} else {
				gameOver.value = true
				submitScore()
			}
		}, 1000)
	} else {
		lives.value--
		isWrong.value = true
		score.value = Math.max(0, score.value - 2)
		wordResults.value.push(false)
		setTimeout(() => {
			if (lives.value <= 0 || currentIndex.value >= words.value.length - 1) {
				gameOver.value = true
				submitScore()
			} else {
				currentIndex.value++
				loadWord()
			}
		}, 1500)
	}
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
	await call("lms.lms.api.submit_game_session", {
		session_id: sessionId.value,
		raw_score: score.value,
		metadata: { word_results: wordResults.value },
	})
	emit("completed")
}

async function loadWords() {
	loading.value = true
	try {
		const res = await call("lms.lms.api.get_gamification_questions", { question_type: "word_scramble", limit: 10 })
		words.value = (res || [])
			.map((q) => ({ answer: String(q.correct_answer || q.question_text || "").toUpperCase(), hint: q.hint || "", category: q.category || "general" }))
			.filter((w) => w.answer)
		if (!words.value.length) words.value = [{ answer: "ALGORITHM", hint: __("A step-by-step procedure"), category: "tech" }]
	} finally {
		loading.value = false
	}
}

function resetGame() {
	score.value = 0
	lives.value = maxLives
	currentIndex.value = 0
	wordResults.value = []
	gameOver.value = false
	loadWord()
	startSession()
}

onMounted(async () => {
	await loadWords()
	loadWord()
	startSession()
})
</script>
