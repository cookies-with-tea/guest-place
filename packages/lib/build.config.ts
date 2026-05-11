import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	clean: true,
	entries: ['./src/index', './src/api', './src/constants', './src/model', './src/utils', './src/vite'],
	declaration: true,
	rollup: {
		emitCJS: true,
	},
	externals: [
		'node:url',
		'node:path',
		'node:fs',
		'node:fs/promises',
		'node:module',
		'vite',
		'@vitejs/plugin-vue',
		'@originjs/vite-plugin-federation',
		'defu',
		'vue',
		'pinia',
		'vue-router',
		'element-plus',
		'@tanstack/vue-query',
		'rollup-plugin-visualizer',
		'unplugin-vue-components',
		'unplugin-element-plus',
		'unplugin-auto-import',
		'vite-plugin-compression',
	],
	failOnWarn: false,
})
