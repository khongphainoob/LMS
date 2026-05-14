<template>
	<section class="space-y-6">
		<!-- Hero Section -->
		<div
			class="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6 shadow-sm md:flex-row md:items-center"
		>
			<div class="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />
			<div class="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-purple-200/20 blur-2xl" />
			<div class="relative z-10">
				<div class="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1">
					<span class="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
					<span class="text-xs font-medium text-violet-700">
						{{ __('AI Rubric Builder') }}
					</span>
				</div>
				<h2 class="text-2xl font-bold text-gray-900 tracking-tight">
					{{ __('Rubric Builder') }}
				</h2>
				<p class="mt-1.5 max-w-lg text-sm text-gray-600 leading-relaxed">
					{{ __('AI-assisted rubric generation with manual editing. Create detailed assessment criteria in seconds.') }}
				</p>
			</div>
			<div class="relative z-10 flex-shrink-0">
				<button
					class="inline-flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-semibold text-violet-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/90 border border-violet-100"
					@click="showGenerateModal = true"
				>
					<Sparkles class="h-4 w-4" />
					{{ __('Create New Rubric') }}
				</button>
			</div>
		</div>

		<!-- Stats Row -->
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="flex items-center gap-3 rounded-xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/80 p-4 shadow-sm transition-all hover:shadow-md">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
					<FileText class="h-5 w-5 text-violet-600" />
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900">{{ stats.total_rubrics }}</div>
					<div class="text-xs text-gray-500">{{ __('Total Rubrics') }}</div>
				</div>
			</div>
			<div class="flex items-center gap-3 rounded-xl border border-fuchsia-100 bg-gradient-to-br from-white to-fuchsia-50/50 p-4 shadow-sm transition-all hover:shadow-md">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-100">
					<Sparkles class="h-5 w-5 text-fuchsia-600" />
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900">{{ stats.ai_generated_count }}</div>
					<div class="text-xs text-gray-500">{{ __('AI Generated') }}</div>
				</div>
			</div>
			<div class="flex items-center gap-3 rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-4 shadow-sm transition-all hover:shadow-md">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
					<Link2 class="h-5 w-5 text-emerald-600" />
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900">{{ stats.linked_to_sessions }}</div>
					<div class="text-xs text-gray-500">{{ __('Linked to Sessions') }}</div>
				</div>
			</div>
		</div>

		<!-- Recent Templates List -->
		<div class="space-y-4">
			<div class="flex items-center justify-between px-1">
				<h3 class="text-lg font-bold text-gray-900">{{ __('Recent Templates') }}</h3>
				<router-link :to="{ name: 'AIGrading' }" class="text-xs font-semibold text-violet-600 hover:text-violet-700">
					{{ __('View All') }}
				</router-link>
			</div>

			<div v-if="rubrics.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div
					v-for="rubric in rubrics"
					:key="rubric.name"
					class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-violet-100"
				>
					<div class="mb-3 flex items-start justify-between">
						<div>
							<h3 class="text-base font-bold text-gray-900 line-clamp-1">{{ rubric.title }}</h3>
							<div class="mt-1 flex items-center gap-2">
								<span class="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{{ rubric.subject || 'General' }}</span>
								<span class="h-1 w-1 rounded-full bg-gray-300" />
								<span class="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{{ rubric.level }}</span>
							</div>
						</div>
						<span
							v-if="rubric.ai_generated"
							class="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-bold text-violet-600 uppercase tracking-tighter"
						>
							<Sparkles class="h-2.5 w-2.5" /> AI
						</span>
					</div>

					<div class="mb-4 text-xs text-gray-500 line-clamp-2 min-h-[2.5rem]">
						{{ rubric.description || __('No description provided.') }}
					</div>

					<div class="flex items-center justify-between border-t border-gray-50 pt-4">
						<div class="text-[10px] font-bold text-gray-400">
							{{ __('Max Score') }}: <span class="text-gray-900">{{ rubric.max_score }}</span>
						</div>
						<div class="flex items-center gap-1">
							<router-link 
								:to="{ name: 'AIGradingRubricDetail', params: { rubricName: rubric.name } }"
								class="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
								v-tooltip="__('Open Details')"
							>
								<ExternalLink class="h-4 w-4" />
							</router-link>
							<button 
								@click="openEditModal(rubric.name)"
								class="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
								v-tooltip="__('Edit Template')"
							>
								<Edit3 class="h-4 w-4" />
							</button>
							<button 
								@click="handleDelete(rubric.name)"
								class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
								v-tooltip="__('Delete Template')"
							>
								<Trash2 class="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else-if="!loading" class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/50 p-12">
				<FileText class="h-12 w-12 text-gray-300 mb-3" />
				<h3 class="text-base font-semibold text-gray-900">{{ __('No rubrics yet') }}</h3>
				<p class="mt-1 text-sm text-gray-500 text-center max-w-xs">{{ __('Generate your first assessment rubric using AI or create one manually.') }}</p>
				<button
					class="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 hover:scale-105 active:scale-95"
					@click="showGenerateModal = true"
				>
					<Sparkles class="h-4 w-4" />
					{{ __('Generate Rubric') }}
				</button>
			</div>
		</div>

		<!-- Loading -->
		<div v-if="loading" class="flex items-center justify-center py-12">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
		</div>

		<!-- Generate Modal -->
		<Dialog :model-value="showGenerateModal" @close="showGenerateModal = false" :options="{ title: __('Generate Rubric with AI'), size: 'xl' }">
			<template #body-content>
				<div class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="md:col-span-2">
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Upload Question File (Optional)') }}</label>
							<div 
								class="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 p-6 transition-all hover:bg-violet-50/50 hover:border-violet-300 group"
								@dragover.prevent
								@drop.prevent="handleFileDrop"
							>
								<input 
									type="file" 
									ref="fileInput" 
									class="hidden" 
									accept=".pdf,.docx,.xlsx,.xls,.txt,.csv" 
									@change="handleFileSelect"
								/>
								
								<div v-if="!extracting" class="flex flex-col items-center text-center">
									<div class="mb-3 rounded-full bg-white p-3 shadow-sm group-hover:scale-110 transition-transform">
										<Upload class="h-6 w-6 text-violet-600" />
									</div>
									<p class="text-sm font-semibold text-violet-700">
										{{ selectedFileName || __('Click to upload or drag and drop') }}
									</p>
									<p class="mt-1 text-xs text-violet-500">
										PDF, Word, Excel, TXT (Max 10MB)
									</p>
								</div>
								
								<div v-else class="flex flex-col items-center text-center">
									<div class="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
									<p class="text-sm font-medium text-violet-700">{{ __('Extracting content...') }}</p>
								</div>
								
								<button 
									v-if="!extracting && !selectedFileName"
									class="absolute inset-0 w-full h-full cursor-pointer"
									@click="$refs.fileInput.click()"
								/>
							</div>
						</div>

						<div class="md:col-span-2">
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Assessment Content (Preview/Edit)') }}</label>
							<Textarea
								v-model="genForm.assessment_description"
								:placeholder="__('Upload a file or type content here...')"
								rows="5"
							/>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Subject') }}</label>
							<input v-model="genForm.subject" type="text" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm" :placeholder="__('e.g., Mathematics, Literature')" />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Education Level') }}</label>
							<select v-model="genForm.level" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm bg-white">
								<option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
							</select>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Grading Scale') }}</label>
							<select v-model="genForm.grading_scale" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm bg-white">
								<option value="10-point">10-point</option>
								<option value="100-point">100-point</option>
								<option value="Letter Grade">Letter Grade</option>
							</select>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Max Score') }}</label>
							<input v-model.number="genForm.max_score" type="number" min="1" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm" />
						</div>
					</div>

					<div>
						<div class="mb-2 flex items-center justify-between">
							<label class="text-sm font-medium text-ink-gray-7">{{ __('Evaluation Criteria') }}</label>
							<button
								class="inline-flex items-center gap-1 rounded-md bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-200 transition-colors"
								@click="genForm.criteria.push('')"
							>
								<Plus class="h-3 w-3" /> {{ __('Add Criterion') }}
							</button>
						</div>
						<div class="space-y-2">
							<div v-for="(c, i) in genForm.criteria" :key="i" class="flex items-center gap-2">
								<span class="text-xs font-medium text-ink-gray-5 w-5">{{ i + 1 }}.</span>
								<input v-model="genForm.criteria[i]" type="text" class="flex-1 rounded-lg border border-outline-gray-2 px-3 py-2 text-sm" :placeholder="__('e.g., Content quality')" />
								<button v-if="genForm.criteria.length > 1" @click="genForm.criteria.splice(i, 1)" class="text-ink-gray-4 hover:text-red-500 transition-colors">
									<X class="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>

					<div class="flex items-center justify-end gap-3 pt-2">
						<button
							class="rounded-lg border border-outline-gray-2 px-4 py-2 text-sm font-medium text-ink-gray-7 transition-colors hover:bg-surface-gray-2"
							@click="showGenerateModal = false"
						>
							{{ __('Cancel') }}
						</button>
						<button
							class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
							:disabled="generating || !genForm.assessment_description || !genForm.criteria.some(c => c.trim())"
							@click="handleGenerate"
						>
							<div v-if="generating" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
							<Sparkles v-else class="h-4 w-4" />
							{{ generating ? __('Generating...') : __('Generate Rubric') }}
						</button>
					</div>
				</div>
			</template>
		</Dialog>

		<!-- Edit/Preview Modal -->
		<Dialog :model-value="showEditModal" @close="closeEditModal" :options="{ title: editingRubric?.title || __('Rubric Detail'), size: 'xl' }">
			<template #body-content>
				<div v-if="editLoading" class="flex items-center justify-center py-8">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
				</div>
				<div v-else-if="editingRubric" class="space-y-4">
					<div class="flex items-center justify-between gap-3 mb-2">
						<div class="text-xs text-ink-gray-5">
							{{ __('Manage and export your assessment criteria.') }}
						</div>
						<button 
							class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 shadow-sm"
							@click="handleExportWord(editingRubric.name)"
							:disabled="exporting"
						>
							<div v-if="exporting" class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
							<Download v-else class="h-3.5 w-3.5" />
							{{ exporting ? __('Exporting...') : __('Export Word') }}
						</button>
					</div>

					<div class="rounded-xl border border-outline-gray-2 p-4">
						<h4 class="text-sm font-bold text-ink-gray-9 mb-1">{{ editingRubric.title }}</h4>
						<p v-if="editingRubric.description" class="text-xs text-ink-gray-6 mb-2">{{ editingRubric.description }}</p>
						<div class="flex items-center gap-2 flex-wrap">
							<span class="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">{{ editingRubric.grading_scale }}</span>
							<span v-if="editingRubric.subject" class="rounded-md bg-surface-gray-2 px-2 py-0.5 text-[10px] font-medium text-ink-gray-7">{{ editingRubric.subject }}</span>
							<span class="text-xs text-ink-gray-5">{{ __('Max: {0}', [editingRubric.max_score]) }}</span>
						</div>
					</div>

					<div v-if="editingRubric.criteria && editingRubric.criteria.length" class="space-y-3">
						<h4 class="text-sm font-semibold text-ink-gray-8">{{ __('Criteria') }}</h4>
						<div
							v-for="(crit, i) in editingRubric.criteria"
							:key="i"
							class="rounded-xl border border-outline-gray-2 p-4 space-y-2"
						>
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-ink-gray-9">{{ crit.criterion_name }}</span>
								<span class="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{{ crit.max_score }} pts</span>
							</div>
							<div class="grid grid-cols-2 gap-2 md:grid-cols-4">
								<div class="rounded-lg bg-emerald-50 p-2">
									<div class="text-[10px] font-bold text-emerald-700 uppercase mb-0.5">{{ __('Excellent') }}</div>
									<p class="text-[11px] text-emerald-900 leading-relaxed">{{ crit.level_excellent }}</p>
								</div>
								<div class="rounded-lg bg-blue-50 p-2">
									<div class="text-[10px] font-bold text-blue-700 uppercase mb-0.5">{{ __('Good') }}</div>
									<p class="text-[11px] text-blue-900 leading-relaxed">{{ crit.level_good }}</p>
								</div>
								<div class="rounded-lg bg-amber-50 p-2">
									<div class="text-[10px] font-bold text-amber-700 uppercase mb-0.5">{{ __('Adequate') }}</div>
									<p class="text-[11px] text-amber-900 leading-relaxed">{{ crit.level_adequate }}</p>
								</div>
								<div class="rounded-lg bg-red-50 p-2">
									<div class="text-[10px] font-bold text-red-700 uppercase mb-0.5">{{ __('Poor') }}</div>
									<p class="text-[11px] text-red-900 leading-relaxed">{{ crit.level_poor }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
		</Dialog>
	</section>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { createResource, Dialog } from 'frappe-ui'
import { FileText, Sparkles, Link2, Plus, X, Upload, Download, Edit3, Trash2, ExternalLink } from 'lucide-vue-next'

const rubrics = ref([])
const loading = ref(true)
const generating = ref(false)
const exporting = ref(false)
const extracting = ref(false)
const selectedFileName = ref('')
const fileInput = ref(null)
const showGenerateModal = ref(false)
const showEditModal = ref(false)
const editingRubric = ref(null)
const editLoading = ref(false)

const stats = reactive({ total_rubrics: 0, ai_generated_count: 0, linked_to_sessions: 0 })

const levels = ['Elementary', 'Middle School', 'High School', 'University', 'Professional']

const genForm = reactive({
	assessment_description: '',
	subject: '',
	level: 'High School',
	grading_scale: '10-point',
	max_score: 10,
	criteria: [''],
})

// Load external libraries for file extraction
function loadScript(url) {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = url
		script.onload = resolve
		script.onerror = reject
		document.head.appendChild(script)
	})
}



function handleFileSelect(e) {
	const file = e.target.files[0]
	if (file) processFile(file)
}

function handleFileDrop(e) {
	const file = e.dataTransfer.files[0]
	if (file) processFile(file)
}

async function processFile(file) {
	extracting.value = true
	selectedFileName.value = file.name
	const extension = file.name.split('.').pop().toLowerCase()
	
	try {
		const reader = new FileReader()
		
		if (extension === 'docx') {
			reader.onload = async (e) => {
				const result = await window.mammoth.extractRawText({ arrayBuffer: e.target.result })
				genForm.assessment_description = result.value
				extracting.value = false
			}
			reader.readAsArrayBuffer(file)
		} else if (['xlsx', 'xls'].includes(extension)) {
			reader.onload = (e) => {
				const workbook = window.XLSX.read(e.target.result, { type: 'array' })
				let fullText = ""
				workbook.SheetNames.forEach(name => {
					const csv = window.XLSX.utils.sheet_to_csv(workbook.Sheets[name])
					fullText += `--- Sheet: ${name} ---\n${csv}\n\n`
				})
				genForm.assessment_description = fullText
				extracting.value = false
			}
			reader.readAsArrayBuffer(file)
		} else if (extension === 'pdf') {
			reader.onload = async (e) => {
				const loadingTask = window.pdfjsLib.getDocument({ data: e.target.result })
				const pdf = await loadingTask.promise
				let fullText = ""
				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i)
					const content = await page.getTextContent()
					fullText += content.items.map(item => item.str).join(' ') + "\n\n"
				}
				genForm.assessment_description = fullText
				extracting.value = false
			}
			reader.readAsArrayBuffer(file)
		} else {
			reader.onload = (e) => {
				genForm.assessment_description = e.target.result
				extracting.value = false
			}
			reader.readAsText(file)
		}
	} catch (err) {
		console.error('Extraction error:', err)
		extracting.value = false
	}
}

const rubricListResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_rubric_templates',
	makeParams: () => ({ limit: 50 }),
	onSuccess: (data) => {
		console.log('Rubric list received:', data)
		rubrics.value = data || []
		loading.value = false
	},
	onError: (err) => {
		console.error('Rubric list error:', err)
		loading.value = false
		rubrics.value = []
	},
})

const statsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_rubric_stats',
	onSuccess: (data) => {
		Object.assign(stats, data)
	},
})

const generateResource = createResource({
	url: 'lms.lms.api.generate_rubric',
	makeParams: () => ({
		assessment_description: genForm.assessment_description,
		criteria_descriptions: genForm.criteria.filter(c => c.trim()),
		grading_scale: genForm.grading_scale,
		max_score: genForm.max_score,
		subject: genForm.subject,
		level: genForm.level,
		language: 'vietnamese',
	}),
	onSuccess: (data) => {
		generating.value = false
		showGenerateModal.value = false
		saveGeneratedRubric(data)
	},
	onError: () => {
		generating.value = false
	},
})

const rubricDetailResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_rubric_detail',
	makeParams: (name) => ({ name }),
	onSuccess: (data) => {
		editingRubric.value = data
		editLoading.value = false
	},
	onError: () => {
		editLoading.value = false
	},
})

const saveRubricResource = createResource({
	url: 'lms.lms.api.save_rubric_template',
	onSuccess: (data) => {
		frappe.show_alert({ message: __('Rubric saved successfully'), indicator: 'green' })
		rubricListResource.fetch()
		statsResource.fetch()
		
		// Tự động mở modal chi tiết để xem kết quả ngay
		if (data && data.name) {
			openEditModal(data.name)
		}
	},
	onError: (err) => {
		frappe.msgprint(__('Failed to save rubric: {0}', [err.message || err]))
	}
})

const exportResource = createResource({
	url: 'lms.lms.services.ai_grading.api.export_rubric',
	onSuccess: (file_url) => {
		exporting.value = false
		if (file_url) {
			window.open(file_url, '_blank')
		}
	},
	onError: () => {
		exporting.value = false
	}
})

const deleteResource = createResource({
	url: 'frappe.client.delete',
	onSuccess: () => {
		frappe.show_alert({ message: __('Rubric deleted'), indicator: 'red' })
		rubricListResource.fetch()
		statsResource.fetch()
	}
})

function handleDelete(name) {
	if (confirm(__('Are you sure you want to delete this rubric?'))) {
		deleteResource.submit({ doctype: 'LMS Rubric Template', name })
	}
}

function handleExportWord(name) {
	exporting.value = true
	exportResource.submit({ name })
}

function handleGenerate() {
	generating.value = true
	generateResource.submit()
}

function saveGeneratedRubric(data) {
	saveRubricResource.submit({
		...data,
		subject: genForm.subject,
		level: genForm.level,
		grading_scale: genForm.grading_scale,
		max_score: genForm.max_score,
		assessment_description: genForm.assessment_description,
	})
}

function openEditModal(name) {
	editLoading.value = true
	editingRubric.value = null
	showEditModal.value = true
	rubricDetailResource.submit({ name })
}

function closeEditModal() {
	showEditModal.value = false
	editingRubric.value = null
}

onMounted(async () => {
	rubricListResource.fetch()
	statsResource.fetch()
	
	// Load libraries in background for file processing
	try {
		await Promise.all([
			loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.21/mammoth.browser.min.js'),
			loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'),
			loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js')
		])
		if (window.pdfjsLib) {
			window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'
		}
	} catch (e) {
		console.error('Failed to load file processing libraries', e)
	}
})
</script>
