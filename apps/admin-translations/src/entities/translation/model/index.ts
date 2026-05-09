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

export const TRANSLATIONS_QUERY_KEY = 'translations'
