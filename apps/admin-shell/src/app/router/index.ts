import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '#app/layouts/MainLayout.vue'

// Загружаем роуты асинхронно (top-level await в модуле)
const loadRemoteRoutes = async () => {
	const routes = []

	const addPrefixToRoute = (route: any, prefix: string): any => {
		const { path, ...rest } = route

		const basePath = path === '/' ? '' : path
		const newPath = `${prefix}${basePath}`

		const modifiedRoute = {
			...rest,
			path: newPath,
		}

		if (Array.isArray(route.children)) {
			modifiedRoute.children = route.children.map((child: any) => addPrefixToRoute(child, ''))
		}

		return modifiedRoute
	}

	try {
		// @ts-ignore
		const stats = await import('users/UsersRoutes')
		const transRoute = stats.default.publicRoutes.users

		const modifiedRoute = addPrefixToRoute(transRoute, '/users')

		routes.push(modifiedRoute)
	} catch {
		console.warn('Statistics routes not loaded')
	}

	try {
		// @ts-ignore
		const trans = await import('translations/TranslationsRoutes')
		const transRoute = trans.default.publicRoutes.translations

		console.log(trans)

		const modifiedRoute = addPrefixToRoute(transRoute, '/translations')

		routes.push(modifiedRoute)
	} catch {
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
