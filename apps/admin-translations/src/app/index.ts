import '@admin-panel/ui/inject-styles'

import { createApp } from 'vue'

import { initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

import App from './App.vue'
import { router } from './router'

initUiStyles()

import { VueQueryPlugin } from '@tanstack/vue-query'

import { initI18n } from '@admin-panel/i18n'

initI18n({
	apiBase: import.meta.env.VITE_API_BASE,
})

const app = createApp(App)

app.use(VueQueryPlugin)

app.use(router)

app.use(ElementPlus)

export { app }
