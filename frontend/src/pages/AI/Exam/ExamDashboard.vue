<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-[#0a0f1c] dark:to-[#12182b] pb-12 transition-colors duration-300">
    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div class="mx-auto flex max-w-[1400px] items-center justify-between">
        <div class="flex items-center gap-4">
          <Button icon="chevron-left" variant="ghost" @click="router.push({ name: 'AIIntegration' })" />
          <div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ __('Exam Generator') }}</h1>
            <p class="text-xs text-slate-500">{{ __('Generate print-ready exams with AI') }}</p>
          </div>
        </div>
        <Button 
          variant="solid" 
          theme="emerald" 
          class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 transition-all duration-300"
          icon-left="plus" 
          @click="router.push({ name: 'ExamForm' })"
        >
          <span class="font-bold tracking-wide text-slate-900">{{ __('Create Exam') }}</span>
        </Button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-8">
      
      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="rounded-2xl bg-white/80 dark:bg-[#1a2235]/80 backdrop-blur-md p-6 border border-slate-200/60 dark:border-indigo-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.05)] transition-all hover:shadow-indigo-500/10">
          <div class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-indigo-300/70 mb-1 flex items-center gap-2">
            <span class="text-indigo-500">📊</span> {{ __('Total Exams') }}
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white">{{ examsData.length || 0 }}</div>
        </div>
        <div class="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-md p-6 border border-emerald-200/60 dark:border-emerald-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(16,185,129,0.05)] transition-all hover:shadow-emerald-500/10">
          <div class="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400/70 mb-1 flex items-center gap-2">
            <span class="text-emerald-500">✨</span> {{ __('Generated Questions') }}
          </div>
          <div class="text-4xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
             {{ examsData.reduce((acc, curr) => acc + (curr.total_questions || 0), 0) || 0 }}
          </div>
        </div>
        <div class="rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 backdrop-blur-md p-6 border border-blue-200/60 dark:border-blue-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(59,130,246,0.05)] transition-all hover:shadow-blue-500/10">
          <div class="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400/70 mb-1 flex items-center gap-2">
            <span class="text-blue-500">⚡</span> {{ __('Status') }}
          </div>
          <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 drop-shadow-sm">{{ __('Active') }}</div>
        </div>
      </div>

      <!-- Exam List -->
      <div v-if="examsResource.loading" class="flex justify-center py-20">
        <Spinner class="w-8 h-8 text-emerald-500" />
      </div>
      
      <div v-else-if="examsData.length === 0" class="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div class="text-5xl mb-4">📄</div>
        <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">{{ __('No exams generated yet') }}</h3>
        <p class="text-slate-500 mb-6">{{ __('Start by uploading a document or providing instructions to generate your first exam.') }}</p>
        <Button 
          variant="solid" 
          theme="emerald" 
          class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 transition-all duration-300"
          @click="router.push({ name: 'ExamForm' })"
        >
          <span class="font-bold uppercase tracking-wide text-slate-900">{{ __('Create First Exam') }}</span>
        </Button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="exam in examsData" 
          :key="exam.name"
          @click="router.push({ name: 'ExamDetail', params: { examID: exam.name } })"
          class="rounded-2xl bg-white/70 dark:bg-[#1a2235]/60 backdrop-blur-xl p-6 border border-white dark:border-indigo-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.03)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-pointer relative overflow-hidden group hover:-translate-y-1 hover:bg-white dark:hover:bg-[#1e273c]"
        >
          <!-- Hover Glow -->
          <div class="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="flex justify-between items-start mb-4 relative z-10">
            <Badge :theme="getStatusTheme(exam.status)" size="sm">{{ __(exam.status) }}</Badge>
            <span class="text-xs text-slate-400">{{ formatDate(exam.creation) }}</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {{ exam.title }}
          </h3>
          <div class="flex items-center gap-4 text-sm text-slate-500 mb-4">
            <span class="flex items-center gap-1">📚 {{ exam.subject || __('General') }}</span>
            <span class="flex items-center gap-1">🎓 {{ exam.grade_level || __('N/A') }}</span>
          </div>
          <div class="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
              {{ exam.total_questions || 0 }} {{ __('questions') }}
            </span>
            <div class="flex gap-2">
              <Button v-if="exam.status === 'Failed' || exam.status === 'Draft'" variant="subtle" size="sm" theme="red" icon-left="refresh-cw" @click.stop="confirmRetry(exam)">
                {{ __('Retry') }}
              </Button>
              <Button variant="ghost" size="sm" theme="red" icon="trash-2" @click.stop="confirmDelete(exam)" class="hover:bg-red-50 dark:hover:bg-red-900/30" />
              <Button variant="ghost" size="sm" icon-right="chevron-right">
                {{ __('View') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Load More -->
      <div v-if="hasMore" class="flex justify-center mt-10">
        <Button variant="subtle" theme="gray" size="md" @click="loadMore" :loading="examsResource.loading">
          {{ __('Load More') }}
        </Button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { createResource, Button, Badge, Spinner } from 'frappe-ui'
import { useRouter } from 'vue-router'
import { inject, onMounted, ref } from 'vue'

const router = useRouter()
const socket = inject('$socket')

const start = ref(0)
const limit = ref(10)
const hasMore = ref(false)
const examsData = ref([])

const examsResource = createResource({
  url: 'lms.lms.services.ai_exam.api.get_exam_list',
  makeParams() {
    return {
      start: start.value,
      limit: limit.value
    }
  },
  auto: true,
  onSuccess(data) {
    if (start.value === 0) {
      examsData.value = data.exams || []
    } else {
      examsData.value = [...examsData.value, ...(data.exams || [])]
    }
    
    // Check if there are more records to load
    if (data.exams && data.exams.length === limit.value) {
      hasMore.value = true
    } else {
      hasMore.value = false
    }
  }
})

const loadMore = () => {
  start.value += limit.value
  examsResource.fetch()
}

const getStatusTheme = (status) => {
  const map = {
    'Draft': 'gray',
    'Processing': 'blue',
    'Completed': 'emerald',
    'Failed': 'red'
  }
  return map[status] || 'gray'
}

const retryResource = createResource({
  url: 'lms.lms.services.ai_exam.api.retry_exam_generation',
  onSuccess(data) {
    if (data.success) {
      if (window.frappe && window.frappe.show_alert) {
        window.frappe.show_alert({ message: __('Đang bắt đầu tạo lại đề...'), indicator: 'blue' });
      } else {
        alert(__('Đang bắt đầu tạo lại đề...'));
      }
      examsResource.reload();
    } else {
      if (window.frappe && window.frappe.show_alert) {
        window.frappe.show_alert({ message: __('Lỗi: ') + data.error, indicator: 'red' });
      } else {
        alert(__('Lỗi: ') + data.error);
      }
    }
  }
})

const confirmRetry = (exam) => {
  if (confirm(__('Bạn có chắc chắn muốn tạo lại đề thi này không?'))) {
    retryResource.submit({ exam_name: exam.name })
  }
}

const deleteResource = createResource({
  url: 'lms.lms.services.ai_exam.api.delete_exam',
  onSuccess(data) {
    if (data.success) {
      start.value = 0
      examsResource.fetch()
    } else {
      if (window.frappe && window.frappe.show_alert) {
        window.frappe.show_alert({ message: __('Lỗi: ') + data.error, indicator: 'red' });
      } else {
        alert(__('Lỗi: ') + data.error);
      }
    }
  }
})

const confirmDelete = (exam) => {
  if (confirm(__('Bạn có chắc chắn muốn xóa bài kiểm tra này không? Mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn!'))) {
    deleteResource.submit({ exam_name: exam.name })
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

onMounted(() => {
  if (socket) {
    socket.on('ai_exam_update', (data) => {
      examsResource.reload()
    })
  }
})
</script>
