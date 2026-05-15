<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between flex-wrap gap-2">
			<div><h3 class="font-semibold text-ink-gray-9">{{ __("Badge Gallery") }}</h3><p class="text-xs text-ink-gray-5 mt-0.5">{{ earnedCount }}/{{ badges.length }} {{ __("earned") }}</p></div>
			<div class="flex items-center gap-1.5 bg-surface-gray-1 rounded-lg p-0.5">
				<button v-for="f in filters" :key="f.value" @click="filter = f.value" class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors" :class="filter === f.value ? 'bg-surface-white shadow-sm text-ink-gray-9' : 'text-ink-gray-5 hover:text-ink-gray-7'">{{ f.label }}</button>
			</div>
		</div>
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
			<div v-for="b in filteredBadges" :key="b.name" class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden transition-all duration-300" :class="{ 'opacity-50': !b.earned }">
				<div class="h-28 flex items-center justify-center relative" :class="b.earned ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' : 'bg-surface-gray-1'">
					<div class="text-4xl">{{ b.emoji }}</div>
					<span class="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white bg-green-500" v-if="b.earned">{{ __("Earned") }}</span>
					<span class="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-surface-gray-2 text-ink-gray-5" v-else>{{ __("Locked") }}</span>
					<div v-if="b.issued_on" class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-ink-gray-6 bg-white/80 px-2 py-0.5 rounded-full">
						{{ formatDate(b.issued_on) }}
					</div>
					<div v-else-if="b.progress" class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-ink-gray-6 bg-white/80 px-2 py-0.5 rounded-full">
						{{ b.progress }}%
					</div>
				</div>
				<div class="p-3">
					<div class="text-sm font-semibold text-ink-gray-9 truncate">{{ b.title }}</div>
					<div class="text-[11px] text-ink-gray-5 mt-0.5 line-clamp-2">{{ b.description }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from "vue"
const props = defineProps({ badges: { type: Array, default: () => [] } })
const filter = ref("all")
const filters = [{ label: __("All"), value: "all" }, { label: __("Earned"), value: "earned" }, { label: __("Locked"), value: "locked" }]
const filteredBadges = computed(() => filter.value === "earned" ? props.badges.filter((b) => b.earned) : filter.value === "locked" ? props.badges.filter((b) => !b.earned) : props.badges)
const earnedCount = computed(() => props.badges.filter((b) => b.earned).length)

function formatDate(dateValue) {
	if (!dateValue) return ""
	const parsed = new Date(dateValue)
	return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
}
</script>
