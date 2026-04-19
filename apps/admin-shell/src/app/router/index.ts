import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '#app/layouts/MainLayout.vue'
import { useSidebar } from '#widgets/the-sidebar'
import { ROUTES } from '@admin-panel/lib'

import { loadRemoteModule, type RemoteManifest } from '@admin-panel/lib/utils'

// Загружаем роуты асинхронно
const loadRemoteRoutes = async (app: any) => {
	const routes: any[] = []
	const sidebarGroups: any[] = []

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
		const response = await fetch('/api/v1/mfe/manifest')

		if (!response.ok) throw new Error('Failed to fetch manifest from API')

		const json = await response.json()
		const manifest: RemoteManifest = json.data
		const remotes = (manifest.remotes || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

		for (const remote of remotes) {
			try {
				const remoteModule = await loadRemoteModule(remote, { app })

				const routesFromModule = remoteModule.routes || remoteModule.default?.routes || remoteModule.default || []
				const modifiedRoutes = routesFromModule.map((route: any) => addPrefixToRoute(route, `/${remote.name}`))

				routes.push(...modifiedRoutes)

				// Finding icon and title from ROUTES if it matches remote name
				const routeConfig = (ROUTES as any)[remote.name]

				sidebarGroups.push({
					name: remote.name,
					title: routeConfig?.title || `general.${remote.name}`,
					icon: routeConfig?.icon || 'Menu',
					category: remote.category,
					routes: modifiedRoutes,
				})
			} catch {
				// Silent fail for individual remotes
			}
		}
	} catch {
		// Silent fail for manifest
	}

	return { routes, sidebarGroups }
}

const routesToSidebar = (groups: any[]) => {
	return groups.map((group: any) => {
		if (group.routes.length === 1 && group.routes[0].path === `/${group.name}`) {
			return {
				title: group.routes[0].meta?.title || group.routes[0].name,
				path: group.routes[0].path,
				icon: group.icon,
			}
		}

		return {
			title: group.title,
			icon: group.icon,
			children: group.routes.map((route: any) => ({
				title: route.meta?.title || route.name,
				path: route.path,
			})),
		}
	})
}

export const initRouter = async (app: any) => {
	const { routes: remoteRoutes, sidebarGroups } = await loadRemoteRoutes(app)

	const { setData } = useSidebar()

	const systemGroups = sidebarGroups.filter((g) => !g.category || g.category === 'system' || g.name === 'orchestrator')
	const websiteGroups = sidebarGroups.filter((g) => g.category === 'website')

	setData('system', routesToSidebar(systemGroups))

	setData('website', routesToSidebar(websiteGroups))

	window.addEventListener('mfe:updated', async () => {
		const { sidebarGroups: updatedGroups } = await loadRemoteRoutes(app)

		const newSystemGroups = updatedGroups.filter(
			(g) => !g.category || g.category === 'system' || g.name === 'orchestrator'
		)
		const newWebsiteGroups = updatedGroups.filter((g) => g.category === 'website')

		setData('system', routesToSidebar(newSystemGroups))

		setData('website', routesToSidebar(newWebsiteGroups))
	})

	const router = createRouter({
		history: createWebHistory(),
		routes: [
			{
				path: '/login',
				name: 'Login',
				component: () => import('#pages/login-page'),
				meta: { public: true },
			},
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

	router.beforeEach((to, from, next) => {
		const token = localStorage.getItem('gp_access_token')
		const isAuthenticated = !!token

		if (to.path !== '/login' && !isAuthenticated && !to.meta.public) {
			next('/login')
		} else if (to.path === '/login' && isAuthenticated) {
			next('/')
		} else {
			next()
		}
	})

	return router
}
