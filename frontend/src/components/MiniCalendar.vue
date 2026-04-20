<template>
	<div
		class="rounded-xl border border-outline-gray-2 bg-surface-white p-4"
	>
		<!-- Header -->
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-semibold text-ink-gray-9">
				{{ monthYear }}
			</span>
			<div class="flex items-center gap-1">
				<button
					@click="prevMonth"
					class="flex items-center justify-center w-6 h-6 rounded-md hover:bg-surface-gray-2 transition-colors"
				>
					<ChevronLeft class="size-4 stroke-1.5 text-ink-gray-6" />
				</button>
				<button
					@click="nextMonth"
					class="flex items-center justify-center w-6 h-6 rounded-md hover:bg-surface-gray-2 transition-colors"
				>
					<ChevronRight class="size-4 stroke-1.5 text-ink-gray-6" />
				</button>
			</div>
		</div>

		<!-- Day labels -->
		<div class="grid grid-cols-7 gap-0 mb-1">
			<div
				v-for="day in dayLabels"
				:key="day"
				class="text-center text-xs font-medium text-ink-gray-5 py-1"
			>
				{{ day }}
			</div>
		</div>

		<!-- Days grid -->
		<div class="grid grid-cols-7 gap-0">
			<div
				v-for="(cell, index) in calendarCells"
				:key="index"
				class="text-center text-xs py-1.5"
			>
				<span
					v-if="cell.day"
					class="inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors"
					:class="{
						'bg-ink-gray-9 text-surface-white font-semibold':
							cell.isToday && !cell.isCurrentMonth,
						'bg-ink-gray-9 text-surface-white font-semibold':
							cell.isToday && cell.isCurrentMonth,
						'bg-surface-gray-2 text-ink-gray-7': !cell.isCurrentMonth && !cell.isToday,
						'text-ink-gray-7': cell.isCurrentMonth && !cell.isToday,
					}"
				>
					{{ cell.day }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const monthNames = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
]

const monthYear = computed(() => {
	return `${monthNames[currentMonth.value]} ${currentYear.value}`
})

const calendarCells = computed(() => {
	const year = currentYear.value
	const month = currentMonth.value
	const firstDay = new Date(year, month, 1).getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const daysInPrevMonth = new Date(year, month, 0).getDate()

	const cells: { day: number | null; isCurrentMonth: boolean; isToday: boolean }[] = []

	// Previous month days
	for (let i = firstDay - 1; i >= 0; i--) {
		cells.push({
			day: daysInPrevMonth - i,
			isCurrentMonth: false,
			isToday: false,
		})
	}

	// Current month days
	for (let d = 1; d <= daysInMonth; d++) {
		cells.push({
			day: d,
			isCurrentMonth: true,
			isToday:
				d === today.getDate() &&
				month === today.getMonth() &&
				year === today.getFullYear(),
		})
	}

	// Next month days
	const remaining = 42 - cells.length
	for (let d = 1; d <= remaining; d++) {
		cells.push({
			day: d,
			isCurrentMonth: false,
			isToday: false,
		})
	}

	return cells
})

const prevMonth = () => {
	if (currentMonth.value === 0) {
		currentMonth.value = 11
		currentYear.value--
	} else {
		currentMonth.value--
	}
}

const nextMonth = () => {
	if (currentMonth.value === 11) {
		currentMonth.value = 0
		currentYear.value++
	} else {
		currentMonth.value++
	}
}
</script>
