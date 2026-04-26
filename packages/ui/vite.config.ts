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
	build: {
		lib: {
			entry: resolve(__dirname, 'index.ts'),
			name: 'GpUi',
			fileName: (format) => `index.${format}.js`,
		},
		rollupOptions: {
			external: [
				'vue',
				'pinia',
				'element-plus',
				'@admin-panel/lib',
				'@admin-panel/i18n',
				'@tanstack/vue-query',
				'@element-plus/icons-vue',
			],
			output: {
				globals: {
					vue: 'Vue',
					pinia: 'Pinia',
					'element-plus': 'ElementPlus',
					'@admin-panel/lib': 'GpLib',
					'@admin-panel/i18n': 'GpI18n',
				},
			},
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
