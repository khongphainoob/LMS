<template>
	<section class="space-y-12 animate-in fade-in duration-700">
		<!-- Header Section - Elegant White -->
		<div class="flex flex-col lg:flex-row items-center justify-between gap-10">
			<div class="flex items-center gap-6">
				<button
					class="group flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-105 active:scale-95"
					@click="router.push({ name: 'AIIntegration' })"
				>
					<icons.ChevronLeft class="h-6 w-6 text-slate-600 stroke-[3px]" />
				</button>
				<div>
					<h2 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase">{{ __('Chấm trắc nghiệm AI') }}</h2>
					<p class="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mt-1">{{ __('Tối ưu hóa quy trình chấm điểm MCQ với thị giác máy tính.') }}</p>
				</div>
			</div>
			<button 
				@click="router.push({ name: 'AIGradingHelp' })"
				class="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest hover:border-amber-400 transition-all shadow-xl active:scale-95"
			>
				<icons.BookOpen class="h-4 w-4" />
				{{ __('Hướng dẫn sử dụng') }}
			</button>
		</div>

		<!-- Action Selection - Floating Cards -->
		<div class="grid grid-cols-1 gap-10 sm:grid-cols-2">
			<button
				@click="openCreator('image')"
				class="group relative overflow-hidden rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-left transition-all hover:border-amber-500 hover:shadow-[0_40px_80px_rgba(245,158,11,0.1)] cursor-pointer"
			>
				<div class="relative z-10">
					<div class="mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200 group-hover:scale-110 transition-all">
						<icons.Camera class="h-12 w-12 stroke-[2.5px]" />
					</div>
					<h3 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">{{ __('Chấm qua Camera / Ảnh') }}</h3>
					<p class="text-[15px] text-slate-500 font-bold leading-relaxed max-w-sm">{{ __('Tự động nhận diện bài làm từ ảnh chụp hoặc file PDF để chấm điểm tức thì.') }}</p>
				</div>
				<div class="absolute -right-10 -bottom-10 h-64 w-64 bg-amber-500/5 rounded-full blur-[80px]"></div>
			</button>

			<button
				@click="openCreator('format')"
				class="group relative overflow-hidden rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-left transition-all hover:border-teal-500 hover:shadow-[0_40px_80px_rgba(20,184,166,0.1)] cursor-pointer"
			>
				<div class="relative z-10">
					<div class="mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-lg shadow-teal-200 group-hover:scale-110 transition-all">
						<icons.LayoutTemplate class="h-12 w-12 stroke-[2.5px]" />
					</div>
					<h3 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">{{ __('Nhập Form Đáp án') }}</h3>
					<p class="text-[15px] text-slate-500 font-bold leading-relaxed max-w-sm">{{ __('Dành cho chấm điểm thủ công hoặc các cấu trúc đề thi tùy chỉnh không qua hình ảnh.') }}</p>
				</div>
				<div class="absolute -right-10 -bottom-10 h-64 w-64 bg-teal-500/5 rounded-full blur-[80px]"></div>
			</button>
		</div>

		<!-- Recent Sessions -->
		<div class="rounded-[4rem] bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 shadow-2xl shadow-slate-200/50 p-10 sm:p-16 backdrop-blur-xl">
			<div class="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16">
				<div class="flex items-center gap-4">
					<div class="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-lg">
						<icons.History class="h-6 w-6" />
					</div>
					<h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ __('Phiên chấm bài gần đây') }}</h3>
				</div>
				<div class="relative w-full lg:w-[35rem]">
					<icons.Search class="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
					<input 
						v-model="sessionSearchQuery"
						type="text"
						class="w-full pl-16 pr-6 py-6 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-base font-bold text-slate-900 dark:text-white outline-none focus:border-amber-400 transition-all shadow-inner"
						:placeholder="__('Tìm kiếm phiên chấm...')"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6">
				<div
					v-if="!sessions.length && !sessionsResource.loading"
					class="flex flex-col items-center justify-center py-24 text-center"
				>
					<icons.FolderOpen class="h-16 w-16 text-slate-200 mb-6" />
					<p class="text-lg font-black text-slate-400 uppercase tracking-widest">{{ __('Chưa có dữ liệu phiên chấm MCQ.') }}</p>
				</div>

				<div
					v-for="session in filteredSessions"
					:key="session.name"
					class="group flex flex-col sm:flex-row items-center gap-10 rounded-[3rem] border border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 transition-all hover:border-amber-400 hover:shadow-xl"
				>
					<div class="h-20 w-20 flex-shrink-0 flex items-center justify-center rounded-[1.5rem] bg-slate-100 dark:bg-slate-900 text-3xl font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-amber-400 transition-all shadow-inner">
						{{ session.session_name?.[0] || 'S' }}
					</div>
					<div class="flex-1 min-w-0">
						<h4 class="text-2xl font-black text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors mb-2">
							{{ session.session_name }}
						</h4>
						<div class="flex flex-wrap items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
							<span class="flex items-center gap-3"><icons.Users class="h-4 w-4" /> {{ session.class_name || __('Lớp học') }}</span>
							<span class="flex items-center gap-3"><icons.Calendar class="h-4 w-4" /> {{ session.modified_display }}</span>
						</div>
					</div>
					<div class="flex items-center gap-5">
						<button
							@click="openWorkspace(session)"
							class="px-10 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-900 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 hover:shadow-xl active:scale-95 shadow-lg"
						>
							{{ __('Mở phiên') }}
						</button>
						<button
							@click="deleteSession(session.name)"
							class="p-4 rounded-2xl border-2 border-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95"
						>
							<icons.Trash2 class="h-5 w-5" />
						</button>
					</div>
				</div>

				<div v-if="sessionsResource.loading" class="py-24 text-center">
					<icons.RefreshCw class="h-10 w-10 text-amber-500 animate-spin" />
				</div>
			</div>
		</div>

		<!-- Creation Modals -->
		<Dialog v-model="showCreator" :options="{ title: '', size: 'xl' }">
			<template #body>
				<div class="p-12 bg-white dark:bg-slate-900 rounded-[4rem]">
					<div class="mb-12 text-center">
						<div class="mx-auto h-20 w-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-amber-400 mb-6 shadow-2xl">
							<icons.Plus class="h-10 w-10" />
						</div>
						<h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{{ creatorTitle }}</h2>
					</div>
					<component 
						:is="creatorComponent" 
						@cancel="showCreator = false" 
					/>
				</div>
			</template>
		</Dialog>
	</section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog, createResource } from 'frappe-ui'
import * as icons from 'lucide-vue-next'
import MCQImageGrading from '@/components/AIGrading/MCQImageGrading.vue'
import MCQFormatGrading from '@/components/AIGrading/MCQFormatGrading.vue'

const router = useRouter()
const sessionSearchQuery = ref('')
const showCreator = ref(false)
const creatorType = ref('image')

const sessionsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_sessions',
})

onMounted(() => {
	sessionsResource.submit({
		grading_type: 'MCQ'
	})
})

const sessions = computed(() => sessionsResource.data || [])

const filteredSessions = computed(() => {
	if (!sessionSearchQuery.value) return sessions.value
	const q = sessionSearchQuery.value.toLowerCase()
	return sessions.value.filter(s => 
		(s.session_name || '').toLowerCase().includes(q) || 
		(s.class_name || '').toLowerCase().includes(q)
	)
})

const creatorTitle = computed(() => {
	return creatorType.value === 'image' ? __('Khởi tạo Chấm MCQ qua Ảnh') : __('Khởi tạo Chấm MCQ qua Form')
})

const creatorComponent = computed(() => {
	return creatorType.value === 'image' ? MCQImageGrading : MCQFormatGrading
})

function openCreator(type) {
	creatorType.value = type
	showCreator.value = true
}

function openWorkspace(session) {
	const sessionSlug = session.route_slug || session.name
	router.push({
		name: 'MCQGradingWorkspace',
		params: { sessionSlug }
	})
}

async function deleteSession(name) {
	if (!confirm(__('Bạn có chắc chắn muốn xóa phiên này?'))) return
	await createResource({
		url: 'frappe.client.delete',
		auto: false
	}).submit({
		doctype: 'AI Grading Session',
		name: name
	})
	sessionsResource.submit({ grading_type: 'MCQ' })
}
</script>
