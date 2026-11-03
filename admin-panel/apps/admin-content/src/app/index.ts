import { createApp } from 'vue'

import { initI18n, useI18n } from '@admin-panel/i18n'
import { i18nPlugin, initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

import App from './App.vue'
import { router } from './router'

initUiStyles()

initI18n({ apiBase: '' })

const { loadDict } = useI18n()

const app = createApp(App)

app.use(router).use(ElementPlus).use(i18nPlugin)

loadDict('general')

loadDict('content')

export { app }
