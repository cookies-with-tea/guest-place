import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
	{
		path: '/',
		redirect: '/en',
	},
	{
		path: '/:locale(en|ru|fr|ja)/translations',
		name: 'TranslationsDashboard',
		component: () => import('#pages/users-page/ui/UsersPage.vue'),
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
