import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

export const publicRoutes: Record<string, RouteRecordRaw> = {
	media: {
    path: '/',
		name: ROUTES.media.name,
    component: () => import('#pages/media/ui/IndexPage.vue'),
    meta: {
			title: ROUTES.media.title,
		},
	},
}

export const router = createRouter({
	history: createWebHistory(),
	routes: [publicRoutes.media],
})
