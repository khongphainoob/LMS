<template>
  <div class="min-h-screen bg-[#fdfcf9] dark:bg-[#0a0a0a] transition-colors duration-300 overflow-x-hidden font-sans">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4">
      <div class="mx-auto flex max-w-[1400px] items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            class="group flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-105 active:scale-95"
            @click="$router.push({ name: 'AIIntegration' })"
          >
            <icons.ChevronLeft class="h-5 w-5 text-slate-600 stroke-[3px]" />
          </button>
          <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-white leading-none">{{ __('Score Dashboard') }}</h1>
            <p class="text-xs font-medium text-slate-500 dark:text-amber-500/80 mt-1">{{ __('Analysis of learning performance') }}</p>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-[1200px] px-6 py-16 space-y-12">
      <!-- Selector Box -->
      <section class="max-w-md mx-auto">
        <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <label class="text-sm font-medium text-slate-600 block mb-2 ml-1">{{ __('Your class') }}</label>
           <div class="relative">
             <select
                v-model="selectedBatch"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all appearance-none"
              >
                <option :value="null">{{ __('Select specific class') }}</option>
                <option v-for="batch in batches" :key="batch.name" :value="batch.name">
                  {{ batch.course_title }} - {{ batch.title }}
                </option>
              </select>
              <icons.ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
           </div>
        </div>
      </section>

      <!-- Content -->
      <div v-if="selectedBatch" class="animate-in fade-in slide-in-from-bottom-8 duration-700">
        <StudentScoreAnalytics :batch="selectedBatch" />
      </div>
      
      <div v-else class="py-32 text-center flex flex-col items-center">
        <div class="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mb-6 shadow-sm">
          <icons.BarChart3 class="h-10 w-10" />
        </div>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">{{ __('Analysis Report On') }}</h2>
        <p class="text-sm font-medium text-slate-500 mt-2">
          {{ __('Please select class to see results') }}
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createResource, usePageMeta } from 'frappe-ui'
import { sessionStore } from '@/stores/session'
import * as icons from 'lucide-vue-next'
import StudentScoreAnalytics from '@/components/AIIntegration/StudentScoreAnalytics.vue'

const { brand } = sessionStore()
const selectedBatch = ref(null)
const batches = ref([])

const batchesResource = createResource({
  url: 'lms.lms.services.socratic.api.get_student_context',
  auto: true,
  onSuccess: (data) => {
    batches.value = data?.batches || []
    if (batches.value.length > 0) selectedBatch.value = batches.value[0].name
  },
})

usePageMeta(() => ({ title: __('Score Dashboard'), icon: brand.favicon }))
</script>
