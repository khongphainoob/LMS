<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-[#050811] dark:to-[#0f1423] pb-12 transition-colors duration-300 print:bg-white print:pb-0 print:min-h-0">
    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 shadow-sm print:hidden">
      <div class="mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button icon="chevron-left" variant="ghost" @click="router.push({ name: 'ExamDetail', params: { examID: route.params.examID } })" />
          <div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ __('Print Preview') }}</h1>
          </div>
        </div>
        
        <div class="flex gap-2">
          <Button variant="outline" @click="exportDocx" :loading="exportingDocx" :disabled="exportingDocx" icon-left="download">{{ __('Export DOCX') }}</Button>
          <Button variant="solid" theme="emerald" @click="exportPdf" icon-left="download">{{ __('Export PDF') }}</Button>
        </div>
      </div>
    </header>

    <main class="py-8 flex justify-center overflow-x-auto print:py-0 print:overflow-visible">
      
      <!-- A4 Paper Mockup -->
      <div id="print-area" class="bg-white text-black w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] print:shadow-none print:w-full print:m-0 print:p-0" style="line-height: 1.5;">
        
        <!-- Header -->
        <div class="flex justify-between border-b-2 border-black pb-4 mb-6">
          <div class="text-center w-1/2 border-r border-black pr-4">
            <div class="font-bold">{{ (examResource.data?.school_name || 'TRƯỜNG.........................').toUpperCase() }}</div>
            <div class="font-bold">{{ examResource.data?.department || 'TỔ..............................' }}</div>
          </div>
          <div class="text-center w-1/2 pl-4">
            <div class="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div class="font-bold">Độc lập - Tự do - Hạnh phúc</div>
          </div>
        </div>

        <!-- Title -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold mb-2">{{ nfc(examResource.data?.title).toUpperCase() }}</h1>
          <div class="font-bold">Môn: {{ nfc(examResource.data?.subject) }} - Lớp: {{ nfc(examResource.data?.grade_level) }}</div>
          <div>Thời gian làm bài: {{ examResource.data?.duration_minutes }} phút (Không kể thời gian phát đề)</div>
        </div>

        <!-- Student Info -->
        <div class="mb-8">
          <div>Họ và tên học sinh: .......................................................................</div>
          <div>Lớp: ........................ Số báo danh: ........................</div>
        </div>

        <!-- Content -->
        <div v-for="(section, secIdx) in examResource.data?.sections" :key="section.section_title" class="mb-6">
          <div class="font-bold mb-2">{{ nfc(section.section_title).toUpperCase() }}</div>
          <div class="italic mb-4">{{ nfc(section.section_instructions) }}</div>
          
          <div v-for="q in getQuestionsForSection(section, secIdx)" :key="q.question_number" class="mb-4">
            <div class="flex">
              <span class="font-bold mr-2 whitespace-nowrap">Câu {{ q.question_number || q.idx || secIdx * 10 + q.question_number }} ({{ q.points || 0.25 }} điểm):</span>
              <div>
                <div class="markdown-content mb-3" v-html="renderMarkdown(q.question_text)"></div>
                
                <!-- Media Assets -->
                <div v-if="hasMedia(q.media_assets)" class="my-4">
                  <img v-for="(media, i) in parseMedia(q.media_assets)" :key="i" :src="`data:image/png;base64,${media.content}`" class="max-w-md mx-auto rounded-lg border border-slate-200" />
                </div>
                
                <div v-if="q.question_type === 'Multiple Choice' && q.options" class="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                  <div v-for="(opt, idx) in parseJSON(q.options)" :key="idx" class="markdown-content flex gap-1 items-start">
                    <span class="font-bold">{{ String.fromCharCode(65 + idx) }}.</span>
                    <span v-html="renderMarkdown(cleanOptionText(opt))"></span>
                  </div>
                </div>

                <div v-else-if="q.question_type === 'True/False' && q.options" class="grid grid-cols-1 gap-2 mt-2 ml-4">
                  <div v-for="(opt, idx) in parseJSON(q.options)" :key="idx" class="markdown-content flex gap-2 items-start">
                    <span class="font-bold">{{ String.fromCharCode(97 + idx) }})</span>
                    <span v-html="renderMarkdown(cleanOptionText(opt))"></span>
                  </div>
                </div>

                <!-- Answer & Solution -->
                <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm print:bg-transparent print:border-gray-400">
                  <div class="font-bold text-gray-800 print:text-black mb-1">Đáp án: {{ q.correct_answer }}</div>
                  <div v-if="q.solution" class="markdown-content text-gray-700 print:text-black mt-1" v-html="renderMarkdown(q.solution)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- End of Exam -->
        <div class="text-center font-bold mt-12">
          ----- HẾT -----
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { inject, onMounted, onUpdated, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createResource, Button, call } from 'frappe-ui'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({ html: true, breaks: true })

const nfc = (text) => text ? String(text).normalize('NFC') : ''

const renderMarkdown = (text) => {
  if (!text) return ''
  const rawHtml = md.render(nfc(text))
  return DOMPurify.sanitize(rawHtml)
}

const cleanOptionText = (opt) => {
  let text = opt.option_text || opt.text || opt || ''
  if (typeof text === 'string') {
    text = text.replace(/^[A-Z][\.\:\)]\s*/i, '')
  }
  return text
}

let mathRenderTimer = null
const renderMath = () => {
  if (mathRenderTimer) clearTimeout(mathRenderTimer)
  mathRenderTimer = setTimeout(() => {
    if (!window.renderMathInElement) return
    const el = document.getElementById('print-area')
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

onMounted(() => {
  renderMath()
})

onUpdated(() => {
  renderMath()
})

const router = useRouter()
const route = useRoute()
const examResource = createResource({
  url: 'frappe.client.get',
  cache: ['exam_detail', route.params.examID],
  makeParams() {
    return {
      doctype: 'AI Exam',
      name: route.params.examID
    }
  },
  auto: true
})

const parseJSON = (str) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return []
  }
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

const exportingDocx = ref(false)

const exportDocx = async () => {
  exportingDocx.value = true
  try {
    const r = await call('lms.lms.services.ai_exam.api.export_docx', { 
      exam_name: route.params.examID 
    })
    if (r.success && r.file_url) {
      window.open(r.file_url, '_blank')
    } else {
      frappe.msgprint(__('Export failed: ') + (r.error || 'Unknown error'))
    }
  } catch(e) {
    frappe.msgprint(__('Export failed'))
  } finally {
    exportingDocx.value = false
  }
}

const exportPdf = () => {
  window.print()
}
</script>

<style scoped>
.markdown-content :deep(p) { margin-bottom: 0.5rem; }
.markdown-content :deep(p:last-child) { margin-bottom: 0; }
</style>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #print-area, #print-area * {
    visibility: visible;
  }
  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0 !important;
    padding: 0 !important;
  }
  @page {
    margin: 1.5cm;
    size: A4 portrait;
  }
}
</style>
