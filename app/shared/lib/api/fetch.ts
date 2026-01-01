import { $fetch, type FetchOptions } from 'ofetch'
import type { IResponse } from '#shared/interfaces'
import { snakeToCamel, camelToSnake } from '#shared/lib/utils'
import type { CamelCasedProperties, SnakeCasedProperties } from '#shared/types'

type JsonFetchOptions = Omit<FetchOptions<'json', any>, 'body' | 'method'> & {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, any>
}

export const fetchData = async <T>(
  url: string,
  options?: JsonFetchOptions
): Promise<IResponse<CamelCasedProperties<T>>> => {
  try {
    const body = options?.body ? camelToSnake(options.body) : undefined

    const response = await $fetch<IResponse<SnakeCasedProperties<T>>>(url, {
      ...options,
      body,
      responseType: 'json',
    })

    return snakeToCamel(response) as IResponse<CamelCasedProperties<T>>
  } catch (error: any) {
    const errors = error.data?.errors ? snakeToCamel(error.data.errors) : {}
    const messages = error.data?.messages ? snakeToCamel(error.data.messages) : []

    if (error.statusCode === 500) {
      // TODO: Need to think about error handling
      console.error('[fetchData] Server error: ', error)
    }

    throw {
      errors,
      messages,
      status: error.status,
      original: error,
    }
  }
}
