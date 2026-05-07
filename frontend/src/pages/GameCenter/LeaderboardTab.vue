<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between flex-wrap gap-2">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Leaderboard") }}</h3>
			<select v-model="periodProxy" class="text-xs border border-outline-gray-2 rounded-md px-2 py-1 bg-surface-white text-ink-gray-7 focus:outline-none">
				<option value="all_time">{{ __("All Time") }}</option>
				<option value="weekly">{{ __("This Week") }}</option>
				<option value="monthly">{{ __("This Month") }}</option>
			</select>
		</div>

		<div v-if="loading" class="border border-outline-gray-2 bg-surface-white rounded-2xl shadow-sm p-5 text-sm text-ink-gray-5">
			{{ __("Loading leaderboard...") }}
		</div>
		<div v-else-if="!entries.length" class="border border-outline-gray-2 bg-surface-white rounded-2xl shadow-sm p-5 text-sm text-ink-gray-5">
			{{ __("No leaderboard data yet.") }}
		</div>
		<div v-else class="space-y-4">
			<div class="border border-outline-gray-2 bg-surface-white rounded-2xl shadow-sm p-5">
				<div class="flex items-end justify-center gap-4 sm:gap-6">
					<div v-for="p in podiumEntries" :key="p.rank" class="text-center w-1/3">
						<div class="relative inline-block">
							<div class="mx-auto rounded-full flex items-center justify-center font-bold ring-3" :class="p.circleClass">{{ p.rank }}</div>
							<div class="absolute -top-1 -right-1 text-xl">{{ p.medal }}</div>
						</div>
						<div class="mx-auto mt-2 rounded-full bg-surface-gray-3 flex items-center justify-center text-lg" :class="p.avatarClass">{{ p.avatar }}</div>
						<div class="text-xs font-semibold text-ink-gray-8 mt-1.5 truncate max-w-[120px] mx-auto">{{ p.member_name }}</div>
						<div class="font-bold" :class="p.scoreClass">{{ p.composite_score }}</div>
						<div class="text-[10px]" :class="p.subClass">{{ p.sub }}</div>
						<div class="rounded-t-xl mt-2" :class="p.barClass"></div>
					</div>
				</div>
			</div>

			<div v-if="yourRank" class="border-2 border-ink-blue-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3.5 flex items-center gap-3">
				<div class="w-8 h-8 rounded-full bg-ink-blue-4 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{{ yourRank.rank }}</div>
				<div class="w-9 h-9 rounded-full bg-ink-blue-100 dark:bg-ink-blue-900/30 flex items-center justify-center text-sm">{{ yourRank.avatar }}</div>
				<div class="flex-1 min-w-0">
					<div class="text-sm font-bold text-ink-blue-5 truncate">{{ yourRank.member_name }} <span class="text-[10px] font-normal text-ink-gray-5">({{ __("You") }})</span></div>
					<div class="text-[11px] text-ink-gray-5">{{ yourRank.completion_pct }}% {{ __("complete") }} &middot; {{ yourRank.streak_days }}d {{ __("streak") }}</div>
				</div>
				<div class="text-right flex-shrink-0">
					<div class="text-sm font-bold text-ink-blue-5">{{ yourRank.composite_score }}</div>
					<div class="text-[10px] text-ink-gray-5">{{ __("pts") }}</div>
				</div>
			</div>

			<div class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden">
				<div v-for="e in entries" :key="e.rank + '-' + e.member" class="flex items-center gap-3 px-4 py-3 hover:bg-surface-gray-1 transition-colors border-b border-outline-gray-1 last:border-b-0" :class="{ 'bg-blue-50/30': e.is_you }">
					<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" :class="getRankClass(e.rank)">{{ e.rank }}</div>
					<div class="w-8 h-8 rounded-full bg-surface-gray-3 flex items-center justify-center text-sm flex-shrink-0">{{ avatarFor(e) }}</div>
					<div class="flex-1 min-w-0">
						<div class="font-medium text-ink-gray-9 truncate text-sm">{{ e.member_name }}<span v-if="e.is_you" class="text-[10px] text-ink-blue-4 font-normal ml-1">({{ __("You") }})</span></div>
						<div class="text-[11px] text-ink-gray-5">{{ e.completion_pct }}% {{ __("complete") }} &middot; {{ e.streak_days }}d {{ __("streak") }}</div>
					</div>
					<div class="text-right flex-shrink-0">
						<div class="font-bold text-ink-gray-9 text-sm">{{ e.composite_score }}</div>
						<div class="text-[10px] text-ink-gray-5">{{ __("pts") }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
	period: { type: String, default: "all_time" },
	entries: { type: Array, default: () => [] },
	loading: { type: Boolean, default: false },
})
const emit = defineEmits(["update:period"])

const periodProxy = computed({ get: () => props.period, set: (v) => emit("update:period", v) })
const podiumEntries = computed(() => [1, 2, 3].map((rank) => props.entries.find((entry) => entry.rank === rank)).filter(Boolean).map((entry) => ({
	...entry,
	medal: entry.rank === 1 ? "👑" : entry.rank === 2 ? "🥈" : "🥉",
	avatar: avatarFor(entry),
	circleClass: entry.rank === 1
		? "w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-400 text-xl ring-amber-400"
		: entry.rank === 2
			? "w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-lg ring-gray-300 dark:ring-gray-600"
			: "w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-lg ring-orange-300 dark:ring-orange-700",
	avatarClass: entry.rank === 1 ? "w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-amber-400" : "w-10 h-10 sm:w-12 sm:h-12",
	scoreClass: entry.rank === 1 ? "text-base text-amber-500" : "text-sm font-bold text-ink-gray-9",
	subClass: entry.rank === 1 ? "text-[10px] text-amber-600 font-medium" : "text-[10px] text-ink-gray-5",
	sub: entry.rank === 1 ? __("Champion") : __("pts"),
	barClass: entry.rank === 1
		? "h-24 sm:h-28 bg-gradient-to-t from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/10"
		: entry.rank === 2
			? "h-16 sm:h-20 bg-gray-100 dark:bg-gray-800"
			: "h-12 sm:h-16 bg-orange-50 dark:bg-orange-900/20",
})))
const yourRank = computed(() => props.entries.find((entry) => entry.is_you) || null)

function avatarFor(entry) {
	return ((entry.member_name || "").trim().charAt(0) || "?").toUpperCase()
}

function getRankClass(rank) {
	if (rank === 1) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
	if (rank === 2) return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
	if (rank === 3) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
	return "bg-surface-gray-2 text-ink-gray-6"
}
</script>
