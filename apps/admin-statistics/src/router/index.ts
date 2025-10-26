import { createRouter, createWebHistory } from 'vue-router'

export const statisticsRoutes = [
	{
		path: '/statistics',
		name: 'StatisticsDashboard',
		component: () => import('../pages/AnalyticsPage.vue'),
	},
]

export const createStatisticsRouter = () => {
	return createRouter({
		history: createWebHistory(),
		routes: statisticsRoutes,
	})
}
