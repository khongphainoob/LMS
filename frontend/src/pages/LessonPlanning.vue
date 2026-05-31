<template>
	<div class="min-h-screen bg-slate-900 text-slate-100 font-sans">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3 sm:px-6 shadow-sm">
			<div class="flex items-center gap-3">
				<button
					class="flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:text-indigo-300"
					@click="goBackToAIIntegration"
				>
					<span aria-hidden="true">←</span>
					{{ __('Return') }}
				</button>
				<div class="h-5 w-px bg-slate-800" />
				<h1 class="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
					AI Lesson Planner v2
				</h1>
			</div>
			<div class="flex items-center gap-2">
				<button 
					class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 px-4 py-2 text-sm font-extrabold text-slate-950 transition-all duration-200 hover:from-emerald-300 hover:to-teal-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95" 
					@click="openGenerateModal"
				>
					<Sparkles class="h-4 w-4 text-slate-950 animate-pulse" /> {{ __('Create New Lesson Plan') }}
				</button>
			</div>
		</header>

		<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
			<!-- Advanced Analytical Stats Dashboard -->
			<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
				<div class="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-sm transition-all hover:border-slate-700">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
						<CalendarCheck class="h-6 w-6" />
					</div>
					<div>
						<div class="text-2xl font-black text-slate-100">{{ stats.total }}</div>
						<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ __('Total Lesson Plans') }}</div>
					</div>
				</div>
				<div class="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-sm transition-all hover:border-slate-700">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
						<Clock class="h-6 w-6 animate-spin-slow" />
					</div>
					<div>
						<div class="text-2xl font-black text-slate-100">{{ stats.review_pending }}</div>
						<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ __('Pending Teacher Approval') }}</div>
					</div>
				</div>
				<div class="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-sm transition-all hover:border-slate-700">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
						<CheckCircle class="h-6 w-6" />
					</div>
					<div>
						<div class="text-2xl font-black text-slate-100">{{ stats.completed }}</div>
						<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ __('Completed') }}</div>
					</div>
				</div>
				<div class="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-sm transition-all hover:border-slate-700">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50/10 text-pink-400">
						<Zap class="h-6 w-6" />
					</div>
					<div>
						<div class="text-2xl font-black text-slate-100">{{ stats.hours_saved }}</div>
						<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ __('Time Saved') }}</div>
					</div>
				</div>
			</div>

			<!-- Dynamic Filtering System -->
			<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
				<div class="flex flex-wrap items-center gap-2">
					<select v-model="filterStatus" @change="loadPlans" class="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none">
						<option value="">{{ __('All Statuses') }}</option>
						<option value="Draft">{{ __("Draft") }}</option>
						<option value="Retrieving">{{ __("Retrieving") }}</option>
						<option value="Planning">{{ __("Planning") }}</option>
						<option value="Writing">{{ __("Writing") }}</option>
						<option value="Review">{{ __("Review") }}</option>
						<option value="Illustrating">{{ __("Illustrating") }}</option>
						<option value="Assessing">{{ __("Assessing") }}</option>
						<option value="Completed">{{ __("Completed") }}</option>
						<option value="Failed">{{ __("Failed") }}</option>
					</select>
				</div>
				<button @click="loadPlans" class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100 transition-colors">
					<RefreshCw class="h-4 w-4" :class="{'animate-spin': loading}" /> {{ __("Refresh list") }}
				</button>
			</div>

			<!-- Premium Interactive Cards List -->
			<div v-if="plans.length" class="space-y-4">
				<div
					v-for="plan in plans"
					:key="plan.name"
					class="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer"
					@click="viewPlan(plan.name)"
				>
					<div class="flex items-start gap-4">
						<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" :class="statusBgColors[plan.status]">
							<BookOpen class="h-6 w-6" :class="statusIconColors[plan.status]" />
						</div>
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2 mb-1.5">
								<h3 class="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate">
									{{ plan.topic }}
								</h3>
								<span class="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
									<Sparkles class="h-3 w-3" /> Multi-Agent
								</span>
							</div>
							<div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
								<span class="font-semibold text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30">
									{{ plan.subject }}
								</span>
								<span v-if="plan.grade_level">{{ __('Grade Block') }}: {{ plan.grade_level }}</span>
								<span>{{ plan.duration_minutes }} {{ __("minutes") }}</span>
								<span v-if="plan.output_format" class="text-slate-500">{{ __("Output:") }} {{ plan.output_format }}</span>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-3 self-end sm:self-center">
						<span class="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest border" :class="statusBadgeColors[plan.status]">
							{{ plan.status }}
						</span>
						<button 
							v-if="plan.status === 'Failed'"
							@click.stop="retryPlan(plan.name)"
							class="text-slate-500 hover:text-emerald-400 transition-colors rounded-full p-1 hover:bg-emerald-500/10" 
							:title="__('Retry lesson plan')"
						>
							<RefreshCw class="h-4 w-4" />
						</button>
						<button 
							@click.stop="deletePlan(plan.name)" 
							class="text-slate-500 hover:text-red-400 transition-colors rounded-full p-1 hover:bg-red-500/10" 
							:title="__('Delete lesson plan')"
						>
							<Trash2 class="h-4 w-4" />
						</button>
						<span class="text-slate-600 group-hover:text-indigo-400 transition-colors">→</span>
					</div>
				</div>
			</div>

			<!-- Load More Button -->
			<div v-if="hasMorePlans && !loading" class="mt-6 flex justify-center">
				<button @click="loadMorePlans" class="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
					<Plus class="h-4 w-4" /> {{ __('Load More') }}
				</button>
			</div>

			<!-- Elegant Empty State -->
			<div v-else-if="!loading" class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-950 p-16 text-center">
				<CalendarCheck class="h-16 w-16 text-slate-600 mb-4 animate-bounce-slow" />
				<h3 class="text-lg font-bold text-slate-200">{{ __('No lesson plans created yet') }}</h3>
				<p class="mt-2 text-sm text-slate-400 max-w-md">{{ __("Let's start by creating a new lesson plan with RAG Retriever, Illustrator, and professional lecture review.") }}</p>
				<button class="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500" @click="openGenerateModal">
					<Sparkles class="h-4 w-4" /> {{ __('Create Lesson Plan Now') }}
				</button>
			</div>

			<!-- Sleek Loader -->
			<div v-if="loading" class="flex items-center justify-center py-16">
				<div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500" />
			</div>
		</div>

		<!-- Generate Modal -->
		<Dialog :model-value="showGenerateModal" @close="showGenerateModal = false" :options="{ title: __('Design New AI Lesson Plan'), size: 'lg' }">
			<template #body-content>
				<div class="space-y-5 bg-slate-900 text-slate-100 p-2">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label class="mb-1.5 block text-sm font-semibold text-slate-300">{{ __('Topic / Lesson Name') }} *</label>
							<input v-model="genForm.topic" type="text" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none" :placeholder="__('Example: Law of Universal Gravitation')" required />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-semibold text-slate-300">{{ __('Subject') }} *</label>
							<input v-model="genForm.subject" type="text" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none" :placeholder="__('Example: Physics, Math, History...')" required />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-semibold text-slate-300">{{ __('Grade Level') }}</label>
							<input v-model="genForm.grade_level" type="text" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none" :placeholder="__('Example: Grade 10, Grade 12')" />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-semibold text-slate-300">{{ __('Duration (Minutes)') }}</label>
							<input v-model.number="genForm.duration_minutes" type="number" min="15" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none" />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-semibold text-slate-300">{{ __('Export format') }}</label>
							<select v-model="genForm.output_format" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none">
								<option value="lms_native">{{ __("Save directly to course (LMS native)") }}</option>
								<option value="markdown">{{ __("Markdown Preview (Live view)") }}</option>
								<option value="docx">Microsoft Word (.docx)</option>
								<option value="latex">LaTeX (.tex)</option>
							</select>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-semibold text-slate-300">{{ __('Template Style') }}</label>
							<select v-model="genForm.template_style" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none">
								<option value="cv5512">{{ __("Công văn 5512 (Chuẩn VN)") }}</option>
								<option value="international">{{ __("International (5E / Rosenshine)") }}</option>
								<option value="custom">{{ __("Custom (Tự do)") }}</option>
							</select>
						</div>
						<div v-if="genForm.output_format === 'lms_native'">
							<label class="mb-1.5 block text-sm font-semibold text-slate-300">{{ __('Target Course (LMS Course)') }} *</label>
							<select v-model="genForm.target_course" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none">
								<option value="">{{ __("-- Select course --") }}</option>
								<option v-for="c in courses" :key="c.name" :value="c.name">{{ c.title }}</option>
							</select>
						</div>
					</div>

					<!-- Custom Reference File Uploader -->
					<div>
						<label class="mb-1.5 block text-sm font-semibold text-slate-300">{{ __('Reference Document (RAG)') }}</label>
						<div class="flex items-center gap-3">
							<input type="file" ref="fileInput" @change="uploadFile" class="hidden" accept=".pdf,.docx,.txt" />
							<button 
								type="button" 
								class="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
								@click="$refs.fileInput.click()"
								:disabled="uploading"
							>
								<Upload class="h-4 w-4" /> {{ uploading ? __('Uploading...') : __('Upload File (.pdf, .docx, .txt)') }}
							</button>
							<span v-if="genForm.reference_file" class="text-xs text-emerald-400 font-semibold truncate max-w-xs">
								✓ {{ __("Uploaded:") }} {{ genForm.reference_file.split('/').pop() }}
							</span>
						</div>
					</div>

					<div>
						<label class="mb-1.5 block text-sm font-semibold text-slate-300">{{ __('Special additional requirements') }}</label>
						<textarea v-model="genForm.custom_requirements" rows="2" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none" :placeholder="__('Example: Focus on group discussion activities, use constructivist methods, or relate to local practicalities...')" />
					</div>

					<div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
						<button class="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800" @click="showGenerateModal = false">{{ __('Cancel') }}</button>
						<button 
							class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 px-5 py-2.5 text-sm font-extrabold text-slate-950 transition-all duration-200 hover:from-emerald-300 hover:to-teal-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50" 
							:disabled="generating || !genForm.topic || !genForm.subject || (genForm.output_format === 'lms_native' && !genForm.target_course)" 
							@click="handleGenerate"
						>
							<Loader2 v-if="generating" class="h-4 w-4 animate-spin text-slate-950" />
							<Sparkles v-else class="h-4 w-4 text-slate-950" />
							{{ generating ? __('Compiling...') : __('Launch AI Process') }}
						</button>
					</div>
				</div>
			</template>
		</Dialog>

		<!-- View Plan & Interactive Review Workspace Modal -->
		<Dialog :model-value="showViewModal" @close="showViewModal = false" :options="{ title: viewPlanData?.topic || __('Lesson Plan Details'), size: '4xl' }">
			<template #body-content>
				<div v-if="viewLoading" class="flex flex-col items-center justify-center py-16">
					<div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500 mb-2" />
					<span class="text-sm text-slate-400">{{ __("Querying data...") }}</span>
				</div>
				<div v-else-if="viewPlanData" class="space-y-6 bg-slate-900 text-slate-100 p-2">
					<!-- Active Stepper Progress Indicator -->
					<div class="rounded-2xl border border-slate-800 bg-slate-950 p-5">
						<h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{{ __("Live Multi-Agent Process") }}</h4>
						<div class="flex flex-wrap items-center gap-y-4">
							<div v-for="(step, idx) in steps" :key="step.key" class="flex items-center">
								<div class="flex items-center gap-2">
									<div 
										class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black border transition-all duration-300"
										:class="getStepClass(step.key, viewPlanData.status)"
									>
										<Check v-if="isStepCompleted(step.key, viewPlanData.status)" class="h-4 w-4 text-white" />
										<span v-else>{{ idx + 1 }}</span>
									</div>
									<span class="text-xs font-bold mr-3" :class="getStepTextClass(step.key, viewPlanData.status)">
										{{ step.label }}
									</span>
								</div>
								<span v-if="idx < steps.length - 1" class="text-slate-700 text-xs mr-3">➔</span>
							</div>
						</div>
					</div>

					<div class="flex flex-wrap items-center gap-2">
						<span class="rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-900/30 uppercase">{{ viewPlanData.subject }}</span>
						<span class="rounded-full px-3 py-1 text-xs font-extrabold uppercase" :class="statusBadgeColors[viewPlanData.status]">{{ viewPlanData.status }}</span>
						<button 
							v-if="viewPlanData.status === 'Failed'"
							@click="retryPlan(viewPlanData.name)"
							class="ml-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
						>
							<RefreshCw class="h-3 w-3" /> {{ __('Retry Failed Plan') }}
						</button>
						<span v-if="viewPlanData.standards" class="text-xs text-slate-400 ml-auto">{{ __("Matched standards:") }} {{ viewPlanData.standards }}</span>
					</div>

					<!-- HITL Interactive Review Workspace Pane Split -->
					<div v-if="viewPlanData.status === 'Review'" class="grid grid-cols-1 gap-6 lg:grid-cols-12 border-t border-slate-800 pt-6">
						<!-- Editable Left Pane -->
						<div class="lg:col-span-8 space-y-3">
							<h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
								<Edit class="h-4 w-4 text-indigo-400" /> {{ __("LESSON PLAN DRAFT FOR YOUR REVIEW (FREELY EDITABLE)") }}
							</h3>
							<textarea 
								v-model="viewPlanData.review_draft" 
								rows="18" 
								class="w-full rounded-2xl border border-indigo-900/50 bg-slate-950 p-5 text-sm font-mono text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							/>
						</div>

						<!-- Decision Right Pane -->
						<div class="lg:col-span-4 space-y-4">
							<div class="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
								<h4 class="text-sm font-bold text-slate-200">{{ __("Academic Approval Board") }}</h4>
								<p class="text-xs text-slate-400">{{ __("The lesson plan draft has been thoroughly grounded. Teachers can approve directly or type critical feedback for the Agent to rewrite.") }}</p>
								
								<div>
									<label class="mb-1.5 block text-sm font-semibold text-slate-300 uppercase">{{ __("Your feedback (Content to rewrite)") }}</label>
									<textarea 
										v-model="reviewFeedback" 
										rows="8" 
										class="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" 
										:placeholder="__('Example: Add more practical examples in part 2, and make part 1 more detailed...')" 
									/>
								</div>

								<div class="space-y-3 pt-4">
									<button 
										class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-sm font-black text-slate-950 transition-all duration-300 hover:bg-emerald-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
										@click="submitReview('approve')"
										:disabled="resuming"
									>
										<CheckCircle class="h-5 w-5 text-slate-950" /> {{ resuming ? __('Processing...') : __('✅ ACCEPT THIS DRAFT') }}
									</button>
									
									<button 
										class="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-bold text-slate-200 transition-all duration-300 hover:bg-slate-700 hover:scale-[1.02] active:scale-95"
										@click="submitReview('edit')"
										:disabled="resuming || !reviewFeedback"
									>
										<RefreshCw class="h-5 w-5" /> 🔄 {{ __("REQUEST REWRITE (Based on feedback)") }}
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Completed Content Section -->
					<div v-else class="space-y-4 border-t border-slate-800 pt-6">
						<!-- Exported files attachments -->
						<div v-if="viewPlanData.generated_file" class="flex items-center gap-3 rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-4">
							<FileText class="h-6 w-6 text-emerald-400" />
							<div>
								<div class="text-sm font-bold text-emerald-300">{{ __("Lesson plan successfully exported!") }}</div>
								<a :href="viewPlanData.generated_file" target="_blank" class="text-xs text-indigo-400 font-semibold hover:underline">
									{{ __("Download document here") }}
								</a>
							</div>
						</div>

						<div v-if="viewPlanData.linked_lesson" class="flex items-center gap-3 rounded-2xl border border-indigo-950 bg-indigo-950/20 p-4">
							<BookOpen class="h-6 w-6 text-indigo-400" />
							<div>
								<div class="text-sm font-bold text-indigo-300">{{ __("Lesson plan pushed directly to LMS native!") }}</div>
								<span class="text-xs text-slate-400">{{ __("Target lesson name:") }} {{ viewPlanData.linked_lesson }}</span>
							</div>
						</div>

						<div v-if="viewPlanData.generated_content" class="space-y-4">
							<h4 class="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
								<BookOpen class="h-4 w-4 text-indigo-400" /> {{ __("Detailed lesson plan content") }}
							</h4>
							<div class="rounded-2xl border border-slate-800 bg-slate-950 p-6 max-h-[600px] overflow-y-auto bg-slate-950 text-slate-200">
								<div class="ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal dark:prose-invert" v-html="renderMarkdown(viewPlanData.generated_content)"></div>
							</div>
						</div>
					</div>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { createResource, Breadcrumbs, Dialog, usePageMeta } from 'frappe-ui'
import { CalendarCheck, Sparkles, Plus, CheckCircle, Upload, BookOpen, RefreshCw, Zap, Clock, Edit, FileText, Check, Loader2, Trash2 } from 'lucide-vue-next'
import { sessionStore } from '@/stores/session'
import MarkdownIt from 'markdown-it'
import markdownItKatex from 'markdown-it-katex'
import 'katex/dist/katex.min.css'

const md = new MarkdownIt({
	html: true,
	linkify: true
})
md.use(markdownItKatex)

md.use(markdownItKatex)

function renderMarkdown(content) {
	if (!content) return ''
	return md.render(content)
}

const { brand } = sessionStore()
const router = useRouter()

const socket = inject('$socket')

onMounted(() => {
	if (socket) {
		socket.on('lesson_plan_review', (payload) => {
			console.log("Receive HITL notification:", payload)
			loadPlans() // Tự động làm mới danh sách giáo án
			alert(`🔔 ${__("Draft prepared:")} ${payload.plan_name}\n\n${payload.message}`)
		})
	}
})

onUnmounted(() => {
	if (socket) {
		socket.off('lesson_plan_review')
	}
})

const plans = ref([])
const courses = ref([])
const loading = ref(true)
const generating = ref(false)
const uploading = ref(false)
const resuming = ref(false)
const showGenerateModal = ref(false)
const showViewModal = ref(false)
const viewPlanData = ref(null)
const viewLoading = ref(false)
const filterStatus = ref('')
const reviewFeedback = ref('')
const fileInput = ref(null)

const stats = reactive({ total: 0, completed: 0, review_pending: 0, hours_saved: '0h' })

const statusBgColors = {
	Draft: 'bg-slate-800',
	Retrieving: 'bg-yellow-500/10',
	Planning: 'bg-amber-500/10',
	Writing: 'bg-blue-500/10',
	Review: 'bg-purple-500/10',
	Illustrating: 'bg-fuchsia-500/10',
	Assessing: 'bg-pink-500/10',
	Completed: 'bg-emerald-500/10',
	Failed: 'bg-red-500/10'
}

const statusIconColors = {
	Draft: 'text-slate-400',
	Retrieving: 'text-yellow-400',
	Planning: 'text-amber-400',
	Writing: 'text-blue-400',
	Review: 'text-purple-400',
	Illustrating: 'text-fuchsia-400',
	Assessing: 'text-pink-400',
	Completed: 'text-emerald-400',
	Failed: 'text-red-400'
}

const statusBadgeColors = {
	Draft: 'border-slate-800 text-slate-400 bg-slate-900',
	Retrieving: 'border-yellow-900/50 text-yellow-400 bg-yellow-950/20',
	Planning: 'border-amber-900/50 text-amber-400 bg-amber-950/20',
	Writing: 'border-blue-900/50 text-blue-400 bg-blue-950/20',
	Review: 'border-purple-900/50 text-purple-400 bg-purple-950/20',
	Illustrating: 'border-fuchsia-900/50 text-fuchsia-400 bg-fuchsia-950/20',
	Assessing: 'border-pink-900/50 text-pink-400 bg-pink-950/20',
	Completed: 'border-emerald-900/50 text-emerald-400 bg-emerald-950/20',
	Failed: 'border-red-900/50 text-red-400 bg-red-950/20'
}

const steps = [
	{ key: 'Retrieving', label: '1. Grounding' },
	{ key: 'Planning', label: __('2. Planning') },
	{ key: 'Writing', label: __('3. Writing') },
	{ key: 'Review', label: __('4. Review') },
	{ key: 'Illustrating', label: __('5. Illustrating') },
	{ key: 'Assessing', label: __('6. Assessing') },
	{ key: 'Completed', label: __('7. Completed') }
]

const genForm = reactive({
	topic: '', subject: '', grade_level: '', duration_minutes: 45,
	output_format: 'lms_native', template_style: 'cv5512', target_course: '', reference_file: '', custom_requirements: ''
})

usePageMeta(() => ({ title: `AI Lesson Planner v2 - ${brand.value}` }))

function goBackToAIIntegration() {
	router.push({ name: 'AIIntegration' })
}

function openGenerateModal() {
	genForm.topic = ''
	genForm.subject = ''
	genForm.grade_level = ''
	genForm.duration_minutes = 45
	genForm.template_style = 'cv5512'
	genForm.reference_file = ''
	genForm.custom_requirements = ''
	showGenerateModal.value = true
}

// 1. Fetching Stats
const statsResource = createResource({
	url: 'lms.lms.services.lesson_planner.api.get_planner_stats',
	onSuccess: (data) => {
		Object.assign(stats, data)
	}
})

// 2. Fetching Course lists for target selection
const coursesResource = createResource({
	url: 'frappe.client.get_list',
	makeParams: () => ({ doctype: 'LMS Course', fields: ['name', 'title'], limit_page_length: 100 }),
	onSuccess: (data) => {
		courses.value = data || []
	}
})

const plansStart = ref(0)
const plansLimit = ref(5)
const hasMorePlans = ref(false)

const plansResource = createResource({
	url: 'frappe.client.get_list',
	makeParams: () => ({
		doctype: 'AI Lesson Plan',
		fields: ['name', 'topic', 'subject', 'grade_level', 'status', 'duration_minutes', 'output_format'],
		filters: filterStatus.value ? { status: filterStatus.value } : {},
		order_by: 'modified desc',
		limit_start: plansStart.value,
		limit_page_length: plansLimit.value
	}),
	onSuccess: (data) => {
		const fetched = data || []
		if (plansStart.value === 0) {
			plans.value = fetched
		} else {
			plans.value = [...plans.value, ...fetched]
		}
		hasMorePlans.value = fetched.length === plansLimit.value
		loading.value = false
	},
	onError: (err) => {
		loading.value = false
		console.error(err)
	}
})

const loadPlans = (reset = true) => {
	if (reset) {
		plansStart.value = 0
	}
	loading.value = true
	plansResource.fetch()
}

const loadMorePlans = () => {
	plansStart.value += plansLimit.value
	loadPlans(false)
}

// 4. Reference File Uploading
async function uploadFile(event) {
	const file = event.target.files[0]
	if (!file) return
	
	const formData = new FormData()
	formData.append('file', file)
	
	uploading.value = true
	try {
		const token = window.csrf_token || (window.frappe && window.frappe.csrf_token)
		const res = await fetch('/api/method/lms.lms.services.lesson_planner.api.upload_reference_file', {
			method: 'POST',
			headers: {
				'X-Frappe-CSRF-Token': token
			},
			body: formData
		})
		const data = await res.json()
		if (data.message && data.message.file_url) {
			genForm.reference_file = data.message.file_url
		}
	} catch (e) {
		console.error(e)
	} finally {
		uploading.value = false
	}
}

// 5. Creating Lesson Plan Resource
const createPlanResource = createResource({
	url: 'lms.lms.services.lesson_planner.api.create_lesson_plan',
	onSuccess: () => {
		generating.value = false
		showGenerateModal.value = false
		loadPlans()
		statsResource.fetch()
	},
	onError: (err) => {
		generating.value = false
		console.error(err)
	}
})

function handleGenerate() {
	generating.value = true
	createPlanResource.submit({
		topic: genForm.topic,
		subject: genForm.subject,
		grade_level: genForm.grade_level,
		duration_minutes: genForm.duration_minutes,
		reference_file: genForm.reference_file || undefined,
		custom_requirements: genForm.custom_requirements || undefined,
		output_format: genForm.output_format,
		template_style: genForm.template_style,
		target_course: genForm.target_course || undefined
	})
}

// 6. Delete Lesson Plan Resource
const deletePlanResource = createResource({
	url: 'frappe.client.delete',
	onSuccess: () => {
		loadPlans()
		statsResource.fetch()
	},
	onError: (err) => {
		console.error("Failed to delete", err)
	}
})

function deletePlan(planName) {
	if (confirm(__('Are you sure you want to delete this lesson plan? Data cannot be recovered.'))) {
		deletePlanResource.submit({
			doctype: 'AI Lesson Plan',
			name: planName
		})
	}
}

// 6.5 Retry Lesson Plan Resource
const retryPlanResource = createResource({
	url: 'lms.lms.services.lesson_planner.api.retry_lesson_plan',
	onSuccess: () => {
		if (window.frappe && frappe.show_alert) {
			frappe.show_alert({ message: __('Retry task has been added to queue!'), indicator: 'green' })
		} else {
			alert(__('Retry task has been added to queue!'))
		}
		loadPlans()
		statsResource.fetch()
		if (showViewModal.value && viewPlanData.value) {
			planDetailResource.submit({ plan_name: viewPlanData.value.name })
		}
	},
	onError: (err) => {
		if (window.frappe && frappe.show_alert) {
			frappe.show_alert({ message: __('Failed to retry: ') + err, indicator: 'red' })
		}
		console.error("Failed to retry", err)
	}
})

function retryPlan(planName) {
	if (confirm(__('Do you want to retry this failed lesson plan? It will resume from the last successful step.'))) {
		if (window.frappe && frappe.show_alert) {
			frappe.show_alert({ message: __('Sending retry request...'), indicator: 'blue' })
		}
		retryPlanResource.submit({
			plan_name: planName
		})
	}
}

// 6. Detailed Plan view Resource
const planDetailResource = createResource({
	url: 'lms.lms.services.lesson_planner.api.get_lesson_plan_status',
	onSuccess: (data) => {
		viewPlanData.value = data
		viewLoading.value = false
	},
	onError: (err) => {
		viewLoading.value = false
		console.error(err)
	}
})

function viewPlan(name) {
	viewLoading.value = true
	showViewModal.value = true
	reviewFeedback.value = ''
	planDetailResource.submit({ plan_name: name })
}

// 7. Resuming from review interrupt Resource
const resumePlanResource = createResource({
	url: 'lms.lms.services.lesson_planner.api.resume_lesson_plan',
	onSuccess: () => {
		resuming.value = false
		showViewModal.value = false
		loadPlans()
		statsResource.fetch()
	},
	onError: (err) => {
		resuming.value = false
		console.error(err)
	}
})

function submitReview(action) {
	resuming.value = true
	resumePlanResource.submit({
		plan_name: viewPlanData.value.name,
		action: action,
		edited_content: viewPlanData.value.review_draft,
		feedback: reviewFeedback.value || undefined
	})
}

// Stepper states utility
const order = ['Retrieving', 'Planning', 'Writing', 'Review', 'Illustrating', 'Assessing', 'Completed']

function isStepCompleted(stepKey, currentStatus) {
	if (currentStatus === 'Completed') return true
	if (currentStatus === 'Failed') return false
	
	const stepIdx = order.indexOf(stepKey)
	const currentIdx = order.indexOf(currentStatus)
	
	if (stepIdx === -1 || currentIdx === -1) return false
	return stepIdx < currentIdx
}

function getStepClass(stepKey, currentStatus) {
	if (currentStatus === 'Failed') return 'border-red-500 bg-red-950/20 text-red-500'
	if (stepKey === currentStatus || (currentStatus === 'Draft' && stepKey === 'Retrieving')) {
		return 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold scale-110 shadow-lg shadow-amber-500/20 animate-pulse'
	}
	if (isStepCompleted(stepKey, currentStatus)) {
		return 'border-green-500 bg-green-650 text-white shadow-md shadow-green-500/10'
	}
	return 'border-slate-800 bg-slate-900 text-slate-500'
}

function getStepTextClass(stepKey, currentStatus) {
	if (stepKey === currentStatus || (currentStatus === 'Draft' && stepKey === 'Retrieving')) return 'text-amber-400 font-black'
	if (isStepCompleted(stepKey, currentStatus)) return 'text-green-400 font-semibold'
	return 'text-slate-600'
}

onMounted(() => {
	loadPlans()
	statsResource.fetch()
	coursesResource.fetch()
})
</script>

<style scoped>
.animate-spin-slow {
	animation: spin 6s linear infinite;
}
@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}
.animate-bounce-slow {
	animation: bounce 3s infinite;
}
@keyframes bounce {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-10px); }
}
</style>
