import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import ElementPlus from 'element-plus'

import { initUiStyles } from '@admin-panel/ui'

initUiStyles()

const app = createApp(App)

app.use(router)

app.use(ElementPlus)

export { app }
