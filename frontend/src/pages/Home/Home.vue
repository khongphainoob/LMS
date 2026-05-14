<template>
	<div class="flex flex-col h-full">
		<!-- Header: Dashboard title + Search + Actions -->
		<div class="sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-5 py-3 sm:px-5">
			<div class="flex items-center gap-3">
				<h1 class="text-xl font-bold text-ink-gray-9">
					{{ __('Dashboard') }}
				</h1>
			</div>
			<div class="flex items-center gap-3">
				<!-- Search Bar -->
				<div
					class="flex items-center gap-2 bg-surface-gray-1 rounded-lg px-3 py-1.5 text-sm text-ink-gray-5 cursor-pointer hover:bg-surface-gray-2 transition-colors"
					@click="openSearch()"
				>
					<Search class="size-4 stroke-1.5" />
					<span class="hidden sm:inline">
						{{ __('Search') }}
					</span>
					<kbd
						v-if="typeof navigator !== 'undefined'"
						class="hidden sm:inline-flex items-center gap-0.5 rounded border border-outline-gray-2 bg-surface-white px-1.5 py-0.5 text-[10px] font-medium text-ink-gray-5"
					>
						{{ navigator.platform?.includes('Mac') ? '&#8984;' : 'Ctrl' }}K
					</kbd>
				</div>
			</div>
		</div>

		<!-- Main Content: 2 columns (content + right sidebar) -->
		<div class="flex flex-1 min-h-0">
			<!-- Left: Main Content -->
			<div class="flex-1 px-5 pt-5 pb-10 min-w-0">
				<!-- Welcome -->
				<div class="space-y-2 mb-6">
					<div class="flex items-center justify-between">
						<div class="text-xl font-bold text-ink-gray-9">
							{{ __('Hey') }}, {{ user.data?.full_name }}
						</div>
						<div>
							<TabButtons v-if="isAdmin" v-model="currentTab" :buttons="tabs" />
							<div
								v-else
								@click="showStreakModal = true"
								class="bg-surface-amber-2 px-2 py-1 rounded-md cursor-pointer"
							>
								<span> 🔥 </span>
								<span class="text-ink-gray-9">
									{{ streakInfo.data?.current_streak }}
								</span>
							</div>
						</div>
					</div>
					<div class="text-lg text-ink-gray-6 leading-6">
						{{ subtitle }}
					</div>
				</div>

				<!-- Content Views -->
				<div v-if="user.loading" class="flex items-center justify-center py-20">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
				</div>
				<template v-else>
					<AdminHome
						v-if="isAdmin && currentTab === 'instructor'"
						:liveClasses="adminLiveClasses"
						:evals="adminEvals"
					/>
					<StudentHome v-else :myLiveClasses="myLiveClasses" />
				</template>
			</div>

			<!-- Right Sidebar: Calendar + Upcoming Events (hidden on mobile) -->
			<div class="hidden lg:flex flex-col w-72 xl:w-80 border-l border-outline-gray-1 p-4 gap-5 flex-shrink-0 overflow-y-auto">
				<MiniCalendar />
				<UpcomingEvents
					:evaluations="currentEvents"
					:liveClasses="currentLiveClasses"
				/>
			</div>
		</div>

		<Streak v-model="showStreakModal" :streakInfo="streakInfo" />
	</div>
</template>
<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import {
	call,
	createResource,
	TabButtons,
	usePageMeta,
} from 'frappe-ui'
import { sessionStore } from '@/stores/session'
import { useSettings } from '@/stores/settings'
import StudentHome from '@/pages/Home/StudentHome.vue'
import AdminHome from '@/pages/Home/AdminHome.vue'
import Streak from '@/pages/Home/Streak.vue'
import MiniCalendar from '@/components/MiniCalendar.vue'
import UpcomingEvents from '@/components/UpcomingEvents.vue'
import { Search } from 'lucide-vue-next'

const user = inject<any>('$user')
const { brand } = sessionStore()
const settingsStore = useSettings()
const evalCount = ref(0)
const currentTab = ref<'student' | 'instructor'>('instructor')
const showStreakModal = ref(false)

const openSearch = () => {
	settingsStore.isCommandPaletteOpen = true
}

onMounted(() => {
	call('frappe.client.get_count', {
		doctype: 'LMS Certificate Request',
		filters: {
			member: user?.data?.name,
			status: 'Upcoming',
			date: ['>=', inject<any>('$dayjs')().format('YYYY-MM-DD')],
		},
	}).then((data: any) => {
		evalCount.value = data
	})
})

const isAdmin = computed(() => {
	return (
		user.data?.is_moderator ||
		user.data?.is_instructor ||
		user.data?.is_evaluator
	)
})

const myLiveClasses = createResource({
	url: 'lms.lms.api.get_my_live_classes',
	auto: !isAdmin.value ? true : false,
})

const adminLiveClasses = createResource({
	url: 'lms.lms.api.get_admin_live_classes',
	auto: isAdmin.value ? true : false,
})

const adminEvals = createResource({
	url: 'lms.lms.api.get_admin_evals',
	auto: isAdmin.value ? true : false,
})

const streakInfo = createResource({
	url: 'lms.lms.api.get_streak_info',
	auto: true,
})

// Events for right sidebar - picks the correct data based on role/tab
const currentEvents = computed(() => {
	if (isAdmin.value && currentTab.value === 'instructor') {
		return adminEvals.data || []
	}
	return []
})

const currentLiveClasses = computed(() => {
	if (isAdmin.value && currentTab.value === 'instructor') {
		return adminLiveClasses.data || []
	}
	return myLiveClasses.data || []
})

const subtitle = computed(() => {
	if (isAdmin.value) {
		let liveClassSuffix =
			adminLiveClasses.data?.length > 1 ? __('live classes') : __('live class')
		let evalSuffix =
			adminEvals.data?.length > 1 ? __('evaluations') : __('evaluation')
		if (adminLiveClasses.data?.length > 0 && adminEvals.data?.length > 0) {
			return __('You have {0} upcoming {1} and {2} {3} scheduled.').format(
				adminLiveClasses.data.length,
				liveClassSuffix,
				adminEvals.data.length,
				evalSuffix
			)
		} else if (adminLiveClasses.data?.length > 0) {
			return __('You have {0} upcoming {1}.').format(
				adminLiveClasses.data.length,
				liveClassSuffix
			)
		} else if (adminEvals.data?.length > 0) {
			return __('You have {0} {1} scheduled.').format(
				adminEvals.data.length,
				evalSuffix
			)
		}
		return __('Manage your courses and batches at a glance')
	} else {
		let liveClassSuffix =
			myLiveClasses.data?.length > 1 ? __('live classes') : __('live class')
		let evalSuffix = evalCount.value > 1 ? __('evaluations') : __('evaluation')
		if (myLiveClasses.data?.length > 0 && evalCount.value > 0) {
			return __('You have {0} upcoming {1} and {2} {3} scheduled.').format(
				myLiveClasses.data.length,
				liveClassSuffix,
				evalCount.value,
				evalSuffix
			)
		} else if (myLiveClasses.data?.length > 0) {
			return __('You have {0} upcoming {1}.').format(
				myLiveClasses.data.length,
				liveClassSuffix
			)
		} else if (evalCount.value > 0) {
			return __('You have {0} {1} scheduled.').format(
				evalCount.value,
				evalSuffix
			)
		}
		return __('Resume where you left off')
	}
})

const tabs = [
	{ label: __('Student'), value: 'student' },
	{ label: __('Instructor'), value: 'instructor' },
]

usePageMeta(() => {
	return {
		title: __('Home'),
		icon: brand.favicon,
	}
})
</script>
