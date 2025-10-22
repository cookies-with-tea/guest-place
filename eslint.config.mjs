// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import vue from 'eslint-plugin-vue'

export default withNuxt([
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.vue'],

		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
			globals: {
				process: true,
			},
		},

		plugins: {
			vue,
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

	eslintConfigPrettier,
])
