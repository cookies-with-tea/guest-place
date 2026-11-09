import { $fetch } from 'ofetch'

const PREFIX = '/api/v1'

// access_token живёт в HttpOnly-cookie с TTL 10 минут (см. server/src/auth/cookies.rs).
// Вынесено в отдельный модуль без зависимостей от createApi/useAuth, чтобы и fetch.ts
// (401 на обычный запрос), и useAuth.ts (checkAuth() на бутстрапе/reload) могли звать
// один и тот же дедуплицированный refresh, не создавая цикл импортов между ними.
let refreshPromise: Promise<boolean> | null = null

/** Если несколько мест словят истёкший access_token одновременно, все дождутся ОДНОГО
 *  вызова /refresh, а не зашлют по одному каждый. */
export const tryRefresh = (): Promise<boolean> => {
	if (!refreshPromise) {
		refreshPromise = $fetch(`${PREFIX}/auth/refresh`, {
			method: 'POST',
			credentials: 'include',
		})
			.then(() => true)
			.catch(() => false)
			.finally(() => {
				refreshPromise = null
			})
	}

	return refreshPromise
}
