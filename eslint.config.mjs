import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pluginCypress from 'eslint-plugin-cypress'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
	{
		name: 'app/files-to-lint',
		files: ['**/*.{ts,mts,tsx,vue}'],
	},

	globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

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
	},

	{
		...pluginCypress.configs.recommended,
		files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
	},
	skipFormatting
)
