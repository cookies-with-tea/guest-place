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
	refreshToken: string
}

const user = ref<IAuthUser | null>(null)
const accessToken = ref<string | null>(isBrowser ? localStorage.getItem('gp_access_token') : null)
const refreshToken = ref<string | null>(isBrowser ? localStorage.getItem('gp_refresh_token') : null)

export function useAuth() {
	const isAuthenticated = computed(() => !!accessToken.value)

	const isAdmin = computed(() => user.value?.role === 'admin')

	const setTokens = (tokens: IAuthTokens) => {
		accessToken.value = tokens.accessToken

		refreshToken.value = tokens.refreshToken

		if (isBrowser) {
			localStorage.setItem('gp_access_token', tokens.accessToken)

			localStorage.setItem('gp_refresh_token', tokens.refreshToken)
		}
	}

	const clearAuth = () => {
		user.value = null

		accessToken.value = null

		refreshToken.value = null

		if (isBrowser) {
			localStorage.removeItem('gp_access_token')

			localStorage.removeItem('gp_refresh_token')

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
		refreshToken,
		isAuthenticated,
		isAdmin,
		setTokens,
		clearAuth,
		setUser,
	}
}
