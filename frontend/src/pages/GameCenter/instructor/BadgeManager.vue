<template>
	<Dialog v-model="show" :options="{ title: __('Badge Management'), size: '4xl' }">
		<template #body-content>
			<div class="space-y-6">
				<div class="flex justify-between items-center">
			<div>
				<h2 class="text-xl font-bold text-ink-gray-9">{{ __("Badge Management") }}</h2>
				<p class="text-sm text-ink-gray-5">{{ __("Assign or revoke gamification badges") }}</p>
			</div>
			<Button variant="solid" @click="showAssignModal = true">
				<template #prefix><Plus class="w-4 h-4" /></template>
				{{ __("Assign Badge") }}
			</Button>
		</div>

		<!-- List of Recent Assignments -->
		<div class="bg-surface-white border border-outline-gray-2 rounded-xl overflow-hidden">
			<div class="p-4 border-b border-outline-gray-2 bg-surface-gray-1 flex justify-between items-center">
				<h3 class="font-semibold text-ink-gray-9">{{ __("Recent Assignments") }}</h3>
				<Button variant="ghost" size="sm" @click="assignmentsResource.reload()">
					<RefreshCw class="w-4 h-4 text-ink-gray-5" :class="{'animate-spin': assignmentsResource.loading}" />
				</Button>
			</div>
			
			<div v-if="assignmentsResource.loading && !assignments.length" class="p-8 flex justify-center">
				<Spinner class="w-6 h-6 text-ink-gray-4" />
			</div>
			
			<table v-else-if="assignments.length" class="w-full text-left text-sm">
				<thead class="bg-surface-gray-1 border-b border-outline-gray-2 text-ink-gray-5">
					<tr>
						<th class="px-6 py-3 font-medium">{{ __("Learner") }}</th>
						<th class="px-6 py-3 font-medium">{{ __("Badge") }}</th>
						<th class="px-6 py-3 font-medium">{{ __("Date Issued") }}</th>
						<th class="px-6 py-3 font-medium text-right">{{ __("Actions") }}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-outline-gray-1">
					<tr v-for="a in assignments" :key="a.name" class="hover:bg-surface-gray-1/50 transition-colors">
						<td class="px-6 py-4 font-medium text-ink-gray-9">{{ a.member }}</td>
						<td class="px-6 py-4">
							<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ink-blue-1 text-ink-blue-7 text-xs font-semibold">
								🏆 {{ a.badge }}
							</span>
						</td>
						<td class="px-6 py-4 text-ink-gray-6">{{ formatDate(a.issued_on) }}</td>
						<td class="px-6 py-4 text-right">
							<Button variant="ghost" size="sm" class="text-red-500 hover:bg-red-50" @click="confirmRevoke(a)">
								{{ __("Revoke") }}
							</Button>
						</td>
					</tr>
				</tbody>
			</table>
			
			<div v-else class="p-8 text-center text-ink-gray-5">
				{{ __("No badges assigned yet.") }}
			</div>
		</div>

		<!-- Assign Modal -->
		<Dialog v-model="showAssignModal" :options="{ title: __('Assign Badge'), size: 'xl' }">
			<template #body-content>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Select Badge") }}</label>
						<select
							v-model="assignForm.badge"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3"
						>
							<option value="" disabled>{{ __("Select a badge...") }}</option>
							<option v-for="b in availableBadges" :key="b.name" :value="b.name">{{ b.title }}</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">{{ __("Select Learner (Email/Username)") }}</label>
						<input
							type="text"
							v-model="assignForm.member"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3"
							placeholder="student@example.com"
						/>
					</div>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-end gap-3 w-full">
					<Button @click="showAssignModal = false">{{ __("Cancel") }}</Button>
					<Button
						variant="solid"
						:loading="isAssigning"
						:disabled="!assignForm.badge || !assignForm.member"
						@click="assignBadge"
					>
						{{ __("Assign") }}
					</Button>
				</div>
			</template>
		</Dialog>

			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { createResource, Dialog, Button, Spinner } from 'frappe-ui'
import { Plus, RefreshCw } from 'lucide-vue-next'
import dayjs from '@/utils/dayjs'

const show = defineModel()
const showAssignModal = ref(false)
const isAssigning = ref(false)
const assignForm = reactive({ badge: '', member: '' })

// Resources
const badgesResource = createResource({
	url: 'frappe.client.get_list',
	params: { doctype: 'LMS Badge', fields: ['name', 'title'] },
	auto: true
})
const availableBadges = computed(() => badgesResource.data || [])

const assignmentsResource = createResource({
	url: 'frappe.client.get_list',
	params: { 
		doctype: 'LMS Badge Assignment', 
		fields: ['name', 'badge', 'member', 'issued_on'],
		order_by: 'creation desc',
		limit: 50
	},
	auto: true
})
const assignments = computed(() => assignmentsResource.data || [])

const assignAction = createResource({
	url: 'lms.lms.gamification.badge_api.assign_badge',
})

const deleteAction = createResource({
	url: 'frappe.client.delete',
})

function formatDate(d) {
	return dayjs(d).format('MMM D, YYYY')
}

async function assignBadge() {
	isAssigning.value = true
	try {
		await assignAction.submit({
			badge: assignForm.badge,
			member: assignForm.member
		})
		showAssignModal.value = false
		assignForm.badge = ''
		assignForm.member = ''
		assignmentsResource.reload()
	} catch (e) {
		console.error("Assign failed", e)
	} finally {
		isAssigning.value = false
	}
}

async function confirmRevoke(assignment) {
	if (confirm(`Are you sure you want to revoke '${assignment.badge}' from ${assignment.member}?`)) {
		try {
			await deleteAction.submit({ doctype: 'LMS Badge Assignment', name: assignment.name })
			assignmentsResource.reload()
		} catch (e) {
			console.error("Revoke failed", e)
		}
	}
}
</script>
