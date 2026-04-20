import { createApp } from 'vue'

import { initUiStyles } from '@admin-panel/ui'

import App from './App.vue'
import { router } from './router'

initUiStyles()

if (!localStorage.getItem('gp-theme')) {
	localStorage.setItem('gp-theme', 'dark')
}

if (localStorage.getItem('gp-theme') === 'dark') {
	document.documentElement.classList.add('dark')
}

const app = createApp(App)

app.use(router)

export { app }
