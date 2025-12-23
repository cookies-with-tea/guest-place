import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '#app/layouts/MainLayout.vue'

// Загружаем роуты асинхронно (top-level await в модуле)
const loadRemoteRoutes = async () => {
	const routes = []

	try {
		// @ts-ignore
		const stats = await import('statistics/StatisticsRoutes')

		routes.push(...(stats.default.routes || []))
	} catch {
		// eslint-disable-next-line
		console.warn('Statistics routes not loaded')
	}

	try {
		// @ts-ignore
		const trans = await import('translations/TranslationsRoutes')

		routes.push(...(trans.default.routes || []))
	} catch {
		// eslint-disable-next-line
		console.warn('Translations routes not loaded')
	}

	return routes
}

export const initRouter = async () => {
	const remoteRoutes = await loadRemoteRoutes()

	console.log(remoteRoutes)

	return createRouter({
		history: createWebHistory(),
		routes: [
			{
				path: '/',
				name: 'Layout',
				component: MainLayout,
				children: [
					{
						name: 'Main',
						path: '/',
						component: () => import('#pages/main-page'),
					},
					...remoteRoutes,
				],
			},
			{ path: '/:pathMatch(.*)*', redirect: '/' },
		],
	})
}
