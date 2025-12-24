import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { fileURLToPath } from 'node:url'

export default defineConfig({
	plugins: [
		vue(),
		federation({
			name: 'translations',
			filename: 'remoteEntry.js',
			exposes: {
				'./TranslationsRoutes': './src/app/router/index.ts',
			},
			remotes: {
				'@admin-panel/ui': 'http://localhost:6003/assets/remoteEntry.js',
				'@admin-panel/i18n': 'http://localhost:6004/assets/remoteEntry.js',
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
		port: 3002,
		cors: true,
	},
})
