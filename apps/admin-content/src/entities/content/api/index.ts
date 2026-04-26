import type { ContentEntry, ContentSchema } from '@admin-panel/lib'
import { createApi } from '@admin-panel/lib'

const { fetchData } = createApi('content')

export const getSchemas = () => fetchData<ContentSchema[]>('/schemas')

export const getSchemaByIdentifier = (slug: string) => fetchData<ContentSchema>(`/schemas/by-identifier/${slug}`)

export const createSchema = (data: any) =>
	fetchData<ContentSchema>('/schemas', {
		method: 'POST',
		body: data,
	})

export const updateSchema = (id: string, data: any) =>
	fetchData<ContentSchema>(`/schemas/${id}`, {
		method: 'PATCH',
		body: data,
	})

export const deleteSchema = (id: string) =>
	fetchData(`/schemas/${id}`, {
		method: 'DELETE',
	})

export const getEntries = (schemaId: string, params?: { search?: string }) => {
	let url = `/schemas/${schemaId}/entries`

	if (params?.search) {
		url += `?search=${encodeURIComponent(params.search)}`
	}

	return fetchData<ContentEntry[]>(url)
}

export const getEntry = (id: string) => fetchData<ContentEntry>(`/entries/${id}`)

export const createEntry = (payload: { schema_id: string; slug: string; data: Record<string, any>; status?: string }) =>
	fetchData<ContentEntry>('/entries', {
		method: 'POST',
		body: payload,
	})

export const updateEntry = (id: string, payload: { data?: Record<string, any>; status?: string }) =>
	fetchData<ContentEntry>(`/entries/${id}`, {
		method: 'PATCH',
		body: payload,
	})

export const deleteEntry = (id: string) =>
	fetchData(`/entries/${id}`, {
		method: 'DELETE',
	})

export const getEntryVersions = (id: string) => fetchData<any[]>(`/entries/${id}/versions`)

export const rollbackEntryVersion = (id: string, versionId: string) =>
	fetchData<ContentEntry>(`/entries/${id}/versions/${versionId}/rollback`, {
		method: 'POST',
	})

export const getLanguages = () => {
	const { fetchData: fetchI18n } = createApi('i18n')

	return fetchI18n<any[]>('/languages')
}

export const contentApi = {
	getSchemas,
	getSchemaByIdentifier,
	createSchema,
	updateSchema,
	deleteSchema,
	getEntries,
	getEntry,
	getLanguages,
	createEntry,
	updateEntry,
	deleteEntry,
	getEntryVersions,
	rollbackEntryVersion,
}
