import { $fetch, type FetchOptions } from 'ofetch'

import type { CamelCasedProperties, IResponse, SnakeCasedProperties } from '../model'
import { camelToSnake, snakeToCamel } from '../utils'

type JsonFetchOptions = Omit<FetchOptions<'json', any>, 'body' | 'method'> & {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
	body?: Record<string, any>
}

const PREFIX = '/api/v1'

export const createApi = (entityName: string) => {
	const baseUrl = `${PREFIX}/${entityName}`

	const fetchData = async <T>(url: string, options?: JsonFetchOptions): Promise<IResponse<CamelCasedProperties<T>>> => {
		try {
			let body = undefined
			let token = ''

			if (typeof localStorage !== 'undefined') {
				token = localStorage.getItem('gp_access_token') ?? ''
			}

			if (options?.body) {
				if (options.body instanceof FormData) {
					body = options.body
				} else {
					body = camelToSnake(options.body as Record<string, any>)
				}
			}

			let params = options?.params

			if (params && !(params instanceof URLSearchParams)) {
				params = camelToSnake(params as Record<string, any>)
			}

			const response = await $fetch<IResponse<SnakeCasedProperties<T>>>(`${baseUrl}${url}`, {
				...options,
				method: options?.method || 'GET',
				body,
				params,
				responseType: 'json',
				headers: {
					...options?.headers,
					Authorization: token ? `Bearer ${token}` : '',
				},
			})

			return snakeToCamel(response) as IResponse<CamelCasedProperties<T>>
		} catch (error: any) {
			const errors = error.data?.errors ? snakeToCamel(error.data.errors) : {}
			const messages = error.data?.messages ? snakeToCamel(error.data.messages) : []

			if (error.statusCode === 401 || error.statusCode === 403) {
				if (typeof window !== 'undefined') {
					localStorage.removeItem('gp_access_token')

					localStorage.removeItem('gp_refresh_token')

					const event = new CustomEvent('auth:unauthorized', { cancelable: true })
					const notCanceled = window.dispatchEvent(event)

					if (notCanceled && !window.location.pathname.startsWith('/login')) {
						window.location.href = '/login'
					}
				}
			}

			if (error.statusCode === 500) {
				// eslint-disable-next-line no-console
				console.error('[fetchData] Server error: ', error)
			}

			throw {
				errors,
				messages,
				status: error.statusCode || error.status,
				original: error,
			}
		}
	}

	return {
		fetchData,
	}
}
