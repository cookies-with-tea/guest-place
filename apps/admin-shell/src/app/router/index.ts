import { createRouter, createWebHistory } from 'vue-router'

import { GP_EVENTS, ROUTES, useEvents } from '@admin-panel/lib'

const { on } = useEvents()

import { loadRemoteModule, type RemoteManifest } from '@admin-panel/lib/utils'
import { useSidebar } from '@admin-panel/ui'

import MainLayout from '#app/layouts/MainLayout.vue'

import { mfeApi } from '../../entities/mfe/api'

// Загружаем роуты асинхронно
const loadRemoteRoutes = async (app: any) => {
	const routes: any[] = []
	const sidebarGroups: any[] = []

	const addPrefixToRoute = (route: any, prefix: string): any => {
		const { path, ...rest } = route
		const basePath = path === '/' ? '' : path
		const separator = basePath && !basePath.startsWith('/') ? '/' : ''
		const newPath = `${prefix}${separator}${basePath}`

		const modifiedRoute = {
			...rest,
			path: newPath,
		}

		if (Array.isArray(route.children)) {
			modifiedRoute.children = route.children.map((child: any) => addPrefixToRoute(child, newPath))
		}

		return modifiedRoute
	}

	const res = await mfeApi.getManifest()

	if (res.data) {
		const manifest: RemoteManifest = res.data
		const remotes = (manifest.remotes || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

		const loadPromises = remotes.map(async (remote) => {
			try {
				const remoteModule = await loadRemoteModule(remote, { app })

				console.log(`[Shell] Loaded remote: ${remote.name}`, remoteModule)

				const routesFromModule = remoteModule.routes || remoteModule.default?.routes || remoteModule.default || []
				const modifiedRoutes = routesFromModule.map((route: any) => addPrefixToRoute(route, `/${remote.name}`))

				// Finding icon and title from ROUTES if it matches remote name
				const routeConfig = (ROUTES as any)[remote.name]

				return {
					routes: modifiedRoutes,
					sidebarGroup: {
						name: remote.name,
						title: routeConfig?.title || `general.${remote.name}`,
						icon: routeConfig?.icon || 'Menu',
						category: remote.category,
						routes: modifiedRoutes,
					},
				}
			} catch (err) {
				console.error(`[Shell] Failed to load remote ${remote.name}:`, err)

				return null
			}
		})

		const loadedModules = await Promise.all(loadPromises)

		for (const mod of loadedModules) {
			if (mod) {
				routes.push(...mod.routes)

				sidebarGroups.push(mod.sidebarGroup)
			}
		}
	}

	return { routes, sidebarGroups }
}

const routesToSidebar = (groups: any[]) => {
	const processRoute = (route: any): any => {
		const item: any = {
			title: route.meta?.title || route.name,
			path: route.path,
		}

		if (Array.isArray(route.children)) {
			const visibleChildren = route.children
				.filter((child: any) => !child.meta?.hideInSidebar && !child.path.includes(':'))
				.map(processRoute)

			if (visibleChildren.length > 0) {
				item.children = visibleChildren
			}
		}

		return item
	}

	return groups.map((group: any) => {
		const visibleRoutes = group.routes.filter((route: any) => !route.meta?.hideInSidebar && !route.path.includes(':'))

		// If there is only one route and it's the root of the MFE
		if (visibleRoutes.length === 1 && visibleRoutes[0].path === `/${group.name}`) {
			const processed = processRoute(visibleRoutes[0])

			return {
				title: processed.title || group.title,
				path: processed.path,
				icon: group.icon,
				children: processed.children,
			}
		}

		return {
			title: group.title,
			icon: group.icon,
			children: visibleRoutes.map(processRoute),
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

	on(GP_EVENTS.UPDATED, async () => {
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
