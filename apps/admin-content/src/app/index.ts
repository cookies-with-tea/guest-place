import { createApp } from 'vue'

import { i18nPlugin, initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

import App from './App.vue'
import { router } from './router'

initUiStyles()

const app = createApp(App)

app.use(router).use(ElementPlus).use(i18nPlugin)

export { app }
