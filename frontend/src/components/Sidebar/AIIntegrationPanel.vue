<template>
	<section
		v-if="isEnabled && (isTeacher || isStudent)"
		class="mx-2 my-2.5"
	>
		<div class="mb-2 mt-3 flex gap-1.5 px-1 text-base font-medium text-ink-gray-5">
			<span>{{ __('AI Integration') }}</span>
		</div>

		<div class="space-y-3">
			<div v-if="isTeacher" class="space-y-1">
				<div class="mb-1 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-ink-gray-6">
					<ShieldCheck class="h-3.5 w-3.5 text-ink-gray-6" />
					<span>{{ __('Teacher') }}</span>
				</div>
				<div class="space-y-1">
					<button
						v-for="item in teacherItems"
						:key="item.label"
						class="group flex w-full min-h-[44px] items-center rounded-r-md border-l-[3px] px-3 py-2 text-left text-base transition duration-200"
						:class="isActive(item)
							? 'bg-surface-selected text-ink-gray-9 border-ink-gray-5 font-semibold shadow-sm'
							: 'border-transparent text-ink-gray-7 hover:bg-surface-gray-2 hover:text-ink-gray-9'"
						@click="go(item)"
					>
						<component
							:is="icons[item.icon]"
							class="h-[18px] w-[18px] stroke-1.5"
							:class="isActive(item) ? 'text-ink-gray-9' : 'text-ink-gray-6 group-hover:text-ink-gray-9'"
						/>
						<span>{{ __(item.label) }}</span>
					</button>
				</div>
			</div>

			<div v-if="isStudent" class="space-y-1">
				<div class="mb-1 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-ink-gray-6">
					<GraduationCap class="h-3.5 w-3.5 text-ink-gray-6" />
					<span>{{ __('Student') }}</span>
				</div>
				<div class="space-y-1">
					<button
						v-for="item in studentItems"
						:key="item.label"
						class="group flex w-full min-h-[44px] items-center rounded-r-md border-l-[3px] px-3 py-2 text-left text-base transition duration-200"
						:class="isActive(item)
							? 'bg-surface-selected text-ink-gray-9 border-ink-gray-5 font-semibold shadow-sm'
							: 'border-transparent text-ink-gray-7 hover:bg-surface-gray-2 hover:text-ink-gray-9'"
						@click="go(item)"
					>
						<component
							:is="icons[item.icon]"
							class="h-[18px] w-[18px] stroke-1.5"
							:class="isActive(item) ? 'text-ink-gray-9' : 'text-ink-gray-6 group-hover:text-ink-gray-9'"
						/>
						<span>{{ __(item.label) }}</span>
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import * as icons from 'lucide-vue-next'
import { ShieldCheck, GraduationCap } from 'lucide-vue-next'

const emit = defineEmits(['navigate'])

const props = defineProps({
	isTeacher: {
		type: Boolean,
		default: false,
	},
	isModerator: {
		type: Boolean,
		default: false,
	},
	isStudent: {
		type: Boolean,
		default: false,
	},
	isEnabled: {
		type: Boolean,
		default: true,
	},
})

const router = useRouter()

const teacherItems = computed(() => {
	if (!props.isTeacher) return []
	return [
		{
			label: 'Grading Book',
			icon: 'BookText',
			to: 'GradingBook',
			activeFor: ['GradingBook'],
		},
		{
			label: 'AI Grading',
			icon: 'Bot',
			to: 'AIGradingRubric',
			activeFor: [
				'AIGrading',
				'AIGradingRubric',
				'AIGradingEssay',
				'AIGradingEssayConfig',
				'AIGradingEssayWorkspace',
				'AIGradingSessionStatistics',
			],
		},
		{
			label: 'Lesson Planning',
			icon: 'CalendarCheck',
			to: 'LessonPlanning',
			activeFor: ['LessonPlanning'],
		},
		{
			label: 'Documents',
			icon: 'FolderOpen',
			to: 'Documents',
			activeFor: ['Documents'],
		},
	]
})

const studentItems = computed(() => [
	{
		label: 'Smart Chatbot',
		icon: 'MessageCircleMore',
		to: 'StudentAIHelper',
		activeFor: ['StudentAIHelper'],
	},
	{
		label: 'Q&A Support',
		icon: 'MessagesSquare',
		to: 'Search',
		activeFor: ['Search'],
	},
])

const isActive = (item) => item.activeFor?.includes(router.currentRoute.value.name)

const go = (item) => {
	if (item.to && router.hasRoute(item.to)) {
		router.push({ name: item.to })
		emit('navigate')
	}
}
</script>
