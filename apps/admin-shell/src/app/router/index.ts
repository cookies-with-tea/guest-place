import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '#app/layouts/MainLayout.vue'
import { useSidebar } from '#widgets/the-sidebar'

import { APPS_PORTS } from '@admin-panel/lib/constants'

// Загружаем роуты асинхронно
const loadRemoteRoutes = async () => {
	const routes: any[] = []

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

	const apps = Object.keys(APPS_PORTS).filter((key) => key !== 'shell' && !key.includes('directus'))

	for (const appName of apps) {
		try {
			let remoteModule: any

			// Vite needs static-ish strings for import analysis to work with Module Federation
			// @ts-ignore
			if (appName === 'statistics') remoteModule = await import('statistics/StatisticsRoutes')
			// @ts-ignore
			else if (appName === 'translations') remoteModule = await import('translations/TranslationsRoutes')
			// @ts-ignore
			else if (appName === 'users') remoteModule = await import('users/UsersRoutes')
			// @ts-ignore
			else if (appName === 'media') remoteModule = await import('media/MediaRoutes')

			if (!remoteModule) continue

			const remoteRoutes = remoteModule.routes || remoteModule.default?.routes || []

			remoteRoutes.forEach((route: any) => {
				routes.push(addPrefixToRoute(route, `/${appName}`))
			})

			console.log(`✅ Loaded routes for ${appName}`)
		} catch (error: any) {
			console.warn(`⚠️ Could not load routes for ${appName}:`, error instanceof Error ? error.message : String(error))
		}
	}

	return routes
}

const routesToSidebar = (data: any) => {
	return data.map((route: any) => ({
		title: route.meta?.title || route.name,
		path: route.path,
	}))
}

export const initRouter = async () => {
	const remoteRoutes = await loadRemoteRoutes()

	const { setData } = useSidebar()

	setData(routesToSidebar(remoteRoutes))

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
