import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { fileURLToPath } from 'node:url'

export default defineConfig({
	plugins: [
		vue(),
		federation({
			name: 'statistics',
			filename: 'remoteEntry.js',
			exposes: {
				'./StatisticsRoutes': './src/app/router/index.ts',
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
		port: 3001,
		cors: true,
	},
})
