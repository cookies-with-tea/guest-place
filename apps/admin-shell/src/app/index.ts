import App from './App.vue'
import { router } from './router'
import { createApp } from 'vue'

// import 'virtual:svg-icons-register'

import '@admin-panel/ui/styles/index.scss';

const app = createApp(App)

app.use(router)

export { app }
