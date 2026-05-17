<template>
	<div class="space-y-4">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h3 class="font-semibold text-ink-gray-9">{{ __("Manage Game Templates") }}</h3>
				<p class="text-sm text-ink-gray-5">{{ __("Create, edit and delete game templates for your batches") }}</p>
			</div>
			<Button variant="solid" @click="$emit('create')">
				<template #prefix><Plus class="size-4" /></template>
				{{ __("New Game") }}
			</Button>
		</div>

		<!-- Loading -->
		<div v-if="gamesResource.loading" class="flex justify-center py-16">
			<Spinner class="size-8 text-ink-gray-4" />
		</div>

		<!-- Empty -->
		<div v-else-if="games.length === 0" class="text-center py-16 border border-dashed border-outline-gray-2 rounded-xl bg-surface-gray-1">
			<div class="text-5xl mb-3">🎮</div>
			<h3 class="text-base font-medium text-ink-gray-8 mb-2">{{ __("No game templates yet") }}</h3>
			<p class="text-sm text-ink-gray-5 mb-4">{{ __("Create your first game to assign it to batches.") }}</p>
			<Button variant="solid" @click="$emit('create')">
				<template #prefix><Plus class="size-4" /></template>
				{{ __("Create First Game") }}
			</Button>
		</div>

		<!-- Game List -->
		<div v-else class="grid gap-3">
			<div
				v-for="game in games"
				:key="game.name"
				class="flex items-center gap-4 p-4 bg-surface-white border border-outline-gray-2 rounded-xl hover:shadow-sm transition-shadow"
			>
				<!-- Icon -->
				<div class="flex-shrink-0 size-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-3xl border border-blue-100">
					{{ getGameIcon(game.game_type) }}
				</div>

				<!-- Info -->
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-0.5">
						<span class="font-semibold text-ink-gray-9 text-sm">{{ game.title }}</span>
						<span
							:class="game.is_active ? 'bg-green-100 text-green-700' : 'bg-surface-gray-2 text-ink-gray-5'"
							class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
						>
							{{ game.is_active ? __('Active') : __('Inactive') }}
						</span>
					</div>
					<div class="flex items-center gap-3 text-xs text-ink-gray-5">
						<span>{{ getGameTypeLabel(game.game_type) }}</span>
						<span>·</span>
						<span>{{ __("Max Score:") }} <b class="text-ink-gray-7">{{ game.max_score }}</b></span>
						<span>·</span>
						<span>{{ __("Scoring:") }} <b class="text-ink-gray-7">{{ getScoringLabel(game.scoring_model) }}</b></span>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-2 flex-shrink-0">
					<!-- Toggle active -->
					<button
						@click="toggleActive(game)"
						:title="game.is_active ? __('Deactivate') : __('Activate')"
						class="p-2 rounded-lg border border-outline-gray-2 hover:bg-surface-gray-1 transition-colors text-ink-gray-5 hover:text-ink-gray-9"
					>
						<span class="text-sm">{{ game.is_active ? '🔴' : '🟢' }}</span>
					</button>
					<!-- Edit -->
					<button
						@click="editGame(game)"
						:title="__('Edit game')"
						class="p-2 rounded-lg border border-outline-gray-2 hover:bg-surface-gray-1 transition-colors text-ink-gray-5 hover:text-ink-gray-9"
					>
						<Pencil class="size-4" />
					</button>
					<!-- Delete -->
					<button
						@click="deleteGame(game)"
						:disabled="deletingId === game.name"
						:title="__('Delete game')"
						class="p-2 rounded-lg border border-red-100 hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
					>
						<Trash2 class="size-4" />
					</button>
				</div>
			</div>
		</div>

		<!-- Edit Modal -->
		<GameFormModal
			v-if="editingGame"
			v-model="showEditModal"
			:edit-game="editingGame"
			@saved="onSaved"
		/>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createResource, Spinner, Button, toast, call } from 'frappe-ui'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import GameFormModal from './instructor/GameFormModal.vue'

const emit = defineEmits(['create'])

const deletingId = ref(null)
const editingGame = ref(null)
const showEditModal = ref(false)

const gamesResource = createResource({
	url: 'frappe.client.get_list',
	params: {
		doctype: 'LMS Game',
		fields: ['name', 'title', 'game_type', 'max_score', 'scoring_model', 'delivery_mode', 'is_active', 'configuration'],
		order_by: 'creation desc',
		limit: 50,
	},
	auto: true,
})

const games = computed(() => gamesResource.data || [])

function editGame(game) {
	editingGame.value = game
	showEditModal.value = true
}

function onSaved() {
	gamesResource.reload()
	editingGame.value = null
}

async function toggleActive(game) {
	try {
		await call('frappe.client.set_value', {
			doctype: 'LMS Game',
			name: game.name,
			fieldname: 'is_active',
			value: game.is_active ? 0 : 1,
		})
		toast.success(game.is_active ? __('Game deactivated.') : __('Game activated.'))
		gamesResource.reload()
	} catch (err) {
		toast.error(err?.message || __('Failed to update'))
	}
}

async function deleteGame(game) {
	if (!confirm(`${__('Delete')} "${game.title}"? ${__('This will also remove all batch assignments.')}`)) return
	deletingId.value = game.name
	try {
		await call('frappe.client.delete', { doctype: 'LMS Game', name: game.name })
		toast.success(__('Game deleted.'))
		gamesResource.reload()
	} catch (err) {
		toast.error(err?.message || __('Failed to delete. The game may have active sessions.'))
	} finally {
		deletingId.value = null
	}
}

function getGameIcon(type) {
	return { memory_match: '🧠', timed_quiz: '⚡', spin_wheel: '🎁', word_scramble: '🔤', drag_drop: '↕️' }[type] || '🎮'
}

function getGameTypeLabel(type) {
	return {
		memory_match: __('Memory Match'),
		timed_quiz: __('Timed Quiz'),
		spin_wheel: __('Spin the Wheel'),
		word_scramble: __('Word Scramble'),
		drag_drop: __('Drag & Drop'),
	}[type] || type
}

function getScoringLabel(model) {
	return { best: __('Best Score'), sum: __('Cumulative'), avg: __('Average') }[model] || model
}
</script>
