<template>
	<div
		class="rounded-xl border border-outline-gray-2 bg-surface-white p-4"
	>
		<div class="text-sm font-semibold text-ink-gray-9 mb-3">
			{{ __('Upcoming') }}
		</div>

		<div v-if="events.length === 0" class="text-sm text-ink-gray-5 py-4 text-center">
			{{ __('No upcoming events') }}
		</div>

		<div v-else class="space-y-3">
			<div
				v-for="(event, index) in events.slice(0, 5)"
				:key="index"
				class="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-gray-1 transition-colors cursor-pointer"
			>
				<!-- Date badge -->
				<div
					class="flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs"
					:class="eventDateColor(event)"
				>
					<span class="font-bold text-sm leading-none">
						{{ getDay(event) }}
					</span>
					<span class="uppercase leading-none mt-0.5">
						{{ getMonthShort(event) }}
					</span>
				</div>

				<!-- Event info -->
				<div class="flex-1 min-w-0">
					<div class="text-sm font-medium text-ink-gray-9 truncate">
						{{ event.title || event.course_title }}
					</div>
					<div class="text-xs text-ink-gray-5 mt-0.5 flex items-center gap-1">
						<Clock class="size-3 stroke-1.5" />
						<span>
							{{ getTime(event) }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'
import { inject } from 'vue'

const props = defineProps<{
	evaluations?: any[]
	liveClasses?: any[]
}>()

const dayjs = inject<any>('$dayjs')

const events = computed(() => {
	const list: any[] = []

	if (props.evaluations?.length) {
		props.evaluations.forEach((ev) => {
			list.push({
				title: ev.course_title,
				date: ev.date,
				time: ev.start_time,
				type: 'evaluation',
			})
		})
	}

	if (props.liveClasses?.length) {
		props.liveClasses.forEach((cls) => {
			list.push({
				title: cls.title,
				date: cls.date,
				time: cls.time,
				type: 'live_class',
			})
		})
	}

	// Sort by date ascending
	list.sort((a, b) => {
		const da = new Date(`${a.date}T${a.time || '00:00'}`)
		const db = new Date(`${b.date}T${b.time || '00:00'}`)
		return da.getTime() - db.getTime()
	})

	return list
})

const getDay = (event: any) => {
	return dayjs(event.date).format('DD')
}

const getMonthShort = (event: any) => {
	return dayjs(event.date).format('MMM')
}

const getTime = (event: any) => {
	if (!event.time) return ''
	return dayjs(event.time, 'HH:mm:ss').format('HH:mm A')
}

const eventDateColor = (event: any) => {
	if (event.type === 'evaluation') {
		return 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
	}
	return 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
}
</script>
