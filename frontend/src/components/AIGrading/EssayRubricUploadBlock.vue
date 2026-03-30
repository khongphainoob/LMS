<template>
	<div class="rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-5 shadow-sm">
		<div class="flex items-start justify-between gap-3">
			<div>
				<div class="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
					{{ __('Rubric File') }}
				</div>
				<h4 class="mt-3 text-base font-semibold text-ink-gray-9">
					{{ __('Upload Scoring Rubric') }}
				</h4>
				<p class="mt-1 text-xs text-ink-gray-6">
					{{ __('Only one rubric file is allowed for each grading session.') }}
				</p>
			</div>
			<FileText class="h-5 w-5 text-emerald-600" />
		</div>

		<label
			for="essay-rubric-input"
			class="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-emerald-300 bg-white p-5 text-center transition hover:border-emerald-400"
			:class="{ 'opacity-50 pointer-events-none': disabled }"
		>
			<Upload class="h-5 w-5 text-emerald-600" />
			<div class="mt-2 text-sm font-medium text-ink-gray-8">
				{{ __('Select one rubric document') }}
			</div>
			<div class="mt-1 text-xs text-ink-gray-6">
				{{ __('PDF, DOC, DOCX, TXT, RTF, ODT — Max 10MB') }}
			</div>
		</label>

		<input
			id="essay-rubric-input"
			type="file"
			accept=".pdf,.doc,.docx,.txt,.rtf,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf,application/vnd.oasis.opendocument.text"
			class="hidden"
			:disabled="disabled"
			@change="onRubricPicked"
		/>

		<div v-if="localFile" class="mt-4 rounded-lg border border-emerald-100 bg-white p-3">
			<div class="flex items-center justify-between">
				<div>
					<div class="text-xs font-medium text-ink-gray-7">{{ __('Selected Rubric') }}</div>
					<div class="mt-1 truncate text-xs text-ink-gray-6">{{ localFile.name }}</div>
				</div>
				<button
					v-if="!disabled"
					class="text-[10px] text-rose-500 hover:text-rose-700 transition-colors"
					@click="reset"
				>
					{{ __('Remove') }}
				</button>
			</div>
		</div>

		<!-- Validation error -->
		<div v-if="error" class="mt-2 text-xs text-rose-600 font-medium">
			{{ error }}
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Upload, FileText } from 'lucide-vue-next'

const MAX_SIZE_MB = 10

const props = defineProps({
	modelValue: { type: [File, null], default: null },
	disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const localFile = ref(props.modelValue)
const error = ref('')

watch(() => props.modelValue, (val) => {
	localFile.value = val
})

function onRubricPicked(event) {
	error.value = ''
	const [file] = Array.from(event.target.files || [])
	if (!file) return

	// Validate file size
	if (file.size > MAX_SIZE_MB * 1024 * 1024) {
		error.value = __('File size exceeds {0}MB limit.', [MAX_SIZE_MB])
		event.target.value = ''
		return
	}

	localFile.value = file
	emit('update:modelValue', file)
}

function reset() {
	error.value = ''
	localFile.value = null
	emit('update:modelValue', null)
}

defineExpose({ reset })
</script>
