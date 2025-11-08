import App from './App.vue'
import { router } from './router'
import { createApp } from 'vue'

import '@admin-panel/ui/assets/styles/index.scss'

import { initI18n } from '@admin-panel/i18n'

initI18n({
	apiBase: import.meta.env.VITE_API_BASE,
})

const app = createApp(App)

app.use(router)

export { app }
