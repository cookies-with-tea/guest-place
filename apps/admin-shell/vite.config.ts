import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueDevTools(),
		federation({
			name: 'shell',
			remotes: {
				statistics: 'http://localhost:3001/assets/remoteEntry.js',
				translations: 'http://localhost:3002/assets/remoteEntry.js',
			},
			shared: ['vue', 'vue-router'],
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
		port: 3000,
		cors: true,
	},
})
