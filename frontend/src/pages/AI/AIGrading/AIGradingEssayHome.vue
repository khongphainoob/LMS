<template>
  <div class="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
    <!-- Header Section - Elegant White -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-10">
      <div class="flex items-center gap-6">
        <div class="flex flex-col">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">{{ __('AI Essay Grading') }}</h2>
          <p class="text-sm font-medium text-indigo-600 mt-1">{{ __('Analyze content and evaluate according to Rubric standardization.') }}</p>
        </div>
      </div>
      <button 
        @click="router.push({ name: 'AIGradingHelp' })"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium text-sm hover:border-indigo-600 transition-all shadow-sm active:scale-95"
      >
        <icons.BookOpen class="h-4 w-4" />
        {{ __('Guiding correct procedure') }}
      </button>
    </div>

    <!-- Action Cards - Elegant White Design -->
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <!-- Session Card - Blue Theme -->
      <div
        @click="goConfig('exam')"
        class="group relative flex flex-col rounded-[3.5rem] border-2 border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 transition-all hover:border-blue-500 hover:shadow-[0_30px_60px_rgba(59,130,246,0.1)] cursor-pointer overflow-hidden"
      >
        <div class="relative mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] border-4 border-blue-500 bg-white text-blue-600 shadow-xl shadow-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
          <icons.Layers class="h-10 w-10 stroke-[3px]" />
        </div>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">{{ __('Period by Session') }}</h3>
        <p class="text-sm text-slate-600 leading-relaxed max-w-sm mb-10">
          {{ __('Ideal for periodic exams. Manage student lists and approve grades in bulk.') }}
        </p>
        <div class="flex-1 space-y-4 mb-10">
          <div v-for="feat in sessionFeatures" :key="feat" class="flex items-center gap-3 text-sm font-medium text-slate-600 group/item">
            <div class="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
              <icons.Check class="h-3.5 w-3.5 stroke-[2.5px]" />
            </div>
            {{ feat }}
          </div>
        </div>
        <button class="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium text-sm transition-all hover:border-blue-400 hover:shadow-sm active:scale-95 shadow-sm">
          {{ __('Start Now') }}
        </button>
      </div>

      <!-- Rubric Card - Beige/Warm Theme -->
      <div
        @click="goRubricBuilder"
        class="group relative flex flex-col rounded-[3.5rem] border-2 border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 transition-all hover:border-orange-400 hover:shadow-[0_30px_60px_rgba(251,146,60,0.1)] cursor-pointer overflow-hidden"
      >
        <div class="relative mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] border-4 border-orange-200 bg-white text-orange-600 shadow-xl shadow-orange-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500">
          <icons.FileSpreadsheet class="h-10 w-10 stroke-[3px]" />
        </div>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">{{ __('Rubric Management') }}</h3>
        <p class="text-sm text-slate-600 leading-relaxed max-w-sm mb-10">
          {{ __('Create and standardize scoring criteria to ensure objectivity for all work.') }}
        </p>
        <div class="flex-1 space-y-4 mb-10">
          <div v-for="feat in rubricFeatures" :key="feat" class="flex items-center gap-3 text-sm font-medium text-slate-600 group/item">
            <div class="flex h-6 w-6 items-center justify-center rounded-md bg-orange-50 text-orange-500 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all">
              <icons.Check class="h-3.5 w-3.5 stroke-[2.5px]" />
            </div>
            {{ feat }}
          </div>
        </div>
        <button class="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium text-sm transition-all hover:border-orange-400 hover:shadow-sm active:scale-95 shadow-sm">
          {{ __('Customize criteria') }}
        </button>
      </div>

      <!-- Assignment Card - Amber Theme -->
      <div
        @click="goConfig('hw')"
        class="group relative flex flex-col rounded-[3.5rem] border-2 border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 transition-all hover:border-amber-500 hover:shadow-[0_30px_60px_rgba(245,158,11,0.1)] cursor-pointer overflow-hidden"
      >
        <div class="relative mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] border-4 border-amber-500 bg-white text-amber-600 shadow-xl shadow-amber-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white">
          <icons.GraduationCap class="h-10 w-10 stroke-[3px]" />
        </div>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">{{ __('Grading LMS Exercises') }}</h3>
        <p class="text-sm text-slate-600 leading-relaxed max-w-sm mb-10">
          {{ __('Connect directly to the submissions on the system. Automatically mark and send feedback to students.') }}
        </p>
        <div class="flex-1 space-y-4 mb-10">
          <div v-for="feat in assignmentFeatures" :key="feat" class="flex items-center gap-3 text-sm font-medium text-slate-600 group/item">
            <div class="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-500 group-hover/item:bg-amber-500 group-hover/item:text-white transition-all">
              <icons.Check class="h-3.5 w-3.5 stroke-[2.5px]" />
            </div>
            {{ feat }}
          </div>
        </div>
        <button class="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium text-sm transition-all hover:border-amber-400 hover:shadow-sm active:scale-95 shadow-sm">
          {{ __('Go to assignment') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { createResource } from 'frappe-ui'
import * as icons from 'lucide-vue-next'

const router = useRouter()

const sessionFeatures = [
  __('Batch'),
  __('Approve AI results'),
  __('Detailed Report'),
]

const rubricFeatures = [
  __('Development of multilevel criteria'),
  __('Standardized sample library'),
  __('Automatic Scoring'),
]

const assignmentFeatures = [
  __('LMS Direct Sync'),
  __('Personalized feedback'),
  __('Automatically update Gradebook'),
]

function goConfig(type) { router.push({ name: 'AIGradingEssayConfig', params: { type } }) }
function goRubricBuilder() { router.push({ name: 'AIGradingRubric' }) }
</script>
