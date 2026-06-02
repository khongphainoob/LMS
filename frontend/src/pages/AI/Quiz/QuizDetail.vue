<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Inter']">
    <!-- Header Section -->
    <div class="p-6 sm:p-8 lg:p-10 pb-0">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-10 mb-8">
        <div class="flex items-center gap-6">
          <button
            class="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-105 active:scale-95"
            @click="router.push({ name: 'AIQuizDashboard' })"
          >
            <icons.ChevronLeft class="h-7 w-7 text-slate-600 dark:text-slate-400 stroke-[3px]" />
          </button>
          <div class="flex flex-col min-w-0">
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase truncate">{{ quiz.title || __('Loading...') }}</h2>
            <div class="flex items-center gap-2 mt-2">
              <span class="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/30 text-[9px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-[0.2em] border border-sky-200/50 dark:border-sky-800/50">
                {{ __('Detailed Data from AI') }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button 
            v-if="quiz.status === 'Failed'"
            @click="retryQuiz"
            class="flex items-center gap-3 px-8 py-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase tracking-widest hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all active:scale-95"
          >
            <icons.RefreshCw class="h-4 w-4" />
            {{ __('Retry') }}
          </button>
          <button 
            @click="syncToLMS"
            :disabled="syncResource.loading"
            class="flex items-center gap-3 px-8 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-95 disabled:opacity-50"
          >
            <icons.RefreshCw class="h-4 w-4" :class="{ 'animate-spin': syncResource.loading }" />
            {{ syncResource.loading ? __('Syncing...') : __('Sync LMS') }}
          </button>
          <button 
            @click="exportToExcel"
            class="flex items-center gap-3 px-8 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/10 transition-all active:scale-95"
          >
            <icons.FileSpreadsheet class="h-4 w-4" />
            {{ __('Export to Excel') }}
          </button>
          <button 
            @click="saveChanges"
            :disabled="saveResource.loading"
            class="flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all active:scale-95 shadow-lg shadow-sky-400/20 disabled:opacity-50"
          >
            <icons.Save class="h-4 w-4" />
            {{ saveResource.loading ? __('Saving...') : __('Save changes') }}
          </button>
        </div>
      </div>
    </div>

    <div class="p-6 sm:p-8 lg:p-10 pt-0">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Sidebar Info (Sticky) -->
        <div class="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-8">
          <div class="rounded-[2rem] bg-gradient-to-br from-white to-sky-50/30 dark:from-slate-900 dark:to-slate-900 border border-slate-100 dark:border-slate-800 border-l-4 border-l-sky-400 p-8 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 h-24 w-24 bg-sky-400/10 blur-2xl rounded-full"></div>
            
            <h3 class="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider mb-8 relative z-10 flex items-center gap-3">
              <span class="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
              {{ __('Question Set Parameters') }}
            </h3>
            
            <div class="space-y-6 relative z-10">
              <div class="flex justify-between items-center pb-4 border-b border-slate-100/50 dark:border-slate-800">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{{ __('Status') }}</span>
                <span 
                  :style="{ backgroundColor: (quiz.status && quiz.status.toLowerCase().includes('complete')) ? '#059669' : '#dc2626' }"
                  class="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border-2 border-white dark:border-slate-800 shadow-xl shadow-emerald-500/20"
                >
                  {{ quiz.status || 'Processing' }}
                </span>
              </div>
              <div class="flex justify-between items-center pb-4 border-b border-slate-100/50 dark:border-slate-800">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{{ __('Bloom Level') }}</span>
                <span class="text-sm font-black text-slate-800 dark:text-white">{{ quiz.bloom_level }}</span>
              </div>
              <div class="flex justify-between items-center pb-4 border-b border-slate-100/50 dark:border-slate-800">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{{ __('Language') }}</span>
                <span class="text-sm font-black text-slate-800 dark:text-white uppercase">{{ quiz.language === 'vi' ? __('Vietnamese') : 'English' }}</span>
              </div>
              <div v-if="quiz.source_file" class="pt-4">
                <span class="block text-[11px] font-bold text-slate-400 uppercase mb-4 tracking-tight">{{ __('Source Document') }}</span>
                <a :href="quiz.source_file" target="_blank" class="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-sky-400 transition-all group shadow-sm">
                  <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-2xl shadow-lg shadow-sky-400/20">📄</div>
                  <div class="flex-1 min-w-0">
                    <span class="block text-[10px] font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{{ quiz.source_file.split('/').pop() }}</span>
                    <span class="text-[9px] font-bold text-sky-500 uppercase tracking-widest">{{ __('View document') }}</span>
                  </div>
                  <icons.ChevronRight class="h-4 w-4 text-slate-300 group-hover:text-sky-500 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content: Questions (Scrollable) -->
        <div class="lg:col-span-8 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-20">
          <div 
            v-for="(q, index) in displayQuestions" 
            :key="index" 
            class="group relative rounded-[2rem] bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-900 border border-slate-100 dark:border-slate-800 border-l-4 border-l-sky-400 p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-sky-400/5 overflow-hidden"
          >
            <div class="absolute -right-16 -top-16 h-32 w-32 bg-sky-400/5 blur-[60px] rounded-full group-hover:bg-sky-400/10 transition-colors"></div>
            
            <!-- Question Content Header -->
            <div class="flex items-start justify-between mb-8 relative z-10">
              <div class="flex items-center gap-5">
                <div class="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-300 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-emerald-400/20 group-hover:scale-110 transition-transform border-4 border-white dark:border-slate-800">
                  {{ index + 1 }}
                </div>
                <div class="flex flex-col gap-1">
                  <span class="px-3 py-1 w-fit rounded-md bg-sky-50 dark:bg-sky-900/20 text-[9px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-[0.2em] border border-sky-100 dark:border-sky-900/50">
                    {{ q.type }}
                  </span>
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">{{ q.points }} Points</span>
                </div>
              </div>

              <!-- Quick Actions Cluster (Top Right) -->
              <div class="flex items-center gap-2">
                <button 
                  @click="editQuestion(index)"
                  class="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                  :title="__('Edit Question')"
                >
                  <icons.Edit2 class="h-4 w-4" />
                </button>
                <button 
                  @click="deleteQuestion(index)"
                  class="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                  :title="__('Delete question')"
                >
                  <icons.Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>

            <h4 class="text-[17px] font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed relative z-10">{{ q.question }}</h4>

            <!-- Options (MCQ) -->
            <div v-if="q.options && q.options.length" class="grid grid-cols-1 gap-3 mb-10 relative z-10">
                <div 
                  v-for="(opt, i) in q.options" 
                  :key="i"
                  class="opt-card"
                  :class="{ 'opt-card-correct': opt.correct }"
                >
                  <div class="opt-label" :class="{ 'opt-label-correct': opt.correct }">
                    {{ opt.label }}
                  </div>
                  <div class="opt-text" :class="{ 'opt-text-correct': opt.correct }">
                    {{ opt.text }}
                  </div>
                  <div v-if="opt.correct" class="opt-badge">
                    <icons.CheckCircle2 class="h-4 w-4" />
                    <span>{{ __('Correct') }}</span>
                  </div>
                </div>
            </div>

            <!-- Answer/Rubric Block -->
            <div v-if="q.answer && q.type !== 'Choices'" class="p-8 rounded-[2rem] bg-sky-50/50 dark:bg-sky-900/20 border-2 border-sky-200 dark:border-sky-500/30 text-slate-800 dark:text-sky-100 shadow-xl shadow-sky-500/5 relative overflow-hidden group/answer z-10">
              <div class="absolute -right-10 -bottom-10 h-40 w-40 bg-sky-400/10 rounded-full blur-3xl group-hover/answer:scale-125 transition-transform"></div>
              <div class="relative">
                <div class="flex items-center gap-3 mb-4">
                  <div class="h-9 w-9 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 text-slate-900 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)] animate-pulse border-2 border-white/50">
                    <icons.Zap class="h-5 w-5 fill-current" />
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 dark:text-yellow-400 drop-shadow-sm">{{ q.type === 'Open Ended' ? __('Grading Guide / Rubric') : __('Expected Answer') }}</span>
                </div>
                <div class="p-4 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-sky-100 dark:border-sky-800/50">
                  <p class="text-[14px] font-bold leading-relaxed text-slate-700 dark:text-slate-200">{{ q.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Question Modal -->
    <div v-if="editModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
      <div class="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">{{ __('Edit Question') }}</h3>
          <button @click="editModalOpen = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <icons.X class="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          <!-- Question Text -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{{ __('Question') }}</label>
            <textarea v-model="editingQuestion.question" rows="3" class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium focus:border-sky-400 focus:ring-0 transition-colors"></textarea>
          </div>

          <!-- Points -->
          <div class="w-32">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{{ __('Score') }}</label>
            <input type="number" v-model.number="editingQuestion.points" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-center" />
          </div>

          <!-- Options for Choices -->
          <div v-if="editingQuestion.type === 'Choices'" class="space-y-4">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ __('Options & Answers') }}</label>
            <div v-for="i in 4" :key="i" class="flex items-center gap-4">
              <input type="checkbox" v-model="editingQuestion[`is_correct_${i}`]" class="h-6 w-6 rounded-lg text-emerald-500 focus:ring-emerald-500 border-slate-300" />
              <input v-model="editingQuestion[`option_${i}`]" type="text" :placeholder="__('Option ') + i" class="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm" />
            </div>
          </div>

          <!-- Answer / Rubric -->
          <div v-if="editingQuestion.type === 'User Input'">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{{ __('Accepted Answer') }}</label>
            <input v-model="editingQuestion.possibility_1" type="text" class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm" />
          </div>

          <div v-if="editingQuestion.type === 'Open Ended'">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{{ __('Grading Guide / Rubric') }}</label>
            <textarea v-model="editingQuestion.scoring_rubric" rows="4" class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"></textarea>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
          <button @click="editModalOpen = false" class="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
            {{ __('Cancel') }}
          </button>
          <button 
            @click="saveEdit" 
            class="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-300 to-blue-400 text-slate-950 text-sm font-bold uppercase tracking-widest hover:brightness-105 transition-all active:scale-95 border border-white/40 shadow-sm"
          >
            {{ __('Update') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createResource, call } from 'frappe-ui'
import * as icons from 'lucide-vue-next'

const props = defineProps(['quizID'])
const router = useRouter()

const questionsList = ref([])
const editModalOpen = ref(false)
const editingIdx = ref(null)
const editingQuestion = reactive({
  question: '',
  type: '',
  points: 1,
  option_1: '',
  option_2: '',
  option_3: '',
  option_4: '',
  is_correct_1: false,
  is_correct_2: false,
  is_correct_3: false,
  is_correct_4: false,
  explanation: '',
  possibility_1: '',
  scoring_rubric: ''
})

// 1. Fetch Quiz Data
const quizResource = createResource({
  url: 'frappe.client.get',
  params: {
    doctype: 'AI Quiz',
    name: props.quizID
  },
  auto: false,
  onSuccess: (data) => {
    questionsList.value = data.questions || []
  }
})

const saveResource = createResource({
  url: 'lms.lms.services.ai_quiz.api.save_quiz_changes',
  onSuccess: () => {
    // Optionally show success toast
    quizResource.fetch()
  }
})

const syncResource = createResource({
  url: 'lms.lms.services.ai_quiz.api.sync_to_lms',
  onSuccess: (data) => {
    alert(__('LMS Quiz created successfully!'))
  },
  onError: (err) => {
    alert(__('Sync failed: ') + (err.messages?.[0] || err))
  }
})

const syncToLMS = () => {
  if (confirm(__('Are you sure you want to sync this question set to the official LMS system?'))) {
    syncResource.submit({
      quiz_id: props.quizID
    })
  }
}

const retryQuiz = () => {
  if (confirm(__('Are you sure you want to retry this failed quiz?'))) {
    call('lms.lms.services.ai_quiz.api.retry_quiz', { quiz_id: props.quizID })
      .then(() => {
        quizResource.fetch()
      })
      .catch((err) => console.error(err))
  }
}

onMounted(() => {
  quizResource.fetch()
})

const quiz = computed(() => quizResource.data || {})

// Helper to format questions for display
const displayQuestions = computed(() => {
  return questionsList.value.map(q => {
    let qObj = {
      ...q,
      options: [],
      answer: ""
    }

    if (q.type === 'Choices') {
      const labels = ['A', 'B', 'C', 'D']
      for (let i = 1; i <= 4; i++) {
        if (q[`option_${i}`]) {
          qObj.options.push({
            label: labels[i-1],
            text: q[`option_${i}`],
            correct: q[`is_correct_${i}`]
          })
        }
      }
      qObj.answer = q.explanation || ""
    } else if (q.type === 'User Input') {
      qObj.answer = q.possibility_1 || ""
    } else if (q.type === 'Open Ended') {
      qObj.answer = q.scoring_rubric || q.sample_answer || ""
    }

    return qObj
  })
})

const deleteQuestion = (index) => {
  if (confirm(__('Are you sure you want to delete this question?'))) {
    questionsList.value.splice(index, 1)
  }
}

const editQuestion = (index) => {
  const q = questionsList.value[index]
  editingIdx.value = index
  Object.assign(editingQuestion, { ...q })
  editModalOpen.value = true
}

const saveEdit = () => {
  questionsList.value[editingIdx.value] = { ...editingQuestion }
  editModalOpen.value = false
}

const saveChanges = () => {
  saveResource.submit({
    quiz_id: props.quizID,
    questions: questionsList.value
  })
}

const exportToExcel = () => {
  if (!questionsList.value.length) return

  // 1. Prepare CSV Header matching Frappe LMS import format
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
  csvContent += "question,type,marks,option_1,option_2,option_3,option_4,is_correct_1,is_correct_2,is_correct_3,is_correct_4,explanation,possibility_1,possibility_2,scoring_rubric\n"

  // 2. Add Data rows
  questionsList.value.forEach((q) => {
    const row = [
      `"${(q.question || "").replace(/"/g, '""')}"`,
      `"${q.type || ""}"`,
      q.points || 1,
      `"${(q.option_1 || "").replace(/"/g, '""')}"`,
      `"${(q.option_2 || "").replace(/"/g, '""')}"`,
      `"${(q.option_3 || "").replace(/"/g, '""')}"`,
      `"${(q.option_4 || "").replace(/"/g, '""')}"`,
      q.is_correct_1 ? 1 : 0,
      q.is_correct_2 ? 1 : 0,
      q.is_correct_3 ? 1 : 0,
      q.is_correct_4 ? 1 : 0,
      `"${(q.explanation || "").replace(/"/g, '""')}"`,
      `"${(q.possibility_1 || "").replace(/"/g, '""')}"`,
      `"${(q.possibility_2 || "").replace(/"/g, '""')}"`,
      `"${(q.scoring_rubric || "").replace(/"/g, '""')}"`
    ]
    csvContent += row.join(",") + "\n"
  })

  // 3. Trigger download
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `${quiz.value.title || 'quiz'}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
/* Quiz Options Styling */
.opt-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 2px solid #f1f5f9;
  background-color: #ffffff;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 0.75rem;
}
.opt-card-correct {
  border-color: #10b981;
  background-color: #f0fdf4;
}
.dark .opt-card {
  background-color: #1e293b;
  border-color: #334155;
}
.dark .opt-card-correct {
  background-color: rgba(16, 185, 129, 0.1);
}

.opt-label {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 900;
  font-size: 0.875rem;
  background-color: #0ea5e9; /* Sky Blue */
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);
}
.opt-label-correct {
  background-color: #10b981; /* Emerald Green */
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
  transform: scale(1.1);
}

.opt-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.25;
}
.opt-text-correct {
  color: #064e3b;
}
.dark .opt-text {
  color: #f8fafc;
}
.dark .opt-text-correct {
  color: #d1fae5;
}

.opt-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  background-color: #10b981;
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
}
</style>
