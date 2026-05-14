<template>
	<div class="flex h-[100vh] h-[100dvh] overflow-y-auto flex-col transition-colors duration-300" style="background-color: #fdfcf9;">
		<header
			v-if="!isWorkspaceView"
			class="sticky top-0 z-50 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 py-3 sm:px-6 shadow-sm"
		>
			<div class="flex items-center gap-4">
				<button
					class="group flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-105 active:scale-95"
					@click="router.push({ name: 'AIIntegration' })"
				>
					<icons.ChevronLeft class="h-5 w-5 text-slate-600 stroke-[3px]" />
				</button>
				<div class="h-8 w-px bg-slate-100"></div>
				<Breadcrumbs :items="breadcrumbs" />
			</div>
			<TabButtons
				v-if="user.data?.is_moderator || user.data?.is_instructor"
				v-model="currentMode"
				:buttons="gradingModes"
				class="w-fit font-bold"
			/>
		</header>

		<div :class="isWorkspaceView ? 'relative flex-1' : 'flex-1 py-10 mx-auto w-full max-w-[1600px] px-6 sm:px-10'">
			<router-view v-slot="{ Component, route }">
				<component :is="Component" :key="route.fullPath" />
			</router-view>
		</div>
	</div>
</template>

<script setup>
import { Breadcrumbs, TabButtons, usePageMeta } from 'frappe-ui'
import { inject, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { sessionStore } from '@/stores/session'
import * as icons from 'lucide-vue-next'

const { brand } = sessionStore()
const router = useRouter()
const route = useRoute()
const user = inject('$user')

// Map route names to tab values
const routeToTab = {
	AIGradingObjective: 'AIGradingObjective',
	AIGradingEssay: 'AIGradingEssay',
	AIGradingEssayConfig: 'AIGradingEssay',
	AIGradingEssayWorkspace: 'AIGradingEssay',
	AIGradingAdmin: 'AIGradingAdmin',
}

const gradingModes = computed(() => [
	{ label: __('Multiple Choice'), value: 'AIGradingObjective' },
	{ label: __('Essay'), value: 'AIGradingEssay' },
])

const currentMode = computed({
	get() {
		return routeToTab[route.name] || 'AIGradingObjective'
	},
	set(mode) {
		if (mode && routeToTab[route.name] !== mode) {
			router.push({ name: mode })
		}
	},
})

const currentModeLabel = computed(() => {
	if (routeToTab[route.name] === 'AIGradingAdmin') return __('Admin Dashboard')
	if (routeToTab[route.name] === 'AIGradingEssay') return __('Essay')
	return __('Multiple Choice')
})

const isWorkspaceView = computed(() => ['AIGradingEssayWorkspace', 'MCQGradingWorkspace'].includes(route.name))

onMounted(() => {
	if (!user.data?.is_moderator && !user.data?.is_instructor) {
		router.push({ name: 'Courses' })
	}
})

const breadcrumbs = computed(() => [
	{
		label: __('AI Grading'),
		route: { name: 'AIGradingObjective' },
	},
	{
		label: currentModeLabel.value,
		route: { name: currentMode.value },
	},
])

usePageMeta(() => {
	return {
		title: `${__('AI Grading')} - ${currentModeLabel.value} - ${brand.value}`,
	}
})
</script>

<style scoped>
::-webkit-scrollbar {
	width: 6px;
}
::-webkit-scrollbar-track {
	background: transparent;
}
::-webkit-scrollbar-thumb {
	background: #e2e8f0;
	border-radius: 10px;
}
</style>
