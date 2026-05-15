<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Inter'] p-6 sm:p-10 lg:p-16">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16">
      <div class="flex items-center gap-6">
        <button
          class="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-105 active:scale-95"
          @click="router.back()"
        >
          <icons.ChevronLeft class="h-7 w-7 text-slate-600 dark:text-slate-400 stroke-[3px]" />
        </button>
        <div class="flex flex-col">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight uppercase">{{ __('Thiết lập Đề thi') }}</h2>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{{ __('Tùy chỉnh các thông số để AI tạo ra bộ đề phù hợp nhất.') }}</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button 
          @click="generateQuiz"
          :disabled="loading"
          class="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-widest hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] transition-all active:scale-95 shadow-lg shadow-sky-400/20 disabled:opacity-50"
        >
          <icons.Zap v-if="!loading" class="h-5 w-5" />
          <icons.Loader2 v-else class="h-5 w-5 animate-spin" />
          {{ loading ? __('Đang xử lý...') : __('Bắt đầu tạo') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Left Column: Source -->
      <div class="lg:col-span-7 space-y-10">
        <div class="rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 h-40 w-40 bg-sky-400/5 blur-[80px] rounded-full group-hover:bg-sky-400/10 transition-colors"></div>
          
          <div class="flex items-center gap-4 mb-10 relative z-10">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-sky-400/20">1</div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">{{ __('Nguồn dữ liệu') }}</h3>
          </div>

          <div class="space-y-8 relative z-10">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">{{ __('Tiêu đề bộ đề') }}</label>
              <input 
                v-model="config.title"
                type="text" 
                placeholder="Ví dụ: Kiểm tra cuối kỳ môn Lịch sử"
                class="w-full px-8 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium text-slate-700 dark:text-white focus:ring-4 focus:ring-sky-400/10 transition-all outline-none"
              >
            </div>

            <div 
              @dragover.prevent="dragOver = true" 
              @dragleave="dragOver = false" 
              @drop.prevent="handleDrop"
              :class="[
                'relative flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed p-14 transition-all',
                dragOver ? 'border-sky-400 bg-sky-50/30' : 'border-slate-100 dark:border-slate-800 bg-slate-50/30'
              ]"
            >
              <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white dark:bg-slate-800 shadow-xl text-4xl group-hover:scale-110 transition-transform relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {{ file ? '📄' : '☁️' }}
              </div>
              
              <div v-if="!file" class="text-center">
                <p class="text-lg font-bold text-slate-800 dark:text-white mb-2">{{ __('Kéo thả tài liệu vào đây') }}</p>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-widest mb-8">{{ __('Hỗ trợ PDF, DOCX, TXT tối đa 20MB') }}</p>
                <input type="file" ref="fileInput" class="hidden" accept=".pdf,.docx,.txt" @change="handleFile">
                <button @click="$refs.fileInput.click()" class="px-10 py-4 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-400/20 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all">
                  {{ __('CHỌN TỪ THIẾT BỊ') }}
                </button>
              </div>
              
              <div v-else class="flex items-center gap-6 w-full max-w-md p-6 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 shadow-xl shadow-sky-400/20">
                <div class="h-14 w-14 rounded-xl bg-white/30 flex items-center justify-center text-2xl shadow-inner">📄</div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-bold truncate">{{ file.name }}</div>
                  <div class="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</div>
                </div>
                <button @click="file = null" class="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center hover:bg-black/10 transition-all">✕</button>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">{{ __('Yêu cầu bổ sung') }}</label>
              <textarea 
                v-model="config.prompt"
                rows="4"
                placeholder="VD: Tập trung vào kiến thức chương 2, câu hỏi mang tính thực tế..."
                class="w-full px-8 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium text-slate-700 dark:text-white focus:ring-4 focus:ring-sky-400/10 transition-all outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Settings -->
      <div class="lg:col-span-5 space-y-10">
        <div class="rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 h-40 w-40 bg-amber-400/5 blur-[80px] rounded-full group-hover:bg-amber-400/10 transition-colors"></div>

          <div class="flex items-center gap-4 mb-10 relative z-10">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-400/20">2</div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">{{ __('Cấu hình AI') }}</h3>
          </div>

          <div class="space-y-10 relative z-10">
            <!-- Bloom Levels Dropdown -->
            <div>
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{{ __('Mức độ nhận thức (Bloom)') }}</h4>
              <div class="relative group/select">
                <select 
                  v-model="config.level"
                  class="w-full px-6 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all outline-none appearance-none cursor-pointer hover:bg-slate-100/50"
                >
                  <option v-for="level in bloomLevels" :key="level.id" :value="level.id">
                    {{ level.emoji }} {{ level.label }}
                  </option>
                </select>
                <icons.ChevronDown class="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-focus-within/select:text-sky-400 transition-colors" />
              </div>
            </div>

            <!-- Language Dropdown -->
            <div>
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{{ __('Ngôn ngữ câu hỏi') }}</h4>
              <div class="relative group/select">
                <select 
                  v-model="config.language"
                  class="w-full px-6 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all outline-none appearance-none cursor-pointer hover:bg-slate-100/50"
                >
                  <option v-for="lang in languages" :key="lang.id" :value="lang.id">
                    {{ lang.emoji }} {{ lang.label }}
                  </option>
                </select>
                <icons.ChevronDown class="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-focus-within/select:text-sky-400 transition-colors" />
              </div>
            </div>

            <!-- Question Types Configuration -->
            <div>
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">{{ __('Cấu hình từng loại câu hỏi') }}</h4>
              <div class="space-y-6">
                <!-- Choices -->
                <div class="p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:bg-gradient-to-br hover:from-white hover:to-sky-50 transition-all group/item">
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <div class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Choices</div>
                      <div class="text-[10px] font-medium text-slate-400 uppercase">{{ __('Trắc nghiệm 4 đáp án') }}</div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex-1">
                      <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-2">{{ __('Số câu') }}</div>
                      <div class="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm focus-within:border-sky-400 transition-colors">
                        <button @click="config.questions.choices.count = Math.max(0, config.questions.choices.count - 1)" class="p-3 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-sky-500 font-bold">−</button>
                        <input v-model.number="config.questions.choices.count" type="number" class="w-20 text-center text-sm font-bold bg-transparent border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                        <button @click="config.questions.choices.count++" class="p-3 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-sky-500 font-bold">+</button>
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-2">{{ __('Điểm/câu') }}</div>
                      <div class="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm focus-within:border-sky-400 transition-colors">
                        <input v-model.number="config.questions.choices.points" type="number" class="w-full p-2 text-center text-xs font-bold bg-transparent border-none focus:ring-0">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Input -->
                <div class="p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:bg-gradient-to-br hover:from-white hover:to-sky-50 transition-all group/item">
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <div class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Input</div>
                      <div class="text-[10px] font-medium text-slate-400 uppercase">{{ __('Điền vào chỗ trống') }}</div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex-1">
                      <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-2">{{ __('Số câu') }}</div>
                      <div class="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm focus-within:border-sky-400 transition-colors">
                        <button @click="config.questions.input.count = Math.max(0, config.questions.input.count - 1)" class="p-3 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-sky-500 font-bold">−</button>
                        <input v-model.number="config.questions.input.count" type="number" class="w-20 text-center text-sm font-bold bg-transparent border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                        <button @click="config.questions.input.count++" class="p-3 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-sky-500 font-bold">+</button>
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-2">{{ __('Điểm/câu') }}</div>
                      <div class="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm focus-within:border-sky-400 transition-colors">
                        <input v-model.number="config.questions.input.points" type="number" class="w-full p-2 text-center text-xs font-bold bg-transparent border-none focus:ring-0">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Open ended -->
                <div class="p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:bg-gradient-to-br hover:from-white hover:to-sky-50 transition-all group/item">
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <div class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Open ended</div>
                      <div class="text-[10px] font-medium text-slate-400 uppercase">{{ __('Tự luận ngắn') }}</div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex-1">
                      <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-2">{{ __('Số câu') }}</div>
                      <div class="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm focus-within:border-sky-400 transition-colors">
                        <button @click="config.questions.open.count = Math.max(0, config.questions.open.count - 1)" class="p-3 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-sky-500 font-bold">−</button>
                        <input v-model.number="config.questions.open.count" type="number" class="w-20 text-center text-sm font-bold bg-transparent border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                        <button @click="config.questions.open.count++" class="p-3 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-sky-500 font-bold">+</button>
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-2">{{ __('Điểm/câu') }}</div>
                      <div class="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm focus-within:border-sky-400 transition-colors">
                        <input v-model.number="config.questions.open.points" type="number" class="w-full p-2 text-center text-xs font-bold bg-transparent border-none focus:ring-0">
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

    <!-- Success Modal -->
    <div v-if="success" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
      <div class="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
        <div class="absolute -top-12 -right-12 h-40 w-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div class="h-32 w-32 bg-yellow-50 dark:bg-yellow-900/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <div class="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
          <icons.Sparkles class="h-16 w-16 text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-orange-500 relative z-10 fill-yellow-300" style="color: #facc15" />
        </div>
        <h3 class="text-2xl font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-tight">{{ __('Gửi yêu cầu thành công') }}</h3>
        <p class="text-sm text-slate-500 font-medium mb-10 leading-relaxed">{{ __('AI đang tiến hành phân tích và tạo bộ đề. Bạn có thể theo dõi tiến độ tại Dashboard.') }}</p>
        <button 
          @click="router.push({ name: 'AIQuizDashboard' })"
          class="w-full py-5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-widest shadow-xl shadow-sky-400/20"
        >
          {{ __('Quay lại Dashboard') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createResource } from 'frappe-ui'
import * as icons from 'lucide-vue-next'

import { frappeRequest } from 'frappe-ui'

const router = useRouter()
const file = ref(null)
const dragOver = ref(false)
const loading = ref(false)
const success = ref(false)

const config = reactive({
  title: '',
  prompt: '',
  level: 'Apply/Analyze',
  language: 'vi',
  questions: {
    choices: { count: 8, points: 1 },
    input: { count: 4, points: 2 },
    open: { count: 3, points: 5 }
  }
})

const bloomLevels = [
  { id: 'Remember/Understand', label: 'Biết + Hiểu', desc: 'Kiến thức cơ bản & Ghi nhớ', emoji: '📚' },
  { id: 'Apply/Analyze', label: 'Áp dụng + Phân tích', desc: 'Giải quyết vấn đề & Logic', emoji: '⚙️' },
  { id: 'Evaluate/Create', label: 'Đánh giá + Sáng tạo', desc: 'Phản biện & Thiết kế mới', emoji: '💎' }
]

const languages = [
  { id: 'vi', label: 'Tiếng Việt', emoji: '🇻🇳' },
  { id: 'en', label: 'English', emoji: '🇺🇸' }
]

const handleFile = (e) => {
  const f = e.target.files[0]
  if (f) file.value = f
}

const handleDrop = (e) => {
  dragOver.value = false
  const f = e.dataTransfer.files[0]
  if (f) file.value = f
}

// 2. Generation Request
const quizGenerator = createResource({
  url: 'lms.lms.services.ai_quiz.api.create_quiz_request',
  onSuccess: () => {
    loading.value = false
    success.value = true
  }
})

const generateQuiz = async () => {
  if (!file.value && !config.prompt) return
  
  loading.value = true
  let file_url = null

  if (file.value) {
    const formData = new FormData()
    formData.append('file', file.value)

    try {
      const token = window.csrf_token || (window.frappe && window.frappe.csrf_token)
      console.log('Uploading using direct fetch. CSRF:', !!token)
      
      const response = await fetch('/api/method/lms.lms.services.ai_quiz.api.upload_source_file', {
        method: 'POST',
        headers: {
          'X-Frappe-CSRF-Token': token,
        },
        body: formData,
      })
      const result = await response.json()
      console.log('Upload Result:', result)
      
      if (result.message && result.message.file_url) {
        file_url = result.message.file_url
      } else {
        throw new Error(result._server_messages || 'Upload failed')
      }
    } catch (e) {
      console.error('Upload Error:', e)
      loading.value = false
      return
    }
  }

  quizGenerator.submit({
    title: config.title || 'AI Generated Quiz',
    bloom_level: config.level,
    language: config.language,
    prompt: config.prompt,
    file_url: file_url,
    config: config.questions
  })
}
</script>
