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
          <div class="relative flex items-end">
            <textarea
              ref="textareaRef"
              v-model="input"
              rows="1"
              class="w-full rounded-xl border border-outline-gray-2 dark:border-slate-700 px-4 py-2.5 pr-10 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-surface-gray-1/30 dark:bg-slate-800 resize-none overflow-hidden"
              style="color: var(--input-text-color) !important; min-height: 40px; max-height: 120px; line-height: 1.5;"
              :placeholder="__('Ask something...')"
              @keydown.enter.prevent="send"
              @input="resizeTextarea"
            ></textarea>
            <button 
              @click="send"
              :disabled="!input.trim() || chatbotResource.loading"
              class="absolute right-1 bottom-1.5 p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-30"
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
import mathjax3 from 'markdown-it-mathjax3'
import DOMPurify from 'dompurify'

const md = markdownit({ html: true, linkify: true, typographer: true }).use(mathjax3)
const isOpen = ref(false)
const input = ref('')
const messages = ref([])
const scrollContainer = ref(null)
const textareaRef = ref(null)
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

const resizeTextarea = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = '40px'
  const scrollH = textareaRef.value.scrollHeight
  textareaRef.value.style.height = Math.min(scrollH, 120) + 'px'
  textareaRef.value.style.overflowY = scrollH > 120 ? 'auto' : 'hidden'
}

const send = () => {
  if (!input.value.trim() || chatbotResource.loading || isAwaitingResponse.value) return
  const text = input.value.trim()
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = '40px'
      textareaRef.value.style.overflowY = 'hidden'
    }
    scrollToBottom()
  })

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

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (node.tagName === 'STYLE') {
    node.__styleContent = node.textContent
  }
})

DOMPurify.addHook('afterSanitizeElements', (node) => {
  if (node && node.tagName === 'STYLE' && node.__styleContent !== undefined) {
    node.textContent = node.__styleContent
  }
})

const nfc = (text) => text ? String(text).normalize('NFC') : ''

const restoreLatexEscapes = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/\x09/g, '\\t')
    .replace(/\x0c/g, '\\f')
}

const renderMarkdown = (content) => {
  if (!content) return ''
  const cleaned = restoreLatexEscapes(nfc(content))
  const rawHtml = md.render(cleaned)
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true, mathMl: true, svg: true },
    ADD_TAGS: ['style', 'mjx-container', 'mjx-assistive-mml'],
    ADD_ATTR: [
      'style', 'jax', 'display', 'class', 'id', 'width', 'height', 'valign', 'viewBox',
      'unselectable', 'focusable', 'aria-hidden', 'transform', 'stroke', 'fill',
      'stroke-width', 'd', 'data-c', 'data-mml-node', 'data-mjx-xml', 'data-background'
    ]
  })
}

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
