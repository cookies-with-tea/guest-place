if (typeof window !== 'undefined') {
	;(window as any).__gp_is_shell = true
	;(window as any).__gp_shell_active = true
}

import { createApp } from 'vue'

import { i18nPlugin, initI18n, useI18n } from '@admin-panel/i18n'

import App from './App.vue'

initI18n({ apiBase: '' })

export const app = createApp(App)

app.use(i18nPlugin)

const { loadDict } = useI18n()

loadDict('general')

loadDict('orchestrator')
