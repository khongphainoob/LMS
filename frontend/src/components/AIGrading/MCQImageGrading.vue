<template>
	<div class="space-y-6">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ __('Grading Session Name') }}</label>
				<Input v-model="sessionName" :placeholder="__('Example: Midterm Math Exam')" />
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ __('Class') }}</label>
				<Input v-model="className" :placeholder="__('Example: 12A1')" />
			</div>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ __('Upload Answer Key (Word/PDF)') }}</label>
			<div
				class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-8 transition-all hover:border-blue-200 hover:bg-blue-50/20 cursor-pointer"
				@click="triggerFile"
			>
				<div class="text-4xl mb-3">📄</div>
				<div v-if="uploadedFile" class="text-sm font-bold text-blue-600">{{ uploadedFile.name }}</div>
				<div v-else class="text-center">
					<div class="text-sm font-medium text-gray-600">{{ __('Click to upload answer file') }}</div>
					<div class="text-[10px] text-gray-400 mt-1">{{ __('Supports .doc, .docx, .pdf (Max 10MB)') }}</div>
				</div>
			</div>
			<input type="file" ref="fileInput" class="hidden" accept=".doc,.docx,.pdf" @change="handleFile" />
		</div>

		<div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
			<Button variant="outline" @click="$emit('cancel')">{{ __('Cancel') }}</Button>
			<Button 
				variant="solid" 
				theme="blue" 
				:loading="isCreating"
				:disabled="!isReady"
				@click="createSession"
			>
				{{ __('Create Session & Start') }}
			</Button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Input, createResource } from 'frappe-ui'

const router = useRouter()
const emit = defineEmits(['cancel'])

const sessionName = ref('')
const className = ref('')
const uploadedFile = ref(null)
const fileInput = ref(null)
const isCreating = ref(false)

const isReady = computed(() => sessionName.value && uploadedFile.value)

function triggerFile() {
	fileInput.value?.click()
}

function handleFile(e) {
	uploadedFile.value = e.target.files[0]
}

async function fileToDataUrl(file) {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result)
		reader.onerror = () => reject(new Error('Unable to read file'))
		reader.readAsDataURL(file)
	})
}

async function createSession() {
	if (!isReady.value) return
	isCreating.value = true
	try {
		const createResourceCall = createResource({
			url: 'lms.lms.services.ai_grading.api.create_ai_grading_session',
		})
		
		const res = await createResourceCall.submit({
			data: {
				session_name: sessionName.value,
				class_name: className.value,
				grading_type: 'MCQ',
				status: 'Open'
			}
		})

		if (res && uploadedFile.value) {
			const sessionNameId = res.name || res
			try {
				const dataUrl = await fileToDataUrl(uploadedFile.value)
				await createResource({
					url: 'lms.lms.api.upload_ai_grading_session_attachment',
				}).submit({
					session: sessionNameId,
					data_url: dataUrl,
					file_name: uploadedFile.value.name
				})
			} catch (e) {
				console.error("Upload error", e)
			}
			
			router.push({
				name: 'MCQGradingWorkspace',
				params: { sessionSlug: sessionNameId }
			})
		}
	} finally {
		isCreating.value = false
	}
}
</script>
