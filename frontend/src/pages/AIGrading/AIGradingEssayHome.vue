<template>
	<section class="space-y-6">
		<!-- Hero Section -->
		<div
			class="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-sm md:flex-row md:items-center"
		>
			<div
				class="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl"
			/>
			<div
				class="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-teal-200/20 blur-2xl"
			/>
			<div class="relative z-10">
				<div
					class="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
					<span class="text-xs font-medium text-emerald-700">
						{{ __('Smart AI Feedback & Rubric Support') }}
					</span>
				</div>
				<h2 class="text-2xl font-bold text-gray-900 tracking-tight">
					{{ __('Smart Essay Grading') }}
				</h2>
				<p class="mt-1.5 max-w-lg text-sm text-gray-600 leading-relaxed">
					{{ __('Select the type of work to grade. AI will recognize, analyze, and suggest scores — you review and approve.') }}
				</p>
			</div>
			
			<!-- Support Button -->
			<div class="relative z-10 flex-shrink-0">
				<a
					href="#"
					class="inline-flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/90 border border-teal-100"
				>
					<span class="text-lg">💡</span> {{ __('Grading Guide & Support') }}
				</a>
			</div>
		</div>

		<!-- Stats Row -->
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div
				class="flex items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
					<span class="text-lg">✅</span>
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900">{{ stats.gradedToday }}</div>
					<div class="text-xs text-gray-500">{{ __('Graded today') }}</div>
				</div>
			</div>
			<div
				class="flex items-center gap-3 rounded-xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/50 p-4 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
					<span class="text-lg">⏳</span>
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900">{{ stats.needReview }}</div>
					<div class="text-xs text-gray-500">{{ __('Need review') }}</div>
				</div>
			</div>
			<div
				class="flex items-center gap-3 rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/50 p-4 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
					<span class="text-lg">📂</span>
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900">{{ stats.openSessions }}</div>
					<div class="text-xs text-gray-500">{{ __('Open sessions') }}</div>
				</div>
			</div>
		</div>

		<!-- Action Cards Grid -->
		<div class="grid grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
			<!-- Card: Bài thi / Exam -->
			<div
				class="group relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/40 p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-300"
				@click="goConfig('exam')"
			>
				<span
					class="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-widest"
				>
					{{ __('Session-based') }}
				</span>
				<div
					class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-2xl shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3"
				>
					📝
				</div>
				<h3 class="text-lg font-bold text-gray-900">{{ __('Exam Grading') }}</h3>
				<p class="mt-1 text-xs text-gray-600 leading-relaxed mb-4">
					{{ __('Grade official exams with session management. Create sessions, track progress and export results.') }}
				</p>
				<div class="flex-1">
					<ul class="space-y-2 mb-6">
						<li
							v-for="feat in examFeatures"
							:key="feat"
							class="flex items-center gap-2 text-xs text-gray-600 font-medium"
						>
							<span class="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
							{{ feat }}
						</li>
					</ul>
				</div>
				<button
					class="mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
					style="background-color: #2d6a4f;"
				>
					{{ __('Start Grading Exams') }} →
				</button>
			</div>

			<!-- Card: Bài kiểm tra / Quick Test -->
			<div
				class="group relative cursor-pointer overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/40 p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300"
				@click="goConfig('test')"
			>
				<span
					class="absolute right-4 top-4 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-widest"
				>
					{{ __('Quick Grade') }}
				</span>
				<div
					class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3"
				>
					📋
				</div>
				<h3 class="text-lg font-bold text-gray-900">{{ __('Quick Tests') }}</h3>
				<p class="mt-1 text-xs text-gray-600 leading-relaxed mb-4">
					{{ __('Grade 15–45 minute tests. Upload in batch, AI grades automatically and returns insights instantly.') }}
				</p>
				<div class="flex-1">
					<ul class="space-y-2 mb-6">
						<li
							v-for="feat in testFeatures"
							:key="feat"
							class="flex items-center gap-2 text-xs text-gray-600 font-medium"
						>
							<span class="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
							{{ feat }}
						</li>
					</ul>
				</div>
				<button
					class="mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
					style="background-color: #1d4ed8;"
				>
					{{ __('Grade Tests') }} →
				</button>
			</div>

			<!-- Card: Bài tập / Homework -->
			<div
				class="group relative cursor-pointer overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-b from-white to-amber-50/40 p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-300"
				@click="goConfig('hw')"
			>
				<span
					class="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-widest"
				>
					{{ __('Batch Workflow') }}
				</span>
				<div
					class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-2xl shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3"
				>
					📚
				</div>
				<h3 class="text-lg font-bold text-gray-900">{{ __('Homework & Assignments') }}</h3>
				<p class="mt-1 text-xs text-gray-600 leading-relaxed mb-4">
					{{ __('Grade homework and practice assignments. Provide detailed, encouraging feedback efficiently in batches.') }}
				</p>
				<div class="flex-1">
					<ul class="space-y-2 mb-6">
						<li
							v-for="feat in hwFeatures"
							:key="feat"
							class="flex items-center gap-2 text-xs text-gray-600 font-medium"
						>
							<span class="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
							{{ feat }}
						</li>
					</ul>
				</div>
				<button
					class="mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
					style="background-color: #b45309;"
				>
					{{ __('Review Homework') }} →
				</button>
			</div>
		</div>
	</section>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createResource } from 'frappe-ui'

const router = useRouter()

// Get real stats from API
const statsResource = createResource({
	url: 'lms.lms.api.get_ai_grading_stats',
	auto: true,
})

const stats = computed(() => {
	return statsResource.data || {
		gradedToday: 0,
		needReview: 0,
		openSessions: 0,
	}
})

const examFeatures = [
	__('Create & manage grading sessions'),
	__('Class / ID-based submission lists'),
	__('Step-by-step for Math · Physics · Chemistry'),
	__('Human review gate & audit trail'),
	__('Export PDF reports & LMS sync'),
]

const testFeatures = [
	__('Batch upload multiple papers'),
	__('Mixed essay & multiple choice'),
	__('Pre-built rubric templates'),
	__('Quick class statistics'),
]

const hwFeatures = [
	__('Detailed per-question feedback'),
	__('Personalized improvement suggestions'),
	__('Weekly progress tracking'),
	__('Send feedback via email / LMS'),
]

function goConfig(type) {
	router.push({ name: 'AIGradingEssayConfig', params: { type } })
}
</script>
