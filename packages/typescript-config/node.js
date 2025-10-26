export default {
	extends: './base.json',
	compilerOptions: {
		composite: true,
		tsBuildInfoFile: './node_modules/.tmp/tsconfig.node.tsbuildinfo',
		module: 'ESNext',
		moduleResolution: 'Node',
		types: ['node'],
	},
	include: ['vite.config.*', 'vitest.config.*', 'cypress.config.*', 'nightwatch.conf.*', 'playwright.config.*'],
	exclude: ['node_modules', 'dist'],
}
