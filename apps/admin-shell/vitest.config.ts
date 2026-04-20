import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default defineConfig(async (env) => {
	const baseConfig = typeof viteConfig === 'function' ? await viteConfig(env) : viteConfig

	return mergeConfig(baseConfig, {
		test: {
			environment: 'jsdom',
			globals: true,
			exclude: [...configDefaults.exclude, 'e2e/**'],
			root: fileURLToPath(new URL('./', import.meta.url)),
		},
	})
})
