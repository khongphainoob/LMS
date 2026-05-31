<template>
  <div class="course-batch-selector bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-[2rem] shadow-sm transition-colors duration-300">
    <!-- Mode Selection -->
    <div class="flex items-center w-full mb-5">
      <div class="flex w-full bg-slate-200/50 dark:bg-white/5 p-1 rounded-full border border-slate-300 dark:border-white/5">
        <button
          @click="selectMode('batch')"
          :class="[
            'flex-1 py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-300 overflow-hidden',
            modelValue.mode === 'batch' 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5'
          ]"
        >
          <span class="flex items-center justify-center gap-1.5">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            <span class="truncate whitespace-nowrap">Theo Batch</span>
          </span>
        </button>
        <button
          @click="selectMode('course')"
          :class="[
            'flex-1 py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-300 overflow-hidden',
            modelValue.mode === 'course'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5'
          ]"
        >
          <span class="flex items-center justify-center gap-1.5">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            <span class="truncate whitespace-nowrap">{{ __("By Course") }}</span>
          </span>
        </button>
      </div>
    </div>

    <!-- Batch Selection (Only visible if mode is batch) -->
    <div v-if="modelValue.mode === 'batch'" class="mb-5 slide-down">
      <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{{ __('Select Batch') }}</label>
      <div class="relative">
        <select
          v-model="selectedBatch"
          @change="onBatchChange"
          class="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white appearance-none focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value="" disabled class="text-slate-400 dark:text-gray-500">-- {{ __('Select Batch') }} --</option>
          <option v-for="batch in context.batches" :key="batch.name" :value="batch.name" class="bg-white dark:bg-gray-900 text-slate-800 dark:text-white">
            {{ batch.title || batch.name }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>

    <!-- Course Selection List -->
    <div class="courses-list transition-all">
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {{ modelValue.mode === 'batch' ? __('Courses in this Batch') : __('Select Course') }}
        </label>
      </div>

      <div class="relative mb-3 slide-down">
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="__('Search courses...')" 
          class="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-white appearance-none focus:outline-none focus:border-blue-500 transition-all"
        />
        <svg class="w-4 h-4 text-slate-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      
      <div v-if="filteredCourses.length === 0" class="text-center py-6 text-slate-500 bg-white dark:bg-black/10 rounded-xl border border-slate-200 dark:border-white/5 border-dashed">
        <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        <span class="text-sm">{{ modelValue.mode === 'batch' && !selectedBatch ? __('Please select a Batch above to view courses') : __('No courses available') }}</span>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        <label 
          v-for="course in filteredCourses" 
          :key="course.name"
          class="group relative flex items-center p-3 cursor-pointer rounded-xl border transition-all duration-300"
          :class="[
            modelValue.course === course.name 
              ? 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-400 dark:border-blue-500/50 shadow-sm' 
              : 'bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
          ]"
        >
          <input 
            type="radio" 
            name="course_selection" 
            :value="course.name" 
            :checked="modelValue.course === course.name"
            @change="onCourseChange(course.name)"
            class="hidden"
          >
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white truncate transition-colors" :class="modelValue.course === course.name ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'">
              {{ course.title || course.name }}
            </h4>
            <p class="text-[10px] text-slate-500 dark:text-gray-500 mt-0.5 truncate">{{ course.name }}</p>
          </div>
          
          <div class="ml-3 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
               :class="modelValue.course === course.name ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-gray-600'">
            <svg v-if="modelValue.course === course.name" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    // { mode: 'batch' | 'course', batch: string | null, course: string | null }
  },
  context: {
    type: Object,
    required: true,
    // { courses: [], batches: [] }
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedBatch = ref(props.modelValue.batch || '')
const searchQuery = ref('')

const displayedCourses = computed(() => {
  if (props.modelValue.mode === 'course') {
    return props.context.courses || []
  } else {
    if (!selectedBatch.value) return []
    const batch = props.context.batches?.find(b => b.name === selectedBatch.value)
    return batch?.courses || []
  }
})

const filteredCourses = computed(() => {
  if (!searchQuery.value) return displayedCourses.value
  const query = searchQuery.value.toLowerCase()
  return displayedCourses.value.filter(c => 
    (c.title && c.title.toLowerCase().includes(query)) || 
    (c.name && c.name.toLowerCase().includes(query))
  )
})

function selectMode(newMode) {
  if (props.modelValue.mode === newMode) return
  
  emit('update:modelValue', {
    mode: newMode,
    batch: newMode === 'batch' ? selectedBatch.value : null,
    course: null // Reset course when switching modes
  })
  emit('change')
}

function onBatchChange() {
  searchQuery.value = ''
  emit('update:modelValue', {
    ...props.modelValue,
    batch: selectedBatch.value,
    course: null // Reset course when batch changes
  })
  emit('change')
}

function onCourseChange(courseName) {
  emit('update:modelValue', {
    ...props.modelValue,
    course: courseName
  })
  emit('change')
}

watch(() => props.modelValue.batch, (newVal) => {
  selectedBatch.value = newVal || ''
})
</script>

<style scoped>
.slide-down {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
