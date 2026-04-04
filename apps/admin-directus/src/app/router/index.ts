import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

export const publicRoutes: Record<string, RouteRecordRaw> = {
	directus: {
		path: '/',
		name: ROUTES.directus.name,
		component: () => import('#pages/directus-page'),
		meta: {
			title: ROUTES.directus.title,
		},
	},
}

export const router = createRouter({
	history: createWebHistory('/directus/'),
	routes: [publicRoutes.directus],
})
