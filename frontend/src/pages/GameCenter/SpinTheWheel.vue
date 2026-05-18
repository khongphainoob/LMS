<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Wheel of Trivia Challenge") }}</h3>
			<div class="flex items-center gap-4">
				<div class="text-sm font-semibold text-amber-600">
					{{ __("Points: {0}").format(totalPoints) }}
				</div>
				<div class="text-sm text-ink-gray-6">
					{{ __("Spins: {0}/5").format(5 - spinsLeft) }}
				</div>
			</div>
		</div>

		<div v-if="!finished" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6">
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
								stroke-width="1.5"
							/>
							<!-- Text label (Category) -->
							<text
								:x="wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * (textRadius - 8)"
								:y="wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * (textRadius - 8)"
								text-anchor="middle"
								dominant-baseline="middle"
								:transform="`rotate(${getSegmentAngle(idx) * (180 / Math.PI) + 90}, ${wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * (textRadius - 8)}, ${wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * (textRadius - 8)})`"
								fill="white"
								class="font-bold pointer-events-none"
								style="font-size: 8px;"
							>
								{{ segment.label }}
							</text>
							<!-- Text value (Points) -->
							<text
								:x="wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * (textRadius - 28)"
								:y="wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * (textRadius - 28)"
								text-anchor="middle"
								dominant-baseline="middle"
								:transform="`rotate(${getSegmentAngle(idx) * (180 / Math.PI) + 90}, ${wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * (textRadius - 28)}, ${wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * (textRadius - 28)})`"
								fill="white"
								class="pointer-events-none font-extrabold"
								style="font-size: 9px; opacity: 0.9;"
							>
								{{ segment.points }}
							</text>
						</g>
						<circle :cx="wheelSize / 2" :cy="wheelSize / 2" :r="20" fill="white" class="shadow-sm" />
						<circle :cx="wheelSize / 2" :cy="wheelSize / 2" :r="8" fill="#F59E0B" />
					</svg>
				</div>
			</div>

			<!-- Spin Button -->
			<div class="text-center">
				<button
					@click="spin"
					:disabled="isSpinning || spinsLeft <= 0 || activeQuestion !== null"
					class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
					:class="isSpinning || spinsLeft <= 0 || activeQuestion !== null
						? 'bg-surface-gray-2 text-ink-gray-4 cursor-not-allowed'
						: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95'"
				>
					{{ isSpinning ? __("Spinning...") : __("SPIN THE WHEEL!") }}
				</button>
				<div class="text-xs text-ink-gray-5 mt-2">
					{{ __("Spins left: {0}").format(spinsLeft) }}
				</div>
			</div>

			<!-- Trivia Challenge Overlay -->
			<transition
				enter-active-class="transition-all duration-300"
				enter-from-class="opacity-0 scale-95"
				leave-active-class="transition-all duration-200"
				leave-to-class="opacity-0 scale-95"
			>
				<div v-if="activeQuestion" class="mt-6 border border-outline-gray-2 bg-surface-gray-1/40 rounded-xl p-5 space-y-4 shadow-inner">
					<div class="flex items-center justify-between border-b pb-2">
						<span class="text-xs font-extrabold text-amber-600 uppercase tracking-wide">
							Challenge: {{ activeCategoryName }}
						</span>
						<span class="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
							{{ activePoints }} pts
						</span>
					</div>
					
					<h4 class="text-sm font-bold text-ink-gray-9 leading-relaxed">
						{{ activeQuestion.q }}
					</h4>
					
					<div class="space-y-2">
						<button
							v-for="(option, idx) in activeQuestion.a"
							:key="idx"
							@click="submitTriviaAnswer(idx)"
							:disabled="answered"
							class="w-full text-left px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all duration-200"
							:class="getOptionClass(idx)"
						>
							{{ option }}
						</button>
					</div>

					<div v-if="answered" class="text-center pt-2">
						<div class="text-xs font-bold" :class="answerCorrect ? 'text-green-600' : 'text-red-500'">
							{{ answerCorrect ? `🎉 Correct! +${activePoints} points!` : `❌ Wrong! The correct answer was: ${activeQuestion.a[activeQuestion.c]}` }}
						</div>
						<button
							@click="nextSpin"
							class="mt-3 px-4 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 shadow transition-all active:scale-95"
						>
							{{ spinsLeft > 0 ? __("Next Spin") : __("Finish Game") }}
						</button>
					</div>
				</div>
			</transition>
		</div>

		<!-- Complete screen -->
		<div v-if="finished" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4 shadow-sm">
			<div class="text-4xl">👑</div>
			<h4 class="text-lg font-bold text-ink-gray-9">{{ __("Trivia Challenge Complete!") }}</h4>
			<div class="text-3xl font-extrabold text-amber-500">{{ totalPoints }} pts</div>
			<p class="text-sm text-ink-gray-5">
				{{ __("You successfully completed the Wheel of Trivia!") }}
			</p>
			<button
				@click="resetGame"
				class="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors shadow active:scale-95"
			>
				{{ __("Play Again") }}
			</button>
		</div>

		<!-- History -->
		<div v-if="history.length" class="flex items-center gap-2 justify-center flex-wrap">
			<span class="text-xs text-ink-gray-5">{{ __("History:") }}</span>
			<span
				v-for="(h, idx) in history"
				:key="idx"
				class="text-xs px-2 py-0.5 rounded-full font-medium"
				:class="h === 'miss'
					? 'bg-red-100 text-red-600'
					: 'bg-amber-100 text-amber-700'"
			>
				{{ h === 'miss' ? __("Incorrect") : "+" + h }}
			</span>
		</div>
	</div>
</template>

<script setup>
import { useGameSession } from '@/utils/gameSession'
import { ref, computed, watch } from "vue"

const props = defineProps({
	classGame: { type: [String, Number], default: null }
})
const emit = defineEmits(['finished'])

const { startGame: _startGame, submitScore, submitResult, startError, gameConfig } = useGameSession(props.classGame)

// Auto-start session when classGame is provided
if (props.classGame) {
	_startGame()
}

async function _submitAndFinish() {
	if (!props.classGame) return
	const rawScore = Math.round(totalPoints.value)
	await submitScore(rawScore, {})
	emit('finished', submitResult.value || { score: rawScore, max_score: 500 })
}

const wheelSize = 280
const textRadius = (wheelSize / 2) - 15
const rotation = ref(0)
const isSpinning = ref(false)
const showResult = ref(false)
const lastResult = ref(null)
const totalPoints = ref(0)
const spinsLeft = ref(5)
const history = ref([])
const finished = ref(false)

// Trivia State
const activeQuestion = ref(null)
const selectedAnswer = ref(null)
const answered = ref(false)
const answerCorrect = ref(null)
const activePoints = ref(0)
const activeCategoryName = ref("")

const segments = [
	{ points: 120, label: "Science 🔬", category: "science", color: "#06B6D4" },
	{ points: 100, label: "History ⏳", category: "history", color: "#14B8A6" },
	{ points: 150, label: "Geography 🌍", category: "geography", color: "#F97316" },
	{ points: 220, label: "Math 🧮", category: "math", color: "#6366F1" },
	{ points: 300, label: "Tech 💻", category: "tech", color: "#84CC16" },
	{ points: 140, label: "Lit 📚", category: "literature", color: "#475569" },
]

const questionsDb = ref({
	science: [
		{ q: "What is the powerhouse of the cell?", a: ["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"], c: 0 },
		{ q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], c: 1 },
		{ q: "What is the chemical symbol for water?", a: ["O2", "CO2", "H2O", "NaCl"], c: 2 }
	],
	history: [
		{ q: "Who was the first President of the United States?", a: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"], c: 2 },
		{ q: "In which year did World War II end?", a: ["1918", "1945", "1939", "1950"], c: 1 },
		{ q: "Which empire built the Colosseum in Rome?", a: ["Greek Empire", "Roman Empire", "Egyptian Empire", "Persian Empire"], c: 1 }
	],
	geography: [
		{ q: "What is the capital city of France?", a: ["London", "Berlin", "Rome", "Paris"], c: 3 },
		{ q: "Which is the largest ocean on Earth?", a: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"], c: 2 },
		{ q: "Which river is the longest in the world?", a: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"], c: 1 }
	],
	math: [
		{ q: "What is the square root of 144?", a: ["10", "11", "12", "14"], c: 2 },
		{ q: "Solve: 8 + 4 * 2", a: ["24", "16", "20", "14"], c: 1 },
		{ q: "How many sides does a hexagon have?", a: ["5", "6", "7", "8"], c: 1 }
	],
	tech: [
		{ q: "What does CPU stand for?", a: ["Central Process Unit", "Computer Personal Unit", "Central Processing Unit", "Core Processing Utility"], c: 2 },
		{ q: "Who is known as the co-founder of Microsoft?", a: ["Steve Jobs", "Bill Gates", "Elon Musk", "Mark Zuckerberg"], c: 1 },
		{ q: "Which programming language is mainly used for web styling?", a: ["HTML", "Python", "JavaScript", "CSS"], c: 3 }
	],
	literature: [
		{ q: "Who wrote the play 'Romeo and Juliet'?", a: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], c: 1 },
		{ q: "What is the name of the wizarding school in 'Harry Potter'?", a: ["Hogwarts", "Narnia", "Middle-earth", "Camelot"], c: 0 },
		{ q: "Which famous detective was created by Arthur Conan Doyle?", a: ["Hercule Poirot", "Sherlock Holmes", "Batman", "Perry Mason"], c: 1 }
	]
})

watch(gameConfig, (newConfig) => {
	if (newConfig) {
		try {
			const parsed = typeof newConfig === 'string' ? JSON.parse(newConfig) : newConfig
			if (typeof parsed === 'object' && !Array.isArray(parsed)) {
				questionsDb.value = {
					science: parsed.science || questionsDb.value.science,
					tech: parsed.tech || questionsDb.value.tech,
					history: parsed.history || questionsDb.value.history,
					geography: parsed.geography || questionsDb.value.geography,
					literature: parsed.literature || questionsDb.value.literature,
					math: parsed.math || questionsDb.value.math
				}
			}
		} catch (e) {
			console.error("Failed to parse custom wheel questionsDb:", e)
		}
	}
}, { immediate: true })

function getSegmentAngle(idx) {
	const segAngle = (2 * Math.PI) / segments.length
	return (segAngle * idx) + (segAngle / 2)
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
	if (isSpinning.value || spinsLeft.value <= 0 || activeQuestion.value !== null) return
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
		activePoints.value = result.points
		activeCategoryName.value = result.label

		// Pick a random question from category
		const list = questionsDb.value[result.category] || []
		if (list.length === 0) {
			// fallback if custom category is empty
			activeQuestion.value = { q: "No question loaded for this category.", a: ["Ok"], c: 0 }
		} else {
			const qObj = list[Math.floor(Math.random() * list.length)]
			activeQuestion.value = { ...qObj }
		}
		
		selectedAnswer.value = null
		answered.value = false
		answerCorrect.value = null
		
		isSpinning.value = false
	}, 4200)
}

function submitTriviaAnswer(idx) {
	if (answered.value) return
	selectedAnswer.value = idx
	answered.value = true
	
	const correct = idx === activeQuestion.value.c
	answerCorrect.value = correct
	
	if (correct) {
		totalPoints.value += activePoints.value
		history.value.push(activePoints.value)
	} else {
		history.value.push("miss")
	}
}

function nextSpin() {
	activeQuestion.value = null
	if (spinsLeft.value <= 0) {
		finished.value = true
		_submitAndFinish()
	}
}

function getOptionClass(idx) {
	if (!answered.value) {
		return "bg-surface-white border-outline-gray-2 text-ink-gray-7 hover:border-outline-gray-3 hover:bg-surface-gray-1"
	}
	if (idx === activeQuestion.value.c) {
		return "bg-green-50 border-green-400 text-green-700 font-bold"
	}
	if (selectedAnswer.value === idx) {
		return "bg-red-50 border-red-400 text-red-700 font-bold"
	}
	return "bg-surface-white border-outline-gray-1 text-ink-gray-4 opacity-50"
}

function resetGame() {
	rotation.value = 0
	isSpinning.value = false
	showResult.value = false
	lastResult.value = null
	totalPoints.value = 0
	spinsLeft.value = 5
	history.value = []
	activeQuestion.value = null
	finished.value = false
}
</script>
