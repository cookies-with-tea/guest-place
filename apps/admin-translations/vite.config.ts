import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { fileURLToPath, resolve } from 'node:url'
import { APPS_PORTS } from '@admin-panel/lib'

export default defineConfig(({ mode }) => {
	const rootDir = resolve(__dirname, '../../')

	const env = loadEnv(mode, rootDir, '')

	return {
		plugins: [
			vue(),
			federation({
				name: 'translations',
				filename: 'remoteEntry.js',
				exposes: {
					'./TranslationsRoutes': './src/app/router/index.ts',
				},
				shared: ['vue', 'vue-router', 'element-plus', '@tanstack/vue-query'],
			}),
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
				'#app': fileURLToPath(new URL('./src/app', import.meta.url)),
				'#pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
				'#widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
				'#features': fileURLToPath(new URL('./src/features', import.meta.url)),
				'#entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
				'#shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
				styles: fileURLToPath(new URL('./src/app/assets/styles', import.meta.url)),
			},
		},
		build: {
			target: 'esnext',
			minify: false,
			cssCodeSplit: false,
		},
		server: {
			cors: true,
			port: APPS_PORTS.translations.dev,
			proxy: {
				'/api': {
					target: env.VITE_API_BASE,
					changeOrigin: true,
					secure: false,
				},
			},
		},
		preview: {
			port: APPS_PORTS.translations.preview,
		},
	}
})
