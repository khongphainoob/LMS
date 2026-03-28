<template>
	<div class="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
		<!-- Header -->
		<div class="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
			<h3 class="text-sm font-semibold text-gray-800">
				{{ title || __('Detailed Dissatisfaction Feedback') }}
			</h3>
			<p class="text-[11px] text-gray-400 mt-0.5">
				{{ subtitle || __('All instances where teachers marked AI grading as "Dissatisfied"') }}
			</p>
		</div>

		<!-- Loading -->
		<div v-if="loading" class="flex items-center justify-center p-8">
			<div class="text-sm text-gray-400">{{ __('Loading feedback data...') }}</div>
		</div>

		<!-- Empty State -->
		<div v-else-if="!items.length" class="flex flex-col items-center justify-center p-8 text-center">
			<span class="text-3xl mb-2">✨</span>
			<div class="text-sm font-medium text-gray-600">{{ __('No dissatisfaction feedback yet') }}</div>
			<div class="text-xs text-gray-400 mt-1">{{ __('All AI grading results have been satisfactory') }}</div>
		</div>

		<!-- Table -->
		<div v-else class="overflow-x-auto">
			<table class="w-full text-left text-xs text-gray-700">
				<thead class="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
					<tr>
						<th class="px-5 py-3">{{ __('Session / Assignment') }}</th>
						<th class="px-5 py-3">{{ __('Student') }}</th>
						<th class="px-5 py-3">{{ __('Score') }}</th>
						<th class="px-5 py-3 min-w-[300px]">{{ __('Reason for Dissatisfaction') }}</th>
						<th class="px-5 py-3 text-right">{{ __('Date') }}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					<tr
						v-for="(item, i) in items"
						:key="i"
						class="hover:bg-gray-50/50 transition-colors"
					>
						<td class="px-5 py-4 font-medium text-gray-900">
							{{ item.session_name || item.session }}
						</td>
						<td class="px-5 py-4">
							<div class="font-medium">{{ item.student_name || item.student }}</div>
							<div v-if="item.student_sbd" class="text-[10px] text-gray-400 font-mono">
								SBD: {{ item.student_sbd }}
							</div>
						</td>
						<td class="px-5 py-4">
							<span
								class="rounded-full px-2 py-0.5 text-[10px] font-bold"
								:class="getScoreBadge(item.score)"
							>
								{{ item.score != null ? item.score : '—' }}
							</span>
						</td>
						<td class="px-5 py-4 text-gray-600 leading-relaxed italic border-l-2 border-rose-200 ml-2">
							"{{ item.dissatisfaction_reason || __('No reason provided') }}"
						</td>
						<td class="px-5 py-4 text-right text-gray-400 tabular-nums">
							{{ formatDate(item.date || item.modified) }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup>
defineProps({
	items: { type: Array, default: () => [] },
	loading: { type: Boolean, default: false },
	title: { type: String, default: '' },
	subtitle: { type: String, default: '' },
})

function getScoreBadge(score) {
	const s = parseFloat(score)
	if (isNaN(s)) return 'bg-gray-100 text-gray-500'
	if (s >= 8) return 'bg-[#2d6a4f]/10 text-[#2d6a4f]'
	if (s >= 6) return 'bg-[#b45309]/10 text-[#b45309]'
	return 'bg-[#9f1239]/10 text-[#9f1239]'
}

function formatDate(dateStr) {
	if (!dateStr) return '—'
	try {
		const d = new Date(dateStr)
		return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
	} catch {
		return dateStr
	}
}
</script>
