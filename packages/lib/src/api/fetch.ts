import { ElMessage } from 'element-plus'
import { $fetch, type FetchOptions } from 'ofetch'

import { useEvents } from '../composables/useEvents'
import { GP_EVENTS } from '../constants'
import type { CamelCasedProperties, IResponse, SnakeCasedProperties } from '../model'
import { camelToSnake, isBrowser, snakeToCamel } from '../utils'

const { dispatch } = useEvents()

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

			if (isBrowser) {
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
				if (isBrowser) {
					localStorage.removeItem('gp_access_token')

					localStorage.removeItem('gp_refresh_token')

					const notCanceled = dispatch(GP_EVENTS.UNAUTHORIZED, {
						pathname: window.location.pathname,
						port: window.location.port,
					})

					// Only redirect if not canceled and we are likely in the Shell (port 4173) or on a path that expects /login
					if (notCanceled && !window.location.pathname.startsWith('/login')) {
						// In standalone MFEs (like port 4183), we don't want to redirect to a non-existent /login
						// Instead, we let the UI (UiAuthGuard) handle the state change
						if (window.location.port === '4173' || window.location.port === '5173') {
							window.location.href = '/login'
						}
					}
				}
			}

			if (error.statusCode !== 401 && error.statusCode !== 403) {
				const message = messages[0] || error.message || 'Network error'

				ElMessage.error(message)
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
