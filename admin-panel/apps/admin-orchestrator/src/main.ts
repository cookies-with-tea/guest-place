import '@admin-panel/ui/inject-styles'

import { VueQueryPlugin } from '@tanstack/vue-query'

import { initUiStyles } from '@admin-panel/ui'

import { router } from './app/router'
import { app } from './app'

initUiStyles()

app.use(router).use(VueQueryPlugin)

// For standalone mount
app.mount('#app')
