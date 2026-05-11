	<template>
	<div>
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs class="h-7" :items="breadcrumbs" />
			<button v-if="activeGame" @click="closeGame" class="flex items-center gap-1 text-sm text-ink-blue-4 hover:text-ink-blue-5 transition-colors">
				<ArrowLeft class="size-4" />{{ __("Back") }}
			</button>
		</header>

		<div class="p-4 sm:p-5">
			<TabButtons v-if="!activeGame" v-model="activeTab" :buttons="tabs" class="w-fit mb-5" />

			<component
				:is="activeGame?.component"
				v-if="activeGame"
				:class-game="activeGame.classGame"
				@completed="onGameCompleted"
			/>

			<OverviewTab v-else-if="activeTab === 'Overview'" :profile="profileData" :recent-badges="recentBadges" @switch-tab="activeTab = $event" />
			<GamesTab v-else-if="activeTab === 'Games'" :games="games" @open-game="openGame" />
			<LeaderboardTab v-else-if="activeTab === 'Leaderboard'" :entries="leaderboardEntries" :period="leaderboardPeriod" :loading="leaderboardResource.loading" @update:period="leaderboardPeriod = $event" />
			<BadgesTab v-else :badges="badgeCards" />
		</div>
	</div>
</template>

<script setup>
import { Breadcrumbs, TabButtons, usePageMeta, createResource } from "frappe-ui"
import { computed, markRaw, ref, watch } from "vue"
import { ArrowLeft, Gamepad2, GripVertical, Target } from "lucide-vue-next"
import { sessionStore } from "@/stores/session"
import OverviewTab from "@/pages/GameCenter/OverviewTab.vue"
import GamesTab from "@/pages/GameCenter/GamesTab.vue"
import LeaderboardTab from "@/pages/GameCenter/LeaderboardTab.vue"
import BadgesTab from "@/pages/GameCenter/BadgesTab.vue"
import MemoryMatch from "@/pages/GameCenter/MemoryMatch.vue"
import TimedQuiz from "@/pages/GameCenter/TimedQuiz.vue"
import SpinTheWheel from "@/pages/GameCenter/SpinTheWheel.vue"
import WordScramble from "@/pages/GameCenter/WordScramble.vue"
import DragDropSort from "@/pages/GameCenter/DragDropSort.vue"
import DuckRace from "@/pages/GameCenter/DuckRace.vue"
import FruitNinja from "@/pages/GameCenter/FruitNinja.vue"

const { brand } = sessionStore()
const activeTab = ref("Games")
const leaderboardPeriod = ref("all_time")
const activeGame = ref(null)

const profileResource = createResource({ url: "lms.lms.api.get_user_game_profile", auto: true })
const badgesResource = createResource({ url: "lms.lms.api.get_user_badges", auto: true })
const leaderboardResource = createResource({ url: "lms.lms.api.get_leaderboard", params: { limit: 10, period: leaderboardPeriod.value }, auto: true })
const classGamesResource = createResource({ url: "lms.lms.api.list_class_games", auto: true })

const profileData = computed(() => profileResource.data)

const recentBadges = computed(() => (badgesResource.data || []).map((b) => ({
	...b,
})))

function resolveGameType(game) {
	return String(game?.game_type || game?.game || game?.name || "").trim()
}

const fallbackGames = [
	{
		id: "memory-match",
		classGame: null,
		title: __("Memory Match"),
		description: __("Flip cards and match pairs to test your memory"),
		component: markRaw(MemoryMatch),
		tag: __("Puzzle"),
		icon: Gamepad2,
		bgClass: "bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20",
		iconClass: "text-ink-purple-5",
		tagClass: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
	},
	{
		id: "timed-quiz",
		classGame: null,
		title: __("Timed Quiz"),
		description: __("Answer questions before time runs out"),
		component: markRaw(TimedQuiz),
		tag: __("Speed"),
		icon: Gamepad2,
		bgClass: "bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20",
		iconClass: "text-ink-blue-4",
		tagClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
	},
	{
		id: "spin-wheel",
		classGame: null,
		title: __("Spin the Wheel"),
		description: __("Spin and win learning rewards"),
		component: markRaw(SpinTheWheel),
		tag: __("Luck"),
		icon: Gamepad2,
		bgClass: "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20",
		iconClass: "text-ink-amber-5",
		tagClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
	},
	{
		id: "word-scramble",
		classGame: null,
		title: __("Word Scramble"),
		description: __("Unscramble words as fast as you can"),
		component: markRaw(WordScramble),
		tag: __("Language"),
		icon: Gamepad2,
		bgClass: "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20",
		iconClass: "text-ink-green-5",
		tagClass: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
	},
	{
		id: "drag-drop",
		classGame: null,
		title: __("Drag & Drop Sort"),
		description: __("Sort items in the correct order"),
		component: markRaw(DragDropSort),
		tag: __("Logic"),
		icon: Gamepad2,
		bgClass: "bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20",
		iconClass: "text-ink-gray-7",
		tagClass: "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400",
	},
	{
		id: "duck-race",
		classGame: null,
		title: __("Duck Race"),
		description: __("Race your duck by answering questions"),
		component: markRaw(DuckRace),
		tag: __("Arcade"),
		icon: Gamepad2,
		bgClass: "bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20",
		iconClass: "text-yellow-600",
		tagClass: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
	},
	{
		id: "fruit-ninja",
		classGame: null,
		title: __("Fruit Ninja"),
		description: __("Slice fruits and avoid the bombs"),
		component: markRaw(FruitNinja),
		tag: __("Action"),
		icon: Gamepad2,
		bgClass: "bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20",
		iconClass: "text-red-500",
		tagClass: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
	},
]

const games = computed(() => {
		const apiGames = classGamesResource.data || []
		if (!apiGames.length) {
			return fallbackGames
		}

		const componentMap = {
			"memory_match": markRaw(MemoryMatch),
			"timed_quiz": markRaw(TimedQuiz),
			"spin_wheel": markRaw(SpinTheWheel),
			"word_scramble": markRaw(WordScramble),
			"drag_drop": markRaw(DragDropSort),
			"duck_race": markRaw(DuckRace),
			"fruit_ninja": markRaw(FruitNinja),
		}

		return apiGames.map((game) => {
			const title = game.title || game.game || game.name
			const gType = resolveGameType(game)
			const delivery = game.delivery_mode

			return {
				id: game.class_game || game.name,
				classGame: game.class_game || game.name,
				title: title,
				description: gType,
				component: componentMap[gType] || null,
				tag: delivery || __("Game"),
				icon: Gamepad2,
				bgClass: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
            iconClass: "text-ink-blue-4",
            tagClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        }
    })
})

const badgeCards = computed(() => recentBadges.value)
const tabs = computed(() => ([{ label: __("Overview") }, { label: __("Games") }, { label: __("Leaderboard") }, { label: __("Badges") }]))
const leaderboardEntries = computed(() => leaderboardResource.data || [])

watch(leaderboardPeriod, (period) => { leaderboardResource.update({ params: { limit: 10, period } }); leaderboardResource.reload() })

function openGame(game) { activeGame.value = game }
function closeGame() { activeGame.value = null }
function onGameCompleted() { profileResource.reload(); leaderboardResource.reload(); badgesResource.reload(); closeGame() }

const breadcrumbs = computed(() => [{ label: __("Game Center"), route: { name: "GameCenter" } }])
usePageMeta(() => ({ title: __("Game Center"), icon: brand.favicon }))
</script>
