<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Inter']">
    <!-- Header Section -->
    <div class="p-6 sm:p-10 lg:p-16">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16">
        <div class="flex items-center gap-6">
          <button
            class="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-105 active:scale-95"
            @click="router.push({ name: 'AIIntegration' })"
          >
            <icons.ChevronLeft class="h-7 w-7 text-slate-600 dark:text-slate-400 stroke-[3px]" />
          </button>
          <div class="flex flex-col">
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight uppercase">{{ __('AI Quiz Creator') }}</h2>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{{ __('Automate the question generation process from source documents.') }}</p>
          </div>
        </div>
        
        <button 
          @click="router.push({ name: 'AIQuizForm' })"
          class="flex items-center gap-4 px-10 py-5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-widest hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] transition-all active:scale-95 shadow-lg shadow-sky-400/20"
        >
          <icons.PlusCircle class="h-5 w-5" />
          {{ __('Create new test') }}
        </button>
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div v-for="stat in statsCards" :key="stat.label" class="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:bg-gradient-to-br hover:from-white hover:to-slate-50 dark:hover:from-slate-900 dark:hover:to-slate-800 group">
          <div class="flex items-center justify-between mb-4">
            <div :class="`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} bg-opacity-10 shadow-inner group-hover:scale-110 transition-transform`">
              <component :is="stat.icon" :class="`h-6 w-6 ${stat.textColor}`" />
            </div>
            <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{{ stat.trend }}</span>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white mb-1">{{ stat.value }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ __(stat.label) }}</div>
          <!-- Decorative Background Glow -->
          <div :class="`absolute -bottom-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${stat.color}`"></div>
        </div>
      </div>

      <!-- Quiz List Section -->
      <div class="rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 right-0 h-64 w-64 bg-sky-400/5 blur-[100px] rounded-full"></div>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
          <div>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{{ __('Quiz List') }}</h3>
            <p class="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">{{ __('Manage AI Question Resource Hub') }}</p>
          </div>
        </div>

        <!-- Quiz List -->
        <div class="relative z-10">
          <template v-if="quizzes && quizzes.length">
            <div class="max-h-[500px] overflow-y-auto pr-4 custom-scrollbar space-y-3">
              <div 
                v-for="quiz in quizzes" 
                :key="quiz?.name"
                @click="quiz?.name && router.push({ name: 'AIQuizDetail', params: { quizID: quiz.name } })"
                class="group relative flex flex-col md:flex-row md:items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-900 transition-all cursor-pointer hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
              >
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-900/20 text-xl mb-3 md:mb-0 md:mr-6 group-hover:scale-110 transition-transform shadow-inner">
                  📄
                </div>
                
                <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div class="lg:col-span-5">
                    <h4 class="text-base font-bold text-slate-800 dark:text-white mb-0.5 group-hover:text-sky-500 transition-colors truncate">{{ quiz.title }}</h4>
                    <div class="flex items-center gap-3">
                      <span 
                        :style="{ backgroundColor: (quiz.status && quiz.status.toLowerCase().includes('complete')) ? '#059669' : (quiz.status === 'Processing' ? '#fef3c7' : '#ef4444') }"
                        :class="[
                          'text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm border border-white/20',
                          (quiz.status && quiz.status.toLowerCase().includes('complete')) ? 'text-white' : (quiz.status === 'Processing' ? 'text-amber-700 animate-pulse' : 'text-white')
                        ]"
                      >
                        {{ quiz.status }}
                      </span>
                      <span class="text-[8px] font-medium text-slate-300 uppercase">#{{ quiz.name }}</span>
                    </div>
                  </div>

                  <div class="lg:col-span-2 flex flex-col">
                    <span class="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{{ __('Date Created') }}</span>
                    <span class="text-[11px] font-medium text-slate-500">{{ quiz.creation?.split(' ')[0] }}</span>
                  </div>

                  <div class="lg:col-span-2 flex flex-col">
                    <span class="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{{ __('Level') }}</span>
                    <span class="text-[11px] font-medium text-slate-500">{{ quiz.bloom_level }}</span>
                  </div>

                  <div class="lg:col-span-3 flex items-center justify-end gap-2">
                    <button 
                      @click.stop="router.push({ name: 'AIQuizDetail', params: { quizID: quiz.name } })"
                      class="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all border border-slate-100 dark:border-slate-700"
                    >
                      <icons.Edit2 class="h-3.5 w-3.5" />
                    </button>
                    <button 
                      @click.stop="deleteQuiz(quiz.name)"
                      class="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-slate-100 dark:border-slate-700"
                    >
                      <icons.Trash2 class="h-3.5 w-3.5" />
                    </button>
                    <icons.ChevronRight class="h-4 w-4 text-slate-200 group-hover:text-sky-500 transition-colors ml-1" />
                  </div>
                </div>
              </div>
            </div>
            <!-- Pagination Control -->
            <div v-if="quizzesResource.hasNextPage" class="mt-6 flex justify-center">
              <button 
                @click="quizzesResource.next()"
                :disabled="quizzesResource.loading"
                class="group flex items-center gap-3 px-10 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-sky-500 hover:border-sky-400 transition-all active:scale-95 disabled:opacity-50"
              >
                <icons.RefreshCcw :class="['h-3.5 w-3.5', quizzesResource.loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500']" />
                {{ quizzesResource.loading ? __('Loading...') : __('View more question sets') }}
              </button>
            </div>
          </template>

          <!-- Empty State -->
          <div v-if="!quizzes.length" class="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <div class="h-20 w-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm">🏜️</div>
            <h4 class="text-xl font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-tight">{{ __('Empty archive') }}</h4>
            <p class="text-sm text-slate-400 font-medium mb-8 text-center max-w-xs">{{ __('Start creating your first exercise with AI help today.') }}</p>
            <button 
              @click="router.push({ name: 'AIQuizForm' })" 
              class="px-12 py-4 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all active:scale-95 shadow-lg shadow-sky-400/20"
            >
              {{ __('Create now') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createResource, createListResource } from 'frappe-ui'
import * as icons from 'lucide-vue-next'

const router = useRouter()

// 1. Quizzes List
const quizzesResource = createListResource({
  doctype: 'AI Quiz',
  fields: ['name', 'title', 'creation', 'bloom_level', 'status', 'total_questions'],
  orderBy: 'creation desc',
  pageLength: 5,
  auto: false
})
const quizzes = computed(() => quizzesResource.data || [])

// 2. Stats
const statsResource = createResource({
  url: 'lms.lms.services.ai_quiz.api.get_quiz_stats',
  auto: false
})

const deleteQuiz = (name) => {
  if (window.confirm(__('Are you sure you want to delete this question set?'))) {
    quizzesResource.delete.submit(name).then(() => {
      quizzesResource.fetch()
      statsResource.fetch()
    })
  }
}

onMounted(() => {
  quizzesResource.fetch()
  statsResource.fetch()
})
const statsData = computed(() => statsResource.data || { total: 0, completed: 0, processing: 0, accuracy: '0%' })

const statsCards = computed(() => [
  { label: __('Total Quizzes'), value: statsData.value.total, icon: icons.FileText, color: 'bg-blue-500', textColor: 'text-blue-500', trend: 'ACTIVE' },
  { label: __('Processing'), value: statsData.value.processing, icon: icons.RefreshCw, color: 'bg-amber-500', textColor: 'text-amber-500', trend: 'SYNCING' },
  { label: __('Completed'), value: statsData.value.completed, icon: icons.CheckCircle, color: 'bg-emerald-500', textColor: 'text-emerald-500', trend: 'STABLE' },
  { label: __('Exact AI'), value: statsData.value.accuracy, icon: icons.Zap, color: 'bg-indigo-500', textColor: 'text-indigo-500', trend: 'LLM' },
])
</script>
