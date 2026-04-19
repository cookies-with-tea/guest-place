import type { RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES.guests.name,
		component: () => import('../../pages/GuestsPage.vue'),
		meta: {
			title: ROUTES.guests.title,
		},
	},
]

export default routes
