import { baseConfig } from '@admin-panel/testing-utils'
import { defineConfig } from '@playwright/test'

export default defineConfig({
	...baseConfig,
	testDir: './e2e',
	testMatch: ['**/auth-mock.spec.ts', '**/entity-locking.spec.ts'],
	projects: [
		{
			name: 'chromium',
			use: {
				channel: 'chromium',
			},
		},
	],
	use: {
		...baseConfig.use,
		baseURL: 'http://localhost:4173',
	},
	/* Run your local dev server before starting the tests */
	webServer: {
		command: 'pnpm dev',
		url: 'http://localhost:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
})
