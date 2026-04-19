import type { RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES.content.name,
		component: () => import('../../pages/SchemaBuilderPage.vue'),
		meta: {
			title: ROUTES.content.title,
		},
	},
]

export default routes
