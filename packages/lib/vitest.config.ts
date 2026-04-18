import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/__tests__/**/*.{test,spec}.{ts,js,tsx,jsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.{ts,vue}'],
			all: true,
			exclude: ['node_modules/', 'src/__tests__/**', '**/*.d.ts', 'dist/**'],
		},
	},
})
