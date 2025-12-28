import type { CamelCasedProperties } from '#shared/types'

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
