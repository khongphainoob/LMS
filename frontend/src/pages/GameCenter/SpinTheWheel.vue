<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Spin the Wheel") }}</h3>
			<div class="text-sm text-ink-gray-6">
				{{ __("Points: {0}").format(totalPoints) }}
			</div>
		</div>

		<div class="border border-outline-gray-2 bg-surface-white rounded-xl p-6">
			<!-- Wheel -->
			<div class="flex justify-center mb-5">
				<div class="relative" :style="{ width: wheelSize + 'px', height: wheelSize + 'px' }">
					<!-- Pointer -->
					<div class="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
						<div class="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md"></div>
					</div>

					<!-- SVG Wheel -->
					<svg
						:width="wheelSize"
						:height="wheelSize"
						:viewBox="`0 0 ${wheelSize} ${wheelSize}`"
						class="rounded-full shadow-lg"
						:style="{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }"
					>
						<g v-for="(segment, idx) in segments" :key="idx">
							<path
								:d="getSegmentPath(idx)"
								:fill="segment.color"
								stroke="white"
								stroke-width="2"
							/>
							<text
								:x="wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * textRadius"
								:y="wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * textRadius"
								:text-anchor="middle"
								dominant-baseline="middle"
								:transform="`rotate(${getSegmentAngle(idx) * (180 / Math.PI) + 90}, ${wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * textRadius}, ${wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * textRadius})`"
								fill="white"
								class="text-[10px] font-bold pointer-events-none"
								style="font-size: 11px;"
							>
							{{ segment.label }}
							</text>
						<text
							:x="wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * (textRadius - 18)"
							:y="wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * (textRadius - 18)"
							:text-anchor="middle"
							dominant-baseline="middle"
							:transform="`rotate(${getSegmentAngle(idx) * (180 / Math.PI) + 90}, ${wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * (textRadius - 18)}, ${wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * (textRadius - 18)})`"
							fill="white"
							class="pointer-events-none"
							style="font-size: 9px; opacity: 0.8;"
						>
							{{ segment.type === "question" ? __("Answer") : "" }}
						</text>
						</g>
						<circle :cx="wheelSize / 2" :cy="wheelSize / 2" :r="20" fill="white" />
					</svg>
				</div>
			</div>

			<!-- Spin Button -->
			<div class="text-center">
				<button
					@click="spin"
					:disabled="isSpinning || spinsLeft <= 0 || activeQuestion"
					class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
					:class="isSpinning || spinsLeft <= 0
						? 'bg-surface-gray-2 text-ink-gray-4 cursor-not-allowed'
						: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95'"
				>
					{{ isSpinning ? __("Spinning...") : __("SPIN!") }}
				</button>
				<div class="text-xs text-ink-gray-5 mt-2">
					{{ __("Spins left: {0}").format(spinsLeft) }}
				</div>
			</div>

			<!-- Result -->
			<transition
				enter-active-class="transition-all duration-300"
				enter-from-class="opacity-0 scale-90"
				leave-active-class="transition-all duration-200"
				leave-to-class="opacity-0 scale-90"
			>
				<div
					v-if="showResult"
					class="mt-4 text-center p-4 rounded-xl"
					:class="lastResult?.type === 'miss'
						? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
						: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'"
				>
					<div class="text-2xl mb-1">
						{{ lastResult?.type === 'miss' ? "\u{1F614}" : "\u{1F389}" }}
					</div>
					<div class="text-sm font-semibold text-ink-gray-9">
						{{ resultMessage }}
					</div>
				</div>
			</transition>
		</div>

		<div v-if="activeQuestion" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5">
			<div class="text-xs text-ink-gray-5 mb-2">{{ __("Question Round") }}</div>
			<h4 class="text-base font-semibold text-ink-gray-9 mb-4">{{ activeQuestion.prompt }}</h4>
			<div v-if="activeQuestion.mode === 'short'" class="space-y-3">
				<input v-model="shortAnswer" class="w-full rounded-lg border border-outline-gray-2 px-4 py-3 text-sm" :placeholder="__("Type your answer")" />
				<div class="flex items-center gap-2">
					<button @click="submitShortAnswer" class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors">
						{{ __("Submit") }}
					</button>
					<span v-if="questionFeedback" class="text-xs text-ink-gray-5">{{ questionFeedback }}</span>
				</div>
			</div>
			<div v-else class="space-y-2.5">
				<button v-for="(option, idx) in activeQuestion.options" :key="idx" @click="submitOption(option)" class="w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all duration-200 flex items-center gap-3 border-outline-gray-2 hover:border-outline-gray-3 hover:bg-surface-gray-1">
					<span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-surface-gray-2 text-ink-gray-6">{{ String.fromCharCode(65 + idx) }}</span>
					<span>{{ option }}</span>
				</button>
			</div>
		</div>

		<!-- History -->
		<div v-if="history.length" class="flex items-center gap-2 justify-center flex-wrap">
			<span class="text-xs text-ink-gray-5">{{ __("History:") }}</span>
			<span
				v-for="(h, idx) in history.slice(-10)"
				:key="idx"
				class="text-xs px-2 py-0.5 rounded-full font-medium"
				:class="h === 'miss'
					? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
					: h === 'penalty'
						? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
						: h === 'question'
							? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400'
							: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'"
			>
				{{ historyLabel(h) }}
			</span>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue"
import { call } from "frappe-ui"

const props = defineProps({
	classGame: { type: String, default: null },
	gameSettings: { type: Object, default: () => ({}) },
})

const emit = defineEmits(["completed"])

const wheelSize = 280
const textRadius = (wheelSize / 2) - 40
const rotation = ref(0)
const isSpinning = ref(false)
const showResult = ref(false)
const lastResult = ref(null)
const totalPoints = ref(0)
const spinsLeft = ref(5)
const history = ref([])
const sessionId = ref(null)
const questionBank = ref([])
const activeQuestion = ref(null)
const shortAnswer = ref("")
const questionFeedback = ref("")

const segments = [
	{ type: "points", value: 10, label: "+10", color: "#3B82F6" },
	{ type: "miss", label: __("Miss"), color: "#EF4444" },
	{ type: "points", value: 25, label: "+25", color: "#10B981" },
	{ type: "points", value: 5, label: "+5", color: "#F59E0B" },
	{ type: "extra", label: __("Extra"), color: "#8B5CF6" },
	{ type: "miss", label: __("Miss"), color: "#EF4444" },
	{ type: "points", value: 15, label: "+15", color: "#06B6D4" },
	{ type: "question", label: __("Q"), color: "#EC4899" },
	{ type: "miss", label: __("Miss"), color: "#EF4444" },
	{ type: "penalty", value: -20, label: "-20", color: "#14B8A6" },
	{ type: "points", value: 100, label: "+100", color: "#F97316" },
	{ type: "points", value: 5, label: "+5", color: "#6366F1" },
]

const resultMessage = computed(() => {
	if (lastResult.value?.type === "miss") return __("Try again!")
	if (lastResult.value?.type === "extra") return __("Extra turn!")
	if (lastResult.value?.type === "question") return __("Answer to earn points")
	if (lastResult.value?.type === "penalty") return __("Penalty applied")
	if (typeof lastResult.value?.value === "number") {
		const val = lastResult.value.value
		const sign = val >= 0 ? "+" : ""
		return __(sign + val + " points!")
	}
	return ""
})

const spinsAllowed = computed(() => {
	const settingValue = props.gameSettings?.spins ?? props.gameSettings?.rounds ?? props.gameSettings?.max_rounds
	const parsed = Number(settingValue)
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 5
})

function getSegmentAngle(idx) {
	const segAngle = (2 * Math.PI) / segments.length
	return -Math.PI / 2 + segAngle * idx + segAngle / 2
}

function getSegmentPath(idx) {
	const cx = wheelSize / 2
	const cy = wheelSize / 2
	const r = wheelSize / 2 - 2
	const segAngle = (2 * Math.PI) / segments.length
	const startAngle = -Math.PI / 2 + segAngle * idx
	const endAngle = startAngle + segAngle
	const x1 = cx + r * Math.cos(startAngle)
	const y1 = cy + r * Math.sin(startAngle)
	const x2 = cx + r * Math.cos(endAngle)
	const y2 = cy + r * Math.sin(endAngle)
	const largeArc = segAngle > Math.PI ? 1 : 0
	return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

function spin() {
	if (isSpinning.value || spinsLeft.value <= 0) return
	isSpinning.value = true
	showResult.value = false
	spinsLeft.value--

	const spinAmount = 1800 + Math.random() * 1440
	rotation.value += spinAmount

	setTimeout(() => {
		const normalizedDeg = (rotation.value % 360 + 360) % 360
		const segAngle = 360 / segments.length
		const pointerAngle = (360 - normalizedDeg + 90) % 360
		const segIndex = Math.floor(pointerAngle / segAngle) % segments.length
		const result = segments[segIndex]

		lastResult.value = result
		showResult.value = true

		if (result.type === "points") {
			totalPoints.value += result.value
			history.value.push(result.value)
		}
		if (result.type === "miss") {
			history.value.push(result.type)
		}
		if (result.type === "penalty") {
			totalPoints.value = Math.max(0, totalPoints.value + result.value)
			history.value.push(result.type)
		}
		if (result.type === "extra") {
			spinsLeft.value += 1
			history.value.push(result.type)
		}
		if (result.type === "question") {
			activateQuestion()
			history.value.push(result.type)
		}
		isSpinning.value = false
		if (spinsLeft.value <= 0) submitScore()
	}, 4200)
}

function normalizeQuestion(q) {
	const options = Array.isArray(q?.options)
		? q.options.map((option) => {
			if (typeof option === "string") return { label: option, is_correct: false }
			return { label: option?.label || option?.option_value || option?.value || "", is_correct: Boolean(option?.is_correct) }
		})
		: []
	const correctIndex = options.findIndex((o) => o.is_correct)
	const labels = options.map((o) => o.label).filter(Boolean)
	const shortAnswerValue = q?.correct_answer || q?.correct_option || ""
	return {
		prompt: q?.question || q?.question_text || "",
		options: labels,
		answer: labels[correctIndex >= 0 ? correctIndex : 0] || shortAnswerValue,
		mode: labels.length ? "mcq" : shortAnswerValue ? "short" : "mcq",
	}
}

async function loadQuestions() {
	const res = await call("lms.lms.api.get_gamification_questions", { question_type: "mcq", limit: 8 })
	questionBank.value = (res || []).map(normalizeQuestion).filter((q) => q.prompt && q.answer)
}

function activateQuestion() {
	if (!questionBank.value.length) return
	activeQuestion.value = questionBank.value[Math.floor(Math.random() * questionBank.value.length)]
	shortAnswer.value = ""
	questionFeedback.value = ""
}

function submitOption(option) {
	if (!activeQuestion.value) return
	const expected = String(activeQuestion.value.answer || "").toLowerCase().trim()
	const actual = String(option || "").toLowerCase().trim()
	const correct = expected && actual ? expected === actual : false
	questionFeedback.value = correct ? __("Correct") : __("Incorrect")
	if (correct) totalPoints.value += 50
	setTimeout(() => {
		activeQuestion.value = null
		questionFeedback.value = ""
	}, 800)
}

function submitShortAnswer() {
	if (!activeQuestion.value) return
	const expected = String(activeQuestion.value.answer || "").toLowerCase().trim()
	const actual = String(shortAnswer.value || "").toLowerCase().trim()
	const correct = expected && actual ? expected === actual : false
	questionFeedback.value = correct ? __("Correct") : __("Incorrect")
	if (correct) totalPoints.value += 50
	setTimeout(() => {
		activeQuestion.value = null
		questionFeedback.value = ""
	}, 800)
}

function historyLabel(item) {
	if (item === "miss") return __("Miss")
	if (item === "extra") return __("Extra")
	if (item === "question") return __("Question")
	if (item === "penalty") return __("Penalty")
	if (typeof item === "number") return "+" + item
	return String(item || "")
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
		raw_score: totalPoints.value,
		metadata: { history: history.value },
	})
	emit("completed")
}

onMounted(async () => {
	spinsLeft.value = spinsAllowed.value
	await loadQuestions()
	startSession()
})
</script>
