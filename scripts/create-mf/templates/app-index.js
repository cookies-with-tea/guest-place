export function getAppIndex() {
  return `import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { router } from './router'

import '@admin-panel/ui/assets/styles/index.scss'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(VueQueryPlugin).use(router).use(ElementPlus)

export { app }
`
}
