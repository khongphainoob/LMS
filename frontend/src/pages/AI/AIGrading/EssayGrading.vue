<template>
	<section class="space-y-5">
		<div class="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
			<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<div class="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
						{{ __('Essay') }}
					</div>
					<h3 class="mt-3 text-xl font-semibold text-ink-gray-9">
						{{ __('Essay Grading Workspace') }}
					</h3>
					<p class="mt-1 text-sm text-ink-gray-7">
						{{ __('Blend rubric scoring, AI suggestions, and instructor approval in one place.') }}
					</p>
				</div>
				<div class="flex gap-2">
					<Button variant="solid" @click="showSessionModal = true">{{ __('Create Grading Session') }}</Button>
					<Button variant="outline">{{ __('Open Rubric') }}</Button>
					<Button>{{ __('Generate Draft Feedback') }}</Button>
				</div>
			</div>
		</div>

		<Dialog
			v-model="showSessionModal"
			:title="__('Create Essay Grading Session')"
		>
			<template #body-content>
				<div class="space-y-4 p-4">
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Session Name') }}</label>
						<Input type="text" v-model="sessionForm.session_name" :placeholder="__('Enter grading session name')" />
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Select Class') }}</label>
						<Input 
							type="select" 
							v-model="sessionForm.class_name" 
							:options="batchOptions" 
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Select Subject') }}</label>
						<Input 
							type="select" 
							v-model="sessionForm.course_name" 
							:options="courseOptions" 
						/>
					</div>
					<div class="space-y-2">
						<label class="text-sm font-medium text-gray-700">{{ __('Upload Rubric') }}</label>
						<EssayRubricUploadBlock />
					</div>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-end gap-2 px-4 pb-4">
					<Button @click="showSessionModal = false">{{ __('Cancel') }}</Button>
					<Button variant="solid" @click="submitSession">{{ __('Create Session') }}</Button>
				</div>
			</template>
		</Dialog>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="rounded-lg border border-amber-100 bg-amber-50/70 p-4">
				<div class="text-sm font-semibold text-ink-gray-9">{{ __('Rubric Coverage') }}</div>
				<p class="mt-1 text-xs text-ink-gray-6">
					{{ __('Each criterion is scored independently before AI summary generation.') }}
				</p>
				<div class="mt-3 h-2 rounded-full bg-amber-100">
					<div class="h-2 w-[82%] rounded-full bg-amber-400" />
				</div>
				<div class="mt-1 text-xs text-amber-700">82% {{ __('mapped criteria') }}</div>
			</div>

			<div class="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4">
				<div class="text-sm font-semibold text-ink-gray-9">{{ __('Feedback Quality') }}</div>
				<p class="mt-1 text-xs text-ink-gray-6">
					{{ __('Tone checks and actionable suggestions are validated before publish.') }}
				</p>
				<div class="mt-3 h-2 rounded-full bg-emerald-100">
					<div class="h-2 w-[91%] rounded-full bg-emerald-400" />
				</div>
				<div class="mt-1 text-xs text-emerald-700">91% {{ __('quality score') }}</div>
			</div>
		</div>

		<div class="rounded-xl border border-outline-gray-2 bg-surface-white p-5">
			<h4 class="text-base font-semibold text-ink-gray-9">{{ __('Review Queue') }}</h4>
			<div class="mt-3 space-y-3">
				<div
					v-for="item in queue"
					:key="item.title"
					class="flex flex-col gap-2 rounded-lg border border-outline-gray-2 p-4 md:flex-row md:items-center md:justify-between"
				>
					<div>
						<div class="text-sm font-semibold text-ink-gray-9">{{ item.title }}</div>
						<div class="text-xs text-ink-gray-6">{{ item.subtitle }}</div>
					</div>
					<Button class="w-full md:w-auto">{{ __('Open Submission') }}</Button>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Dialog, Input, createResource } from 'frappe-ui'
import EssayImageUploadBlock from '@/components/AIGrading/EssayImageUploadBlock.vue'
import EssayRubricUploadBlock from '@/components/AIGrading/EssayRubricUploadBlock.vue'

const router = useRouter()
const showSessionModal = ref(false)
const sessionForm = ref({
	session_name: '',
	class_name: '',
	course_name: '',
})

const batches = createResource({
	url: 'frappe.client.get_list',
	makeParams() {
		return {
			doctype: 'LMS Batch',
			fields: ['name', 'title'],
			limit_page_length: 0,
		}
	},
	auto: true,
})

const batchOptions = computed(() => {
	const options = batches.data?.map((batch) => ({
		label: batch.title || batch.name,
		value: batch.name,
	})) || []
	
	return [{ label: __('Select Class...'), value: '' }, ...options]
})

const courses = createResource({
	url: 'frappe.client.get_list',
	makeParams() {
		return {
			doctype: 'LMS Course',
			fields: ['name', 'title'],
			limit_page_length: 0,
		}
	},
	auto: true,
})

const courseOptions = computed(() => {
	const options = courses.data?.map((course) => ({
		label: course.title || course.name,
		value: course.name,
	})) || []
	
	return [{ label: __('Select Subject...'), value: '' }, ...options]
})

function submitSession() {
	console.log('Session Form:', sessionForm.value)
	// You can add API call here to create Essay Grading Session in the database, e.g.:
	// frappe.call('lms.lms.api.create_grading_session', sessionForm.value)
	
	// Create a random session ID for routing example or use the response from DB
	const genSessionId = sessionForm.value.session_name || 'new-session'
	
	showSessionModal.value = false
	router.push({ name: 'EssayGradingSession', params: { sessionId: genSessionId } })
}

const queue = [
	{
		title: __('ENG-302 / Midterm Essay / 24 submissions'),
		subtitle: __('3 responses need manual override.'),
	},
	{
		title: __('BUS-110 / Reflection Paper / 18 submissions'),
		subtitle: __('AI suggestions generated, awaiting approval.'),
	},
	{
		title: __('LAW-208 / Case Analysis / 11 submissions'),
		subtitle: __('Rubric mismatch detected for criterion #4.'),
	},
]
</script>
