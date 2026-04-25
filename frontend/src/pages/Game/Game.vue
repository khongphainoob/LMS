<template>
	<div class="px-5 py-8 max-w-6xl mx-auto space-y-8">
		<div class="space-y-2">
			<div class="text-sm uppercase tracking-[0.2em] text-ink-gray-5">
				Game Zone
			</div>
			<h1 class="text-3xl font-semibold text-ink-gray-9">Play the LMS games</h1>
			<p class="text-base text-ink-gray-6 max-w-2xl">
				Open a game to launch it inside LMS.
			</p>
		</div>

		<div class="grid gap-5 md:grid-cols-2">
			<div
				class="rounded-2xl border border-outline-gray-2 bg-surface-white p-6 shadow-sm"
			>
				<div class="space-y-2">
					<div class="text-xs uppercase tracking-[0.18em] text-ink-gray-5">Quiz</div>
					<h2 class="text-2xl font-semibold text-ink-gray-9">Duck Race</h2>
					<p class="text-ink-gray-6">
						Answer questions to boost your duck and smash the counters.
					</p>
				</div>
				<router-link
					to="/duck-race-game"
					class="mt-5 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
				>
					Play Duck Race
				</router-link>
			</div>

			<div
				class="rounded-2xl border border-outline-gray-2 bg-surface-white p-6 shadow-sm"
			>
				<div class="space-y-2">
					<div class="text-xs uppercase tracking-[0.18em] text-ink-gray-5">Quiz</div>
					<h2 class="text-2xl font-semibold text-ink-gray-9">Fruit Ninja</h2>
					<p class="text-ink-gray-6">
						Slice through the quiz flow with fast answers and quick reactions.
					</p>
				</div>
				<router-link
					to="/fruit-ninja-game"
					class="mt-5 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
				>
					Play Fruit Ninja
				</router-link>
			</div>
		</div>
	</div>
</template>

<script setup>
import { usePageMeta } from 'frappe-ui'
import { sessionStore } from '@/stores/session'

const { brand } = sessionStore()

usePageMeta(() => {
	return {
		title: 'Games',
		icon: brand.favicon,
	}
})
</script>
