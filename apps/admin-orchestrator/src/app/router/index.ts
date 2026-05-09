import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('#app/layouts/OrchestratorLayout.vue'),
		children: [
			{
				path: '',
				name: (ROUTES as any).orchestrator?.list?.name || 'OrchestratorTopology',
				component: () => import('#pages/topology-page/TopologyPage.vue'),
				meta: { title: 'Топология' },
			},
			{
				path: 'modules',
				name: 'OrchestratorModules',
				component: () => import('#pages/modules-page/ModulesPage.vue'),
				meta: { title: 'Модули' },
			},
			{
				path: 'monitoring',
				name: 'OrchestratorMonitoring',
				component: () => import('#pages/monitoring-page/MonitoringPage.vue'),
				meta: { title: 'Мониторинг' },
			},
			{
				path: 'logs',
				name: 'OrchestratorLogs',
				component: () => import('#pages/logs-page/LogsPage.vue'),
				meta: { title: 'Логи системы' },
			},
			{
				path: 'features',
				name: 'OrchestratorFeatures',
				component: () => import('#pages/features-page/FeaturesPage.vue'),
				meta: { title: 'Возможности' },
			},
		],
	},
]

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
})
