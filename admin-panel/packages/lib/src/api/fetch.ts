import { ElMessage } from 'element-plus'
import { $fetch, type FetchOptions } from 'ofetch'

import { useAuth } from '../composables/useAuth'
import type { CamelCasedProperties, IResponse, SnakeCasedProperties } from '../model'
import { camelToSnake, isBrowser, snakeToCamel } from '../utils'
import { tryRefresh } from './refresh'

type JsonFetchOptions = Omit<FetchOptions<'json', any>, 'body' | 'method'> & {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
	body?: Record<string, any>
	silent?: boolean
}

const PREFIX = '/api/v1'

export const createApi = (entityName: string) => {
	const baseUrl = `${PREFIX}/${entityName}`
	// Запросы самого /auth/* не должны пытаться "обновиться через refresh" — 401 на
	// /login значит неверный пароль, 401 на /refresh значит сам refresh_token истёк
	// (дальше пытаться нечем), 401 на /logout — сессии уже не будет в любом случае.
	const isAuthEntity = entityName === 'auth'

	const fetchData = async <T>(
		url: string,
		options?: JsonFetchOptions,
		isRetryAfterRefresh = false
	): Promise<IResponse<CamelCasedProperties<T>>> => {
		try {
			let body = undefined

			if (options?.body) {
				if (
					options.body instanceof FormData ||
					(typeof Blob !== 'undefined' && options.body instanceof Blob) ||
					(typeof ArrayBuffer !== 'undefined' &&
						(options.body instanceof ArrayBuffer || ArrayBuffer.isView(options.body)))
				) {
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
				// access_token/refresh_token живут только в HttpOnly-cookie
				// (server/src/auth/cookies.rs) — нет токена, который можно было бы положить
				// в заголовок Authorization, браузер сам шлёт cookie. credentials: 'include'
				// нужен явно, чтобы это работало и когда админка и сервер на разных портах
				// в dev (localhost:4173 -> localhost:8000 — разные origin).
				credentials: 'include',
				headers: options?.headers,
			})

			return snakeToCamel(response) as IResponse<CamelCasedProperties<T>>
		} catch (error: any) {
			if (error.statusCode === 401 && !isAuthEntity && !isRetryAfterRefresh && isBrowser) {
				const refreshed = await tryRefresh()

				if (refreshed) {
					return fetchData<T>(url, options, true)
				}
			}

			const errors = error.data?.errors ? snakeToCamel(error.data.errors) : {}
			const messages = error.data?.messages ? (snakeToCamel(error.data.messages) as string[]) : []

			if (error.statusCode === 401 || error.statusCode === 403) {
				if (isBrowser) {
					useAuth().clearAuth()
				}
			}

			if (!options?.silent && error.statusCode !== 401 && error.statusCode !== 403) {
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
