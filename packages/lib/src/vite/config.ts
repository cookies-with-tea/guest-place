import { defineConfig, loadEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { builtinModules } from 'node:module'
import { defu } from 'defu'
import { APPS_PORTS } from '../constants/ports'

export interface CreateConfigOptions {
	name: string
	displayName: string
	shared?: string[] | Record<string, any>
	exposes?: Record<string, string>
	remotes?: Record<string, string>
	overrides?: UserConfig
	plugins?: any[]
	url: string
}

export function createConfig(options: CreateConfigOptions) {
	const {
		name,
		displayName,
		shared = {
			vue: { singleton: true },
			'vue-router': { singleton: true },
			'element-plus': { singleton: true },
		},
		exposes,
		remotes,
		overrides = {},
		plugins = [],
		url,
	} = options

	return defineConfig(({ mode }) => {
		const rootDir = resolve(fileURLToPath(url), '../../../')
		const env = loadEnv(mode, rootDir)

		const portConfig = APPS_PORTS[name as keyof typeof APPS_PORTS]

		const baseConfig: UserConfig = {
			plugins: [
				vue(),
				federation({
					name,
					filename: 'remoteEntry.js',
					exposes: exposes || {
						[`./${displayName.replace(/\s+/g, '')}Routes`]: './src/app/router/index.ts',
					},
					remotes,
					shared,
				}),
				...plugins,
			],
			resolve: {
				alias: {
					'@': fileURLToPath(new URL('./src', url)),
					'#app': fileURLToPath(new URL('./src/app', url)),
					'#pages': fileURLToPath(new URL('./src/pages', url)),
					'#widgets': fileURLToPath(new URL('./src/widgets', url)),
					'#features': fileURLToPath(new URL('./src/features', url)),
					'#entities': fileURLToPath(new URL('./src/entities', url)),
					'#shared': fileURLToPath(new URL('./src/shared', url)),
					styles: fileURLToPath(new URL('./src/app/assets/styles', url)),
				},
			},
			build: {
				target: 'esnext',
				minify: false,
				cssCodeSplit: false,
				rollupOptions: {
					external: [
						'fsevents',
						...builtinModules,
						...builtinModules.map((m) => `node:${m}`),
					],
				},
			},
			server: {
				port: portConfig?.dev,
				cors: true,
				proxy: env.VITE_API_BASE
					? {
							'/api': {
								target: env.VITE_API_BASE,
								changeOrigin: true,
								secure: false,
							},
						}
					: {},
			},
			preview: {
				port: portConfig?.preview,
			},
		}

		return defu(overrides, baseConfig)
	})
}
