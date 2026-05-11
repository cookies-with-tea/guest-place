import '@admin-panel/ui/inject-styles'

import { VueQueryPlugin } from '@tanstack/vue-query'

import { initUiStyles } from '@admin-panel/ui'
import ElementPlus from 'element-plus'

import { router } from './app/router'
import { app } from './app'

initUiStyles()

app.use(router).use(ElementPlus).use(VueQueryPlugin)

// For standalone mount
app.mount('#app')
