<template>
	<div class="space-y-6">
		<div>
			<h2 class="text-2xl font-semibold text-ink-gray-9">
				{{ __('Language Preference') }}
			</h2>
			<p class="mt-2 text-sm text-ink-gray-7">
				{{ __('Select your preferred language for the interface') }}
			</p>
		</div>

		<div v-if="!canChangeLanguage" class="rounded-lg bg-amber-50 p-4 border border-amber-200">
			<div class="flex items-start gap-3">
				<AlertCircle class="size-5 text-amber-600 shrink-0 mt-0.5" />
				<div class="text-sm text-amber-800">
					<p class="font-semibold mb-1">{{ __('Permission Required') }}</p>
					<p>{{ __('Only administrators, moderators, and teachers can change language settings.') }}</p>
				</div>
			</div>
		</div>

		<div v-else class="space-y-4">
			<div class="rounded-lg bg-blue-50 p-4 border border-blue-200">
				<div class="flex items-start gap-3">
					<Info class="size-5 text-blue-600 shrink-0 mt-0.5" />
					<div class="text-sm text-blue-800">
						<p>{{ __('The page will automatically reload after changing the language to apply the changes.') }}</p>
					</div>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div
					v-for="lang in languages"
					:key="lang.code"
					@click="selectLanguage(lang.code)"
					class="group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200"
					:class="{
						'border-blue-500 bg-blue-50 shadow-md': currentLanguage === lang.code,
						'border-surface-gray-3 bg-surface-white hover:border-blue-300 hover:shadow-sm': currentLanguage !== lang.code
					}"
				>
					<div class="p-6">
						<div class="flex items-center gap-4">
							<div class="text-5xl">{{ lang.flag }}</div>
							<div class="flex-1">
								<h3 class="text-lg font-semibold text-ink-gray-9">
									{{ lang.name }}
								</h3>
								<p class="text-sm text-ink-gray-7">{{ lang.native }}</p>
							</div>
							<div v-if="currentLanguage === lang.code" 
								 class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
								<Check class="size-5 text-white stroke-[3]" />
							</div>
							<div v-else 
								 class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-gray-3 opacity-0 group-hover:opacity-100 transition-opacity">
								<span class="text-xs text-ink-gray-7">{{ __('Select') }}</span>
							</div>
						</div>
					</div>
					
					<!-- Active indicator bar -->
					<div v-if="currentLanguage === lang.code"
						 class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600">
					</div>
				</div>
			</div>

			<!-- Current status -->
			<div v-if="isUpdatingLanguage" 
				 class="flex items-center gap-3 rounded-lg bg-surface-gray-1 p-4">
				<div class="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
				<span class="text-sm text-ink-gray-7">
					{{ __('Updating language preference...') }}
				</span>
			</div>

			<div v-else-if="currentLanguage" 
				 class="flex items-center gap-2 text-sm text-ink-gray-7">
				<Globe class="size-4" />
				<span>
					{{ __('Current language:') }} 
					<span class="font-semibold text-ink-gray-9">
						{{ languages.find(l => l.code === currentLanguage)?.name }}
					</span>
				</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { createResource, toast } from 'frappe-ui'
import { Check, AlertCircle, Info, Globe } from 'lucide-vue-next'

const $user = inject('$user')

const currentLanguage = ref('en')
const isUpdatingLanguage = ref(false)

// Language options
const languages = [
	{
		code: 'en',
		name: 'English',
		native: 'English',
		flag: '🇬🇧'
	},
	{
		code: 'vi',
		name: 'Vietnamese',
		native: 'Tiếng Việt',
		flag: '🇻🇳'
	}
]

// Check if user can change language (admin, moderator, or teacher)
const canChangeLanguage = computed(() => {
	if (!$user.data) return false
	const userRoles = $user.data.roles || []
	return userRoles.includes('System Manager') || 
		   userRoles.includes('Moderator') || 
		   userRoles.includes('Course Creator')
})

// Get current user language
const getUserLanguage = createResource({
	url: 'frappe.client.get_value',
	makeParams() {
		return {
			doctype: 'User',
			filters: { name: $user.data?.name },
			fieldname: 'language'
		}
	},
	onSuccess(data) {
		if (data && data.language) {
			currentLanguage.value = data.language
		}
	}
})

// Update language using frappe.call instead of createResource
const selectLanguage = async (languageCode) => {
	if (!canChangeLanguage.value) {
		toast.error(__('You do not have permission to change language settings'))
		return
	}
	
	if (languageCode === currentLanguage.value) return
	
	isUpdatingLanguage.value = true
	
	try {
		// Use frappe.call with POST method to update user language with proper CSRF handling
		const result = await window.frappe.call({
			method: 'lms.lms.api.update_user_language',
			type: 'POST',
			args: {
				language: languageCode
			}
		})
		
		currentLanguage.value = languageCode
		toast.success(__('Language updated successfully. Reloading...'))
		
		// Reload after 1 second to apply language changes
		setTimeout(() => {
			window.location.reload()
		}, 1000)
	} catch (error) {
		isUpdatingLanguage.value = false
		console.error('Language update error:', error)
		
		// Show user-friendly error message
		const errorMsg = error?.message || error?._server_messages || __('Failed to update language. Please try refreshing the page.')
		toast.error(errorMsg)
	}
}

// Load current language on mount
onMounted(() => {
	if (canChangeLanguage.value) {
		getUserLanguage.fetch()
	}
})
</script>
