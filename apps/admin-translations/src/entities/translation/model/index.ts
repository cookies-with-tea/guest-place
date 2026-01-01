export interface Translation {
	id: string
	key: string
	value: string
	namespace: string
	language: string
}

export interface TranslationFilters {
	namespace?: string
	language?: string
	search?: string
}

export interface Pagination {
	page: number
	limit: number
	total: number
}

export const TRANSLATIONS_QUERY_KEY = 'translations'
