<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Chat Window -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-4 opacity-0 scale-95"
    >
      <div 
        v-if="isOpen"
        class="mb-4 w-[380px] h-[540px] rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 flex flex-col overflow-hidden transition-all duration-300"
      >
        <!-- Header -->
        <div class="p-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-2">
            <icons.Bot class="h-5 w-5" />
            <span class="font-bold text-sm">{{ __('AI Learning Assistant') }}</span>
          </div>
          <button @click="isOpen = false" class="text-white/80 hover:text-white">
            <icons.X class="h-5 w-5" />
          </button>
        </div>

        <!-- Messages -->
        <div ref="scrollContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-gray-1/50">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <div
              class="max-w-[85%] rounded-2xl px-4 py-2 text-xs shadow-sm border"
              :class="msg.role === 'user' 
                ? 'bg-emerald-200 dark:bg-emerald-950 text-slate-900 dark:text-white border-emerald-300 dark:border-emerald-800 rounded-tr-none font-medium' 
                : 'bg-white dark:bg-slate-900 text-ink-gray-8 dark:text-white border-emerald-100 dark:border-slate-800 rounded-tl-none prose prose-xs dark:prose-invert'"
              style="color: inherit;"
              v-html="renderMarkdown(msg.content)"
            ></div>
          </div>
          <div v-if="chatbotResource.loading" class="flex gap-1 p-2">
            <div class="h-1 w-1 rounded-full bg-emerald-400 animate-bounce"></div>
            <div class="h-1 w-1 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="h-1 w-1 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-3 border-t bg-white">
          <div class="relative flex items-center">
            <input
              v-model="input"
              class="w-full rounded-xl border border-outline-gray-2 dark:border-slate-700 px-4 py-2.5 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-surface-gray-1/30 dark:bg-slate-800"
              style="color: var(--input-text-color) !important;"
              :placeholder="__('Ask something...')"
              @keyup.enter="send"
            />
            <button 
              @click="send"
              :disabled="!input.trim() || chatbotResource.loading"
              class="absolute right-1 p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-30"
            >
              <icons.Send class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toggle Button -->
    <button
      @click="isOpen = !isOpen"
      class="h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      :class="{ 'rotate-90': isOpen }"
    >
      <icons.MessageCircle v-if="!isOpen" class="h-7 w-7" />
      <icons.ChevronDown v-else class="h-7 w-7" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, inject, onUnmounted } from 'vue'
import { createResource } from 'frappe-ui'
import * as icons from 'lucide-vue-next'
import markdownit from 'markdown-it'
import DOMPurify from 'dompurify'

const md = markdownit({ html: true })
const isOpen = ref(false)
const input = ref('')
const messages = ref([])
const scrollContainer = ref(null)
const currentSessionKey = ref(null)
const isAwaitingResponse = ref(false)
const socket = inject('$socket')

function generateRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const pendingRequestId = ref(null)

const chatbotResource = createResource({
  url: 'lms.lms.services.chatbot.api.send_message_async',
  onSuccess: (data) => {
    if (data?.session_key) currentSessionKey.value = data.session_key
  },
})

const send = () => {
  if (!input.value.trim() || chatbotResource.loading || isAwaitingResponse.value) return
  const text = input.value.trim()
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  scrollToBottom()

  const requestId = generateRequestId()
  pendingRequestId.value = requestId
  isAwaitingResponse.value = true

  chatbotResource.submit({
    message: text,
    session_key: currentSessionKey.value,
    request_id: requestId,
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

const renderMarkdown = (c) => DOMPurify.sanitize(md.render(c || ''))

onMounted(() => {
  messages.value = [{ role: 'assistant', content: __('May I help you?') }]

  if (socket) {
    socket.on('chatbot_response', (payload) => {
      if (!payload) return
      if (!pendingRequestId.value || payload.request_id !== pendingRequestId.value) return

      isAwaitingResponse.value = false
      pendingRequestId.value = null

      if (payload.status === 'error') {
        const errorText = payload.error || __('An error occurred. Please try again later.')
        messages.value.push({ role: 'assistant', content: errorText })
        scrollToBottom()
        return
      }

      if (payload.response) {
        messages.value.push({ role: 'assistant', content: payload.response })
        if (payload.session_key) currentSessionKey.value = payload.session_key
        scrollToBottom()
      }
    })
  }
})

onUnmounted(() => {
  if (socket) socket.off('chatbot_response')
})
</script>

<style scoped>
:root {
  --input-text-color: #1e293b;
}
:deep(.dark), .dark {
  --input-text-color: #ffffff;
}

:deep(.prose) {
  max-width: none;
}
</style>
