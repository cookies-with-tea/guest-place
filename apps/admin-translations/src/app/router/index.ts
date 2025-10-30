import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
	{
		path: '/translations',
		name: 'TranslationsDashboard',
		component: () => import('#pages/TranslationsPage.vue'),
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
