// Resolves translation-key references written by the admin panel against the server's public
// i18n dictionary (GET /api/v1/i18n/{namespace}), the same `i18n_translations` table the admin
// translation editor manages. Covers three formats, oldest first:
// - `$t('namespace.key')` — the old ContentFormGenerator hack (removed from the admin UI, see
//   ROADMAP.md section 4.3 step 4), kept here so already-migrated/legacy content still resolves.
// - `{key:namespace.key}fallback{/key:namespace.key}` — UiRichTextField's "simple" mode (Text
//   fields): resolveContentText.
// - `<span class="gp-i18n-key" data-i18n-key="namespace.key">fallback</span>` — the same mark as
//   raw HTML inside a RichText field (UiRichTextField's "full" mode): resolveContentHtml.

export const DEFAULT_CONTENT_LOCALE = 'ru'

const dictCache: Record<string, Record<string, string>> = {}
const pendingLoads = new Map<string, Promise<void>>()

const cacheKey = (namespace: string, locale: string) => `${locale}:${namespace}`

function extractTranslationKeys(val: any, keys: Set<string>) {
	if (typeof val === 'string') {
		if (val.startsWith('$t(') && val.endsWith(')')) {
			keys.add(val.slice(3, -1).replace(/['"]/g, ''))
		}

		// `{key:namespace.key}fallback{/key:namespace.key}` — the tag format UiRichTextField's
		// "simple" mode (admin-panel/packages/ui) writes for Text fields (see resolveContentText).
		for (const m of val.matchAll(/\{key:([a-zA-Z0-9_.:-]+)\}/g)) {
			if (m[1]) keys.add(m[1])
		}

		// `data-i18n-key="namespace.key"` — the same mark, but as raw HTML inside a RichText
		// field (UiRichTextField's "full"/Tiptap mode never converts to the tag format above;
		// see server/src/content/translation_refs.rs for why). Handled by resolveContentHtml.
		for (const m of val.matchAll(/data-i18n-key="([a-zA-Z0-9_.:-]+)"/g)) {
			if (m[1]) keys.add(m[1])
		}
	} else if (Array.isArray(val)) {
		val.forEach((v) => extractTranslationKeys(v, keys))
	} else if (val && typeof val === 'object') {
		Object.values(val).forEach((v) => extractTranslationKeys(v, keys))
	}
}

function formatContentCurrency(amount: number, locale: string): string {
	try {
		return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : locale, {
			style: 'currency',
			currency: 'RUB',
			maximumFractionDigits: 2,
		}).format(amount)
	} catch {
		return String(amount)
	}
}

async function loadNamespace(namespace: string, locale: string, apiBase: string) {
	const key = cacheKey(namespace, locale)

	if (dictCache[key]) return
	if (pendingLoads.has(key)) return pendingLoads.get(key)

	const load = $fetch<Record<string, string>>(`${apiBase}/api/v1/i18n/${namespace}`, {
		headers: { 'Accept-Language': locale },
		responseType: 'json',
	})
		.then((map) => {
			dictCache[key] = map || {}
		})
		.catch(() => {
			dictCache[key] = {}
		})
		.finally(() => {
			pendingLoads.delete(key)
		})

	pendingLoads.set(key, load)

	return load
}

// Call before interpolating fetched CMS data, so translated values are already
// cached by the time the synchronous interpolate* helpers run.
export async function preloadContentTranslations(data: any, locale = DEFAULT_CONTENT_LOCALE, apiBase = '') {
	const keys = new Set<string>()

	extractTranslationKeys(data, keys)

	if (keys.size === 0) return

	const namespaces = new Set<string>()

	for (const key of keys) {
		const namespace = key.split('.')[0]

		if (namespace) namespaces.add(namespace)
	}

	await Promise.all([...namespaces].map((ns) => loadNamespace(ns, locale, apiBase)))
}

export function resolveContentTranslation(key: string, locale = DEFAULT_CONTENT_LOCALE): string {
	const namespace = key.split('.')[0] || ''
	const dict = dictCache[cacheKey(namespace, locale)]

	return dict?.[key] ?? key
}

function lookupOrFallback(key: string, fallback: string, locale: string): string {
	const namespace = key.split('.')[0] || ''
	const dict = dictCache[cacheKey(namespace, locale)]
	const resolved = dict?.[key]

	// Unlike resolveContentTranslation (used for the old $t() format, with no embedded
	// fallback text), a {key:...}fallback{/key:...} tag or data-i18n-key span always carries
	// its own fallback — prefer that over the bare key when the dictionary has nothing yet.
	return resolved !== undefined ? resolved : fallback
}

/**
 * Resolves a Text field's tag-format value (UiRichTextField "simple" mode) to plain text for
 * guests: `{key:...}fallback{/key:...}` to the translated value (or the fallback), `{currency:N}`
 * to a formatted price, `{nontranslatable}x{/nontranslatable}` to `x`, `{br}` to a space (this is
 * a plain-text result, not HTML — safe to use directly in text interpolation or `alt` attributes).
 * Call preloadContentTranslations first so the dictionary is already cached.
 */
export function resolveContentText(text: string, locale = DEFAULT_CONTENT_LOCALE): string {
	if (!text) return text

	return text
		.replace(/\{key:([a-zA-Z0-9_.:-]+)\}(.*?)\{\/key:\1\}/g, (_, key, fallback) => lookupOrFallback(key, fallback, locale))
		.replace(/\{nontranslatable\}(.*?)\{\/nontranslatable\}/g, '$1')
		.replace(/\{currency:([\d.]+)\}/g, (_, amount) => formatContentCurrency(parseFloat(amount), locale))
		.replace(/\{br\}/g, ' ')
}

/**
 * Resolves a RichText field's raw HTML value (UiRichTextField "full"/Tiptap mode) for guests:
 * replaces each TranslationKeyMark span with its translated value (or the fallback text it
 * already wraps), formats currency chips, and unwraps the non-translatable marker. Returns HTML
 * — use with `v-html`. Call preloadContentTranslations first so the dictionary is already cached.
 */
export function resolveContentHtml(html: string, locale = DEFAULT_CONTENT_LOCALE): string {
	if (!html) return html

	return html
		.replace(
			/<span[^>]*class="[^"]*gp-i18n-key[^"]*"[^>]*data-i18n-key="([^"]+)"[^>]*>(.*?)<\/span>/gi,
			(_, key, fallback) => lookupOrFallback(key, fallback, locale)
		)
		.replace(/<span[^>]*class="[^"]*gp-i18n-literal[^"]*"[^>]*>(.*?)<\/span>/gi, '$1')
		.replace(
			/<span[^>]*class="[^"]*gp-currency-chip[^"]*"[^>]*data-slot="currency:([\d.]+)"[^>]*>.*?<\/span>/gi,
			(_, amount) => formatContentCurrency(parseFloat(amount), locale)
		)
}

/**
 * Recursively resolves every tag-format Text value and RichText span in a plain data object —
 * for "hard" entities (Venues, Home, Menus: a fixed TS shape, not Schema-driven CMS content,
 * which already has its own recursive interpolateValue in useCmsPage.ts). Returns a new value;
 * does not mutate `data`. Call preloadContentTranslations on the same data first. Safe to apply
 * to every string unconditionally: resolveContentText's `{key:...}` tags and resolveContentHtml's
 * `data-i18n-key` spans never appear in the same field, so each resolver no-ops on the other's
 * input.
 */
export function resolveContentTree<T>(data: T, locale = DEFAULT_CONTENT_LOCALE): T {
	if (typeof data === 'string') {
		return resolveContentHtml(resolveContentText(data, locale), locale) as T
	}

	if (Array.isArray(data)) {
		return data.map((v) => resolveContentTree(v, locale)) as T
	}

	if (data && typeof data === 'object') {
		const result: Record<string, unknown> = {}

		for (const [k, v] of Object.entries(data)) {
			result[k] = resolveContentTree(v, locale)
		}

		return result as T
	}

	return data
}
