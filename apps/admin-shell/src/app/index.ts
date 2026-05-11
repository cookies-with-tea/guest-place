if (typeof window !== 'undefined') {
	;(window as any).__gp_is_shell = true
	;(window as any).__gp_shell_active = true
}

import '@admin-panel/ui/inject-styles'

import { i18nPlugin, initUiStyles } from '@admin-panel/ui'

initUiStyles()

if (!localStorage.getItem('gp-theme')) {
	localStorage.setItem('gp-theme', 'dark')
}

if (localStorage.getItem('gp-theme') === 'dark') {
	document.documentElement.classList.add('dark')
} else {
	document.documentElement.classList.add('light')
}

import { GP_EVENTS, useEvents } from '@admin-panel/lib'
import * as elementPlus from 'element-plus'

const { on } = useEvents()

// Manually populate federation shared scope for dynamic remotes in development
if (import.meta.env.DEV) {
	const shared = ((window as any).__federation_shared__ = (window as any).__federation_shared__ || {})

	const setShared = (name: string, module: any, version: string) => {
		if (!shared[name]) {
			shared[name] = {
				[version]: {
					get: () => Promise.resolve(() => module),
					version,
				},
			}
		}
	}

	// Dynamic imports to avoid bundling in production and potentially fix build issues
	const [vue, vueRouter, piniaPkg, vueQueryPkg, i18nPkg, libPkg, uiPkg] = await Promise.all([
		import('vue'),
		import('vue-router'),
		import('pinia'),
		import('@tanstack/vue-query'),
		import('@admin-panel/i18n'),
		import('@admin-panel/lib'),
		import('@admin-panel/ui'),
	])

	setShared('vue', vue, '3.5.22')

	setShared('vue-router', vueRouter, '4.5.1')

	setShared('element-plus', elementPlus, '2.13.0')

	setShared('pinia', piniaPkg, '2.1.0')

	setShared('@tanstack/vue-query', vueQueryPkg, '5.92.1')

	setShared('@admin-panel/ui', uiPkg, '1.0.0')

	setShared('@admin-panel/lib', libPkg, '1.0.0')

	setShared('@admin-panel/i18n', i18nPkg, '1.0.0')
}

import { createApp } from 'vue'
// Styles handled by initUiStyles
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

import ElementPlus from 'element-plus'

import App from './App.vue'
import { initRouter } from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(ElementPlus).use(VueQueryPlugin).use(i18nPlugin)

import { useI18n } from '@admin-panel/i18n'
const { loadDict } = useI18n()

await loadDict('general')

await loadDict('shell')

await loadDict('platforms')

const router = await initRouter(app)

on(GP_EVENTS.UNAUTHORIZED, (e: any) => {
	e.preventDefault()

	if (router.currentRoute.value.path !== '/login') {
		router.push('/login')
	}
})

app.use(router)

export { app }
