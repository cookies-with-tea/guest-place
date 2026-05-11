import { createApp } from 'vue'

import { initUiStyles } from '@admin-panel/ui'

import App from './App.vue'
import { router } from './router'

initUiStyles()

import { VueQueryPlugin } from '@tanstack/vue-query'

import { i18nPlugin, initI18n, useI18n } from '@admin-panel/i18n'
import ElementPlus from 'element-plus'

initI18n({ apiBase: '' })

const { loadDict } = useI18n()

const app = createApp(App)

app.use(i18nPlugin)

loadDict('general')

loadDict('platforms')

app.use(VueQueryPlugin).use(router).use(ElementPlus)

export { app }
