import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
	{
		path: '/',
		name: 'Profile',
		component: () => import('../../pages/profile-page'),
		meta: { title: 'Profile' },
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
