import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: (ROUTES as any).orchestrator?.list?.name || 'OrchestratorTopology',
		component: () => import('#pages/orchestrator-page/ui/TopologyPage.vue'),
		meta: {
			title: 'Топология',
			icon: 'Coordinate', // This icon will be used for the whole group in Shell
		},
	},
	{
		path: '/modules',
		name: 'OrchestratorModules',
		component: () => import('#pages/orchestrator-page/ui/ModulesPage.vue'),
		meta: {
			title: 'Модули',
		},
	},
	{
		path: '/monitoring',
		name: 'OrchestratorMonitoring',
		component: () => import('#pages/orchestrator-page/ui/MonitoringPage.vue'),
		meta: {
			title: 'Мониторинг',
		},
	},
	{
		path: '/logs',
		name: 'OrchestratorLogs',
		component: () => import('#pages/orchestrator-page/ui/LogsPage.vue'),
		meta: {
			title: 'Логи системы',
		},
	},
]

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
})
