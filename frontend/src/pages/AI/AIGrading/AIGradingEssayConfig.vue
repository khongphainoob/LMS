<template>
	<section class="flex flex-col">
		<div class="flex flex-col gap-6 p-6">
		<!-- Back button -->
		<button
			class="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
			@click="$router.push({ name: 'AIGradingEssay' })"
		>
			← {{ __('Back') }}
		</button>

		<!-- Title -->
		<div>
			<h2 class="text-2xl font-bold text-gray-900 tracking-tight">{{ pageTitle }}</h2>
			<p class="mt-1 text-sm text-gray-500">{{ pageSubtitle }}</p>
		</div>

		<!-- Subject Selection -->
		<div>
			<label class="mb-2 block text-[11px] font-medium uppercase tracking-wider text-gray-400">
				{{ __('Subject') }}
			</label>
			<div class="flex flex-wrap gap-2">
				<button
					v-for="subj in subjects"
					:key="subj.value"
					class="rounded-full border px-3.5 py-1.5 text-sm transition-all"
					:class="[
						selectedSubject === subj.value
							? accentClasses.chipSelected
							: 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700',
					]"
					@click="selectSubject(subj.value)"
				>
					{{ subj.label }}
				</button>
			</div>	
		</div>

		<!-- Grade / Level Selection (changes based on subject) -->
		<div>
			<label class="mb-2 block text-[11px] font-medium uppercase tracking-wider text-gray-400">
				{{ isEnglish ? __('Certificate / Level') : __('Grade Level') }}
			</label>

			<!-- Standard grades 1-12 + ĐH -->
			<div v-if="!isEnglish" class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
				<button
					v-for="grade in standardGrades"
					:key="grade.value"
					class="rounded-lg border px-2 py-3 text-center transition-all"
					:class="[
						selectedLevel === grade.value
							? accentClasses.chipSelected
							: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
					]"
					@click="selectedLevel = grade.value"
				>
					<div class="text-lg font-bold">{{ grade.display }}</div>
					<div class="text-[10px] text-gray-400" :class="selectedLevel === grade.value ? accentClasses.text : ''">{{ grade.label }}</div>
				</button>
			</div>

			<!-- English certificates -->
			<div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
				<button
					v-for="cert in englishCerts"
					:key="cert.value"
					class="group rounded-xl border p-4 text-left transition-all"
					:class="[
						selectedLevel === cert.value
							? accentClasses.chipSelected
							: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50',
					]"
					@click="selectedLevel = cert.value"
				>
					<div class="text-2xl mb-1">{{ cert.icon }}</div>
					<div class="text-sm font-semibold" :class="selectedLevel === cert.value ? accentClasses.text : 'text-gray-800'">{{ cert.label }}</div>
					<div class="mt-0.5 text-[10px] leading-tight" :class="selectedLevel === cert.value ? accentClasses.textLight : 'text-gray-400'">{{ cert.desc }}</div>
				</button>
			</div>
		</div>

		<!-- Target Audience -->
		<div>
			<label class="mb-2 block text-[11px] font-medium uppercase tracking-wider text-gray-400">
				{{ __('Target Audience') }}
			</label>
			<div class="flex flex-wrap gap-2">
				<button
					v-for="aud in audiences"
					:key="aud"
					class="rounded-full border px-3.5 py-1.5 text-sm transition-all"
					:class="[
						selectedAudience === aud
							? accentClasses.chipSelected
							: 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700',
					]"
					@click="selectedAudience = aud"
				>
					{{ aud }}
				</button>
			</div>
		</div>

		<div
			v-if="['exam', 'hw', 'test'].includes(type)"
			class="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm"
		>
			<div class="mb-4 space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm font-semibold text-gray-800">{{ __('Grading Session') }}</span>
					<span
						class="rounded-full px-2 py-0.5 text-[10px] font-medium"
						:class="accentClasses.badge"
					>
						{{ __('Session Requests') }}
					</span>
				</div>
				<div class="relative">
					<input
						v-model="sessionSearchQuery"
						class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none transition-all"
						:class="'focus:border-' + accentClasses.text.split('-')[1]"
						:style="`focus: border-color: ${accentClasses.buttonStyle.split(': ')[1]}`"
						:placeholder="__('Search for a session by ID or name...')"
					/>
					<span class="absolute right-3 top-2.5 text-xs text-gray-400">🔍</span>
				</div>
			</div>

			<div class="mt-2">
				<div class="rounded-xl overflow-hidden bg-gray-100/60" style="max-height: 50vh;">
					<div 
						class="session-list h-full space-y-2 scroll-smooth p-1.5"
						@scroll="onScroll"
					>
				<div
					v-if="!sessions.length && !sessionsResource.loading"
					class="rounded-[2rem] border-2 border-dashed border-slate-100 bg-white/50 px-10 py-16 text-center shadow-inner"
				>
					<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-4xl shadow-sm mb-6">📭</div>
					<h3 class="text-base font-black text-slate-800 uppercase tracking-tight">{{ __('No scoring sessions yet') }}</h3>
					<p class="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{{ __('Let\'s create a new session to start marking with AI') }}</p>
				</div>

				<div
					v-for="session in sessions"
					:key="session.id"
					class="session-item group relative flex flex-wrap items-center gap-5 rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:shadow-xl sm:flex-nowrap mb-3 border-l-4"
					:class="[accentClasses.hoverSession, accentClasses.borderLeft]"
				>
					<!-- Status Indicator Glow -->
					<div
						class="h-2 w-2 rounded-full flex-shrink-0 animate-pulse shadow-sm"
						:style="{ background: session.color || '#10b981', boxShadow: `0 0 8px ${session.color || '#10b981'}80` }"
					/>
					
					<div class="min-w-0 flex-1">
						<div 
							class="truncate text-base font-medium text-gray-900 transition-colors"
							:class="'group-hover:' + accentClasses.text"
						>
							{{ session.name }}
						</div>
						<div class="flex items-center gap-2 mt-1">
							<span class="text-xs text-gray-500">{{ session.meta }}</span>
							<span class="h-1 w-1 rounded-full bg-gray-300"></span>
							<span class="text-xs text-gray-400" :class="accentClasses.text">{{ session.id }}</span>
						</div>
					</div>

					<div class="ml-auto flex flex-wrap items-center justify-end gap-2 sm:w-auto">
						<!-- Progress/Status Badge (Dynamic Color) -->
						<div 
							class="px-2.5 py-0.5 rounded text-xs font-medium border"
							:class="accentClasses.badge"
						>
							{{ session.status === 'Open' ? __('Active') : (session.progress || __('Open')) }}
						</div>

						<!-- Quick Actions -->
						<div class="flex items-center gap-1.5 ml-2 border-l border-slate-100 pl-3">
							<button
								class="h-8 px-2.5 rounded flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100"
								:class="'hover:' + accentClasses.text"
								@click.stop="openSession(session)"
							>
								<icons.Play class="h-3.5 w-3.5 fill-current" />
								{{ __('Open') }}
							</button>
							<button
								class="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all border border-transparent hover:border-violet-100"
								@click.stop="openSessionStatistics(session)"
								:title="__('Statistics')"
							>
								<icons.BarChart3 class="h-4 w-4" />
							</button>
							<button
								class="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
								@click.stop="openEditSessionModal(session.id)"
								:title="__('Edit')"
							>
								<icons.Edit2 class="h-4 w-4" />
							</button>
							<button
								class="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
								@click.stop="deleteSession(session.id)"
								:title="__('Delete')"
							>
								<icons.Trash2 class="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
				
				<!-- Loading Indicator -->
				<div v-if="sessionsResource.loading" class="py-4 text-center">
					<div 
						class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
						:class="accentClasses.text"
					></div>
					<span class="ml-2 text-xs text-gray-400">{{ __('Loading more...') }}</span>
				</div>
				
				<!-- End of list message -->
				<div v-if="!hasMoreSessions && allSessions.length > 5" class="py-4 text-center text-sm text-gray-500">
					{{ __('End of list') }}
				</div>
				</div>
				</div>
			</div>

			<button
				class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-200 bg-gray-100/70 py-2.5 text-sm font-medium transition-all"
				:class="[accentClasses.text, accentClasses.hoverSession]"
				@click="showNewSessionModal = true"
			>
				+ {{ __('Create new session') }}
			</button>
		</div>

		</div>

		<!-- New Session Modal -->
		<Dialog v-model="showNewSessionModal" :title="__('Create New Session')">
			<template #body-content>
				<div class="space-y-4 p-4">
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Session Name') }}</label>
						<Input
							type="text"
							v-model="newSession.name"
							:placeholder="__('e.g. Midterm II — 2024–2025')"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<CourseBatchSelector v-model="newSessionModel" :context="aiContext" />
					</div>

					<!-- Reference Resource Selection -->
					<div v-if="type === 'hw'" class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Assignment') }}</label>
						<select
							v-model="newSession.reference_doc"
							class="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 focus:border-[#b45309] focus:bg-white outline-none"
						>
							<option value="">{{ __('Select Assignment...') }}</option>
							<option v-for="a in assignments.data" :key="a.name" :value="a.name">{{ a.title || a.name }}</option>
						</select>
					</div>

					<div v-if="type === 'test'" class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Quiz') }}</label>
						<select
							v-model="newSession.reference_doc"
							class="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 focus:border-[#1d4ed8] focus:bg-white outline-none"
						>
							<option value="">{{ __('Select Quiz...') }}</option>
							<option v-for="q in quizzes.data" :key="q.name" :value="q.name">{{ q.title || q.name }}</option>
						</select>
					</div>
					<div class="flex flex-col gap-1 mt-2">
						<label class="text-sm font-medium text-gray-700">{{ __('Upload Topic & Answer File') }}</label>
						<input type="file" ref="fileInput" class="hidden" accept=".pdf,.doc,.docx" @change="handleFileChange" />
						<div
							class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-all cursor-pointer"
							:class="accentClasses.hoverSession"
							@click="$refs.fileInput.click()"
						>
							<span class="mb-2 text-2xl text-gray-400">📄</span>
							<span v-if="uploadedFileName" class="text-sm font-bold text-center" :class="accentClasses.text">{{ uploadedFileName }}</span>
							<span v-else class="text-xs font-medium text-gray-600 text-center">{{ __('Drag drop or click to upload file') }}</span>
							<span class="mt-1 text-[10px] text-gray-400">{{ __('Support: PDF, DOCX (Up to 10MB)') }}</span>
						</div>
					</div>
					<div class="flex flex-col gap-1 mt-2">
						<label class="text-sm font-medium text-gray-700">
							{{ __('AI Grading Notes') }} <span class="font-normal lowercase text-gray-400">({{ __('Optional') }})</span>
						</label>
						<textarea
							v-model="newSession.notes"
							class="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed placeholder:text-gray-400 transition-colors focus:border-[#2d6a4f] focus:bg-white focus:outline-none"
							rows="3"
							:placeholder="__('Enter specific instructions, deductions, focal points for AI to evaluate...')"
						></textarea>
					</div>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-end gap-2 px-4 pb-4">
					<Button @click="showNewSessionModal = false">{{ __('Cancel') }}</Button>
					<button class="rounded-lg px-4 py-2 text-sm font-bold shadow-md transition-all" :class="[accentClasses.button, accentClasses.hover]" :style="accentClasses.buttonStyle" @click="createSession">{{ __('Create & Open') }}</button>
				</div>
			</template>
		</Dialog>

		<Dialog v-model="showEditSessionModal" :title="__('Edit Session')">
			<template #body-content>
				<div class="space-y-4 p-4">
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Session Name') }}</label>
						<Input
							type="text"
							v-model="editSessionForm.session_name"
							:placeholder="__('Enter session name')"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Subject') }}</label>
						<Input
							type="text"
							v-model="editSessionForm.subject"
							:placeholder="__('Enter subject')"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<CourseBatchSelector v-model="editSessionModel" :context="aiContext" />
					</div>
					<div class="flex flex-col gap-1 mt-2">
						<label class="text-sm font-medium text-gray-700">{{ __('Upload Topic & Answer File') }}</label>
						<input
							type="file"
							ref="editFileInput"
							class="hidden"
							accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
							@change="onEditFileChange"
						/>
						<div
							class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-all cursor-pointer"
							:class="accentClasses.hoverSession"
							@click="editFileInput?.click()"
						>
							<span class="mb-2 text-2xl text-gray-400">📄</span>
							<span v-if="editUploadedFileName" class="text-sm font-bold text-center" :class="accentClasses.text">{{ editUploadedFileName }}</span>
							<span v-else class="text-xs font-medium text-gray-600 text-center">{{ __('Drag drop or click to upload file') }}</span>
							<span class="mt-1 text-[10px] text-gray-400">{{ __('Support: PDF, DOCX (Up to 10MB)') }}</span>
						</div>
						<div v-if="sessionAttachments.length" class="mt-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs text-gray-600">
							{{ __('Current file:') }}
							<a
								:href="sessionAttachments[0].file_url"
								target="_blank"
								rel="noopener noreferrer"
								class="ml-1 text-[#1d4ed8] hover:underline"
							>
								{{ sessionAttachments[0].file_name || sessionAttachments[0].file_url }}
							</a>
						</div>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Status') }}</label>
						<select
							v-model="editSessionForm.status"
							class="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 transition-colors focus:border-[#2d6a4f] focus:bg-white focus:outline-none"
						>
							<option value="Open">{{ __('Open') }}</option>
							<option value="Closed">{{ __('Closed') }}</option>
						</select>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('AI Grading Notes') }}</label>
						<textarea
							v-model="editSessionForm.ai_notes"
							class="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed placeholder:text-gray-400 transition-colors focus:border-[#2d6a4f] focus:bg-white focus:outline-none"
							rows="3"
							:placeholder="__('Enter notes for this session...')"
						></textarea>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('AI Rubric') }}</label>
						<select
							v-model="editSessionForm.rubric"
							class="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 transition-colors focus:border-[#2d6a4f] focus:bg-white focus:outline-none"
						>
							<option value="">{{ __('No rubric selected') }}</option>
							<option v-for="rubric in aiRubrics" :key="rubric.name" :value="rubric.name">
								{{ rubric.title || rubric.rubric_name || rubric.name }}
							</option>
						</select>
						<div class="text-[11px] text-gray-500">
							{{ __('Pick a reusable rubric to apply for this session.') }}
						</div>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Rubric Template') }}</label>
						<select
							v-model="editSessionForm.rubric_template"
							class="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 transition-colors focus:border-[#2d6a4f] focus:bg-white focus:outline-none"
						>
							<option value="">{{ __('No template selected') }}</option>
							<option v-for="tpl in rubricTemplates.data || []" :key="tpl.name" :value="tpl.name">
								{{ tpl.title || tpl.name }}
							</option>
						</select>
					</div>
					<button
						type="button"
						class="inline-flex items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-100"
						@click="goRubricBuilder"
					>
						{{ __('Create Rubric with AI') }}
					</button>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-end gap-2 px-4 pb-4">
					<Button @click="showEditSessionModal = false">{{ __('Cancel') }}</Button>
					<button
						class="rounded-lg px-4 py-2 text-sm font-bold shadow-md transition-all"
						:class="[accentClasses.button, accentClasses.hover]"
						:style="accentClasses.buttonStyle"
						@click="saveSessionEdit"
					>
						{{ __('Save Changes') }}
					</button>
				</div>
			</template>
		</Dialog>
	</section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as icons from 'lucide-vue-next'
import { 
	Button, 
	Dialog, 
	Input, 
	createListResource, 
	createResource 
} from 'frappe-ui'
import CourseBatchSelector from '@/components/ai/CourseBatchSelector.vue'

const props = defineProps({
	type: { type: String, required: true },
})

const router = useRouter()

const titles = {
	exam: __('Grade Exams'),
	test: __('Grade Quick Tests'),
	hw: __('Grade Homework'),
}
const subtitles = {
	exam: __('Set up information and choose a grading session before starting.'),
	test: __('Set up information and upload test papers.'),
	hw: __('Set up class information and upload homework for grading.'),
}

const pageTitle = computed(() => titles[props.type] || titles.exam)
const pageSubtitle = computed(() => subtitles[props.type] || subtitles.exam)

// --- Dynamic Styling Based on Type ---
const accentClasses = computed(() => {
	const map = {
		exam: {
			chipSelected: 'border-[#2d6a4f] bg-[#2d6a4f]/10 text-[#2d6a4f] shadow-[0_0_12px_rgba(45,106,79,0.15)]',
			text: 'text-[#2d6a4f]',
			textLight: 'text-[#2d6a4f]/80',
			button: 'text-white transition-all',
			buttonStyle: 'background-color: #2d6a4f;',
			hoverSession: 'hover:border-[#2d6a4f]/50 hover:bg-[#2d6a4f]/5',
			borderLeft: 'border-l-[#2d6a4f]',
			badge: 'border-[#2d6a4f]/20 bg-[#2d6a4f]/5 text-[#2d6a4f]',
			bgLight: 'bg-[#2d6a4f]/5',
			borderLight: 'border-[#2d6a4f]/20',
		},
		test: {
			chipSelected: 'border-[#1d4ed8] bg-[#1d4ed8]/10 text-[#1d4ed8] shadow-[0_0_12_rgba(29,78,216,0.15)]',
			text: 'text-[#1d4ed8]',
			textLight: 'text-[#1d4ed8]/80',
			button: 'text-white transition-all',
			buttonStyle: 'background-color: #1d4ed8;',
			hoverSession: 'hover:border-[#1d4ed8]/50 hover:bg-[#1d4ed8]/5',
			borderLeft: 'border-l-[#1d4ed8]',
			badge: 'border-[#1d4ed8]/20 bg-[#1d4ed8]/5 text-[#1d4ed8]',
			bgLight: 'bg-[#1d4ed8]/5',
			borderLight: 'border-[#1d4ed8]/20',
		},
		hw: {
			chipSelected: 'border-[#b45309] bg-[#b45309]/10 text-[#b45309] shadow-[0_0_12px_rgba(180,83,9,0.15)]',
			text: 'text-[#b45309]',
			textLight: 'text-[#b45309]/80',
			button: 'text-white transition-all',
			buttonStyle: 'background-color: #b45309;',
			hoverSession: 'hover:border-[#b45309]/50 hover:bg-[#b45309]/5',
			borderLeft: 'border-l-[#b45309]',
			badge: 'border-[#b45309]/20 bg-[#b45309]/5 text-[#b45309]',
			bgLight: 'bg-[#b45309]/5',
			borderLight: 'border-[#b45309]/20',
		},
	}
	return map[props.type] || map.exam
})

// --- Subjects ---
const subjects = [
	{ label: __('Math'), value: 'math' },
	{ label: __('Physics'), value: 'physics' },
	{ label: __('Chemistry'), value: 'chemistry' },
	{ label: __('Literature'), value: 'literature' },
	{ label: __('English'), value: 'english' },
	{ label: __('History'), value: 'history' },
	{ label: __('Geography'), value: 'geography' },
	{ label: __('Biology'), value: 'biology' },
]

const selectedSubject = ref('')
const isEnglish = computed(() => selectedSubject.value === 'english')

function selectSubject(val) {
	selectedSubject.value = val
	selectedLevel.value = '' // reset level when subject changes
}

// --- Grade levels ---
const standardGrades = [
	{ value: '1', display: '1', label: __('Grade 1') },
	{ value: '2', display: '2', label: __('Grade 2') },
	{ value: '3', display: '3', label: __('Grade 3') },
	{ value: '4', display: '4', label: __('Grade 4') },
	{ value: '5', display: '5', label: __('Grade 5') },
	{ value: '6', display: '6', label: __('Grade 6') },
	{ value: '7', display: '7', label: __('Grade 7') },
	{ value: '8', display: '8', label: __('Grade 8') },
	{ value: '9', display: '9', label: __('Grade 9') },
	{ value: '10', display: '10', label: __('Grade 10') },
	{ value: '11', display: '11', label: __('Grade 11') },
	{ value: '12', display: '12', label: __('Grade 12') },
	{ value: 'uni', display: __('University'), label: __('University') },
]

const englishCerts = [
	{ value: 'ielts', label: 'IELTS', icon: '🌍', desc: __('Academic & General Training') },
	{ value: 'toeic', label: 'TOEIC', icon: '💼', desc: __('Listening & Reading / Speaking & Writing') },
	{ value: 'toefl', label: 'TOEFL', icon: '🎓', desc: __('Internet-Based Test (iBT)') },
	{ value: 'cambridge', label: 'Cambridge', icon: '🏛️', desc: __('KET / PET / FCE / CAE / CPE') },
	{ value: 'vstep', label: 'VSTEP', icon: '🇻🇳', desc: __('Vietnamese Standardized Test') },
	{ value: 'aptis', label: 'Aptis', icon: '📊', desc: __('British Council Assessment') },
	{ value: 'sat', label: 'SAT', icon: '📘', desc: __('College Board English') },
	{ value: 'grade', label: __('School Grade'), icon: '🏫', desc: __('Grade 1–12 school English') },
]

const selectedLevel = ref('')

// --- Audiences ---
const audiences = [
	__('General'),
	__('Advanced'),
	__('Remedial'),
	__('Specialized'),
	__('Exam Prep'),
	__('University Prep'),
]
const selectedAudience = ref('')

const sessionSearchQuery = ref('')
const selectedSession = ref('')
const sessionStart = ref(0)
const sessionLimit = 20
const hasMoreSessions = ref(true)
const allSessions = ref([])

const sessionsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_sessions',
	makeParams() {
		return {
			grading_type: props.type === 'exam' ? 'Exam' : (props.type === 'test' ? 'Test' : 'Homework'),
			start: sessionStart.value,
			limit: sessionLimit,
			search: sessionSearchQuery.value,
		}
	},
	onSuccess(data) {
		if (data && data.length < sessionLimit) {
			hasMoreSessions.value = false
		} else if (!data || data.length === 0) {
			hasMoreSessions.value = false
		} else {
			hasMoreSessions.value = true
		}

		if (data) {
			const formatted = data.map(s => ({
				name: s.session_name,
				meta: `${s.subject || ''} ${s.level || ''}`,
				id: s.name,
				routeSlug: s.route_slug || toRouteSlug(s.session_name || s.name),
				status: s.status,
				progress: s.status || __('Open'),
				color: ['#2d6a4f', '#1d4ed8', '#b45309', '#9f1239'][Math.abs(s.name.split('').reduce((a,b)=>a+b.charCodeAt(0),0)) % 4],
			}))
			
			if (sessionStart.value === 0) {
				allSessions.value = formatted
			} else {
				// Append unique sessions
				const existingIds = new Set(allSessions.value.map(s => s.id))
				formatted.forEach(s => {
					if (!existingIds.has(s.id)) {
						allSessions.value.push(s)
					}
				})
			}
		}
	}
})

const sessions = computed(() => {
	// Filtering is now largely handled server-side, 
	// but we keep this computed to return the aggregated list
	return allSessions.value
})

onMounted(async () => {
	allSessions.value = []
	// Đợi nạp danh sách phiên trực tiếp từ máy chủ
	await refreshSessions()
})

// Debounced search
let searchTimeout = null
watch(sessionSearchQuery, (val) => {
	clearTimeout(searchTimeout)
	searchTimeout = setTimeout(() => {
		refreshSessions()
	}, 300)
})

async function loadMoreSessions() {
	if (!hasMoreSessions.value || sessionsResource.loading) return
	sessionStart.value = allSessions.value.length
	await sessionsResource.fetch()
}

function onScroll(e) {
	const { scrollTop, clientHeight, scrollHeight } = e.target
	if (scrollTop + clientHeight >= scrollHeight - 50) {
		loadMoreSessions()
	}
}

// --- New Session Modal ---
const showNewSessionModal = ref(false)
const newSessionModel = ref({ mode: 'course', batch: '', course: '' })
const newSession = reactive({ name: '', notes: '', reference_doc: '' })
const fileInput = ref(null)
const uploadedFileName = ref('')
const showEditSessionModal = ref(false)
const editFileInput = ref(null)
const editPickedFile = ref(null)
const editUploadedFileName = ref('')
const sessionAttachments = ref([])
const editSessionModel = ref({ mode: 'course', batch: '', course: '' })
const editSessionForm = reactive({
	id: '',
	session_name: '',
	subject: '',
	level: '',
	ai_notes: '',
	rubric: '',
	rubric_template: '',
	status: 'Open',
})

const aiRubricsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_rubric_templates',
	auto: true,
})

const aiRubrics = computed(() => aiRubricsResource.data || [])

const rubricTemplates = createListResource({
	doctype: 'LMS Rubric Template',
	fields: ['name', 'title'],
	limit: 100,
	orderBy: 'modified desc',
	auto: true,
})

const createSessionResource = createResource({
	url: 'lms.lms.services.ai_grading.api.create_ai_grading_session',
})
const studentContextResource = createResource({
	url: 'lms.lms.services.course_batch_resolver.get_selection_context',
	auto: true,
})
const aiContext = computed(() => studentContextResource.data || { courses: [], batches: [] })
const sessionDetailResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_session_detail',
})
const updateSessionResource = createResource({
	url: 'lms.lms.services.ai_grading.api.update_ai_grading_session',
})
const deleteSessionResource = createResource({
	url: 'lms.lms.services.ai_grading.api.delete_ai_grading_session',
})
const uploadSessionAttachmentResource = createResource({
	url: 'lms.lms.api.upload_ai_grading_session_attachment',
})
const sessionAttachmentsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_session_attachments',
})

function toRouteSlug(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/đ/g, 'd')
		.replace(/Đ/g, 'D')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

function handleFileChange(event) {
	const file = event.target.files[0]
	if (file) {
		uploadedFileName.value = file.name
	}
}

function onEditFileChange(event) {
	const file = event.target.files[0]
	if (file) {
		editPickedFile.value = file
		editUploadedFileName.value = file.name
	}
}

async function fileToDataUrl(file) {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result)
		reader.onerror = () => reject(new Error('Unable to read file'))
		reader.readAsDataURL(file)
	})
}

async function loadSessionAttachments(sessionId) {
	if (!sessionId) {
		sessionAttachments.value = []
		return
	}
	const result = await sessionAttachmentsResource.submit({ session: sessionId })
	sessionAttachments.value = result || []
}

async function uploadSelectedEditFile() {
	if (!editSessionForm.id || !editPickedFile.value) return
	const dataUrl = await fileToDataUrl(editPickedFile.value)
	await uploadSessionAttachmentResource.submit({
		session: editSessionForm.id,
		data_url: dataUrl,
		file_name: editPickedFile.value.name,
	})
	editPickedFile.value = null
	editUploadedFileName.value = ''
	if (editFileInput.value) editFileInput.value.value = ''
	await loadSessionAttachments(editSessionForm.id)
}

async function createSession() {
	if (!newSession.name) return

	const res = await createSessionResource.submit({
		data: {
			session_name: newSession.name,
			grading_type: props.type === 'exam' ? 'Exam' : (props.type === 'test' ? 'Test' : 'Homework'),
			subject: selectedSubject.value,
			level: selectedLevel.value,
			course: newSessionModel.value.course,
			batch: newSessionModel.value.batch,
			reference_doc_type: props.type === 'hw' ? 'LMS Assignment' : (props.type === 'test' ? 'LMS Quiz' : null),
			reference_doc: newSession.reference_doc,
			ai_notes: newSession.notes,
			status: 'Open',
		}
	})

	if (res) {
		const sessionDoc = typeof res === 'string'
			? { name: res, route_slug: toRouteSlug(newSession.name) }
			: res
		const newSessionSlug = sessionDoc.route_slug || toRouteSlug(newSession.name)
		showNewSessionModal.value = false
		newSession.name = ''
		newSession.className = ''
		newSession.notes = ''
		await refreshSessions()
		enterSession(newSessionSlug)
	}
}

// --- System Resources (Quizzes & Assignments) ---

const quizzes = createListResource({
	doctype: 'LMS Quiz',
	fields: ['name', 'title'],
	limit: 50,
	orderBy: 'modified desc',
	auto: props.type === 'test',
})

const assignments = createListResource({
	doctype: 'LMS Assignment',
	fields: ['name', 'title', 'type'],
	filters: { type: 'Text' },
	limit: 50,
	orderBy: 'modified desc',
	auto: props.type === 'hw',
})

watch(() => newSessionModel.value.course, (newCourse) => {
	newSession.reference_doc = ''
	if (props.type === 'hw') {
		assignments.update({
			filters: { type: 'Text', ...(newCourse ? { course: newCourse } : {}) }
		})
		assignments.reload()
	} else if (props.type === 'test') {
		quizzes.update({
			filters: newCourse ? { course: newCourse } : {}
		})
		quizzes.reload()
	}
})

// --- Proceed ---
async function refreshSessions() {
	sessionStart.value = 0
	hasMoreSessions.value = true
	await sessionsResource.fetch()
}

function enterSession(sessionSlug, additionalQuery = {}) {
	router.push({
		name: 'AIGradingEssayWorkspace',
		params: {
			type: props.type,
			sessionSlug: sessionSlug,
		},
		query: additionalQuery,
	})
}

async function openSession(session) {
	if (session.status !== 'Open') {
		await updateSessionResource.submit({
			session: session.id,
			data: { status: 'Open' }
		})
	}
	enterSession(session.routeSlug)
}

function openSessionStatistics(session) {
	router.push({
		name: 'AIGradingSessionStatistics',
		params: {
			type: props.type,
			sessionSlug: session.routeSlug,
		},
	})
}

function goRubricBuilder() {
	router.push({ name: 'AIGradingRubric' })
}

async function openEditSessionModal(sessionId) {
	const res = await sessionDetailResource.submit({ session: sessionId })
	if (!res) return

	editSessionForm.id = res.name || sessionId
	editSessionForm.session_name = res.session_name
	editSessionForm.subject = res.subject
	editSessionForm.level = res.level
	editSessionModel.value = { 
		mode: res.batch ? 'batch' : 'course', 
		batch: res.batch || '', 
		course: res.course || '' 
	}
	editSessionForm.ai_notes = res.ai_notes
	editSessionForm.rubric = res.rubric
	editSessionForm.rubric_template = res.rubric_template
	editSessionForm.status = res.status || 'Open'
	editPickedFile.value = null
	editUploadedFileName.value = ''
	await loadSessionAttachments(editSessionForm.id)
	showEditSessionModal.value = true
}

async function saveSessionEdit() {
	if (!editSessionForm.id || !editSessionForm.session_name?.trim()) return

	if (editPickedFile.value) {
		await uploadSelectedEditFile()
	}

	await updateSessionResource.submit({
		session: editSessionForm.id,
		data: {
			session_name: editSessionForm.session_name.trim(),
			subject: editSessionForm.subject,
			level: editSessionForm.level,
			course: editSessionModel.value.course || null,
			batch: editSessionModel.value.batch || null,
			ai_notes: editSessionForm.ai_notes,
			rubric: editSessionForm.rubric || null,
			rubric_template: editSessionForm.rubric_template || null,
			status: editSessionForm.status,
		},
	})

	showEditSessionModal.value = false
	await refreshSessions()
}

async function deleteSession(sessionId) {
	if (!sessionId) return
	const confirmed = window.confirm(
		__('Delete this grading session? All submissions in this session will also be deleted.')
	)
	if (!confirmed) return

	await deleteSessionResource.submit({ session: sessionId })
	await refreshSessions()
}

async function proceed() {
	if (props.type !== 'exam' && !selectedResource.value) return;
	
	if (selectedSession.value) {
		enterSession(selectedSession.value)
		return
	}

	// Create a dynamic session if none selected but resource is provided
	const quickSessionName = `Quick Session - ${new Date().toLocaleDateString()}`
	const res = await createSessionResource.submit({
		data: {
			session_name: quickSessionName,
			grading_type: props.type === 'exam' ? 'Exam' : (props.type === 'test' ? 'Test' : 'Homework'),
			subject: selectedSubject.value,
			level: selectedLevel.value,
			reference_doc_type: props.type === 'test' ? 'LMS Quiz' : 'LMS Assignment',
			reference_doc: selectedResource.value || null,
			ai_notes: aiNotes.value,
			status: 'Open',
		}
	})
	
	if (res) {
		const sessionDoc = typeof res === 'string'
			? { route_slug: toRouteSlug(quickSessionName) }
			: res
		enterSession(sessionDoc.route_slug || toRouteSlug(quickSessionName))
	}
}
</script>

<style scoped>
.session-list {
	width: 100%;
	max-height: 50vh;
	box-sizing: border-box;
	overflow-y: auto;
	overflow-x: hidden;
	overscroll-behavior: contain;
	scrollbar-gutter: stable;
}

.session-list::-webkit-scrollbar {
	width: 6px;
}

.session-list::-webkit-scrollbar-track {
	background: transparent;
}

.session-list::-webkit-scrollbar-thumb {
	background: #e2e8f0;
	border-radius: 10px;
}

.session-list::-webkit-scrollbar-thumb:hover {
	background: #cbd5e1;
}

.session-item {
	min-height: 4.5rem;
	max-width: 100%;
	overflow: hidden;
}

@media (max-width: 640px) {
	.session-list {
		/* Show exactly 3 rows on mobile: 3 items + 2 gaps */
		max-height: calc((4.25rem * 3) + (0.5rem * 2));
	}

	.session-item {
		min-height: 4.25rem;
	}
}
</style>
