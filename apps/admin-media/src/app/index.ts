import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import { initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

import App from './App.vue'
import { router } from './router'

initUiStyles()

const app = createApp(App)

app.use(router)

app.use(ElementPlus)

app.use(VueQueryPlugin)

export { app }
