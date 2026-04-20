import { createApp } from 'vue'

import { initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

initUiStyles()

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.use(ElementPlus)

app.mount('#app')
