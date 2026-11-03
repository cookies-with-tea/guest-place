import { createRouter, createWebHistory } from 'vue-router'

import { ROUTES } from '@admin-panel/lib'

export const routes = [
	{
		path: '/',
		name: ROUTES.statistics.name,
		component: () => import('#pages/AnalyticsPage.vue'),
		meta: {
			title: ROUTES.statistics.title,
		},
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
