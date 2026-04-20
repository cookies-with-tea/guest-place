import { createApp } from 'vue'

import { initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

import App from './pages/PlatformsPage.vue'

initUiStyles()

const app = createApp(App)

app.use(ElementPlus)

app.mount('#app')
