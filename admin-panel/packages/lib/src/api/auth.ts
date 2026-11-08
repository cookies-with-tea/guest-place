import { createApi } from './fetch'

const { fetchData } = createApi('auth')

export const authApi = {
	// access_token/refresh_token больше не приходят в теле ответа вообще — сервер
	// переносит оба в HttpOnly-cookie (gp_access_token/gp_refresh_token, см.
	// server/src/auth/cookies.rs); в данных остаются только метаданные их TTL.
	login: (data: any) =>
		fetchData<{
			access_expires_in: number
			refresh_expires_in: number
		}>('/login', { method: 'POST', body: data }),

	register: (data: any) => fetchData('/register', { method: 'POST', body: data }),

	// refresh_token не передаётся с фронта — сервер читает его из HttpOnly-cookie
	// (gp_refresh_token, выставленной на /login), credentials: 'include' в fetch.ts
	// гарантирует, что браузер её пришлёт.
	refresh: () =>
		fetchData<{
			access_expires_in: number
		}>('/refresh', { method: 'POST' }),

	logout: () => fetchData('/logout', { method: 'POST' }),
}
