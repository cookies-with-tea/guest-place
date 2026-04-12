import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES.users.name,
		component: () => import('#pages/users-page'),
		meta: {
			title: ROUTES.users.title,
		},
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
