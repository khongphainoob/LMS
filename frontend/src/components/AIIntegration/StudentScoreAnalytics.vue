<template>
	<section class="mb-6 rounded-2xl border border-outline-gray-2 bg-surface-white p-5 shadow-sm">
		<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
			<div>
				<h3 class="text-xl font-bold text-ink-gray-9">{{ __('Scoreboard & AI Analysis') }}</h3>
				<p class="mt-1 text-sm text-ink-gray-6">{{ __('Track your scores and get AI-powered learning insights.') }}</p>
			</div>
			<div class="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
				{{ __('GPA') }}: {{ averageScore }} / 10
			</div>
		</div>

		<div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
			<div class="rounded-xl border border-outline-gray-2 bg-surface-gray-1 p-3">
				<div class="text-xs text-ink-gray-6">{{ __('Total Results') }}</div>
				<div class="mt-1 text-2xl font-bold text-ink-gray-9">{{ totalResults }}</div>
			</div>
			<div class="rounded-xl border border-outline-gray-2 bg-surface-gray-1 p-3">
				<div class="text-xs text-ink-gray-6">{{ __('High Scores (>=8)') }}</div>
				<div class="mt-1 text-2xl font-bold text-emerald-700">{{ highScores }}</div>
			</div>
			<div class="rounded-xl border border-outline-gray-2 bg-surface-gray-1 p-3">
				<div class="text-xs text-ink-gray-6">{{ __('Need Improvement (<5)') }}</div>
				<div class="mt-1 text-2xl font-bold text-rose-700">{{ lowScores }}</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
			<div class="rounded-xl border border-outline-gray-2">
				<div class="border-b border-outline-gray-2 px-4 py-3 text-sm font-semibold text-ink-gray-8">
					{{ __('Recent Grade Results') }}
				</div>
				<div v-if="gradesResource.loading" class="px-4 py-6 text-sm italic text-ink-gray-6">
					{{ __('Loading grades...') }}
				</div>
				<div v-else-if="!gradesResource.data?.length" class="px-4 py-6 text-sm italic text-ink-gray-6">
					{{ __('No grades available yet.') }}
				</div>
				<div v-else class="max-h-[280px] overflow-y-auto">
					<table class="min-w-full text-sm">
						<thead class="bg-surface-gray-1 text-ink-gray-6">
							<tr>
								<th class="px-4 py-2 text-left font-medium">{{ __('Course') }}</th>
								<th class="px-4 py-2 text-left font-medium">{{ __('Result') }}</th>
								<th class="px-4 py-2 text-left font-medium">{{ __('Score') }}</th>
								<th class="px-4 py-2 text-left font-medium">{{ __('Date') }}</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="item in gradesResource.data"
								:key="item.id"
								class="border-b border-outline-gray-1"
							>
								<td class="px-4 py-2 text-ink-gray-8">{{ item.course }}</td>
								<td class="px-4 py-2 text-ink-gray-7">{{ item.name }}</td>
								<td class="px-4 py-2 font-semibold" :class="scoreColor(item.score)">
									{{ item.score }}/10
								</td>
								<td class="px-4 py-2 text-ink-gray-6">{{ item.date }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div class="rounded-xl border border-outline-gray-2 bg-surface-gray-1 p-4">
				<div class="mb-2 text-sm font-semibold text-ink-gray-8">{{ __('AI Insights') }}</div>
				<ul class="space-y-2 text-sm text-ink-gray-7">
					<li>{{ aiInsight.summary }}</li>
					<li>{{ aiInsight.strength }}</li>
					<li>{{ aiInsight.improvement }}</li>
					<li>{{ aiInsight.nextStep }}</li>
				</ul>
			</div>
		</div>
	</section>
</template>

<script setup>
import { computed } from 'vue'
import { createResource } from 'frappe-ui'

const gradesResource = createResource({
	url: 'lms.lms.api.get_student_grades',
	auto: true,
})

const totalResults = computed(() => gradesResource.data?.length || 0)
const highScores = computed(() => (gradesResource.data || []).filter((x) => x.score >= 8).length)
const lowScores = computed(() => (gradesResource.data || []).filter((x) => x.score < 5).length)

const averageScore = computed(() => {
	if (!gradesResource.data?.length) return 0
	const sum = gradesResource.data.reduce((acc, curr) => acc + (curr.score || 0), 0)
	return (sum / gradesResource.data.length).toFixed(1)
})

const aiInsight = computed(() => {
	const avg = Number(averageScore.value || 0)
	if (!gradesResource.data?.length) {
		return {
			summary: __('No score data yet. Keep submitting quizzes and assignments to unlock personalized AI insights.'),
			strength: __('Strength: Your participation has started and the system is ready to track your learning progress.'),
			improvement: __('Improvement area: Build a consistent study rhythm with 3 focused sessions each week.'),
			nextStep: __('Next step: Complete your next assessment and review feedback right after submission.'),
		}
	}

	if (avg >= 8) {
		return {
			summary: __('Great performance. Your average score is in the high band.'),
			strength: __('Strength: You show strong understanding across recent assessments.'),
			improvement: __('Improvement area: Keep depth in explanation to maintain stable high scores.'),
			nextStep: __('Next step: Challenge yourself with advanced questions to sustain momentum.'),
		}
	}

	if (avg >= 5) {
		return {
			summary: __('Your performance is stable and on track.'),
			strength: __('Strength: You are passing consistently in most recent evaluations.'),
			improvement: __('Improvement area: Focus on topics where your score dropped below 7.'),
			nextStep: __('Next step: Review one weak topic daily and re-attempt similar questions.'),
		}
	}

	return {
		summary: __('Your current score trend needs support and a stronger review plan.'),
		strength: __('Strength: You are still active and generating data for targeted coaching.'),
		improvement: __('Improvement area: Core concepts and basic practice need reinforcement this week.'),
		nextStep: __('Next step: Ask the Smart Chatbot for a 7-day recovery plan and follow it closely.'),
	}
})

const scoreColor = (score) => {
	if (score >= 8) return 'text-emerald-700'
	if (score >= 5) return 'text-amber-700'
	return 'text-rose-700'
}
</script>
