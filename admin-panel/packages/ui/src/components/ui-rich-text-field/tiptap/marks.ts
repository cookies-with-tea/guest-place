import { Mark, mergeAttributes } from '@tiptap/core'

/**
 * Binds a span of text to a translation key. The wrapped text is the fallback
 * shown until the key resolves from the i18n dictionary. Bridges to the
 * `{key:namespace.key}fallback{/key:namespace.key}` tag format via
 * translationToHtml/htmlToTranslation in @admin-panel/i18n.
 */
export interface TranslationKeyMarkOptions {
	HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		translationKey: {
			/**
			 * Binds the current selection to a translation key.
			 * @example editor.commands.setTranslationKey('page.title')
			 */
			setTranslationKey: (key: string) => ReturnType
			/**
			 * Removes the translation key binding, keeping the text as-is.
			 * @example editor.commands.unsetTranslationKey()
			 */
			unsetTranslationKey: () => ReturnType
		}
	}
}

export const TranslationKeyMark = Mark.create<TranslationKeyMarkOptions>({
	name: 'translationKey',

	addOptions() {
		return {
			HTMLAttributes: {},
		}
	},

	addAttributes() {
		return {
			key: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-i18n-key'),
				renderHTML: (attributes) => {
					if (!attributes.key) return {}

					return { 'data-i18n-key': attributes.key }
				},
			},
		}
	},

	parseHTML() {
		return [{ tag: 'span.gp-i18n-key[data-i18n-key]' }]
	},

	renderHTML({ HTMLAttributes }) {
		return ['span', mergeAttributes({ class: 'gp-i18n-key' }, this.options.HTMLAttributes, HTMLAttributes), 0]
	},

	addCommands() {
		return {
			setTranslationKey:
				(key: string) =>
				({ commands }) => {
					return commands.setMark(this.name, { key })
				},
			unsetTranslationKey:
				() =>
				({ commands }) => {
					return commands.unsetMark(this.name)
				},
		}
	},
})

/**
 * Marks a span of text as excluded from any future bulk/machine translation of
 * the surrounding field (e.g. brand names, numbers). Bridges to the
 * `{nontranslatable}literal{/nontranslatable}` tag format.
 */
declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		nonTranslatable: {
			/**
			 * Marks the current selection as non-translatable.
			 * @example editor.commands.setNonTranslatable()
			 */
			setNonTranslatable: () => ReturnType
			/**
			 * Removes the non-translatable marking, keeping the text as-is.
			 * @example editor.commands.unsetNonTranslatable()
			 */
			unsetNonTranslatable: () => ReturnType
		}
	}
}

export interface NonTranslatableMarkOptions {
	HTMLAttributes: Record<string, any>
}

export const NonTranslatableMark = Mark.create<NonTranslatableMarkOptions>({
	name: 'nonTranslatable',

	addOptions() {
		return {
			HTMLAttributes: {},
		}
	},

	parseHTML() {
		return [{ tag: 'span.gp-i18n-literal' }]
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'span',
			mergeAttributes(
				{ class: 'gp-i18n-literal', 'data-gp-literal': 'true' },
				this.options.HTMLAttributes,
				HTMLAttributes
			),
			0,
		]
	},

	addCommands() {
		return {
			setNonTranslatable:
				() =>
				({ commands }) => {
					return commands.setMark(this.name)
				},
			unsetNonTranslatable:
				() =>
				({ commands }) => {
					return commands.unsetMark(this.name)
				},
		}
	},
})
