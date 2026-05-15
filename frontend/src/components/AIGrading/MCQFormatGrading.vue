<template>
	<div class="space-y-6">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ __('Tên bài chấm') }}</label>
				<Input v-model="sessionName" :placeholder="__('Ví dụ: Kiểm tra 15p Toán')" />
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ __('Lớp') }}</label>
				<Input v-model="className" :placeholder="__('Ví dụ: 12A1')" />
			</div>
		</div>

		<!-- New Template Image Upload -->
		<div class="flex flex-col gap-1">
			<label class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ __('Ảnh Form chấm mẫu (Tùy chọn)') }}</label>
			<div
				class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/20 cursor-pointer"
				@click="triggerTemplateFile"
			>
				<div class="text-2xl mb-1">🖼️</div>
				<div v-if="templateFile" class="text-xs font-bold text-blue-600">{{ templateFile.name }}</div>
				<div v-else class="text-center">
					<div class="text-[10px] font-medium text-gray-500">{{ __('Tải lên ảnh mẫu tờ bài làm (để AI nhận diện tốt hơn)') }}</div>
				</div>
			</div>
			<input type="file" ref="templateInput" class="hidden" accept="image/*" @change="handleTemplateFile" />
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<label class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ __('Danh sách Đáp án') }}</label>
				<Button size="sm" variant="outline" @click="addQuestion">+ {{ __('Thêm câu') }}</Button>
			</div>
			
			<div class="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
				<div v-for="(q, idx) in questions" :key="idx" class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
					<span class="text-xs font-bold text-gray-400 w-8">#{{ idx + 1 }}</span>
					<div class="flex-1 grid grid-cols-3 gap-2">
						<select v-model="q.type" class="text-xs border-gray-200 rounded-lg bg-white p-1.5 focus:ring-blue-500">
							<option value="single">{{ __('Một đáp án') }}</option>
							<option value="multi">{{ __('Nhiều đáp án') }}</option>
							<option value="true_false">{{ __('Đúng/Sai') }}</option>
						</select>
						<Input v-model="q.ans" :placeholder="__('Đáp án')" class="text-xs" />
						<Input v-model="q.score" type="number" step="0.1" :placeholder="__('Điểm')" class="text-xs" />
					</div>
					<button class="text-rose-400 hover:text-rose-600" @click="removeQuestion(idx)">✕</button>
				</div>
			</div>
		</div>

		<div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
			<Button variant="outline" @click="$emit('cancel')">{{ __('Hủy') }}</Button>
			<Button 
				variant="solid" 
				theme="blue" 
				:loading="isCreating"
				:disabled="!isReady"
				@click="createSession"
			>
				{{ __('Tạo Phiên & Bắt đầu') }}
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
const templateFile = ref(null)
const templateInput = ref(null)
const questions = ref([
	{ type: 'single', ans: '', score: 1.0 }
])
const isCreating = ref(false)

const isReady = computed(() => sessionName.value && questions.value.length > 0)

function triggerTemplateFile() {
	templateInput.value?.click()
}

function handleTemplateFile(e) {
	templateFile.value = e.target.files[0]
}

function addQuestion() {
	questions.value.push({ type: 'single', ans: '', score: 1.0 })
}

function removeQuestion(idx) {
	questions.value.splice(idx, 1)
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
				status: 'Open',
				ai_notes: JSON.stringify({ answer_key: questions.value })
			}
		})

		if (res) {
			const sessionNameId = res.name || res
			
			// Upload template if exists
			if (templateFile.value) {
				const reader = new FileReader()
				reader.onload = async () => {
					await createResource({
						url: 'lms.lms.api.upload_ai_grading_session_attachment',
					}).submit({
						session: sessionNameId,
						data_url: reader.result,
						file_name: templateFile.value.name
					})
					
					// Also update answer_sheet_template field specifically? 
					// Let's just use the attachment for now, or update the doc field.
					await createResource({
						url: 'frappe.client.set_value',
					}).submit({
						doctype: 'AI Grading Session',
						name: sessionNameId,
						fieldname: 'answer_sheet_template',
						value: templateFile.value.name // Usually requires a file path after upload
					})
				}
				reader.readAsDataURL(templateFile.value)
			}

			router.push({
				name: 'MCQGradingWorkspace',
				params: { sessionSlug: res.route_slug || sessionNameId }
			})
		}
	} finally {
		isCreating.value = false
	}
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
