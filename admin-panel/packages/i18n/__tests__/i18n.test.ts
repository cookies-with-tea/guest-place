import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock ofetch before importing i18n
vi.mock('ofetch', () => ({
	ofetch: vi.fn(async (url: string) => {
		if (url.includes('/api/v1/i18n/general')) {
			return {
				'general.avg_sum': 'Average check: {sum}',
				'general.internal_error': 'Internal server error',
				'general.db_error': 'Internal error',
			}
		}

		if (url.includes('/api/v1/i18n/shell')) {
			return {
				'shell.profile': 'Profile',
				'shell.logout': 'Logout',
				'shell.login': 'Login',
			}
		}

		return {}
	}),
}))

// We need to reset module internals between tests
let clearI18nCache: () => void
let loadTranslations: (dictKey: string) => Promise<any>
let t: (key: string, locale?: string) => string
let useI18n: () => any
let setLocale: (l: string) => void

beforeEach(async () => {
	vi.resetModules()

	// Re-import fresh module instance
	const mod = await import('../index')

	clearI18nCache = mod.clearI18nCache

	loadTranslations = mod.loadTranslations

	t = mod.t

	useI18n = mod.useI18n

	setLocale = mod.setLocale

	clearI18nCache()
})

describe('loadTranslations', () => {
	it('should load and cache translations from the API', async () => {
		await loadTranslations('general')

		expect(t('general.internal_error')).toBe('Internal server error')
	})

	it('should return cached results on second call without extra API calls', async () => {
		const { ofetch } = await import('ofetch')
		const callsBefore = (ofetch as any).mock.calls.length

		await loadTranslations('general')

		const callsAfterFirst = (ofetch as any).mock.calls.length

		await loadTranslations('general') // second call → cache hit

		const callsAfterSecond = (ofetch as any).mock.calls.length

		// first call should load, second call should NOT add another fetch
		expect(callsAfterFirst - callsBefore).toBe(1)

		expect(callsAfterSecond - callsAfterFirst).toBe(0)
	})

	it('should merge translations across multiple dict keys', async () => {
		await loadTranslations('general')

		await loadTranslations('shell')

		expect(t('general.db_error')).toBe('Internal error')

		expect(t('shell.login')).toBe('Login')
	})
})

describe('t (translate)', () => {
	it('should return the key if translation is missing', () => {
		expect(t('unknown.key')).toBe('unknown.key')
	})

	it('should return the translation after loading', async () => {
		await loadTranslations('general')

		expect(t('general.avg_sum')).toBe('Average check: {sum}')
	})
})

describe('useI18n composable', () => {
	it('should expose t, loadDict, currentLocale, setLocale', () => {
		const i18n = useI18n()

		expect(i18n).toHaveProperty('t')

		expect(i18n).toHaveProperty('loadDict')

		expect(i18n).toHaveProperty('currentLocale')

		expect(i18n).toHaveProperty('setLocale')

		expect(i18n).toHaveProperty('availableLanguages')
	})

	it('t() should interpolate params', async () => {
		await loadTranslations('general')

		const i18n = useI18n()
		const result = i18n.t('general.avg_sum', { sum: '10 USD' })

		expect(result).toBe('Average check: 10 USD')
	})

	it('setLocale should change currentLocale', () => {
		const i18n = useI18n()

		setLocale('ru')

		expect(i18n.currentLocale.value).toBe('ru')

		// Reset
		setLocale('en')
	})
})
