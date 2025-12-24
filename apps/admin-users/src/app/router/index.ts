import { createRouter, createWebHistory } from 'vue-router'

export const publicRoutes = {
	users: {
		path: '/',
		name: 'UsersPage',
		component: () => import('#pages/users-page'),
	},
}

export const router = createRouter({
	history: createWebHistory(),
	routes: [publicRoutes.users],
})
