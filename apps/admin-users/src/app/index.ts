import App from './App.vue'
import { router } from './router'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'

import { initUiStyles } from '@admin-panel/ui'

initUiStyles()

import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)

app.use(VueQueryPlugin).use(router).use(ElementPlus)

export { app }
