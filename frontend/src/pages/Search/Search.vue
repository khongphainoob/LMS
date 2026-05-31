<template>
  <div class="min-h-screen bg-white dark:bg-[#0B0F1A] transition-colors duration-500 font-sans selection:bg-amber-100 selection:text-amber-900">
    <!-- Minimal Header -->
    <header class="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800/60 bg-white/80 dark:bg-[#0B0F1A]/80 backdrop-blur-md px-6 py-3">
      <div class="mx-auto flex max-w-[1200px] items-center justify-between">
        <div class="flex items-center gap-3">
          <icons.Search class="h-5 w-5 text-slate-900 dark:text-amber-500 stroke-[2.5px]" />
          <div>
            <h1 class="text-lg font-semibold text-slate-900 dark:text-white leading-none">{{ __('Search') }}</h1>
            <p class="text-xs font-medium text-slate-500 dark:text-amber-500/60 mt-1 leading-none">{{ __('Smart search system') }}</p>
          </div>
        </div>

        <!-- Purpose Badge (Right) -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-amber-500/5 border border-slate-100 dark:border-amber-500/10 rounded-full">
          <div class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
          <span class="text-xs font-medium text-slate-500 dark:text-amber-500/80">{{ __('Quick keyword search') }}</span>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-2xl px-6 py-10">
      <!-- Search Box Section -->
      <div class="relative mb-12">
        <div class="relative flex items-center">
          <icons.Search class="absolute left-5 h-5 w-5 text-slate-400 z-10" />
          <input
            v-model="query"
            type="text"
            class="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-base font-medium text-slate-900 dark:text-white focus:ring-0 focus:border-amber-500 dark:focus:border-amber-500 transition-all placeholder:text-slate-400"
            :placeholder="__('What do you want to find today?')"
            @keydown.enter="submit"
          />
          <div class="absolute right-3 flex items-center">
            <button v-if="query" @click="clearSearch" class="p-2 text-slate-400 hover:text-rose-500 transition-all">
              <icons.X class="h-5 w-5 stroke-[2.5px]" />
            </button>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="space-y-3 pb-20">
        <div v-if="search.loading" class="flex justify-center py-6">
          <icons.Loader2 class="h-6 w-6 text-amber-500 animate-spin" />
        </div>

        <div
          v-for="(result, index) in searchResults"
          :key="index"
          @click="navigate(result)"
          class="group relative rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 transition-all hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm cursor-pointer"
        >
          <div class="flex gap-4 items-start">
            <Avatar
              :label="result.author_info?.full_name || '?'"
              :image="result.author_info?.user_image"
              size="lg"
              class="rounded-xl border border-slate-50 dark:border-slate-800"
            />
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-amber-600 dark:text-amber-400/80">
                  {{ getDocTypeTitle(result.doctype) }}
                </span>
                <icons.ArrowUpRight class="h-3 w-3 text-slate-300 group-hover:text-amber-500 transition-all" />
              </div>
              <h3 class="text-base font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug" v-html="result.title"></h3>
              <div class="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-1 font-medium italic" v-html="result.content"></div>
            </div>
          </div>
        </div>

        <!-- Minimal Empty State -->
        <div v-if="!query && !search.loading" class="py-16 text-center">
           <icons.Compass class="h-10 w-10 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
           <p class="text-sm font-medium text-slate-500">
             {{ __('Enter keyword to start') }}
           </p>
        </div>

        <div v-if="query && !searchResults.length && !search.loading" class="py-16 text-center">
           <p class="text-sm font-medium text-slate-500">{{ __('No results') }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Avatar, createResource, debounce, usePageMeta } from 'frappe-ui'
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as icons from 'lucide-vue-next'
import { sessionStore } from '@/stores/session'

const query = ref('')
const searchResults = ref<Array<any>>([])
const { brand } = sessionStore()
const router = useRouter()
const route = useRoute()

onMounted(() => { 
  if (route.query.q) { 
    query.value = route.query.q as string
    submit() 
  } 
})

const submit = debounce(() => { 
  if (query.value.length > 2) {
    search.reload() 
  } else if (query.value.length === 0) {
    searchResults.value = []
  }
}, 500)

watch(query, (newVal) => {
  if (newVal.length === 0) {
    searchResults.value = []
  }
})

const search = createResource({
  url: 'lms.command_palette.search_sqlite',
  makeParams: () => ({ query: query.value }),
  onSuccess() {
    searchResults.value = []
    if (search.data) {
      search.data.forEach((group: any) => group.items.forEach((item: any) => searchResults.value.push(item)))
    }
  },
})

const navigate = (result: any) => {
  if (result.doctype == 'LMS Course') router.push({ name: 'CourseDetail', params: { courseName: result.name } })
  else if (result.doctype == 'LMS Batch') router.push({ name: 'BatchDetail', params: { batchName: result.name } })
}

const clearSearch = () => { 
  query.value = ''
  router.replace({ query: {} })
  searchResults.value = [] 
}

const getDocTypeTitle = (doctype: string) => {
  const titles = {
    'LMS Course': __('Course'),
    'LMS Batch': __('Classroom'),
    'LMS Lesson': __('Lesson')
  }
  return titles[doctype] || doctype
}

usePageMeta(() => ({ 
  title: __('Search'), 
  icon: brand.favicon 
}))
</script>

<style scoped>
.font-outfit {
  font-family: 'Outfit', sans-serif;
}
</style>
