import { createApi } from './fetch'

const { fetchData } = createApi('auth')

export const authApi = {
	login: (data: any) =>
		fetchData<{
			access_token: string
			access_expires_in: number
			refresh_expires_in: number
		}>('/login', { method: 'POST', body: data }),

	register: (data: any) => fetchData('/register', { method: 'POST', body: data }),

	// refresh_token больше не передаётся с фронта — сервер читает его из HttpOnly-cookie
	// (gp_refresh_token, выставленной на /login), credentials: 'include' в fetch.ts
	// гарантирует, что браузер её пришлёт.
	refresh: () =>
		fetchData<{
			access_token: string
		}>('/refresh', { method: 'POST' }),

	logout: () => fetchData('/logout', { method: 'POST' }),
}
