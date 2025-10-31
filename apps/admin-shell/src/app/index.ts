import App from './App.vue'
import { initRouter } from './router'
import { createApp } from 'vue'

import '@admin-panel/ui/styles/index.scss'

const router = await initRouter()

const app = createApp(App)

app.use(router)

export { app }
