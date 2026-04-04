import App from './App.vue'
import { router } from './router'
import { createApp } from 'vue'

import '@admin-panel/ui/assets/styles/index.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'

if (!localStorage.getItem('gp-theme')) {
  localStorage.setItem('gp-theme', 'dark')
}

if (localStorage.getItem('gp-theme') === 'dark') {
  document.documentElement.classList.add('dark')
}

const app = createApp(App)

app.use(router)

export { app }
