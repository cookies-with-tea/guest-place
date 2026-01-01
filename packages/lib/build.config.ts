import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	clean: true,
	entries: [
		'./src/index',
		'./src/api',
		'./src/constants',
		'./src/model',
		'./src/utils',
	],
	declaration: true,
	rollup: {
		emitCJS: true,
	},
})
