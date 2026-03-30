<template>
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<button
					class="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-700 font-medium"
					@click="$router.push({ name: 'AIGradingEssayConfig', params: { type: type } })"
				>
					← {{ __('Back to Config') }}
				</button>
				<h2 class="text-2xl font-bold text-gray-900 tracking-tight">
					{{ __('Session Statistics') }}: {{ sessionDoc?.session_name || '...' }}
				</h2>
				<p class="mt-1 text-sm text-gray-500">
					{{ __('Detailed insights and performance analysis for this session.') }}
				</p>
			</div>
			<div v-if="sessionDoc" class="flex items-center gap-2">
				<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200">
					ID: {{ sessionDoc.name }}
				</span>
				<span class="rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm" :style="{ backgroundColor: '#2d6a4f' }">
					{{ sessionDoc.status }}
				</span>
			</div>
		</div>

		<!-- Summary Stats with Progress Bars -->
		<div v-if="statsResource.loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
			<div v-for="i in 4" :key="i" class="h-32 rounded-xl border border-gray-100 bg-gray-50/50"></div>
		</div>
		<div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<AIAnalyticsStatCard
				:label="__('Grading Progress')"
				:value="stats.graded + '/' + stats.total"
				:progress="progressPercent"
				showProgress
				:progressLabel="__('Completion Rate')"
				variant="default"
			/>
			<AIAnalyticsStatCard
				:label="__('Average Score')"
				:value="stats.avg_score"
				:subtitle="__('Across all graded papers')"
				variant="info"
			/>
			<AIAnalyticsStatCard
				:label="__('High Scores (≥8)')"
				:value="stats.high_scores"
				:progress="stats.total ? Math.round((stats.high_scores / stats.total) * 100) : 0"
				showProgress
				:progressLabel="__('Excellence Rate')"
				variant="success"
			/>
			<AIAnalyticsStatCard
				:label="__('Low Scores (<5)')"
				:value="stats.low_scores"
				:progress="stats.total ? Math.round((stats.low_scores / stats.total) * 100) : 0"
				showProgress
				:progressLabel="__('At-risk Rate')"
				variant="danger"
			/>
		</div>

		<!-- Score Distribution Chart -->
		<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider">{{ __('Score Distribution') }}</h3>
				<span class="text-[10px] text-gray-400">{{ __('Student counts per score range') }}</span>
			</div>
			<div v-if="statsResource.loading" class="h-64 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse"></div>
			<div v-else class="h-64">
				<apexchart 
					type="bar" 
					height="100%" 
					:options="chartOptions" 
					:series="chartSeries"
				></apexchart>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Most Failed Questions -->
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider">{{ __('Challenging Questions') }}</h3>
					<span class="text-[10px] text-gray-400">{{ __('Based on student failure rates') }}</span>
				</div>
				<div v-if="statsResource.loading" class="space-y-4">
					<div v-for="i in 3" :key="i" class="h-12 bg-gray-50 rounded-lg animate-pulse"></div>
				</div>
				<div v-else-if="!stats.top_failed_questions?.length" class="flex h-32 items-center justify-center text-sm text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
					{{ __('No question data available yet.') }}
				</div>
				<ul v-else class="space-y-4">
					<li v-for="(q, idx) in stats.top_failed_questions" :key="idx" class="group">
						<div class="flex items-center justify-between mb-1.5">
							<span class="text-sm font-semibold text-gray-700">{{ q.name }}</span>
							<span class="text-xs font-bold text-rose-600">{{ q.fail_rate }}% {{ __('fail') }}</span>
						</div>
						<div class="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
							<div 
								class="h-full rounded-full bg-rose-500 transition-all duration-1000"
								:style="{ width: q.fail_rate + '%' }"
							></div>
						</div>
						<div class="mt-1 text-[10px] text-gray-400">
							{{ q.fail_count }} / {{ q.total }} {{ __('students struggled with this part') }}
						</div>
					</li>
				</ul>
			</div>

			<!-- At-risk Students List -->
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider">{{ __('At-Risk Students (< 5.0)') }}</h3>
					<span class="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
						{{ stats.low_scores }} {{ __('Students') }}
					</span>
				</div>
				<div v-if="statsResource.loading" class="space-y-4">
					<div v-for="i in 3" :key="i" class="h-12 bg-gray-50 rounded-lg animate-pulse"></div>
				</div>
				<div v-else-if="!stats.at_risk_students?.length" class="flex h-32 items-center justify-center text-sm text-emerald-600 bg-emerald-50 rounded-xl border border-dashed border-emerald-100">
					✓ {{ __('All students scored 5.0 or above!') }}
				</div>
				<div v-else class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead>
							<tr class="border-b border-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400">
								<th class="pb-2 font-semibold">{{ __('Student') }}</th>
								<th class="pb-2 text-center font-semibold">{{ __('SBD') }}</th>
								<th class="pb-2 text-right font-semibold">{{ __('Score') }}</th>
								<th class="pb-2 text-right font-semibold">{{ __('Action') }}</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50">
							<tr v-for="s in stats.at_risk_students" :key="s.student_id" class="group hover:bg-gray-50/80 transition-colors">
								<td class="py-2.5">
									<div class="font-bold text-gray-700">{{ s.name }}</div>
									<div class="text-[10px] text-gray-400">{{ s.student_id }}</div>
								</td>
								<td class="py-2.5 text-center font-mono text-xs text-gray-500">{{ s.sbd || '—' }}</td>
								<td class="py-2.5 text-right font-bold text-rose-600">{{ s.score.toFixed(1) }}</td>
								<td class="py-2.5 text-right">
									<button 
										class="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600 shadow-sm border border-rose-100 transition-all hover:bg-rose-100"
										:disabled="emailResource.loading"
										@click="sendEmail(s.submission_id)"
									>
										<span v-if="emailResource.loading && emailResource.params.submission === s.submission_id">...</span>
										<span v-else>{{ __('Send Email') }}</span>
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createResource, Toast } from 'frappe-ui'
import apexchart from 'vue3-apexcharts'
import AIAnalyticsStatCard from '@/components/AIGrading/AIAnalyticsStatCard.vue'

const props = defineProps({
	type: { type: String, required: true },
	sessionSlug: { type: String, required: true },
})

const route = useRoute()
const router = useRouter()

const sessionDoc = ref(null)

// 1. Load Session basic details
const sessionResource = createResource({
	url: 'lms.lms.api.get_ai_grading_session_by_slug',
	auto: true,
	makeParams() {
		return {
			session_slug: props.sessionSlug,
			grading_type: props.type === 'test' ? 'Test' : (props.type === 'hw' ? 'Homework' : 'Exam')
		}
	},
	onSuccess(data) {
		if (data) {
			sessionDoc.value = data
			statsResource.submit()
		}
	}
})

// 2. Load Detailed Statistics
const statsResource = createResource({
	url: 'lms.lms.api.get_ai_grading_session_statistics',
	makeParams() {
		return {
			session: sessionDoc.value?.name
		}
	}
})

const stats = computed(() => {
	return statsResource.data || {
		total: 0,
		graded: 0,
		ungraded: 0,
		high_scores: 0,
		low_scores: 0,
		score_distribution: [],
		avg_score: 0,
		top_failed_questions: [],
		at_risk_students: []
	}
})

const progressPercent = computed(() => {
	if (!stats.value.total) return 0
	return Math.round((stats.value.graded / stats.value.total) * 100)
})

// 3. Email Functionality
const emailResource = createResource({
	url: 'lms.lms.api.send_ai_grading_result_email',
	onSuccess() {
		Toast(__('Email sent successfully!'))
	}
})

function sendEmail(submissionId) {
	emailResource.submit({ submission: submissionId })
}

// 4. Chart Configuration
const chartSeries = computed(() => {
	return [{
		name: __('Students'),
		data: stats.value.score_distribution?.map(d => d.count) || []
	}]
})

const chartOptions = computed(() => {
	return {
		chart: {
			type: 'bar',
			toolbar: { show: false },
			fontFamily: 'inherit'
		},
		plotOptions: {
			bar: {
				borderRadius: 6,
				columnWidth: '50%',
				distributed: true
			}
		},
		colors: ['#f43f5e', '#facc15', '#3b82f6', '#10b981', '#059669'],
		dataLabels: { enabled: false },
		legend: { show: false },
		xaxis: {
			categories: stats.value.score_distribution?.map(d => d.bucket) || [],
			labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
			axisBorder: { show: false },
			axisTicks: { show: false }
		},
		yaxis: {
			labels: { style: { colors: '#94a3b8', fontSize: '11px' } }
		},
		grid: {
			borderColor: '#f1f5f9',
			strokeDashArray: 4,
			xaxis: { lines: { show: true } }
		},
		tooltip: { theme: 'light' }
	}
})

onMounted(() => {
	if (props.sessionSlug) {
		sessionResource.fetch()
	}
})

</script>
