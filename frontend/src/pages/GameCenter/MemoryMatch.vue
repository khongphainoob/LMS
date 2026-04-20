<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Memory Match") }}</h3>
			<div class="flex items-center gap-4">
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
				{{ __("Completed in {0} moves and {1}").format(moves, formatTime(elapsedTime)) }}
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
				<div v-if="card.flipped || card.matched" class="flex flex-col items-center justify-center h-full">
					<span>{{ card.emoji }}</span>
					<span class="text-[10px] mt-0.5 opacity-70">{{ card.label }}</span>
				</div>
				<div v-else class="flex items-center justify-center h-full">
					<HelpCircle class="size-6 text-ink-gray-4" />
				</div>
			</button>
		</div>

		<div class="flex items-center justify-center gap-2">
			<button
				v-for="size in [3, 4, 5, 6]"
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
import { ref, reactive, onUnmounted, computed } from "vue"
import { Timer, MousePointerClick, HelpCircle } from "lucide-vue-next"

const gridSize = ref(4)
const cards = ref([])
const flippedIndices = ref([])
const isChecking = ref(false)
const moves = ref(0)
const elapsedTime = ref(0)
const gameWon = ref(false)
let timerInterval = null

const emojis = [
	{ emoji: "\u{1F4DA}", label: "Book" },
	{ emoji: "\u{1F4BB}", label: "Code" },
	{ emoji: "\u{1F9E0}", label: "Brain" },
	{ emoji: "\u{1F3AF}", label: "Target" },
	{ emoji: "\u{1F680}", label: "Rocket" },
	{ emoji: "\u{1F4A1}", label: "Idea" },
	{ emoji: "\u{1F48E}", label: "Gem" },
	{ emoji: "\u{1F525}", label: "Fire" },
	{ emoji: "\u{1F916}", label: "Robot" },
	{ emoji: "\u{1F393}", label: "Grad" },
	{ emoji: "\u{1F4CA}", label: "Chart" },
	{ emoji: "\u{1F52C}", label: "Science" },
	{ emoji: "\u{270F}\u{FE0F}", label: "Edit" },
	{ emoji: "\u{1F3B5}", label: "Music" },
	{ emoji: "\u{1F308}", label: "Rainbow" },
	{ emoji: "\u{1F31F}", label: "Star" },
	{ emoji: "\u{1F0CF}", label: "Puzzle" },
	{ emoji: "\u{1F6E0}\u{FE0F}", label: "Tools" },
]

function shuffleArray(arr) {
	const a = [...arr]
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]]
	}
	return a
}

function initGame() {
	const pairCount = Math.floor((gridSize.value * gridSize.value) / 2)
	const selected = shuffleArray(emojis).slice(0, pairCount)
	const paired = shuffleArray([...selected, ...selected])
	cards.value = paired.map((item) => ({
		...item,
		flipped: false,
		matched: false,
	}))
	flippedIndices.value = []
	isChecking.value = false
	moves.value = 0
	elapsedTime.value = 0
	gameWon.value = false
	clearInterval(timerInterval)
	timerInterval = null
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
		if (cards.value[i1].label === cards.value[i2].label) {
			cards.value[i1].matched = true
			cards.value[i2].matched = true
			flippedIndices.value = []
			isChecking.value = false
			if (cards.value.every((c) => c.matched)) {
				gameWon.value = true
				clearInterval(timerInterval)
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
	initGame()
}

onUnmounted(() => {
	clearInterval(timerInterval)
})

initGame()
</script>
