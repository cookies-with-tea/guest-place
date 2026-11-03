import { describe, expect, it } from 'vitest'

import { formatCurrency } from '../../utils/formatCurrency'

const normalizeSpaces = (s: string) => s.replace(/\s/g, ' ')

describe('formatCurrency', () => {
	it('formats a number as RUB by default', () => {
		expect(normalizeSpaces(formatCurrency(1999.5))).toBe('1 999,50 ₽')
	})

	it('formats zero', () => {
		expect(normalizeSpaces(formatCurrency(0))).toBe('0,00 ₽')
	})

	it('respects an explicit locale and currency', () => {
		expect(normalizeSpaces(formatCurrency(1999.5, 'en-US', 'USD'))).toBe('$1,999.50')
	})
})
