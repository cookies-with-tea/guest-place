// apps/admin-shell/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '#app/layouts/MainLayout.vue'

// Загружаем роуты асинхронно (top-level await в модуле)
const loadRemoteRoutes = async () => {
  const routes = []

  try {
    const stats = await import('statistics/StatisticsRoutes')

    routes.push(...(stats.default.routes || []))
  } catch (e) {
    console.warn('Statistics routes not loaded')
  }

  try {
    const trans = await import('translations/TranslationsRoutes')

    routes.push(...(trans.default.routes || []))
  } catch (e) {
    console.warn('Translations routes not loaded')
  }

  return routes
}

const shellRoutes = [
  {
    path: '/',
    name: 'Layout',
    component: MainLayout,
    children: [
      {
        name: 'Main',
        path: '/',
        component: () => import('#pages/main-page'),
      },
    ],
  },
]

// Создаём роутер с локальными + remote роутами
export const initRouter = async () => {
  const remoteRoutes = await loadRemoteRoutes()

  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'Layout',
        component: MainLayout,
        children: [
          {
            name: 'Main',
            path: '/',
            component: () => import('#pages/main-page'),
          },
          ...remoteRoutes,
        ],
      },
      { path: '/:pathMatch(.*)*', redirect: '/' },
    ],
  })
}
