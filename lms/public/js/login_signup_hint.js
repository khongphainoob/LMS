frappe.ready(() => {
	if (window.location.pathname !== '/login') return

	const appendSignupHint = () => {
		if (document.querySelector('[data-lms-signup-hint="1"]')) return

		const actions =
			document.querySelector('.for-login .page-card-actions') ||
			document.querySelector('.login-content .page-card-actions') ||
			document.querySelector('.page-card-actions')

		if (!actions) return

		const hint = document.createElement('p')
		hint.className = 'text-center sign-up-message'
		hint.setAttribute('data-lms-signup-hint', '1')

		const link = document.createElement('a')
		link.className = 'blue'
		link.href = '/login#signup'
		link.textContent = (frappe._ && frappe._('Sign up')) || 'Sign up'

		hint.append(
			`${(frappe._ && frappe._("Don't have an account?")) || "Don't have an account?"} `
		)
		hint.append(link)
		actions.append(hint)
	}

	appendSignupHint()

	const observer = new MutationObserver(() => appendSignupHint())
	observer.observe(document.body, { childList: true, subtree: true })
})
