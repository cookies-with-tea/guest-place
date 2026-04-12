import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES.users.list.name,
		component: () => import('#pages/users-page'),
		meta: {
			title: ROUTES.users.list.title,
		},
	},
	{
		path: '/rights',
		name: ROUTES.users.rights.name,
		component: () => import('#pages/rights-page'),
		meta: {
			title: ROUTES.users.rights.title,
		},
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
