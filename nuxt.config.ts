// https://nuxt.com/docs/api/configuration/nuxt-config

import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxtjs/stylelint-module'],
  components: {
    global: false,
    dirs: [],
  },
  css: ['styles/index.scss'],
  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
    '#shared': fileURLToPath(new URL('./app/shared', import.meta.url)),
    '#entities': fileURLToPath(new URL('./app/entities', import.meta.url)),
    '#features': fileURLToPath(new URL('./app/features', import.meta.url)),
    '#widgets': fileURLToPath(new URL('./app/widgets', import.meta.url)),
    '#pages': fileURLToPath(new URL('./app/pages', import.meta.url)),
    '#fonts': fileURLToPath(new URL('./public/assets/fonts', import.meta.url)),
    styles: fileURLToPath(new URL('./public/assets/styles', import.meta.url)),
  },
})
