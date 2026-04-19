import { createApp } from 'vue'
import App from './pages/GuestsPage.vue'
import ElementPlus from 'element-plus'
import { initUiStyles } from '@admin-panel/ui'

initUiStyles()

const app = createApp(App)

app.use(ElementPlus)

app.mount('#app')
