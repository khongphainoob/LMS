<template>
  <div v-if="!submitted" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm w-full max-w-md my-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-bold text-slate-800 dark:text-white text-sm">{{ title || __('How was this AI response?') }}</h4>
    </div>
    
    <div class="flex items-center gap-2 mb-4">
      <button 
        v-for="star in 5" 
        :key="star"
        @click="rating = star"
        @mouseenter="hoverRating = star"
        @mouseleave="hoverRating = 0"
        class="text-2xl transition-transform hover:scale-110 focus:outline-none"
        :class="(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-700'"
      >
        ★
      </button>
    </div>

    <div v-if="rating > 0 && rating <= 2" class="mb-4">
      <textarea 
        v-model="feedback"
        class="w-full text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none resize-none"
        rows="2"
        :placeholder="__('Please tell us how we can improve... (Required)')"
      ></textarea>
    </div>
    
    <div v-if="rating > 2" class="mb-4">
      <textarea 
        v-model="feedback"
        class="w-full text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none resize-none"
        rows="2"
        :placeholder="__('Additional feedback? (Optional)')"
      ></textarea>
    </div>

    <div class="flex justify-end gap-2">
      <Button v-if="showCancel" variant="subtle" size="sm" @click="$emit('cancel')">{{ __('Skip') }}</Button>
      <Button 
        variant="solid" 
        theme="blue" 
        size="sm" 
        :disabled="rating === 0 || (rating <= 2 && !feedback.trim()) || loading"
        :loading="loading"
        @click="submitFeedback"
      >
        {{ __('Submit') }}
      </Button>
    </div>
  </div>
  <div v-else class="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-4 text-sm font-medium flex items-center gap-2 w-full max-w-md my-4">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
    {{ __('Thank you for your feedback!') }}
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button, createResource } from 'frappe-ui'

const props = defineProps({
  serviceType: {
    type: String,
    required: true
  },
  referenceId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  showCancel: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submitted', 'cancel'])

const rating = ref(0)
const hoverRating = ref(0)
const feedback = ref('')
const loading = ref(false)
const submitted = ref(false)

const submitResource = createResource({
  url: 'lms.lms.services.dashboard.api.submit_ai_evaluation',
  makeParams() {
    return {
      service_type: props.serviceType,
      reference_id: props.referenceId,
      rating: rating.value,
      feedback: feedback.value
    }
  },
  onSuccess(res) {
    loading.value = false
    submitted.value = true
    emit('submitted', res)
  },
  onError(err) {
    loading.value = false
    frappe.show_alert({ message: __('Error submitting feedback'), indicator: 'red' })
  }
})

const submitFeedback = () => {
  if (rating.value === 0) return
  if (rating.value <= 2 && !feedback.value.trim()) return
  
  loading.value = true
  submitResource.submit()
}
</script>
