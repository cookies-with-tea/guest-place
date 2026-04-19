import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '../app/router'

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
