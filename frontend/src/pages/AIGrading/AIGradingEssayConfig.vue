<template>
	<section class="space-y-6">
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

		<!-- Session Panel (only for exam type) -->
		<div
			v-if="type === 'exam'"
			class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
		>
			<div class="mb-4 space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm font-semibold text-gray-800">{{ __('Grading Sessions') }}</span>
					<span
						class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700"
					>
						{{ __('Exam requires session') }}
					</span>
				</div>
				<div class="relative">
					<input
						v-model="sessionSearchQuery"
						class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#2d6a4f] focus:outline-none"
						:placeholder="__('Search session by ID or name...')"
					/>
					<span class="absolute right-3 top-2.5 text-xs text-gray-400">🔍</span>
				</div>
			</div>

			<div 
				class="space-y-2 max-h-[420px] overflow-y-auto pr-1 scroll-smooth"
				@scroll="onScroll"
			>
				<div
					v-if="!sessions.length"
					class="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-gray-500"
				>
					{{ __('No grading sessions found.') }}
				</div>
				<div
					v-for="session in sessions"
					:key="session.id"
					class="group flex items-center gap-3 rounded-lg border p-3 transition-all border-gray-100 bg-gray-50 shadow-sm"
					:class="accentClasses.hoverSession"
				>
					<div
						class="h-2 w-2 rounded-full flex-shrink-0"
						:style="{ background: session.color }"
					/>
					<div class="flex-1">
						<div class="text-sm font-medium text-gray-800 transition-colors" :class="'group-hover:' + accentClasses.text">{{ session.name }}</div>
						<div class="text-[11px] text-gray-400 font-mono">{{ session.meta }}</div>
					</div>
					<div class="flex items-center gap-1.5 ml-auto">
						<button
							class="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-100"
							@click.stop="openSession(session)"
						>
							{{ session.status === 'Open' ? __('Open') : (session.progress || __('Open')) }}
						</button>
						<button
							class="rounded-md border border-[#2d6a4f]/20 bg-[#2d6a4f]/5 px-2.5 py-1 text-[11px] font-bold text-[#2d6a4f] shadow-sm transition-all hover:bg-[#2d6a4f]/10"
							@click.stop="viewSessionStats(session)"
						>
							{{ __('Statistics') }}
						</button>
						<button
							class="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-100"
							@click.stop="openEditSessionModal(session.id)"
						>
							{{ __('Edit') }}
						</button>
						<button
							class="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-100"
							@click.stop="deleteSession(session.id)"
						>
							{{ __('Delete') }}
						</button>
					</div>
				</div>
				
				<!-- Loading Indicator -->
				<div v-if="sessionsResource.loading" class="py-4 text-center">
					<div class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-emerald-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
					<span class="ml-2 text-xs text-gray-400">{{ __('Loading more...') }}</span>
				</div>
				
				<!-- End of list message -->
				<div v-if="!hasMoreSessions && allSessions.length > 5" class="py-4 text-center text-[10px] text-gray-400 uppercase tracking-widest">
					{{ __('End of list') }}
				</div>
			</div>

			<button
				class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-200 bg-transparent py-2.5 text-sm font-medium transition-all"
				:class="[accentClasses.text, accentClasses.hoverSession]"
				@click="showNewSessionModal = true"
			>
				+ {{ __('Create new session') }}
			</button>
		</div>

		<!-- System Resource Panel (Tests & Assignments) -->
		<div
			v-if="type === 'test' || type === 'hw'"
			class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4"
		>
			<div class="flex items-center justify-between">
				<span class="text-sm font-semibold text-gray-800">
					{{ type === 'test' ? __('Select Quiz') : __('Select Assignment') }}
				</span>
				<span
					class="rounded-full px-2 py-0.5 text-[10px] font-medium"
					:class="[type === 'test' ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-[#b45309]/10 text-[#b45309]']"
				>
					{{ type === 'test' ? __('System Quizzes') : __('Text Assignments Only') }}
				</span>
			</div>

			<!-- Resource List Loading state -->
			<div v-if="(type === 'test' && quizzes.list.loading) || (type === 'hw' && assignments.list.loading)" class="p-4 text-center text-sm text-gray-500">
				{{ __('Loading resources...') }}
			</div>

			<!-- Select Quiz dropdown/list -->
			<div v-else-if="type === 'test'">
				<select
					v-model="selectedResource"
					class="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 transition-colors focus:border-[#1d4ed8] focus:bg-white focus:outline-none"
				>
					<option value="" disabled>{{ __('Choose a quiz from the system...') }}</option>
					<option v-for="r in quizzes.data" :key="r.name" :value="r.name">{{ r.title || r.name }}</option>
				</select>
			</div>

			<!-- Select Assignment dropdown/list -->
			<div v-else-if="type === 'hw'">
				<select
					v-model="selectedResource"
					class="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 transition-colors focus:border-[#b45309] focus:bg-white focus:outline-none"
				>
					<option value="" disabled>{{ __('Choose a text assignment from the system...') }}</option>
					<option v-for="r in assignments.data" :key="r.name" :value="r.name">{{ r.title || r.name }}</option>
				</select>
			</div>

			<!-- AI Grading Notes -->
			<div class="mt-5 border-t border-gray-100 pt-4">
				<label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
					{{ __('AI Grading Notes') }} <span class="font-normal lowercase text-gray-400">({{ __('Optional') }})</span>
				</label>
				<textarea
					v-model="aiNotes"
					class="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed placeholder:text-gray-400 transition-colors focus:bg-white focus:outline-none"
					:class="type === 'test' ? 'focus:border-[#1d4ed8]' : 'focus:border-[#b45309]'"
					rows="3"
					:placeholder="__('Enter specific instructions, deductions, focal points for AI to evaluate...')"
				></textarea>
			</div>
		</div>

		<!-- Proceed button (only if not exam, or if they just want to proceed with a new auto-session) -->
		<button
			v-if="type !== 'exam'"
			class="w-full rounded-xl px-4 py-3.5 text-base font-semibold transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
			:class="[accentClasses.button, accentClasses.hover]"
			:style="accentClasses.buttonStyle"
			:disabled="!selectedResource && type !== 'exam'"
			@click="proceed"
		>
			{{ __('Start Grading') }} →
		</button>

		<!-- New Session Modal -->
		<Dialog v-model="showNewSessionModal" :title="__('Create New Session')">
			<template #body-content>
				<div class="space-y-4 p-4">
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Session Name (Tên phiên)') }}</label>
						<Input
							type="text"
							v-model="newSession.name"
							:placeholder="__('e.g. Midterm II — 2024–2025')"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Class (Lớp)') }}</label>
						<Input
							type="text"
							v-model="newSession.className"
							:placeholder="__('e.g. 12A1, 12A2')"
						/>
					</div>
					<div class="flex flex-col gap-1 mt-2">
						<label class="text-sm font-medium text-gray-700">{{ __('Upload File Đề bài & Đáp án') }}</label>
						<input type="file" ref="fileInput" class="hidden" accept=".pdf,.doc,.docx" @change="handleFileChange" />
						<div
							class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-all cursor-pointer"
							:class="accentClasses.hoverSession"
							@click="$refs.fileInput.click()"
						>
							<span class="mb-2 text-2xl text-gray-400">📄</span>
							<span v-if="uploadedFileName" class="text-sm font-bold text-center" :class="accentClasses.text">{{ uploadedFileName }}</span>
							<span v-else class="text-xs font-medium text-gray-600 text-center">{{ __('Kéo thả hoặc click để upload file') }}</span>
							<span class="mt-1 text-[10px] text-gray-400">{{ __('Hỗ trợ: PDF, DOCX (Tối đa 10MB)') }}</span>
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
						<label class="text-sm font-medium text-gray-700">{{ __('Level') }}</label>
						<Input
							type="text"
							v-model="editSessionForm.level"
							:placeholder="__('Enter level')"
						/>
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
import { 
	Button, 
	Dialog, 
	Input, 
	createListResource, 
	createResource 
} from 'frappe-ui'

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
		},
		test: {
			chipSelected: 'border-[#1d4ed8] bg-[#1d4ed8]/10 text-[#1d4ed8] shadow-[0_0_12px_rgba(29,78,216,0.15)]',
			text: 'text-[#1d4ed8]',
			textLight: 'text-[#1d4ed8]/80',
			button: 'text-white transition-all',
			buttonStyle: 'background-color: #1d4ed8;',
			hoverSession: 'hover:border-[#1d4ed8]/50 hover:bg-[#1d4ed8]/5',
		},
		hw: {
			chipSelected: 'border-[#b45309] bg-[#b45309]/10 text-[#b45309] shadow-[0_0_12px_rgba(180,83,9,0.15)]',
			text: 'text-[#b45309]',
			textLight: 'text-[#b45309]/80',
			button: 'text-white transition-all',
			buttonStyle: 'background-color: #b45309;',
			hoverSession: 'hover:border-[#b45309]/50 hover:bg-[#b45309]/5',
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
	{ value: 'uni', display: 'ĐH', label: __('University') },
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
	url: 'lms.lms.api.get_ai_grading_sessions',
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

onMounted(() => {
	refreshSessions()
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
const newSession = reactive({ name: '', className: '', notes: '' })
const fileInput = ref(null)
const uploadedFileName = ref('')
const showEditSessionModal = ref(false)
const editSessionForm = reactive({
	id: '',
	session_name: '',
	subject: '',
	level: '',
	ai_notes: '',
	status: 'Open',
})

const createSessionResource = createResource({
	url: 'lms.lms.api.create_ai_grading_session',
})
const sessionDetailResource = createResource({
	url: 'lms.lms.api.get_ai_grading_session_detail',
})
const updateSessionResource = createResource({
	url: 'lms.lms.api.update_ai_grading_session',
})
const deleteSessionResource = createResource({
	url: 'lms.lms.api.delete_ai_grading_session',
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

async function createSession() {
	if (!newSession.name) return

	const res = await createSessionResource.submit({
		data: {
			session_name: newSession.name,
			grading_type: props.type === 'exam' ? 'Exam' : (props.type === 'test' ? 'Test' : 'Homework'),
			subject: selectedSubject.value,
			level: selectedLevel.value,
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
const selectedResource = ref('')
const aiNotes = ref('')

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

function viewSessionStats(session) {
	router.push({
		name: 'AIGradingSessionStatistics',
		params: {
			type: props.type,
			sessionSlug: session.routeSlug,
		},
	})
}

async function openEditSessionModal(sessionId) {
	const res = await sessionDetailResource.submit({ session: sessionId })
	if (!res) return

	editSessionForm.id = res.name || sessionId
	editSessionForm.session_name = res.session_name || ''
	editSessionForm.subject = res.subject || ''
	editSessionForm.level = res.level || ''
	editSessionForm.ai_notes = res.ai_notes || ''
	editSessionForm.status = res.status || 'Open'
	showEditSessionModal.value = true
}

async function saveSessionEdit() {
	if (!editSessionForm.id || !editSessionForm.session_name?.trim()) return

	await updateSessionResource.submit({
		session: editSessionForm.id,
		data: {
			session_name: editSessionForm.session_name.trim(),
			subject: editSessionForm.subject,
			level: editSessionForm.level,
			ai_notes: editSessionForm.ai_notes,
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
