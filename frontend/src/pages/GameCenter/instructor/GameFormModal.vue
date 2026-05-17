<template>
	<Dialog
		v-model="show"
		:options="{
			title: isEditing ? __('Edit Game') : __('Create New Game'),
			size: 'xl'
		}"
	>
		<template #body-content>
			<div class="space-y-5">

				<!-- Title -->
				<div>
					<label class="block text-sm font-medium text-ink-gray-9 mb-1">
						{{ __("Game Title") }} <span class="text-red-500">*</span>
					</label>
					<input
						v-model="form.title"
						type="text"
						:placeholder="__('e.g. Vocabulary Quiz - Chapter 3')"
						class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3 text-sm"
					/>
				</div>

				<!-- Game Type + Scoring Model -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">
							{{ __("Game Type") }} <span class="text-red-500">*</span>
						</label>
						<select
							v-model="form.game_type"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3 text-sm"
						>
							<option value="">{{ __("Select type...") }}</option>
							<option value="memory_match">🧠 {{ __("Memory Match") }}</option>
							<option value="timed_quiz">⚡ {{ __("Timed Quiz") }}</option>
							<option value="spin_wheel">🎁 {{ __("Spin the Wheel") }}</option>
							<option value="word_scramble">🔤 {{ __("Word Scramble") }}</option>
							<option value="drag_drop">↕️ {{ __("Drag & Drop") }}</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">
							{{ __("Scoring Model") }}
						</label>
						<select
							v-model="form.scoring_model"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3 text-sm"
						>
							<option value="best">{{ __("Best Score") }}</option>
							<option value="sum">{{ __("Cumulative") }}</option>
							<option value="avg">{{ __("Average") }}</option>
						</select>
					</div>
				</div>

				<!-- Max Score + Delivery Mode -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">
							{{ __("Max Score") }} <span class="text-red-500">*</span>
						</label>
						<input
							v-model.number="form.max_score"
							type="number"
							min="1"
							:placeholder="__('e.g. 1000')"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3 text-sm"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-ink-gray-9 mb-1">
							{{ __("Delivery Mode") }}
						</label>
						<select
							v-model="form.delivery_mode"
							class="w-full px-3 py-2 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3 text-sm"
						>
							<option value="embedded">{{ __("Embedded") }}</option>
							<option value="popup">{{ __("Popup Window") }}</option>
							<option value="fullscreen">{{ __("Full Screen") }}</option>
						</select>
					</div>
				</div>

				<!-- Active toggle -->
				<div class="flex items-center gap-3 p-3 bg-surface-gray-1 rounded-lg">
					<input
						id="is_active"
						v-model="form.is_active"
						type="checkbox"
						class="size-4 rounded border-outline-gray-3 accent-ink-blue-4"
					/>
					<label for="is_active" class="text-sm text-ink-gray-8 cursor-pointer select-none">
						{{ __("Active (visible to students)") }}
					</label>
				</div>

				<!-- Import Questions Data -->
				<div v-if="form.game_type" class="space-y-2 border-t border-outline-gray-2 pt-4">
					<div class="flex items-center justify-between">
						<label class="block text-sm font-semibold text-ink-gray-9">
							{{ __("Questions / Card Pairs Data (JSON)") }}
						</label>
						<div class="flex items-center gap-2">
							<button
								type="button"
								@click="loadTemplateFormat"
								class="text-xs text-ink-blue-4 hover:text-ink-blue-5 hover:underline font-semibold flex items-center gap-1 transition-colors"
							>
								📋 {{ __("Load") }}
							</button>
							<span class="text-outline-gray-2 text-[10px]">|</span>
							<button
								type="button"
								@click="downloadJsonTemplate"
								class="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-semibold flex items-center gap-1 transition-colors"
							>
								📥 {{ __("Download Template") }}
							</button>
							<span class="text-outline-gray-2 text-[10px]">|</span>
							<label
								class="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer transition-colors"
							>
								📤 {{ __("Upload File") }}
								<input
									type="file"
									accept=".json"
									class="hidden"
									@change="handleFileUpload"
								/>
							</label>
						</div>
					</div>
					<textarea
						v-model="form.configuration_raw"
						rows="8"
						:placeholder="placeholderByGameType"
						class="w-full font-mono text-[11px] leading-relaxed p-3 border border-outline-gray-2 rounded-lg bg-surface-white focus:outline-none focus:border-ink-blue-3 focus:ring-1 focus:ring-ink-blue-3 shadow-inner"
					></textarea>
					<p class="text-[11px] text-ink-gray-5 leading-normal bg-surface-gray-1 rounded-lg p-2.5 border border-outline-gray-1">
						💡 <b>{{ getFormatHelpTitle(form.game_type) }}:</b> {{ getFormatHelpText(form.game_type) }}
					</p>
				</div>

				<!-- Error -->
				<p v-if="errorMsg" class="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 leading-relaxed font-mono whitespace-pre-wrap">{{ errorMsg }}</p>
			</div>
		</template>

		<template #actions>
			<div class="flex justify-end gap-3 w-full">
				<Button @click="show = false">{{ __("Cancel") }}</Button>
				<Button
					variant="solid"
					:loading="isSubmitting"
					:disabled="!isValid"
					@click="submit"
				>
					{{ isEditing ? __("Save Changes") : __("Create Game") }}
				</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { Dialog, Button, call, toast } from 'frappe-ui'

const show = defineModel()
const props = defineProps({
	editGame: { type: Object, default: null }
})
const emit = defineEmits(['saved'])

const isEditing = computed(() => !!props.editGame)

const form = reactive({
	title: '',
	game_type: '',
	scoring_model: 'best',
	max_score: 500,
	delivery_mode: 'embedded',
	is_active: true,
	configuration_raw: '',
})

// Populate form when editing
watch(() => props.editGame, (game) => {
	if (game) {
		form.title = game.title || ''
		form.game_type = game.game_type || ''
		form.scoring_model = game.scoring_model || 'best'
		form.max_score = game.max_score || 500
		form.delivery_mode = game.delivery_mode || 'embedded'
		form.is_active = game.is_active !== undefined ? !!game.is_active : true
		form.configuration_raw = game.configuration ? (typeof game.configuration === 'string' ? game.configuration : JSON.stringify(game.configuration, null, 2)) : ''
	} else {
		// Reset for new game
		form.title = ''
		form.game_type = ''
		form.scoring_model = 'best'
		form.max_score = 500
		form.delivery_mode = 'embedded'
		form.is_active = true
		form.configuration_raw = ''
	}
}, { immediate: true })

const isValid = computed(() => form.title.trim() && form.game_type && form.max_score > 0)
const isSubmitting = ref(false)
const errorMsg = ref('')

const placeholderByGameType = computed(() => {
	if (form.game_type === 'timed_quiz') {
		return JSON.stringify([
			{
				"question": "What does HTML stand for?",
				"options": ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
				"correct": 0,
				"category": "tech"
			},
			{
				"question": "Which planet is known as the Red Planet?",
				"options": ["Venus", "Mars", "Jupiter", "Saturn"],
				"correct": 1,
				"category": "science"
			},
			{
				"question": "What is the square root of 144?",
				"options": ["10", "11", "12", "14"],
				"correct": 2,
				"category": "math"
			},
			{
				"question": "Which programming language is mainly used for iOS app development?",
				"options": ["Java", "Swift", "Python", "C++"],
				"correct": 1,
				"category": "tech"
			},
			{
				"question": "What is the chemical symbol for water?",
				"options": ["H2O", "CO2", "NaCl", "O2"],
				"correct": 0,
				"category": "science"
			}
		], null, 2)
	}
	if (form.game_type === 'word_scramble') {
		return JSON.stringify([
			{
				"answer": "ALGORITHM",
				"hint": "A step-by-step procedure for solving a problem or making a calculation",
				"category": "tech"
			},
			{
				"answer": "BACTERIA",
				"hint": "Microscopic, single-celled organisms that exist all around us",
				"category": "science"
			},
			{
				"answer": "CALCULUS",
				"hint": "A branch of mathematics dealing with limits, derivatives, and integrals",
				"category": "math"
			},
			{
				"answer": "DATABASE",
				"hint": "An organized collection of structured information or data stored electronically",
				"category": "tech"
			},
			{
				"answer": "ELECTRON",
				"hint": "A stable subatomic particle with a charge of negative electricity",
				"category": "science"
			}
		], null, 2)
	}
	if (form.game_type === 'drag_drop') {
		return JSON.stringify([
			{
				"question": "Arrange these space exploration milestones in chronological order (oldest to newest).",
				"label": "🚀 Space Exploration",
				"items": [
					{ "id": "s1", "value": "First artificial satellite Sputnik 1 (1957)", "order": 1 },
					{ "id": "s2", "value": "First human Yuri Gagarin in space (1961)", "order": 2 },
					{ "id": "s3", "value": "Apollo 11 Moon Landing (1969)", "order": 3 },
					{ "id": "s4", "value": "International Space Station launch (1998)", "order": 4 }
				]
			},
			{
				"question": "Arrange these computer storage units from smallest capacity to largest.",
				"label": "💾 Tech Storage",
				"items": [
					{ "id": "t1", "value": "Kilobyte (KB)", "order": 1 },
					{ "id": "t2", "value": "Megabyte (MB)", "order": 2 },
					{ "id": "t3", "value": "Gigabyte (GB)", "order": 3 },
					{ "id": "t4", "value": "Terabyte (TB)", "order": 4 }
				]
			}
		], null, 2)
	}
	if (form.game_type === 'memory_match') {
		return JSON.stringify([
			{ "emoji": "🧠", "label": "Brain" },
			{ "emoji": "💻", "label": "Code" },
			{ "emoji": "🚀", "label": "Rocket" },
			{ "emoji": "💡", "label": "Idea" },
			{ "emoji": "🔬", "label": "Science" },
			{ "emoji": "🔥", "label": "Fire" },
			{ "emoji": "🎓", "label": "Graduation" },
			{ "emoji": "🌟", "label": "Star" }
		], null, 2)
	}
	if (form.game_type === 'spin_wheel') {
		return JSON.stringify({
			"science": [
				{ "q": "What is the powerhouse of the cell?", "a": ["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"], "c": 0 },
				{ "q": "Which is the lightest element in the periodic table?", "a": ["Helium", "Hydrogen", "Lithium", "Oxygen"], "c": 1 }
			],
			"history": [
				{ "q": "Who was the first President of the United States?", "a": ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"], "c": 2 }
			],
			"geography": [
				{ "q": "What is the capital city of France?", "a": ["London", "Berlin", "Rome", "Paris"], "c": 3 }
			],
			"math": [
				{ "q": "What is the square root of 144?", "a": ["10", "11", "12", "14"], "c": 2 }
			]
		}, null, 2)
	}
	return `Select a game type to view JSON format example...`
})

function loadTemplateFormat() {
	form.configuration_raw = placeholderByGameType.value
}

function downloadJsonTemplate() {
	const dataStr = placeholderByGameType.value
	if (!dataStr || dataStr === 'Select a game type to view JSON format example...') return
	
	const blob = new Blob([dataStr], { type: "application/json" })
	const url = URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = url
	link.download = `${form.game_type}_template.json`
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
	toast.success(__("JSON Template downloaded successfully!"))
}

function handleFileUpload(e) {
	const file = e.target.files[0]
	if (!file) return
	const reader = new FileReader()
	reader.onload = (event) => {
		try {
			const parsed = JSON.parse(event.target.result)
			form.configuration_raw = JSON.stringify(parsed, null, 2)
			toast.success(__("JSON file uploaded and loaded successfully!"))
		} catch (err) {
			toast.error(__("Failed to parse JSON file: " + err.message))
		}
	}
	reader.readAsText(file)
}

function getFormatHelpTitle(type) {
	const titles = {
		timed_quiz: 'Timed Quiz Format',
		word_scramble: 'Word Scramble Format',
		drag_drop: 'Drag & Drop Format',
		memory_match: 'Memory Match Format',
		spin_wheel: 'Wheel of Trivia Format',
	}
	return titles[type] || 'Template Info'
}

function getFormatHelpText(type) {
	if (type === 'timed_quiz') {
		return 'Array of questions. Each question must have a "question" (string), "options" (array of 4 choices), "correct" (index integer, 0 to 3), and "category" (string).'
	}
	if (type === 'word_scramble') {
		return 'Array of words. Each word must have an "answer" (uppercase string), "hint" (string), and optional "category" (string).'
	}
	if (type === 'drag_drop') {
		return 'Array of sorting challenges. Each challenge contains a "question" string instruction, and a list of "items" where each item has a unique "id" (string), a "value" (display string), and an "order" (sequence order integer beginning from 1).'
	}
	if (type === 'memory_match') {
		return 'Array of card objects. Each card requires an "emoji" (string) and a "label" (string). These objects will automatically be duplicated to construct matching card pairs.'
	}
	if (type === 'spin_wheel') {
		return 'Object with category names as keys ("science", "tech", "history", "geography", "literature", "math"). Each key maps to an array of trivia questions containing "q" (question text), "a" (array of 4 choices), and "c" (0-indexed correct option).'
	}
	return 'Enter valid JSON question data matching the game type requirements.'
}

async function submit() {
	isSubmitting.value = true
	errorMsg.value = ''

	let parsedConfig = null
	if (form.configuration_raw.trim()) {
		try {
			parsedConfig = JSON.parse(form.configuration_raw)
			
			// Basic structural validation
			if (form.game_type === 'spin_wheel') {
				if (typeof parsedConfig !== 'object' || Array.isArray(parsedConfig)) {
					throw new Error('Trivia data must be a JSON object with category keys.')
				}
			} else {
				if (!Array.isArray(parsedConfig)) {
					throw new Error('Data must be a JSON array of questions/items.')
				}
			}
		} catch (e) {
			errorMsg.value = `${__('JSON Validation Error:')}\n${e.message}`
			isSubmitting.value = false
			return
		}
	}

	try {
		if (isEditing.value) {
			// Update existing LMS Game
			await call('frappe.client.set_value', {
				doctype: 'LMS Game',
				name: props.editGame.name,
				fieldname: {
					title: form.title.trim(),
					game_type: form.game_type,
					scoring_model: form.scoring_model,
					max_score: form.max_score,
					delivery_mode: form.delivery_mode,
					is_active: form.is_active ? 1 : 0,
					configuration: form.configuration_raw.trim() ? JSON.stringify(parsedConfig) : null,
				}
			})
			toast.success(__('Game updated successfully!'))
		} else {
			// Create new LMS Game
			await call('frappe.client.insert', {
				doc: {
					doctype: 'LMS Game',
					title: form.title.trim(),
					game_type: form.game_type,
					scoring_model: form.scoring_model,
					max_score: form.max_score,
					delivery_mode: form.delivery_mode,
					is_active: form.is_active ? 1 : 0,
					configuration: form.configuration_raw.trim() ? JSON.stringify(parsedConfig) : null,
				}
			})
			toast.success(__('Game created successfully!'))
		}

		emit('saved')
		show.value = false
	} catch (err) {
		errorMsg.value = err?.message || __('An error occurred. Please try again.')
	} finally {
		isSubmitting.value = false
	}
}
</script>
