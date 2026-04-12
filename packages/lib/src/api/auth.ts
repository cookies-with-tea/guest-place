import { createApi } from './fetch'

const { fetchData } = createApi('auth')

export const authApi = {
	login: (data: any) =>
		fetchData<{
			access_token: string
			refresh_token: string
			access_expires_in: number
			refresh_expires_in: number
		}>('/login', { method: 'POST', body: data }),

	register: (data: any) => fetchData('/register', { method: 'POST', body: data }),

	refresh: (refreshToken: string) =>
		fetchData<{
			access_token: string
			refresh_token: string
		}>('/refresh', { method: 'POST', body: { refresh_token: refreshToken } }),

	logout: (refreshToken: string) => fetchData('/logout', { method: 'POST', body: { refresh_token: refreshToken } }),
}
