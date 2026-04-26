import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: 'happy-dom',
		globals: true,
	},
	resolve: {
		alias: {
			'@admin-panel/i18n': resolve(__dirname, './index.ts'),
		},
	},
})
