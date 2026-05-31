<template>
  <div class="min-h-screen bg-[#fdfcf9] dark:bg-[#0a0a0a] flex flex-col transition-colors duration-300">
    <header class="sticky top-0 z-30 border-b border-amber-100/50 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-3 backdrop-blur-md sm:px-6 shadow-sm">
      <div class="flex items-center justify-between mx-auto w-full max-w-[1400px]">
        <div class="flex items-center gap-4">
          <button class="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" @click="$router.push({ name: 'AIIntegration' })">
            <icons.ArrowLeft class="h-4 w-4" />
            {{ __('Back') }}
          </button>
          <div class="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {{ __('Socratic AI Tutor') }}
            </h1>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="showNewSessionModal = true" class="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-amber-200 transition-all hover:bg-amber-600 hover:scale-[1.02] active:scale-95">
            <icons.Plus class="h-4 w-4 stroke-[3px]" />
            {{ __('Starting a NEW TGFR session') }}
          </button>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto overflow-x-hidden">
      <!-- DASHBOARD VIEW -->
      <main class="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
        <!-- Welcome Hero -->
        <section class="relative mb-12 rounded-[2.5rem] bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-8 sm:p-12 overflow-hidden shadow-2xl shadow-orange-200 dark:shadow-none">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div class="max-w-xl">
              <span class="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md mb-4">
                {{ __('AI personal tutor') }}
              </span>
              <h2 class="text-4xl sm:text-5xl font-black text-white leading-[1.1] mb-4">
                {{ __('Knowledge Discovery') }} <br />
                <span class="text-slate-900 underline decoration-white/30 decoration-8 underline-offset-4">
                  {{ __('CRITICAL THINKING') }}
                </span>
              </h2>
              <p class="text-lg text-white/90 font-medium">
                {{ __('The Socratic Tutor system doesn\'t just provide answers, we help you find your own by providing insight and analysis.') }}
              </p>
            </div>
            <div class="flex flex-wrap gap-4">
              <div v-for="stat in stats" :key="stat.label" class="flex flex-col items-center justify-center rounded-3xl bg-white/10 p-6 backdrop-blur-xl border border-white/20 w-32 shadow-lg">
                <span class="text-3xl font-black text-white">{{ stat.value }}</span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-white/70 mt-1 text-center leading-tight">
                  {{ stat.label }}
                </span>
              </div>
            </div>
          </div>
          <div class="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
          <div class="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-slate-900/10 blur-2xl"></div>
        </section>

        <!-- Session List Section -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
              <icons.BookOpen class="h-5 w-5" />
            </div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ __('Recent Discussion Sessions') }}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative">
              <icons.Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" v-model="searchQuery" :placeholder="__('Find lessons...')" class="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-400 text-sm w-48 transition-all" />
            </div>
            <button @click="sessionsResource.fetch()" class="p-2 rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm transition-all text-slate-500">
              <icons.RefreshCw :class="['h-4 w-4', sessionsResource.loading && 'animate-spin']" />
            </button>
          </div>
        </div>

        <div v-if="!sessions.length && !sessionsResource.loading" class="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/50 p-20 text-center">
          <div class="mb-6 relative">
            <div class="absolute inset-0 bg-amber-400 blur-2xl opacity-20 animate-pulse"></div>
            <icons.MessageSquarePlus class="relative h-16 w-16 text-amber-500" />
          </div>
          <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {{ __('No version found') }}
          </h4>
          <p class="text-slate-500 max-w-xs mb-8">
            {{ __('Start the first lesson or try searching with a different keyword.') }}
          </p>
          <button @click="showNewSessionModal = true" class="rounded-2xl bg-white px-8 py-3 font-bold text-slate-900 shadow-xl transition-transform hover:scale-105 active:scale-95">
            {{ __('Start Now') }}
          </button>
        </div>

        <div v-else>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div v-for="session in sessions" :key="session.session_key" class="group relative flex flex-col rounded-[2rem] border border-slate-100 bg-white p-2 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-100/50 cursor-pointer overflow-hidden" @click="selectSession(session)">
              <div class="relative h-44 w-full rounded-[1.7rem] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                <img v-if="session.thumbnail" :src="session.thumbnail" class="h-full w-full object-cover transition-transform group-hover:scale-110" />
                <div v-else class="flex h-full w-full items-center justify-center opacity-30">
                  <icons.BrainCircuit class="h-12 w-12 text-slate-400" />
                </div>
                <div class="absolute top-3 right-3 flex gap-2">
                  <span class="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 shadow-sm backdrop-blur-sm">
                    {{ session.message_count }} {{ __('MSGS') }}
                  </span>
                </div>
              </div>
              <div class="p-4 pt-5">
                <div class="mb-1 flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
                    {{ session.course || __('General knowledge') }}
                  </span>
                  <span class="text-[10px] font-medium text-slate-400">
                    {{ formatDate(session.last_active) }}
                  </span>
                </div>
                <h4 class="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-amber-600 transition-colors">
                  {{ session.lesson || session.title || __('General Discussion') }}
                </h4>
                <div class="flex items-center justify-between mt-auto">
                  <div class="flex -space-x-2">
                    <div class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 border-2 border-white text-[10px] font-bold text-white shadow-sm">AI</div>
                  </div>
                  <button @click.stop="confirmDeleteSession(session)" class="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <icons.Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Xem thêm (Load more) button -->
          <div v-if="hasMoreSessions" class="mt-10 flex justify-center">
            <button @click="loadMoreSessions" class="rounded-xl border-2 border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-600 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm">
              {{ __('See also') }}
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- New Session Modal -->
    <Dialog v-model="showNewSessionModal" :options="{ title: '', size: 'xl' }">
      <template #body>
        <div class="px-8 py-10 bg-white rounded-[2.5rem] overflow-hidden relative">
          <div class="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-amber-400/10 rounded-full blur-3xl"></div>
          <div class="relative z-10">
            <div class="mb-10 text-center">
              <div class="mx-auto h-20 w-20 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white mb-6 shadow-2xl shadow-orange-200">
                <icons.Rocket class="h-10 w-10" />
              </div>
              <h2 class="text-3xl font-black text-slate-900 leading-tight mb-2">
                {{ __('Start a new journey') }}
              </h2>
              <p class="text-slate-500">
                {{ __('Upload assignments and rubrics so AI tutors have enough data to support you.') }}
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div class="space-y-6">
                <!-- Image Upload (multiple) -->
                <div class="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-400 transition-all group">
                  <input type="file" ref="modalImageInput" @change="handleModalFileUpload($event, 'image')" accept="image/*" multiple class="hidden" />
                  <button @click="$refs.modalImageInput.click()" class="w-full flex flex-col items-center gap-3">
                    <div class="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                      <icons.ImagePlus class="h-6 w-6" />
                    </div>
                    <span class="text-sm font-bold text-slate-900">
                      {{ attachedImagesInModal.length ? `${attachedImagesInModal.length} ` + __('images selected') : __('Upload a photo of your work') }}
                    </span>
                  </button>
                  <!-- Preview thumbnails -->
                  <div v-if="attachedImagesInModal.length" class="mt-4 grid grid-cols-4 gap-2">
                    <div v-for="(file, idx) in attachedImagesInModal" :key="idx" class="relative h-16 w-16 rounded overflow-hidden border border-slate-200">
                      <img :src="file.preview" class="h-full w-full object-cover" />
                      <button @click.stop="removeImage(idx)" class="absolute top-0 right-0 bg-white/70 rounded-full p-0.5 text-xs">✕</button>
                    </div>
                  </div>
                </div>
                <!-- Rubric Upload -->
                <div class="p-6 rounded-[2rem] border border-slate-100 bg-white hover:shadow-xl transition-all group">
                  <input type="file" ref="modalRubricInput" @change="handleModalFileUpload($event, 'rubric')" accept=".txt,.pdf,.doc,.docx" class="hidden" />
                  <button @click="$refs.modalRubricInput.click()" class="w-full flex flex-col items-center gap-3">
                    <div class="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:text-indigo-600 transition-colors">
                      <icons.FileText class="h-6 w-6" />
                    </div>
                    <span class="text-sm font-bold text-slate-900">
                      {{ attachedRubricInModal ? attachedRubricInModal.name : __('Download Rubric Scoring') }}
                    </span>
                  </button>
                </div>
              </div>
              <div class="space-y-6">
                <div class="space-y-4">
                  <CourseBatchSelector v-model="courseBatchModel" :context="aiContext" />
                  <div v-if="courseBatchModel.course">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                      {{ __('Specific Lessons') }}
                    </label>
                    <select v-model="newSessionForm.lesson" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none focus:border-amber-400 focus:bg-white transition-all">
                      <option :value="null">{{ __('Entire Course') }}</option>
                      <option v-for="l in lessonsResource.data" :key="l.name" :value="l.name">{{ l.title }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-12 flex gap-4">
              <button @click="showNewSessionModal = false" class="flex-1 rounded-2xl border border-slate-200 py-4 font-bold text-slate-500 hover:bg-slate-50 transition-all">
                {{ __('Disposal') }}
              </button>
              <button @click="startSession" :disabled="!attachedImagesInModal.length || sessionsResource.loading" class="flex-1 rounded-2xl bg-slate-900 py-4 font-bold text-amber-400 shadow-2xl transition-all hover:bg-slate-800 active:scale-95">
                {{ __('Start learning') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePageMeta, createResource, Dialog } from 'frappe-ui'
import { sessionStore } from '@/stores/session'
import dayjs from '@/utils/dayjs'
import * as icons from 'lucide-vue-next'
import CourseBatchSelector from '@/components/ai/CourseBatchSelector.vue'

const router = useRouter()
const { brand } = sessionStore()

// Dashboard stats
const stats = [
  { label: __('Session'), value: '12' },
  { label: __('Increased capacity'), value: '+14%' },
  { label: __('Good evidence'), value: '85%' },
  { label: __('Open-mindedness'), value: 'Level 4' }
]

const showNewSessionModal = ref(false)
const attachedImagesInModal = ref([]) // [{file:File, preview:string}]
const attachedRubricInModal = ref(null)

const newSessionForm = reactive({
  lesson: null
})

const courseBatchModel = ref({ mode: 'course', batch: null, course: null })

const searchQuery = ref('')
const sessionLimit = ref(5)
let debounceTimeout = null

const sessionsResource = createResource({
  url: 'lms.lms.services.socratic.api.get_sessions',
  auto: true,
  params: {
    start: 0,
    limit: sessionLimit.value,
    search_term: searchQuery.value
  }
})

const sessions = computed(() => sessionsResource.data?.sessions || [])
const hasMoreSessions = computed(() => sessionsResource.data?.has_more || false)

watch([searchQuery, sessionLimit], () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    sessionsResource.params.limit = sessionLimit.value
    sessionsResource.params.search_term = searchQuery.value
    sessionsResource.fetch()
  }, 300)
})

function loadMoreSessions() {
  sessionLimit.value += 5
}

const coursesResource = createResource({
  url: 'lms.lms.services.course_batch_resolver.get_selection_context',
  auto: true
})

const aiContext = computed(() => {
  return coursesResource.data || { courses: [], batches: [] }
})

const lessonsResource = createResource({
  url: 'frappe.client.get_list',
  params: { doctype: 'LMS Lesson', fields: ['name', 'title'], filters: {} },
  auto: false
})

watch(() => courseBatchModel.value.course, (newCourse) => {
  newSessionForm.lesson = null
  if (newCourse) {
    lessonsResource.params.filters = { course: newCourse }
    lessonsResource.fetch()
  } else {
    lessonsResource.data = []
  }
})

function formatDate(date) {
  if (!date) return ''
  return dayjs(date).format('DD MMM')
}

function handleModalFileUpload(event, type) {
  const file = event.target.files[0]
  if (!file) return
  if (type === 'image') {
    const reader = new FileReader()
    reader.onload = e => {
      attachedImagesInModal.value.push({ file, preview: e.target.result })
    }
    reader.readAsDataURL(file)
  } else if (type === 'rubric') {
    attachedRubricInModal.value = file
  }
}

function removeImage(idx) {
  attachedImagesInModal.value.splice(idx, 1)
}

function selectSession(session) {
  router.push({ name: 'SocraticTutorWorkspace', params: { sessionKey: session.session_key } })
}

function confirmDeleteSession(session) {
  if (confirm(__('Are you sure you want to delete this session?'))) {
    createResource({
      url: 'lms.lms.services.socratic.api.delete_session',
      params: { session_key: session.session_key },
      onSuccess: () => sessionsResource.fetch()
    }).submit()
  }
}

async function startSession() {
  const csrfToken = window.csrf_token || document.cookie.match(/csrf_token=([^;]+)/)?.[1] || ''
  
  let uploadedImageUrls = []
  for (const item of attachedImagesInModal.value) {
    const fd = new FormData()
    fd.append('file', item.file, item.file.name)
    fd.append('is_private', 1)
    try {
      const res = await fetch('/api/method/upload_file', { method: 'POST', headers: {'X-Frappe-CSRF-Token': csrfToken}, body: fd })
      const json = await res.json()
      if (json.message && json.message.file_url) uploadedImageUrls.push(json.message.file_url)
    } catch (e) { console.error("Image upload failed", e) }
  }

  let uploadedRubricUrl = ''
  if (attachedRubricInModal.value) {
    const fd = new FormData()
    fd.append('file', attachedRubricInModal.value, attachedRubricInModal.value.name)
    fd.append('is_private', 1)
    try {
      const res = await fetch('/api/method/upload_file', { method: 'POST', headers: {'X-Frappe-CSRF-Token': csrfToken}, body: fd })
      const json = await res.json()
      if (json.message && json.message.file_url) uploadedRubricUrl = json.message.file_url
    } catch (e) { console.error("Rubric upload failed", e) }
  }

  try {
    const res = await fetch('/api/method/lms.lms.services.socratic.api.create_session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frappe-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        selection_mode: courseBatchModel.value.mode,
        course: courseBatchModel.value.course || '',
        batch: courseBatchModel.value.batch || '',
        lesson: newSessionForm.lesson || '',
        image_url: uploadedImageUrls.length ? uploadedImageUrls[0] : '',
        image_urls: uploadedImageUrls.length ? JSON.stringify(uploadedImageUrls) : '',
        rubric_url: uploadedRubricUrl || ''
      })
    })
    const json = await res.json()
    if (json.message) {
      showNewSessionModal.value = false
      attachedImagesInModal.value = []
      attachedRubricInModal.value = null
      courseBatchModel.value.course = null
      courseBatchModel.value.batch = null
      newSessionForm.lesson = null
      sessionsResource.fetch()
      router.push({ 
        name: 'SocraticTutorWorkspace', 
        params: { sessionKey: json.message.session_key },
        query: { request_id: json.message.request_id }
      })
    }
  } catch (err) {
    console.error('startSession error', err)
  }
}

usePageMeta(() => ({ title: `${__('Socratic Tutor')} - ${brand.value}` }))
</script>

<style scoped>
/* Animations */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
