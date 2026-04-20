<template>
	<div class="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dff7f0_0,_#f9fcff_50%,_#ffffff_100%)]">
		<header class="sticky top-0 z-10 border-b border-emerald-100/70 bg-white/90 px-3 py-2.5 backdrop-blur sm:px-5">
			<Breadcrumbs :items="breadcrumbs" />
		</header>

		<div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
			<div class="mb-5 rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 class="text-2xl font-bold text-ink-gray-9">{{ __('Smart Student Chatbot') }}</h1>
						<p class="mt-1 text-sm text-ink-gray-6">
							{{ __('Ask about lessons, deadlines, and learning strategies. The assistant gives quick guidance for students.') }}
						</p>
					</div>
					<div class="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
						{{ __('Q&A Support') }}
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.8fr_1fr]">
				<section class="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
					<div class="mb-3 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-ink-gray-8">{{ __('Conversation') }}</h2>
						<button
							class="rounded-lg border border-outline-gray-2 px-2.5 py-1 text-xs text-ink-gray-6 hover:bg-surface-gray-1"
							@click="resetConversation"
						>
							{{ __('Reset') }}
						</button>
					</div>

					<div class="max-h-[420px] space-y-3 overflow-y-auto rounded-xl bg-surface-gray-1 p-3">
						<div
							v-for="(message, index) in messages"
							:key="index"
							class="max-w-[90%] rounded-xl px-3 py-2 text-sm"
							:class="message.role === 'user' ? 'ml-auto bg-emerald-600 text-white' : 'bg-white text-ink-gray-8 border border-emerald-100'"
						>
							{{ message.text }}
						</div>
					</div>

					<div class="mt-3 flex gap-2">
						<input
							v-model="question"
							class="w-full rounded-xl border border-outline-gray-2 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
							:placeholder="__('Type your question...')"
							@keyup.enter="sendQuestion"
						/>
						<button
							class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
							@click="sendQuestion"
						>
							{{ __('Send') }}
						</button>
					</div>
				</section>

				<aside class="space-y-4">
					<section class="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
						<h3 class="text-sm font-semibold text-ink-gray-8">{{ __('Suggested Questions') }}</h3>
						<div class="mt-3 flex flex-wrap gap-2">
							<button
								v-for="prompt in prompts"
								:key="prompt"
								class="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs text-cyan-800 transition hover:bg-cyan-100"
								@click="usePrompt(prompt)"
							>
								{{ __(prompt) }}
							</button>
						</div>
					</section>

					<section class="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
						<h3 class="text-sm font-semibold text-ink-gray-8">{{ __('Learning Tips') }}</h3>
						<ul class="mt-2 space-y-2 text-xs text-ink-gray-6">
							<li>{{ __('Review difficult topics in short 20-25 minute sessions.') }}</li>
							<li>{{ __('Use active recall and self-quizzes after each lesson.') }}</li>
							<li>{{ __('Ask clear questions with course and lesson context for better answers.') }}</li>
						</ul>
					</section>
				</aside>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { Breadcrumbs, usePageMeta } from 'frappe-ui'
import { sessionStore } from '@/stores/session'

const { brand } = sessionStore()
const question = ref('')

const prompts = [
	'How do I prepare for my next quiz?',
	'Give me a study plan for this week',
	'How can I improve essay writing?',
	'How should I ask teachers for feedback?',
]

const starterMessages = [
	{
		role: 'assistant',
		text: __('Hello! I am your smart learning assistant. Ask me anything about studying, assignments, or exam preparation.'),
	},
]

const messages = ref([...starterMessages])

const breadcrumbs = [
	{
		label: __('AI Integration'),
		route: { name: 'AIIntegration' },
	},
	{
		label: __('Smart Chatbot'),
		route: { name: 'StudentAIHelper' },
	},
]

const normalize = (text) => text.toLowerCase().trim()

const buildResponse = (text) => {
	const q = normalize(text)
	if (q.includes('quiz')) {
		return __('Focus on key concepts, practice with short quizzes daily, and review incorrect answers before retrying.')
	}
	if (q.includes('essay') || q.includes('writing')) {
		return __('Use a simple structure: thesis, 2-3 supporting points, and conclusion. Then revise for clarity and grammar.')
	}
	if (q.includes('plan') || q.includes('schedule')) {
		return __('Try a weekly plan: 3 review sessions, 2 practice sessions, and 1 reflection session to track progress.')
	}
	if (q.includes('deadline') || q.includes('assignment')) {
		return __('Break your task into small milestones and finish a draft at least one day before the deadline.')
	}
	return __('Great question. Include your course name, lesson topic, and where you are stuck so I can help with a more targeted answer.')
}

const sendQuestion = () => {
	if (!question.value.trim()) return
	const content = question.value.trim()
	messages.value.push({ role: 'user', text: content })
	messages.value.push({ role: 'assistant', text: buildResponse(content) })
	question.value = ''
}

const usePrompt = (prompt) => {
	question.value = __(prompt)
	sendQuestion()
}

const resetConversation = () => {
	messages.value = [...starterMessages]
}

usePageMeta(() => {
	return {
		title: `${__('Smart Chatbot')} - ${brand.value}`,
	}
})
</script>
