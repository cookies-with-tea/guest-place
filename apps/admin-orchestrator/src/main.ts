import { app } from './app'
import { router } from './app/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@admin-panel/ui/assets/styles/index.scss'

app.use(router).use(ElementPlus)

// For standalone mount
app.mount('#app')
