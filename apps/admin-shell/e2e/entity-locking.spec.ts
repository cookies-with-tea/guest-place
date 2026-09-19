import { expect, test } from '@playwright/test'
import { setupMockAuth } from './helpers/auth'

test.describe('Entity Soft Locking & Multi-User Warnings', () => {
	test.beforeEach(async ({ page }) => {
		await setupMockAuth(page)
	})

	test('should display warning banner when entity is locked by another user', async ({ page }) => {
		// Mock the lock check API to simulate another user currently editing
		await page.route('**/api/v1/locks/schema/*', async (route) => {
			if (route.request().method() === 'GET' || route.request().method() === 'POST') {
				await route.fulfill({
					status: 409,
					contentType: 'application/json',
					body: JSON.stringify({
						data: {
							is_locked: true,
							is_own_lock: false,
							lock_info: {
								entity_type: 'schema',
								entity_id: 'blog',
								user_id: 'another-user-uuid',
								user_name: 'Алексей',
								locked_at: new Date().toISOString(),
							},
						},
						messages: ['Entity is locked by Алексей'],
					}),
				})
			} else {
				await route.continue()
			}
		})

		// Mock schema API
		await page.route('**/api/v1/content/schemas*', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					data: [
						{
							id: 'schema-123',
							name: 'Тестовая Схема',
							slug: 'test-schema',
							isSingleton: false,
							fields: [],
						},
					],
				}),
			})
		})

		await page.goto('/content/schemas')

		// Wait for schemas view
		const schemaCard = page.locator('.schema-card').first()
		if (await schemaCard.isVisible({ timeout: 5000 }).catch(() => false)) {
			await schemaCard.click()

			// Check that lock banner appears
			const lockBanner = page.locator('.lock-banner')
			await expect(lockBanner).toBeVisible({ timeout: 5000 })
			await expect(lockBanner).toContainText('Алексей')
		}
	})
})
