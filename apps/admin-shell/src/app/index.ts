import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

if (!localStorage.getItem('gp-theme')) {
  localStorage.setItem('gp-theme', 'dark')
}

if (localStorage.getItem('gp-theme') === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.add('light')
}
import { useI18n } from '@admin-panel/i18n'
import * as vue from 'vue'
import * as vueRouter from 'vue-router'
import * as elementPlus from 'element-plus'
import * as piniaPkg from 'pinia'
import * as vueQueryPkg from '@tanstack/vue-query'

// Manually populate federation shared scope for dynamic remotes
// @ts-ignore
window.__federation_shared__ = window.__federation_shared__ || {}
// @ts-ignore
const shared = window.__federation_shared__

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

setShared('vue', vue, '3.5.22')
setShared('vue-router', vueRouter, '4.5.1')
setShared('element-plus', elementPlus, '2.13.0')
setShared('pinia', piniaPkg, '2.1.0')
setShared('@tanstack/vue-query', vueQueryPkg, '5.92.1')

import App from './App.vue'
import { initRouter } from './router'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { VueQueryPlugin } from '@tanstack/vue-query'

import '@admin-panel/ui/assets/styles/index.scss'

import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(ElementPlus).use(VueQueryPlugin)

const { loadDict } = useI18n()
await loadDict('general')

const router = await initRouter(app)
app.use(router)

export { app }
