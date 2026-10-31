import { computed, ref } from 'vue'

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

export interface IAuthTokens {
	accessToken: string
}

function getStoredUser(): IAuthUser | null {
	if (!isBrowser) return null
	try {
		const raw = localStorage.getItem('gp_user')
		return raw ? JSON.parse(raw) : null
	} catch {
		return null
	}
}

const user = ref<IAuthUser | null>(getStoredUser())
const accessToken = ref<string | null>(isBrowser ? localStorage.getItem('gp_access_token') : null)

export function useAuth() {
	const isAuthenticated = computed(() => !!accessToken.value)

	const isAdmin = computed(() => user.value?.role === 'admin')

	// refresh_token больше не проходит через JS: сервер выставляет его как HttpOnly-cookie
	// (см. server/src/auth/cookies.rs) — читать и хранить его здесь уже нельзя и не нужно.
	const setTokens = (tokens: IAuthTokens) => {
		accessToken.value = tokens.accessToken

		if (isBrowser) {
			localStorage.setItem('gp_access_token', tokens.accessToken)
		}
	}

	const clearAuth = () => {
		user.value = null

		accessToken.value = null

		if (isBrowser) {
			localStorage.removeItem('gp_access_token')

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
		accessToken,
		isAuthenticated,
		isAdmin,
		setTokens,
		clearAuth,
		setUser,
	}
}
