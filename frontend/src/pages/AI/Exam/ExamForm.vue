<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-[#0a0f1c] dark:to-[#12182b] pb-12 transition-colors duration-300">
    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div class="mx-auto flex max-w-[800px] items-center justify-between">
        <div class="flex items-center gap-4">
          <Button icon="chevron-left" variant="ghost" @click="router.push({ name: 'ExamDashboard' })" />
          <div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ __('Create New Exam') }}</h1>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[800px] px-4 py-8 sm:px-8">
      <div class="bg-white/70 dark:bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl p-8 border border-white dark:border-indigo-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.03)]">
        
        <form @submit.prevent="submitExam" class="space-y-8">
          
          <!-- Basic Info -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">{{ __('1. Basic Information') }}</h3>
            
            <FormControl type="text" :label="__('Exam Title')" v-model="formData.title" required :placeholder="__('e.g., Midterm Exam - Grade 12 Math')" />
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormControl type="select" :label="__('Subject')" v-model="formData.subject" :options="['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Literature', 'History', 'Geography']" />
              <FormControl type="select" :label="__('Grade Level')" v-model="formData.grade_level" :options="['Grade 10', 'Grade 11', 'Grade 12', 'University']" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormControl type="select" :label="__('Exam Type')" v-model="formData.exam_type" :options="['15-Minute Test', '45-Minute Test', 'Midterm Exam', 'Final Exam', 'Entrance Exam']" />
              <FormControl type="number" :label="__('Duration (min)')" v-model="formData.duration_minutes" />
              <FormControl type="select" :label="__('Language')" v-model="formData.language" :options="[{label: 'Tiếng Việt', value: 'vi'}, {label: 'English', value: 'en'}]" />
            </div>

            <div class="space-y-4 pt-2">
              <FormControl type="select" :label="__('Exam Format')" v-model="formData.exam_format" :options="['MOET 2025', 'Mixed (Trắc nghiệm + Tự luận)', 'Traditional MCQ', 'Custom']" />
              <FormControl v-if="formData.exam_format === 'Custom'" type="textarea" :label="__('Custom Format Template')" v-model="formData.custom_format_template" :placeholder="__('Describe your exact exam format requirements here...')" />
            </div>
          </div>

          <!-- Source Material -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">{{ __('2. Content Source') }}</h3>
            
            <div class="p-6 border-2 border-dashed border-slate-300 dark:border-indigo-500/30 bg-slate-50/50 dark:bg-indigo-900/10 rounded-xl text-center transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400">
              <div class="text-3xl mb-2">📁</div>
              <p class="text-sm text-slate-500 mb-2">{{ __('Upload curriculum, book chapter, or existing syllabus (PDF/DOCX)') }}</p>
              <FileUploader @success="(file) => formData.file_url = file.file_url">
                <template #default="{ openFileSelector }">
                  <Button variant="subtle" @click="openFileSelector">{{ formData.file_url ? __('Change File') : __('Select File') }}</Button>
                </template>
              </FileUploader>
              <div v-if="formData.file_url" class="mt-2 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
                <span>✓</span> {{ __('File attached successfully') }}
              </div>
            </div>

            <FormControl type="textarea" :label="__('Teacher Instructions')" v-model="formData.teacher_instructions" :placeholder="__('Specific topics to focus on, formatting requirements, etc.')" />
          </div>

          <!-- Generation Settings -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">{{ __('3. Generation Settings') }}</h3>
            
            <div>
              <label class="block text-sm text-slate-600 dark:text-slate-400 mb-2">{{ __('Difficulty Distribution (%)') }}</label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormControl type="number" :label="__('Remembering')" v-model="difficulty.nhan_biet" />
                <FormControl type="number" :label="__('Understanding')" v-model="difficulty.thong_hieu" />
                <FormControl type="number" :label="__('Applying')" v-model="difficulty.van_dung" />
                <FormControl type="number" :label="__('Advanced Applying')" v-model="difficulty.van_dung_cao" />
              </div>
            </div>
          </div>

          <!-- Section Configs -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">{{ __('4. Section Structure (Optional)') }}</h3>
            <p class="text-sm text-slate-500">{{ __('Specify the number of questions and topics for each section. Leave blank to let AI decide.') }}</p>
            
            <div class="space-y-4">
              <div v-for="(sec, idx) in section_configs" :key="idx" class="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 relative">
                <button v-if="formData.exam_format !== 'MOET 2025'" type="button" class="absolute top-2 right-2 text-slate-400 hover:text-red-500" @click="removeSection(idx)">✕</button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <FormControl type="text" :label="__('Section Name')" v-model="sec.section_name" :disabled="formData.exam_format === 'MOET 2025'" />
                  <FormControl type="number" :label="__('Number of Questions')" v-model="sec.num_questions" />
                </div>
                <FormControl type="text" :label="__('Focus Topics (e.g., Mechanics, Waves...)')" v-model="sec.topics" />
              </div>
            </div>
            
            <Button v-if="formData.exam_format !== 'MOET 2025'" type="button" variant="subtle" icon-left="plus" @click="addSection" class="mt-2">
              {{ __('Add Section') }}
            </Button>
          </div>

          <!-- Actions -->
          <div class="flex justify-end items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-700 mt-8">
            <Button variant="subtle" theme="gray" class="px-6 border border-slate-300/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" @click="router.push({ name: 'ExamDashboard' })">
              {{ __('Cancel') }}
            </Button>
            <Button 
              type="submit"
              variant="solid" 
              theme="emerald" 
              class="px-8 bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 transition-all duration-300" 
              size="lg" 
              :loading="submitResource.loading"
            >
              <span class="font-bold tracking-wide uppercase text-slate-900">{{ __('Generate Exam') }}</span>
            </Button>
          </div>

        </form>

      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createResource, Button, FormControl, FileUploader } from 'frappe-ui'

const router = useRouter()

const formData = reactive({
  title: '',
  subject: 'Math',
  grade_level: 'Grade 12',
  curriculum: 'Vietnamese National',
  exam_type: '45-Minute Test',
  duration_minutes: 45,
  language: 'vi',
  exam_format: 'MOET 2025',
  custom_format_template: '',
  teacher_instructions: '',
  file_url: null
})

const difficulty = reactive({
  nhan_biet: 20,
  thong_hieu: 30,
  van_dung: 30,
  van_dung_cao: 20
})

const section_configs = reactive([])

watch(() => formData.exam_format, (newFormat) => {
  if (newFormat === 'MOET 2025') {
    section_configs.splice(0, section_configs.length, 
      { section_name: 'Part I: Multiple choice questions with multiple options', num_questions: 18, topics: '' },
      { section_name: 'Part II: True/False multiple choice questions', num_questions: 4, topics: '' },
      { section_name: 'Part III: Short answer questions', num_questions: 6, topics: '' }
    )
  } else {
    if (section_configs.length > 0 && section_configs[0].section_name.startsWith('Part I:')) {
      section_configs.splice(0, section_configs.length)
    }
  }
}, { immediate: true })

const addSection = () => {
  section_configs.push({ section_name: '', num_questions: 10, topics: '' })
}

const removeSection = (idx) => {
  section_configs.splice(idx, 1)
}

const submitResource = createResource({
  url: 'lms.lms.services.ai_exam.api.create_exam_request',
  makeParams() {
    return {
      ...formData,
      difficulty_distribution: JSON.stringify(difficulty),
      section_configs_json: section_configs.length > 0 ? JSON.stringify(section_configs) : "[]"
    }
  },
  onSuccess(data) {
    if (data.success) {
      if (window.frappe && window.frappe.show_alert) {
        window.frappe.show_alert({ message: __('Please wait, generating exam...'), indicator: 'blue' });
      } else {
        alert(__('Please wait, generating exam...'));
      }
      router.push({ name: 'ExamDashboard' })
    } else {
      if (window.frappe && window.frappe.show_alert) {
        window.frappe.show_alert({ message: __('Error generating exam: ') + data.error, indicator: 'red' });
      } else {
        alert(__('Error generating exam: ') + data.error);
      }
    }
  }
})

const submitExam = () => {
  submitResource.submit()
}
</script>
