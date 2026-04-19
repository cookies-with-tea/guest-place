import type { RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES.about.name,
		component: () => import('../../pages/AboutPage.vue'),
		meta: {
			title: ROUTES.about.title,
		},
	},
]

export default routes
