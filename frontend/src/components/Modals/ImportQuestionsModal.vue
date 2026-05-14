<template>
	<Dialog
		v-model="show"
		:options="{
			title: __('Import Questions'),
			size: 'xl',
		}"
	>
		<template #body-content>
			<div class="space-y-4">
				<div class="text-ink-gray-7 mb-2">
					{{ __('Please upload an Excel or CSV file containing the questions.') }}
					<br/>
					{{ __('The first row must be the header with column names like: question, type, marks.') }}
				</div>
                <div v-if="!fileUrl">
                    <FileUploader
                        :fileTypes="['.xlsx', '.csv']"
                        @success="onFileUploaded"
                    >
                        <template v-slot="{ file, progress, uploading, openFileSelector }">
                            <div class="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center">
                                <Button @click="openFileSelector" :loading="uploading">
                                    <template #prefix><Upload class="w-4 h-4" /></template>
                                    {{ uploading ? __('Uploading...') : __('Select Excel/CSV File') }}
                                </Button>
                                <div class="mt-2 text-sm text-gray-500">
                                    {{ progress > 0 ? progress + '%' : '' }}
                                </div>
                            </div>
                        </template>
                    </FileUploader>
                </div>
                <div v-else class="flex items-center justify-between border p-4 rounded-lg bg-surface-gray-2">
                    <span class="text-sm truncate mr-4">{{ fileUrl }}</span>
                    <Button variant="ghost" @click="resetFile">
                        <Trash2 class="w-4 h-4 text-red-500" />
                    </Button>
                </div>
			</div>
		</template>
		<template #actions="{ close }">
			<div class="flex justify-end gap-2">
                <Button @click="close">
					{{ __('Cancel') }}
				</Button>
				<Button variant="solid" @click="processImport(close)" :loading="importing" :disabled="!fileUrl">
					{{ __('Import') }}
				</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup lang="ts">
import { Dialog, Button, FileUploader, toast, call } from 'frappe-ui'
import { Upload, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'

const show = defineModel<boolean>({ required: true, default: false })
const emit = defineEmits(['success'])

const props = defineProps<{
	quizName: string
}>()

const fileUrl = ref('')
const importing = ref(false)

const onFileUploaded = (file: any) => {
    if (file && file.file_url) {
        fileUrl.value = file.file_url
    }
}

const resetFile = () => {
    fileUrl.value = ''
}

const processImport = (close: () => void) => {
    if (!fileUrl.value) return

    importing.value = true
    call('lms.lms.doctype.lms_quiz.lms_quiz.import_questions_from_file', {
        quiz_name: props.quizName,
        file_url: fileUrl.value
    })
    .then((count: number) => {
        toast.success(__('Imported {0} questions successfully', [count]))
        emit('success')
        close()
        resetFile()
    })
    .catch((err: any) => {
        toast.error(__(err.messages?.[0] || 'Import failed'))
        console.error(err)
    })
    .finally(() => {
        importing.value = false
    })
}
</script>