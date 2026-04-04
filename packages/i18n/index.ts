import { ref, computed } from 'vue'
import { ofetch } from 'ofetch'

type TranslationDict = Record<string, string>
type Locale = string

let currentLocale = 'en'

export function setLocale(locale: string) {
	currentLocale = locale
}

export function getLocale() {
	return currentLocale
}

export interface I18nConfig {
	apiBase?: string
}

let i18nConfig: I18nConfig = {}

export function initI18n(config: I18nConfig) {
	i18nConfig = config
}

const cache = new Map<Locale, TranslationDict>()
const loading = new Map<string, Promise<void>>()

export async function loadTranslations(dictKey: string): Promise<TranslationDict> {
	const cacheKey = `${currentLocale}:${dictKey}`

	if (loading.has(cacheKey)) {
		await loading.get(cacheKey)

		return cache.get(currentLocale) || {}
	}

	if (cache.has(currentLocale)) {
		const dict = cache.get(currentLocale)!
		const hasDict = Object.keys(dict).some((key) => key.startsWith(`${dictKey}.`))

		if (hasDict) {
			return dict
		}
	}

	const loadPromise = (async () => {
		try {
			const baseUrl = i18nConfig.apiBase || ''
			const data = await ofetch(`${baseUrl}/api/v1/i18n/${dictKey}`, {
				headers: { 'Accept-Language': currentLocale },
				credentials: 'include',
			})

			const current = cache.get(currentLocale) || {}

			cache.set(currentLocale, { ...current, ...data })
		} catch (e) {
			console.error(`Failed to load i18n dict: ${dictKey}`, e)
		} finally {
			loading.delete(cacheKey)
		}
	})()

	loading.set(cacheKey, loadPromise)

	await loadPromise

	return cache.get(currentLocale) || {}
}

export function t(key: string, locale: Locale = getBrowserLocale()): string {
	const dict = cache.get(locale)

	return dict?.[key] || key
}

export function getBrowserLocale(): string {
	if (typeof navigator !== 'undefined') {
		return navigator.language.split('-')[0]
	}

	return 'en'
}

export function clearI18nCache() {
	cache.clear()

	loading.clear()
}

export const useI18n = () => {
	const translations = ref<Record<string, string>>({})

	const loadDict = async (dictKey: string) => {
		const data = await loadTranslations(dictKey)

		translations.value = { ...translations.value, ...data }
	}

	const t = (key: string) => computed(() => translations.value[key] || key)

	return { translations, loadDict, t }
}
