<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md shadow-sm">
      <div class="flex items-center justify-between mx-auto w-full max-w-[1400px]">
        <div class="flex items-center gap-4">
          <button
            class="group flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 transition-all hover:bg-amber-50"
            @click="$router.push({ name: 'SocraticTutor' })"
          >
            <icons.ChevronLeft class="h-5 w-5 text-amber-600 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div class="h-6 w-px bg-slate-200"></div>
          <div class="flex flex-col">
            <h1 class="text-base font-bold text-slate-800 leading-tight">
              {{ currentSessionTitle }}
            </h1>
            <div class="flex items-center gap-1.5 text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              AI Socratic Tutor
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button @click="retryAnalysis" class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200">
            <icons.RefreshCw class="h-3.5 w-3.5" />
            {{ __('Chấm lại bài') }}
          </button>
          <button @click="resetConversation" class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
            <icons.RotateCcw class="h-3.5 w-3.5" />
            {{ __('Làm mới') }}
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 mx-auto w-full max-w-[1400px] h-full flex flex-col lg:flex-row overflow-hidden bg-white/50">
      <!-- Left Column: Context Review -->
      <section class="flex flex-col w-full lg:w-[40%] xl:w-[35%] h-full border-r border-slate-200 p-5 space-y-6 overflow-y-auto bg-white">
        <div class="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
          <div class="flex items-center gap-3 mb-5">
            <div class="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200/50">
              <icons.Target class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-800">{{ __('Mục tiêu & Dữ liệu') }}</h3>
              <p class="text-xs text-slate-500">{{ __('Thông tin được gửi cho AI') }}</p>
            </div>
          </div>
          
          <div v-if="lastSessionImage" class="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-4">
            <img :src="lastSessionImage" class="w-full h-auto object-cover max-h-[300px]" />
          </div>

          <div v-if="lastSessionRubric" class="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div class="mt-0.5"><icons.FileText class="h-4 w-4 text-emerald-500" /></div>
            <div>
              <div class="text-xs font-bold text-slate-700">{{ __('Tiêu chí chấm điểm') }}</div>
              <div class="text-[11px] text-slate-500 truncate max-w-[200px]" :title="lastSessionRubric">{{ formattedRubricName }}</div>
            </div>
          </div>
          
          <div v-if="!lastSessionImage && !lastSessionRubric" class="text-center py-8 text-slate-400">
            <icons.Inbox class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-xs font-medium">{{ __('Không có ảnh bài làm hoặc tiêu chí đính kèm') }}</p>
          </div>
        </div>

        <div class="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 shadow-sm relative overflow-hidden">
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-3">
              <icons.Sparkles class="h-4 w-4 text-amber-600" />
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-tight">{{ __('Socratic Method') }}</h3>
            </div>
            <p class="text-xs leading-relaxed text-slate-900 font-medium">
              {{ __('Phương pháp Socratic không đưa ra câu trả lời trực tiếp mà dùng các câu hỏi gợi mở để giúp bạn tự tìm ra hướng giải quyết. Hãy suy nghĩ cẩn thận trước khi trả lời nhé!') }}
            </p>
          </div>
          <icons.Brain class="absolute -right-6 -bottom-6 h-32 w-32 text-amber-500 opacity-10" />
        </div>
      </section>

      <!-- Right Column: Chat Interface -->
      <section class="flex-1 h-full flex flex-col bg-[#fdfcf9] relative">
        <div ref="scrollContainer" class="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 scroll-smooth">
          
          <div v-if="messages.length === 0 && !chatbotResource.loading" class="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
            <icons.MessageSquareDashed class="h-12 w-12 mb-3" />
            <p class="text-sm font-medium">{{ __('Hãy bắt đầu trò chuyện để nhận gợi ý') }}</p>
          </div>

          <div 
            v-for="(msg, idx) in messages" :key="idx"
            class="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
          >
            <div class="flex-shrink-0 mt-1">
              <div v-if="msg.role === 'user'" class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-slate-900 shadow-sm border border-blue-300">
                <icons.User class="h-4 w-4" />
              </div>
              <div v-else class="h-8 w-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md border border-amber-200">
                <icons.Bot class="h-4 w-4" />
              </div>
            </div>
            
            <div class="max-w-[85%] md:max-w-[75%]" :class="msg.role === 'user' ? 'text-right' : 'text-left'">
              <div 
                class="inline-block rounded-2xl px-5 py-3.5 shadow-sm text-sm"
                :class="[
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-slate-900 rounded-tr-sm border border-blue-200/60 shadow-blue-100/50' 
                    : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200/60 shadow-slate-200/40',
                  msg.message_type === 'socratic_hint' ? 'ring-2 ring-amber-400/30 bg-amber-50/30' : ''
                ]"
              >
                <!-- Badge for specific message types from AI -->
                <div v-if="msg.role === 'assistant' && msg.message_type === 'socratic_hint'" class="flex items-center gap-1.5 text-amber-600 mb-2 border-b border-amber-100 pb-2">
                  <icons.Lightbulb class="h-3.5 w-3.5" />
                  <span class="text-[10px] font-bold uppercase tracking-widest">{{ __('Gợi ý Socratic') }}</span>
                </div>
                
                <div 
                  class="prose prose-sm max-w-none break-words" 
                  :class="msg.role === 'user' ? 'text-slate-900 font-medium [&_p]:text-slate-900 [&_strong]:text-slate-900' : 'prose-slate'" 
                  v-html="renderMarkdown(msg.content)"
                ></div>
              </div>
              <div class="mt-1.5 text-[10px] font-medium px-1" :class="msg.role === 'user' ? 'text-right text-slate-500' : 'text-left text-slate-400'">
                {{ msg.role === 'user' ? __('Bạn') : __('Socratic AI') }}
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="chatbotResource.loading || isAwaitingResponse" class="flex gap-4">
            <div class="flex-shrink-0 mt-1">
              <div class="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200 animate-pulse">
                <icons.Bot class="h-4 w-4" />
              </div>
            </div>
            <div class="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-3">
              <div class="text-sm font-bold text-slate-800">{{ __('Đang suy luận và phân tích...') }}</div>
              <div class="flex items-center gap-1">
                <span class="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 sm:p-5 border-t border-slate-200 bg-white">
          <div class="mx-auto w-full max-w-4xl relative">
            <textarea
              v-model="userInput"
              rows="1"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 pr-14 text-sm outline-none transition-all focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 resize-none shadow-sm"
              :placeholder="__('Nhập câu trả lời hoặc thắc mắc của bạn...')"
              :disabled="chatbotResource.loading || isAwaitingResponse"
              @keydown.enter.prevent="handleSend"
            ></textarea>

            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white transition-all hover:bg-amber-600 disabled:opacity-50 disabled:bg-slate-300 shadow-sm"
              :disabled="!userInput.trim() || chatbotResource.loading || isAwaitingResponse"
              @click="handleSend"
            >
              <icons.Send class="h-4 w-4 ml-0.5" />
            </button>
          </div>
          <div class="text-center mt-2 text-[10px] text-slate-400 font-medium">
            {{ __('AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.') }}
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
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

const md = markdownit({ html: true, linkify: true, typographer: true })
const { brand } = sessionStore()

const userInput = ref('')
const scrollContainer = ref(null)
const currentSessionTitle = ref('')

const lastSessionImage = ref(null)
const lastSessionRubric = ref(null)

const formattedRubricName = computed(() => {
  if (!lastSessionRubric.value) return ''
  let name = lastSessionRubric.value.split('/').pop() || ''
  
  const extMatch = name.match(/\.[^.]+$/)
  if (extMatch) {
    const ext = extMatch[0]
    const base = name.slice(0, -ext.length)
    const hashMatch = base.match(/[a-f0-9]{6,12}$/)
    if (hashMatch) {
      return base.slice(0, -hashMatch[0].length) + ext
    }
  }
  return name
})

const messages = ref([])

const socket = inject('$socket')
const pendingRequests = ref({})
const isAwaitingResponse = ref(false)

function generateRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const chatbotResource = createResource({
  url: 'lms.lms.services.socratic.api.send_socratic_message_async',
  onSuccess: () => {},
})

const historyResource = createResource({
  url: 'lms.lms.services.socratic.api.get_socratic_history',
  onSuccess: (data) => {
    if (data && data.length > 0) {
      messages.value = data
    }
    scrollToBottom()
  }
})

const sessionDetailResource = createResource({
  url: 'lms.lms.services.socratic.api.get_session_detail',
  params: {
    session_key: props.sessionKey
  },
  onSuccess: (data) => {
    currentSessionTitle.value = data.lesson || data.course || __('Phiên thảo luận chung')
    lastSessionImage.value = data.attached_image
    lastSessionRubric.value = data.attached_rubric
  }
})

const handleSend = () => {
  const text = userInput.value.trim()
  if (!text || chatbotResource.loading || isAwaitingResponse.value) return
  
  messages.value.push({ role: 'user', content: text, message_type: 'qa' })
  userInput.value = ''

  const requestId = generateRequestId()
  pendingRequests.value[requestId] = true
  isAwaitingResponse.value = true

  console.log('[Socratic Debug] Gửi tin nhắn. Request ID:', requestId)

  chatbotResource.submit({
    message: text,
    session_key: props.sessionKey,
    request_id: requestId,
  })
  scrollToBottom()
}

const resetConversation = () => {
  if (confirm(__('Bạn có chắc chắn muốn làm mới cuộc hội thoại này?'))) {
    createResource({
      url: 'lms.lms.services.socratic.api.reset_socratic_session',
      params: { session_key: props.sessionKey },
      onSuccess: () => {
        console.log('[Socratic Debug] Đã làm mới lịch sử hội thoại')
        messages.value = []
        isAwaitingResponse.value = false
      }
    }).submit()
  }
}

const retryAnalysis = () => {
  if (confirm(__('Hệ thống sẽ xoá lịch sử chat và thực hiện chấm lại bài làm này. Bạn có chắc chắn?'))) {
    isAwaitingResponse.value = true
    createResource({
      url: 'lms.lms.services.socratic.api.retry_analysis',
      params: { session_key: props.sessionKey },
      onSuccess: (data) => {
        if (data && data.request_id) {
          console.log('[Socratic Debug] Chấm lại bài. Request ID mới:', data.request_id)
          messages.value = []
          pendingRequests.value[data.request_id] = true
          isAwaitingResponse.value = true
        }
      },
      onError: (err) => {
        console.error('[Socratic Debug] Lỗi khi gọi retry_analysis API', err)
        isAwaitingResponse.value = false
      }
    }).submit()
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
  
  // 1. Render Markdown to HTML
  let html = md.render(content)
  
  // 2. Handle Math if KaTeX is available
  if (window.katex) {
    // Block math $$ ... $$
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      try {
        return '<div class="math-block">' + window.katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false }) + '</div>'
      } catch (e) { return match }
    })
    
    // Inline math $ ... $
    html = html.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      try {
        return window.katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
      } catch (e) { return match }
    })
  }
  
  // 3. Sanitize (Allowing KaTeX classes and tags)
  return DOMPurify.sanitize(html)
}

const route = useRoute()

onMounted(() => {
  sessionDetailResource.fetch()
  historyResource.fetch({ session_key: props.sessionKey })

  // If we came from create_session, register the auto-analysis request_id
  const autoRequestId = route.query.request_id
  if (autoRequestId) {
    pendingRequests.value[autoRequestId] = true
    isAwaitingResponse.value = true
  }

  if (!socket) return
  socket.on('socratic_response', (payload) => {
    console.log('[Socratic Debug] Nhận payload từ WebSocket:', payload)
    
    if (!payload?.request_id) {
      console.warn('[Socratic Debug] Payload thiếu request_id', payload)
      return
    }
    if (!pendingRequests.value[payload.request_id]) {
      console.warn('[Socratic Debug] Bỏ qua vì request_id không có trong pendingRequests', payload.request_id)
      return
    }

    delete pendingRequests.value[payload.request_id]
    isAwaitingResponse.value = false

    if (payload.status === 'error') {
      console.error('[Socratic Debug] Lỗi từ server:', payload.error)
      const errorText = payload.error || __('Đã có lỗi xảy ra. Vui lòng thử lại.')
      messages.value.push({ role: 'assistant', content: errorText, message_type: 'error' })
      scrollToBottom()
      return
    }

    if (payload.response) {
      console.log('[Socratic Debug] Render response:', payload.response.substring(0, 50) + '...')
      messages.value.push({ role: 'assistant', content: payload.response, message_type: payload.message_type || 'socratic_hint' })
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
:deep(.prose p) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
:deep(.prose strong) {
  font-weight: 700;
}
:deep(.prose h1), :deep(.prose h2), :deep(.prose h3) {
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
:deep(.prose ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
}
:deep(.prose ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.dark ::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
