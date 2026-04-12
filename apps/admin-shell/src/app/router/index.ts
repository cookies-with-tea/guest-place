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
		const response = await fetch('/api/v1/mfe/manifest')

		if (!response.ok) throw new Error('Failed to fetch manifest from API')

		const manifest: RemoteManifest = await response.json()
		const remotes = manifest.remotes.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

		for (const remote of remotes) {
			try {
				const remoteModule = await loadRemoteModule(remote, { app })

				const routesFromModule = remoteModule.routes || remoteModule.default?.routes || remoteModule.default || []

				routesFromModule.forEach((route: any) => {
					routes.push(addPrefixToRoute(route, `/${remote.name}`))
				})
			} catch {
				// Silent fail for individual remotes
			}
		}
	} catch {
		// Silent fail for manifest
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

	window.addEventListener('mfe:updated', async () => {
		const updatedRoutes = await loadRemoteRoutes(app)

		setData(routesToSidebar(updatedRoutes))
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
