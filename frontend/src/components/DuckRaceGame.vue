<template>
	<div class="duck-race-game">
		<div class="hud">
			<div>
				<div class="hud-label">Score</div>
				<div class="hud-value">{{ score }}</div>
			</div>
			<div>
				<div class="hud-label">Round</div>
				<div class="hud-value">{{ currentRound }} / {{ questions.length }}</div>
			</div>
			<div>
				<div class="hud-label">Time</div>
				<div class="hud-value">{{ timeLeft }}s</div>
			</div>
		</div>

		<div v-if="gameState === 'start'" class="overlay">
			<div class="panel intro-panel">
				<h1>Duck Dash Quiz</h1>
				<p>Answer correctly to get a random boost and smash the counters.</p>
				<p class="muted">Wrong answers trigger random penalties.</p>
				<Button variant="solid" @click="startGame">Start Race</Button>
			</div>
		</div>

		<div v-if="gameState === 'finished'" class="overlay">
			<div class="panel intro-panel">
				<h1>{{ finishTitle }}</h1>
				<p>Final score: {{ score }}</p>
				<p class="muted">Counters smashed: {{ smashedCounters.length }} / {{ counters.length }}</p>
				<Button variant="solid" @click="startGame">Race Again</Button>
			</div>
		</div>

		<div class="track-shell">
			<div class="track-header">
				<div class="track-title">Race Track</div>
				<div class="track-status">{{ statusText }}</div>
			</div>

			<div class="track">
				<div class="lane lane-top"></div>
				<div class="lane lane-bottom"></div>

				<div
					v-for="counter in counters"
					:key="counter.id"
					class="counter"
					:class="{ broken: smashedCounters.includes(counter.id) }"
					:style="{ left: counter.position + '%' }"
				>
					<div class="counter-top">{{ counter.label }}</div>
					<div class="counter-base"></div>
				</div>

				<div class="finish-line"></div>

				<div class="duck-wrap" :style="{ left: duckPosition + '%' }">
					<div class="duck-shadow"></div>
					<div class="duck">🦆</div>
					<div class="duck-name">{{ playerName }}</div>
				</div>
			</div>

			<div v-if="lastEffect" class="effect-banner" :class="lastEffect.kind">
				{{ lastEffect.text }}
			</div>
		</div>

		<div class="quiz-shell">
			<div v-if="!activeQuestion" class="panel">
				<p>Loading question...</p>
			</div>

			<div v-else class="panel question-panel">
				<div class="question-meta">
					<span>{{ activeQuestion.type === 'short' ? 'Short answer' : 'Multiple choice' }}</span>
					<span>{{ activeQuestion.points }} pts</span>
				</div>
				<h2 class="question-title">{{ activeQuestion.prompt }}</h2>

				<div v-if="activeQuestion.type === 'choice'" class="choices">
					<button
						v-for="choice in activeQuestion.choices"
						:key="choice"
						class="choice-btn"
						:disabled="locked"
						@click="submitChoice(choice)"
					>
						{{ choice }}
					</button>
				</div>

				<div v-else class="short-answer">
					<input
						v-model="answerInput"
						type="text"
						:placeholder="activeQuestion.placeholder"
						:disabled="locked"
						@keydown.enter="submitShortAnswer"
					/>
					<Button variant="solid" :disabled="locked" @click="submitShortAnswer">Submit</Button>
				</div>

				<div class="hint-row">
					<span>Correct answer = random boost</span>
					<span>Wrong answer = random penalty</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { Button, toast } from 'frappe-ui'

const playerName = 'Blue Duck'
const gameState = ref('start')
const score = ref(0)
const currentRound = ref(0)
const duckPosition = ref(0)
const timeLeft = ref(90)
const answerInput = ref('')
const locked = ref(false)
const statusText = ref('Ready to race')
const lastEffect = ref(null)
const smashedCounters = ref([])

const questions = [
	{ type: 'choice', prompt: '2 + 3 = ?', choices: ['4', '5', '6', '8'], answer: '5', points: 10 },
	{ type: 'short', prompt: 'Spell the first month of the year', answer: 'january', placeholder: 'Type your answer', points: 12 },
	{ type: 'choice', prompt: 'Which is a prime number?', choices: ['9', '12', '13', '15'], answer: '13', points: 10 },
	{ type: 'short', prompt: 'What is 10 - 4?', answer: '6', placeholder: 'Type a number', points: 8 },
	{ type: 'choice', prompt: 'Which animal says meow?', choices: ['Dog', 'Cow', 'Cat', 'Duck'], answer: 'Cat', points: 10 },
]

const counters = [
	{ id: 1, position: 18, label: '1' },
	{ id: 2, position: 36, label: '2' },
	{ id: 3, position: 54, label: '3' },
	{ id: 4, position: 72, label: '4' },
	{ id: 5, position: 88, label: 'Finish' },
]

const finishTitle = computed(() => (duckPosition.value >= 100 ? 'Victory!' : 'Race Complete'))
const activeQuestion = computed(() => questions[currentRound.value - 1] || null)

let timerId = null
let timeoutId = null

const startGame = () => {
	clearTimers()
	gameState.value = 'playing'
	score.value = 0
	currentRound.value = 1
	duckPosition.value = 0
	timeLeft.value = 90
	answerInput.value = ''
	locked.value = false
	statusText.value = 'The race is on'
	lastEffect.value = null
	smashedCounters.value = []

	timerId = setInterval(() => {
		timeLeft.value -= 1
		if (timeLeft.value <= 0) {
			finishGame('Time is up')
		}
	}, 1000)
}

const clearTimers = () => {
	if (timerId) clearInterval(timerId)
	if (timeoutId) clearTimeout(timeoutId)
	timerId = null
	timeoutId = null
}

const submitChoice = (choice) => handleAnswer(choice)

const submitShortAnswer = () => {
	if (!answerInput.value.trim()) {
		toast.warning('Type an answer first')
		return
	}
	handleAnswer(answerInput.value)
}

const normalize = (value) => String(value).trim().toLowerCase()

const handleAnswer = (value) => {
	if (locked.value || !activeQuestion.value) return

	locked.value = true
	const correct = normalize(value) === normalize(activeQuestion.value.answer)
	const effect = correct ? randomBoost() : randomPenalty()
	applyEffect(effect, correct)

	timeoutId = setTimeout(() => {
		answerInput.value = ''
		locked.value = false
		if (currentRound.value >= questions.length) {
			finishGame('Race complete')
			return
		}
		currentRound.value += 1
		statusText.value = correct ? 'Next checkpoint unlocked' : 'Try to recover'
	}, 1100)
}

const randomBoost = () => {
	const boosts = [
		{ kind: 'boost', text: 'Dash boost!', progress: 14, score: 10 },
		{ kind: 'boost', text: 'Turbo feathers!', progress: 18, score: 12 },
		{ kind: 'boost', text: 'Counter smash!', progress: 16, score: 15, smash: 1 },
		{ kind: 'boost', text: 'Rocket sprint!', progress: 22, score: 8 },
	]
	return boosts[Math.floor(Math.random() * boosts.length)]
}

const randomPenalty = () => {
	const penalties = [
		{ kind: 'penalty', text: 'Mud slip!', progress: -8, score: 0 },
		{ kind: 'penalty', text: 'Duck wobble!', progress: -12, score: 0 },
		{ kind: 'penalty', text: 'Slowdown!', progress: -4, score: 0 },
		{ kind: 'penalty', text: 'Backstep!', progress: -16, score: 0 },
	]
	return penalties[Math.floor(Math.random() * penalties.length)]
}

const applyEffect = (effect, correct) => {
	duckPosition.value = Math.max(0, Math.min(100, duckPosition.value + effect.progress))
	score.value += effect.score
	lastEffect.value = effect
	statusText.value = correct ? 'Boost applied' : 'Penalty applied'

	if (correct && effect.smash) {
		const broken = counters.slice(0, effect.smash).map((counter) => counter.id)
		smashedCounters.value = Array.from(new Set([...smashedCounters.value, ...broken]))
	}

	markCounters()
	if (duckPosition.value >= 100) {
		finishGame('You crossed the finish line')
	}
}

const markCounters = () => {
	const passed = counters
		.filter((counter) => duckPosition.value >= counter.position)
		.map((counter) => counter.id)
	smashedCounters.value = Array.from(new Set([...smashedCounters.value, ...passed]))
}

const finishGame = (message) => {
	gameState.value = 'finished'
	statusText.value = message
	locked.value = true
	clearTimers()
}

onBeforeUnmount(clearTimers)
</script>

<style scoped>
.duck-race-game {
	min-height: 100vh;
	padding: 24px;
	background:
		radial-gradient(circle at top, rgba(255, 255, 255, 0.14), transparent 30%),
		linear-gradient(180deg, #0f172a 0%, #111827 50%, #1f2937 100%);
	color: #fff;
	position: relative;
	overflow: hidden;
}

.hud {
	display: flex;
	justify-content: space-between;
	gap: 16px;
	padding: 16px 20px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 20px;
	backdrop-filter: blur(10px);
	background: rgba(15, 23, 42, 0.45);
}

.hud-label {
	font-size: 12px;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	color: rgba(255, 255, 255, 0.6);
}

.hud-value {
	font-size: 24px;
	font-weight: 700;
}

.track-shell,
.quiz-shell {
	max-width: 1100px;
	margin: 20px auto 0;
}

.track-shell {
	position: relative;
	height: 320px;
	padding: 20px;
	border-radius: 28px;
	background: rgba(15, 23, 42, 0.55);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.track-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}

.track-title {
	font-weight: 700;
	font-size: 18px;
}

.track-status {
	font-size: 13px;
	color: rgba(255, 255, 255, 0.72);
}

.track {
	position: relative;
	height: 230px;
	border-radius: 24px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.08));
	overflow: hidden;
}

.lane {
	position: absolute;
	left: 0;
	right: 0;
	height: 50%;
}

.lane-top {
	top: 0;
	border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}

.lane-bottom {
	bottom: 0;
}

.counter {
	position: absolute;
	top: 52%;
	transform: translate(-50%, -50%);
	text-align: center;
	z-index: 2;
}

.counter-top {
	font-size: 12px;
	font-weight: 700;
	padding: 4px 8px;
	border-radius: 999px;
	background: rgba(251, 191, 36, 0.15);
	border: 1px solid rgba(251, 191, 36, 0.35);
	margin-bottom: 8px;
}

.counter-base {
	width: 16px;
	height: 72px;
	margin: 0 auto;
	border-radius: 999px;
	background: linear-gradient(180deg, #f59e0b, #ef4444);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.counter.broken {
	opacity: 0.35;
	filter: grayscale(1);
}

.finish-line {
	position: absolute;
	right: 0;
	top: 0;
	bottom: 0;
	width: 12px;
	background: repeating-linear-gradient(180deg, #fff 0 16px, #111827 16px 32px);
	box-shadow: -12px 0 24px rgba(255, 255, 255, 0.12);
}

.duck-wrap {
	position: absolute;
	top: 56%;
	transform: translate(-50%, -50%);
	z-index: 3;
	text-align: center;
}

.duck-shadow {
	width: 54px;
	height: 12px;
	border-radius: 999px;
	background: rgba(0, 0, 0, 0.35);
	margin: 0 auto 4px;
	filter: blur(2px);
}

.duck {
	font-size: 48px;
	filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.35));
}

.duck-name {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.75);
}

.effect-banner {
	position: absolute;
	left: 50%;
	bottom: 18px;
	transform: translateX(-50%);
	padding: 10px 18px;
	border-radius: 999px;
	font-weight: 700;
	letter-spacing: 0.02em;
	background: rgba(255, 255, 255, 0.08);
	backdrop-filter: blur(8px);
}

.effect-banner.boost {
	color: #86efac;
}

.effect-banner.penalty {
	color: #fca5a5;
}

.panel {
	padding: 24px;
	border-radius: 24px;
	background: rgba(15, 23, 42, 0.7);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.overlay {
	position: fixed;
	inset: 0;
	background: rgba(2, 6, 23, 0.55);
	display: grid;
	place-items: center;
	z-index: 20;
}

.intro-panel {
	max-width: 520px;
	text-align: center;
}

.intro-panel h1 {
	font-size: 42px;
	margin-bottom: 10px;
}

.muted {
	color: rgba(255, 255, 255, 0.65);
	margin-top: 6px;
	margin-bottom: 18px;
}

.question-panel {
	margin-top: 20px;
}

.question-meta {
	display: flex;
	justify-content: space-between;
	gap: 12px;
	font-size: 12px;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 12px;
}

.question-title {
	font-size: 24px;
	line-height: 1.25;
	margin-bottom: 18px;
}

.choices {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;
}

.choice-btn {
	padding: 14px 16px;
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(255, 255, 255, 0.04);
	color: #fff;
	font-weight: 600;
	text-align: left;
	transition: transform 0.15s ease, background 0.15s ease;
}

.choice-btn:hover:not(:disabled) {
	transform: translateY(-1px);
	background: rgba(255, 255, 255, 0.08);
}

.short-answer {
	display: flex;
	gap: 12px;
	align-items: center;
}

.short-answer input {
	flex: 1;
	padding: 14px 16px;
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	background: rgba(255, 255, 255, 0.05);
	color: #fff;
	outline: none;
}

.short-answer input::placeholder {
	color: rgba(255, 255, 255, 0.45);
}

.hint-row {
	display: flex;
	justify-content: space-between;
	gap: 16px;
	margin-top: 14px;
	font-size: 12px;
	color: rgba(255, 255, 255, 0.55);
}

@media (max-width: 768px) {
	.duck-race-game {
		padding: 14px;
	}

	.hud {
		flex-wrap: wrap;
	}

	.track-shell {
		height: 300px;
	}

	.choices {
		grid-template-columns: 1fr;
	}

	.short-answer,
	.hint-row {
		flex-direction: column;
		align-items: stretch;
	}
}
</style>
