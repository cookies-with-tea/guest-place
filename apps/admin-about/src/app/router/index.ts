import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'AboutManagement',
		component: () => import('../../pages/AboutPage.vue'),
		meta: {
			title: 'general.about_page_management',
		},
	},
]

export default routes
