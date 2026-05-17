<template>
	<div>
		<header
			class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5"
		>
			<Breadcrumbs class="h-7" :items="breadcrumbs" />
			
			<div class="flex items-center gap-2">
				<button
					v-if="activeGame"
					@click="closeGame"
					class="flex items-center gap-1 text-sm text-ink-blue-4 hover:text-ink-blue-5 transition-colors"
				>
					<ArrowLeft class="size-4" />
					{{ __("Back to Game Center") }}
				</button>
				
				<Button
					v-if="!activeGame && (isModerator || isInstructor)"
					variant="ghost"
					@click="showBadgeManager = true"
					class="hidden sm:flex"
				>
					<template #prefix><Shield class="w-4 h-4" /></template>
					{{ __("Manage Badges") }}
				</Button>
				
				<Button
					v-if="!activeGame && (isModerator || isInstructor)"
					variant="ghost"
					@click="showCreateQuiz = true"
					class="hidden sm:flex"
				>
					<template #prefix><Plus class="w-4 h-4" /></template>
					{{ __("Assign Game") }}
				</Button>
			</div>
		</header>

		<div class="p-4 sm:p-5 max-w-7xl mx-auto">
			<TabButtons
				v-if="!activeGame"
				v-model="activeTab"
				:buttons="tabList"
				class="w-fit mb-5"
			/>

			<template v-if="activeGame">
				<!-- Dynamically render the game component using the resolveGameComponent utility -->
				<component :is="gameComponent" :class-game="activeClassGame" @finished="onGameFinished" />
				<!-- Result screen overlay after game ends -->
				<GameResultScreen
					v-if="gameResult"
					:result="gameResult"
					:game-title="activeGameTitle"
					:class-game="activeClassGame"
					@done="dismissResult"
				/>
			</template>

			<template v-else>
				<OverviewTab v-if="activeTab === 'overview'" @switch-tab="activeTab = $event" />
				<GamesTab v-if="activeTab === 'games'" ref="gamesTabRef" />
				<LeaderboardTab v-if="activeTab === 'leaderboard'" />
				<BadgesTab v-if="activeTab === 'badges'" />
				<ManageGamesTab v-if="activeTab === 'manage'" @create="showGameForm = true" />
			</template>
		</div>

		<!-- Modals for Instructors -->
		<BadgeManager v-if="showBadgeManager" v-model="showBadgeManager" />
		<CreateQuizModal v-if="showCreateQuiz" v-model="showCreateQuiz" @created="onGameCreated" />
		<GameFormModal v-if="showGameForm" v-model="showGameForm" @saved="onGameSaved" />
	</div>
</template>

<script setup>
import { computed, ref, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Breadcrumbs, TabButtons, usePageMeta, Button } from 'frappe-ui'
import { ArrowLeft, Shield, Plus } from 'lucide-vue-next'
import { sessionStore } from '@/stores/session'
import { usersStore } from '@/stores/user'
import { resolveGameComponent } from '@/utils/gameSession'

// Import Tabs
import OverviewTab from './GameCenter/OverviewTab.vue'
import GamesTab from './GameCenter/GamesTab.vue'
import LeaderboardTab from './GameCenter/LeaderboardTab.vue'
import BadgesTab from './GameCenter/BadgesTab.vue'
import ManageGamesTab from './GameCenter/ManageGamesTab.vue'
import GameResultScreen from './GameCenter/GameResultScreen.vue'

// Import Instructor Modals
import BadgeManager from './GameCenter/instructor/BadgeManager.vue'
import CreateQuizModal from './GameCenter/instructor/CreateQuizModal.vue'
import GameFormModal from './GameCenter/instructor/GameFormModal.vue'

const { brand } = sessionStore()
const { userResource } = usersStore()
const route = useRoute()
const router = useRouter()

const showBadgeManager = ref(false)
const showCreateQuiz = ref(false)
const showGameForm = ref(false)
const gamesTabRef = ref(null)

function onGameCreated() {
	activeTab.value = 'games'
	setTimeout(() => { gamesTabRef.value?.reload() }, 200)
}

function onGameSaved() {
	// Refresh manage tab if open, or switch to it
	if (activeTab.value !== 'manage') activeTab.value = 'manage'
}

// Tab list — instructors see extra Manage tab
const tabList = computed(() => {
	const base = [
		{ label: __('Overview'), value: 'overview' },
		{ label: __('Games'), value: 'games' },
		{ label: __('Leaderboard'), value: 'leaderboard' },
		{ label: __('Badges'), value: 'badges' },
	]
	if (isModerator.value || isInstructor.value) {
		base.push({ label: __('Manage Games'), value: 'manage' })
	}
	return base
})

const userRoles = computed(() => userResource.data?.roles || [])
const isModerator = computed(() => userRoles.value.includes('Moderator') || userRoles.value.includes('System Manager'))
const isInstructor = computed(() => userRoles.value.includes('Course Creator') || userRoles.value.includes('Course Evaluator'))

const activeTab = computed({
	get() { return route.params.tab || "overview" },
	set(val) { router.push({ name: "GameCenterTab", params: { tab: val } }) }
})

const activeGame = computed(() => route.name === "GameCenterGame" ? route.params.gameId : null)
const activeClassGame = computed(() => route.query.classGame || null)

// Resolve the game component asynchronously based on the URL parameter
const gameComponent = computed(() => {
	if (!activeGame.value) return null
	const comp = resolveGameComponent(activeGame.value)
	if (comp) {
		return defineAsyncComponent(comp)
	}
	return null
})

function closeGame() {
	router.push({ name: 'GameCenterTab', params: { tab: 'overview' } })
}

const gameResult = ref(null)
const activeGameTitle = ref('')

function onGameFinished(result) {
	console.log('Game Finished', result)
	gameResult.value = result || { score: 0, max_score: 0 }
	// Try to get game title from route/query
	activeGameTitle.value = route.params.gameId?.replace(/_/g, ' ') || 'Game'
}

function dismissResult() {
	gameResult.value = null
	// Go back to games tab
	router.push({ name: 'GameCenterTab', params: { tab: 'games' } })
}

const breadcrumbs = computed(() => [{ label: __("Game Center"), route: { name: "GameCenter" } }])
usePageMeta(() => ({ title: __("Game Center"), icon: brand.favicon }))
</script>
