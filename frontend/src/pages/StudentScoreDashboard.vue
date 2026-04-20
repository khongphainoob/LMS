<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs :items="breadcrumbs" />
		</header>

		<div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
			<div class="mb-5">
				<h1 class="text-2xl font-bold text-ink-gray-9">{{ __('Student Score Analytics') }}</h1>
				<p class="mt-1 text-sm text-ink-gray-6">
					{{ __('Dashboard for score trends, performance highlights, and AI-based recommendations.') }}
				</p>
			</div>

			<StudentScoreAnalytics />
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { Breadcrumbs, usePageMeta } from 'frappe-ui'
import { sessionStore } from '@/stores/session'
import StudentScoreAnalytics from '@/components/AIIntegration/StudentScoreAnalytics.vue'

const { brand } = sessionStore()

const breadcrumbs = computed(() => [
	{
		label: __('AI Integration'),
		route: { name: 'AIIntegration' },
	},
	{
		label: __('Student Score Analytics'),
		route: { name: 'StudentScoreDashboard' },
	},
])

usePageMeta(() => {
	return {
		title: `${__('Student Score Analytics')} - ${brand.value}`,
	}
})
</script>
