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
			<div class="flex items-center gap-2">
				<button class="inline-flex items-center gap-2 rounded-lg bg-surface-gray-2 px-3 py-1.5 text-sm font-medium text-ink-gray-7 hover:bg-surface-gray-3 transition-colors" @click="handleImport">
					<Upload class="h-4 w-4" /> {{ __('Import') }}
				</button>
				<button class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700" @click="showGenerateModal = true">
					<Sparkles class="h-4 w-4" /> {{ __('Generate with AI') }}
				</button>
			</div>
		</header>

		<div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
			<!-- Stats -->
			<div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
				<div class="flex items-center gap-3 rounded-xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/80 p-4 shadow-sm">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
						<CalendarCheck class="h-5 w-5 text-violet-600" />
					</div>
					<div>
						<div class="text-xl font-bold text-gray-900">{{ planStats.total_plans }}</div>
						<div class="text-xs text-gray-500">{{ __('Total Plans') }}</div>
					</div>
				</div>
				<div class="flex items-center gap-3 rounded-xl border border-fuchsia-100 bg-gradient-to-br from-white to-fuchsia-50/50 p-4 shadow-sm">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-100">
						<Sparkles class="h-5 w-5 text-fuchsia-600" />
					</div>
					<div>
						<div class="text-xl font-bold text-gray-900">{{ planStats.ai_generated_count }}</div>
						<div class="text-xs text-gray-500">{{ __('AI Generated') }}</div>
					</div>
				</div>
				<div class="flex items-center gap-3 rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-4 shadow-sm">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
						<CheckCircle class="h-5 w-5 text-emerald-600" />
					</div>
					<div>
						<div class="text-xl font-bold text-gray-900">{{ planStats.published_count }}</div>
						<div class="text-xs text-gray-500">{{ __('Published') }}</div>
					</div>
				</div>
			</div>

			<!-- Filters -->
			<div class="mb-6 flex flex-wrap items-center gap-3">
				<select v-model="filterCourse" @change="loadPlans()" class="rounded-lg border border-outline-gray-2 bg-surface-white px-3 py-1.5 text-sm">
					<option value="">{{ __('All Courses') }}</option>
					<option v-for="c in courses" :key="c.name" :value="c.name">{{ c.title }}</option>
				</select>
				<select v-model="filterStatus" @change="loadPlans()" class="rounded-lg border border-outline-gray-2 bg-surface-white px-3 py-1.5 text-sm">
					<option value="">{{ __('All Status') }}</option>
					<option value="Draft">Draft</option>
					<option value="Published">Published</option>
					<option value="Completed">Completed</option>
				</select>
			</div>

			<!-- Plans List -->
			<div v-if="plans.length" class="space-y-3">
				<div
					v-for="plan in plans"
					:key="plan.name"
					class="group flex items-start gap-4 rounded-2xl border border-outline-gray-2 bg-surface-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
					@click="viewPlan(plan.name)"
				>
					<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" :class="statusColors[plan.status]">
						<CalendarCheck class="h-6 w-6" :class="statusIconColors[plan.status]" />
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-1">
							<h3 class="text-sm font-bold text-ink-gray-9 truncate">{{ plan.title }}</h3>
							<span v-if="plan.ai_generated" class="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 uppercase">
								<Sparkles class="h-3 w-3" /> AI
							</span>
						</div>
						<div class="flex items-center gap-3 text-xs text-ink-gray-5">
							<span class="rounded-md bg-surface-gray-2 px-2 py-0.5 font-medium">{{ plan.plan_type }}</span>
							<span v-if="plan.scheduled_date">{{ plan.scheduled_date }}</span>
							<span>{{ plan.duration_minutes }} min</span>
						</div>
					</div>
					<span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" :class="statusBadgeColors[plan.status]">
						{{ plan.status }}
					</span>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else-if="!loading" class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-gray-3 bg-surface-white/50 p-12">
				<CalendarCheck class="h-12 w-12 text-ink-gray-4 mb-3" />
				<h3 class="text-base font-semibold text-ink-gray-7">{{ __('No lesson plans yet') }}</h3>
				<p class="mt-1 text-sm text-ink-gray-5">{{ __('Generate your first lesson plan with AI or create manually.') }}</p>
				<button class="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700" @click="showGenerateModal = true">
					<Sparkles class="h-4 w-4" /> {{ __('Generate Plan') }}
				</button>
			</div>

			<div v-if="loading" class="flex items-center justify-center py-12">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
			</div>
		</div>

		<!-- Generate Modal -->
		<Dialog :model-value="showGenerateModal" @close="showGenerateModal = false" :options="{ title: __('Generate Lesson Plan with AI'), size: 'lg' }">
			<template #body-content>
				<div class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Course') }}</label>
							<select v-model="genForm.course" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm bg-white">
								<option value="">{{ __('Select course') }}</option>
								<option v-for="c in courses" :key="c.name" :value="c.name">{{ c.title }}</option>
							</select>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Plan Type') }}</label>
							<select v-model="genForm.plan_type" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm bg-white">
								<option value="Single Lesson">Single Lesson</option>
								<option value="Unit Plan">Unit Plan</option>
								<option value="Weekly Plan">Weekly Plan</option>
							</select>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Duration (minutes)') }}</label>
							<input v-model.number="genForm.duration_minutes" type="number" min="15" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm" />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Learning Objectives') }}</label>
							<input v-model="genForm.objectives" type="text" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm" :placeholder="__('e.g., Students can solve quadratic equations')" />
						</div>
					</div>
					<div>
						<label class="mb-1.5 block text-sm font-medium text-ink-gray-7">{{ __('Additional Instructions') }}</label>
						<textarea v-model="genForm.additional_instructions" rows="2" class="w-full rounded-lg border border-outline-gray-2 px-3 py-2 text-sm" :placeholder="__('Any specific requirements...')" />
					</div>
					<div class="flex items-center justify-end gap-3 pt-2">
						<button class="rounded-lg border border-outline-gray-2 px-4 py-2 text-sm font-medium text-ink-gray-7 hover:bg-surface-gray-2" @click="showGenerateModal = false">{{ __('Cancel') }}</button>
						<button class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50" :disabled="generating || !genForm.course" @click="handleGenerate">
							<div v-if="generating" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
							<Sparkles v-else class="h-4 w-4" />
							{{ generating ? __('Generating...') : __('Generate') }}
						</button>
					</div>
				</div>
			</template>
		</Dialog>

		<!-- View Plan Modal -->
		<Dialog :model-value="showViewModal" @close="showViewModal = false" :options="{ title: viewPlanData?.title || __('Lesson Plan'), size: 'xl' }">
			<template #body-content>
				<div v-if="viewLoading" class="flex items-center justify-center py-8">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
				</div>
				<div v-else-if="viewPlanData" class="space-y-4">
					<div class="flex items-center gap-2 flex-wrap">
						<span class="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 uppercase">{{ viewPlanData.plan_type }}</span>
						<span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase" :class="statusBadgeColors[viewPlanData.status]">{{ viewPlanData.status }}</span>
						<span v-if="viewPlanData.ai_generated" class="inline-flex items-center gap-1 rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-bold text-fuchsia-700"><Sparkles class="h-3 w-3" /> AI</span>
					</div>
					<div v-if="viewPlanData.learning_objectives" class="rounded-xl border border-outline-gray-2 p-4">
						<h4 class="text-sm font-bold text-ink-gray-9 mb-1">{{ __('Learning Objectives') }}</h4>
						<p class="text-sm text-ink-gray-6">{{ viewPlanData.learning_objectives }}</p>
					</div>
					<div v-if="viewPlanData.content" class="rounded-xl border border-outline-gray-2 p-4">
						<h4 class="text-sm font-bold text-ink-gray-9 mb-2">{{ __('Content') }}</h4>
						<div class="prose prose-sm max-w-none text-ink-gray-7" v-html="viewPlanData.content" />
					</div>
					<div class="flex items-center gap-4 text-xs text-ink-gray-5">
						<span v-if="viewPlanData.scheduled_date">{{ __('Scheduled') }}: {{ viewPlanData.scheduled_date }}</span>
						<span>{{ viewPlanData.duration_minutes }} {{ __('min') }}</span>
					</div>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createResource, Breadcrumbs, Dialog, usePageMeta } from 'frappe-ui'
import { CalendarCheck, Sparkles, CheckCircle, Upload } from 'lucide-vue-next'
import { sessionStore } from '@/stores/session'

const { brand } = sessionStore()
const router = useRouter()

const plans = ref([])
const courses = ref([])
const loading = ref(true)
const generating = ref(false)
const showGenerateModal = ref(false)
const showViewModal = ref(false)
const viewPlanData = ref(null)
const viewLoading = ref(false)
const filterCourse = ref('')
const filterStatus = ref('')

const planStats = reactive({ total_plans: 0, ai_generated_count: 0, published_count: 0 })

const statusColors = {
	Draft: 'bg-gray-100',
	Published: 'bg-emerald-100',
	Completed: 'bg-blue-100',
}
const statusIconColors = {
	Draft: 'text-gray-500',
	Published: 'text-emerald-600',
	Completed: 'text-blue-600',
}
const statusBadgeColors = {
	Draft: 'bg-gray-100 text-gray-600',
	Published: 'bg-emerald-100 text-emerald-700',
	Completed: 'bg-blue-100 text-blue-700',
}

const breadcrumbs = [{ label: __('Lesson Planning'), route: { name: 'LessonPlanning' } }]
usePageMeta(() => ({ title: `${__('Lesson Planning')} - ${brand.value}` }))

function goBackToAIIntegration() {
	router.push({ name: 'AIIntegration' })
}

const genForm = reactive({
	course: '', plan_type: 'Single Lesson', duration_minutes: 45,
	objectives: '', additional_instructions: '',
})

const plansResource = createResource({
	url: 'lms.lms.api.get_lesson_plans',
	makeParams: () => ({
		course: filterCourse.value || undefined,
		status: filterStatus.value || undefined,
		limit: 50,
	}),
	onSuccess: (data) => { plans.value = data || []; loading.value = false },
})

const statsResource = createResource({
	url: 'lms.lms.api.get_lesson_plan_stats',
	onSuccess: (data) => { Object.assign(planStats, data) },
})

const coursesResource = createResource({
	url: 'frappe.client.get_list',
	makeParams: () => ({ doctype: 'LMS Course', fields: ['name', 'title'], limit_page_length: 100, order_by: 'title asc' }),
	onSuccess: (data) => { courses.value = data || [] },
})

const generateResource = createResource({
	url: 'lms.lms.api.generate_lesson_plan',
	onSuccess: (data) => {
		generating.value = false
		showGenerateModal.value = false
		savePlanResource.submit({
			title: data.title || 'AI Lesson Plan',
			plan_type: genForm.plan_type,
			course: genForm.course,
			duration_minutes: genForm.duration_minutes,
			learning_objectives: data.learning_objectives || genForm.objectives,
			content: data.content || '',
			ai_generated: 1,
			status: 'Draft',
		})
	},
	onError: () => { generating.value = false },
})

const savePlanResource = createResource({
	url: 'lms.lms.api.save_lesson_plan',
	onSuccess: () => { loadPlans() },
})

const planDetailResource = createResource({
	url: 'lms.lms.api.get_lesson_plan_detail',
	makeParams: (name) => ({ name }),
	onSuccess: (data) => { viewPlanData.value = data; viewLoading.value = false },
})

function loadPlans() { loading.value = true; plansResource.fetch() }
function handleGenerate() { generating.value = true; generateResource.submit() }
function viewPlan(name) { viewLoading.value = true; viewPlanData.value = null; showViewModal.value = true; planDetailResource.submit({ name }) }
function handleImport() { }

onMounted(() => { plansResource.fetch(); statsResource.fetch(); coursesResource.fetch() })
</script>
