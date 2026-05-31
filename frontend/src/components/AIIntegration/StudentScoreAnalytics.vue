<template>
  <div class="space-y-10 animate-in fade-in duration-700">
    <!-- Top Stats Cards - Elegant White Design -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div class="group relative rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/40 border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1">
        <div class="flex items-center justify-between mb-6">
          <div class="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all">
            <icons.Target class="h-6 w-6" />
          </div>
          <span class="text-xs font-semibold text-slate-500">{{ __('Average GPA') }}</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ averageScore }}</div>
        <div class="text-xs font-medium text-amber-600 mt-2">{{ __('On a 10-point scale') }}</div>
      </div>

      <div class="group relative rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/40 border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1">
        <div class="flex items-center justify-between mb-6">
          <div class="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all">
            <icons.Award class="h-6 w-6" />
          </div>
          <span class="text-xs font-semibold text-slate-500">{{ __('Good performance') }}</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ highScores }}</div>
        <div class="text-xs font-medium text-teal-600 mt-2">{{ __('Excellent work') }}</div>
      </div>

      <div class="group relative rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/40 border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1">
        <div class="flex items-center justify-between mb-6">
          <div class="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all">
            <icons.TrendingDown class="h-6 w-6" />
          </div>
          <span class="text-xs font-semibold text-slate-500">{{ __('Needs improvement') }}</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ lowScores }}</div>
        <div class="text-xs font-medium text-rose-600 mt-2">{{ __('Below average') }}</div>
      </div>

      <div class="group relative rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/40 border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1">
        <div class="flex items-center justify-between mb-6">
          <div class="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all">
            <icons.Hash class="h-6 w-6" />
          </div>
          <span class="text-xs font-semibold text-slate-500">{{ __('Total submissions') }}</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ totalResults }}</div>
        <div class="text-xs font-medium text-amber-600 mt-2">{{ __('Data updated') }}</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <!-- Grades Table -->
      <div class="lg:col-span-2 rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/30 overflow-hidden">
        <div class="p-8 border-b border-slate-50 dark:border-slate-900 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400">
              <icons.ListOrdered class="h-5 w-5" />
            </div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ __('Submission History') }}</h3>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-slate-900/50">
                <th class="px-8 py-5 text-xs font-semibold text-slate-500">{{ __('Course & Lesson') }}</th>
                <th class="px-8 py-5 text-xs font-semibold text-slate-500 text-center">{{ __('Points') }}</th>
                <th class="px-8 py-5 text-xs font-semibold text-slate-500 text-right">{{ __('Time') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-900">
              <tr v-for="item in gradesResource.data" :key="item.id" class="group hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors">
                <td class="px-8 py-6">
                  <div class="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors text-sm">{{ item.course }}</div>
                  <div class="text-xs font-medium text-slate-500 mt-1">{{ item.name }}</div>
                </td>
                <td class="px-8 py-6 text-center">
                  <span class="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs font-semibold border shadow-sm transition-all group-hover:scale-105" :class="scoreStyle(item.score)">
                    {{ item.score }} / 10
                  </span>
                </td>
                <td class="px-8 py-6 text-right text-xs font-medium text-slate-500">
                  {{ formatDate(item.date) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AI Insights Panel - Elegant White/Amber Sidebar -->
      <div class="space-y-6">
        <div class="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-2xl shadow-slate-200/40 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <!-- Decor circles -->
          <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/5 blur-3xl group-hover:bg-amber-400/10 transition-all"></div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-10">
              <div class="h-14 w-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xl transform transition-transform group-hover:rotate-12">
                <icons.Sparkles class="h-7 w-7" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ __('AI Analysis') }}</h3>
            </div>

            <div class="space-y-10">
              <div class="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30">
                <p class="text-sm font-medium text-amber-900 dark:text-amber-200 leading-relaxed italic opacity-90">"{{ aiInsight.summary }}"</p>
              </div>

              <div class="space-y-8">
                <div class="flex gap-5">
                  <div class="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/30">
                    <icons.Zap class="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h4 class="text-xs font-semibold text-teal-600 mb-1">{{ __('Strengths') }}</h4>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{{ aiInsight.strength }}</p>
                  </div>
                </div>
                <div class="flex gap-5">
                  <div class="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/30">
                    <icons.Target class="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h4 class="text-xs font-semibold text-rose-600 mb-1">{{ __('Points to improve') }}</h4>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{{ aiInsight.improvement }}</p>
                  </div>
                </div>
              </div>

              <button class="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600 active:scale-95">
                {{ __('View detailed roadmap') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createResource } from 'frappe-ui'
import * as icons from 'lucide-vue-next'
import dayjs from '@/utils/dayjs'

const props = defineProps({
  batch: { type: String, default: null }
})

const gradesResource = createResource({
  url: 'lms.lms.api.get_student_grades',
  auto: true,
})

const totalResults = computed(() => gradesResource.data?.length || 0)
const highScores = computed(() => (gradesResource.data || []).filter((x) => x.score >= 8).length)
const lowScores = computed(() => (gradesResource.data || []).filter((x) => x.score < 5).length)
const averageScore = computed(() => {
  if (!gradesResource.data?.length) return '0.0'
  const sum = gradesResource.data.reduce((acc, curr) => acc + (curr.score || 0), 0)
  return (sum / gradesResource.data.length).toFixed(1)
})

const aiInsight = computed(() => {
  const avg = Number(averageScore.value || 0)
  if (!gradesResource.data?.length) {
    return {
      summary: __('No grade data available.'),
      strength: __('System is ready.'),
      improvement: __("Let's start the quiz."),
    }
  }
  if (avg >= 8) return {
    summary: __('Excellent learning performance.'), strength: __('Master foundational knowledge.'), improvement: __('Maintain depth of thought.'),
  }
  return {
    summary: __('Needs effort to improve performance.'), strength: __('Making certain progress.'), improvement: __('Practice more difficult question types.'),
  }
})

const formatDate = (date) => date ? dayjs(date).format('DD/MM/YYYY') : ''
const scoreStyle = (score) => {
  if (score >= 8) return 'bg-teal-50 text-teal-700 border-teal-100 shadow-sm'
  if (score >= 5) return 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm'
  return 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm'
}
</script>
