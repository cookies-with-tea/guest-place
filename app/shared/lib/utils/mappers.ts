import type { CamelCasedProperties, SnakeCasedProperties } from '#shared/types'

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
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

      result[camelKey] = snakeToCamel(data[key])
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
      // Handle camelCase → snake_case
      const snakeKey = key.replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase()

      result[snakeKey] = camelToSnake(data[key])
    }
  }

  return result as SnakeCasedProperties<T>
}
