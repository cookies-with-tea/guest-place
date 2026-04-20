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

export const getEntries = (schemaId: string) => fetchData<ContentEntry[]>(`/schemas/${schemaId}/entries`)

export const getEntry = (id: string) => fetchData<ContentEntry>(`/entries/${id}`)

export const createEntry = (payload: { schema_id: string; slug: string; data: Record<string, any> }) =>
	fetchData<ContentEntry>('/entries', {
		method: 'POST',
		body: payload,
	})

export const updateEntry = (id: string, data: Record<string, any>) =>
	fetchData<ContentEntry>(`/entries/${id}`, {
		method: 'PATCH',
		body: { data },
	})

export const deleteEntry = (id: string) =>
	fetchData(`/entries/${id}`, {
		method: 'DELETE',
	})

export const contentApi = {
	getSchemas,
	getSchemaByIdentifier,
	createSchema,
	updateSchema,
	deleteSchema,
	getEntries,
	getEntry,
	createEntry,
	updateEntry,
	deleteEntry,
}
