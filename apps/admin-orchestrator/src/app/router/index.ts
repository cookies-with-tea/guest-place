import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ROUTES, type MFLifecycleHooks } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: (ROUTES as any).orchestrator?.list?.name || 'OrchestratorPage',
		component: () => import('@/pages/orchestrator-page'),
		meta: {
			title: (ROUTES as any).orchestrator?.list?.title || 'Оркестратор',
		},
	},
	{
		path: '/features',
		name: (ROUTES as any).orchestrator?.features?.name || 'FeaturesPage',
		component: () => import('@/pages/features-page'),
		meta: {
			title: (ROUTES as any).orchestrator?.features?.title || 'Флаги фич',
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
