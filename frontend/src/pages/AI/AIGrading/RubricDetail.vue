<template>
	<div class="min-h-screen bg-gray-50/50 p-6">
		<div class="mx-auto max-w-5xl">
			<!-- Breadcrumb & Actions -->
			<div class="mb-6 flex items-center justify-between">
				<div class="flex items-center gap-2 text-sm text-gray-500">
					<router-link :to="{ name: 'AIGradingRubric' }" class="hover:text-violet-600 transition-colors">
						{{ __('Rubric Builder') }}
					</router-link>
					<ChevronRight class="h-4 w-4" />
					<span class="font-medium text-gray-900">{{ rubric?.title || __('Loading...') }}</span>
				</div>
				<div class="flex items-center gap-3">
					<button 
						@click="exportToWord" 
						class="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						<Download class="h-4 w-4" />
						{{ __('Export Word (LaTeX)') }}
					</button>
					<button 
						class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
						@click="printRubric"
					>
						<Printer class="h-4 w-4" />
						{{ __('Print') }}
					</button>
				</div>
			</div>

			<div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
				<div class="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600 mb-4" />
				<p class="text-gray-500 font-medium">{{ __('Loading rubric details...') }}</p>
			</div>

			<div v-else-if="rubric" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<!-- Header Card -->
				<div class="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
					<div class="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
						<div class="flex items-start justify-between">
							<div>
								<div class="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
									<Sparkles class="h-3 w-3" /> AI GENERATED RUBRIC
								</div>
								<h1 class="text-3xl font-bold tracking-tight">{{ rubric.title }}</h1>
								<p class="mt-2 text-violet-100 max-w-2xl leading-relaxed">{{ rubric.description }}</p>
							</div>
							<div class="text-right">
								<div class="text-sm text-violet-100 mb-1">{{ __('Total Max Score') }}</div>
								<div class="text-4xl font-black">{{ rubric.max_score }}</div>
							</div>
						</div>
					</div>
					<div class="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 sm:grid-cols-4">
						<div class="p-4 text-center">
							<div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ __('Subject') }}</div>
							<div class="font-semibold text-gray-900">{{ rubric.subject || 'N/A' }}</div>
						</div>
						<div class="p-4 text-center">
							<div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ __('Level') }}</div>
							<div class="font-semibold text-gray-900">{{ rubric.level || 'N/A' }}</div>
						</div>
						<div class="p-4 text-center">
							<div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ __('Scale') }}</div>
							<div class="font-semibold text-gray-900">{{ rubric.grading_scale }}</div>
						</div>
						<div class="p-4 text-center">
							<div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ __('Created') }}</div>
							<div class="font-semibold text-gray-900">{{ formatDate(rubric.creation) }}</div>
						</div>
					</div>
				</div>

				<!-- Criteria Table -->
				<div class="space-y-4">
					<h2 class="text-xl font-bold text-gray-900 px-1">{{ __('Assessment Criteria') }}</h2>
					
					<div v-for="(crit, i) in rubric.criteria" :key="i" class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
						<div class="mb-4 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 font-bold">
									{{ i + 1 }}
								</div>
								<div>
									<h3 class="font-bold text-gray-900 text-lg">{{ crit.criterion_name }}</h3>
									<p class="text-sm text-gray-500">{{ crit.description }}</p>
								</div>
							</div>
							<div class="rounded-xl bg-gray-50 px-4 py-2 text-center border border-gray-100">
								<div class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{{ __('Weight') }}</div>
								<div class="font-bold text-violet-700">{{ crit.max_score }} pts</div>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
							<div class="relative rounded-2xl bg-emerald-50/50 p-5 border border-emerald-100/50">
								<div class="mb-3 flex items-center gap-2">
									<div class="h-2 w-2 rounded-full bg-emerald-500" />
									<span class="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{{ __('Excellent') }}</span>
								</div>
								<p class="text-xs leading-relaxed text-emerald-900">{{ crit.level_excellent }}</p>
							</div>
							
							<div class="relative rounded-2xl bg-blue-50/50 p-5 border border-blue-100/50">
								<div class="mb-3 flex items-center gap-2">
									<div class="h-2 w-2 rounded-full bg-blue-500" />
									<span class="text-[10px] font-black text-blue-700 uppercase tracking-widest">{{ __('Good') }}</span>
								</div>
								<p class="text-xs leading-relaxed text-blue-900">{{ crit.level_good }}</p>
							</div>

							<div class="relative rounded-2xl bg-amber-50/50 p-5 border border-amber-100/50">
								<div class="mb-3 flex items-center gap-2">
									<div class="h-2 w-2 rounded-full bg-amber-500" />
									<span class="text-[10px] font-black text-amber-700 uppercase tracking-widest">{{ __('Adequate') }}</span>
								</div>
								<p class="text-xs leading-relaxed text-amber-900">{{ crit.level_adequate }}</p>
							</div>

							<div class="relative rounded-2xl bg-red-50/50 p-5 border border-red-100/50">
								<div class="mb-3 flex items-center gap-2">
									<div class="h-2 w-2 rounded-full bg-red-500" />
									<span class="text-[10px] font-black text-red-700 uppercase tracking-widest">{{ __('Poor') }}</span>
								</div>
								<p class="text-xs leading-relaxed text-red-900">{{ crit.level_poor }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createResource } from 'frappe-ui'
import { ChevronRight, Printer, Download, Sparkles } from 'lucide-vue-next'
import dayjs from 'dayjs'

const props = defineProps({
	rubricName: {
		type: String,
		required: true
	}
})

const rubric = ref(null)
const loading = ref(true)

const rubricResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_rubric_detail',
	makeParams: () => ({ name: props.rubricName }),
	onSuccess: (data) => {
		rubric.value = data
		loading.value = false
	}
})

const exportResource = createResource({
	url: 'lms.lms.services.ai_grading.api.export_rubric',
	onSuccess: (file_url) => {
		if (file_url) window.open(file_url, '_blank')
	}
})

function exportToWord() {
	exportResource.submit({ name: props.rubricName })
}

function printRubric() {
	window.print()
}

function formatDate(date) {
	return dayjs(date).format('MMM D, YYYY')
}

onMounted(() => {
	rubricResource.fetch()
})
</script>

<style scoped>
@media print {
	.bg-gray-50\/50 { background-color: white !important; }
	button, .flex.items-center.gap-2.text-sm { display: none !important; }
	.max-w-5xl { max-width: 100% !important; padding: 0 !important; }
	.rounded-3xl, .rounded-2xl { border-radius: 0 !important; border: 1px solid #eee !important; }
	.bg-gradient-to-r { background: #5b21b6 !important; -webkit-print-color-adjust: exact; }
	.shadow-sm, .shadow-md { shadow: none !important; }
}
</style>
