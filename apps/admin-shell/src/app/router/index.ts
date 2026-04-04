import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '#app/layouts/MainLayout.vue'
import { useSidebar } from '#widgets/the-sidebar'

import { loadRemoteModule, type RemoteManifest } from '@admin-panel/lib/utils'

// Загружаем роуты асинхронно
const loadRemoteRoutes = async (app: any) => {
	const routes: any[] = []
// ... (omitting addPrefixToRoute for brevity in targetContent, but I need to match carefully)
// Better use replace_file_content on the loop part.

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
		const response = await fetch('/manifest.json')
		if (!response.ok) throw new Error('Failed to fetch manifest.json')
		
		const manifest: RemoteManifest = await response.json()
		const remotes = manifest.remotes.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

		for (const remote of remotes) {
			try {
				const remoteModule = await loadRemoteModule(remote, { app })
				
				const routesFromModule = remoteModule.routes || remoteModule.default?.routes || remoteModule.default || []

				routesFromModule.forEach((route: any) => {
					routes.push(addPrefixToRoute(route, `/${remote.name}`))
				})

				console.log(`✅ Loaded routes for ${remote.name}`)
			} catch (error) {
				console.warn(`⚠️ Could not load remote module ${remote.name}:`, error)
			}
		}
	} catch (error) {
		console.error('❌ Failed to load manifest:', error)
	}

	return routes
}

const routesToSidebar = (data: any) => {
	return data.map((route: any) => ({
		title: route.meta?.title || route.name,
		path: route.path,
	}))
}

export const initRouter = async (app: any) => {
	const remoteRoutes = await loadRemoteRoutes(app)

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
