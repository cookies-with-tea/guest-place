import { describe, expect, it } from 'vitest'

import { suggestTranslationKey } from '../lib/translationKey'

describe('suggestTranslationKey', () => {
	it('suggests counter 1 when the field has no keys yet', () => {
		expect(suggestTranslationKey('', 'venues', 'description')).toBe('venues.description.1')
	})

	it('suggests the next free counter after existing keys in the same field', () => {
		const content =
			'<span data-i18n-key="venues.description.1">a</span> text <span data-i18n-key="venues.description.2">b</span>'

		expect(suggestTranslationKey(content, 'venues', 'description')).toBe('venues.description.3')
	})

	it('ignores keys from a different namespace/field prefix', () => {
		const content = '{key:other.title.5}fallback{/key:other.title.5}'

		expect(suggestTranslationKey(content, 'venues', 'description')).toBe('venues.description.1')
	})
})
