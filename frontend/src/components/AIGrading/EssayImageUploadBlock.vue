<template>
	<div class="rounded-xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-5 shadow-sm">
		<div class="flex items-start justify-between gap-3">
			<div>
				<div class="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
					{{ __('Image Inputs') }}
				</div>
				<h4 class="mt-3 text-base font-semibold text-ink-gray-9">
					{{ __('Upload Essay Images') }}
				</h4>
				<p class="mt-1 text-xs text-ink-gray-6">
					{{ __('Supports all image formats and allows multiple files.') }}
				</p>
			</div>
			<ImageIcon class="h-5 w-5 text-sky-500" />
		</div>

		<label
			for="essay-images-input"
			class="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-sky-300 bg-white p-5 text-center transition hover:border-sky-400"
			:class="{ 'opacity-50 pointer-events-none': disabled }"
		>
			<Upload class="h-5 w-5 text-sky-600" />
			<div class="mt-2 text-sm font-medium text-ink-gray-8">
				{{ __('Select one or more images') }}
			</div>
			<div class="mt-1 text-xs text-ink-gray-6">
				{{ __('PNG, JPG, WEBP, GIF, BMP, TIFF and more') }}
			</div>
		</label>

		<input
			id="essay-images-input"
			type="file"
			accept="image/*"
			multiple
			class="hidden"
			:disabled="disabled"
			@change="onImagesPicked"
		/>

		<div v-if="localFiles.length" class="mt-4 rounded-lg border border-sky-100 bg-white p-3">
			<div class="flex items-center justify-between">
				<div class="text-xs font-medium text-ink-gray-7">
					{{ __('Selected Images') }} ({{ localFiles.length }})
				</div>
				<button
					v-if="!disabled"
					class="text-[10px] text-rose-500 hover:text-rose-700 transition-colors"
					@click="reset"
				>
					{{ __('Clear all') }}
				</button>
			</div>
			<ul class="mt-2 max-h-28 space-y-1 overflow-auto">
				<li
					v-for="file in localFiles"
					:key="file.name + file.lastModified"
					class="truncate text-xs text-ink-gray-6"
				>
					{{ file.name }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Upload, ImageIcon } from 'lucide-vue-next'

const props = defineProps({
	modelValue: { type: Array, default: () => [] },
	disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const localFiles = ref([...props.modelValue])

watch(() => props.modelValue, (val) => {
	localFiles.value = [...val]
})

function onImagesPicked(event) {
	const files = Array.from(event.target.files || [])
	localFiles.value = [...localFiles.value, ...files]
	emit('update:modelValue', localFiles.value)
}

function reset() {
	localFiles.value = []
	emit('update:modelValue', [])
}

defineExpose({ reset })
</script>
