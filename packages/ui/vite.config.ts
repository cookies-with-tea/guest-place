import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
// import ViteSvgSpriteWrapper from 'vite-svg-sprite-wrapper'
import { fileURLToPath } from 'node:url'
import svgSpriteInlinePlugin from './vite-svg-sprite-inline-plugin.ts'

export default defineConfig({
	base: 'http://localhost:3003/',
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
		// ViteSvgSpriteWrapper({
		//   icons: './assets/icons/*.svg',
		//   outputDir: 'public/assets/icons',
		//   generateType: true,
		//   typeName: 'IconNamesType',
		//   typeFileName: 'iconTypes',
		//   typeOutputDir: './src/ui-icon/types',
		// })
		svgSpriteInlinePlugin({
			inputDir: 'assets/icons',
			outputTs: 'src/generated/sprite.ts',
			prefix: 'icon', // опционально
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
		port: 3003,
		cors: true,
	},
})
