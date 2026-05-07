<template>
	<div class="space-y-5">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Mini Games") }}</h3>
			<span class="text-xs text-ink-gray-5 bg-surface-gray-2 px-2 py-0.5 rounded-full">{{ games.length }} {{ __("games available") }}</span>
		</div>
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
			<button v-for="game in games" :key="game.id" @click="$emit('open-game', game)" class="border border-outline-gray-2 bg-surface-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group">
				<div class="h-24 flex items-center justify-center" :class="game.bgClass"><component :is="game.icon" class="size-10 transition-transform duration-300 group-hover:scale-110" :class="game.iconClass" /></div>
				<div class="p-3"><div class="text-sm font-semibold text-ink-gray-9">{{ game.title }}</div><div class="text-xs text-ink-gray-5 mt-0.5 line-clamp-2">{{ game.description }}</div><div class="mt-2"><span class="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded" :class="game.tagClass">{{ game.tag }}</span></div></div>
			</button>
		</div>
	</div>
</template>

<script setup>
defineProps({ games: { type: Array, default: () => [] } })
defineEmits(["open-game"])
</script>
