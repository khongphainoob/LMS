<template>
	<Dialog v-model="show" :options="{ title: __('Create Assessment Assignment'), size: '2xl' }">
		<template #body-content>
			<div class="space-y-6">
				<!-- Batch Selection -->
				<div>
					<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Select Batch") }}</label>
					<select
						v-model="form.batch"
						class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3"
					>
						<option value="" disabled>{{ __("Select a batch you moderate") }}</option>
						<option v-for="b in batches" :key="b.name" :value="b.name">{{ b.title || b.name }}</option>
					</select>
				</div>

				<!-- Target Assignment Type -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Type") }}</label>
						<select
							v-model="form.type"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3"
						>
							<option value="Quiz">{{ __("Standard Quiz") }}</option>
							<option value="Game">{{ __("Gamified Assessment") }}</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">
							{{ form.type === 'Quiz' ? __("Select Quiz") : __("Select Game") }}
						</label>
						<select
							v-model="form.referenceName"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3"
						>
							<option value="" disabled>{{ __("Select...") }}</option>
							<template v-if="form.type === 'Quiz'">
								<option v-for="q in quizzes" :key="q.name" :value="q.name">{{ q.title }}</option>
							</template>
							<template v-else>
								<option v-for="g in games" :key="g.name" :value="g.name">{{ g.title }}</option>
							</template>
						</select>
					</div>
				</div>

				<!-- Schedule -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Available From") }}</label>
						<input
							type="datetime-local"
							v-model="form.availableFrom"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Available Until") }}</label>
						<input
							type="datetime-local"
							v-model="form.availableUntil"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3"
						/>
					</div>
				</div>

				<!-- Weight & Attempts -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Weight in Final Grade (%)") }}</label>
						<input
							type="number"
							min="0"
							max="100"
							v-model="form.weight"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3"
						/>
					</div>
					<div v-if="form.type === 'Game'">
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Max Attempts") }}</label>
						<input
							type="number"
							min="1"
							v-model="form.maxAttempts"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3"
						/>
					</div>
				</div>
			</div>
		</template>
		
		<template #actions>
			<div class="flex justify-end gap-3 w-full">
				<Button @click="show = false">{{ __("Cancel") }}</Button>
				<Button
					variant="solid"
					:loading="isSubmitting"
					:disabled="!isValid"
					@click="submit"
				>
					{{ __("Assign") }}
				</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Dialog, Button, createResource, toast } from 'frappe-ui'
import { sessionStore } from '@/stores/session'

const show = defineModel()
const emit = defineEmits(['created'])

const session = sessionStore()

const form = reactive({
	batch: '',
	type: 'Quiz',
	referenceName: '',
	availableFrom: '',
	availableUntil: '',
	weight: 0,
	maxAttempts: 3
})

const isValid = computed(() => {
	return form.batch && form.referenceName
})

const isSubmitting = ref(false)

// Data fetching
const batchesResource = createResource({
	url: 'frappe.client.get_list',
	params: {
		doctype: 'LMS Batch',
		fields: ['name', 'title'],
		// Ideally filtered by ownership/evaluator in a custom backend method
	},
	auto: true
})
const batches = computed(() => batchesResource.data || [])

const quizzesResource = createResource({
	url: 'frappe.client.get_list',
	params: { doctype: 'LMS Quiz', fields: ['name', 'title'] },
	auto: true
})
const quizzes = computed(() => quizzesResource.data || [])

const gamesResource = createResource({
	url: 'frappe.client.get_list',
	params: { doctype: 'LMS Game', fields: ['name', 'title'], filters: { is_active: 1 } },
	auto: true
})
const games = computed(() => gamesResource.data || [])

const submitAction = createResource({
	url: 'frappe.client.insert',
})

async function submit() {
	isSubmitting.value = true
	try {
		if (form.type === 'Quiz') {
			await submitAction.submit({
				doc: {
					doctype: 'LMS Assessment Assignment',
					quiz: form.referenceName,
					batch: form.batch,
					available_from: form.availableFrom || null,
					available_until: form.availableUntil || null,
					weight: form.weight,
					assigned_by: session.user
				}
			})
			toast.success(__('Quiz assigned successfully!'))
		} else {
			await submitAction.submit({
				doc: {
					doctype: 'LMS Class Game',
					game: form.referenceName,
					batch: form.batch,
					available_from: form.availableFrom || null,
					available_until: form.availableUntil || null,
					weight_in_final_grade: form.weight,
					max_attempts: form.maxAttempts
				}
			})
			toast.success(__('Game assigned to batch successfully!'))
		}
		
		emit('created')
		show.value = false
		// reset
		form.referenceName = ''
		form.weight = 0
		form.availableFrom = ''
		form.availableUntil = ''
	} catch (error) {
		const msg = error?.message || error?.exc_type || __('Failed to assign. Please try again.')
		toast.error(msg)
		console.error('Failed to assign:', error)
	} finally {
		isSubmitting.value = false
	}
}
</script>
