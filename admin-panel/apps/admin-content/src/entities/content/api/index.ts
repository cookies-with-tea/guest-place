import type { ContentEntry, ContentSchema } from '@admin-panel/lib'
import { createApi } from '@admin-panel/lib'

const { fetchData } = createApi('content')

export const getSchemas = () => fetchData<ContentSchema[]>('/schemas')

export const getSchemaByIdentifier = (slug: string, options?: any) =>
	fetchData<ContentSchema>(`/schemas/by-identifier/${slug}`, options)

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

// Сервер теперь пагинирует этот список (защита от неограниченного SELECT на
// растущих схемах, см. IMPROVEMENTS.md), но страница контента пока не имеет
// своего пейджера — поэтому запрашиваем максимально допустимый limit (100)
// и разворачиваем ответ в плоский массив, чтобы все текущие потребители
// (ContentPage.vue, UiRelationPicker.vue и т.д.) продолжали работать как
// раньше. Схема с &gt;100 записей потребует отдельного пейджера в UI.
export const getEntries = async (schemaId: string, params?: { search?: string; page?: number; limit?: number }) => {
	const query: Record<string, string | number> = { limit: params?.limit ?? 100 }

	if (params?.search) query.search = params.search
	if (params?.page) query.page = params.page

	const res = await fetchData<{ items: ContentEntry[]; pagination: unknown }>(`/schemas/${schemaId}/entries`, {
		params: query,
	})

	return { ...res, data: res.data?.items }
}

export const getEntry = (id: string) => fetchData<ContentEntry>(`/entries/${id}`)

export const createEntry = (payload: {
	schema_id: string
	slug: string
	data: Record<string, any>
	status?: string
	scheduled_at?: string
}) =>
	fetchData<ContentEntry>('/entries', {
		method: 'POST',
		body: payload,
	})

export const updateEntry = (
	id: string,
	payload: { data?: Record<string, any>; status?: string; scheduled_at?: string }
) =>
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
