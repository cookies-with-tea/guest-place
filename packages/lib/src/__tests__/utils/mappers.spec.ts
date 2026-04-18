import { describe, it, expect } from 'vitest'
import { snakeToCamel, camelToSnake } from '../../utils/mappers'

describe('mappers', () => {
	describe('snakeToCamel', () => {
		it('should convert snake_case keys to camelCase', () => {
			const input = {
				first_name: 'John',
				last_name: 'Doe',
				user_profile: {
					birth_date: '1990-01-01',
					city_name: 'New York',
				},
			}
			const expected = {
				firstName: 'John',
				lastName: 'Doe',
				userProfile: {
					birthDate: '1990-01-01',
					cityName: 'New York',
				},
			}

			expect(snakeToCamel(input)).toEqual(expected)
		})

		it('should handle arrays of objects', () => {
			const input = [
				{ user_id: 1, user_name: 'user1' },
				{ user_id: 2, user_name: 'user2' },
			]
			const expected = [
				{ userId: 1, userName: 'user1' },
				{ userId: 2, userName: 'user2' },
			]

			expect(snakeToCamel(input)).toEqual(expected)
		})

		it('should handle non-object values', () => {
			expect(snakeToCamel(null)).toBe(null)

			expect(snakeToCamel(123)).toBe(123)

			expect(snakeToCamel('string')).toBe('string')
		})
	})

	describe('camelToSnake', () => {
		it('should convert camelCase keys to snake_case', () => {
			const input = {
				firstName: 'John',
				lastName: 'Doe',
				userProfile: {
					birthDate: '1990-01-01',
					cityName: 'New York',
				},
			}
			const expected = {
				first_name: 'John',
				last_name: 'Doe',
				user_profile: {
					birth_date: '1990-01-01',
					city_name: 'New York',
				},
			}

			expect(camelToSnake(input)).toEqual(expected)
		})

		it('should handle arrays of objects', () => {
			const input = [
				{ userId: 1, userName: 'user1' },
				{ userId: 2, userName: 'user2' },
			]
			const expected = [
				{ user_id: 1, user_name: 'user1' },
				{ user_id: 2, user_name: 'user2' },
			]

			expect(camelToSnake(input)).toEqual(expected)
		})
	})
})
