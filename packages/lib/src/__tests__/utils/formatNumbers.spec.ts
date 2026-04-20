import { describe, expect, it } from 'vitest'

import { formatNumbers } from '../../utils/formatNumbers'

describe('formatNumbers', () => {
	it('should double the numbers in the array', () => {
		const input = [1, 2, 3]
		const expected = [2, 4, 6]

		expect(formatNumbers(input)).toEqual(expected)
	})

	it('should return an empty array if input is empty', () => {
		expect(formatNumbers([])).toEqual([])
	})

	it('should handle zero and negative numbers', () => {
		expect(formatNumbers([0, -1, 5])).toEqual([0, -2, 10])
	})
})
