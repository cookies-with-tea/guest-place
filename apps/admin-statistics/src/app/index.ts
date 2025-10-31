import App from './App.vue'
import { router } from './router'
import { createApp } from 'vue'

import '@admin-panel/ui/assets/styles/index.scss'

const app = createApp(App)

app.use(router)

export { app }
