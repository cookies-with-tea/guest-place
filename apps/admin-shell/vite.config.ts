import { fileURLToPath, URL } from 'node:url'
import { APPS_PORTS } from '@admin-panel/lib/constants'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig(() => {
	return {
		plugins: [
			vue(),
			vueDevTools(),
			federation({
				name: 'shell',
				remotes: {
					statistics: `http://localhost:${APPS_PORTS.statistics.preview}/assets/remoteEntry.js`,
					translations: `http://localhost:${APPS_PORTS.translations.preview}/assets/remoteEntry.js`,
					users: `http://localhost:${APPS_PORTS.users.preview}/assets/remoteEntry.js`,
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
			port: APPS_PORTS.shell.dev,
		},
		preview: {
			port: APPS_PORTS.shell.preview,
		},
	}
})
