<template>
	<div class="fruit-game-container" ref="gameContainer" @mousedown="startSwipe" @mousemove="onSwipe" @mouseup="endSwipe" @touchstart="startSwipe" @touchmove="onSwipe" @touchend="endSwipe">
		<div class="game-header">
			<div class="score-display">
				<span class="label">Score:</span>
				<span class="value">{{ score }}</span>
			</div>
			<div class="lives-display">
				<span class="label">Lives:</span>
				<span class="hearts">
					<span v-for="n in 3" :key="n" class="heart" :class="{ lost: n > lives }">♥</span>
				</span>
			</div>
			<div class="timer-display">
				<span class="label">Time:</span>
				<span class="value">{{ formatTime(timeLeft) }}</span>
			</div>
		</div>

		<div v-if="gameState === 'start'" class="game-start-overlay">
			<div class="start-content">
				<h1>Fruit Ninja Quiz</h1>
				<p>Swipe through the fruits with correct answers!</p>
				<p class="hint">Slice the correct fruit to score points</p>
				<Button variant="solid" @click="startGame">
					Start Game
				</Button>
			</div>
		</div>

		<div v-if="gameState === 'gameover'" class="game-over-overlay">
			<div class="over-content">
				<h1>Game Over!</h1>
				<div class="final-score">
					<span>Your Score:</span>
					<span class="score-value">{{ score }}</span>
				</div>
				<div class="stats">
					<p>Correct: {{ correctCount }} / {{ totalFruitCount }}</p>
					<p>Accuracy: {{ computedAccuracy }}%</p>
				</div>
				<Button variant="solid" @click="startGame">
					Play Again
				</Button>
			</div>
		</div>

		<div v-for="fruit in fruits" :key="fruit.id" class="fruit" :class="{ sliced: fruit.sliced, missed: fruit.missed }" :style="{ left: fruit.x + 'px', top: fruit.y + 'px' }">
			<div class="fruit-body">
				<span class="fruit-emoji">{{ fruit.emoji }}</span>
			</div>
			<div class="fruit-answer">{{ fruit.answer }}</div>
		</div>

		<div v-if="swiping" class="swipe-trail" :style="{ left: swipePos.x + 'px', top: swipePos.y + 'px' }"></div>

		<div class="combo-display" v-if="combo > 1" :class="{ visible: combo > 1 }">
			{{ combo }}x Combo!
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { Button } from 'frappe-ui'

const gameContainer = ref(null)
const gameState = ref('start')
const score = ref(0)
const lives = ref(3)
const timeLeft = ref(60)
const combo = ref(0)
const correctCount = ref(0)
const totalFruitCount = ref(0)

const swiping = ref(false)
const swipePos = reactive({ x: 0, y: 0 })
const swipeStart = reactive({ x: 0, y: 0 })

const fruits = ref([])
let gameLoop = null
let timerInterval = null

const sampleQuestions = [
	{ question: 'What is 2 + 2?', answer: '4', correct: true },
	{ question: 'What is 3 + 3?', answer: '6', correct: true },
	{ question: 'What is 5 + 5?', answer: '10', correct: true },
	{ question: 'What is 7 - 3?', answer: '4', correct: true },
	{ question: 'What is 8 + 2?', answer: '10', correct: true },
	{ question: 'What is 4 + 4?', answer: '8', correct: true },
	{ question: 'What is 6 + 4?', answer: '10', correct: true },
	{ question: 'What is 9 + 1?', answer: '10', correct: true },
]

const fruitEmojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍒']

const computedAccuracy = computed(() => {
	if (totalFruitCount.value === 0) return 0
	return Math.round((correctCount.value / totalFruitCount.value) * 100)
})

const startGame = () => {
	gameState.value = 'playing'
	score.value = 0
	lives.value = 3
	timeLeft.value = 60
	combo.value = 0
	correctCount.value = 0
	totalFruitCount.value = 0
	fruits.value = []

	clearInterval(timerInterval)
	startTimer()
	lastSpawnTime = performance.now()
	gameLoop = requestAnimationFrame(gameLoopFn)
}

const startTimer = () => {
	timerInterval = setInterval(() => {
		timeLeft.value--
		if (timeLeft.value <= 0) {
			endGame()
		}
	}, 1000)
}

let lastSpawnTime = 0
const spawnInterval = 1500

const gameLoopFn = (timestamp) => {
	if (gameState.value !== 'playing') return

	if (timestamp - lastSpawnTime > spawnInterval) {
		spawnFruit()
		lastSpawnTime = timestamp
	}

	fruits.value.forEach((fruit, index) => {
		fruit.y += fruit.speedY

		if (fruit.y > window.innerHeight + 50) {
			if (!fruit.sliced && !fruit.missed) {
				fruit.missed = true
				loseLife()
			}
			fruits.value.splice(index, 1)
		}
	})

	gameLoop = requestAnimationFrame(gameLoopFn)
}

const spawnFruit = () => {
	const question = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)]
	const emoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)]
	const containerWidth = window.innerWidth || 800

	const x = Math.random() * (containerWidth - 100) + 50
	const startY = -80
	const speedY = Math.random() * 2 + 2

	const id = Date.now() + Math.random()

	fruits.value.push({
		id,
		x,
		y: startY,
		speedY,
		emoji,
		answer: question.answer,
		correct: question.correct,
		sliced: false,
		missed: false,
	})
}

const startSwipe = (e) => {
	e.preventDefault()
	swiping.value = true
	const pos = getSwipePos(e)
	swipePos.x = pos.x
	swipePos.y = pos.y
	swipeStart.x = pos.x
	swipeStart.y = pos.y
}

const onSwipe = (e) => {
	e.preventDefault()
	if (!swiping.value) return
	const pos = getSwipePos(e)
	swipePos.x = pos.x
	swipePos.y = pos.y

	checkSlice(pos)
}

const endSwipe = () => {
	swiping.value = false
}

const getSwipePos = (e) => {
	if (e.touches && e.touches.length > 0) {
		return { x: e.touches[0].clientX, y: e.touches[0].clientY }
	}
	return { x: e.clientX, y: e.clientY }
}

const checkSlice = (pos) => {
	fruits.value.forEach((fruit) => {
		if (fruit.sliced || fruit.missed) return

		const dx = pos.x - fruit.x
		const dy = pos.y - fruit.y
		const distance = Math.sqrt(dx * dx + dy * dy)

		if (distance < 60) {
			sliceFruit(fruit)
		}
	})
}

const sliceFruit = (fruit) => {
	if (fruit.sliced || fruit.missed || gameState.value !== 'playing') return

	fruit.sliced = true
	totalFruitCount.value++

	if (fruit.correct) {
		score.value += 10
		combo.value++
		correctCount.value++

		if (combo.value > 1) {
			score.value += combo.value * 5
		}

		setTimeout(() => {
			const index = fruits.value.findIndex(f => f.id === fruit.id)
			if (index > -1) {
				fruits.value.splice(index, 1)
			}
		}, 300)
	} else {
		loseLife()
		setTimeout(() => {
			const index = fruits.value.findIndex(f => f.id === fruit.id)
			if (index > -1) {
				fruits.value.splice(index, 1)
			}
		}, 300)
	}
}

const loseLife = () => {
	lives.value--
	combo.value = 0

	if (lives.value <= 0) {
		endGame()
	}
}

const endGame = () => {
	gameState.value = 'gameover'
	clearInterval(timerInterval)
	if (gameLoop) {
		cancelAnimationFrame(gameLoop)
		gameLoop = null
	}
}

const formatTime = (seconds) => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

onUnmounted(() => {
	clearInterval(timerInterval)
	if (gameLoop) {
		cancelAnimationFrame(gameLoop)
	}
})
</script>

<style scoped>
.fruit-game-container {
	position: relative;
	width: 100%;
	height: 100vh;
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
	overflow: hidden;
	cursor: crosshair;
	user-select: none;
}

.game-header {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-between;
	padding: 20px 40px;
	z-index: 100;
}

.score-display,
.lives-display,
.timer-display {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 1.5rem;
	font-weight: bold;
	color: white;
}

.label {
	color: rgba(255, 255, 255, 0.7);
}

.value {
	color: #ffd700;
}

.heart {
	color: #ff4757;
	font-size: 1.8rem;
	margin-left: 5px;
}

.heart.lost {
	color: rgba(255, 71, 87, 0.3);
}

.fruit {
	position: absolute;
	width: 80px;
	height: 100px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	z-index: 50;
}

.fruit-body {
	width: 60px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: white;
	border-radius: 50%;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.fruit-emoji {
	font-size: 2.5rem;
}

.fruit-answer {
	margin-top: 8px;
	padding: 4px 12px;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 15px;
	font-size: 1rem;
	font-weight: bold;
	color: #333;
}

.fruit.sliced {
	opacity: 0;
	transition: opacity 0.3s;
}

.fruit.missed {
	opacity: 0;
}

.game-start-overlay,
.game-over-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 200;
}

.start-content,
.over-content {
	text-align: center;
	color: white;
}

.start-content h1,
.over-content h1 {
	font-size: 4rem;
	margin-bottom: 20px;
	text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.start-content p {
	font-size: 1.5rem;
	margin-bottom: 10px;
}

.hint {
	color: rgba(255, 255, 255, 0.7);
	margin-bottom: 30px;
}

.final-score {
	font-size: 2rem;
	margin: 20px 0;
}

.score-value {
	color: #ffd700;
	font-size: 3rem;
	margin-left: 10px;
}

.stats {
	font-size: 1.2rem;
	color: rgba(255, 255, 255, 0.8);
	margin-bottom: 30px;
}

.swipe-trail {
	position: fixed;
	width: 30px;
	height: 30px;
	background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, transparent 70%);
	border-radius: 50%;
	pointer-events: none;
	z-index: 150;
	transform: translate(-50%, -50%);
}

.combo-display {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 3rem;
	font-weight: bold;
	color: #ffd700;
	text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
	opacity: 0;
	transition: opacity 0.3s;
	z-index: 100;
}

.combo-display.visible {
	opacity: 1;
	animation: comboPulse 0.5s ease-out;
}

@keyframes comboPulse {
	0% {
		transform: translate(-50%, -50%) scale(0.5);
	}
	50% {
		transform: translate(-50%, -50%) scale(1.2);
	}
	100% {
		transform: translate(-50%, -50%) scale(1);
	}
}
</style>