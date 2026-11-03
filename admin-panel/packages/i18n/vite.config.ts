import { PACKAGES_PORTS } from '@admin-panel/lib'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
	const rootDir = resolve(__dirname, '../../')

	const env = loadEnv(mode, rootDir, '') as any

	return {
		plugins: [vue()],
		build: {
			lib: {
				entry: resolve(__dirname, 'index.ts'),
				name: 'GpI18n',
				fileName: (format) => `index.${format}.js`,
			},
			rollupOptions: {
				external: ['vue', 'ofetch', 'pinia', '@admin-panel/lib', '@tanstack/vue-query'],
				output: {
					globals: {
						vue: 'Vue',
						ofetch: 'ofetch',
						pinia: 'Pinia',
						'@admin-panel/lib': 'GpLib',
					},
				},
			},
		},
		server: {
			cors: true,
			port: PACKAGES_PORTS.i18n.dev,
			proxy: {
				'/api': {
					target: env.VITE_API_BASE,
					changeOrigin: true,
					secure: false,
				},
			},
		},
		preview: {
			port: PACKAGES_PORTS.i18n.preview,
		},
	}
})
