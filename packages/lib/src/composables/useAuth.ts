import { computed, ref } from 'vue'

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
const accessToken = ref<string | null>(
	typeof localStorage !== 'undefined' ? localStorage.getItem('gp_access_token') : null
)
const refreshToken = ref<string | null>(
	typeof localStorage !== 'undefined' ? localStorage.getItem('gp_refresh_token') : null
)

export function useAuth() {
	const isAuthenticated = computed(() => !!accessToken.value)

	const isAdmin = computed(() => user.value?.role === 'admin')

	const setTokens = (tokens: IAuthTokens) => {
		accessToken.value = tokens.accessToken

		refreshToken.value = tokens.refreshToken

		localStorage.setItem('gp_access_token', tokens.accessToken)

		localStorage.setItem('gp_refresh_token', tokens.refreshToken)
	}

	const clearAuth = () => {
		user.value = null

		accessToken.value = null

		refreshToken.value = null

		localStorage.removeItem('gp_access_token')

		localStorage.removeItem('gp_refresh_token')

		// Redirect to login if in a browser
		if (typeof window !== 'undefined') {
			const event = new CustomEvent('auth:unauthorized', { cancelable: true })
			const notCanceled = window.dispatchEvent(event)

			if (notCanceled && !window.location.pathname.startsWith('/login')) {
				window.location.href = '/login'
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
