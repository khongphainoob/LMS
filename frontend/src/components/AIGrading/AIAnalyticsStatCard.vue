<template>
	<div
		class="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md"
		:class="borderClass"
	>
		<div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
			{{ label }}
		</div>
		<div class="flex items-baseline gap-2">
			<div class="text-3xl font-bold text-gray-900">{{ displayValue }}</div>
			<div
				v-if="trend != null"
				class="text-xs font-medium"
				:class="trend > 0 ? 'text-emerald-600' : 'text-rose-600'"
			>
				{{ trend > 0 ? '↑' : '↓' }}{{ Math.abs(trend) }}%
			</div>
		</div>
		<div v-if="subtitle" class="mt-1 text-[11px] text-gray-400">{{ subtitle }}</div>
		
		<!-- Progress Bar -->
		<div v-if="showProgress" class="mt-4">
			<div class="flex items-center justify-between mb-1">
				<span class="text-[10px] font-medium text-gray-400 tracking-wide">{{ progressLabel }}</span>
				<span class="text-[10px] font-bold" :class="accentTextClass">{{ progress }}%</span>
			</div>
			<div class="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
				<div 
					class="h-full rounded-full transition-all duration-700 ease-out"
					:class="progressClass"
					:style="{ width: progress + '%' }"
				></div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	label: { type: String, required: true },
	value: { type: [Number, String], default: 0 },
	trend: { type: Number, default: null },
	subtitle: { type: String, default: '' },
	variant: { type: String, default: 'default' },
	progress: { type: Number, default: 0 },
	showProgress: { type: Boolean, default: false },
	progressLabel: { type: String, default: 'Progress' },
})

const displayValue = computed(() => {
	if (typeof props.value === 'number' && props.value >= 1000) {
		return props.value.toLocaleString()
	}
	return props.value
})

const borderClass = computed(() => {
	const map = {
		success: 'border-emerald-100',
		warning: 'border-amber-100',
		danger: 'border-rose-100',
		info: 'border-blue-100',
		default: 'border-gray-100',
	}
	return map[props.variant] || map.default
})

const progressClass = computed(() => {
	const map = {
		success: 'bg-emerald-500',
		warning: 'bg-amber-500',
		danger: 'bg-rose-500',
		info: 'bg-blue-500',
		default: 'bg-[#2d6a4f]',
	}
	return map[props.variant] || map.default
})

const accentTextClass = computed(() => {
	const map = {
		success: 'text-emerald-600',
		warning: 'text-amber-600',
		danger: 'text-rose-600',
		info: 'text-blue-600',
		default: 'text-[#2d6a4f]',
	}
	return map[props.variant] || map.default
})
</script>
