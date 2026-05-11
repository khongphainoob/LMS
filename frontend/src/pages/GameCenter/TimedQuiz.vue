<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Timed Quiz Challenge") }}</h3>
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-1.5 text-sm font-medium" :class="timeLeft <= 5 ? 'text-red-500' : 'text-ink-gray-6'"><Clock class="size-4" /><span>{{ timeLeft }}s</span></div>
				<div class="text-sm text-ink-gray-6">{{ currentQuestionIndex + 1 }}/{{ questions.length }}</div>
			</div>
		</div>
		<div v-if="loading" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5 text-sm text-ink-gray-5">{{ __("Loading questions...") }}</div>
		<div v-else-if="!questions.length" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5 text-sm text-ink-gray-5">{{ __("No questions available.") }}</div>
		<template v-else>
			<div class="w-full h-1.5 bg-surface-gray-2 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-500" :class="timeLeft <= 5 ? 'bg-red-400' : 'bg-ink-blue-4'" :style="{ width: ((timeLeft / timePerQuestion) * 100) + '%' }"></div></div>
			<div v-if="!quizFinished" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5">
				<div class="mb-1 text-xs text-ink-gray-5 font-medium">{{ getCategoryLabel(questions[currentQuestionIndex].category) }}</div>
				<h4 class="text-lg font-semibold text-ink-gray-9 mb-5">{{ questions[currentQuestionIndex].question }}</h4>
				<div class="space-y-2.5">
					<button v-for="(option, idx) in questions[currentQuestionIndex].options" :key="idx" @click="selectAnswer(idx)" :disabled="hasAnswered" class="w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all duration-200 flex items-center gap-3" :class="getOptionClass(idx)">
						<span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" :class="getOptionLetterClass(idx)">{{ String.fromCharCode(65 + idx) }}</span>
						<span>{{ option }}</span>
					</button>
				</div>
			</div>
			<div v-else class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4">
				<div class="text-4xl">🎉</div>
				<h4 class="text-lg font-bold text-ink-gray-9">{{ __("Quiz Complete!") }}</h4>
				<div class="flex justify-center gap-6"><div><div class="text-3xl font-bold text-ink-blue-4">{{ score }}/{{ questions.length }}</div><div class="text-xs text-ink-gray-5">{{ __("Correct") }}</div></div><div><div class="text-3xl font-bold text-ink-amber-5">{{ avgTime }}s</div><div class="text-xs text-ink-gray-5">{{ __("Avg Time") }}</div></div></div>
				<div class="text-sm text-ink-gray-6">{{ getResultMessage() }}</div>
				<button @click="resetQuiz" class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors">{{ __("Play Again") }}</button>
			</div>
		</template>
	</div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue"
import { call } from "frappe-ui"
import { Clock } from "lucide-vue-next"

const props = defineProps({ classGame: { type: String, default: null } })
const emit = defineEmits(["completed"])
const timePerQuestion = 15
const timeLeft = ref(timePerQuestion)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const hasAnswered = ref(false)
const score = ref(0)
const quizFinished = ref(false)
const questionTimes = ref([])
const questionStartTime = ref(null)
const sessionId = ref(null)
const questions = ref([])
const loading = ref(false)
let timerInterval = null

const fallbackQuestions = [
	{ question: __("What does HTML stand for?"), options: ["Hyper Text Markup Language", "High Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"], correct: 0, category: "tech" },
	{ question: __("Which planet is known as the Red Planet?"), options: ["Mars", "Venus", "Jupiter", "Mercury"], correct: 0, category: "science" },
	{ question: __("Which animal says meow?"), options: ["Cat", "Dog", "Cow", "Duck"], correct: 0, category: "general" },
	{ question: __("What is 2 + 2?"), options: ["3", "4", "5", "6"], correct: 1, category: "math" },
	{ question: __("Which language is used for web pages?"), options: ["Python", "HTML", "Swift", "C#"], correct: 1, category: "tech" },
]

const avgTime = computed(() => (!questionTimes.value.length ? 0 : (questionTimes.value.reduce((a, b) => a + b, 0) / questionTimes.value.length).toFixed(1)))
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || { question: "", options: [], correct: 0, category: "general" })

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
	const correctIndex = options.findIndex((o) => o.is_correct)
	return {
		question: q?.question || q?.question_text || "",
		options: options.map((o) => o.label).filter(Boolean),
		correct: correctIndex >= 0 ? correctIndex : 0,
		category: String(q?.category || "general").toLowerCase(),
	}
}

async function loadQuestions() {
	loading.value = true
	try {
		const res = await call("lms.lms.api.get_gamification_questions", { question_type: "mcq", limit: 8 })
		const loaded = (res || []).map(normalizeQuestion).filter((q) => q.question && q.options.length)
		questions.value = [...loaded, ...fallbackQuestions].slice(0, 8)
	} finally {
		loading.value = false
	}
}

function getCategoryLabel(cat) { return ({ tech: "💻 Technology", science: "🔬 Science", math: "🔢 Mathematics", art: "🎨 Art", general: "🌍 General", history: "📜 History" })[cat] || cat }
function startTimer() { questionStartTime.value = Date.now(); timeLeft.value = timePerQuestion; clearInterval(timerInterval); timerInterval = setInterval(() => { timeLeft.value--; if (timeLeft.value <= 0) { clearInterval(timerInterval); if (!hasAnswered.value) { hasAnswered.value = true; questionTimes.value.push(timePerQuestion); setTimeout(nextQuestion, 1200) } } }, 1000) }
function selectAnswer(idx) { if (hasAnswered.value || !currentQuestion.value.options.length) return; hasAnswered.value = true; selectedAnswer.value = idx; clearInterval(timerInterval); const elapsed = (Date.now() - questionStartTime.value) / 1000; questionTimes.value.push(Math.round(elapsed)); if (idx === currentQuestion.value.correct) score.value++; setTimeout(nextQuestion, 1200) }
function nextQuestion() { if (currentQuestionIndex.value < questions.value.length - 1) { currentQuestionIndex.value++; selectedAnswer.value = null; hasAnswered.value = false; startTimer() } else { quizFinished.value = true; clearInterval(timerInterval); submitScore() } }
async function startSession() { if (!props.classGame) return; const res = await call("lms.lms.api.start_game_session", { class_game: props.classGame }); sessionId.value = res.session_id }
async function submitScore() { if (!sessionId.value) { emit("completed"); return } await call("lms.lms.api.submit_game_session", { session_id: sessionId.value, raw_score: score.value * 100, metadata: { question_times: questionTimes.value } }); emit("completed") }
function getOptionClass(idx) { if (!hasAnswered.value) return selectedAnswer.value === idx ? "border-ink-blue-4 bg-blue-50 dark:bg-blue-900/20" : "border-outline-gray-2 hover:border-outline-gray-3 hover:bg-surface-gray-1"; if (idx === currentQuestion.value.correct) return "border-green-400 bg-green-50 dark:bg-green-900/20"; if (selectedAnswer.value === idx) return "border-red-400 bg-red-50 dark:bg-red-900/20"; return "border-outline-gray-2 opacity-50" }
function getOptionLetterClass(idx) { if (!hasAnswered.value) return "bg-surface-gray-2 text-ink-gray-6"; if (idx === currentQuestion.value.correct) return "bg-green-500 text-white"; if (selectedAnswer.value === idx) return "bg-red-500 text-white"; return "bg-surface-gray-2 text-ink-gray-4" }
function getResultMessage() { const pct = (score.value / questions.value.length) * 100; if (pct >= 80) return __("Outstanding! You're a quiz master! 🏆"); if (pct >= 60) return __("Great job! Keep up the good work! 🌟"); if (pct >= 40) return __("Not bad! Room for improvement. 💪"); return __("Keep practicing! You'll get better! 📚") }
function resetQuiz() { currentQuestionIndex.value = 0; selectedAnswer.value = null; hasAnswered.value = false; score.value = 0; quizFinished.value = false; questionTimes.value = []; startTimer(); startSession() }
onUnmounted(() => { clearInterval(timerInterval) })
await loadQuestions(); startTimer(); startSession()
</script>
