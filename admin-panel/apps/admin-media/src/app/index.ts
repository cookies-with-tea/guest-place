import '@admin-panel/ui/inject-styles'

import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import { i18nPlugin, initI18n, useI18n } from '@admin-panel/i18n'
import { initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

import App from './App.vue'
import { router } from './router'

initUiStyles()

initI18n({ apiBase: '' })

const { loadDict } = useI18n()

const app = createApp(App)

app.use(router)

app.use(ElementPlus)

app.use(VueQueryPlugin)

app.use(i18nPlugin)

loadDict('general')

loadDict('media')

export { app }
