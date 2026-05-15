<template>
	<div class="space-y-6">
		<!-- Dashboard Header -->
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-gray-900 tracking-tight">
					{{ __('AI Grading Dashboard') }}
				</h2>
				<p class="mt-1 text-sm text-gray-500">
					{{ __('Monitor AI performance and review teacher feedback.') }}
				</p>
			</div>
		</div>

		<!-- Summary Stats -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<AIAnalyticsStatCard
				:label="__('Graded Today')"
				:value="analytics.graded_today"
				variant="success"
			/>
			<AIAnalyticsStatCard
				:label="__('Satisfaction Rate')"
				:value="analytics.satisfaction_rate ? analytics.satisfaction_rate + '%' : '—'"
				variant="info"
			/>
			<AIAnalyticsStatCard
				:label="__('Review Flags')"
				:value="analytics.need_review"
				variant="danger"
			/>
			<AIAnalyticsStatCard
				:label="__('Open Sessions')"
				:value="analytics.open_sessions"
				variant="warning"
			/>
		</div>

		<!-- Extra Stats Row -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<AIAnalyticsStatCard
				:label="__('Total Sessions')"
				:value="analytics.total_sessions"
			/>
			<AIAnalyticsStatCard
				:label="__('Total Submissions')"
				:value="analytics.total_submissions"
			/>
			<AIAnalyticsStatCard
				:label="__('Dissatisfied')"
				:value="analytics.dissatisfied_count"
				variant="danger"
			/>
		</div>

		<!-- Feedback Table -->
		<div ref="feedbackSection">
			<AIAnalyticsFeedbackTable
				:items="feedbackList"
				:loading="feedbackResource.loading"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { createResource } from 'frappe-ui'

import AIAnalyticsStatCard from '@/components/AIGrading/AIAnalyticsStatCard.vue'
import AIAnalyticsFeedbackTable from '@/components/AIGrading/AIAnalyticsFeedbackTable.vue'

const router = useRouter()
const user = inject('$user')
const feedbackSection = ref(null)

// Admin-only guard: redirect non-Moderator users
onMounted(() => {
	if (!user.data?.is_moderator) {
		router.push({ name: 'AIGradingEssay' })
	}
})

// Real analytics from backend API
const analyticsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_analytics',
	auto: true,
})

const analytics = computed(() => {
	return analyticsResource.data || {
		total_sessions: 0,
		open_sessions: 0,
		total_submissions: 0,
		graded_today: 0,
		need_review: 0,
		total_rated: 0,
		satisfied_count: 0,
		dissatisfied_count: 0,
		satisfaction_rate: 0,
	}
})

// Real dissatisfaction feedback from backend API
const feedbackResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_dissatisfaction_feed',
	auto: true,
	makeParams() {
		return { limit: 50 }
	},
})

const feedbackList = computed(() => {
	return feedbackResource.data || []
})

</script>
