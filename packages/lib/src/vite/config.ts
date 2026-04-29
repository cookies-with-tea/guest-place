import federation from '@originjs/vite-plugin-federation'
import vue from '@vitejs/plugin-vue'
import { defu } from 'defu'
import { builtinModules } from 'node:module'
import { resolve } from 'node:path'
import { loadEnv } from 'vite'
import { defineConfig, type ViteUserConfig } from 'vitest/config'

import { APPS_PORTS } from '../constants/ports'

export interface CreateConfigOptions {
	name: string
	displayName: string
	shared?: string[] | Record<string, any>
	exposes?: Record<string, string>
	remotes?: Record<string, string>
	overrides?: ViteUserConfig
	plugins?: any[]
	serverPort?: number
	previewPort?: number
	root?: string
}

export function createConfig(options: CreateConfigOptions) {
	const {
		name,
		displayName,
		shared = {
			vue: { singleton: true },
			'vue-router': { singleton: true },
			'element-plus': { singleton: true },
			pinia: { singleton: true },
			'@tanstack/vue-query': { singleton: true },
			'@admin-panel/i18n': { singleton: true },
		},
		exposes,
		remotes,
		overrides = {},
		plugins = [],
		serverPort,
		previewPort,
		root: rootOption,
	} = options

	return defineConfig(({ mode, command }) => {
		const appDir = rootOption || process.cwd()
		const rootDir = resolve(appDir, '../../')
		const env = loadEnv(mode, rootDir)

		const portConfig = APPS_PORTS[name as keyof typeof APPS_PORTS]
		const isProduction = mode === 'production' || command === 'build'

		const baseConfig: ViteUserConfig = {
			root: appDir,
			base: '/', // Keep base as / but override URLs for built assets
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
			experimental: {
				renderBuiltUrl(filename) {
					if (isProduction && name !== 'shell' && portConfig) {
						return `http://localhost:${(portConfig as any).preview}/${filename}`
					}
				},
			},
			resolve: {
				alias: {
					'@': resolve(appDir, 'src'),
					'#app': resolve(appDir, 'src/app'),
					'#pages': resolve(appDir, 'src/pages'),
					'#widgets': resolve(appDir, 'src/widgets'),
					'#features': resolve(appDir, 'src/features'),
					'#entities': resolve(appDir, 'src/entities'),
					'#shared': resolve(appDir, 'src/shared'),
					styles: resolve(appDir, 'src/app/assets/styles'),
				},
			},
			build: {
				target: 'esnext',
				minify: false,
				cssCodeSplit: false,
				rollupOptions: {
					external: ['fsevents', ...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
				},
			},
			server: {
				port: serverPort || portConfig?.dev,
				cors: true,
				proxy: env.VITE_API_BASE
					? {
							'/api': {
								target: env.VITE_API_BASE,
								changeOrigin: true,
								secure: false,
								// Ensure SSE works by disabling buffering
								configure: (proxy) => {
									proxy.on('proxyRes', (proxyRes, req) => {
										// For SSE, we want to ensure no buffering
										if (req.url?.includes('/logs') || req.url?.includes('/stats/stream')) {
											proxyRes.headers['cache-control'] = 'no-cache'

											proxyRes.headers['connection'] = 'keep-alive'
										}
									})
								},
							},
						}
					: {},
			},
			preview: {
				port: previewPort || portConfig?.preview,
				proxy: env.VITE_API_BASE
					? {
							'/api': {
								target: env.VITE_API_BASE,
								changeOrigin: true,
								secure: false,
								configure: (proxy) => {
									proxy.on('proxyRes', (proxyRes, req) => {
										if (req.url?.includes('/logs') || req.url?.includes('/stats/stream')) {
											proxyRes.headers['cache-control'] = 'no-cache'

											proxyRes.headers['connection'] = 'keep-alive'
										}
									})
								},
							},
						}
					: {},
			},
			test: {
				globals: true,
				environment: 'jsdom',
				setupFiles: [],
				include: ['src/__tests__/**/*.{test,spec}.{ts,js,tsx,jsx}'],
				coverage: {
					provider: 'v8',
					reporter: ['text', 'json', 'html'],
					include: ['src/**/*.{ts,vue}'],
					all: true,
					exclude: ['node_modules/', 'src/__tests__/**', '**/*.d.ts', 'vite.config.ts', 'dist/**'],
				},
			},
		}

		return defu(overrides, baseConfig)
	})
}
