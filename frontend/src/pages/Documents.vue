<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
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
			<button
				class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
				@click="showUploadModal = true"
			>
				<Upload class="h-4 w-4" /> {{ __('Upload Document') }}
			</button>
		</header>

		<div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
			<!-- Filters -->
			<div class="mb-6 flex flex-wrap items-center gap-3">
				<div class="flex rounded-lg border border-outline-gray-2 bg-surface-white p-0.5">
					<button
						v-for="s in scopes" :key="s.value"
						@click="currentScope = s.value; loadDocuments()"
						class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
						:class="currentScope === s.value ? 'bg-violet-600 text-white' : 'text-ink-gray-6 hover:text-ink-gray-9'"
					>
						{{ s.label }}
					</button>
				</div>
				<input
					v-model="searchText"
					type="text"
					class="rounded-lg border border-outline-gray-2 bg-surface-white px-3 py-1.5 text-sm"
					:placeholder="__('Search documents...')"
					@input="debouncedSearch"
				/>
				<select
					v-if="currentScope === 'Course'"
					v-model="selectedBatch"
					@change="onBatchChange"
					class="rounded-lg border border-outline-gray-2 bg-surface-white px-3 py-1.5 text-sm"
				>
					<option value="">{{ __('All Batches') }}</option>
					<option v-for="b in batches" :key="b.name" :value="b.name">{{ b.title || b.name }}</option>
				</select>
				<select
					v-if="currentScope === 'Course'"
					v-model="selectedCourse"
					@change="onCourseChange"
					class="rounded-lg border border-outline-gray-2 bg-surface-white px-3 py-1.5 text-sm max-w-[200px]"
				>
					<option value="">{{ __('All Courses') }}</option>
					<option v-for="c in displayedCoursesFilter" :key="c.name" :value="c.name">{{ c.title || c.name }}</option>
				</select>
				<select v-model="selectedCategory" @change="loadDocuments()" class="rounded-lg border border-outline-gray-2 bg-surface-white px-3 py-1.5 text-sm">
					<option value="">{{ __('All Categories') }}</option>
					<option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
				</select>
			</div>

			<!-- Document Grid -->
			<div v-if="documents.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div
					v-for="doc in documents"
					:key="doc.name"
					class="group rounded-2xl border border-outline-gray-2 bg-surface-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
				>
					<div class="mb-3 flex items-start justify-between">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
								<FileText class="h-5 w-5 text-violet-600" />
							</div>
							<div>
								<h3 class="text-sm font-bold text-ink-gray-9 line-clamp-1">{{ doc.title }}</h3>
								<span class="text-[10px] text-ink-gray-5">{{ formatFileSize(doc.file_size) }}</span>
							</div>
						</div>
						<span class="rounded-md px-2 py-0.5 text-[10px] font-medium" :class="doc.scope === 'Community' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'">
							{{ doc.scope }}
						</span>
					</div>
					<p v-if="doc.description" class="mb-3 text-xs text-ink-gray-6 line-clamp-2">{{ doc.description }}</p>
					<div class="mt-auto flex items-center justify-between">
						<span class="text-[10px] text-ink-gray-5">{{ formatDate(doc.creation) }}</span>
						<a
							v-if="doc.file"
							:href="doc.file"
							target="_blank"
							class="inline-flex items-center gap-1 rounded-md bg-surface-gray-2 px-2 py-1 text-[10px] font-medium text-ink-gray-7 hover:bg-surface-gray-3 transition-colors"
						>
							<Download class="h-3 w-3" /> {{ __('Download') }}
						</a>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else-if="!loading" class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-gray-3 bg-surface-white/50 p-12">
				<FolderOpen class="h-12 w-12 text-ink-gray-4 mb-3" />
				<h3 class="text-base font-semibold text-ink-gray-7">{{ __('No documents found') }}</h3>
				<p class="mt-1 text-sm text-ink-gray-5">{{ __('Upload your first document to get started.') }}</p>
			</div>

			<div v-if="loading && documents.length" class="flex items-center justify-center py-12">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
			</div>
			<div v-else-if="loading" class="py-12 text-center text-sm text-ink-gray-5">
				{{ __('Loading documents...') }}
			</div>
		</div>

		<!-- Upload Modal -->
		<Dialog :model-value="showUploadModal" @close="showUploadModal = false" :options="{ title: __('Upload Document'), size: 'lg' }">
			<template #body-content>
				<div class="space-y-4">
					<div>
						<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Title') }}</label>
						<input v-model="uploadForm.title" type="text" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm" />
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Scope') }}</label>
							<select v-model="uploadForm.scope" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm bg-white">
								<option value="Course">Course</option>
								<option value="Community">Community</option>
							</select>
						</div>
						<div v-if="uploadForm.scope === 'Course'" class="col-span-2 grid grid-cols-2 gap-4">
							<div>
								<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Batch') }}</label>
								<select v-model="uploadForm.batch" @change="onUploadBatchChange" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm bg-white">
									<option value="">{{ __('Select batch') }}</option>
									<option v-for="b in batches" :key="b.name" :value="b.name">{{ b.title || b.name }}</option>
								</select>
							</div>
							<div>
								<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Course') }}</label>
								<select v-model="uploadForm.course" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm bg-white">
									<option value="">{{ __('Select course') }}</option>
									<option v-for="c in displayedCoursesUpload" :key="c.name" :value="c.name">{{ c.title || c.name }}</option>
								</select>
							</div>
						</div>
					</div>
					<div>
						<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Category') }}</label>
						<select v-model="uploadForm.category" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm bg-white">
							<option value="">{{ __('None') }}</option>
							<option v-for="cat in categories" :key="cat.name" :value="cat.name">{{ cat.category_name }}</option>
						</select>
					</div>
					<div>
						<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Description') }}</label>
						<textarea v-model="uploadForm.description" rows="2" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm" />
					</div>
					<div>
						<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('File') }}</label>
						<input type="file" @change="onFileSelect" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm" />
					</div>
					<div class="flex items-center justify-end gap-3 pt-2">
						<button class="rounded-lg border border-outline-gray-2 px-4 py-2 text-sm font-medium text-ink-gray-7 hover:bg-surface-gray-2" @click="showUploadModal = false">{{ __('Cancel') }}</button>
						<button class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50" :disabled="uploading || !uploadForm.title || !uploadForm.file" @click="handleUpload">
							{{ uploading ? __('Uploading...') : __('Upload') }}
						</button>
					</div>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createResource, Breadcrumbs, Dialog, usePageMeta } from 'frappe-ui'
import { FileText, FolderOpen, Upload, Download } from 'lucide-vue-next'
import { sessionStore } from '@/stores/session'

const { brand } = sessionStore()
const router = useRouter()

const documents = ref([])
const categories = ref([])
const courses = ref([])
const batches = ref([])
const loading = ref(true)
const uploading = ref(false)
const showUploadModal = ref(false)
const currentScope = ref('Course')
const searchText = ref('')
const selectedCategory = ref('')
const selectedBatch = ref('')
const selectedCourse = ref('')

const scopes = [
	{ label: __('Course'), value: 'Course' },
	{ label: __('Community'), value: 'Community' },
]

const uploadForm = reactive({
	title: '',
	scope: 'Course',
	batch: '',
	course: '',
	category: '',
	description: '',
	file: null,
})

const breadcrumbs = [
	{ label: __('Documents'), route: { name: 'Documents' } },
]

function goBackToAIIntegration() {
	router.push({ name: 'AIIntegration' })
}

usePageMeta(() => ({ title: `${__('Documents')} - ${brand.value}` }))

const docsResource = createResource({
	url: 'lms.lms.api.get_documents',
	makeParams: () => ({
		course: currentScope.value === 'Course' ? selectedCourse.value : undefined,
		batch: currentScope.value === 'Course' ? selectedBatch.value : undefined,
		category: selectedCategory.value || undefined,
		search: searchText.value || undefined,
		limit: 50,
	}),
	onSuccess: (data) => {
		documents.value = data || []
		loading.value = false
	},
	onError: () => {
		loading.value = false
	},
})

const categoriesResource = createResource({
	url: 'lms.lms.api.get_document_categories',
	makeParams: () => ({
		course: currentScope.value === 'Course' ? selectedCourse.value : undefined
	}),
	onSuccess: (data) => { categories.value = data || [] },
})

const studentContextResource = createResource({
	url: 'lms.lms.services.course_batch_resolver.get_selection_context',
	auto: true,
	onSuccess: (data) => {
		courses.value = data.courses || []
		batches.value = data.batches || []
	}
})

const displayedCoursesFilter = computed(() => {
	if (!selectedBatch.value) return courses.value
	const b = batches.value.find(x => x.name === selectedBatch.value)
	return b ? b.courses : []
})

const displayedCoursesUpload = computed(() => {
	if (!uploadForm.batch) return courses.value
	const b = batches.value.find(x => x.name === uploadForm.batch)
	return b ? b.courses : []
})

const uploadResource = createResource({
	url: 'lms.lms.api.create_document',
	onSuccess: () => {
		uploading.value = false
		showUploadModal.value = false
		Object.assign(uploadForm, { title: '', scope: 'Course', batch: '', course: '', category: '', description: '', file: null })
		loadDocuments()
	},
	onError: () => { uploading.value = false },
})

function loadDocuments() {
	loading.value = true
	docsResource.fetch()
}

function onBatchChange() {
	selectedCourse.value = ''
	selectedCategory.value = ''
	categoriesResource.fetch()
	loadDocuments()
}

function onCourseChange() {
	selectedCategory.value = ''
	categoriesResource.fetch()
	loadDocuments()
}

function onUploadBatchChange() {
	uploadForm.course = ''
}

function onFileSelect(e) {
	uploadForm.file = e.target.files[0] || null
}

function handleUpload() {
	if (!uploadForm.file || !uploadForm.title) return
	uploading.value = true
	const reader = new FileReader()
	reader.onload = () => {
		uploadResource.submit({
			title: uploadForm.title,
			scope: uploadForm.scope,
			batch: uploadForm.batch || undefined,
			course: uploadForm.course || undefined,
			category: uploadForm.category || undefined,
			description: uploadForm.description || undefined,
			file: reader.result,
		})
	}
	reader.readAsDataURL(uploadForm.file)
}

let searchTimer = null
function debouncedSearch() {
	clearTimeout(searchTimer)
	searchTimer = setTimeout(() => loadDocuments(), 300)
}

function formatFileSize(bytes) {
	if (!bytes) return ''
	if (bytes < 1024) return bytes + ' B'
	if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
	return (bytes / 1048576).toFixed(1) + ' MB'
}

function formatDate(dateStr) {
	if (!dateStr) return ''
	return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => {
	docsResource.fetch()
	categoriesResource.fetch()
})
</script>
