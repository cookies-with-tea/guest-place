import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { fileURLToPath } from 'node:url'
import svgSpriteInlinePlugin from './vite-svg-sprite-inline-plugin.ts'

export default defineConfig({
	base: 'http://localhost:6003/',
	plugins: [
		vue(),
		federation({
			name: '@admin-panel/ui',
			filename: 'remoteEntry.js',
			exposes: {
				components: './index.ts',
				styles: './assets/styles/index.scss',
			},
			shared: ['vue'],
		}),
		svgSpriteInlinePlugin({
			inputDir: 'assets/icons',
			outputTs: 'src/ui-icon/sprite/sprite.ts',
			prefix: 'icon',
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			public: fileURLToPath(new URL('./public', import.meta.url)),
		},
	},
	assetsInclude: ['**/*.svg', 'public/**/*.svg'],
	build: {
		target: 'esnext',
		minify: false,
		cssCodeSplit: false,
		assetsDir: 'assets',
	},
	server: {
		port: 6003,
		cors: true,
	},
})
