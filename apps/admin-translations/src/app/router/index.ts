import { createRouter, createWebHistory } from 'vue-router'

export const publicRoutes = {
	translations: {
		path: '/',
		name: 'TranslationsPage',
		component: () => import('#pages/translations-page'),
	},
}

export const router = createRouter({
	history: createWebHistory(),
	routes: [publicRoutes.translations],
})
