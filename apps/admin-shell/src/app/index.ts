import App from './App.vue'
import { initRouter } from './router'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { VueQueryPlugin } from '@tanstack/vue-query'

import '@admin-panel/ui/assets/styles/index.scss'
import 'element-plus/dist/index.css'

const router = await initRouter()

const app = createApp(App)

app.use(router).use(ElementPlus).use(VueQueryPlugin)

export { app }
