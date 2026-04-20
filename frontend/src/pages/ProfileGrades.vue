<script setup>
import { computed } from 'vue'
import { createResource } from 'frappe-ui'

const props = defineProps({
	profile: {
		type: Object,
		required: true,
	},
})

// Real Data Resource
const gradesResource = createResource({
	url: 'lms.lms.api.get_student_grades',
	params: {
		student: props.profile?.name,
	},
	auto: true,
})

const avgScore = computed(() => {
	if (!gradesResource.data?.length) return 0
	const sum = gradesResource.data.reduce((acc, curr) => acc + curr.score, 0)
	return (sum / gradesResource.data.length).toFixed(1)
})
</script>

<template>
	<div class="mt-5">
		<div class="flex justify-between items-end mb-4">
			<div>
				<h3 class="text-xl font-bold text-gray-900">{{ __('Bảng điểm & Năng lực (Grades)') }}</h3>
				<p class="text-sm text-gray-500 mt-1">{{ __('Continuous assessment and competency tracking') }}</p>
			</div>
			<div class="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">
				{{ __('GPA') }}: {{ avgScore }} / 10
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
			<!-- Radar Chart Placeholder -->
			<div class="bg-white border rounded-lg p-5 flex flex-col items-center justify-center min-h-[300px]">
				<h4 class="font-semibold text-gray-700 w-full text-left mb-4">{{ __('Competency Radar') }}</h4>
				<div class="relative w-64 h-64">
					<!-- Fake SVG Radar Chart for mock visually -->
					<svg viewBox="0 0 100 100" class="w-full h-full text-gray-200 overflow-visible">
						<!-- Polygon axes -->
						<polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="currentColor" stroke-width="1" />
						<polygon points="50,25 80,48 68,80 32,80 20,48" fill="none" class="text-gray-100" stroke="currentColor" stroke-width="1" />
						<!-- Data Polygon -->
						<polygon points="50,20 85,45 60,85 40,80 15,35" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="2" />
						
						<!-- Axis lines -->
						<line x1="50" y1="50" x2="50" y2="10" stroke="currentColor" stroke-width="1" />
						<line x1="50" y1="50" x2="90" y2="40" stroke="currentColor" stroke-width="1" />
						<line x1="50" y1="50" x2="75" y2="90" stroke="currentColor" stroke-width="1" />
						<line x1="50" y1="50" x2="25" y2="90" stroke="currentColor" stroke-width="1" />
						<line x1="50" y1="50" x2="10" y2="40" stroke="currentColor" stroke-width="1" />
					</svg>
					<!-- Labels -->
					<span class="absolute -top-6 left-[40%] text-xs font-medium text-gray-600">Kiến thức</span>
					<span class="absolute top-[35%] -right-8 text-xs font-medium text-gray-600">Kỹ năng</span>
					<span class="absolute bottom-[-10px] right-2 text-xs font-medium text-gray-600">Thái độ</span>
					<span class="absolute bottom-[-10px] left-2 text-xs font-medium text-gray-600">Sáng tạo</span>
					<span class="absolute top-[35%] -left-8 text-xs font-medium text-gray-600">Tư duy</span>
				</div>
			</div>

			<!-- Recent Grades Table -->
			<div class="bg-white border rounded-lg p-5">
				<h4 class="font-semibold text-gray-700 mb-4">{{ __('Recent Submissions') }}</h4>
				<div v-if="gradesResource.loading" class="text-center py-5 text-gray-500 italic">
					{{ __('Loading grades...') }}
				</div>
				<div v-else-if="!gradesResource.data?.length" class="text-center py-5 text-gray-500 italic">
					{{ __('No grades available yet.') }}
				</div>
				<ul v-else class="divide-y divide-gray-100">
					<li class="py-3 flex justify-between items-center" v-for="item in gradesResource.data" :key="item.id">
						<div>
							<p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
							<p class="text-xs text-gray-500">{{ item.date }} • {{ item.course }}</p>
						</div>
						<div class="flex items-center space-x-2">
							<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800" v-if="item.score >= 8">
								{{ __('Giỏi') }}
							</span>
							<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800" v-else-if="item.score >= 5">
								{{ __('Đạt') }}
							</span>
							<span class="font-bold text-gray-900 ml-2">{{ item.score }}/10</span>
						</div>
					</li>
				</ul>
				<button class="w-full mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 text-center">
					{{ __('View Grade History Log') }} &rarr;
				</button>
			</div>
		</div>
	</div>
</template>
