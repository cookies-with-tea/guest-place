import { describe, expect, it, vi } from 'vitest'

import {
	preloadContentTranslations,
	resolveContentHtml,
	resolveContentText,
	resolveContentTranslation,
	resolveContentTree,
} from '../useContentI18n'

// useContentI18n calls the Nuxt-auto-imported global `$fetch`, which doesn't exist outside a
// Nuxt runtime — stub it to return a fixed dictionary per namespace for preloadContentTranslations.
const dictionaries: Record<string, Record<string, string>> = {
	venuestest: { 'venuestest.title.1': 'Переведённый заголовок' },
}

vi.stubGlobal(
	'$fetch',
	vi.fn((url: string) => {
		const namespace = url.split('/').pop() || ''

		return Promise.resolve(dictionaries[namespace] || {})
	})
)

describe('resolveContentText', () => {
	it('resolves a {key:...} tag to the dictionary value once preloaded', async () => {
		await preloadContentTranslations({ title: '{key:venuestest.title.1}Крыша{/key:venuestest.title.1}' })

		expect(resolveContentText('{key:venuestest.title.1}Крыша{/key:venuestest.title.1}')).toBe('Переведённый заголовок')
	})

	it('falls back to the embedded text when the key is not in the dictionary', async () => {
		await preloadContentTranslations({ title: '{key:venuestest.missing}Запасной текст{/key:venuestest.missing}' })

		expect(resolveContentText('{key:venuestest.missing}Запасной текст{/key:venuestest.missing}')).toBe(
			'Запасной текст'
		)
	})

	it('unwraps {nontranslatable}', () => {
		expect(resolveContentText('{nontranslatable}GuestPlace{/nontranslatable}')).toBe('GuestPlace')
	})

	it('formats {currency:N}', () => {
		expect(resolveContentText('Цена: {currency:1990.5}')).toBe(`Цена: ${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(1990.5)}`)
	})

	it('replaces {br} with a space (plain-text result)', () => {
		expect(resolveContentText('Строка один{br}Строка два')).toBe('Строка один Строка два')
	})

	it('leaves plain text untouched', () => {
		expect(resolveContentText('Обычный текст без тегов')).toBe('Обычный текст без тегов')
	})

	it('passes through empty/falsy input', () => {
		expect(resolveContentText('')).toBe('')
	})
})

describe('resolveContentHtml', () => {
	it('resolves a TranslationKeyMark span to the dictionary value once preloaded', async () => {
		const html = '<p>Цена <span class="gp-i18n-key" data-i18n-key="venuestest.title.1">товара</span></p>'

		await preloadContentTranslations(html)

		expect(resolveContentHtml(html)).toBe('<p>Цена Переведённый заголовок</p>')
	})

	it('unwraps a non-translatable literal span', () => {
		const html = '<p><span class="gp-i18n-literal" data-gp-literal="true">GuestPlace</span></p>'

		expect(resolveContentHtml(html)).toBe('<p>GuestPlace</p>')
	})

	it('formats a currency chip span', () => {
		const html = '<span class="gp-currency-chip" data-slot="currency:1990.5" contenteditable="false">{currency:1990.5}</span>'

		expect(resolveContentHtml(html)).toBe(
			new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(1990.5)
		)
	})
})

describe('resolveContentTree', () => {
	it('recursively resolves tag-format strings in nested objects and arrays without touching other fields', async () => {
		const data = {
			title: '{key:venuestest.title.1}Крыша{/key:venuestest.title.1}',
			phone: '+7 (495) 123 78 90',
			nested: { subtitle: '{nontranslatable}GuestPlace{/nontranslatable}' },
			items: [{ label: 'Обычный текст' }],
		}

		await preloadContentTranslations(data)

		const resolved = resolveContentTree(data)

		expect(resolved.title).toBe('Переведённый заголовок')

		expect(resolved.phone).toBe('+7 (495) 123 78 90')

		expect(resolved.nested.subtitle).toBe('GuestPlace')

		expect(resolved.items[0]!.label).toBe('Обычный текст')
	})

	it('does not mutate the original data', async () => {
		const data = { title: '{key:venuestest.title.1}Крыша{/key:venuestest.title.1}' }

		await preloadContentTranslations(data)

		resolveContentTree(data)

		expect(data.title).toBe('{key:venuestest.title.1}Крыша{/key:venuestest.title.1}')
	})
})

describe('resolveContentTranslation (legacy $t() format)', () => {
	it('resolves a known key and falls back to the bare key otherwise', async () => {
		await preloadContentTranslations({ title: "$t('venuestest.title.1')" })

		expect(resolveContentTranslation('venuestest.title.1')).toBe('Переведённый заголовок')

		expect(resolveContentTranslation('venuestest.unknown')).toBe('venuestest.unknown')
	})
})
