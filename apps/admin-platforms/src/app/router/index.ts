import type { RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES.platforms.name,
		component: () => import('../../pages/PlatformsPage.vue'),
		meta: {
			title: ROUTES.platforms.title,
		},
	},
]

export default routes
