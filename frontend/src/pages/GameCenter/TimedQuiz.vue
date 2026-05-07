<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Timed Quiz Challenge") }}</h3>
			<div class="flex items-center gap-4">
				<div
					class="flex items-center gap-1.5 text-sm font-medium"
					:class="timeLeft <= 5 ? 'text-red-500' : 'text-ink-gray-6'"
				>
					<Clock class="size-4" />
					<span>{{ timeLeft }}s</span>
				</div>
				<div class="text-sm text-ink-gray-6">
					{{ currentQuestionIndex + 1 }}/{{ questions.length }}
				</div>
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="w-full h-1.5 bg-surface-gray-2 rounded-full overflow-hidden">
			<div
				class="h-full rounded-full transition-all duration-500"
				:class="timeLeft <= 5 ? 'bg-red-400' : 'bg-ink-blue-4'"
				:style="{ width: ((timeLeft / timePerQuestion) * 100) + '%' }"
			></div>
		</div>

		<!-- Quiz Content -->
		<div v-if="!quizFinished" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5">
			<div class="mb-1 text-xs text-ink-gray-5 font-medium">{{ getCategoryLabel(questions[currentQuestionIndex].category) }}</div>
			<h4 class="text-lg font-semibold text-ink-gray-9 mb-5">
				{{ questions[currentQuestionIndex].question }}
			</h4>

			<div class="space-y-2.5">
				<button
					v-for="(option, idx) in questions[currentQuestionIndex].options"
					:key="idx"
					@click="selectAnswer(idx)"
					:disabled="hasAnswered"
					class="w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all duration-200 flex items-center gap-3"
					:class="getOptionClass(idx)"
				>
					<span
						class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
						:class="getOptionLetterClass(idx)"
					>
						{{ String.fromCharCode(65 + idx) }}
					</span>
					<span>{{ option }}</span>
					<CheckCircle2 v-if="hasAnswered && idx === questions[currentQuestionIndex].correct" class="size-5 text-green-500 ml-auto" />
					<XCircle v-if="hasAnswered && selectedAnswer === idx && idx !== questions[currentQuestionIndex].correct" class="size-5 text-red-500 ml-auto" />
				</button>
			</div>
		</div>

		<!-- Results -->
		<div v-if="quizFinished" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4">
			<div class="text-4xl">{{ score >= 4 ? "\u{1F389}" : score >= 2 ? "\u{1F44D}" : "\u{1F4AA}" }}</div>
			<h4 class="text-lg font-bold text-ink-gray-9">{{ __("Quiz Complete!") }}</h4>
			<div class="flex justify-center gap-6">
				<div>
					<div class="text-3xl font-bold text-ink-blue-4">{{ score }}/{{ questions.length }}</div>
					<div class="text-xs text-ink-gray-5">{{ __("Correct") }}</div>
				</div>
				<div>
					<div class="text-3xl font-bold text-ink-amber-5">{{ avgTime }}s</div>
					<div class="text-xs text-ink-gray-5">{{ __("Avg Time") }}</div>
				</div>
			</div>
			<div class="text-sm text-ink-gray-6">
				{{ getResultMessage() }}
			</div>
			<button
				@click="resetQuiz"
				class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors"
			>
				{{ __("Play Again") }}
			</button>
		</div>

		<!-- Score Tracker -->
		<div class="flex justify-center gap-1.5">
			<div
				v-for="(q, idx) in questions"
				:key="idx"
				class="w-3 h-3 rounded-full transition-colors"
				:class="getDotClass(idx)"
			></div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue"
import { call } from "frappe-ui"
import { Clock, CheckCircle2, XCircle } from "lucide-vue-next"

const props = defineProps({
	classGame: { type: String, default: null },
})

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
let timerInterval = null

const questions = [
	{
		question: "What does HTML stand for?",
		options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
		correct: 0,
		category: "tech",
	},
	{
		question: "Which planet is known as the Red Planet?",
		options: ["Venus", "Mars", "Jupiter", "Saturn"],
		correct: 1,
		category: "science",
	},
	{
		question: "What is 15% of 200?",
		options: ["20", "25", "30", "35"],
		correct: 2,
		category: "math",
	},
	{
		question: "Who painted the Mona Lisa?",
		options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"],
		correct: 2,
		category: "art",
	},
	{
		question: "What is the chemical symbol for gold?",
		options: ["Go", "Gd", "Au", "Ag"],
		correct: 2,
		category: "science",
	},
	{
		question: "Which language has the most native speakers?",
		options: ["English", "Spanish", "Hindi", "Mandarin Chinese"],
		correct: 3,
		category: "general",
	},
	{
		question: "What is the speed of light approximately?",
		options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"],
		correct: 0,
		category: "science",
	},
	{
		question: "In which year did World War II end?",
		options: ["1943", "1944", "1945", "1946"],
		correct: 2,
		category: "history",
	},
]

const avgTime = computed(() => {
	if (!questionTimes.value.length) return 0
	return (questionTimes.value.reduce((a, b) => a + b, 0) / questionTimes.value.length).toFixed(1)
})

function getCategoryLabel(cat) {
	const labels = {
		tech: "\u{1F4BB} Technology",
		science: "\u{1F52C} Science",
		math: "\u{1F522} Mathematics",
		art: "\u{1F3A8} Art",
		general: "\u{1F30D} General",
		history: "\u{1F4DC} History",
	}
	return labels[cat] || cat
}

function startTimer() {
	questionStartTime.value = Date.now()
	timeLeft.value = timePerQuestion
	clearInterval(timerInterval)
	timerInterval = setInterval(() => {
		timeLeft.value--
		if (timeLeft.value <= 0) {
			clearInterval(timerInterval)
			if (!hasAnswered.value) {
				hasAnswered.value = true
				questionTimes.value.push(timePerQuestion)
				setTimeout(nextQuestion, 1200)
			}
		}
	}, 1000)
}

function selectAnswer(idx) {
	if (hasAnswered.value) return
	hasAnswered.value = true
	selectedAnswer.value = idx
	clearInterval(timerInterval)
	const elapsed = (Date.now() - questionStartTime.value) / 1000
	questionTimes.value.push(Math.round(elapsed))
	if (idx === questions[currentQuestionIndex.value].correct) {
		score.value++
	}
	setTimeout(nextQuestion, 1200)
}

function nextQuestion() {
	if (currentQuestionIndex.value < questions.length - 1) {
		currentQuestionIndex.value++
		selectedAnswer.value = null
		hasAnswered.value = false
		startTimer()
	} else {
		quizFinished.value = true
		clearInterval(timerInterval)
		submitScore()
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
		raw_score: score.value * 100,
		metadata: { question_times: questionTimes.value },
	})
	emit("completed")
}

function getOptionClass(idx) {
	if (!hasAnswered.value) {
		return selectedAnswer.value === idx
			? "border-ink-blue-4 bg-blue-50 dark:bg-blue-900/20"
			: "border-outline-gray-2 hover:border-outline-gray-3 hover:bg-surface-gray-1"
	}
	if (idx === questions[currentQuestionIndex.value].correct) {
		return "border-green-400 bg-green-50 dark:bg-green-900/20"
	}
	if (selectedAnswer.value === idx) {
		return "border-red-400 bg-red-50 dark:bg-red-900/20"
	}
	return "border-outline-gray-2 opacity-50"
}

function getOptionLetterClass(idx) {
	if (!hasAnswered.value) {
		return "bg-surface-gray-2 text-ink-gray-6"
	}
	if (idx === questions[currentQuestionIndex.value].correct) {
		return "bg-green-500 text-white"
	}
	if (selectedAnswer.value === idx) {
		return "bg-red-500 text-white"
	}
	return "bg-surface-gray-2 text-ink-gray-4"
}

function getDotClass(idx) {
	if (idx === currentQuestionIndex.value && !quizFinished.value) return "bg-ink-blue-4"
	if (idx < currentQuestionIndex.value || quizFinished.value) {
		return answeredCorrectly(idx) ? "bg-green-400" : "bg-red-400"
	}
	return "bg-surface-gray-3"
}

function answeredCorrectly(idx) {
	return idx < questionTimes.value.length && score.value > 0
}

function getResultMessage() {
	const pct = (score.value / questions.length) * 100
	if (pct >= 80) return __("Outstanding! You're a quiz master! \u{1F3C6}")
	if (pct >= 60) return __("Great job! Keep up the good work! \u{1F31F}")
	if (pct >= 40) return __("Not bad! Room for improvement. \u{1F4AA}")
	return __("Keep practicing! You'll get better! \u{1F4DA}")
}

function resetQuiz() {
	currentQuestionIndex.value = 0
	selectedAnswer.value = null
	hasAnswered.value = false
	score.value = 0
	quizFinished.value = false
	questionTimes.value = []
	startTimer()
	startSession()
}

onUnmounted(() => {
	clearInterval(timerInterval)
})

startTimer()
startSession()
</script>
