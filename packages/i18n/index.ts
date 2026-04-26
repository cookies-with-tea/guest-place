import { type App, ref, watch } from 'vue'

import { ofetch } from 'ofetch'

import UiTranslation from './src/UiTranslation.vue'
import { parseTranslation } from './parser'

type TranslationDict = Record<string, string>
type Locale = string

export interface Language {
	code: string
	name: string
}

// Global reactive state
const currentLocale = ref<Locale>(localStorage.getItem('gp-locale') || 'en')
const availableLanguages = ref<Language[]>([])
const globalTranslations = ref<TranslationDict>({})

export function setLocale(locale: Locale) {
	currentLocale.value = locale

	localStorage.setItem('gp-locale', locale)
}

export function getLocale() {
	return currentLocale.value
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

function updateGlobalTranslations() {
	const dict = cache.get(currentLocale.value) || {}

	globalTranslations.value = { ...dict }
}

export async function loadTranslations(dictKey: string): Promise<TranslationDict> {
	const locale = currentLocale.value
	const cacheKey = `${locale}:${dictKey}`

	if (loading.has(cacheKey)) {
		await loading.get(cacheKey)

		return cache.get(locale) || {}
	}

	if (cache.has(locale)) {
		const dict = cache.get(locale)!
		const hasDict = Object.keys(dict).some((key) => key.startsWith(`${dictKey}.`))

		if (hasDict) {
			return dict
		}
	}

	const loadPromise = (async () => {
		try {
			const baseUrl = i18nConfig.apiBase || ''
			const data = await ofetch(`${baseUrl}/api/v1/i18n/${dictKey}`, {
				headers: { 'Accept-Language': locale },
				credentials: 'include',
			})

			const current = cache.get(locale) || {}
			const merged = { ...current, ...data }

			cache.set(locale, merged)

			if (locale === currentLocale.value) {
				updateGlobalTranslations()
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(`Failed to load i18n dict: ${dictKey}`, e)
		} finally {
			loading.delete(cacheKey)
		}
	})()

	loading.set(cacheKey, loadPromise)

	await loadPromise

	return cache.get(locale) || {}
}

export async function loadLanguages(): Promise<Language[]> {
	try {
		const baseUrl = i18nConfig.apiBase || ''
		const response = await ofetch(`${baseUrl}/api/v1/i18n/languages`)
		const languages = response.data || response

		availableLanguages.value = languages

		return languages
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('Failed to load available languages', e)

		const fallback = [
			{ code: 'en', name: 'English' },
			{ code: 'ru', name: 'Русский' },
		]

		availableLanguages.value = fallback

		return fallback
	}
}

export async function loadNamespaces(): Promise<string[]> {
	try {
		const baseUrl = i18nConfig.apiBase || ''
		const response = await ofetch(`${baseUrl}/api/v1/i18n/namespaces`)
		const namespaces = response.data || response

		return namespaces
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('Failed to load available namespaces', e)

		return ['common']
	}
}

export function t(key: string, locale: Locale = getLocale()): string {
	const dict = cache.get(locale)

	return dict?.[key] || key
}

export function getBrowserLocale(): string {
	if (typeof navigator !== 'undefined') {
		const lang = navigator.language.split('-')[0]

		return lang === 'ru' ? 'ru' : 'en'
	}

	return 'en'
}

export function clearI18nCache() {
	cache.clear()

	loading.clear()

	globalTranslations.value = {}
}

// Initial update
updateGlobalTranslations()

// Watch for locale changes globally
watch(currentLocale, () => {
	updateGlobalTranslations()
})

export const useI18n = () => {
	const loadDict = async (dictKey: string) => {
		await loadTranslations(dictKey)
	}

	const getRaw = (key: string) => {
		return globalTranslations.value[key] || key
	}

	const tt = (key: string, params: Record<string, any> = {}) => {
		let text = getRaw(key)

		Object.entries(params).forEach(([k, v]) => {
			text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
		})

		return text
	}

	const getNodes = (key: string) => {
		return parseTranslation(getRaw(key))
	}

	return {
		translations: globalTranslations,
		loadDict,
		t: tt,
		getNodes,
		getRaw,
		currentLocale,
		availableLanguages,
		setLocale,
		loadLanguages,
		loadNamespaces,
	}
}

export const useT = useI18n

/**
 * Global Vue Plugin for I18n
 */
export const i18nPlugin = {
	install(app: App) {
		app.component('T', UiTranslation)

		const { t: tt } = useI18n()

		app.config.globalProperties.$T = tt
	},
}

export { UiTranslation }
export * from './parser'
