import type { CamelCasedProperties, SnakeCasedProperties } from '../model'

const toCamel = (s: string) => s.replace(/([a-z0-9])_([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
const toSnake = (s: string) => s.replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase()

export const snakeToCamel = <T extends Record<string, any>>(data: T): CamelCasedProperties<T> => {
	if (data === null || typeof data !== 'object') {
		return data as CamelCasedProperties<T>
	}

	if (Array.isArray(data)) {
		return data.map((item) => snakeToCamel(item)) as CamelCasedProperties<T>
	}

	const result: Record<string, any> = {}

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			// Only convert underscores that are preceded by a character (ignore leading underscores)
			const camelKey = toCamel(key)
			let value = data[key]

			// Special case: convert values of 'name' and 'slug' to camelCase for frontend consistency
			if (typeof value === 'string' && (camelKey === 'name' || camelKey === 'slug')) {
				value = toCamel(value)
			} else {
				value = snakeToCamel(value)
			}

			;(result as any)[camelKey] = value
		}
	}

	return result as CamelCasedProperties<T>
}

export const camelToSnake = <T extends Record<string, any>>(data: T): SnakeCasedProperties<T> => {
	if (data === null || typeof data !== 'object') {
		return data as SnakeCasedProperties<T>
	}

	if (Array.isArray(data)) {
		return data.map((item) => camelToSnake(item)) as SnakeCasedProperties<T>
	}

	const result: Record<string, any> = {}

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			// Convert camelCase to snake_case, but keep leading underscore if present
			const baseKey = key.startsWith('_') ? key.slice(1) : key
			const snakeKey = toSnake(baseKey)
			const finalKey = key.startsWith('_') ? `_${snakeKey}` : snakeKey
			let value = data[key]

			// Special case: convert values of 'name' and 'slug' back to snake_case for backend
			if (typeof value === 'string' && (key === 'name' || key === 'slug')) {
				value = toSnake(value)
			} else {
				value = camelToSnake(value)
			}

			;(result as any)[finalKey] = value
		}
	}

	return result as SnakeCasedProperties<T>
}
