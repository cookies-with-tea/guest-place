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
 * Injects mock authentication tokens and intercepts user/me endpoints
 * allowing headless E2E tests to run instantly without hitting live auth servers.
 */
export async function setupMockAuth(page: Page, user: MockUser = DEFAULT_MOCK_USER) {
	// 1. Pre-seed localStorage with tokens
	await page.addInitScript((mockUser) => {
		window.localStorage.setItem('gp_access_token', 'mock_jwt_access_token_12345')
		window.localStorage.setItem('gp_refresh_token', 'mock_jwt_refresh_token_67890')
		window.localStorage.setItem('gp_user', JSON.stringify(mockUser))
	}, user)

	// 2. Intercept /api/v1/user/me or auth validation requests
	await page.route('**/api/v1/user/me', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				data: {
					uuid: user.uuid,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
					status: 'active',
					permissions: ['*'],
				},
				errors: null,
				messages: null,
			}),
		})
	})

	// 3. Intercept MFE manifest
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

	// 4. Intercept features
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
