import { computed, ref } from 'vue'
import { ofetch } from 'ofetch'

import { tryRefresh } from '../api/refresh'
import { GP_EVENTS } from '../constants'
import { isBrowser } from '../utils'

import { useEvents } from './useEvents'

const { dispatch } = useEvents()

export interface IAuthUser {
	uuid: string
	email: string
	role: 'user' | 'admin' | 'moderator'
	firstName?: string
	lastName?: string
}

// access_token/refresh_token живут только в HttpOnly-cookie (server/src/auth/cookies.rs) —
// JS не может ни прочитать, ни хранить их (см. IMPROVEMENTS.md). isAuthenticated больше не
// производная от значения токена — это отдельный реактивный флаг, который выставляется
// явно: `checkAuth()` на старте приложения (единственный способ узнать, есть ли валидная
// cookie-сессия, раз её саму прочитать нельзя) и на login/logout/401.
const user = ref<IAuthUser | null>(null)
const isAuthenticated = ref(false)
// true once checkAuth() has resolved at least once — отличает "ещё не знаем" от
// "точно не авторизован", чтобы UiAuthGuard/роут-guard не мигали логин-формой на старте.
const authChecked = ref(false)

export function useAuth() {
	const isAdmin = computed(() => user.value?.role === 'admin')

	const mapUser = (data: any): IAuthUser => ({
		uuid: data.uuid,
		email: data.email,
		role: data.role,
		firstName: data.first_name,
		lastName: data.last_name,
	})

	const fetchMe = () => ofetch<{ data: any }>('/api/v1/user/me', { credentials: 'include' })

	/**
	 * Единственный способ узнать, валидна ли cookie-сессия — спросить сервер. На старте
	 * приложения (перезагрузка страницы после >10 минут простоя — TTL access_token) это
	 * почти всегда первый запрос, который видит истёкший токен: без попытки обновиться
	 * через ещё живой refresh_token (24ч) пользователь терял бы сессию на каждом reload,
	 * хотя силент-рефреш в fetch.ts для остальных запросов это уже не допускает.
	 */
	const checkAuth = async (): Promise<boolean> => {
		if (!isBrowser) return false

		try {
			const res = await fetchMe()

			if (res?.data) {
				user.value = mapUser(res.data)
			}

			isAuthenticated.value = true

			return true
		} catch (err: any) {
			if (err?.statusCode === 401) {
				const refreshed = await tryRefresh()

				if (refreshed) {
					try {
						const res = await fetchMe()

						if (res?.data) {
							user.value = mapUser(res.data)
						}

						isAuthenticated.value = true

						return true
					} catch {
						// falls through to the unauthenticated branch below
					}
				}
			}

			user.value = null
			isAuthenticated.value = false

			return false
		} finally {
			authChecked.value = true
		}
	}

	const clearAuth = () => {
		user.value = null

		isAuthenticated.value = false

		if (isBrowser) {
			const notCanceled = dispatch(GP_EVENTS.UNAUTHORIZED, {
				pathname: window.location.pathname,
				port: window.location.port,
			})

			if (notCanceled && !window.location.pathname.startsWith('/login')) {
				if (window.location.port === '4173' || window.location.port === '5173') {
					window.location.href = '/login'
				}
			}
		}
	}

	const setUser = (userData: IAuthUser) => {
		user.value = userData
	}

	return {
		user,
		isAuthenticated,
		authChecked,
		isAdmin,
		checkAuth,
		clearAuth,
		setUser,
	}
}
