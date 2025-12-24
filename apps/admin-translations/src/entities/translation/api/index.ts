import type { TranslationFilters, Translation, Pagination } from '../model'

export interface FetchTranslationsParams extends TranslationFilters {
	page: number
	pageSize: number
}

export const fetchTranslations = async (
	params: FetchTranslationsParams
): Promise<{ data: Translation[]; pagination: Pagination }> => {
	// мок-логика (замените на fetch)
	await new Promise((r) => setTimeout(r, 300))

	const mock: Translation[] = Array.from({ length: 45 }, (_, i) => ({
		id: `id-${i}`,
		key: `common.button.${i}`,
		value: `Кнопка ${i}`,
		namespace: ['common', 'auth', 'profile'][i % 3],
		language: ['ru', 'en'][i % 2],
	}))

	const filtered = mock.filter((t) => {
		const byNs = !params.namespace || t.namespace === params.namespace
		const byLang = !params.language || t.language === params.language
		const bySearch = !params.search || t.key.toLowerCase().includes(params.search.toLowerCase())

		return byNs && byLang && bySearch
	})

	const start = (params.page - 1) * params.pageSize
	const paginated = filtered.slice(start, start + params.pageSize)

	return {
		data: paginated,
		pagination: {
			page: params.page,
			pageSize: params.pageSize,
			total: filtered.length,
		},
	}
}

export const createTranslation = async (data: Omit<Translation, 'id'>): Promise<Translation> => {
	await new Promise((r) => setTimeout(r, 200))

	return { ...data, id: `new-${Date.now()}` }
}

export const updateTranslation = async (data: Translation): Promise<Translation> => {
	await new Promise((r) => setTimeout(r, 200))

	return data
}

export const deleteTranslation = async (id: string): Promise<void> => {
	console.log(id)

	await new Promise((r) => setTimeout(r, 200))
}
