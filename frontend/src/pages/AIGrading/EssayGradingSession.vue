<template>
	<div class="flex h-screen bg-gray-50 flex-col md:flex-row">
		<!-- Left Sidebar / Corner for Actions -->
		<aside class="w-full md:w-64 flex-shrink-0 flex flex-col justify-between border-r border-gray-200 bg-white p-5">
			<div>
				<h2 class="text-xl font-bold text-gray-900 mb-6">{{ __('Grading Session') }}</h2>
				<p class="text-sm text-gray-500 mb-4">{{ __('Session ID:') }} {{ sessionId }}</p>
				
				<!-- AI Config Info Block (Read-only on Frontend) -->
				<div class="mb-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
					<div class="flex items-center gap-2 mb-2">
						<div class="h-2 w-2 rounded-full" :class="aiModel ? 'bg-indigo-500' : 'bg-gray-300'"></div>
						<h3 class="text-xs font-semibold text-indigo-900 uppercase tracking-wider">{{ __('AI Active Model') }}</h3>
					</div>
					<div class="text-sm font-medium text-gray-800">
						{{ aiModel || __('No Model Configured') }}
					</div>
					<p class="text-[10px] text-gray-500 mt-2">
						{{ __('Configured by Admin in LMS Desk.') }}
					</p>
				</div>

				<div class="space-y-3">
					<Button 
						variant="solid" 
						class="w-full justify-center"
						@click="saveSession"
					>
						{{ __('Save Session') }}
					</Button>
					<Button 
						variant="outline" 
						class="w-full justify-center"
						@click="exitSession"
					>
						{{ __('Exit Session') }}
					</Button>
				</div>
			</div>
		</aside>

		<!-- Main Content Area -->
		<main class="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6">
			<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">{{ __('Add Essay Submission') }}</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Student Info -->
					<div class="space-y-4">
						<div class="flex flex-col gap-1">
							<label class="text-sm font-medium text-gray-700">{{ __('Student Name') }}</label>
							<Input 
								type="text" 
								v-model="submission.student_name" 
								:placeholder="__('Enter student name')" 
							/>
						</div>
					</div>

					<!-- Image Upload -->
					<div class="space-y-2">
						<label class="text-sm font-medium text-gray-700">{{ __('Upload Essay Image') }}</label>
						<!-- We reuse the EssayImageUploadBlock component -->
						<EssayImageUploadBlock />
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-3">
					<Button 
						variant="outline" 
						@click="saveSubmission"
					>
						{{ __('Save Submission') }}
					</Button>
					<Button 
						variant="solid" 
						@click="gradeSubmission"
					>
						{{ __('Grade') }}
					</Button>
				</div>
			</div>

			<!-- List of Added Submissions (Optional for UX) -->
			<div v-if="submissionsList.length > 0" class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">{{ __('Added Submissions') }}</h3>
				<ul class="space-y-3">
					<li 
						v-for="(sub, idx) in submissionsList" 
						:key="idx"
						class="flex justify-between items-center bg-gray-50 border border-gray-100 p-3 rounded-lg"
					>
						<span class="font-medium text-gray-800">{{ sub.student_name }}</span>
						<span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">{{ __('Image Added') }}</span>
					</li>
				</ul>
			</div>
		</main>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button, Input, createResource } from 'frappe-ui'
import EssayImageUploadBlock from '@/components/AIGrading/EssayImageUploadBlock.vue'

const props = defineProps({
	sessionId: {
		type: String,
		required: true,
	}
})

const router = useRouter()
const route = useRoute()

// --- AI CONFIGuration Logic ---
// aiModel is now just for display. Actual config is handled via Admin Desk.
const aiModel = ref('')

// Fetching global AI Settings configured from Frappe LMS Desk
const aiSettings = createResource({
	url: 'frappe.client.get',
	makeParams() {
		return {
			doctype: 'LMS AI Settings',
			name: 'LMS AI Settings', 
		}
	},
	onSuccess(data) {
		if (data && data.default_model) {
			aiModel.value = data.default_model
		}
	},
	onError(err) {
		console.warn('LMS AI Settings doctype not found or needs migration. Using default layout.', err)
	}
})

// Auto fetch the AI config when component loads
aiSettings.fetch()

const submission = ref({
	student_name: '',
})

const submissionsList = ref([])

function gradeSubmission() {
	if (!submission.value.student_name) {
		alert(__('Please enter a student name'))
		return
	}
	
	console.log('Grading essay for:', submission.value.student_name)
	alert(__('Grading in progress...'))
}

function saveSubmission() {
	if (!submission.value.student_name) {
		alert(__('Please enter a student name'))
		return
	}
	// Add logic to save submission to the session
	submissionsList.value.push({ ...submission.value })
	console.log('Saved submission for student:', submission.value.student_name)
	
	// Reset form
	submission.value.student_name = ''
	// Missing image reset logic depending on how EssayImageUploadBlock is built
}

function saveSession() {
	console.log('Saving session:', props.sessionId)
	// Alert or Toast for save success
	alert(__('Session saved successfully!'))
}

function exitSession() {
	// Navigate back to the essay grading overview
	router.push({ name: 'AIGradingEssay' })
}
</script>