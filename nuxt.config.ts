// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath, URL } from 'node:url'
import { typedIconPlugin } from 'typed-icon-template'
import * as path from 'node:path'

const typedIconPluginConfig = typedIconPlugin({
  iconsPath: './public/assets/icons',
  iconComponentPath: path.resolve(process.cwd(), './app/shared/ui/ui-icon/types'),
  fileName: 'index.ts',
})

export default defineNuxtConfig({
  srcDir: 'app', // ← основная папка с app.vue, pages и т.д.
  dir: {
    plugins: 'app/plugins', // ← относительно srcDir
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxtjs/stylelint-module', 'nuxt-svgo'],
  svgo: {
    defaultImport: 'component',
    componentPrefix: 'ui',
    autoImportPath: false,
    // Настройка SVGO для отключения удаления ID
    svgoConfig: {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              // Отключаем конкретный плагин в пресете
              cleanupIds: false,
            }
          }
        }
      ],
    },
  },
  build: {
    transpile: [
      'gsap',
    ],
  },
  stylelint: {
    emitError: false,
  },
  components: {
    global: false,
    dirs: [],
  },
  vite: {
    plugins: [typedIconPluginConfig],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "styles/library" as *;`,
        },
      },
    },
  },
  css: ['styles/base.scss'],
  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
    '#shared': fileURLToPath(new URL('./app/shared', import.meta.url)),
    '#entities': fileURLToPath(new URL('./app/entities', import.meta.url)),
    '#features': fileURLToPath(new URL('./app/features', import.meta.url)),
    '#widgets': fileURLToPath(new URL('./app/widgets', import.meta.url)),
    '#pages': fileURLToPath(new URL('./app/pages', import.meta.url)),
    '#fonts': fileURLToPath(new URL('./public/assets/fonts', import.meta.url)),
    styles: fileURLToPath(new URL('./public/styles', import.meta.url)),
    public: fileURLToPath(new URL('./public', import.meta.url)),
  },
})
