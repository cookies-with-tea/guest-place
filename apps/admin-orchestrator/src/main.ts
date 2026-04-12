import { app } from './app'
import { router } from './app/router'
import ElementPlus from 'element-plus'
import { initUiStyles } from '@admin-panel/ui'

initUiStyles()

app.use(router).use(ElementPlus)

// For standalone mount
app.mount('#app')
