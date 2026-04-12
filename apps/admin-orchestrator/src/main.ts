import { app } from './app'
import { router } from './app/router'
import ElementPlus from 'element-plus'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { initUiStyles } from '@admin-panel/ui'

initUiStyles()

app.use(router).use(ElementPlus).use(VueQueryPlugin)

// For standalone mount
app.mount('#app')
