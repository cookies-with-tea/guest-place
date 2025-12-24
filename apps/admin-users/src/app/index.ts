import App from './App.vue'
import { router } from './router'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'

import '@admin-panel/ui/assets/styles/index.scss'
import 'element-plus/dist/index.css'

import { initI18n } from '@admin-panel/i18n'
import { VueQueryPlugin } from '@tanstack/vue-query'

initI18n({
	apiBase: import.meta.env.VITE_API_BASE,
})

const app = createApp(App)

app.use(VueQueryPlugin)

app.use(router)

app.use(ElementPlus)

export { app }
