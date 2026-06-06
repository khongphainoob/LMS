<template>
	<div class="flex h-full flex-col relative bg-surface-white">
		<!-- Top Navigation Bar for mobile -->
		<div class="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-3 border-b border-outline-gray-2 bg-surface-white z-20 shadow-sm">
			<div class="text-lg font-semibold text-ink-gray-9 tracking-tight">TOMOSA</div>
			<button @click.stop="toggleMenu" class="p-1 transition active:scale-95">
				<component
					:is="icons['Menu']"
					class="h-6 w-6 stroke-1.5 text-ink-gray-9"
				/>
			</button>
		</div>

		<!-- Scroll Content Area (Push down by top bar) -->
		<div class="h-full pt-[60px]" id="scrollContainer">
			<slot />
		</div>

		<!-- Vertical Sidebar Drawer -->
		<div class="relative z-50">
			<!-- Backdrop Overlay -->
			<div
				v-if="showMenu"
				class="fixed inset-0 bg-ink-gray-9/30 backdrop-blur-sm transition-opacity"
				@click="showMenu = false"
			></div>

			<!-- Right-aligned sliding drawer -->
			<div
				class="fixed top-0 right-0 h-full w-[280px] bg-surface-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
				:class="showMenu ? 'translate-x-0' : 'translate-x-full'"
				ref="menu"
			>
				<div class="flex items-center justify-between p-4 border-b border-outline-gray-2">
					<span class="font-medium text-lg text-ink-gray-9">{{ __('Menu') }}</span>
					<button @click="showMenu = false" class="p-1 transition active:scale-95">
						<component :is="icons['X']" class="h-6 w-6 stroke-1.5 text-ink-gray-7" />
					</button>
				</div>

				<div class="flex-1 overflow-y-auto px-4 py-4 space-y-1">
					<!-- Standard Sidebar Links -->
					<div
						v-for="tab in sidebarLinks"
						:key="tab.label"
						class="flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer transition-colors"
						:class="isActive(tab) ? 'bg-surface-gray-2 text-ink-gray-9 font-medium' : 'text-ink-gray-7 hover:bg-surface-gray-1'"
						@click="handleClick(tab); showMenu = false;"
					>
						<component
							:is="icons[tab.icon] || icons['BookOpen']"
							class="h-5 w-5 stroke-1.5"
							:class="isActive(tab) ? 'text-ink-gray-9' : 'text-ink-gray-5'"
						/>
						<span>{{ __(tab.label) }}</span>
					</div>

					<!-- Custom Web Pages -->
					<template v-if="webPages.length > 0">
						<div class="h-px bg-outline-gray-2 my-4"></div>
						<div
							v-for="page in webPages"
							:key="page.name"
							class="flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer transition-colors"
							:class="isActive(page) ? 'bg-surface-gray-2 text-ink-gray-9 font-medium' : 'text-ink-gray-7 hover:bg-surface-gray-1'"
							@click="handleClick(page); showMenu = false;"
						>
							<component
								:is="icons[page.icon] || icons['FileText']"
								class="h-5 w-5 stroke-1.5"
								:class="isActive(page) ? 'text-ink-gray-9' : 'text-ink-gray-5'"
							/>
							<span>{{ __(page.label) }}</span>
						</div>
					</template>

					<!-- Logged-in/Logged-out Actions -->
					<div class="h-px bg-outline-gray-2 my-4"></div>
					<div
						v-for="link in otherLinks"
						:key="link.label"
						class="flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer text-ink-gray-7 hover:bg-surface-gray-1 transition-colors"
						@click="handleClick(link); showMenu = false;"
					>
						<component
							:is="icons[link.icon] || icons['Menu']"
							class="h-5 w-5 stroke-1.5 text-ink-gray-5"
						/>
						<span>{{ __(link.label) }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { getSidebarLinks } from '@/utils'
import { useRouter } from 'vue-router'
import { watch, ref, onMounted, computed } from 'vue'
import { sessionStore } from '@/stores/session'
import { useSettings } from '@/stores/settings'
import { usersStore } from '@/stores/user'
import * as icons from 'lucide-vue-next'

const session = sessionStore()
const { sidebarSettings } = useSettings()
const router = useRouter()
const users = usersStore()

const showMenu = ref(false)
const menu = ref(null)

onMounted(() => {
	sidebarSettings.reload()
})

const handleOutsideClick = (e) => {
	if (menu.value && !menu.value.contains(e.target)) {
		showMenu.value = false
	}
}

watch(showMenu, (val) => {
	if (val) {
		setTimeout(() => {
			document.addEventListener('click', handleOutsideClick)
		}, 0)
	} else {
		document.removeEventListener('click', handleOutsideClick)
	}
})

// Clean, reactive sidebar links computed from getSidebarLinks and user state
const sidebarLinks = computed(() => {
	let links = getSidebarLinks()
	let flattened = []
	links.forEach((link) => {
		link.items?.forEach((item) => {
			flattened.push(item)
		})
	})
	
	if (sidebarSettings.data) {
		Object.keys(sidebarSettings.data).forEach((key) => {
			if (!parseInt(sidebarSettings.data[key])) {
				flattened = flattened.filter(
					(link) => link.label.toLowerCase().split(' ').join('_') !== key
				)
			}
		})
	}
	return flattened
})

// Custom web pages computed from settings
const webPages = computed(() => {
	return sidebarSettings.data?.web_pages || []
})

// User profile / login / logout actions
const otherLinks = computed(() => {
	const list = []
	if (session.isLoggedIn) {
		list.push({
			action: 'profile',
			label: 'Profile',
			icon: 'UserRound',
		})
		list.push({
			action: 'logout',
			label: 'Log out',
			icon: 'LogOut',
		})
	} else {
		list.push({
			action: 'login',
			label: 'Log in',
			icon: 'LogIn',
		})
	}
	return list
})

const isActive = (tab) => {
	return tab.activeFor?.includes(router.currentRoute.value.name)
}

const handleClick = (link) => {
	if (link.action === 'login') {
		window.location.href = '/login'
	} else if (link.action === 'logout') {
		session.logout.submit()
	} else if (link.action === 'profile') {
		router.push({
			name: 'Profile',
			params: {
				username: users.userResource.data?.username,
			},
		})
	} else if (router.hasRoute(link.to)) {
		router.push({ name: link.to })
	} else if (link.to?.includes('@')) {
		window.location.href = `mailto:${link.to}`
	} else if (link.to) {
		if (link.to.startsWith('http')) {
			window.open(link.to, '_blank')
			return
		}
		window.location.href = `/${link.to}`
	}
}

const toggleMenu = () => {
	showMenu.value = !showMenu.value
}
</script>
