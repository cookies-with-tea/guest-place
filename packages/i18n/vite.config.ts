import federation from '@originjs/vite-plugin-federation'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '') as ImportMetaEnv

	return {
		plugins: [
			federation({
				name: '@admin-panel/i18n',
				filename: 'remoteEntry.js',
				shared: {
					'@admin-panel/i18n': {
						requiredVersion: '^1.0.0',
					},
				},
			}),
		],
		server: {
			proxy: {
				'/api': {
					target: env.VITE_API_BASE,
					changeOrigin: true,
					secure: false,
				},
			},
		},
	}
})
