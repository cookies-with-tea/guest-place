import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
	{
		path: '/',
		redirect: '/ru',
	},
	{
		path: '/:lng([a-z]{2})?',
		name: 'TranslationsDashboard',
		component: () => import('#pages/TranslationsPage.vue'),
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
