<template>
  <div class="min-h-screen bg-[#fdfcf9] dark:bg-[#0a0a0a] flex flex-col transition-colors duration-300">
    <header class="sticky top-0 z-30 border-b border-amber-100/50 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-3 backdrop-blur-md sm:px-6 shadow-sm">
      <div class="flex items-center justify-between mx-auto w-full max-w-[1400px]">
        <div class="flex items-center gap-4">
          <button
            class="group flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:bg-amber-50"
            @click="$router.push({ name: 'SocraticTutor' })"
          >
            <icons.ChevronLeft class="h-5 w-5 text-amber-600 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div class="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {{ currentSessionTitle }}
            </h1>
            <div class="flex items-center gap-2 text-[10px] font-medium text-amber-600 uppercase tracking-widest">
              <span class="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              {{ activePhaseLabel }}
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500 mr-2">{{ __('Tiến trình:') }}</span>
            <div class="flex gap-1">
              <div v-for="i in 3" :key="i" 
                class="h-1.5 w-8 rounded-full transition-all duration-500"
                :class="i <= activePhase ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 mx-auto w-full max-w-[1400px] h-full flex flex-col lg:flex-row overflow-hidden bg-white/30 backdrop-blur-xl">
      <!-- Left Column: Work & Rubric Review -->
      <section class="flex flex-col w-full lg:w-[45%] h-full border-r border-slate-100/50 p-4 sm:p-6 space-y-6 overflow-y-auto">
        <div class="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <icons.FileText class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-tight">{{ __('Tài liệu đang xét') }}</h3>
              <p class="text-xs text-slate-500">{{ currentSessionTitle }}</p>
            </div>
          </div>
          
          <div v-if="lastSessionImage" class="relative group rounded-2xl overflow-hidden border border-slate-200 mb-4 cursor-zoom-in">
            <img :src="lastSessionImage" class="w-full h-auto object-cover max-h-[400px] transition-transform group-hover:scale-105" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button class="bg-white rounded-full p-3 text-slate-900 shadow-xl"><icons.Maximize2 class="h-5 w-5"/></button>
            </div>
          </div>

          <div class="space-y-3">
            <div v-if="lastSessionRubric" class="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{{ __('Tiêu chí chấm điểm') }}</span>
                <icons.CheckCircle2 class="h-4 w-4 text-indigo-500" />
              </div>
              <p class="text-xs font-bold text-slate-900 truncate">{{ lastSessionRubric }}</p>
            </div>
          </div>
        </div>

        <!-- AI Knowledge Map -->
        <div class="rounded-3xl bg-slate-900 p-6 text-white shadow-2xl shadow-slate-200 overflow-hidden relative">
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-6">
              <icons.Activity class="h-5 w-5 text-amber-400" />
              <h3 class="text-sm font-black uppercase tracking-widest">{{ __('Phân tích chuyên sâu') }}</h3>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div v-for="insight in aiInsights" :key="insight.label" class="p-4 rounded-2xl bg-white/10 border border-white/10">
                <div class="text-xl font-black mb-1" :class="insight.color">{{ insight.value }}</div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-white/50">{{ insight.label }}</div>
              </div>
            </div>

            <div class="space-y-4">
              <h4 class="text-xs font-bold text-white/80 uppercase tracking-widest">{{ __('Khung năng lực identificado') }}</h4>
              <div class="space-y-2">
                <div v-for="skill in identifiedSkills" :key="skill.name" class="space-y-1">
                  <div class="flex justify-between text-[10px] font-bold">
                    <span>{{ skill.name }}</span>
                    <span class="text-amber-400">{{ skill.score }}%</span>
                  </div>
                  <div class="h-1.5 w-full rounded-full bg-white/10">
                    <div class="h-full rounded-full bg-amber-400" :style="{ width: skill.score + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <icons.Brain class="absolute -right-10 -bottom-10 h-40 w-40 text-white/5" />
        </div>
      </section>

      <!-- Right Column: Multi-phase Interactive Panel -->
      <section class="flex-1 h-full flex flex-col bg-white overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div 
              v-for="(phase, index) in phases" 
              :key="index"
              class="flex items-center gap-2 transition-all duration-300"
              :class="activePhase === index + 1 ? 'opacity-100 scale-100' : 'opacity-30 scale-95'"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs"
                :class="activePhase === index + 1 ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-100 text-slate-500'"
              >
                {{ index + 1 }}
              </div>
              <span class="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-900">{{ phase.label }}</span>
              <icons.ChevronRight v-if="index < phases.length - 1" class="h-4 w-4 text-slate-300 ml-2" />
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button @click="resetConversation" class="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Reset Session">
              <icons.RotateCcw class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref="scrollContainer" class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth">
          <!-- Phase 1: AI Internal Analysis -->
          <div v-if="activePhase >= 1" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex items-start gap-4">
              <div class="h-10 w-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
                <icons.Bot class="h-5 w-5" />
              </div>
              <div class="flex-1 space-y-4">
                <div class="rounded-3xl bg-slate-50 border border-slate-100 p-6 shadow-sm relative overflow-hidden">
                  <div class="absolute top-0 right-0 p-4">
                    <span class="text-[10px] font-black uppercase text-amber-600/50 tracking-[0.3em]">AI_THOUGHTS_ANALYSIS</span>
                  </div>
                  <div class="prose prose-sm prose-slate max-w-none font-medium text-slate-800" v-html="renderMarkdown(phase1Message)"></div>
                  
                  <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <h5 class="text-[10px] font-black uppercase text-emerald-600 mb-2">{{ __('Điểm sáng') }}</h5>
                      <ul class="text-xs text-emerald-900 space-y-1">
                        <li class="flex items-center gap-2"><icons.Check class="h-3 w-3"/> {{ __('Lập luận logic chặt chẽ') }}</li>
                        <li class="flex items-center gap-2"><icons.Check class="h-3 w-3"/> {{ __('Sử dụng thuật ngữ chính xác') }}</li>
                      </ul>
                    </div>
                    <div class="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                      <h5 class="text-[10px] font-black uppercase text-orange-600 mb-2">{{ __('Cần cải thiện') }}</h5>
                      <ul class="text-xs text-orange-900 space-y-1">
                        <li class="flex items-center gap-2"><icons.AlertCircle class="h-3 w-3"/> {{ __('Thiếu dẫn chứng thực tế') }}</li>
                        <li class="flex items-center gap-2"><icons.AlertCircle class="h-3 w-3"/> {{ __('Kết luận còn sơ sài') }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Phase 2: Fact Verification -->
          <div v-if="activePhase >= 2" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div 
              v-for="(msg, idx) in phase2Messages" :key="idx"
              class="flex items-start gap-4"
              :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
            >
                :class="msg.role === 'user' ? 'bg-slate-900' : 'bg-amber-600 shadow-amber-200'"
              >
                <component :is="msg.role === 'user' ? icons.User : icons.Bot" class="h-5 w-5" />
              </div>
              <div class="flex-1 max-w-[80%]" :class="msg.role === 'user' ? 'text-right' : ''">
                <div class="rounded-[2rem] p-5 shadow-sm border"
                  :class="msg.role === 'user' 
                    ? 'bg-amber-500 border-amber-400 text-white rounded-tr-none' 
                    : 'bg-white border-slate-100 text-slate-800 rounded-tl-none font-medium'"
                >
                  <div v-html="renderMarkdown(msg.content)"></div>
                </div>
                <span class="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                  {{ msg.role === 'user' ? __('Học viên') : __('Xác thực thông tin') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Phase 3: Socratic Dialogue -->
          <div v-if="activePhase >= 3" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div 
              v-for="(msg, idx) in phase3Messages" :key="idx"
              class="flex items-start gap-4"
              :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
            >
              <div class="h-10 w-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
                :class="msg.role === 'user' ? 'bg-slate-900' : 'bg-rose-500 shadow-rose-200'"
              >
                <component :is="msg.role === 'user' ? icons.User : icons.Sparkles" class="h-5 w-5" />
              </div>
              <div class="flex-1 max-w-[80%]" :class="msg.role === 'user' ? 'text-right' : ''">
                <div class="rounded-[2rem] p-6 shadow-sm border transition-all"
                  :class="msg.role === 'user' 
                    ? 'bg-slate-800 border-slate-700 text-white rounded-tr-none' 
                    : 'bg-gradient-to-br from-rose-50 to-white border-rose-100 text-slate-900 rounded-tl-none font-medium italic text-lg leading-relaxed'"
                >
                  <div v-html="renderMarkdown(msg.content)"></div>
                </div>
                <span class="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                  {{ msg.role === 'user' ? __('Bạn') : __('Gia sư Socratic') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bot Loading -->
          <div v-if="chatbotResource.loading" class="flex items-start gap-4 animate-pulse">
            <div class="h-10 w-10 rounded-2xl bg-slate-200 shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-100 rounded-full w-3/4"></div>
              <div class="h-4 bg-slate-100 rounded-full w-1/2"></div>
          request_id: requestId,
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-6 border-t border-slate-100 bg-slate-50/50">
          <div class="mx-auto w-full max-w-3xl">
            <div v-if="attachedFiles.length" class="flex gap-2 mb-3">
              <div v-for="(file, idx) in attachedFiles" :key="idx" class="flex items-center gap-2 rounded-xl bg-amber-500 text-white px-3 py-1.5 text-xs font-bold shadow-md">
                <icons.Paperclip class="h-3 w-3" />
                {{ file.name }}
                <button @click="removeFile(idx)" class="hover:text-rose-200"><icons.X class="h-3 w-3" /></button>
              </div>
            </div>
            
            <div class="relative flex items-center gap-3">
              <div class="flex gap-1">
                <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" multiple />
                <button 
                  @click="$refs.fileInput.click()"
                  class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-amber-600 hover:border-amber-200"
                >
                  <icons.PlusCircle class="h-6 w-6" />
                </button>
              </div>
              
              <div class="relative flex-1">
                <textarea
                  v-model="userInput"
                  rows="1"
                  class="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 resize-none pr-12"
                  :placeholder="inputPlaceholder"
                  :disabled="chatbotResource.loading"
                  @keydown.enter.prevent="handleSend"
                ></textarea>

        if (!socket) return
        socket.on('socratic_response', (payload) => {
          if (!payload?.request_id) return
          const phase = pendingRequests.value[payload.request_id]
          if (!phase) return

          delete pendingRequests.value[payload.request_id]
          isAwaitingResponse.value = false

          const targetList = phase === 2 ? phase2Messages : phase3Messages

          if (payload.status === 'error') {
            const errorText = payload.error || __('An error occurred. Please try again later.')
            targetList.value.push({ role: 'assistant', content: errorText })
            scrollToBottom()
            return
          }

          if (payload.response) {
            targetList.value.push({ role: 'assistant', content: payload.response })
            scrollToBottom()
          }
        })
                <button
                  class="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white transition-all hover:bg-amber-600 disabled:opacity-30 disabled:grayscale shadow-lg shadow-amber-200"
                  :disabled="!userInput.trim() || chatbotResource.loading"
                  @click="handleSend"
                >
                  <icons.SendHorizontal class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, reactive, watch, inject } from 'vue'
import { usePageMeta, createResource } from 'frappe-ui'
import { sessionStore } from '@/stores/session'
import * as icons from 'lucide-vue-next'
import markdownit from 'markdown-it'
import DOMPurify from 'dompurify'

const props = defineProps({
  sessionKey: {
    type: String,
    required: true
  }
})

// Core View State
const activePhase = ref(1) // 1: Analysis, 2: Verification, 3: Socratic

const md = markdownit({ html: true, linkify: true, typographer: true })
const { brand } = sessionStore()

// Workspace State
const userInput = ref('')
const scrollContainer = ref(null)
const currentSessionTitle = ref('')
const attachedFiles = ref([])

const lastSessionImage = ref(null)
const lastSessionRubric = ref(null)

const aiInsights = [
  { label: __('Logic Score'), value: '8.5', color: 'text-emerald-400' },
  { label: __('Vocabulary'), value: 'C1', color: 'text-amber-400' }
]

const identifiedSkills = [
  { name: __('Phân tích luận điểm'), score: 85 },
  { name: __('Sử dụng bằng chứng'), score: 62 },
  { name: __('Cấu trúc trình bày'), score: 78 }
]

const phases = [
  { label: __('Phân tích bài làm'), key: 'analysis' },
  { label: __('Xác thực thông tin'), key: 'verification' },
  { label: __('Gia sư Socratic'), key: 'socratic' }
]

const activePhaseLabel = computed(() => phases[activePhase.value - 1]?.label)

// Simulated messages
const phase1Message = ref(`### 🤖 Phân tích sơ bộ từ AI
Tôi đã tiếp nhận bài làm của bạn. Dưới đây là những điểm nổi bật tôi nhận thấy ngay lập tức:
- **Lập luận:** Bạn có cách tiếp cận vấn đề khá sáng tạo, đặc biệt là ở phần mở đầu.
- **Rubric:** Đối chiếu với tiêu chí "Tính logic", bài làm đang ở mức Khá.
- **Tiềm năng:** Có 2 điểm cần làm rõ thêm để bài làm đạt điểm tối ưu.`)

const phase2Messages = ref([])
const phase3Messages = ref([])

const socket = inject('$socket')
const pendingRequests = ref({})
const isAwaitingResponse = ref(false)

function generateRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// API Resources
const chatbotResource = createResource({
  url: 'lms.lms.services.socratic.api.send_socratic_message_async',
  onSuccess: () => {},
})

const historyResource = createResource({
  url: 'lms.lms.services.socratic.api.get_socratic_history',
  onSuccess: (data) => {
    if (data && data.length > 0) {
      phase3Messages.value = data.filter(m => m.role === 'user' || m.content.length > 100)
      activePhase.value = 3
    }
    scrollToBottom()
  }
})

const sessionDetailResource = createResource({
  url: 'frappe.client.get_value',
  params: {
    doctype: 'LMS Socratic Session',
    filters: { session_key: props.sessionKey },
    fieldname: ['lesson', 'course', 'image_url', 'rubric_name']
  },
  onSuccess: (data) => {
    currentSessionTitle.value = data.lesson || data.course || __('General Discussion')
    lastSessionImage.value = data.image_url
    lastSessionRubric.value = data.rubric_name
  }
})

// Methods
const handleFileUpload = (e) => {
  const files = Array.from(e.target.files)
  attachedFiles.value.push(...files)
}

const removeFile = (idx) => {
  attachedFiles.value.splice(idx, 1)
}

const handleSend = () => {
  if (!userInput.value.trim() || chatbotResource.loading || isAwaitingResponse.value) return
  const text = userInput.value.trim()
  const targetList = activePhase.value === 2 ? phase2Messages : phase3Messages
  targetList.value.push({ role: 'user', content: text })
  userInput.value = ''

  const requestId = generateRequestId()
  pendingRequests.value[requestId] = activePhase.value
  isAwaitingResponse.value = true

  chatbotResource.submit({
    message: text,
    session_key: props.sessionKey,
    request_id: requestId,
  })
  scrollToBottom()
}

const resetConversation = () => {
  if (confirm(__('Đặt lại phiên này?'))) {
    phase2Messages.value = []
    phase3Messages.value = []
    activePhase.value = 1
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

const renderMarkdown = (content) => {
  if (!content) return ''
  return DOMPurify.sanitize(md.render(content))
}

const inputPlaceholder = computed(() => {
  if (activePhase.value === 2) return __('Trả lời câu hỏi xác thực của AI...')
  if (activePhase.value === 3) return __('Đặt câu hỏi thảo luận...')
  return __('Nhấn vào nút Phân tích để bắt đầu...')
})

onMounted(() => {
  sessionDetailResource.fetch()
  historyResource.fetch({ session_key: props.sessionKey })

  if (!socket) return
  socket.on('socratic_response', (payload) => {
    if (!payload?.request_id) return
    const phase = pendingRequests.value[payload.request_id]
    if (!phase) return

    delete pendingRequests.value[payload.request_id]
    isAwaitingResponse.value = false

    const targetList = phase === 2 ? phase2Messages : phase3Messages

    if (payload.status === 'error') {
      const errorText = payload.error || __('An error occurred. Please try again later.')
      targetList.value.push({ role: 'assistant', content: errorText })
      scrollToBottom()
      return
    }

    if (payload.response) {
      targetList.value.push({ role: 'assistant', content: payload.response })
      scrollToBottom()
    }
  })
})

onUnmounted(() => {
  if (socket) socket.off('socratic_response')
})

usePageMeta(() => ({ title: `${currentSessionTitle.value || __('Workspace')} - ${brand.value}` }))
</script>

<style scoped>
:deep(.prose) {
  max-width: none;
  font-size: 0.875rem;
  line-height: 1.6;
}
:deep(.prose p) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
:deep(.prose strong) {
  color: #0f172a;
  font-weight: 800;
}
:deep(.prose h1), :deep(.prose h2), :deep(.prose h3) {
  font-weight: 800;
  color: #0f172a;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.dark ::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
