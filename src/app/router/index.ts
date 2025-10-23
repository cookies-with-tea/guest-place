import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '#app/layouts/MainLayout.vue'

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL ?? '/'),
	routes: [
		{
			path: '/',
			name: 'Layout',
			component: MainLayout,
			children: [
				{
					name: 'Main',
					path: '/',
					component: () => import('#pages/main-page'),
				},
			],
		},
	],
})
