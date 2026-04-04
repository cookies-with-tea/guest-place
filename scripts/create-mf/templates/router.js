export function getRouter(name) {
  const mfName = name.replace(/^admin-/, '')
  const access = mfName.includes('-') ? `['${mfName}']` : `.${mfName}`

  return `import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES${access}.name,
		component: () => import('#pages/${mfName}-page'),
		meta: {
			title: ROUTES${access}.title,
		},
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
`
}
