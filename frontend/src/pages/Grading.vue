<template>
	<header
		class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5"
	>
		<Breadcrumbs :items="breadcrumbs" />
	</header>

	<div class="py-5 mx-5 md:w-3/4 md:mx-auto">
		<div class="rounded-lg border bg-surface-white p-5">
			<h2 class="text-lg font-semibold text-ink-gray-9">
				{{ __('Grading') }}
			</h2>
			<p class="mt-2 text-sm text-ink-gray-6">
				{{ __('Manage grading workflows from here.') }}
			</p>
		</div>
	</div>
</template>

<script setup>
import { Breadcrumbs, usePageMeta } from 'frappe-ui'
import { inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sessionStore } from '@/stores/session'

const { brand } = sessionStore()
const router = useRouter()
const user = inject('$user')

onMounted(() => {
	if (!user.data?.is_moderator && !user.data?.is_instructor) {
		router.push({ name: 'Courses' })
	}
})

const breadcrumbs = [
	{
		label: __('Grading'),
		route: { name: 'Grading' },
	},
]

usePageMeta(() => {
	return {
		title: `${__('Grading')} - ${brand.value}`,
	}
})
</script>
