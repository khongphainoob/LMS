import { defineStore } from 'pinia'
import { createResource } from 'frappe-ui'

export const usersStore = defineStore('lms-users', () => {
	let userResource = createResource({
		url: 'lms.lms.api.get_user_info',
		method: 'GET',
		onError(error) {
			if (error && error.exc_type === 'AuthenticationError') {
				window.location.href = '/login'
			}
		},
	})

	const allUsers = createResource({
		url: 'lms.lms.api.get_all_users',
		method: 'GET',
		cache: ['allUsers'],
		auto: false,
	})

	return {
		userResource,
		allUsers,
	}
})
