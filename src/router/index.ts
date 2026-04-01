import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProjectDetailView from '@/views/ProjectDetailView.vue'
import LoginView from '@/views/LoginView.vue'
import { auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/login',
			name: 'login',
			component: LoginView,
			meta: { guestOnly: true },
		},
		{
			path: '/',
			component: AppLayout,
			meta: { requiresAuth: true },
			children: [
				{
					path: '',
					name: 'dashboard',
					component: DashboardView,
				},
				{
					path: 'project/:id',
					name: 'project-detail',
					component: ProjectDetailView,
				},
			],
		},
	],
})

// Wait for Firebase Auth to initialize before resolving the route
const getCurrentUser = () => {
	return new Promise((resolve, reject) => {
		const unsubscribe = onAuthStateChanged(
			auth,
			(user) => {
				unsubscribe()
				resolve(user)
			},
			reject,
		)
	})
}

router.beforeEach(async (to) => {
	const user = await getCurrentUser()
	const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
	const guestOnly = to.matched.some((record) => record.meta.guestOnly)

	if (requiresAuth && !user) {
		return { name: 'login' }
	}

	if (guestOnly && user) {
		return { name: 'dashboard' }
	}

	return true
})

export default router
