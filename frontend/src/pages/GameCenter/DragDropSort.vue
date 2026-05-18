<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Drag & Drop Sort") }}</h3>
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Star class="size-4 text-ink-amber-4" />
					<span>{{ score }}/{{ rounds.length * 100 }} pts</span>
				</div>
				<div class="flex items-center gap-1.5 text-sm text-ink-gray-6">
					<Zap class="size-4 text-ink-blue-4" />
					<span>{{ currentRound + 1 }}/{{ rounds.length }}</span>
				</div>
			</div>
		</div>

		<!-- Round Content -->
		<div v-if="!finished" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5">
			<div class="text-center mb-1">
				<span class="text-xs font-medium text-ink-blue-4">{{ getRoundLabel() }}</span>
			</div>
			<h4 class="text-sm text-center text-ink-gray-7 mb-5">
				{{ rounds[currentRound].instruction }}
			</h4>

			<!-- Drop Zone -->
			<div
				class="flex gap-2 mb-5 p-3 rounded-xl border-2 border-dashed transition-colors min-h-[56px] items-center"
				:class="isDragOver ? 'border-amber-400 bg-amber-50' : 'border-outline-gray-3 bg-surface-gray-1'"
				@dragover.prevent="isDragOver = true"
				@dragleave="isDragOver = false"
				@drop.prevent="onDrop"
			>
				<div
					v-for="(item, idx) in sortedItems"
					:key="item.id"
					class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border-2 border-amber-400 bg-amber-100/40 text-black shadow-sm cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-all"
					draggable="true"
					@dragstart="onItemDragStart($event, idx, true)"
					@dragover.prevent
				>
					<span class="text-xs text-amber-600 font-bold mr-1">{{ idx + 1 }}.</span>
					{{ item.value }}
				</div>
				<div
					v-if="!sortedItems.length"
					class="w-full text-center text-sm text-ink-gray-4 py-1"
				>
					{{ __("Drop items here in order") }}
				</div>
			</div>

			<!-- Item Pool -->
			<div class="flex gap-2 flex-wrap justify-center">
				<div
					v-for="item in availableItems"
					:key="item.id"
					class="px-3 py-2 rounded-lg text-sm font-medium bg-surface-white border-2 border-outline-gray-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-outline-gray-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
					draggable="true"
					@dragstart="onItemDragStart($event, item, false)"
					@dragover.prevent
				>
					{{ item.value }}
				</div>
				<div
					v-if="!availableItems.length && !sortedItems.length"
					class="text-sm text-ink-gray-4"
				>
					{{ __("No items left") }}
				</div>
			</div>

			<!-- Touch/Click controls -->
			<div class="flex justify-center gap-3 mt-4">
				<button
					@click="clearSorted"
					class="px-3 py-1.5 text-xs rounded-lg bg-surface-gray-2 text-ink-gray-6 hover:bg-surface-gray-3 transition-colors"
				>
					{{ __("Clear") }}
				</button>
				<button
					@click="submitAnswer"
					:disabled="sortedItems.length !== rounds[currentRound].items.length"
					class="px-4 py-1.5 text-xs rounded-lg bg-black text-white font-bold shadow-sm hover:bg-neutral-800 hover:ring-2 hover:ring-black hover:ring-offset-2 active:scale-95 transition-all disabled:opacity-40"
				>
					{{ __("Submit") }}
				</button>
			</div>

			<!-- Click-to-add fallback for mobile -->
			<div class="mt-3 flex justify-center gap-2 flex-wrap">
				<button
					v-for="item in availableItems"
					:key="'click-' + item.id"
					@click="addToSorted(item)"
					class="text-xs px-2.5 py-1 rounded-md bg-surface-gray-2 text-ink-gray-6 hover:bg-surface-gray-3 transition-colors"
				>
					+ {{ item.value }}
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

		<!-- Results -->
		<div v-if="finished" class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4">
			<div class="text-4xl">{{ score >= rounds.length * 80 ? "\u{1F3C6}" : score >= rounds.length * 40 ? "\u{1F31F}" : "\u{1F4AA}" }}</div>
			<h4 class="text-lg font-bold text-ink-gray-9">{{ __("All Rounds Complete!") }}</h4>
			<div class="text-3xl font-bold text-ink-blue-4">{{ score }} pts</div>
			<p class="text-sm text-ink-gray-5">
				{{ __("Correct order in {0}/{1} rounds").format(roundResults.filter(Boolean).length, rounds.length) }}
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
import { useGameSession } from '@/utils/gameSession'

const props = defineProps({
	classGame: { type: [String, Number], default: null }
})
const emit = defineEmits(['finished'])

const { startGame: _startGame, submitScore, submitResult, startError, gameConfig } = useGameSession(props.classGame)

import { ref, computed, reactive } from "vue"
import { Star, Zap } from "lucide-vue-next"

const score = ref(0)
const currentRound = ref(0)
const sortedItems = ref([])
const feedback = ref(null)
const isDragOver = ref(false)
const finished = ref(false)
const roundResults = ref([])
let dragData = null

const rounds = ref([
	{
		type: "number",
		instruction: "Arrange the numbers from smallest to largest",
		items: [
			{ id: "n1", value: "42", order: 3 },
			{ id: "n2", value: "7", order: 1 },
			{ id: "n3", value: "15", order: 2 },
			{ id: "n4", value: "89", order: 4 },
			{ id: "n5", value: "3", order: 0 },
		],
		label: "\u{1F522} Numbers",
	},
	{
		type: "alpha",
		instruction: "Arrange the words in alphabetical order",
		items: [
			{ id: "a1", value: "Zebra", order: 4 },
			{ id: "a2", value: "Apple", order: 0 },
			{ id: "a3", value: "Mango", order: 2 },
			{ id: "a4", value: "Banana", order: 1 },
			{ id: "a5", value: "Peach", order: 3 },
		],
		label: "\u{1F4D6} Alphabetical",
	},
	{
		type: "timeline",
		instruction: "Arrange the events in chronological order",
		items: [
			{ id: "t1", value: "Moon Landing (1969)", order: 3 },
			{ id: "t2", value: "World Wide Web (1991)", order: 4 },
			{ id: "t3", value: "First Flight (1903)", order: 0 },
			{ id: "t4", value: "Penicillin (1928)", order: 1 },
			{ id: "t5", value: "DNA Discovery (1953)", order: 2 },
		],
		label: "\u{1F4C5} Timeline",
	},
	{
		type: "size",
		instruction: "Arrange from smallest to largest",
		items: [
			{ id: "s1", value: "Ant", order: 0 },
			{ id: "s2", value: "Elephant", order: 4 },
			{ id: "s3", value: "Dog", order: 2 },
			{ id: "s4", value: "Cat", order: 1 },
			{ id: "s5", value: "Horse", order: 3 },
		],
		label: "\u{1F422} Size Order",
	},
	{
		type: "science",
		instruction: "Arrange planets from closest to farthest from the Sun",
		items: [
			{ id: "p1", value: "Earth", order: 2 },
			{ id: "p2", value: "Mars", order: 3 },
			{ id: "p3", value: "Mercury", order: 0 },
			{ id: "p4", value: "Jupiter", order: 4 },
			{ id: "p5", value: "Venus", order: 1 },
		],
		label: "\u{1F30C} Planets",
	},
])

const availableItems = computed(() => {
	if (!rounds.value || rounds.value.length === 0) return []
	const sortedIds = new Set(sortedItems.value.map((i) => i.id))
	return rounds.value[currentRound.value].items.filter((i) => !sortedIds.has(i.id))
})

function getRoundLabel() {
	if (!rounds.value || rounds.value.length === 0) return ""
	return rounds.value[currentRound.value].label || "Sort Order"
}

function onItemDragStart(e, itemOrIdx, fromSorted) {
	let item
	if (fromSorted) {
		item = sortedItems.value[itemOrIdx]
		sortedItems.value.splice(itemOrIdx, 1)
	} else {
		item = itemOrIdx
	}
	e.dataTransfer.setData("text/plain", item.id)
	dragData = item
}

function onDrop() {
	isDragOver.value = false
}

function addToSorted(item) {
	const exists = sortedItems.value.find((i) => i.id === item.id)
	if (!exists) {
		sortedItems.value.push({ ...item })
	}
}

function clearSorted() {
	sortedItems.value = []
	feedback.value = null
}

function submitAnswer() {
	const correct = rounds.value[currentRound.value].items
	const isCorrect = sortedItems.value.every(
		(item, idx) => item.order === correct[idx].order
	)
	if (isCorrect) {
		score.value += 100
		feedback.value = { correct: true, message: __("Perfect! +100 pts \u{1F389}") }
		roundResults.value.push(true)
	} else {
		const correctCount = sortedItems.value.filter(
			(item, idx) => item.order === correct[idx].order
		).length
		const pts = correctCount * 20
		score.value += pts
		feedback.value = { correct: false, message: __("Partially correct! +" + pts + " pts (" + correctCount + "/" + correct.length + ")") }
		roundResults.value.push(false)
	}
	setTimeout(() => {
		if (currentRound.value < rounds.value.length - 1) {
			currentRound.value++
			sortedItems.value = []
			feedback.value = null
		} else {
			finished.value = true
			_submitAndFinish()
		}
	}, 1500)
}

function applyCustomQuestions() {
	if (gameConfig.value) {
		try {
			const parsed = typeof gameConfig.value === 'string' ? JSON.parse(gameConfig.value) : gameConfig.value
			if (Array.isArray(parsed) && parsed.length > 0) {
				rounds.value = parsed.map((r, idx) => {
					// ensure every item is properly ordered and has unique id
					const items = (r.items || []).map((item, itemIdx) => ({
						id: item.id || `item_${idx}_${itemIdx}`,
						value: item.value || '',
						order: item.order !== undefined ? Number(item.order) : itemIdx
					})).sort((a, b) => a.order - b.order) // sort items by order initially so they are ordered properly inside rounds
					
					return {
						type: r.type || "custom",
						instruction: r.question || r.instruction || "Arrange the items in the correct order",
						items: items,
						label: r.label || `Challenge ${idx + 1}`
					}
				})
			}
		} catch (e) {
			console.error("Failed to parse custom drag drop rounds:", e)
		}
	}
}

async function _submitAndFinish() {
	if (!props.classGame) return
	const rawScore = Math.round(score.value)
	await submitScore(rawScore, {})
	emit('finished', submitResult.value || { score: rawScore, max_score: 500 })
}

async function resetGame() {
	score.value = 0
	currentRound.value = 0
	sortedItems.value = []
	feedback.value = null
	finished.value = false
	roundResults.value = []
	if (props.classGame) {
		await _startGame()
		applyCustomQuestions()
	}
}

// Auto-start session when classGame is provided
if (props.classGame) {
	_startGame().then(() => {
		applyCustomQuestions()
	})
}
</script>
