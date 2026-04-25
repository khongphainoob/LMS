<template>
	<FruitNinjaGame />
</template>

<script setup>
import FruitNinjaGame from '@/components/FruitNinjaGame.vue'
import { usePageMeta } from 'frappe-ui'
import { sessionStore } from '../stores/session'

const { brand } = sessionStore()

usePageMeta(() => {
	return {
		title: 'Fruit Ninja Quiz',
		icon: brand.favicon,
	}
})
</script>