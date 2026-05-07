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
const activeTab = ref("Overview")
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

const games = computed(() => {
	const apiGames = classGamesResource.data || []
	const componentMap = { memory_match: markRaw(MemoryMatch), timed_quiz: markRaw(TimedQuiz), spin_wheel: markRaw(SpinTheWheel), word_scramble: markRaw(WordScramble), drag_drop: markRaw(DragDropSort) }
	return apiGames.map((game) => {
		const details = game.game_details || game
		return {
			id: game.class_game || game.name,
			classGame: game.class_game || game.name,
			title: details.title,
			description: details.game_type,
			component: componentMap[details.game_type] || markRaw(MemoryMatch),
			tag: details.delivery_mode || __("Game"),
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
