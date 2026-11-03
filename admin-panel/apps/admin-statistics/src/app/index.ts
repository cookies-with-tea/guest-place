import '@admin-panel/ui/inject-styles'

import { createApp } from 'vue'

import { i18nPlugin, initI18n, useI18n } from '@admin-panel/i18n'
import { initUiStyles } from '@admin-panel/ui'

import App from './App.vue'
import { router } from './router'

initUiStyles()

initI18n({ apiBase: '' })

const { loadDict } = useI18n()

if (!localStorage.getItem('gp-theme')) {
	localStorage.setItem('gp-theme', 'dark')
}

if (localStorage.getItem('gp-theme') === 'dark') {
	document.documentElement.classList.add('dark')
}

const app = createApp(App)

app.use(router)

app.use(i18nPlugin)

loadDict('general')

loadDict('statistics')

export { app }
