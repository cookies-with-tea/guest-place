import App from './App.vue'
import { router } from './router'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'

import '@admin-panel/ui/assets/styles/index.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'

if (!localStorage.getItem('gp-theme')) {
  localStorage.setItem('gp-theme', 'dark')
}

if (localStorage.getItem('gp-theme') === 'dark') {
  document.documentElement.classList.add('dark')
}
import 'element-plus/dist/index.css'

import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)

app.use(VueQueryPlugin).use(router).use(ElementPlus)

export { app }
