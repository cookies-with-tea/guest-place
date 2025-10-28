import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
	{
		path: '/statistics',
		name: 'StatisticsDashboard',
		component: () => import('#pages/AnalyticsPage.vue'),
	},
]

export const router=  createRouter({
	history: createWebHistory(),
	routes,
})
