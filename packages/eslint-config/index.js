import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import storybook from 'eslint-plugin-storybook'

import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'

// @ts-ignore
import pluginCypress from 'eslint-plugin-cypress'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
	{
		name: 'app/files-to-lint',
		files: ['**/*.{ts,mts,tsx,vue}'],
	},

	globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/storybook-static/**']),

	pluginVue.configs['flat/essential'],
	vueTsConfigs.recommended,
	{
		files: ['**/*.{js,ts,jsx,tsx,vue}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		rules: {
			semi: ['error', 'never'],
			quotes: ['error', 'single'],
			'no-useless-constructor': 'off',
			'linebreak-style': ['error', 'unix'],
			'object-curly-spacing': ['error', 'always', { objectsInObjects: true }],

			'padding-line-between-statements': [
				'warn',
				{ blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
				{ blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
				{ blankLine: 'always', prev: '*', next: 'return' },
				{ blankLine: 'always', prev: '*', next: 'block-like' },
				{ blankLine: 'always', prev: 'multiline-block-like', next: '*' },
				{ blankLine: 'always', prev: 'block-like', next: '*' },
				{ blankLine: 'always', prev: 'expression', next: '*' },
				{ blankLine: 'always', prev: '*', next: 'block' },
				{ blankLine: 'always', prev: 'block', next: '*' },
				{ blankLine: 'any', prev: 'cjs-import', next: 'cjs-import' },
				{ blankLine: 'any', prev: 'import', next: 'import' },
				{ blankLine: 'always', prev: '*', next: 'export' },
				{ blankLine: 'always', prev: 'export', next: '*' },
				{ blankLine: 'always', prev: '*', next: 'function' },
				{ blankLine: 'always', prev: 'try', next: '*' },
			],

			'@typescript-eslint/consistent-type-imports': 'error',

			'max-len': [
				'error',
				{
					code: 120,
					tabWidth: 2,
					ignoreComments: true,
					ignoreTrailingComments: true,
					ignoreUrls: true,
				},
			],

			// Vue rules
			'vue/no-v-html': 'off',
			'vue/multi-word-component-names': 'off',
			'vue/require-default-prop': 'off',
			'vue/no-side-effects-in-computed-properties': 'off',
			'vue/object-curly-spacing': ['error', 'always', { objectsInObjects: true }],
			'vue/component-name-in-template-casing': ['error', 'PascalCase', { ignores: [] }],
			'vue/v-on-event-hyphenation': ['error', 'always', { ignore: ['update:modelValue'] }],
			'vue/padding-line-between-blocks': ['warn', 'always'],

			'vue/html-self-closing': [
				'error',
				{
					html: { void: 'any', normal: 'always', component: 'always' },
					svg: 'always',
					math: 'always',
				},
			],

			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},

	{
		...pluginVitest.configs.recommended,
		files: ['src/**/__tests__/*'],
		rules: {
      ...pluginVitest.configs.recommended.rules,
    },
		settings: {
      vitest: {
        typecheck: true,
      },
    },
		languageOptions: {
      globals: {
        ...pluginVitest.environments.env.globals,
      },
    },
	},

	{
		...storybook.configs.recommended,
		files: ['src/**/*.stories.{js,jsx,ts,tsx}'],
	},

	{
		...pluginCypress.configs.recommended,
		files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
		extends: [
      pluginCypress.configs.globals,
    ],
	},
	skipFormatting
)
