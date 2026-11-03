import { createApi, type IPaginationQuery, type IResponse, type IWithPagination } from '@admin-panel/lib'

import type { Translation, TranslationFilters, TranslationRef } from '../model'

export interface FetchTranslationsParams extends TranslationFilters, IPaginationQuery {}

const { fetchData } = createApi('i18n')

export const fetchTranslations = async (
	params: FetchTranslationsParams
): Promise<IResponse<IWithPagination<Translation>>> => {
	const processedParams: Record<string, any> = {}

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') return
		processedParams[key] = value
	})

	return fetchData<IWithPagination<Translation>>('', {
		method: 'GET',
		params: processedParams,
	})
}

export const createTranslation = async (
	data: Omit<Translation, 'id'> | Array<Omit<Translation, 'id'>>
): Promise<IResponse<Translation>> => {
	return fetchData<Translation>('', {
		method: 'POST',
		body: data as any,
	})
}

export const updateTranslation = async (data: Translation): Promise<IResponse<Translation>> => {
	return fetchData<Translation>('', {
		method: 'POST',
		body: data as any,
	})
}

export const deleteTranslation = async (id: string, locale?: string): Promise<IResponse<void>> => {
	return fetchData<void>(`/${id}/${locale || 'en'}`, {
		method: 'DELETE',
	})
}

export const fetchTranslationVersions = async (key: string, locale: string): Promise<IResponse<any[]>> => {
	return fetchData<any[]>(`/versions/${key}/${locale}`, {
		method: 'GET',
	})
}

export const rollbackTranslation = async (versionId: string): Promise<IResponse<void>> => {
	return fetchData<void>(`/versions/${versionId}/rollback`, {
		method: 'POST',
	})
}

/** Content entries/fields referencing this key (see content_translation_refs, server/src/content/translation_refs.rs). */
export const fetchTranslationRefs = async (key: string): Promise<IResponse<TranslationRef[]>> => {
	return fetchData<TranslationRef[]>(`/${key}/refs`, {
		method: 'GET',
	})
}
