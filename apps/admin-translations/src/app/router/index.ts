import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES.translations.name,
		component: () => import('#pages/translations-page'),
		meta: {
			title: ROUTES.translations.title,
		},
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
