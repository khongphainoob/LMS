<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-indigo-100 dark:from-[#0d1b2a] dark:via-[#1b2838] dark:to-[#0d1b2a] transition-colors duration-300">

    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-blue-200/60 dark:border-blue-900/40 bg-sky-100/80 dark:bg-[#0d1b2a]/80 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div class="mx-auto flex max-w-[1400px] items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-700 shadow-lg text-xl">
            ✨
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight text-slate-900 dark:text-lime-400">{{ __('AI Hub') }}</h1>
            <p class="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-lime-500">{{ __('Tomosa Intelligence') }}</p>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-8 space-y-16">

      <!-- ===== HERO ===== -->
      <section class="relative rounded-[2.5rem] bg-gradient-to-br from-blue-200 via-indigo-200 to-sky-200 dark:from-blue-900/60 dark:via-indigo-900/60 dark:to-sky-900/60 p-8 sm:p-14 overflow-hidden border border-blue-300/40 dark:border-blue-700/40">
        <div class="relative z-10 max-w-3xl">
          <span class="inline-block rounded-full bg-emerald-500 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-6 shadow-md">
            🌟 {{ __('A new era of education') }}
          </span>
          <h2 class="text-4xl sm:text-5xl font-black text-slate-900 dark:text-lime-400 leading-tight mb-6">
            {{ __('Take learning to the next level with') }} <br/>
            <span class="text-emerald-700 dark:text-lime-300">{{ __('Artificial intelligence (AI)') }}</span>
          </h2>
          <p class="text-base text-slate-700 dark:text-sky-200 font-medium leading-relaxed mb-8 max-w-2xl">
            {{ __('The system integrates the most advanced AI tools to support teachers in teaching and help students unlock their potential.') }}
          </p>
          <div class="flex flex-wrap gap-4">
            <div class="flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-slate-800 px-5 py-3 shadow-xl">
              <span class="text-2xl">🤖</span>
              <div>
                <div class="text-xs font-bold text-lime-400 uppercase tracking-wider">{{ __('98% Correct') }}</div>
                <div class="text-[10px] text-lime-300/70 font-medium">{{ __('GPT-4o model') }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-slate-800 px-5 py-3 shadow-xl">
              <span class="text-2xl">⚡</span>
              <div>
                <div class="text-xs font-bold text-lime-400 uppercase tracking-wider">{{ __('Instantaneous Response') }}</div>
                <div class="text-[10px] text-lime-300/70 font-medium">{{ __('24/7 Counselling') }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- Decor blobs -->
        <div class="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-emerald-300/20 dark:bg-emerald-500/10 blur-[80px]"></div>
        <div class="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-blue-300/30 dark:bg-blue-500/10 blur-[80px]"></div>
      </section>

      <!-- ===== TEACHER TOOLS ===== -->
      <section v-if="isTeacher">
        <div class="flex items-center gap-4 mb-8">
          <span class="text-3xl">🧑‍🏫</span>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-lime-400">{{ __('Teacher Tools') }}</h3>
            <p class="text-sm text-slate-600 dark:text-sky-300 font-medium">{{ __('Optimization of the teaching process.') }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div
            v-for="item in teacherItems"
            :key="item.label"
            @click="go(item.to)"
            class="group flex gap-5 rounded-2xl bg-blue-100/60 dark:bg-blue-900/30 p-6 transition-all hover:bg-blue-200/80 dark:hover:bg-blue-800/50 hover:shadow-xl cursor-pointer border border-blue-200/50 dark:border-blue-700/40"
          >
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 shadow-lg transition-transform group-hover:scale-110 text-2xl">
              {{ item.emoji }}
            </div>
            <div class="flex flex-col justify-center min-w-0">
              <h4 class="text-base font-bold text-slate-900 dark:text-lime-400 mb-1 flex items-center gap-2">
                {{ __(item.label) }}
                <span class="text-emerald-500 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </h4>
              <p class="text-sm text-slate-600 dark:text-sky-300 leading-relaxed font-medium">
                {{ __(item.description) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== STUDENT TOOLS ===== -->
      <section v-if="isStudent">
        <div class="flex items-center gap-4 mb-8">
          <span class="text-3xl">🎓</span>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-lime-400">{{ __('Tools for Students') }}</h3>
            <p class="text-sm text-slate-600 dark:text-sky-300 font-medium">{{ __('Learn smarter with AI.') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in studentItems"
            :key="item.label"
            @click="go(item.to)"
            class="group flex flex-col gap-5 rounded-2xl bg-blue-100/60 dark:bg-blue-900/30 p-6 transition-all hover:bg-blue-200/80 dark:hover:bg-blue-800/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer border border-blue-200/50 dark:border-blue-700/40 relative overflow-hidden"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 shadow-lg transition-transform group-hover:scale-110 text-2xl">
              {{ item.emoji }}
            </div>
            <div>
              <h4 class="text-base font-bold text-slate-900 dark:text-lime-400 mb-2">{{ __(item.label) }}</h4>
              <p class="text-sm text-slate-600 dark:text-sky-300 leading-relaxed font-medium">
                {{ __(item.description) }}
              </p>
            </div>
            <div class="absolute bottom-0 left-0 h-1 w-0 bg-emerald-500 transition-all duration-500 group-hover:w-full rounded-full"></div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="mt-12 border-t border-blue-200/60 dark:border-blue-900/40 bg-blue-100/40 dark:bg-[#0a1524] py-10 px-8">
      <div class="mx-auto max-w-[1400px] flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <span class="text-xl">✨</span>
          <span class="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-lime-500">Tomosa Intelligence</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-sky-400/50 font-medium">© 2026 Tomosa.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { usePageMeta } from 'frappe-ui'
import { sessionStore } from '@/stores/session'

const { brand } = sessionStore()
const router = useRouter()
const user = inject('$user')

const isTeacher = computed(() => user.data?.is_moderator || user.data?.is_instructor)
const isStudent = computed(() => user.data?.is_student)

const teacherItems = computed(() => [
  {
    label: 'AI Grading',
    description: __('The system supports automatic scoring for multiple-choice and essay tests.'),
    emoji: '🤖',
    to: 'AIGrading',
  },
  {
    label: 'Grading Book',
    description: __('Review class scores, track progress and grading results.'),
    emoji: '📖',
    to: 'GradingBook',
  },
  {
    label: 'Lesson Planning',
    description: __('Create smart teaching plans with the help of AI.'),
    emoji: '📅',
    to: 'LessonPlanning',
  },
  {
    label: 'Quiz Creator',
    description: __('Automatically create exercises from source documents (PDF, DOCX) with multiple cognitive levels.'),
    emoji: '📝',
    to: 'AIQuizDashboard',
  },
  {
    label: 'Documents',
    description: __('Upload and manage course materials and resources.'),
    emoji: '📁',
    to: 'Documents',
  },
])

const studentItems = [
  {
    label: 'Score Insights',
    description: __('AI score breakdown with trends and suggestions for improvement.'),
    emoji: '📊',
    to: 'StudentScoreDashboard',
  },
  {
    label: 'Smart Chatbot',
    description: __('Ask questions about lessons and get quick support 24/7.'),
    emoji: '💬',
    to: 'StudentAIHelper',
  },
  {
    label: 'Socratic AI Tutor',
    description: __('Learning through suggestive methods to train thinking.'),
    emoji: '🧠',
    to: 'SocraticTutor',
  },
]

const go = (name) => {
  if (name && router.hasRoute(name)) {
    router.push({ name })
  }
}

usePageMeta(() => ({
  title: `${__('AI Integration')} - ${brand.value}`,
}))
</script>
