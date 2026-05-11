import { type App, ref, watch } from 'vue'

import { isBrowser } from '@admin-panel/lib'
import { ofetch } from 'ofetch'

import type { TranslationKey, TranslationNamespace, TranslationParams } from './src/types'
import UiTranslation from './src/UiTranslation.vue'
import { parseTranslation } from './parser'

type TranslationDict = Record<string, string>
type Locale = string

export interface Language {
	code: string
	name: string
}

export interface Namespace {
	id: string
	name: string
	description?: string
	isDynamic: boolean
	createdAt: string
	updatedAt: string
}

// Global reactive state
const getInitialLocale = (): Locale => {
	if (isBrowser && window.localStorage) {
		return localStorage.getItem('gp-locale') || 'en'
	}

	return 'en'
}

const currentLocale = ref<Locale>(getInitialLocale())
const availableLanguages = ref<Language[]>([])
const globalTranslations = ref<TranslationDict>({})

export function setLocale(locale: Locale) {
	currentLocale.value = locale

	updateGlobalTranslations()

	if (isBrowser && window.localStorage) {
		localStorage.setItem('gp-locale', locale)
	}
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
const loadedNamespaces = new Set<string>() // e.g., "en:common"

function updateGlobalTranslations() {
	const dict = cache.get(currentLocale.value) || {}

	globalTranslations.value = { ...dict }
}

export async function loadTranslations(dictKey: TranslationNamespace | string): Promise<TranslationDict> {
	const locale = currentLocale.value
	const cacheKey = `${locale}:${dictKey}`

	if (loading.has(cacheKey)) {
		await loading.get(cacheKey)

		return cache.get(locale) || {}
	}

	// If we already have any keys for this locale, we assume it's hydrated or loaded
	if (loadedNamespaces.has(cacheKey)) {
		if (isBrowser) {
			console.log(`[i18n] Skipping fetch for ${dictKey}, namespace "${cacheKey}" is already marked as loaded.`)
		}

		return cache.get(locale) || {}
	}

	if (isBrowser) {
		console.log(
			`[i18n] Fetching ${dictKey} for locale "${locale}". Cache exists: ${cache.has(locale)}, keys:`,
			Object.keys(cache.get(locale) || {}).length
		)
	}

	const loadPromise = (async () => {
		try {
			const baseUrl = i18nConfig.apiBase || ''
			const data = await ofetch(`${baseUrl}/api/v1/i18n/${dictKey}`, {
				headers: { 'Accept-Language': locale },
				credentials: 'include',
			})

			if (!isBrowser) {
				console.log(`[i18n Server] Loaded "${dictKey}" for "${locale}". Keys found:`, Object.keys(data || {}).length)
			}

			const current = cache.get(locale) || {}
			const merged = { ...current, ...data }

			cache.set(locale, merged)

			loadedNamespaces.add(cacheKey)

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
	if (availableLanguages.value.length > 0) {
		return availableLanguages.value
	}

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
		const data = response.data || response

		if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
			return data.map((ns: any) => ns.name)
		}

		return data
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('Failed to load available namespaces', e)

		return ['common']
	}
}

export async function fetchNamespacesFull(): Promise<Namespace[]> {
	try {
		const baseUrl = i18nConfig.apiBase || ''
		const response = await ofetch(`${baseUrl}/api/v1/i18n/namespaces`)
		const data = response.data || response

		if (Array.isArray(data)) {
			return data.map((ns: any) => ({
				id: ns.id,
				name: ns.name,
				description: ns.description,
				isDynamic: ns.is_dynamic,
				createdAt: ns.created_at,
				updatedAt: ns.updated_at,
			}))
		}

		return []
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('Failed to fetch full namespaces', e)

		return []
	}
}

export function t(key: TranslationKey | string, locale: Locale = getLocale()): string {
	const dict = cache.get(locale)

	return dict?.[key] || key
}

export function getBrowserLocale(): string {
	if (isBrowser && typeof navigator !== 'undefined') {
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

export function getState() {
	return {
		locale: currentLocale.value,
		languages: availableLanguages.value,
		cache: Array.from(cache.entries()),
		loadedNamespaces: Array.from(loadedNamespaces),
	}
}

export function hydrateState(state: any) {
	if (!state) return

	if (state.locale) currentLocale.value = state.locale

	if (state.languages) availableLanguages.value = state.languages

	if (state.cache) {
		state.cache.forEach(([locale, dict]: [Locale, TranslationDict]) => {
			cache.set(locale, dict)
		})
	}

	if (state.loadedNamespaces) {
		state.loadedNamespaces.forEach((ns: string) => {
			loadedNamespaces.add(ns)
		})
	}

	updateGlobalTranslations()
}

// Initial update
updateGlobalTranslations()

// Watch for locale changes globally
watch(currentLocale, () => {
	updateGlobalTranslations()
})

export const useI18n = () => {
	const getRaw = (key: string) => {
		return globalTranslations.value[key] || key
	}

	const tt = (key: TranslationKey | string, params: TranslationParams = {}) => {
		let text = getRaw(key)

		Object.entries(params).forEach(([k, v]) => {
			text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
		})

		return text
	}

	return {
		loadDict: async (dictKey: TranslationNamespace | string) => {
			await loadTranslations(dictKey)
		},
		t: tt,
		getNodes: (key: TranslationKey | string) => {
			return parseTranslation(getRaw(key))
		},
		getRaw: (key: TranslationKey | string) => {
			return globalTranslations.value[key] || key
		},
		currentLocale,
		availableLanguages,
		setLocale,
		loadLanguages,
		loadNamespaces,
		fetchNamespacesFull,
		getState,
		hydrateState,
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
