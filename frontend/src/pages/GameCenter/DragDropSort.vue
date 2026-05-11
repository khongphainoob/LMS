<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between"><h3 class="font-semibold text-ink-gray-9">{{ __("Drag & Drop Sort") }}</h3><div class="flex items-center gap-4"><div class="flex items-center gap-1.5 text-sm text-ink-gray-6"><Star class="size-4 text-ink-amber-4" /><span>{{ score }}/{{ rounds.length * 100 }} pts</span></div><div class="flex items-center gap-1.5 text-sm text-ink-gray-6"><Zap class="size-4 text-ink-blue-4" /><span>{{ currentRound + 1 }}/{{ rounds.length }}</span></div></div></div>
		<div v-if="loading" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5 text-sm text-ink-gray-5">{{ __("Loading rounds...") }}</div>
		<div v-else-if="!rounds.length" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5 text-sm text-ink-gray-5">{{ __("No rounds available.") }}</div>
		<div v-else-if="!finished" class="border border-outline-gray-2 bg-surface-white rounded-xl p-5">
			<div class="text-center mb-1"><span class="text-xs font-medium text-ink-blue-4">{{ getRoundLabel() }}</span></div>
			<h4 class="text-sm text-center text-ink-gray-7 mb-5">{{ rounds[currentRound].instruction }}</h4>
			<div class="flex gap-2 mb-5 p-3 rounded-xl border-2 border-dashed transition-colors min-h-[56px] items-center" :class="isDragOver ? 'border-ink-blue-4 bg-blue-50 dark:bg-blue-900/10' : 'border-outline-gray-3 bg-surface-gray-1'" @dragover.prevent="isDragOver = true" @dragleave="isDragOver = false" @drop.prevent="onDrop($event)">
				<div v-for="(item, idx) in sortedItems" :key="item.id" class="flex items-center gap-1 bg-ink-blue-4 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm cursor-grab active:cursor-grabbing" draggable="true" @dragstart="onItemDragStart($event, idx, true)" @dragover.prevent><span class="text-xs opacity-60 mr-1">{{ idx + 1 }}</span>{{ item.value }}</div>
				<div v-if="!sortedItems.length" class="w-full text-center text-sm text-ink-gray-4 py-1">{{ __("Drop items here in order") }}</div>
			</div>
			<div class="flex gap-2 flex-wrap justify-center"><div v-for="item in availableItems" :key="item.id" class="px-3 py-2 rounded-lg text-sm font-medium bg-surface-white border-2 border-outline-gray-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-outline-gray-3 hover:shadow-md hover:-translate-y-0.5 transition-all" draggable="true" @dragstart="onItemDragStart($event, item, false)" @dragover.prevent>{{ item.value }}</div></div>
			<div class="flex justify-center gap-3 mt-4"><button @click="clearSorted" class="px-3 py-1.5 text-xs rounded-lg bg-surface-gray-2 text-ink-gray-6 hover:bg-surface-gray-3 transition-colors">{{ __("Clear") }}</button><button @click="submitAnswer" :disabled="sortedItems.length !== rounds[currentRound].items.length" class="px-4 py-1.5 text-xs rounded-lg bg-ink-blue-4 text-white font-medium hover:bg-ink-blue-5 transition-colors disabled:opacity-40">{{ __("Submit") }}</button></div>
		</div>
		<div v-else class="border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4"><div class="text-4xl">🏆</div><h4 class="text-lg font-bold text-ink-gray-9">{{ __("All Rounds Complete!") }}</h4><div class="text-3xl font-bold text-ink-blue-4">{{ score }} pts</div><p class="text-sm text-ink-gray-5">{{ __("Correct order in {0}/{1} rounds").format(roundResults.filter(Boolean).length, rounds.length) }}</p><button @click="resetGame" class="px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors">{{ __("Play Again") }}</button></div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { call } from "frappe-ui"
import { Star, Zap } from "lucide-vue-next"

const props = defineProps({ classGame: { type: String, default: null } })
const emit = defineEmits(["completed"])
const score = ref(0)
const currentRound = ref(0)
const sortedItems = ref([])
const isDragOver = ref(false)
const finished = ref(false)
const roundResults = ref([])
const sessionId = ref(null)
const rounds = ref([])
const loading = ref(false)

const availableItems = computed(() => { const sortedIds = new Set(sortedItems.value.map((i) => i.id)); return (rounds.value[currentRound.value]?.items || []).filter((i) => !sortedIds.has(i.id)) })
function getRoundLabel() { return rounds.value[currentRound.value]?.label || "" }
function normalizeRound(q, idx) {
	return {
		label: q?.category || `Round ${idx + 1}`,
		instruction: q?.question || q?.question_text || __("Arrange the items"),
		items: Array.isArray(q?.sort_items)
			? q.sort_items.map((item, i) => ({ id: `${idx}-${i}`, value: item?.item || item?.value || item, order: item?.order ?? i }))
			: [],
	}
}
function onItemDragStart(e, itemOrIdx, fromSorted) { let item; if (fromSorted) { item = sortedItems.value[itemOrIdx]; sortedItems.value.splice(itemOrIdx, 1) } else { item = itemOrIdx } e.dataTransfer.setData("application/json", JSON.stringify(item)) }
function onDrop(event) { isDragOver.value = false; const raw = event?.dataTransfer?.getData("application/json"); if (!raw) return; try { const item = JSON.parse(raw); addToSorted(item) } catch { } }
function addToSorted(item) { if (!sortedItems.value.find((i) => i.id === item.id)) sortedItems.value.push({ ...item }) }
function clearSorted() { sortedItems.value = [] }
function submitAnswer() { const correct = rounds.value[currentRound.value].items; const isCorrect = sortedItems.value.every((item, idx) => item.order === correct[idx].order); if (isCorrect) { score.value += 100; roundResults.value.push(true) } else { const correctCount = sortedItems.value.filter((item, idx) => item.order === correct[idx].order).length; score.value += correctCount * 20; roundResults.value.push(false) } setTimeout(() => { if (currentRound.value < rounds.value.length - 1) { currentRound.value++; sortedItems.value = [] } else { finished.value = true; submitScore() } }, 1200) }
async function startSession() { if (!props.classGame) return; const res = await call("lms.lms.api.start_game_session", { class_game: props.classGame }); sessionId.value = res.session_id }
async function submitScore() { if (!sessionId.value) { emit("completed"); return } await call("lms.lms.api.submit_game_session", { session_id: sessionId.value, raw_score: score.value, metadata: { round_results: roundResults.value } }); emit("completed") }
async function loadRounds() { loading.value = true; try { const res = await call("lms.lms.api.get_gamification_questions", { question_type: "sort_order", limit: 5 }); rounds.value = (res || []).map(normalizeRound).filter((r) => r.items.length); if (!rounds.value.length) rounds.value = [{ label: __("Numbers"), instruction: __("Arrange the numbers from smallest to largest"), items: [{ id: "1", value: "1", order: 0 }, { id: "2", value: "2", order: 1 }] }] } finally { loading.value = false } }
function resetGame() { score.value = 0; currentRound.value = 0; sortedItems.value = []; finished.value = false; roundResults.value = []; startSession() }
onMounted(async () => { await loadRounds(); startSession() })
</script>
