import type { Page } from '@playwright/test'

export interface MockUser {
	uuid: string
	email: string
	role: 'admin' | 'user'
	firstName: string
	lastName: string
}

export const DEFAULT_MOCK_USER: MockUser = {
	uuid: '11111111-1111-1111-1111-111111111111',
	email: 'admin@guestplace.local',
	role: 'admin',
	firstName: 'Иван',
	lastName: 'Администратор',
}

/**
 * Intercepts user/me and other boot-time endpoints allowing headless E2E tests to run
 * instantly without hitting live auth servers. access_token/refresh_token live only in
 * HttpOnly-cookie now (server/src/auth/cookies.rs) — the app has no token to read from
 * localStorage, it determines isAuthenticated purely from whether /api/v1/user/me
 * succeeds, which this intercepts unconditionally.
 */
export async function setupMockAuth(page: Page, user: MockUser = DEFAULT_MOCK_USER) {
	// 1. Intercept /api/v1/user/me or auth validation requests — field names (snake_case)
	// match the real server response shape (useAuth.checkAuth() reads this directly, not
	// through createApi's snake_to_camel conversion).
	await page.route('**/api/v1/user/me', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				data: {
					uuid: user.uuid,
					email: user.email,
					first_name: user.firstName,
					last_name: user.lastName,
					role: user.role,
					status: 'active',
					permissions: ['*'],
				},
				errors: null,
				messages: null,
			}),
		})
	})

	// 2. Intercept MFE manifest
	await page.route('**/api/v1/mfe/manifest', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				data: {
					remotes: [],
				},
			}),
		})
	})

	// 3. Intercept features
	await page.route('**/api/v1/features', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				data: [],
			}),
		})
	})
}
