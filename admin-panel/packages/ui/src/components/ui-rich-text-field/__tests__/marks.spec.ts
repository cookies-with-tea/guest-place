import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'

import { htmlToTranslation, translationToHtml } from '@admin-panel/i18n'

import { NonTranslatableMark, TranslationKeyMark } from '../tiptap/marks'

const createEditor = (content = '') =>
	new Editor({
		extensions: [StarterKit, TranslationKeyMark, NonTranslatableMark],
		content,
	})

describe('TranslationKeyMark', () => {
	it('wraps a selection with a key-bound span via setTranslationKey', () => {
		const editor = createEditor('<p>Hello world</p>')

		editor.commands.setTextSelection({ from: 1, to: 6 }) // "Hello"
		editor.commands.setTranslationKey('greeting.hello')

		expect(editor.getHTML()).toContain('data-i18n-key="greeting.hello"')

		expect(editor.isActive('translationKey', { key: 'greeting.hello' })).toBe(true)

		editor.destroy()
	})

	it('round-trips through the i18n tag format via translationToHtml/htmlToTranslation', () => {
		const template = 'Цена {key:catalog.price_label}товара{/key:catalog.price_label} и остальное'
		const html = translationToHtml(template)

		const editor = createEditor(html)

		expect(editor.getHTML()).toContain('data-i18n-key="catalog.price_label"')

		expect(htmlToTranslation(editor.getHTML())).toBe(template)

		editor.destroy()
	})

	it('unsetTranslationKey removes the binding and keeps the text', () => {
		const editor = createEditor('<p><span class="gp-i18n-key" data-i18n-key="a.b">text</span></p>')

		editor.commands.setTextSelection({ from: 1, to: 5 })
		editor.commands.unsetTranslationKey()

		expect(editor.getHTML()).not.toContain('data-i18n-key')

		expect(editor.getText()).toBe('text')

		editor.destroy()
	})
})

describe('NonTranslatableMark', () => {
	it('wraps a selection as non-translatable via setNonTranslatable', () => {
		const editor = createEditor('<p>GuestPlace is great</p>')

		editor.commands.setTextSelection({ from: 1, to: 11 }) // "GuestPlace"
		editor.commands.setNonTranslatable()

		expect(editor.getHTML()).toContain('gp-i18n-literal')

		expect(editor.isActive('nonTranslatable')).toBe(true)

		editor.destroy()
	})

	it('round-trips through the i18n tag format via translationToHtml/htmlToTranslation', () => {
		const template = 'Бренд {nontranslatable}GuestPlace{/nontranslatable} навсегда'
		const html = translationToHtml(template)

		const editor = createEditor(html)

		expect(editor.getHTML()).toContain('gp-i18n-literal')

		expect(htmlToTranslation(editor.getHTML())).toBe(template)

		editor.destroy()
	})
})
