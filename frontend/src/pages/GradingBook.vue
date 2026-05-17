<template>
	<header
		class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5"
	>
		<div class="flex items-center gap-3">
			<button
				class="flex items-center gap-1 text-sm text-ink-blue-4 transition-colors hover:text-ink-blue-5"
				@click="goBackToAIIntegration"
			>
				<span aria-hidden="true">←</span>
				{{ __('Back') }}
			</button>
			<div class="h-5 w-px bg-outline-gray-2" />
			<Breadcrumbs :items="breadcrumbs" />
		</div>
	</header>

	<div class="py-5 mx-5 md:w-5/6 md:mx-auto">
		<div class="flex flex-col mb-4">
			<h2 class="text-2xl font-bold text-gray-900">{{ __('Gradebook Dashboard') }}</h2>
			<p class="text-sm text-gray-500 mt-1">{{ __('Manage student grades, skills, and pending AI submissions') }}</p>
		</div>

		<!-- Custom Tabs -->
		<div class="border-b border-gray-200 mb-5">
			<nav class="-mb-px flex space-x-8">
				<button 
					v-for="tab in tabs" 
					:key="tab.id"
					@click="currentTab = tab.id"
					:class="[
						currentTab === tab.id
							? 'border-indigo-500 text-indigo-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
							'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
					]"
				>
					{{ tab.label }}
				</button>
			</nav>
		</div>

		<!-- Tab 1: Gradebook Overview -->
		<div v-show="currentTab === 'overview'" class="bg-white shadow rounded-lg border border-gray-100 p-6">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold text-gray-800">{{ __('Gradebook Overview (Bảng điểm)') }}</h3>
				<div class="flex gap-2">
					<button class="px-3 py-1.5 text-sm font-medium text-white bg-[#2d6a4f] rounded-md hover:bg-[#1f4a37] transition">{{ __('Export CSV') }}</button>
				</div>
			</div>
			
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 border rounded-lg">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ __('Student Name') }}</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ __('Quiz (30%)') }}</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ __('Midterm (30%)') }}</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ __('Final (40%)') }}</th>
							<th class="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">{{ __('Total Score') }}</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						<tr v-if="gradebookResource.loading">
							<td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 italic">{{ __('Loading gradebook...') }}</td>
						</tr>
						<tr v-else-if="!gradebookResource.data?.length">
							<td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 italic">{{ __('No grading data found for this batch.') }}</td>
						</tr>
						<tr v-for="std in gradebookResource.data" :key="std.id" class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ std.name }}</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ std.quiz || 0 }}</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ std.midterm || 0 }}</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ std.final || 0 }}</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-bold" :class="scoreColor(std.total)">{{ std.total }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Tab 2: Needs Grading -->
		<div v-show="currentTab === 'pending'" class="bg-white shadow rounded-lg border border-gray-100 p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-4">{{ __('Needs Grading (Cần chấm / Chờ duyệt mức AI)') }}</h3>
			<ul class="divide-y divide-gray-200">
				<li class="py-4 flex items-center justify-between">
					<div class="flex items-center">
						<span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 font-bold mr-3">AI</span>
						<div>
							<p class="text-sm font-medium text-gray-900">{{ __('Midterm exam: Literature 10') }}</p>
							<p class="text-xs text-gray-500">12 Submissions AI graded, pending teacher approval.</p>
						</div>
					</div>
					<button @click="$router.push('/aigrading/1')" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">{{ __('Review Now') }}</button>
				</li>
				<li class="py-4 flex items-center justify-between">
					<div class="flex items-center">
						<span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold mr-3">T</span>
						<div>
							<p class="text-sm font-medium text-gray-900">{{ __('Week 5 assignment - History') }}</p>
							<p class="text-xs text-gray-500">5 Submissions pending manual grading.</p>
						</div>
					</div>
					<button class="text-sm font-medium text-indigo-600 hover:text-indigo-500">{{ __('Review Now') }}</button>
				</li>
			</ul>
		</div>

		<!-- Tab 3: Learning Outcomes -->
		<div v-show="currentTab === 'outcomes'" class="bg-white shadow rounded-lg border border-gray-100 p-6">
			<div class="flex justify-between items-center mb-6">
				<h3 class="text-lg font-semibold text-gray-800">{{ __('Class Competency Matrix (Ma trận Năng lực Lớp học)') }}</h3>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div v-if="competencyResource.loading" class="col-span-2 text-center py-10 text-gray-500 italic">
					{{ __('Calculating competencies...') }}
				</div>
				<div v-else-if="!competencyResource.data?.length" class="col-span-2 text-center py-10 text-gray-500 italic">
					{{ __('No competency data available.') }}
				</div>
				<div v-for="outcome in competencyResource.data" :key="outcome.id" class="border rounded-lg p-5">
					<h4 class="font-medium text-gray-700 mb-3">{{ outcome.label }}</h4>
					<div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
						<div 
							class="h-2.5 rounded-full transition-all duration-500" 
							:style="{ width: outcome.percentage + '%' }"
							:class="outcome.percentage >= 80 ? 'bg-emerald-500' : outcome.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'"
						></div>
					</div>
					<div class="flex justify-between text-xs text-gray-500">
						<span>{{ outcome.percentage >= 50 ? __('Đạt') : __('Chưa đạt') }}</span>
						<span class="font-semibold" :class="outcome.percentage >= 80 ? 'text-emerald-600' : outcome.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'">
							{{ outcome.percentage }}%
						</span>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>

<script setup>
import { Breadcrumbs, usePageMeta, createResource } from 'frappe-ui'
import { inject, onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sessionStore } from '@/stores/session'

const props = defineProps({
	courseName: {
		type: String,
		required: false,
	},
	batchName: {
		type: String,
		required: false,
	},
})

const { brand } = sessionStore()
const router = useRouter()
const user = inject('$user')

const currentTab = ref('overview')
const tabs = [
	{ id: 'overview', label: __('Overview') },
	{ id: 'pending', label: __('Needs Grading') },
	{ id: 'outcomes', label: __('Learning Outcomes') },
]

// Real Data Resources
const gradebookResource = createResource({
	url: 'lms.lms.api.get_gradebook_data',
	params: {
		course: props.courseName,
		batch: props.batchName,
	},
	auto: true,
})

const competencyResource = createResource({
	url: 'lms.lms.api.get_class_competency_matrix',
	params: {
		course: props.courseName,
		batch: props.batchName,
	},
	auto: true,
})

function scoreColor(s) {
	if (s >= 8) return 'text-emerald-600'
	if (s >= 6) return 'text-amber-500'
	return 'text-rose-600'
}

function goBackToAIIntegration() {
	router.push({ name: 'AIIntegration' })
}

onMounted(() => {
	if (!user.data?.is_moderator && !user.data?.is_instructor) {
		router.push({ name: 'Courses' })
	}
})

const breadcrumbs = computed(() => {
	const items = [
		{
			label: __('GradingBook'),
			route: { name: 'GradingBook' },
		},
	]
	if (props.courseName) {
		items.push({
			label: props.courseName,
			route: { name: 'GradingBook', params: { courseName: props.courseName } },
		})
	}
	return items
})

usePageMeta(() => {
	return {
		title: `${__('Gradebook')} - ${brand.value}`,
	}
})
</script>
