<template>
	<div v-if="badge.data">
		<div class="p-5 flex flex-col items-center mt-40">
			<div class="text-3xl font-semibold">
				{{ badge.data.badge }}
			</div>
			<img
				v-if="badge.data.badge_image && !badge.data.badge_image.includes('badge.png')"
				:src="badge.data.badge_image"
				:alt="badge.data.badge"
				class="h-60 mt-2"
			/>
			<div v-else class="h-[240px] w-[240px] mt-4 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[6rem] shadow-2xl border-4 border-white mx-auto">
				{{ getFallbackEmoji(badge.data.badge) }}
			</div>
			<div class="">
				{{
					__('This badge has been awarded to {0} on {1}.').format(
						badge.data.member_name,
						dayjs(badge.data.issued_on).format('DD MMM YYYY')
					)
				}}
			</div>
			<div class="mt-2">
				{{ badge.data.badge_description }}
			</div>
		</div>
	</div>
</template>
<script setup>
import { createResource, usePageMeta } from 'frappe-ui'
import { computed, inject } from 'vue'
import { sessionStore } from '../stores/session'

const dayjs = inject('$dayjs')
const { brand } = sessionStore()

const getFallbackEmoji = (title) => {
	if (!title) return "🏆"
	title = title.toLowerCase()
	if (title.includes("streak") || title.includes("chuỗi")) return "🔥"
	if (title.includes("champion") || title.includes("vô địch")) return "🏆"
	if (title.includes("scholar") || title.includes("học giả")) return "🎓"
	if (title.includes("top") || title.includes("đỉnh")) return "⭐"
	if (title.includes("master") || title.includes("thủ khoa")) return "👑"
	if (title.includes("help") || title.includes("giúp")) return "🤝"
	return "🏅"
}

const props = defineProps({
	badgeName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
})

const badge = createResource({
	url: 'frappe.client.get',
	makeParams(values) {
		return {
			doctype: 'LMS Badge Assignment',
			filters: {
				badge: props.badgeName,
				member: props.email,
			},
		}
	},
	auto: true,
})

const breadcrumbs = computed(() => {
	return [
		{
			label: __('Badges'),
		},
		{
			label: badge.data.badge,
			route: {
				name: 'Badge',
				params: {
					badge: badge.data.badge,
				},
			},
		},
	]
})

usePageMeta(() => {
	return {
		title: badge.data.badge,
		icon: brand.favicon,
	}
})
</script>
