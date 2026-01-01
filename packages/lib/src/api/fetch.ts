import { $fetch, type FetchOptions } from 'ofetch'
import type { CamelCasedProperties, IResponse, SnakeCasedProperties } from '../model'
import { snakeToCamel, camelToSnake } from '../utils'

type JsonFetchOptions = Omit<FetchOptions<'json', any>, 'body' | 'method'> & {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, any>
}

const PREFIX = '/api/v1'

export const createApi = (entityName: string) => {
  const baseUrl = `${PREFIX}/${entityName}`

  const fetchData = async <T>(
    url: string,
    options?: JsonFetchOptions
  ): Promise<IResponse<CamelCasedProperties<T>>> => {
    try {
      let body = undefined

      if (options?.body) {
        if (options.body instanceof FormData) {
          body = options.body
        } else {
          body = camelToSnake(options.body as Record<string, any>)
        }
      }

      const response = await $fetch<IResponse<SnakeCasedProperties<T>>>(`${baseUrl}${url}`, {
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

  return {
    fetchData,
  }
}
