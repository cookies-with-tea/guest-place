import { createApp } from 'vue'

import { i18nPlugin, initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

import App from './app/App.vue'

initUiStyles()

const app = createApp(App)

app.use(ElementPlus).use(i18nPlugin)

app.mount('#app')
