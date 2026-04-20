<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs :items="breadcrumbs" />
		</header>

		<div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
			<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 class="text-2xl font-bold text-ink-gray-9">{{ __('AI Integration Dashboard') }}</h1>
					<p class="mt-1 text-sm text-ink-gray-6">{{ __('Access AI-powered learning and grading tools from one place.') }}</p>
				</div>
			</div>

			<section v-if="isTeacher" class="mb-6">
				<div class="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-gray-7">
					<span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-surface-gray-2">T</span>
					<span>{{ __('Teacher Tools') }}</span>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<button
						v-for="item in teacherItems"
						:key="item.label"
						class="w-full rounded-2xl border border-outline-gray-2 bg-surface-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
						@click="go(item.to)"
					>
						<div class="mb-2 flex items-center justify-between">
							<div class="text-lg font-semibold text-ink-gray-9">{{ __(item.label) }}</div>
							<component :is="icons[item.icon]" class="h-5 w-5 text-ink-gray-6" />
						</div>
						<p class="text-sm text-ink-gray-6">{{ __(item.description) }}</p>
					</button>
				</div>
			</section>

			<section v-if="isStudent">
				<div class="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-gray-7">
					<span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-surface-gray-2">S</span>
					<span>{{ __('Student Tools') }}</span>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<button
						v-for="item in studentItems"
						:key="item.label"
						class="w-full rounded-2xl border border-outline-gray-2 bg-surface-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
						@click="go(item.to)"
					>
						<div class="mb-2 flex items-center justify-between">
							<div class="text-lg font-semibold text-ink-gray-9">{{ __(item.label) }}</div>
							<component :is="icons[item.icon]" class="h-5 w-5 text-ink-gray-6" />
						</div>
						<p class="text-sm text-ink-gray-6">{{ __(item.description) }}</p>
					</button>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Breadcrumbs, usePageMeta } from 'frappe-ui'
import { sessionStore } from '@/stores/session'
import * as icons from 'lucide-vue-next'

const { brand } = sessionStore()
const router = useRouter()
const user = inject('$user')

const isTeacher = computed(() => user.data?.is_moderator || user.data?.is_instructor)
const isStudent = computed(() => user.data?.is_student)

const teacherItems = computed(() => {
	const items = [
		{
			label: 'AI Grading',
			description: 'Open AI-assisted grading workflows for objective and essay assessments.',
			icon: 'Bot',
			to: 'AIGradingObjective',
		},
		{
			label: 'Grading Book',
			description: 'Review class scores, progress, and grading outcomes in one place.',
			icon: 'BookText',
			to: 'GradingBook',
		},
	]
	if (user.data?.is_moderator) {
		items.push({
			label: 'AI Analytics',
			description: 'Track AI grading quality and session-level performance metrics.',
			icon: 'ChartColumnBig',
			to: 'AIGradingAdmin',
		})
	}
	return items
})

const studentItems = [
	{
		label: 'Score Insights Dashboard',
		description: 'Open your AI score analytics dashboard with trends and recommendations.',
		icon: 'ChartNoAxesCombined',
		to: 'StudentScoreDashboard',
	},
	{
		label: 'Smart Chatbot',
		description: 'Ask study questions and get quick support for lessons and assignments.',
		icon: 'MessageCircleMore',
		to: 'StudentAIHelper',
	},
	{
		label: 'Q&A Support',
		description: 'Search and explore answers across learning materials and resources.',
		icon: 'MessagesSquare',
		to: 'Search',
	},
]

const breadcrumbs = computed(() => [
	{
		label: __('AI Integration'),
		route: { name: 'AIIntegration' },
	},
])

const go = (name) => {
	if (name && router.hasRoute(name)) {
		router.push({ name })
	}
}

usePageMeta(() => {
	return {
		title: `${__('AI Integration')} - ${brand.value}`,
	}
})
</script>
