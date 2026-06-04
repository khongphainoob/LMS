<template>
	<div>
		<!-- Stat Cards: Overview -->
		<div v-if="performanceStats.loading || hoursSpent.loading || dashboardStreak.loading" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
			<div v-for="i in 3" :key="i" class="h-24 animate-pulse bg-surface-gray-2 rounded-xl"></div>
		</div>
		<div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
			<StatCard
				:label="__('Overall Completion')"
				:count="performanceStats.data?.overall_completion || 0"
				:progress="performanceStats.data?.overall_completion || 0"
				suffix="%"
				color="blue"
			/>
			<StatCard
				:label="__('Learning Hours')"
				:count="hoursSpent.data?.total_hours || 0"
				:progress="Math.min(hoursSpent.data?.total_hours || 0, 100)"
				suffix="h"
				color="orange"
			/>
			<StatCard
				:label="__('Current Streak')"
				:count="dashboardStreak.data?.current_streak || 0"
				:progress="Math.min((dashboardStreak.data?.current_streak || 0) * 3, 100)"
				suffix="d"
				color="green"
			/>
		</div>

		<!-- My Courses -->
		<div v-if="myCourses.data?.length">
			<div class="flex items-center justify-between mb-3">
				<span v-if="myCourses.data?.length" class="font-semibold text-lg text-ink-gray-9">
					{{
						myCourses.data[0]?.membership
							? __('My Courses')
							: __('Our Popular Courses')
					}}
				</span>
				<router-link
					:to="{
						name: 'Courses',
					}"
				>
					<span class="flex items-center space-x-1 text-ink-gray-5 text-xs">
						<span>
							{{ __('See all') }}
						</span>
						<MoveRight class="size-3 stroke-1.5" />
					</span>
				</router-link>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				<router-link
					v-for="course in myCourses.data"
					:to="{ name: 'CourseDetail', params: { courseName: course.name } }"
				>
					<CourseCard :course="course" />
				</router-link>
			</div>
		</div>

		<!-- My Batches -->
		<div v-if="myBatches.data?.length" class="mt-10">
			<div class="flex items-center justify-between mb-3">
				<span class="font-semibold text-lg text-ink-gray-9">
					{{
						myBatches.data?.[0]?.students?.includes(user.data?.name)
							? __('My Batches')
							: __('Our Upcoming Batches')
					}}
				</span>
				<router-link
					:to="{
						name: 'Batches',
					}"
				>
					<span class="flex items-center space-x-1 text-ink-gray-5 text-xs">
						<span>
							{{ __('See all') }}
						</span>
						<MoveRight class="size-3 stroke-1.5" />
					</span>
				</router-link>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
				<router-link
					v-for="batch in myBatches.data"
					:to="{ name: 'BatchDetail', params: { batchName: batch.name } }"
				>
					<BatchCard :batch="batch" />
				</router-link>
			</div>
		</div>

		<!-- Upcoming Live Classes -->
		<div v-if="myLiveClasses.data?.length" class="mt-10">
			<div class="font-semibold text-lg mb-3 text-ink-gray-9">
				{{ __('Upcoming Live Classes') }}
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div
					v-for="cls in myLiveClasses.data"
					class="border border-outline-gray-2 bg-surface-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 shadow-sm rounded-xl p-5"
				>
					<div class="font-semibold text-ink-gray-9 text-lg leading-5 mb-1">
						{{ cls.title }}
					</div>
					<div class="text-ink-gray-5 leading-5 mb-4">
						{{ cls.description }}
					</div>
					<div class="mt-auto space-y-4 text-ink-gray-7">
						<div class="flex items-center space-x-2">
							<Calendar class="w-4 h-4 stroke-1.5" />
							<span>
								{{ dayjs(cls.date).format('DD MMMM YYYY') }}
							</span>
						</div>
						<div class="flex items-center space-x-2">
							<Clock class="w-4 h-4 stroke-1.5" />
							<span>
								{{ formatTime(cls.time) }} -
								{{ dayjs(getClassEnd(cls)).format('HH:mm A') }}
							</span>
						</div>
						<div
							v-if="canAccessClass(cls)"
							class="flex items-center space-x-2 text-ink-gray-9 mt-auto"
						>
							<a
								v-if="user.data?.is_moderator || user.data?.is_evaluator || user.data?.is_instructor"
								:href="cls.start_url"
								target="_blank"
								class="cursor-pointer inline-flex items-center justify-center gap-2 transition-colors focus:outline-none text-ink-gray-8 bg-surface-gray-2 hover:bg-surface-gray-3 active:bg-surface-gray-4 focus-visible:ring focus-visible:ring-outline-gray-3 h-7 text-base px-2 rounded"
								:class="cls.join_url ? 'w-full' : 'w-1/2'"
							>
								<Monitor class="h-4 w-4 stroke-1.5" />
								{{ __('Start') }}
							</a>
							<a
								:href="cls.join_url"
								target="_blank"
								class="w-full cursor-pointer inline-flex items-center justify-center gap-2 transition-colors focus:outline-none text-ink-gray-8 bg-surface-gray-2 hover:bg-surface-gray-3 active:bg-surface-gray-4 focus-visible:ring focus-visible:ring-outline-gray-3 h-7 text-base px-2 rounded"
							>
								<Video class="h-4 w-4 stroke-1.5" />
								{{ __('Join') }}
							</a>
						</div>
						<Tooltip
							v-else-if="hasClassEnded(cls)"
							:text="__('This class has ended')"
							placement="right"
						>
							<div class="flex items-center space-x-2 text-ink-amber-3 w-fit">
								<Info class="w-4 h-4 stroke-1.5" />
								<span>
									{{ __('Ended') }}
								</span>
							</div>
						</Tooltip>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>
<script setup lang="ts">
import { inject } from 'vue'
import { createResource, Tooltip } from 'frappe-ui'
import { formatTime } from '@/utils'
import {
	Calendar,
	Clock,
	Info,
	Monitor,
	MoveRight,
	Video,
} from 'lucide-vue-next'
import CourseCard from '@/components/CourseCard.vue'
import BatchCard from '@/components/BatchCard.vue'
import StatCard from '@/components/StatCard.vue'

const dayjs = inject<any>('$dayjs')
const user = inject<any>('$user')

const props = defineProps<{
	myLiveClasses: any
}>()

const dashboardStreak = createResource({
	url: 'lms.lms.api.get_streak_info',
	auto: true,
})

const performanceStats = createResource({
	url: 'lms.lms.api.get_performance_stats',
	auto: true,
})

const hoursSpent = createResource({
	url: 'lms.lms.api.get_hours_spent',
	auto: true,
})

const myCourses = createResource({
	url: 'lms.lms.api.get_my_courses',
	auto: true,
})

const myBatches = createResource({
	url: 'lms.lms.api.get_my_batches',
	auto: true,
})

const getClassEnd = (cls: { date: string; time: string; duration: number }) => {
	if (!cls.date || !cls.time) return null
	const classStart = dayjs(`${cls.date} ${cls.time}`)
	return classStart.add(cls.duration || 0, 'minute')
}

const canAccessClass = (cls: {
	date: string
	time: string
	duration: number
}) => {
	if (cls.date < dayjs().format('YYYY-MM-DD')) return false
	if (cls.date > dayjs().format('YYYY-MM-DD')) return false
	if (hasClassEnded(cls)) return false
	return true
}

const hasClassEnded = (cls: {
	date: string
	time: string
	duration: number
}) => {
	const classEnd = getClassEnd(cls)
	const now = new Date()
	return now > classEnd
}
</script>
