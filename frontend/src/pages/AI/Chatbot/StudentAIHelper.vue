<template>
  <div class="min-h-screen bg-[#fdfcf9] dark:bg-[#0a0a0a] flex flex-col transition-colors duration-300 overflow-hidden system-font">
    <!-- Header based on AIIntegration -->
    <header class="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4">
      <div class="flex items-center justify-between mx-auto w-full max-w-[1300px]">
        <div class="flex items-center gap-4">
          <button
            class="group flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-105 active:scale-95"
            @click="$router.push({ name: 'AIIntegration' })"
          >
            <icons.ChevronLeft class="h-5 w-5 text-slate-600 stroke-[3px]" />
          </button>
          <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div>
            <h1 class="text-lg font-bold tracking-tight text-slate-800 dark:text-white uppercase leading-none">{{ currentLessonName || __('Smart Chatbot') }}</h1>
            <p class="text-[10px] font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400 mt-1">{{ __('Hệ thống đang sẵn sàng') }}</p>
          </div>
        </div>
        
        <button 
          @click="showNewSessionModal = true"
          class="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs font-semibold text-slate-700 shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest border border-slate-50"
        >
          <icons.Plus class="h-4 w-4 stroke-[2px] text-amber-500" />
          {{ __('Phiên chat mới') }}
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden mx-auto w-full max-w-[1300px]">
      <!-- Session Sidebar (Left) -->
      <aside class="hidden lg:flex flex-col w-64 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div class="p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
          <h3 class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{{ __('LỊCH SỬ') }}</h3>
          <button @click="sessionsResource.fetch()" class="p-2 rounded-lg hover:bg-amber-500/10 text-amber-600 transition-all">
            <icons.RefreshCw :class="['h-4 w-4', sessionsResource.loading && 'animate-spin']" />
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto px-4 space-y-2 py-6 custom-scrollbar">
          <div
            v-for="session in sessions"
            :key="session.session_key"
            class="group w-full text-left p-3 rounded-2xl transition-all border cursor-pointer relative"
            :class="currentSessionKey === session.session_key 
              ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100' 
              : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 hover:border-amber-200'"
            @click="selectSession(session)"
          >
            <div class="flex items-center gap-3 mb-1">
              <div class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" :class="currentSessionKey === session.session_key ? 'bg-white/20' : 'bg-amber-100 text-amber-600'">
                <icons.MessageCircle class="h-3.5 w-3.5" />
              </div>
              <span class="text-[11px] font-bold truncate pr-6" :class="currentSessionKey === session.session_key ? 'text-white' : 'text-slate-800 dark:text-white'">{{ session.lesson || session.course || __('Tổng quát') }}</span>
            </div>
            <div class="flex items-center justify-between" :class="currentSessionKey === session.session_key ? 'text-white/70' : 'opacity-40'">
              <span class="text-[8px] font-bold uppercase tracking-widest">{{ formatDate(session.last_active) }}</span>
            </div>
            
            <!-- Delete Session Button -->
            <button 
              @click.stop="confirmDeleteSession(session.session_key)"
              class="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white text-slate-400"
              :class="currentSessionKey === session.session_key ? 'hover:bg-white/20 text-white/50' : ''"
            >
              <icons.X class="h-3 w-3 stroke-[3px]" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col bg-white/40 dark:bg-slate-900/40 relative border-x border-slate-50 dark:border-slate-800">
        <div ref="scrollContainer" class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scroll-smooth custom-scrollbar">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
            :class="message.role === 'user' ? 'items-end' : 'items-start'"
          >
            <div class="flex gap-4 max-w-[95%] sm:max-w-[90%]" :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
              <!-- Avatar -->
              <div class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
                :class="message.role === 'user' ? 'bg-gradient-to-br from-amber-200 to-blue-200 border-none text-slate-900 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-amber-500'"
              >
                <icons.User class="h-5 w-5" v-if="message.role === 'user'" />
                <icons.Bot class="h-5 w-5" v-else />
              </div>
              
              <!-- Content Bubble -->
              <div class="space-y-1">
                <div
                  class="rounded-[2rem] px-6 py-4 text-sm shadow-md border-none"
                  :class="message.role === 'user' 
                    ? 'bg-gradient-to-br from-amber-100 to-blue-100 text-slate-900 rounded-tr-none' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-none font-medium leading-relaxed'"
                >
                  <div class="prose prose-sm prose-slate dark:prose-invert max-w-none font-medium" v-html="renderMarkdown(message.content)"></div>
                </div>
                <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2" :class="message.role === 'user' ? 'text-right' : 'text-left'">
                  {{ message.role === 'user' ? __('BẠN') : __('AI TRỢ LÝ') }}
                </p>
              </div>
            </div>
          </div>
          
          <div v-if="chatbotResource.loading" class="flex items-start gap-4">
            <div class="h-11 w-11 rounded-xl bg-amber-500 border border-amber-400 flex items-center justify-center text-white shadow-xl animate-bounce">
              <icons.Bot class="h-5 w-5" />
            </div>
            <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] rounded-tl-none px-6 py-4 flex items-center gap-2 shadow-xl">
              <div class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
              <div class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse delay-100"></div>
              <div class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse delay-200"></div>
            </div>
          </div>
        </div>

        <!-- Chat Controls -->
        <div class="p-6 sm:p-10 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
          <div class="mx-auto w-full max-w-4xl flex flex-col gap-6">
            <!-- Input Box -->
            <div class="flex items-center gap-3 p-1.5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl focus-within:border-amber-400 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all duration-300">
              <textarea
                v-model="userInput"
                rows="1"
                class="flex-1 bg-transparent px-6 py-3 text-sm font-semibold text-slate-800 dark:text-white outline-none border-none ring-0 focus:ring-0 resize-none placeholder:text-slate-400"
                :placeholder="__('Đặt câu hỏi về bài học của bạn...')"
                :disabled="chatbotResource.loading"
                @keydown.enter.prevent="handleSend"
              ></textarea>
              <button
                class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-amber-400 shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
                :disabled="!userInput.trim() || chatbotResource.loading"
                @click="handleSend"
              >
                <icons.SendHorizontal class="h-5 w-5 stroke-[3px]" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Sidebar Context (Right) -->
      <aside class="hidden xl:flex flex-col w-64 bg-white dark:bg-slate-900 border-l border-slate-50 dark:border-slate-800 p-6 space-y-8 shrink-0 overflow-y-auto custom-scrollbar">
        <!-- Starter Prompts Section -->
        <section>
          <div class="flex items-center gap-3 mb-5">
            <div class="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg">
              <icons.Zap class="h-4 w-4" />
            </div>
            <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ __('Starter Prompts') }}</h3>
          </div>
          <div class="space-y-3">
            <button
              v-for="prompt in starterPrompts"
              :key="prompt"
              @click="usePrompt(prompt)"
              class="w-full text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-amber-400 hover:bg-white transition-all text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm"
            >
              {{ __(prompt) }}
            </button>
          </div>
        </section>

        <!-- Session Info Section -->
        <section>
          <div class="flex items-center gap-3 mb-5">
            <div class="h-8 w-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-lg">
              <icons.Info class="h-4 w-4" />
            </div>
            <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ __('Session Info') }}</h3>
          </div>
          <div class="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
             <div class="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-1">{{ __('Current Focus') }}</div>
             <div class="text-[13px] font-bold text-slate-800 dark:text-white leading-tight">{{ currentLessonName || __('General Knowledge') }}</div>
          </div>
        </section>

        <!-- Clear History Action -->
        <section class="pt-4 mt-auto">
          <button
            @click="clearHistory"
            class="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
          >
            <icons.Trash2 class="h-4 w-4" />
            {{ __('Clear History') }}
          </button>
        </section>
      </aside>
    </div>

    <!-- New Session Modal -->
    <Dialog v-model="showNewSessionModal" :options="{ title: '', size: 'xl' }">
      <template #body>
        <div class="session-setup-card">
          <div class="session-setup-header">
            <div class="session-setup-icon">
              <icons.MessageSquarePlus class="icon-glyph" />
            </div>
            <h2 class="session-setup-title">{{ __('Thiết lập thảo luận') }}</h2>
            <p class="session-setup-subtitle">{{ __('Tối ưu hóa phản hồi AI') }}</p>
          </div>
          
          <div class="session-setup-grid">
            <div class="session-setup-field">
               <label class="session-setup-label">{{ __('Khóa học') }}</label>
               <select v-model="newSessionForm.course" class="session-setup-select">
                 <option :value="null">{{ __('Tổng quát') }}</option>
                 <option v-for="c in courses" :key="c.name" :value="c.name">{{ c.title }}</option>
               </select>
            </div>
            <div class="session-setup-field">
               <label class="session-setup-label">{{ __('Lớp') }}</label>
               <select v-model="newSessionForm.batch" class="session-setup-select">
                 <option :value="null">{{ __('Tất cả lớp') }}</option>
                 <option v-for="b in batches" :key="b.name" :value="b.name">{{ b.title }}</option>
               </select>
            </div>
          </div>

          <div class="session-setup-actions">
             <button class="btn-cancel" @click="showNewSessionModal = false">{{ __('Hủy bỏ') }}</button>
             <button class="btn-confirm" @click="createNewSession">{{ __('Bắt đầu thảo luận') }}</button>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, reactive } from 'vue'
import { usePageMeta, createResource, Dialog } from 'frappe-ui'
import { sessionStore } from '@/stores/session'
import dayjs from '@/utils/dayjs'
import * as icons from 'lucide-vue-next'
import markdownit from 'markdown-it'
import DOMPurify from 'dompurify'

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true
})

const renderMarkdown = (content) => {
  return DOMPurify.sanitize(md.render(content || ''))
}

const { brand } = sessionStore()
const userInput = ref('')
const messages = ref([])
const scrollContainer = ref(null)
const currentSessionKey = ref(null)
const currentLessonName = ref(null)
const showNewSessionModal = ref(false)

const newSessionForm = reactive({ course: null, batch: null, lesson: null })
const courses = ref([])
const batches = ref([])

const starterPrompts = [
  __('Explain the most difficult concept in this article'),
  __('Suggest me how to do this exercise (no answers given)'),
  __('Create for me 3 multiple choice review questions'),
  __('Make a study plan for this chapter'),
]

// API Resources
const sessionsResource = createResource({
  url: 'lms.lms.services.chatbot.api.get_sessions',
  auto: true,
  onSuccess: (data) => {
    if (data && data.length > 0 && !currentSessionKey.value) {
      // Don't auto-select if we already have one
    }
  }
})

const sessions = computed(() => sessionsResource.data || [])

const chatbotResource = createResource({
  url: 'lms.lms.services.chatbot.api.send_message',
  onSuccess: (data) => {
    if (data.response) {
      messages.value.push({ role: 'assistant', content: data.response })
      currentSessionKey.value = data.session_key
      sessionsResource.fetch()
      scrollToBottom()
    }
  }
})

const historyResource = createResource({
  url: 'lms.lms.services.chatbot.api.get_history',
  onSuccess: (data) => {
    if (data && data.length > 0) {
      messages.value = data.map(m => ({
        role: m.role?.toLowerCase(),
        content: m.content
      }))
    } else {
      messages.value = [{ role: 'assistant', content: __('Chào bạn! Tôi là trợ lý AI học tập. Hôm nay bạn muốn thảo luận về nội dung gì?') }]
    }
    scrollToBottom()
  }
})

const studentContext = createResource({
  url: 'lms.lms.services.chatbot.api.get_student_context',
  auto: true,
  onSuccess: (data) => {
    courses.value = data.courses || []
    batches.value = data.batches || []
  }
})

onMounted(() => {
  historyResource.fetch()
})

function formatDate(date) { return date ? dayjs(date).format('DD/MM HH:mm') : '' }

const handleSend = () => {
  if (!userInput.value.trim() || chatbotResource.loading) return
  const text = userInput.value.trim()
  messages.value.push({ role: 'user', content: text })
  userInput.value = ''
  scrollToBottom()
  chatbotResource.fetch({
    message: text,
    session_key: currentSessionKey.value,
    lesson_name: currentLessonName.value,
    course: newSessionForm.course,
    batch: newSessionForm.batch
  })
}

const selectSession = (session) => {
  messages.value = [] 
  currentSessionKey.value = session.session_key
  currentLessonName.value = session.lesson || session.course
  historyResource.fetch({ session_key: session.session_key })
}

const confirmDeleteSession = (sessionKey) => {
  if (confirm(__('Bạn có chắc chắn muốn xóa phiên thảo luận này? Toàn bộ tin nhắn sẽ bị mất.'))) {
    createResource({
      url: 'lms.lms.services.chatbot.api.delete_session',
      onSuccess: () => {
        sessionsResource.fetch()
        if (currentSessionKey.value === sessionKey) {
          currentSessionKey.value = null
          messages.value = []
        }
      }
    }).fetch({ session_key: sessionKey })
  }
}

const createNewSession = () => {
  createResource({
    url: 'lms.lms.services.chatbot.api.create_session',
    params: { ...newSessionForm },
    onSuccess: (data) => {
      currentSessionKey.value = data.session_key
      currentLessonName.value = newSessionForm.lesson || newSessionForm.course
      messages.value = []
      showNewSessionModal.value = false
      sessionsResource.fetch()
    }
  }).fetch()
}

const usePrompt = (prompt) => { userInput.value = prompt; handleSend() }

const clearHistory = () => {
  if (confirm(__('Bạn có chắc chắn muốn xóa lịch sử cuộc trò chuyện này?'))) {
    createResource({
      url: 'lms.lms.services.chatbot.api.delete_session',
      onSuccess: () => {
        messages.value = []
        sessionsResource.fetch()
      }
    }).fetch({ session_key: currentSessionKey.value })
  }
}

const scrollToBottom = () => {
  nextTick(() => { if (scrollContainer.value) scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight })
}

usePageMeta(() => ({ title: `${__('Chatbot')} - ${brand.value}` }))
</script>

<style scoped>
/* Đồng bộ Font hệ thống */
.system-font {
  font-family: var(--font-stack-sans, Inter, system-ui, -apple-system, sans-serif) !important;
}

:deep(*) {
  font-family: var(--font-stack-sans, Inter, system-ui, -apple-system, sans-serif) !important;
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 20px; }
:deep(.prose) { max-width: none; }

/* Modal Styles */
.session-setup-card {
  padding: 2rem;
  background: #ffffff;
  border-radius: 1.5rem;
}

.session-setup-header { text-align: center; margin-bottom: 2rem; }
.session-setup-title { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
.session-setup-grid { display: grid; gap: 1.5rem; margin-bottom: 2rem; }
.session-setup-field { display: flex; flex-direction: column; gap: 0.5rem; }
.session-setup-label { font-size: 0.75rem; font-weight: 600; color: #64748b; }
.session-setup-select { width: 100%; border-radius: 0.5rem; border: 1px solid #e2e8f0; padding: 0.75rem; }
.session-setup-actions { display: flex; gap: 1rem; }
.btn-cancel, .btn-confirm { flex: 1; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; border: none; }
.btn-cancel { background: #f1f5f9; color: #475569; }
.btn-confirm { background: #2563eb; color: #ffffff; }
</style>
