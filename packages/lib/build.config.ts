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
		'vite',
		'@vitejs/plugin-vue',
		'@originjs/vite-plugin-federation',
		'defu',
		'vue',
		'pinia',
	],
	failOnWarn: false,
})
