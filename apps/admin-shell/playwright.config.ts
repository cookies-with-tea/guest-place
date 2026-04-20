import { baseConfig } from '@admin-panel/testing-utils'
import { defineConfig } from '@playwright/test'

export default defineConfig({
	...baseConfig,
	testDir: './e2e',
	use: {
		...baseConfig.use,
		baseURL: 'http://localhost:3000',
	},
	/* Run your local dev server before starting the tests */
	webServer: {
		command: 'pnpm dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
})
