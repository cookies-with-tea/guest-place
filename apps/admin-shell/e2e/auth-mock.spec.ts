import { expect, test } from '@playwright/test'
import { setupMockAuth } from './helpers/auth'

test.describe('Mock Authentication & Real-Time Notification Bell', () => {
	test.beforeEach(async ({ page }) => {
		await setupMockAuth(page)
	})

	test('should authenticate via mock session and display user header', async ({ page }) => {
		await page.goto('/')

		// Verify header and user info are visible without redirecting to /login
		await expect(page).toHaveURL('/')
		const userProfile = page.locator('.user-profile')
		await expect(userProfile).toBeVisible()
		await expect(userProfile).toContainText('Иван')
	})

	test('should display real-time notification bell and toggle popover', async ({ page }) => {
		await page.goto('/')

		// Notification bell should be present in the main header
		const bellBtn = page.locator('.ui-notification-bell .bell-btn')
		await expect(bellBtn).toBeVisible()

		// SSE status indicator dot should be visible
		const connectionDot = page.locator('.connection-dot')
		await expect(connectionDot).toBeVisible()

		// Click bell to open notifications popover
		await bellBtn.click()

		// Verify notifications panel pops up
		const panelTitle = page.locator('.panel-title')
		await expect(panelTitle).toBeVisible()
		await expect(panelTitle).toHaveText('Уведомления')
	})
})
