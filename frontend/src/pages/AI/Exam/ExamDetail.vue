<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-[#0a0f1c] dark:to-[#12182b] pb-12 transition-colors duration-300">
    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div class="mx-auto flex max-w-[1400px] items-center justify-between">
        <div class="flex items-center gap-4">
          <Button icon="chevron-left" variant="ghost" @click="router.push({ name: 'ExamDashboard' })" />
          <div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[500px]">
              {{ examResource.data?.title || __('Loading Exam...') }}
            </h1>
            <div class="flex items-center gap-2 mt-1">
              <Badge :theme="getStatusTheme(examResource.data?.status)" size="sm">
                {{ __(examResource.data?.status || 'Loading') }}
              </Badge>
              <span class="text-xs text-slate-500">{{ examResource.data?.subject }} • {{ examResource.data?.grade_level }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2" v-if="examResource.data?.status === 'Completed'">
          <Button variant="solid" theme="emerald" icon-left="printer" @click="router.push({ name: 'ExamExportPreview', params: { examID: route.params.examID } })">
            {{ __('Print Preview & Export') }}
          </Button>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-8">
      
      <!-- Processing State (also shown immediately after approving blueprint) -->
      <div v-if="examResource.data?.status === 'Processing' || isGenerating" class="flex flex-col items-center justify-center py-32">
        <div class="relative mb-8">
          <div class="w-20 h-20 rounded-full border-4 border-emerald-100 dark:border-emerald-900/40"></div>
          <div class="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">{{ isGenerating ? __('Đang sinh câu hỏi...') : __('AI is generating your exam...') }}</h2>
        <p class="text-slate-500 text-center max-w-md">{{ isGenerating ? __('AI đang viết từng phần thi theo khung đề bạn đã duyệt. Quá trình này mất vài phút, bạn có thể rời khỏi trang và quay lại sau.') : __('This may take a few minutes depending on the length of the source material.') }}</p>
        <div v-if="isGenerating" class="mt-6 flex gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style="animation-delay:0ms"></span>
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style="animation-delay:150ms"></span>
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style="animation-delay:300ms"></span>
        </div>
      </div>

      <!-- Failed State -->
      <div v-else-if="examResource.data?.status === 'Failed'" class="flex flex-col items-center justify-center py-32">
        <div class="text-6xl mb-6">⚠️</div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">{{ __('Generation Failed') }}</h2>
        <p class="text-red-500 max-w-lg text-center">{{ __('There was an error while generating this exam. Please try again or check the source document.') }}</p>
      </div>

      <!-- Review State -->
      <div v-else-if="examResource.data?.status === 'Waiting for Review' && !isGenerating" class="max-w-4xl mx-auto py-12">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div class="p-8">
            <h2 class="text-2xl font-bold mb-2">{{ __('Review Exam Blueprint') }}</h2>
            <p class="text-slate-500 mb-8">{{ __('Please review the generated exam structure. You can either approve it to generate the full exam, or provide feedback to let the AI adjust the blueprint.') }}</p>

            <div v-if="blueprintResource.loading" class="flex justify-center py-12">
              <Spinner class="w-8 h-8 text-indigo-500" />
            </div>
            
            <div v-else-if="blueprintResource.data" class="space-y-6">
              <!-- Blueprint Data -->
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
                <div class="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                  <h3 class="font-bold text-lg">{{ blueprintResource.data.title }}</h3>
                  <div class="flex gap-4 text-sm font-medium">
                    <span class="text-indigo-600 dark:text-indigo-400">{{ __('Total Qs') }}: {{ blueprintResource.data.total_questions }}</span>
                    <span class="text-emerald-600 dark:text-emerald-400">{{ __('Points') }}: {{ blueprintResource.data.total_points }}</span>
                  </div>
                </div>
                
                <div class="space-y-6">
                  <div v-for="(sec, idx) in blueprintResource.data.sections_blueprint" :key="idx">
                    <h4 class="font-bold text-slate-800 dark:text-slate-200 mb-2">{{ sec.section_name || sec.section_title }}</h4>
                    <p class="text-sm italic text-slate-500 mb-3">{{ sec.instructions }}</p>
                    
                    <div class="flex flex-wrap gap-4 bg-white dark:bg-slate-900 px-4 py-3 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                      <div class="flex items-center gap-2">
                        <span class="text-slate-500">Số lượng:</span>
                        <span class="font-medium text-slate-800 dark:text-slate-200">{{ sec.num_questions }} câu</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-slate-500">Loại câu hỏi:</span>
                        <span class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-xs">{{ sec.section_type || sec.question_type }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-slate-500">Chủ đề:</span>
                        <span class="text-slate-700 dark:text-slate-300">{{ sec.topics || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Area -->
              <div class="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ __('Feedback for AI (Optional)') }}</label>
                  <textarea 
                    v-model="feedbackText"
                    rows="3" 
                    class="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="E.g., Make the multiple choice questions harder, add more algebra..."
                  ></textarea>
                </div>
                <div class="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button 
                    variant="subtle" 
                    icon-left="refresh-cw" 
                    @click="requestRegeneration" 
                    :loading="regenerating"
                    :disabled="!feedbackText || regenerating"
                  >
                    {{ __('Regenerate with Feedback') }}
                  </Button>
                  <Button 
                    variant="solid" 
                    theme="emerald" 
                    icon-left="check" 
                    @click="approveBlueprint"
                    :loading="approving"
                    :disabled="regenerating"
                  >
                    {{ __('Approve & Generate Exam') }}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed State -->
      <div v-else-if="examResource.data?.status === 'Completed'" class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white/70 dark:bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl p-5 border border-white dark:border-indigo-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.03)]">
            <h3 class="font-bold text-slate-900 dark:text-white mb-4">{{ __('Exam Overview') }}</h3>
            
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">{{ __('Total Questions') }}</span>
                <span class="font-medium text-slate-900 dark:text-white">{{ examResource.data.total_questions }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">{{ __('Duration') }}</span>
                <span class="font-medium text-slate-900 dark:text-white">{{ examResource.data.duration_minutes }} min</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">{{ __('Total Score') }}</span>
                <span class="font-medium text-slate-900 dark:text-white">{{ examResource.data.total_score }}</span>
              </div>
            </div>
            
            <hr class="my-4 border-slate-100 dark:border-slate-700">
            
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{{ __('Sections') }}</h4>
            <div class="space-y-2">
              <div v-for="sec in getSections()" :key="sec.name" class="flex justify-between text-sm">
                <span class="text-slate-700 dark:text-slate-300">{{ sec.section_title }}</span>
                <span class="text-slate-400">{{ sec.num_questions }} {{ __('Q') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content (Exam Paper) -->
        <div class="lg:col-span-3">
          <div class="bg-white/70 dark:bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-white dark:border-indigo-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.03)] min-h-screen relative overflow-hidden">
            <!-- Glow -->
            <div class="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]"></div>
            <div class="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]"></div>
            
            <div id="exam-content-area" class="relative z-10">
            
            <!-- Exam Paper Header Mock -->
            <div class="text-center mb-12 pb-8 border-b-2 border-slate-900 dark:border-white">
              <h2 class="text-2xl font-bold uppercase mb-2">{{ nfc(examResource.data.title) }}</h2>
              <p class="text-lg mb-1">{{ __('Subject') }}: {{ nfc(examResource.data.subject) }} • {{ __('Time') }}: {{ examResource.data.duration_minutes }} {{ __('minutes') }}</p>
            </div>

            <!-- Sections & Questions -->
              <div v-for="(section, secIdx) in examResource.data?.sections" :key="section.section_title" class="mb-8">
                <h2 class="text-xl font-bold mb-2">{{ nfc(section.section_title) }}</h2>
                <p class="text-gray-600 dark:text-gray-400 mb-4 italic">{{ nfc(section.section_instructions) }}</p>
                
                <div class="space-y-6">
                  <div v-for="q in getQuestionsForSection(section, secIdx)" :key="q.name" class="relative group">
                  
                  <div class="flex gap-2">
                    <span class="font-bold shrink-0">{{ __('Câu') }} {{ q.question_number }} ({{ q.score }} {{ __('điểm') }}):</span>
                    <div class="w-full">
                      <div class="mb-3 markdown-content" v-html="renderMarkdown(q.question_text)"></div>
                      
                      <!-- Media Assets -->
                      <div v-if="hasMedia(q.media_assets)" class="my-4">
                        <img v-for="(media, i) in parseMedia(q.media_assets)" :key="i" :src="`data:image/png;base64,${media.content}`" class="max-w-md mx-auto rounded-lg border border-slate-200" />
                      </div>
                      
                      <div v-if="q.question_type === 'Multiple Choice' && q.options" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
                        <div v-for="(opt, idx) in parseJSON(q.options)" :key="idx" class="flex gap-2 markdown-content">
                          <span class="font-bold">{{ String.fromCharCode(65 + idx) }}.</span>
                          <span v-html="renderMarkdown(cleanOptionText(opt))"></span>
                        </div>
                      </div>

                      <div v-else-if="q.question_type === 'True/False' && q.options" class="grid grid-cols-1 gap-3 pl-4">
                        <div v-for="(opt, idx) in parseJSON(q.options)" :key="idx" class="flex gap-2 markdown-content items-start">
                          <span class="font-bold">{{ String.fromCharCode(97 + idx) }})</span>
                          <span v-html="renderMarkdown(cleanOptionText(opt))"></span>
                        </div>
                      </div>
                      
                      <!-- Answer & Solution (Hidden by default, shown on hover/click in UI) -->
                      <div class="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 hidden group-hover:block transition-all shadow-[0_4px_20px_rgba(16,185,129,0.05)]">
                        <p class="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-2"><span class="text-emerald-500">✨</span> {{ __('Answer') }}: {{ q.correct_answer }}</p>
                        <div class="text-sm text-emerald-700 dark:text-emerald-300/80 leading-relaxed markdown-content" v-html="renderMarkdown(q.explanation || q.solution)"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, onUpdated, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createResource, Button, Badge, Spinner, call } from 'frappe-ui'
import MarkdownIt from 'markdown-it'
import 'katex/dist/katex.min.css'

const router = useRouter()
const route = useRoute()
const socket = inject('$socket')

const md = new MarkdownIt({ html: true, breaks: true })

const nfc = (text) => text ? String(text).normalize('NFC') : ''

const renderMarkdown = (text) => {
  if (!text) return ''
  return md.render(nfc(text))
}

const cleanOptionText = (opt) => {
  let text = opt.text || opt || ''
  if (typeof text === 'string') {
    // Remove leading "A.", "B)", "C:", etc. if the old LLM format included them
    text = text.replace(/^[A-Z][\.\:\)]\s*/i, '')
  }
  return text
}

let mathRenderTimer = null
const renderMath = () => {
  // Debounce to avoid hammering KaTeX on rapid re-renders
  if (mathRenderTimer) clearTimeout(mathRenderTimer)
  mathRenderTimer = setTimeout(() => {
    if (!window.renderMathInElement) return
    // Scope to exam content ONLY — not document.body — to avoid sidebar lag
    const el = document.getElementById('exam-content-area')
    if (!el) return
    window.renderMathInElement(el, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    })
  }, 200)
}

const handleExamUpdate = (data) => {
  if (data.name === route.params.examID) {
    examResource.reload()
  }
}

onMounted(() => {
  renderMath()
  if (socket) {
    socket.on('ai_exam_update', handleExamUpdate)
  }
})

onUnmounted(() => {
  if (socket) {
    socket.off('ai_exam_update', handleExamUpdate)
  }
  if (mathRenderTimer) clearTimeout(mathRenderTimer)
})

onUpdated(() => {
  renderMath()
})

const examResource = createResource({
  url: 'frappe.client.get',
  makeParams() {
    return {
      doctype: 'AI Exam',
      name: route.params.examID
    }
  },
  auto: true
})

const feedbackText = ref('')
const regenerating = ref(false)
const approving = ref(false)
const isGenerating = ref(false)

const blueprintResource = createResource({
  url: 'lms.lms.services.ai_exam.api.get_exam_blueprint',
  makeParams() {
    return { exam_name: route.params.examID }
  },
  onSuccess(data) {
    if (data.success && data.blueprint) {
      blueprintResource.data = data.blueprint
    }
  }
})

// Notification and State handling on Status change
watch(() => examResource.data?.status, (newStatus, oldStatus) => {
  if (newStatus === 'Waiting for Review') {
    if (oldStatus === 'Processing') {
      frappe?.show_alert?.({ message: 'AI đã phân tích xong. Vui lòng duyệt khung đề!', indicator: 'orange' }) || alert('AI đã phân tích xong. Vui lòng duyệt khung đề!')
    }
    isGenerating.value = false  // Reset if somehow we land back here
    blueprintResource.reload()
  } else if (newStatus === 'Completed') {
    isGenerating.value = false
    if (oldStatus === 'Processing') {
      frappe?.show_alert?.({ message: 'Quá trình sinh đề thi đã hoàn tất!', indicator: 'green' }) || alert('Quá trình sinh đề thi đã hoàn tất!')
    }
  } else if (newStatus === 'Failed') {
    isGenerating.value = false
  }
}, { immediate: true })

const requestRegeneration = async () => {
  if (!feedbackText.value) return
  regenerating.value = true
  try {
    const res = await call('lms.lms.services.ai_exam.api.regenerate_blueprint', {
      exam_name: route.params.examID,
      feedback: feedbackText.value
    })
    if (res.success) {
      feedbackText.value = ''
      examResource.reload()
    } else {
      frappe.msgprint('Failed to regenerate blueprint')
    }
  } finally {
    regenerating.value = false
  }
}

const approveBlueprint = async () => {
  approving.value = true
  isGenerating.value = true  // Immediately switch UI
  try {
    const res = await call('lms.lms.services.ai_exam.api.approve_blueprint', {
      exam_name: route.params.examID
    })
    if (!res.success) {
      isGenerating.value = false  // Revert if API failed
      frappe?.show_alert?.({ message: 'Không thể duyệt blueprint, vui lòng thử lại.', indicator: 'red' })
    }
  } catch (e) {
    isGenerating.value = false
  } finally {
    approving.value = false
  }
}

const getStatusTheme = (status) => {
  const map = {
    'Draft': 'gray',
    'Processing': 'blue',
    'Completed': 'emerald',
    'Waiting for Review': 'amber',
    'Failed': 'red'
  }
  return map[status] || 'gray'
}

const getSections = () => {
  return examResource.data?.sections || []
}

const getQuestionsForSection = (section, secIdx) => {
  if (!examResource.data?.questions) return []
  let startIndex = 0
  for (let i = 0; i < secIdx; i++) {
    startIndex += examResource.data.sections[i].num_questions || 0
  }
  const endIndex = startIndex + (section.num_questions || 0)
  return examResource.data.questions.slice(startIndex, endIndex)
}

const parseJSON = (str) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return []
  }
}

const hasMedia = (str) => {
  try {
    const assets = JSON.parse(str)
    return assets && assets.length > 0
  } catch (e) {
    return false
  }
}

const parseMedia = (str) => {
  try {
    return JSON.parse(str) || []
  } catch(e) {
    return []
  }
}

onMounted(() => {
  if (socket) {
    socket.on('ai_exam_update', (data) => {
      if (data.name === route.params.examID) {
        examResource.reload()
      }
    })
  }
})
</script>

<style scoped>
.markdown-content :deep(p) {
  margin-bottom: 0.5rem;
}
.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-content :deep(.katex-display) {
  margin: 1rem 0;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>
