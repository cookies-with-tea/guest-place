export function getRouter(name) {
	const mfName = name.replace(/^admin-/, '')
	const access = mfName.includes('-') ? `['${mfName}']` : `.${mfName}`

	return `import { type RouteRecordRaw } from 'vue-router'
import { ROUTES, type MFLifecycleHooks } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES${access}.name,
		component: () => import('./pages/${mfName}-page'),
		meta: {
			title: ROUTES${access}.title,
		},
	},
]

export const hooks: MFLifecycleHooks = {
	onMount: async (app, context) => {
		console.log('[MF ${mfName}] Mounted', context)
	},
}

export default {
	routes,
	hooks,
}
`
}
