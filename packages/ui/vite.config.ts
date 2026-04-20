import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

import svgSpriteInlinePlugin from './vite-svg-sprite-inline-plugin'

export default defineConfig({
	plugins: [
		vue(),
		svgSpriteInlinePlugin({
			inputDir: resolve(__dirname, 'assets/icons'),
			outputTs: resolve(__dirname, 'src/components/ui-icon/sprite/sprite.ts'),
		}),
	],
	resolve: {
		alias: {
			'#': resolve(__dirname, 'src'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/__tests__/**/*.{test,spec}.{ts,js,tsx,jsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/__tests__/**', '**/*.d.ts', 'dist/**'],
		},
	},
})
