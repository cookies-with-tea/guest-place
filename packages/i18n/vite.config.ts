import { resolve } from 'path'
import federation from '@originjs/vite-plugin-federation'
import { defineConfig, loadEnv } from 'vite'
import { PACKAGES_PORTS } from '@admin-panel/lib'

export default defineConfig(({ mode }) => {
	const rootDir = resolve(__dirname, '../../')

	const env = loadEnv(mode, rootDir, '') as ImportMetaEnv

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
