<template>
	<div
		class="flex items-center gap-4 rounded-xl p-5 transition-all duration-300 hover:shadow-md"
		:class="bgClass"
	>
		<!-- Circular Progress -->
		<div class="relative flex-shrink-0">
			<svg width="56" height="56" viewBox="0 0 56 56">
				<circle
					cx="28"
					cy="28"
					r="24"
					fill="none"
					:stroke="trackColor"
					stroke-width="4"
				/>
				<circle
					cx="28"
					cy="28"
					r="24"
					fill="none"
					:stroke="ringColor"
					stroke-width="4"
					stroke-linecap="round"
					:stroke-dasharray="circumference"
					:stroke-dashoffset="dashOffset"
					transform="rotate(-90 28 28)"
					class="transition-all duration-500"
				/>
			</svg>
			<div
				class="absolute inset-0 flex items-center justify-center text-sm font-bold"
				:class="ringTextColor"
			>
				{{ progress }}%
			</div>
		</div>

		<!-- Content -->
		<div class="flex flex-col">
			<span class="text-2xl font-bold" :class="countColor">
				{{ count }}{{ suffix }}
			</span>
			<span class="text-sm" :class="labelColor">
				{{ label }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
	defineProps<{
		label: string
		count: number
		progress?: number
		color?: 'orange' | 'pink' | 'green' | 'blue' | 'amber'
		suffix?: string
	}>(),
	{
		progress: 0,
		color: 'blue',
		suffix: '',
	}
)

const radius = 24
const circumference = 2 * Math.PI * radius

const dashOffset = computed(() => {
	return circumference - (props.progress / 100) * circumference
})

const colorMap: Record<string, { bg: string; track: string; ring: string; ringText: string; count: string; label: string }> = {
	orange: {
		bg: 'bg-orange-50 dark:bg-orange-950/30',
		track: '#fed7aa',
		ring: '#f97316',
		ringText: 'text-orange-600 dark:text-orange-400',
		count: 'text-ink-gray-9',
		label: 'text-ink-gray-6',
	},
	pink: {
		bg: 'bg-pink-50 dark:bg-pink-950/30',
		track: '#fbcfe8',
		ring: '#ec4899',
		ringText: 'text-pink-600 dark:text-pink-400',
		count: 'text-ink-gray-9',
		label: 'text-ink-gray-6',
	},
	green: {
		bg: 'bg-green-50 dark:bg-green-950/30',
		track: '#bbf7d0',
		ring: '#22c55e',
		ringText: 'text-green-600 dark:text-green-400',
		count: 'text-ink-gray-9',
		label: 'text-ink-gray-6',
	},
	blue: {
		bg: 'bg-blue-50 dark:bg-blue-950/30',
		track: '#bfdbfe',
		ring: '#3b82f6',
		ringText: 'text-blue-600 dark:text-blue-400',
		count: 'text-ink-gray-9',
		label: 'text-ink-gray-6',
	},
	amber: {
		bg: 'bg-amber-50 dark:bg-amber-950/30',
		track: '#fde68a',
		ring: '#f59e0b',
		ringText: 'text-amber-600 dark:text-amber-400',
		count: 'text-ink-gray-9',
		label: 'text-ink-gray-6',
	},
}

const currentColor = computed(() => colorMap[props.color] || colorMap.blue)

const bgClass = computed(() => currentColor.value.bg)
const trackColor = computed(() => currentColor.value.track)
const ringColor = computed(() => currentColor.value.ring)
const ringTextColor = computed(() => currentColor.value.ringText)
const countColor = computed(() => currentColor.value.count)
const labelColor = computed(() => currentColor.value.label)
</script>
