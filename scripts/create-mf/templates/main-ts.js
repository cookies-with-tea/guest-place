export function getMainTs(name) {
  return `import { app } from './app'
import { initRouter } from './app/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const router = await initRouter(app)
app.use(router).use(ElementPlus)

app.mount('#app')
`
}
