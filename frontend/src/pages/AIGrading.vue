<template>
	<div class="flex min-h-screen flex-col" style="background-color: #f7f5f0;">
		<header
			v-if="!isWorkspaceView"
			class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5 shadow-sm"
		>
			<Breadcrumbs :items="breadcrumbs" />
			<TabButtons
				v-if="user.data?.is_moderator || user.data?.is_instructor"
				v-model="currentMode"
				:buttons="gradingModes"
				class="w-fit"
			/>
		</header>

		<div :class="isWorkspaceView ? 'relative flex-1' : 'flex-1 py-5 mx-5 md:w-4/5 md:mx-auto'">
			<router-view />
		</div>
	</div>
</template>

<script setup>
import { Breadcrumbs, TabButtons, usePageMeta } from 'frappe-ui'
import { inject, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { sessionStore } from '@/stores/session'

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

const gradingModes = computed(() => {
	const modes = [
		{ label: __('Multiple Choice'), value: 'AIGradingObjective' },
		{ label: __('Essay'), value: 'AIGradingEssay' },
	]
	if (user.data?.is_moderator) {
		modes.push({ label: __('Admin Dashboard'), value: 'AIGradingAdmin' })
	}
	return modes
})

const currentMode = computed({
	get() {
		// Map current route to tab value, fallback to 'AIGradingObjective'
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

const isWorkspaceView = computed(() => route.name === 'AIGradingEssayWorkspace')

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

