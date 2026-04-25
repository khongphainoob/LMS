<template>
	<DuckRaceGame />
</template>

<script setup>
import DuckRaceGame from '@/components/DuckRaceGame.vue'
import { usePageMeta } from 'frappe-ui'
import { sessionStore } from '../stores/session'

const { brand } = sessionStore()

usePageMeta(() => {
	return {
		title: 'Duck Race Quiz',
		icon: brand.favicon,
	}
})
</script>
