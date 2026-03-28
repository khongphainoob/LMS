
<template>
	<section class="space-y-6">
		<!-- Hero Section -->
		<div
			class="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6 shadow-sm md:flex-row md:items-center"
		>
			<div class="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />
			<div class="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-200/20 blur-2xl" />
			<div class="relative z-10">
				<div class="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1">
					<span class="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
					<span class="text-xs font-medium text-cyan-700">
						{{ __('AI Objective Grading') }}
					</span>
				</div>
				<h2 class="text-2xl font-bold text-gray-900 tracking-tight">
					{{ __('Smart Multiple Choice Grading') }}
				</h2>
				<p class="mt-1.5 max-w-lg text-sm text-gray-600 leading-relaxed">
					{{ __('Auto-evaluate MCQ submissions with confidence checks and retry signals. Fast, accurate, and transparent.') }}
				</p>
			</div>
			<!-- Support Button -->
			<div class="relative z-10 flex-shrink-0">
				<a
					href="#"
					class="inline-flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/90 border border-blue-100"
				>
					<span class="text-lg">💡</span> {{ __('Grading Guide & Support') }}
				</a>
			</div>
		</div>

		<!-- Stats Row -->
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div
				class="flex items-center gap-3 rounded-xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/80 p-4 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
					<span class="text-lg">📊</span>
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900">{{ insightCards[0].value }}</div>
					<div class="text-xs text-gray-500">{{ insightCards[0].label }}</div>
				</div>
			</div>
			<div
				class="flex items-center gap-3 rounded-xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-4 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
					<span class="text-lg">🎯</span>
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900">{{ insightCards[1].value }}</div>
					<div class="text-xs text-gray-500">{{ insightCards[1].label }}</div>
				</div>
			</div>
			<div
				class="flex items-center gap-3 rounded-xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/50 p-4 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
					<span class="text-lg">🚩</span>
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900">{{ insightCards[2].value }}</div>
					<div class="text-xs text-gray-500">{{ insightCards[2].label }}</div>
				</div>
			</div>
		</div>

		<!-- Action Cards Grid -->
		<div class="grid grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
			<div
				class="group relative cursor-pointer overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-b from-white to-cyan-50/40 p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-cyan-300"
			>
				<span
					class="absolute right-4 top-4 rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-bold text-cyan-800 uppercase tracking-widest"
				>
					{{ __('Auto') }}
				</span>
				<div
					class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-100 text-2xl shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3"
				>
					🧠
				</div>
				<h3 class="text-lg font-bold text-gray-900">{{ __('Batch Grading') }}</h3>
				<p class="mt-1 text-xs text-gray-600 leading-relaxed mb-4">
					{{ __('Grade all MCQ submissions in one go. Fast, reliable, and scalable for large classes.') }}
				</p>
				<button
					class="mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
					style="background: linear-gradient(90deg, #06b6d4 0%, #2563eb 100%);"
				>
					{{ __('Start Batch Grading') }} →
				</button>
			</div>
			<div
				class="group relative cursor-pointer overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/40 p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300"
			>
				<span
					class="absolute right-4 top-4 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 uppercase tracking-widest"
				>
					{{ __('Manual Review') }}
				</span>
				<div
					class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-2xl shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3"
				>
					👀
				</div>
				<h3 class="text-lg font-bold text-gray-900">{{ __('Review Flags') }}</h3>
				<p class="mt-1 text-xs text-gray-600 leading-relaxed mb-4">
					{{ __('Check flagged answers and low-confidence cases before publishing results.') }}
				</p>
				<button
					class="mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
					style="background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%);"
				>
					{{ __('Review Now') }} →
				</button>
			</div>
			<div
				class="group relative cursor-pointer overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-b from-white to-rose-50/40 p-6 shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-rose-300"
			>
				<span
					class="absolute right-4 top-4 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 uppercase tracking-widest"
				>
					{{ __('Insights') }}
				</span>
				<div
					class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-100 text-2xl shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3"
				>
					📈
				</div>
				<h3 class="text-lg font-bold text-gray-900">{{ __('Analytics & Export') }}</h3>
				<p class="mt-1 text-xs text-gray-600 leading-relaxed mb-4">
					{{ __('View analytics, export results, and monitor grading performance.') }}
				</p>
				<button
					class="mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
					style="background: linear-gradient(90deg, #f43f5e 0%, #06b6d4 100%);"
				>
					{{ __('View Analytics') }} →
				</button>
			</div>
		</div>
	</section>
</template>

<script setup>
import { Button } from 'frappe-ui'

const insightCards = [
	{
		label: __('Queued Submissions'),
		value: '128',
		note: __('Ready for objective evaluation.'),
	},
	{
		label: __('Avg. Accuracy'),
		value: '96.2%',
		note: __('Measured against manual checks.'),
	},
	{
		label: __('Flagged Answers'),
		value: '14',
		note: __('Need instructor review for edge cases.'),
	},
]

const steps = [
	{
		title: __('1. Prepare Answer Key'),
		description: __('Map valid choices and optional alternate keys.'),
	},
	{
		title: __('2. Run Auto Grading'),
		description: __('Evaluate all attempts and generate confidence scores.'),
	},
	{
		title: __('3. Review Flags'),
		description: __('Inspect low-confidence rows before final publishing.'),
	},
]
</script>
