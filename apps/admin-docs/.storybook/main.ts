import type { StorybookConfig } from '@storybook/vue3-vite'

import { join, dirname, resolve } from 'path'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
	return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
	stories: ['../stories/*.stories.ts', '../stories/**/*.stories.ts'],

	addons: [
		getAbsolutePath('@chromatic-com/storybook'),
		getAbsolutePath('@storybook/addon-admin-docs'),
		getAbsolutePath('@storybook/addon-a11y'),
		getAbsolutePath('@storybook/addon-vitest'),
	],

	framework: {
		name: getAbsolutePath('@storybook/vue3-vite'),
		options: {},
	},

	core: {},

	async viteFinal(config) {
		return {
			...config,
			define: { 'process.env': {} },
			resolve: {
				alias: {
					'@admin-panel/ui': resolve(__dirname, '../../../packages/ui'),
				},
			},
		}
	},
}

export default config
