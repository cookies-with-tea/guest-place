import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ROUTES, type MFLifecycleHooks } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: (ROUTES as any).orchestrator?.name || 'OrchestratorPage',
		component: () => import('@/pages/orchestrator-page'),
		meta: {
			title: (ROUTES as any).orchestrator?.title || 'Оркестратор',
		},
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})

export const hooks: MFLifecycleHooks = {
	onMount: async (app: any, context: any) => {
		// eslint-disable-next-line no-console
		console.log('[MF orchestrator] Mounted', context)
	},
}

export default {
	routes,
	hooks,
}
