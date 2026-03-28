<template>
	<button
		class="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
		:class="[sizeClass]"
		:style="buttonStyle"
		@click="$emit('click')"
	>
		<!-- Glow ring -->
		<span
			class="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			style="box-shadow: 0 0 20px rgba(109, 40, 217, 0.4), 0 0 40px rgba(109, 40, 217, 0.2);"
		/>

		<!-- Pulse dot -->
		<span class="relative flex h-2.5 w-2.5 flex-shrink-0">
			<span
				class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60"
			/>
			<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
		</span>

		<!-- Icon & Label -->
		<span class="relative z-10 flex items-center gap-2">
			<span class="text-lg">{{ icon }}</span>
			<span>{{ label }}</span>
		</span>

		<!-- Shimmer effect -->
		<span
			class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
		/>
	</button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	label: { type: String, default: 'AI Analytics' },
	icon: { type: String, default: '✦' },
	size: { type: String, default: 'md' },
})

defineEmits(['click'])

const buttonStyle = computed(() => ({
	background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #7c3aed 100%)',
}))

const sizeClass = computed(() => {
	const map = {
		sm: 'text-xs px-3 py-2',
		md: 'text-sm px-5 py-3',
		lg: 'text-base px-6 py-3.5',
	}
	return map[props.size] || map.md
})
</script>
