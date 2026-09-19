import { defineComponent, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import { GP_EVENTS, ROUTES, useEvents } from '@admin-panel/lib'
import { loadRemoteModule, type RemoteManifest } from '@admin-panel/lib/utils'
import { UiMfeFallback, useSidebar } from '@admin-panel/ui'
import { ElMessage } from 'element-plus'

import MainLayout from '#app/layouts/MainLayout.vue'

import { mfeApi } from '../../entities/mfe/api'

const { on, dispatch } = useEvents()

const disabledRoutesSet = new Set<string>()

// Загружаем роуты асинхронно
const loadRemoteRoutes = async (app: any) => {
	const routes: any[] = []
	const sidebarGroups: any[] = []
	disabledRoutesSet.clear()

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

	const createFallbackRoute = (remote: any, err: any) => {
		const FallbackComponent = defineComponent({
			name: `MfeFallback_${remote.name}`,
			setup() {
				const handleRetry = async () => {
					try {
						const mod = await loadRemoteModule(remote, { app })

						if (mod) {
							dispatch(GP_EVENTS.UPDATED)
							ElMessage.success(`Модуль ${remote.displayName || remote.name} успешно подключен!`)
							setTimeout(() => {
								window.location.reload()
							}, 500)

							return true
						}
					} catch {
						return false
					}
				}

				return () =>
					h(UiMfeFallback, {
						remoteName: remote.name,
						displayName: remote.displayName,
						url: remote.url,
						error: err,
						onRetry: handleRetry,
					})
			},
		})

		return {
			path: `/${remote.name}`,
			name: `fallback-${remote.name}`,
			component: FallbackComponent,
			children: [
				{
					path: ':pathMatch(.*)*',
					component: FallbackComponent,
				},
			],
		}
	}

	const res = await mfeApi.getManifest()

	if (res.data) {
		const manifest: RemoteManifest = res.data
		const remotes = (manifest.remotes || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

		const loadPromises = remotes.map(async (remote: any) => {
			const routeConfig = (ROUTES as any)[remote.name]
			const disabledList = (remote.config?.disabledRoutes || remote.config?.disabled_routes || []) as string[]

			disabledList.forEach((r) => disabledRoutesSet.add(r))

			try {
				const remoteModule = await loadRemoteModule(remote, { app })

				const routesFromModule = remoteModule.routes || remoteModule.default?.routes || remoteModule.default || []
				const modifiedRoutes = routesFromModule.map((route: any) => addPrefixToRoute(route, `/${remote.name}`))

				return {
					routes: modifiedRoutes,
					sidebarGroup: {
						name: remote.name,
						title: routeConfig?.title || `general.${remote.name}`,
						icon: routeConfig?.icon || remote.icon || 'Menu',
						category: remote.category,
						routes: modifiedRoutes,
						config: remote.config,
					},
				}
			} catch (err) {
				console.error(`[Shell] Failed to load remote ${remote.name}:`, err)

				const fallbackRoute = createFallbackRoute(remote, err)

				return {
					routes: [fallbackRoute],
					sidebarGroup: {
						name: remote.name,
						title: routeConfig?.title || remote.displayName || `general.${remote.name}`,
						icon: routeConfig?.icon || remote.icon || 'Menu',
						category: remote.category,
						routes: [{ path: `/${remote.name}`, meta: { title: remote.displayName || remote.name } }],
						config: remote.config,
					},
				}
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
	const processRoute = (route: any, groupConfig: any): any => {
		const disabledList = (groupConfig?.disabledRoutes || groupConfig?.disabled_routes || []) as string[]
		const item: any = {
			title: route.meta?.title || route.name,
			path: route.path,
		}

		if (Array.isArray(route.children)) {
			const visibleChildren = route.children
				.filter(
					(child: any) =>
						!child.meta?.hideInSidebar &&
						!child.path.includes(':') &&
						!disabledList.includes(child.path)
				)
				.map((child: any) => processRoute(child, groupConfig))

			if (visibleChildren.length > 0) {
				item.children = visibleChildren
			}
		}

		return item
	}

	return groups.map((group: any) => {
		const disabledList = (group.config?.disabledRoutes || group.config?.disabled_routes || []) as string[]
		const visibleRoutes = group.routes.filter(
			(route: any) =>
				!route.meta?.hideInSidebar &&
				!route.path.includes(':') &&
				!disabledList.includes(route.path)
		)

		// If there is only one route and it's the root of the MFE
		if (visibleRoutes.length === 1 && visibleRoutes[0].path === `/${group.name}`) {
			const processed = processRoute(visibleRoutes[0], group.config)

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
			children: visibleRoutes.map((r: any) => processRoute(r, group.config)),
		}
	})
}

export const initRouter = async (app: any) => {
	const { routes: remoteRoutes, sidebarGroups } = await loadRemoteRoutes(app)

	const { setData } = useSidebar()

	const updateSidebar = (groups: any[]) => {
		const systemGroups = groups.filter(
			(g) => !g.category || g.category === 'system' || g.name === 'orchestrator'
		)
		const websiteGroups = groups.filter((g) => g.category === 'website')

		setData('system', routesToSidebar(systemGroups))
		setData('website', routesToSidebar(websiteGroups))
	}

	updateSidebar(sidebarGroups)

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

	on(GP_EVENTS.UPDATED, async () => {
		const { routes: updatedRoutes, sidebarGroups: updatedGroups } = await loadRemoteRoutes(app)

		// Dynamically register any newly added routes into Layout
		updatedRoutes.forEach((route: any) => {
			router.addRoute('Layout', route)
		})

		updateSidebar(updatedGroups)
	})

	router.beforeEach((to, from, next) => {
		const token = localStorage.getItem('gp_access_token')
		const isAuthenticated = !!token

		if (to.path !== '/login' && !isAuthenticated && !to.meta.public) {
			next('/login')
			return
		} else if (to.path === '/login' && isAuthenticated) {
			next('/')
			return
		}

		if (disabledRoutesSet.has(to.path)) {
			ElMessage.warning('Данный раздел отключен администратором')
			next('/')
			return
		}

		next()
	})

	return router
}
