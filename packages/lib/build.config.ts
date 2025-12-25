import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	clean: true,
	entries: ['./src/index', './src/constants', './src/utils'],
	declaration: true,
	rollup: {
		emitCJS: true,
	},
})
