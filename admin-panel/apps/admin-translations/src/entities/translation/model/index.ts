export interface Translation {
	id: string
	key: string
	value: string
	namespace: string
	locale: string
}

export interface TranslationFilters {
	namespace?: string
	locale?: string
	search?: string
}

export interface Pagination {
	page: number
	limit: number
	total: number
}

/** One content entry/field referencing this translation key (see content_translation_refs). */
export interface TranslationRef {
	contentEntryId: string
	entrySlug: string
	fieldPath: string
	schemaName: string
	schemaSlug: string
}

export const TRANSLATIONS_QUERY_KEY = 'translations'
