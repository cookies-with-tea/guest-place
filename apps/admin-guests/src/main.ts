import '@admin-panel/ui/inject-styles'

import { createApp } from 'vue'

import { initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

import App from './pages/GuestsPage.vue'

initUiStyles()

const app = createApp(App)

app.use(ElementPlus)

app.mount('#app')
