<template>
  <div class="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
    <!-- Header Section - Elegant White -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-10">
      <div class="flex items-center gap-6">
        <button
          class="group flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-105 active:scale-95"
          @click="router.push({ name: 'AIIntegration' })"
        >
          <icons.ChevronLeft class="h-6 w-6 text-slate-600 stroke-[3px]" />
        </button>
        <div class="flex flex-col">
          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase">{{ __('Chấm bài Tự luận AI') }}</h2>
          <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-1">{{ __('Phân tích nội dung và đánh giá theo Rubric chuẩn hóa.') }}</p>
        </div>
      </div>
      <button 
        @click="router.push({ name: 'AIGradingHelp' })"
        class="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest hover:border-indigo-600 transition-all shadow-xl active:scale-95"
      >
        <icons.BookOpen class="h-4 w-4" />
        {{ __('Hướng dẫn & Quy trình') }}
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
        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">{{ __('Chấm theo Phiên') }}</h3>
        <p class="text-[15px] text-slate-500 leading-relaxed font-bold mb-10">
          {{ __('Lý tưởng cho các bài thi định kỳ. Quản lý danh sách học sinh và phê duyệt điểm hàng loạt.') }}
        </p>
        <div class="flex-1 space-y-5 mb-12">
          <div v-for="feat in sessionFeatures" :key="feat" class="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest group/item">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all shadow-sm">
              <icons.Check class="h-4 w-4 stroke-[3px]" />
            </div>
            {{ feat }}
          </div>
        </div>
        <button class="w-full py-5 rounded-[1.75rem] bg-white border-2 border-slate-100 text-slate-900 font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 shadow-lg">
          {{ __('Bắt đầu ngay') }}
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
        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">{{ __('Quản lý Rubric') }}</h3>
        <p class="text-[15px] text-slate-500 leading-relaxed font-bold mb-10">
          {{ __('Tạo và chuẩn hóa các tiêu chí chấm điểm để đảm bảo tính khách quan cho mọi bài làm.') }}
        </p>
        <div class="flex-1 space-y-5 mb-12">
          <div v-for="feat in rubricFeatures" :key="feat" class="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest group/item">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-500 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all shadow-sm">
              <icons.Check class="h-4 w-4 stroke-[3px]" />
            </div>
            {{ feat }}
          </div>
        </div>
        <button class="w-full py-5 rounded-[1.75rem] bg-white border-2 border-slate-100 text-slate-900 font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 shadow-lg">
          {{ __('Tùy chỉnh tiêu chí') }}
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
        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">{{ __('Chấm bài Tập LMS') }}</h3>
        <p class="text-[15px] text-slate-500 leading-relaxed font-bold mb-10">
          {{ __('Kết nối trực tiếp với các bài nộp trên hệ thống. Tự động chấm và gửi phản hồi cho sinh viên.') }}
        </p>
        <div class="flex-1 space-y-5 mb-12">
          <div v-for="feat in assignmentFeatures" :key="feat" class="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest group/item">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500 group-hover/item:bg-amber-500 group-hover/item:text-white transition-all shadow-sm">
              <icons.Check class="h-4 w-4 stroke-[3px]" />
            </div>
            {{ feat }}
          </div>
        </div>
        <button class="w-full py-5 rounded-[1.75rem] bg-white border-2 border-slate-100 text-slate-900 font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 shadow-lg">
          {{ __('Truy cập bài tập') }}
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
  __('Chấm điểm hàng loạt (Batch)'),
  __('Phê duyệt kết quả AI'),
  __('Xuất báo cáo chi tiết'),
]

const rubricFeatures = [
  __('Xây dựng tiêu chí đa tầng'),
  __('Thư viện mẫu chuẩn hóa'),
  __('Tính điểm tự động'),
]

const assignmentFeatures = [
  __('Đồng bộ trực tiếp LMS'),
  __('Phản hồi cá nhân hóa'),
  __('Tự động cập nhật Gradebook'),
]

function goConfig(type) { router.push({ name: 'AIGradingEssayConfig', params: { type } }) }
function goRubricBuilder() { router.push({ name: 'AIGradingRubric' }) }
</script>
