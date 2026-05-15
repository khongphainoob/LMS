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
					<span class="font-medium text-lg text-ink-gray-9">Menu</span>
					<button @click="showMenu = false" class="p-1 transition active:scale-95">
						<component :is="icons['X']" class="h-6 w-6 stroke-1.5 text-ink-gray-7" />
					</button>
				</div>

				<div class="flex-1 overflow-y-auto px-4 py-4 space-y-1">
					<div
						v-for="tab in sidebarLinks"
						:key="tab.label"
						v-show="isVisible(tab)"
						class="flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer transition-colors"
						:class="isActive(tab) ? 'bg-surface-gray-2 text-ink-gray-9 font-medium' : 'text-ink-gray-7 hover:bg-surface-gray-1'"
						@click="handleClick(tab); showMenu = false;"
					>
						<component
							:is="icons[tab.icon]"
							class="h-5 w-5 stroke-1.5"
							:class="isActive(tab) ? 'text-ink-gray-9' : 'text-ink-gray-5'"
						/>
						<span>{{ tab.label }}</span>
					</div>

					<div v-if="otherLinks.length > 0" class="h-px bg-outline-gray-2 my-4"></div>

					<div
						v-for="link in otherLinks"
						:key="link.label"
						class="flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer text-ink-gray-7 hover:bg-surface-gray-1 transition-colors"
						@click="handleClick(link); showMenu = false;"
					>
						<component
							:is="icons[link.icon]"
							class="h-5 w-5 stroke-1.5 text-ink-gray-5"
						/>
						<span>{{ link.label }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { getSidebarLinks } from '@/utils'
import { useRouter } from 'vue-router'
import { call } from 'frappe-ui'
import { watch, ref, onMounted, computed } from 'vue'
import { sessionStore } from '@/stores/session'
import { useSettings } from '@/stores/settings'
import { usersStore } from '@/stores/user'
import * as icons from 'lucide-vue-next'

const { logout, user } = sessionStore()
let { isLoggedIn } = sessionStore()
const { sidebarSettings } = useSettings()
const router = useRouter()
let { userResource } = usersStore()
const sidebarLinks = ref(getSidebarLinks())
const otherLinks = ref([])
const showMenu = ref(false)
const menu = ref(null)
const isModerator = ref(false)
const isInstructor = ref(false)

onMounted(() => {
	sidebarSettings.reload(
		{},
		{
			onSuccess(data) {
				destructureSidebarLinks()
				filterLinksToShow(data)
				addOtherLinks()
			},
		}
	)
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

const destructureSidebarLinks = () => {
	let links = []
	sidebarLinks.value.forEach((link) => {
		link.items?.forEach((item) => {
			links.push(item)
		})
	})
	sidebarLinks.value = links
}

const filterLinksToShow = (data) => {
	Object.keys(data).forEach((key) => {
		if (!parseInt(data[key])) {
			sidebarLinks.value = sidebarLinks.value.filter(
				(link) => link.label.toLowerCase().split(' ').join('_') !== key
			)
		}
	})
}

const addOtherLinks = () => {
	if (user) {
		otherLinks.value.push({
			action: 'notifications',
			label: __('Notifications'),
			icon: 'Bell',
			to: 'Notifications',
		})
		otherLinks.value.push({
			action: 'profile',
			label: __('Profile'),
			icon: 'UserRound',
		})
		otherLinks.value.push({
			action: 'logout',
			label: __('Log out'),
			icon: 'LogOut',
		})
	} else {
		otherLinks.value.push({
			action: 'login',
			label: __('Log in'),
			icon: 'LogIn',
		})
	}
}

watch(userResource, () => {
	if (userResource.data) {
		isModerator.value = userResource.data.is_moderator
		isInstructor.value = userResource.data.is_instructor
		addPrograms()
		if (isModerator.value || isInstructor.value) {
			addProgrammingExercises()
			addQuizzes()
			addAssignments()
		}
	}
})

const addQuizzes = () => {
	otherLinks.value.push({
		label: __('Quizzes'),
		icon: 'CircleHelp',
		to: 'Quizzes',
	})
}

const addAssignments = () => {
	otherLinks.value.push({
		label: __('Assignments'),
		icon: 'Pencil',
		to: 'Assignments',
	})
}

const addProgrammingExercises = () => {
	otherLinks.value.push({
		label: __('Programming Exercises'),
		icon: 'Code',
		to: 'ProgrammingExercises',
	})
}

const addPrograms = async () => {
	let canAddProgram = await checkIfCanAddProgram()
	if (!canAddProgram) return
	let activeFor = ['Programs', 'ProgramDetail']
	let index = 1

	sidebarLinks.value.splice(index, 0, {
		label: __('Programs'),
		icon: 'Route',
		to: 'Programs',
		activeFor: activeFor,
	})
}

const checkIfCanAddProgram = async () => {
	if (isModerator.value || isInstructor.value) {
		return true
	}
	const programs = await call('lms.lms.utils.get_programs')
	return programs.enrolled.length > 0 || programs.published.length > 0
}

let isActive = (tab) => {
	return tab.activeFor?.includes(router.currentRoute.value.name)
}

const handleClick = (tab) => {
	if (tab.action == 'login') window.location.href = '/login'
	else if (tab.action == 'logout')
		logout.submit().then(() => {
			isLoggedIn = false
		})
	else if (tab.action == 'profile')
		router.push({
			name: 'Profile',
			params: {
				username: userResource.data?.username,
			},
		})
	else router.push({ name: tab.to })
}

const isVisible = (tab) => {
	if (tab.action == 'login') return !isLoggedIn
	else if (tab.action == 'logout') return isLoggedIn
	else return true
}

const toggleMenu = () => {
	showMenu.value = !showMenu.value
}
</script>
